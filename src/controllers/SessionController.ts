import { v4 as uuidv4 } from "uuid";
import { Session, SessionSummary } from "../models/Session";
import { StorageService } from "../services/StorageService";
import { ChromeService } from "../services/ChromeService";
import { Tab, WindowInfo } from "../interfaces/TabInterface";

// Legacy format that used windows array
interface LegacyWindowsSession {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastModified: string;
  windows: WindowInfo[];
}

// Type for handling both formats
type SessionFormat = Session | LegacyWindowsSession;

/**
 * Controller for session-related operations
 */
export class SessionController {
  /**
   * Save the current browser state as a session
   */
  static async saveCurrentSession(
    name: string,
    description?: string
  ): Promise<Session> {
    const tabs = await ChromeService.getTabs();

    const session: Session = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      tabs,
    };

    await StorageService.saveSession(session);
    return session;
  }

  /**
   * Get all saved sessions
   */
  static async getSessions(): Promise<Session[]> {
    const sessions = await StorageService.getSessions();
    
    // Transform any sessions in the windows format to tabs format
    return sessions.map(session => this.normalizeSessionFormat(session));
  }

  /**
   * Normalize session format to ensure all sessions use tabs array
   */
  private static normalizeSessionFormat(session: SessionFormat): Session {
    // If session already has tabs array, it's in the right format
    if ('tabs' in session) {
      return session;
    }

    // If session has windows array, flatten it to tabs
    if ('windows' in session && Array.isArray(session.windows)) {
      return {
        id: session.id,
        name: session.name,
        description: session.description,
        createdAt: session.createdAt,
        lastModified: session.lastModified,
        tabs: session.windows.reduce((allTabs: Tab[], window: WindowInfo) => {
          if (Array.isArray(window.tabs)) {
            allTabs.push(...window.tabs);
          }
          return allTabs;
        }, []),
      };
    }

    // If neither format is present, return empty tabs array
    return {
      ...session,
      tabs: [],
    };
  }

  /**
   * Get session summaries (lighter-weight representation for lists)
   */
  static async getSessionSummaries(): Promise<SessionSummary[]> {
    const sessions = await this.getSessions();
    return sessions.map((session) => ({
      id: session.id,
      name: session.name,
      description: session.description,
      createdAt: session.createdAt,
      lastModified: session.lastModified,
      tabCount: Array.isArray(session.tabs) ? session.tabs.length : 0,
    }));
  }

  /**
   * Get a specific session by ID
   */
  static async getSession(sessionId: string): Promise<Session | undefined> {
    const sessions = await StorageService.getSessions();
    const session = sessions.find((session) => session.id === sessionId);
    
    if (session) {
      return this.normalizeSessionFormat(session);
    }
    
    return undefined;
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    await StorageService.deleteSession(sessionId);
  }

  /**
   * Restore a saved session
   */
  static async restoreSession(
    sessionId: string,
    replaceCurrentSession: boolean = false
  ): Promise<void> {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    // Ensure session.tabs is an array
    if (!Array.isArray(session.tabs)) {
      console.error("Session tabs is not an array:", session);
      return;
    }

    if (replaceCurrentSession && chrome?.windows) {
      // Close all current windows if replacing
      const currentWindows = await ChromeService.getWindows();
      for (const window of currentWindows) {
        await new Promise<void>((resolve) => {
          chrome.windows.remove(window.id, () => resolve());
        });
      }
    }

    // Skip if no tabs to restore
    if (session.tabs.length === 0) {
      console.warn("No tabs to restore in session");
      return;
    }

    if (chrome?.windows) {
      const firstTab = session.tabs[0];
      // Create a new window with the first tab
      const createdWindow = await new Promise<chrome.windows.Window | undefined>((resolve) => {
        chrome.windows.create(
          { url: firstTab.url || "about:blank" },
          (createdWindow) => resolve(createdWindow)
        );
      });
      
      // Store the ID of the newly created window
      const newWindowId = createdWindow?.id;
      
      if (!newWindowId) {
        console.error("Failed to create new window or get window ID");
        return;
      }
      
      // Add the rest of the tabs to the new window
      for (let i = 1; i < session.tabs.length; i++) {
        const tab = session.tabs[i];
        if (tab.url) {
          await ChromeService.createTab(tab.url, newWindowId);
        }
      }
    } else {
      // Mock behavior for development
      console.log(`Mock: Restoring session with ${session.tabs.length} tabs`);
      for (const tab of session.tabs) {
        console.log(`Mock: Opening tab ${tab.url || "about:blank"}`);
      }
    }

    // Update lastModified timestamp
    session.lastModified = new Date().toISOString();
    await StorageService.saveSession(session);
  }

  /**
   * Search sessions by query
   */
  static async searchSessions(query: string): Promise<Session[]> {
    if (!query) return await this.getSessions();

    const sessions = await this.getSessions();
    const lowerQuery = query.toLowerCase();

    return sessions.filter(
      (session) =>
        session.name.toLowerCase().includes(lowerQuery) ||
        (session.description &&
          session.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Update an existing session
   */
  static async updateSession(updatedSession: Session): Promise<void> {
    const sessions = await this.getSessions();
    const sessionExists = sessions.some((s) => s.id === updatedSession.id);

    if (!sessionExists) {
      throw new Error(`Session with ID ${updatedSession.id} not found`);
    }

    updatedSession.lastModified = new Date().toISOString();
    await StorageService.saveSession(updatedSession);
  }
}
