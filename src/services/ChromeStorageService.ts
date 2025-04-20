import { SessionInterface } from "./SessionInterface";
import { Session } from "../models/Session";
import { STORAGE_KEYS } from "../constants/storageKeys";

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
        this.fetchSessions().then(sessions => {
          // Check if session already exists
          const index = sessions.findIndex(s => s.id === session.id);
          
          if (index >= 0) {
            // Update existing session
            sessions[index] = session;
          } else {
            // Add new session
            sessions.unshift(session);
          }
          
          // Save to chrome.storage
          chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: sessions }, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
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
        this.fetchSessions().then(sessions => {
          const updatedSessions = sessions.filter(session => session.id !== sessionId);
          
          chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: updatedSessions }, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
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
      const session = sessions.find(session => session.id === sessionId);
      return session || null;
    } catch (error) {
      console.error("Error fetching session by ID from Chrome storage:", error);
      return null;
    }
  }
}
