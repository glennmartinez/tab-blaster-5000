import { StorageFactory } from "../factories/StorageFactory";
import { Session } from "../../models/Session";
import { Tab } from "../../interfaces/TabInterface";
import { SessionAnalyticsRepository, SessionTabAnalytics, SessionAnalyticsData } from "../repositories/SessionAnalyticsRepository";

export class NewSessionAnalyticsService {
  private repository: SessionAnalyticsRepository;

  constructor() {
    this.repository = new SessionAnalyticsRepository();
  }

  /**
   * Get storage service for session data access
   */
  private getStorageService() {
    return StorageFactory.getStorageService();
  }

  /**
   * Convert repository data to the expected interface
   */
  private convertToSessionTabAnalytics(analyticsData: SessionAnalyticsData[]): SessionTabAnalytics[] {
    return analyticsData.map(data => ({
      url: data.url,
      title: data.title,
      visitCount: data.visitCount,
      lastAccess: data.lastAccess,
      sessionNames: data.sessionNames,
    }));
  }

  /**
   * Rebuild analytics from all session data
   * This should be called periodically to sync with session changes
   */
  async rebuildAnalyticsFromSessions(): Promise<void> {
    try {
      console.log("🔄 Rebuilding session analytics from session data...");
      
      const sessions = await this.getStorageService().fetchSessions();
      const urlMap = new Map<string, {
        title: string;
        visitCount: number;
        lastAccess: Date | null;
        sessionNames: string[];
      }>();

      // Process all sessions and their tabs
      sessions.forEach((session: Session) => {
        if (session.tabs && Array.isArray(session.tabs)) {
          session.tabs.forEach((tab: Tab) => {
            if (tab.url) {
              const existing = urlMap.get(tab.url);
              const usage = tab.usage || { visitCount: 0, lastAccess: null };

              if (existing) {
                // Combine data from multiple sessions
                existing.visitCount += usage.visitCount;
                existing.sessionNames.push(session.name);

                // Keep the most recent access time
                if (usage.lastAccess) {
                  const newLastAccess = new Date(usage.lastAccess);
                  if (
                    !existing.lastAccess ||
                    newLastAccess > existing.lastAccess
                  ) {
                    existing.lastAccess = newLastAccess;
                  }
                }
              } else {
                // Create new entry
                urlMap.set(tab.url, {
                  title: tab.title || "Untitled",
                  visitCount: usage.visitCount,
                  lastAccess: usage.lastAccess ? new Date(usage.lastAccess) : null,
                  sessionNames: [session.name],
                });
              }
            }
          });
        }
      });

      // Clear existing analytics and rebuild
      // Note: This is a simplified approach. In production, you might want to do incremental updates
      const existingResult = await this.repository.findAll();
      if (existingResult.success && existingResult.data) {
        // Clear existing data
        for (const item of existingResult.data) {
          await this.repository.delete(item.id);
        }
      }

      // Create new analytics entries
      for (const [url, data] of urlMap.entries()) {
        await this.repository.upsertAnalytics(
          url,
          data.title,
          data.sessionNames[0], // Primary session (we'll update with all sessions)
          data.visitCount,
          data.lastAccess
        );

        // Update with all session names
        const analyticsResult = await this.repository.findByUrl(url);
        if (analyticsResult.success && analyticsResult.data) {
          await this.repository.update(analyticsResult.data.id, {
            sessionNames: data.sessionNames,
          });
        }
      }

      console.log(`✅ Analytics rebuilt for ${urlMap.size} unique URLs`);
    } catch (error) {
      console.error("Error rebuilding analytics from sessions:", error);
      throw error;
    }
  }

  /**
   * Get all session tabs with their usage analytics
   */
  async getSessionTabAnalytics(): Promise<SessionTabAnalytics[]> {
    try {
      // First, try to get from repository
      const result = await this.repository.findAll();
      if (result.success && result.data && result.data.length > 0) {
        return this.convertToSessionTabAnalytics(result.data).sort(
          (a, b) => b.visitCount - a.visitCount
        );
      }

      // If no data in repository, rebuild from sessions
      console.log("No analytics data found, rebuilding from sessions...");
      await this.rebuildAnalyticsFromSessions();
      
      // Try again after rebuild
      const rebuiltResult = await this.repository.findAll();
      if (rebuiltResult.success && rebuiltResult.data) {
        return this.convertToSessionTabAnalytics(rebuiltResult.data).sort(
          (a, b) => b.visitCount - a.visitCount
        );
      }

      return [];
    } catch (error) {
      console.error("Error getting session tab analytics:", error);
      return [];
    }
  }

