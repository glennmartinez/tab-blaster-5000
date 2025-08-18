import { SessionInterface } from "./SessionInterface";
import { Session } from "../models/Session";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { SavedTab } from "../interfaces/TabInterface";

export class LocalStorageService implements SessionInterface {
  // SessionInterface implementation

  /**
   * Fetch all sessions from localStorage
   */
  async fetchSessions(): Promise<Session[]> {
    try {
      const sessionsData = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (sessionsData) {
        return JSON.parse(sessionsData);
      }
      return [];
    } catch (error) {
      console.error("Error fetching sessions from localStorage:", error);
      return [];
    }
  }

  /**
   * Store a session in localStorage
   */
  async storeSession(session: Session): Promise<void> {
    try {
      const sessions = await this.fetchSessions();

      // Check if session already exists
      const index = sessions.findIndex((s) => s.id === session.id);

      if (index >= 0) {
        // Update existing session
        sessions[index] = session;
      } else {
        // Add new session
        sessions.unshift(session);
      }

      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error("Error storing session in localStorage:", error);
      throw error;
    }
  }

  /**
   * Delete a session from localStorage by ID
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.fetchSessions();
      const updatedSessions = sessions.filter(
        (session) => session.id !== sessionId
      );
      localStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(updatedSessions)
      );
    } catch (error) {
      console.error("Error deleting session from localStorage:", error);
      throw error;
    }
  }

  /**
   * Fetch a specific session by ID from localStorage
   */
  async fetchSessionById(sessionId: string): Promise<Session | null> {
    try {
      const sessions = await this.fetchSessions();
      const session = sessions.find((session) => session.id === sessionId);
      return session || null;
    } catch (error) {
      console.error("Error fetching session by ID from localStorage:", error);
      return null;
    }
  }

  /**
   * Get saved tabs from localStorage
   */
  async getSavedTabs(): Promise<SavedTab[]> {
    try {
      const tabsData = localStorage.getItem(STORAGE_KEYS.SAVED_TABS);
      return tabsData ? JSON.parse(tabsData) : [];
    } catch (error) {
      console.error("Error getting saved tabs:", error);
      return [];
    }
  }

  /**
   * Save tabs to localStorage
   */
  async saveTabs(tabs: SavedTab[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_TABS, JSON.stringify(tabs));
    } catch (error) {
      console.error("Error saving tabs:", error);
      throw error;
    }
  }

  /**
   * Get application settings from localStorage
   */
  async getSettings<T>(defaultSettings: T): Promise<T> {
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : defaultSettings;
    } catch (error) {
      console.error("Error getting settings:", error);
      return defaultSettings;
    }
  }

  /**
   * Save application settings to localStorage
   */
  async saveSettings<T>(settings: T): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  }

  /**
   * Get data from localStorage
   */
  async get(key: string): Promise<Record<string, unknown>> {
    try {
      const data = localStorage.getItem(key);
      const parsedData = data ? JSON.parse(data) : null;
      return { [key]: parsedData };
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return { [key]: null };
    }
  }

  /**
   * Set data in localStorage
   */
  async set(data: Record<string, unknown>): Promise<void> {
    try {
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    } catch (error) {
      console.error("Error setting data:", error);
      throw error;
    }
  }

  /**
   * Remove data from localStorage
   */
  async remove(keys: string[]): Promise<void> {
    try {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Error removing data:", error);
      throw error;
    }
  }
}
