import { STORAGE_KEYS } from "../constants/storageKeys";
import { ChromeStorageService } from "./ChromeStorageService";
import DriveStorageService from "./DriveStorageService";
import { LocalStorageService } from "./LocalStorageService";
import { SessionInterface } from "./SessionInterface";

export enum StorageType {
  LOCAL_STORAGE = "localStorage",
  CHROME_STORAGE = "chromeStorage",
  CHROME_SYNC = "sync",
  DRIVE = "drive",
}

export class StorageFactory {
  private static instance: SessionInterface | null = null;
  private static currentType: StorageType = StorageType.LOCAL_STORAGE;

  static getStorageService(): SessionInterface {
    if (this.instance) {
      return this.instance;
    }

    const preferredType = this.getPreferredStorageType();
    this.currentType = preferredType;

    switch (preferredType) {
      case StorageType.CHROME_STORAGE:
        if (chrome?.storage) {
          this.instance = new ChromeStorageService();
        } else {
          console.warn(
            "Chrome storage not available, falling back to localStorage"
          );
          this.currentType = StorageType.LOCAL_STORAGE;
          this.instance = new LocalStorageService();
        }
        break;

      case StorageType.DRIVE:
        this.instance = new DriveStorageService();
        break;

      case StorageType.LOCAL_STORAGE:
      default:
        this.instance = new LocalStorageService();
        break;
    }

    // Ensure we always return a valid instance
    if (!this.instance) {
      this.instance = new LocalStorageService();
    }

    return this.instance;
  }

  /**
   * Set the preferred storage type
   */
  static setPreferredStorageType(type: StorageType): void {
    try {
      // Get current settings
      const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const settings = settingsJson ? JSON.parse(settingsJson) : {};

      // Map StorageType to StorageProvider for settings
      let storageProvider = "local";
      switch (type) {
        case StorageType.CHROME_STORAGE:
          storageProvider = "chrome";
          break;
        case StorageType.DRIVE:
          storageProvider = "drive";
          break;
        case StorageType.LOCAL_STORAGE:
        default:
          storageProvider = "local";
      }

      // Update settings with the new storage provider
      settings.storageProvider = storageProvider;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

      // For backward compatibility: also set the legacy preference
      localStorage.removeItem(STORAGE_KEYS.STORAGE_PREFERENCE);

      // Reset instance so next getStorageService call creates a new one
      this.instance = null;

      console.log(`Storage preference set to: ${storageProvider}`);
    } catch (e) {
      console.error("Failed to save storage preference:", e);
      // In case of error, ensure we still have a working storage by using local
      this.instance = new LocalStorageService();
      this.currentType = StorageType.LOCAL_STORAGE;
    }
  }

  /**
   * Get the current preferred storage type
   */
  static getPreferredStorageType(): StorageType {
    try {
      // Try to get the settings object first
      const settingsJson = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsJson) {
        try {
          const settings = JSON.parse(settingsJson);
          if (settings && settings.storageProvider) {
            console.log(
              `Found storage preference in settings: ${settings.storageProvider}`
            );
            // Map the storageProvider string to StorageType enum
            switch (settings.storageProvider) {
              case "chrome":
                return StorageType.CHROME_STORAGE;
              case "drive":
                return StorageType.DRIVE;
              case "local":
                return StorageType.LOCAL_STORAGE;
              default:
                console.log(
                  `Unknown storage provider: ${settings.storageProvider}, using localStorage`
                );
                return StorageType.LOCAL_STORAGE;
            }
          }
        } catch (parseError) {
          console.error("Error parsing settings JSON:", parseError);
          // If we can't parse the settings, fall back to default
        }
      }

      // Fallback to check the legacy storage preference
      const typeString = localStorage.getItem(STORAGE_KEYS.STORAGE_PREFERENCE);
      if (typeString) {
        console.log(`Found legacy storage preference: ${typeString}`);
        if (typeString === StorageType.CHROME_STORAGE)
          return StorageType.CHROME_STORAGE;
        if (typeString === StorageType.DRIVE) return StorageType.DRIVE;
        if (typeString === StorageType.LOCAL_STORAGE)
          return StorageType.LOCAL_STORAGE;
      }

      // If no preference is found anywhere, default to localStorage
      console.log("No storage preference found, defaulting to localStorage");
      return StorageType.LOCAL_STORAGE;
    } catch (e) {
      console.error("Failed to get storage preference:", e);
      console.log("Setting local storage as fallback due to error");
      return StorageType.LOCAL_STORAGE;
    }
  }

  /**
   * Get the current storage type in use
   */
  static getCurrentStorageType(): StorageType {
    return this.currentType;
  }
}
