import { SavedTab } from "../interfaces/TabInterface";
import { Session } from "../models/Session";
import { StorageFactory, StorageType } from "./factories/StorageFactory";

// Storage provider types - kept for backward compatibility
export type StorageProvider = "local" | "chrome" | "drive";

/**
 * @deprecated Use StorageFactory.getStorageService() instead.
 * This class is maintained for backward compatibility.
 * Service for interacting with storage
 */
export class StorageService {
  // We'll use StorageFactory directly instead of tracking our own provider

  /**
   * Map the old storage provider type to the new StorageType enum
   */
  private static mapProviderToType(provider: StorageProvider): StorageType {
    switch (provider) {
      case "local":
        return StorageType.LOCAL_STORAGE;
      case "chrome":
        return StorageType.CHROME_STORAGE;
      case "drive":
        return StorageType.DRIVE;
      default:
        return StorageType.LOCAL_STORAGE;
    }
  }

  /**
   * Get the storage service instance from the factory
   */
  private static getStorageInstance() {
    return StorageFactory.getStorageService();
  }

  /**
   * Set the storage provider to use
   * @param provider The storage provider to use
   * @deprecated Use StorageFactory.setPreferredStorageType() instead
   */
  static setStorageProvider(provider: StorageProvider): void {
    // Update the factory's preferred storage type directly
    const storageType = this.mapProviderToType(provider);
    StorageFactory.setPreferredStorageType(storageType);
    console.log(`Storage provider set to: ${provider}`);
  }

  /**
   * Get the current storage provider
   * @returns The current storage provider
   * @deprecated Use StorageFactory.getCurrentStorageType() instead
   */
  static getStorageProvider(): StorageProvider {
    const currentType = StorageFactory.getCurrentStorageType();
    switch (currentType) {
      case StorageType.LOCAL_STORAGE:
        return "local";
      case StorageType.CHROME_STORAGE:
        return "chrome";
      case StorageType.DRIVE:
        return "drive";
      default:
        return "local";
    }
  }

  /**
   * Get saved tabs from storage
   * @deprecated Use StorageFactory.getStorageService().getSavedTabs() instead
   */
  static getSavedTabs(): Promise<SavedTab[]> {
    return this.getStorageInstance().getSavedTabs();
  }

  /**
   * Save tabs to storage
   * @deprecated Use StorageFactory.getStorageService().saveTabs() instead
   */
  static saveTabs(tabs: SavedTab[]): Promise<void> {
    return this.getStorageInstance().saveTabs(tabs);
  }

  /**
   * Get sessions from storage
   * @deprecated Use StorageFactory.getStorageService().fetchSessions() instead
   */
  static async getSessions(): Promise<Session[]> {
    return this.getStorageInstance().fetchSessions();
  }

  /**
   * Save a session to storage
   * @deprecated Use StorageFactory.getStorageService().storeSession() instead
   */
  static async saveSession(session: Session): Promise<void> {
    return this.getStorageInstance().storeSession(session);
  }

  /**
   * Delete a session from storage
   * @deprecated Use StorageFactory.getStorageService().deleteSession() instead
   */
  static async deleteSession(sessionId: string): Promise<void> {
    return this.getStorageInstance().deleteSession(sessionId);
  }

  /**
   * Get application settings
   * @deprecated Use StorageFactory.getStorageService().getSettings() instead
   */
  static getSettings<T>(defaultSettings: T): Promise<T> {
    return this.getStorageInstance().getSettings(defaultSettings);
  }

  /**
   * Save application settings
   * @deprecated Use StorageFactory.getStorageService().saveSettings() instead
   */
  static saveSettings<T>(settings: T): Promise<void> {
    return this.getStorageInstance().saveSettings(settings);
  }

  /**
   * Get data from storage
   * @deprecated Use StorageFactory.getStorageService().get() instead
   */
  static get(key: string): Promise<Record<string, unknown>> {
    return this.getStorageInstance().get(key);
  }

  /**
   * Set data in storage
   * @deprecated Use StorageFactory.getStorageService().set() instead
   */
  static set(data: Record<string, unknown>): Promise<void> {
    return this.getStorageInstance().set(data);
  }
}
