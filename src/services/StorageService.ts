import { SavedTab } from "../interfaces/TabInterface";
import { Session } from "../models/Session";
import { STORAGE_KEYS } from "../constants/storageKeys";

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

/**
 * Service for interacting with Chrome storage
 */
export class StorageService {
  /**
   * Get saved tabs from storage
   */
  static getSavedTabs(): Promise<SavedTab[]> {
    return new Promise((resolve) => {
      if (chrome?.storage) {
        chrome.storage.local.get([STORAGE_KEYS.SAVED_TABS], (result) => {
          resolve(result[STORAGE_KEYS.SAVED_TABS] || []);
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
        chrome.storage.local.set({ [STORAGE_KEYS.SAVED_TABS]: tabs }, () => {
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
   * Get sessions from storage
   */
  static async getSessions(): Promise<Session[]> {
    try {
      // Try to get sessions from the current key
      const result = await this.get(STORAGE_KEYS.SESSIONS);
      const sessions = result?.[STORAGE_KEYS.SESSIONS] || [];
      return sessions;
    } catch (error) {
      console.error("Error getting sessions:", error);
      return [];
    }
  }

  /**
   * Save a session to storage
   */
  static async saveSession(session: Session): Promise<void> {
    try {
      // Get current sessions
      const sessions = await this.getSessions();

      // Update if exists, otherwise add
      const sessionIndex = sessions.findIndex((s) => s.id === session.id);
      if (sessionIndex >= 0) {
        sessions[sessionIndex] = session;
      } else {
        sessions.push(session);
      }

      // Save back to storage
      await this.set({ [STORAGE_KEYS.SESSIONS]: sessions });
    } catch (error) {
      console.error("Error saving session:", error);
    }
  }

  /**
   * Delete a session from storage
   */
  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getSessions();
      const filteredSessions = sessions.filter(
        (session) => session.id !== sessionId
      );
      await this.set({ [STORAGE_KEYS.SESSIONS]: filteredSessions });
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  }

  /**
   * Get application settings
   */
  static getSettings<T>(defaultSettings: T): Promise<T> {
    return new Promise((resolve) => {
      if (chrome?.storage) {
        chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (result) => {
          resolve(result[STORAGE_KEYS.SETTINGS] || defaultSettings);
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
        chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get data from storage
   */
  static get(key: string): Promise<any> {
    return new Promise((resolve) => {
      if (chrome?.storage?.sync) {
        chrome.storage.sync.get(key, (result) => {
          // Check if result is null or empty
          if (!result || Object.keys(result).length === 0) {
            // Fall back to localStorage if Chrome storage result is empty
            console.log("[Storage Debug] Falling back to localStorage:");
            const localStorage = window.localStorage.getItem(key);
            const parsedData = localStorage ? JSON.parse(localStorage) : {};
            console.log(
              `[Storage Debug] LocalStorage result for key ${key}:`,
              parsedData
            );
            // Return data in the same format as Chrome storage would
            resolve({ [key]: parsedData });
          } else {
            console.log("data retrieved fine");
            resolve(result);
          }
        });
      } else {
        // Mock behavior for development
        const localStorage = window.localStorage.getItem(key);
        console.log("[Storage Debug] LocalStorage data:", localStorage?.length);
        const parsedData = localStorage ? JSON.parse(localStorage) : {};
        console.log(
          `[Storage Debug] LocalStorage result for key ${key}:`,
          parsedData
        );
        // Return data in the same format as Chrome storage would
        resolve({ [key]: parsedData });
      }
    });
  }

  /**
   * Set data in storage
   */
  static set(data: Record<string, any>): Promise<void> {
    return new Promise((resolve) => {
      if (chrome?.storage?.sync) {
        chrome.storage.sync.set(data, () => {
          resolve();
        });
      } else {
        // Mock behavior for development
        Object.entries(data).forEach(([key, value]) => {
          window.localStorage.setItem(key, JSON.stringify(value));
        });
        resolve();
      }
    });
  }
}
