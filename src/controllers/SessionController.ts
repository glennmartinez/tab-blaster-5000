import { v4 as uuidv4 } from "uuid";
import { Session, SessionSummary } from "../models/Session";
import { StorageService } from "../services/StorageService";
import { ChromeService } from "../services/ChromeService";
import { Tab } from "../interfaces/TabInterface";

/**
 * Defines the format used in ExtensionPopup for backward compatibility
 */
interface ExtensionPopupSession {
  id: string;
  name: string;
  createdAt: string;
  tabs: Tab[];
}

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
    const windows = await ChromeService.getWindows();

    const session: Session = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      windows,
    };

    await StorageService.saveSession(session);
    return session;
  }

  /**
   * Get all saved sessions
   */
  static async getSessions(): Promise<Session[]> {
    const sessions = await StorageService.getSessions();

    // Transform any sessions in the old format (ExtensionPopup format) to the new format
    return sessions.map((session) => this.normalizeSessionFormat(session));
  }

  /**
   * Normalize session format to ensure compatibility with both direct tabs and windows structure
   */
  private static normalizeSessionFormat(
    session: Session | ExtensionPopupSession
  ): Session {
    // Check if this is in the old format (tabs directly in the session)
    if ("tabs" in session && !("windows" in session)) {
      const oldFormatSession = session as unknown as ExtensionPopupSession;

      // Convert to new format by adding tabs to a single window
      return {
        id: oldFormatSession.id,
        name: oldFormatSession.name,
        createdAt: oldFormatSession.createdAt,
        lastModified: oldFormatSession.createdAt, // Use createdAt as lastModified since it doesn't exist in old format
        windows: [
          {
            id: 1, // Default window ID
            focused: true,
            tabs: oldFormatSession.tabs,
          },
        ],
      };
    }

    // Already in the correct format or missing tabs array
    const normalizedSession = session as Session;

    // Ensure windows is always an array
    if (!Array.isArray(normalizedSession.windows)) {
      normalizedSession.windows = [];
    }

    return normalizedSession;
  }

  /**
   * Get session summaries (lighter-weight representation for lists)
   */
  static async getSessionSummaries(): Promise<SessionSummary[]> {
    const sessions = await this.getSessions();
    return sessions.map((session) => {
      // Add safety checks for windows property
      const windows = Array.isArray(session.windows) ? session.windows : [];
      return {
        id: session.id,
        name: session.name,
        description: session.description,
        createdAt: session.createdAt,
        lastModified: session.lastModified,
        windowCount: windows.length,
        tabCount: windows.reduce(
          (count, window) =>
            count + (Array.isArray(window.tabs) ? window.tabs.length : 0),
          0
        ),
      };
    });
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
   * Can either replace the current session or open in new windows
   */
  static async restoreSession(
    sessionId: string,
    replaceCurrentSession: boolean = false
  ): Promise<void> {
    const session = await this.getSession(sessionId);

    if (!session) {
      throw new Error(`Session with ID ${sessionId} not found`);
    }

    // Ensure session.windows is an array
    if (!Array.isArray(session.windows)) {
      console.error("Session windows is not an array:", session);
      session.windows = []; // Provide a default empty array
      return; // Exit early as there are no windows to restore
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

    // Restore each window with its tabs
    for (const window of session.windows) {
      // Skip if window.tabs is not an array or empty
      if (!Array.isArray(window.tabs) || window.tabs.length === 0) {
        console.warn("Window has no valid tabs array:", window);
        continue;
      }

      if (chrome?.windows) {
        const firstTab = window.tabs[0];
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
          continue; // Skip if we couldn't get the window ID
        }
        
        console.log(`Created new window with ID ${newWindowId} for session restoration`);
        
        // Add the rest of the tabs to the new window
        for (let i = 1; i < window.tabs.length; i++) {
          const tab = window.tabs[i];
          if (tab.url) {
            await ChromeService.createTab(tab.url, newWindowId);
          } else {
            await ChromeService.createTab("about:blank", newWindowId);
          }
        }
      } else {
        // Mock behavior for development
        console.log(`Mock: Restoring window with ${window.tabs.length} tabs`);
        for (const tab of window.tabs) {
          console.log(`Mock: Opening tab ${tab.url || "about:blank"}`);
        }
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
