import { SavedTab } from "../interfaces/TabInterface";
import { Session } from "../models/Session";

// Mock data for development outside of Chrome extension environment
const mockSavedTabs: SavedTab[] = [
  {
    id: 1,
    title: "Saved Google",
    url: "https://google.com",
    favIconUrl: "https://google.com/favicon.ico",
    savedAt: new Date().toISOString(),
    windowId: 1,
    index: 0,
  },
];

const mockSessions: Session[] = [
  {
    id: "session1",
    name: "Research Session",
    description: "Web research for project",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    lastModified: new Date().toISOString(),
    windows: [
      {
        id: 1,
        focused: true,
        tabs: [
          {
            id: 1,
            title: "Google",
            url: "https://google.com",
            favIconUrl: "https://google.com/favicon.ico",
            windowId: 1,
            index: 0,
          },
          {
            id: 2,
            title: "MDN Web Docs",
            url: "https://developer.mozilla.org",
            favIconUrl: "https://developer.mozilla.org/favicon.ico",
            windowId: 1,
            index: 1,
          },
        ],
      },
    ],
  },
];

/**
 * Service to interact with Chrome storage API
 */
export class StorageService {
  /**
   * Get saved tabs from storage
   */
  static getSavedTabs(): Promise<SavedTab[]> {
    return new Promise((resolve) => {
      if (chrome?.storage) {
        chrome.storage.local.get(["savedTabs"], (result) => {
          resolve(result.savedTabs || []);
        });
      } else {
        // Mock data for development
        resolve([...mockSavedTabs]);
      }
    });
  }

  /**
   * Save tabs to storage
   */
  static saveTabs(tabs: SavedTab[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (chrome?.storage) {
        chrome.storage.local.set({ savedTabs: tabs }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else {
        // Mock behavior for development
        console.log("Mock: Saving tabs", tabs);
        mockSavedTabs.push(...tabs);
        resolve();
      }
    });
  }

  /**
   * Get saved sessions from storage
   */
  static getSessions(): Promise<Session[]> {
    return new Promise((resolve) => {
      if (chrome?.storage) {
        chrome.storage.local.get(["sessions"], (result) => {
          resolve(result.sessions || []);
        });
      } else {
        // Mock data for development
        resolve([...mockSessions]);
      }
    });
  }

  /**
   * Save a session to storage
   */
  static saveSession(session: Session): Promise<void> {
    return new Promise((resolve, reject) => {
      if (chrome?.storage) {
        this.getSessions().then((sessions) => {
          const updatedSessions = [
            ...sessions.filter((s) => s.id !== session.id),
            session,
          ];
          chrome.storage.local.set({ sessions: updatedSessions }, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      } else {
        // Mock behavior for development
        console.log("Mock: Saving session", session);
        const existingIndex = mockSessions.findIndex(
          (s) => s.id === session.id
        );
        if (existingIndex >= 0) {
          mockSessions[existingIndex] = session;
        } else {
          mockSessions.push(session);
        }
        resolve();
      }
    });
  }

  /**
   * Delete a session from storage
   */
  static deleteSession(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (chrome?.storage) {
        this.getSessions().then((sessions) => {
          const updatedSessions = sessions.filter((s) => s.id !== sessionId);
          chrome.storage.local.set({ sessions: updatedSessions }, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      } else {
        // Mock behavior for development
        console.log(`Mock: Deleting session ${sessionId}`);
        const index = mockSessions.findIndex((s) => s.id === sessionId);
        if (index >= 0) {
          mockSessions.splice(index, 1);
        }
        resolve();
      }
    });
  }

  /**
   * Get application settings
   */
  static getSettings<T>(defaultSettings: T): Promise<T> {
    return new Promise((resolve) => {
      if (chrome?.storage) {
        chrome.storage.local.get(["settings"], (result) => {
          resolve(result.settings || defaultSettings);
        });
      } else {
        // Mock behavior for development
        resolve(defaultSettings);
      }
    });
  }

  /**
   * Save application settings
   */
  static saveSettings<T>(settings: T): Promise<void> {
    return new Promise((resolve, reject) => {
      if (chrome?.storage) {
        chrome.storage.local.set({ settings }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else {
        // Mock behavior for development
        console.log("Mock: Saving settings", settings);
        resolve();
      }
    });
  }
}
