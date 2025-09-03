import { StorageFactory } from "../../../services/StorageFactory";
import { Session } from "../../../models/Session";
import { Tab } from "../../../interfaces/TabInterface";

export interface SessionTabAnalytics {
  url: string;
  title: string;
  visitCount: number;
  lastAccess: Date | null;
  sessionNames: string[];
}

export class SessionAnalyticsService {
  private static instance: SessionAnalyticsService;

  private constructor() {}

  static getInstance(): SessionAnalyticsService {
    if (!SessionAnalyticsService.instance) {
      SessionAnalyticsService.instance = new SessionAnalyticsService();
    }
    return SessionAnalyticsService.instance;
  }

  private getStorageService() {
    return StorageFactory.getStorageService();
  }

  // Get all session tabs with their usage analytics
  async getSessionTabAnalytics(): Promise<SessionTabAnalytics[]> {
    try {
      const sessions = await this.getStorageService().fetchSessions();
      const urlMap = new Map<string, SessionTabAnalytics>();

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
                  url: tab.url,
                  title: tab.title || "Untitled",
                  visitCount: usage.visitCount,
                  lastAccess: usage.lastAccess
                    ? new Date(usage.lastAccess)
                    : null,
                  sessionNames: [session.name],
                });
              }
            }
          });
        }
      });

      return Array.from(urlMap.values()).sort(
        (a, b) => b.visitCount - a.visitCount
      );
    } catch (error) {
      console.error("Error getting session tab analytics:", error);
      return [];
    }
  }

  // Get most visited session tabs
  async getMostVisitedSessionTabs(
    limit: number = 10
  ): Promise<SessionTabAnalytics[]> {
    const analytics = await this.getSessionTabAnalytics();
    return analytics.filter((tab) => tab.visitCount > 0).slice(0, limit);
  }

  // Get recently accessed session tabs
  async getRecentSessionTabs(
    limit: number = 10
  ): Promise<SessionTabAnalytics[]> {
    const analytics = await this.getSessionTabAnalytics();
    return analytics
      .filter((tab) => tab.lastAccess)
      .sort((a, b) => {
        const aTime = a.lastAccess?.getTime() || 0;
        const bTime = b.lastAccess?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, limit);
  }

  // Get session tabs by visit count threshold
  async getHighTrafficSessionTabs(
    minVisits: number = 5
  ): Promise<SessionTabAnalytics[]> {
    const analytics = await this.getSessionTabAnalytics();
    return analytics.filter((tab) => tab.visitCount >= minVisits);
  }

  // Track a visit to a session tab (called from background script)
  async trackSessionTabVisit(url: string): Promise<void> {
    try {
      const sessions = await this.getStorageService().fetchSessions();
      let updated = false;

      sessions.forEach((session: Session) => {
        if (session.tabs && Array.isArray(session.tabs)) {
          session.tabs.forEach((tab: Tab) => {
            if (tab.url === url) {
              tab.usage = tab.usage || { visitCount: 0, lastAccess: null };
              tab.usage.visitCount++;
              tab.usage.lastAccess = new Date();
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
      }
    } catch (error) {
      console.error("Error tracking session tab visit:", error);
    }
  }

  // Get analytics for tabs in a specific session
  async getSessionSpecificAnalytics(
    sessionId: string
  ): Promise<SessionTabAnalytics[]> {
    try {
      const session = await this.getStorageService().fetchSessionById(
        sessionId
      );
      if (!session || !session.tabs) {
        return [];
      }

      return session.tabs
        .filter((tab) => tab.url)
        .map((tab) => {
          const usage = tab.usage || { visitCount: 0, lastAccess: null };
          return {
            url: tab.url!,
            title: tab.title || "Untitled",
            visitCount: usage.visitCount,
            lastAccess: usage.lastAccess ? new Date(usage.lastAccess) : null,
            sessionNames: [session.name],
          };
        })
        .sort((a, b) => b.visitCount - a.visitCount);
    } catch (error) {
      console.error("Error getting session-specific analytics:", error);
      return [];
    }
  }

  // Get tabs that appear in multiple sessions (cross-session tabs)
  async getCrossSessionTabs(): Promise<SessionTabAnalytics[]> {
    const analytics = await this.getSessionTabAnalytics();
    return analytics.filter((tab) => tab.sessionNames.length > 1);
  }
}
