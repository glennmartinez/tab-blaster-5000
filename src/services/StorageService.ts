import { SavedTab } from "../interfaces/TabInterface";
import { Session } from "../models/Session";
import { STORAGE_KEYS } from "../constants/storageKeys";
import DriveStorageService from "./DriveStorageService";

// Storage provider types
export type StorageProvider = "local" | "chrome" | "drive";

/**
 * Service for interacting with storage
 */
export class StorageService {
  // Default storage provider
  private static storageProvider: StorageProvider = "local";

  /**
   * Set the storage provider to use
   * @param provider The storage provider to use
   */
  static setStorageProvider(provider: StorageProvider): void {
    this.storageProvider = provider;
    console.log(`Storage provider set to: ${provider}`);
  }

  /**
   * Get the current storage provider
   * @returns The current storage provider
   */
  static getStorageProvider(): StorageProvider {
    return this.storageProvider;
  }

  /**
   * Get saved tabs from storage
   */
  static getSavedTabs(): Promise<SavedTab[]> {
    return new Promise((resolve) => {
      const savedTabs = localStorage.getItem(STORAGE_KEYS.SAVED_TABS);
      resolve(savedTabs ? JSON.parse(savedTabs) : []);
    });
  }

  /**
   * Save tabs to storage
   */
  static saveTabs(tabs: SavedTab[]): Promise<void> {
    return new Promise((resolve) => {
      localStorage.setItem(STORAGE_KEYS.SAVED_TABS, JSON.stringify(tabs));
      resolve();
    });
  }

  /**
   * Get sessions from storage
   */
  static async getSessions(): Promise<Session[]> {
    // Use Google Drive if selected
    if (this.storageProvider === "drive") {
      return DriveStorageService.getSessions();
    }

    // Otherwise use local or chrome storage
    try {
      // First try localStorage (primary)
      const localData = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (localData) {
        const sessions = JSON.parse(localData);
        console.log("[Storage Debug] localStorage sessions:", sessions);
        return sessions;
      }

      // Fall back to chrome.storage if localStorage fails or is empty
      if (this.storageProvider === "chrome" && chrome?.storage) {
        return new Promise((resolve) => {
          chrome.storage.local.get([STORAGE_KEYS.SESSIONS], (result) => {
            const sessions = result[STORAGE_KEYS.SESSIONS] || [];
            console.log("[Storage Debug] chrome.storage sessions:", sessions);
            resolve(sessions);
          });
        });
      }

      return [];
    } catch (error) {
      console.error("Error getting sessions:", error);
      return [];
    }
  }

  /**
   * Save a session to storage
   */
  static async saveSession(session: Session): Promise<void> {
    // Use Google Drive if selected
    if (this.storageProvider === "drive") {
      return DriveStorageService.saveSession(session);
    }

    try {
      // Get current sessions
      const sessions = await this.getSessions();

      // Update if exists, otherwise add
      const sessionIndex = sessions.findIndex((s) => s.id === session.id);
      if (sessionIndex >= 0) {
        sessions[sessionIndex] = session;
      } else {
        sessions.unshift(session); // Add new session to the beginning of the array
      }

      // Save to localStorage (primary)
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      console.log("[Storage Debug] Saved sessions to localStorage:", sessions);

      // Also save to chrome.storage if that's the provider
      if (this.storageProvider === "chrome" && chrome?.storage) {
        chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: sessions });
      }
    } catch (error) {
      console.error("Error saving session:", error);
      throw error;
    }
  }

  /**
   * Delete a session from storage
   */
  static async deleteSession(sessionId: string): Promise<void> {
    // Use Google Drive if selected
    if (this.storageProvider === "drive") {
      return DriveStorageService.deleteSession(sessionId);
    }

    try {
      const sessions = await this.getSessions();
      const filteredSessions = sessions.filter(
        (session) => session.id !== sessionId
      );

      // Save to localStorage (primary)
      localStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(filteredSessions)
      );
      console.log("[Storage Debug] Deleted from localStorage");

      // Also save to chrome.storage if that's the provider
      if (this.storageProvider === "chrome" && chrome?.storage) {
        chrome.storage.local.set({ [STORAGE_KEYS.SESSIONS]: filteredSessions });
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      throw error;
    }
  }

  /**
   * Get application settings
   */
  static getSettings<T>(defaultSettings: T): Promise<T> {
    return new Promise((resolve) => {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      resolve(settings ? JSON.parse(settings) : defaultSettings);
    });
  }

  /**
   * Save application settings
   */
  static saveSettings<T>(settings: T): Promise<void> {
    return new Promise((resolve) => {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      resolve();
    });
  }

  /**
   * Get data from storage
   */
  static get(key: string): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      try {
        const data = localStorage.getItem(key);
        const parsedData = data ? JSON.parse(data) : null;
        console.log(
          `[Storage Debug] LocalStorage data for ${key}:`,
          parsedData
        );
        resolve({ [key]: parsedData });
      } catch (e) {
        console.error(`Error parsing localStorage data for ${key}:`, e);
        resolve({ [key]: null });
      }
    });
  }

  /**
   * Set data in storage
   */
  static set(data: Record<string, unknown>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
          console.log(`[Storage Debug] Saved to localStorage - ${key}:`, value);
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
}
