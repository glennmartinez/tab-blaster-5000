import { SessionInterface } from "./SessionInterface";
import { Session } from "../models/Session";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { SavedTab } from "../interfaces/TabInterface";

export class ChromeStorageService implements SessionInterface {
  /**
   * Fetch all sessions from Chrome storage
   */
  async fetchSessions(): Promise<Session[]> {
    return new Promise((resolve) => {
      if (chrome?.storage) {
        chrome.storage.local.get([STORAGE_KEYS.SESSIONS], (result) => {
          const sessions = result[STORAGE_KEYS.SESSIONS] || [];
          resolve(sessions);
        });
      } else {
        console.warn("Chrome storage API not available");
        resolve([]);
      }
    });
  }

  /**
   * Store a session in Chrome storage
   */
  async storeSession(session: Session): Promise<void> {
    if (!chrome?.storage) {
      console.warn("Chrome storage API not available");
      throw new Error("Chrome storage API not available");
    }

    return new Promise((resolve, reject) => {
      try {
        // Get current sessions
        this.fetchSessions().then((sessions) => {
          // Check if session already exists
          const index = sessions.findIndex((s) => s.id === session.id);

          if (index >= 0) {
            // Update existing session
            sessions[index] = session;
          } else {
            // Add new session
            sessions.unshift(session);
          }

          // Save to chrome.storage
          chrome.storage.local.set(
            { [STORAGE_KEYS.SESSIONS]: sessions },
            () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve();
              }
            }
          );
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Delete a session from Chrome storage by ID
   */
  async deleteSession(sessionId: string): Promise<void> {
    if (!chrome?.storage) {
      console.warn("Chrome storage API not available");
      throw new Error("Chrome storage API not available");
    }

    return new Promise((resolve, reject) => {
      try {
        this.fetchSessions().then((sessions) => {
          const updatedSessions = sessions.filter(
            (session) => session.id !== sessionId
          );

          chrome.storage.local.set(
            { [STORAGE_KEYS.SESSIONS]: updatedSessions },
            () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve();
              }
            }
          );
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Fetch a specific session by ID from Chrome storage
   */
  async fetchSessionById(sessionId: string): Promise<Session | null> {
    try {
      const sessions = await this.fetchSessions();
      const session = sessions.find((session) => session.id === sessionId);
      return session || null;
    } catch (error) {
      console.error("Error fetching session by ID from Chrome storage:", error);
      return null;
    }
  }

  /**
   * Get saved tabs from storage
   */
  async getSavedTabs(): Promise<SavedTab[]> {
    return new Promise((resolve) => {
      if (chrome?.storage) {
        chrome.storage.local.get([STORAGE_KEYS.SAVED_TABS], (result) => {
          const tabs = result[STORAGE_KEYS.SAVED_TABS] || [];
          resolve(tabs);
        });
      } else {
        console.warn("Chrome storage API not available");
        resolve([]);
      }
    });
  }

  /**
   * Save tabs to storage
   */
  async saveTabs(tabs: SavedTab[]): Promise<void> {
    if (!chrome?.storage) {
      console.warn("Chrome storage API not available");
      throw new Error("Chrome storage API not available");
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEYS.SAVED_TABS]: tabs }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get application settings
   */
  async getSettings<T>(defaultSettings: T): Promise<T> {
    return new Promise((resolve) => {
      if (chrome?.storage) {
        chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (result) => {
          const settings = result[STORAGE_KEYS.SETTINGS] || defaultSettings;
          resolve(settings);
        });
      } else {
        console.warn("Chrome storage API not available");
        resolve(defaultSettings);
      }
    });
  }

  /**
   * Save application settings
   */
  async saveSettings<T>(settings: T): Promise<void> {
    if (!chrome?.storage) {
      console.warn("Chrome storage API not available");
      throw new Error("Chrome storage API not available");
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Get data from storage
   */
  async get(key: string): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      if (chrome?.storage) {
        chrome.storage.local.get([key], (result) => {
          resolve(result);
        });
      } else {
        console.warn("Chrome storage API not available");
        resolve({ [key]: null });
      }
    });
  }

  /**
   * Set data in storage
   */
  async set(data: Record<string, unknown>): Promise<void> {
    if (!chrome?.storage) {
      console.warn("Chrome storage API not available");
      throw new Error("Chrome storage API not available");
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Remove data from storage
   */
  async remove(keys: string[]): Promise<void> {
    if (!chrome?.storage) {
      console.warn("Chrome storage API not available");
      throw new Error("Chrome storage API not available");
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.remove(keys, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
}
