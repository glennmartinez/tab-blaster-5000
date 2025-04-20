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
          throw "Chrome unable to be installed";
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

    return this.instance;
  }

  /**
   * Set the preferred storage type
   */
  static setPreferredStorageType(type: StorageType): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STORAGE_PREFERENCE, type);
      // Reset instance so next getStorageService call creates a new one
      this.instance = null;
    } catch (e) {
      console.error("Failed to save storage preference:", e);
    }
  }

  /**
   * Get the current preferred storage type
   */
  static getPreferredStorageType(): StorageType {
    try {
      const typeString = localStorage.getItem(STORAGE_KEYS.STORAGE_PREFERENCE);
      if (typeString === StorageType.CHROME_STORAGE)
        return StorageType.CHROME_STORAGE;
      if (typeString === StorageType.DRIVE) return StorageType.DRIVE;
      return StorageType.LOCAL_STORAGE;
    } catch (e) {
      console.error("Failed to get storage preference:", e);
      console.log("Setting local storage as fallback");
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