  /**
   * Get most visited session tabs
   */
  async getMostVisitedSessionTabs(limit: number = 10): Promise<SessionTabAnalytics[]> {
    try {
      const result = await this.repository.getMostVisited(limit);
      if (result.success && result.data) {
        return this.convertToSessionTabAnalytics(result.data);
      } else {
        console.error("Failed to get most visited tabs:", result.error);
        return [];
      }
    } catch (error) {
      console.error("Error getting most visited session tabs:", error);
      return [];
    }
  }

  /**
   * Get recently accessed session tabs
   */
  async getRecentSessionTabs(limit: number = 10): Promise<SessionTabAnalytics[]> {
    try {
      const result = await this.repository.getRecentlyAccessed(limit);
      if (result.success && result.data) {
        return this.convertToSessionTabAnalytics(result.data);
      } else {
        console.error("Failed to get recent tabs:", result.error);
        return [];
      }
    } catch (error) {
      console.error("Error getting recent session tabs:", error);
      return [];
    }
  }

  /**
   * Get session tabs by visit count threshold
   */
  async getHighTrafficSessionTabs(minVisits: number = 5): Promise<SessionTabAnalytics[]> {
    try {
      const analytics = await this.getSessionTabAnalytics();
      return analytics.filter((tab) => tab.visitCount >= minVisits);
    } catch (error) {
      console.error("Error getting high traffic session tabs:", error);
      return [];
    }
  }

  /**
   * Track a visit to a session tab (called from background script)
   */
  async trackSessionTabVisit(url: string): Promise<void> {
    try {
      // Update session data first (maintain backward compatibility)
      const sessions = await this.getStorageService().fetchSessions();
      let updated = false;
      let tabTitle = "Untitled";

      sessions.forEach((session: Session) => {
        if (session.tabs && Array.isArray(session.tabs)) {
          session.tabs.forEach((tab: Tab) => {
            if (tab.url === url) {
              tab.usage = tab.usage || { visitCount: 0, lastAccess: null };
              tab.usage.visitCount++;
              tab.usage.lastAccess = new Date();
              tabTitle = tab.title || "Untitled";
              updated = true;
            }
          });
        }
      });

      if (updated) {
        // Save all sessions back
        for (const session of sessions) {
          await this.getStorageService().storeSession(session);
        }

        // Update analytics repository
        await this.repository.upsertAnalytics(
          url,
          tabTitle,
          "visit_tracking", // Special session name for direct visits
          1,
          new Date()
        );
      }
    } catch (error) {
      console.error("Error tracking session tab visit:", error);
    }
  }

  /**
   * Get analytics for tabs in a specific session
   */
  async getSessionSpecificAnalytics(sessionId: string): Promise<SessionTabAnalytics[]> {
    try {
      const session = await this.getStorageService().fetchSessionById(sessionId);
      if (!session || !session.tabs) {
        return [];
      }

      return session.tabs
        .filter((tab: Tab) => tab.url)
        .map((tab: Tab) => {
          const usage = tab.usage || { visitCount: 0, lastAccess: null };
          return {
            url: tab.url!,
            title: tab.title || "Untitled",
            visitCount: usage.visitCount,
            lastAccess: usage.lastAccess ? new Date(usage.lastAccess) : null,
            sessionNames: [session.name],
          };
        })
        .sort((a: SessionTabAnalytics, b: SessionTabAnalytics) => b.visitCount - a.visitCount);
    } catch (error) {
      console.error("Error getting session-specific analytics:", error);
      return [];
    }
  }

  /**
   * Get tabs that appear in multiple sessions (cross-session tabs)
   */
  async getCrossSessionTabs(): Promise<SessionTabAnalytics[]> {
    try {
      const analytics = await this.getSessionTabAnalytics();
      return analytics.filter((tab) => tab.sessionNames.length > 1);
    } catch (error) {
      console.error("Error getting cross-session tabs:", error);
      return [];
    }
  }

  /**
   * Update analytics for a specific URL and session
   */
  async updateAnalytics(
    url: string,
    title: string,
    sessionName: string,
    visitCount: number = 1,
    lastAccess: Date | null = null
  ): Promise<void> {
    try {
      await this.repository.upsertAnalytics(url, title, sessionName, visitCount, lastAccess);
    } catch (error) {
      console.error("Error updating analytics:", error);
      throw error;
    }
  }

  /**
   * Get analytics for a specific URL
   */
  async getAnalyticsForUrl(url: string): Promise<SessionTabAnalytics | null> {
    try {
      const result = await this.repository.findByUrl(url);
      if (result.success && result.data) {
        return {
          url: result.data.url,
          title: result.data.title,
          visitCount: result.data.visitCount,
          lastAccess: result.data.lastAccess,
          sessionNames: result.data.sessionNames,
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting analytics for URL:", error);
      return null;
    }
  }
}

// Export singleton instance
export const newSessionAnalyticsService = new NewSessionAnalyticsService();
