import { Session } from "../models/Session";
import { SessionInterface } from "./SessionInterface";
import { SavedTab } from "../interfaces/TabInterface";

class DriveStorageService implements SessionInterface {
  private static FILE_MIME_TYPE = "application/json";
  private static SESSIONS_FILE_NAME = "ultimate-tab-manager-sessions.json";
  private static SAVED_TABS_FILE_NAME = "ultimate-tab-manager-saved-tabs.json";
  private static SETTINGS_FILE_NAME = "ultimate-tab-manager-settings.json";

  /**
   * Get authentication token for Google Drive API
   * @returns Promise with the auth token
   */
  private static async getAuthToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!chrome?.identity) {
        reject(new Error("Chrome identity API not available"));
        return;
      }

      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        if (!token) {
          reject(new Error("Failed to get auth token"));
          return;
        }

        resolve(token as string);
      });
    });
  }

  /**
   * Read a file from Google Drive
   * @param fileId The ID of the file to read
   * @returns Promise with the file content as JSON
   */
  static async readFile<T>(fileId: string): Promise<T> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to read file: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error reading file from Google Drive:", error);
      throw error;
    }
  }

  /**
   * List files in Google Drive with optional query
   * @param query Optional query to filter files (default: all JSON files)
   * @returns Promise with array of file metadata
   */
  static async listFiles(
    query = `mimeType='${DriveStorageService.FILE_MIME_TYPE}'`
  ): Promise<any[]> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
          query
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error("Error listing files from Google Drive:", error);
      throw error;
    }
  }

  /**
   * Create or update a file in Google Drive
   * @param fileName Name of the file
   * @param content Content to write to the file
   * @param fileId Optional fileId if updating existing file
   * @returns Promise with the created/updated file metadata
   */
  static async createOrUpdateFile(
    fileName: string,
    content: any,
    fileId?: string
  ): Promise<any> {
    try {
      const token = await this.getAuthToken();

      // First create or update the file metadata
      const metadata = {
        name: fileName,
        mimeType: this.FILE_MIME_TYPE,
      };

      const isUpdate = !!fileId;
      const method = isUpdate ? "PATCH" : "POST";
      const url = isUpdate
        ? `https://www.googleapis.com/drive/v3/files/${fileId}`
        : "https://www.googleapis.com/drive/v3/files";

      const metadataResponse = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      if (!metadataResponse.ok) {
        throw new Error(
          `Failed to ${isUpdate ? "update" : "create"} file metadata: ${
            metadataResponse.statusText
          }`
        );
      }

      const file = await metadataResponse.json();

      // Now upload the actual content
      const contentResponse = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": this.FILE_MIME_TYPE,
          },
          body: JSON.stringify(content),
        }
      );

      if (!contentResponse.ok) {
        throw new Error(
          `Failed to upload file content: ${contentResponse.statusText}`
        );
      }

      return file;
    } catch (error) {
      console.error("Error creating/updating file in Google Drive:", error);
      throw error;
    }
  }

  /**
   * Delete a file from Google Drive
   * @param fileId ID of the file to delete
   * @returns Promise that resolves when deletion is complete
   */
  static async deleteFile(fileId: string): Promise<void> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete file: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error deleting file from Google Drive:", error);
      throw error;
    }
  }

  /**
   * Find the sessions file or create if it doesn't exist
   * @returns Promise with the file ID of the sessions file
   */
  private static async findOrCreateSessionsFile(): Promise<string> {
    try {
      // Search for existing sessions file
      const files = await this.listFiles(`name='${this.SESSIONS_FILE_NAME}'`);

      if (files.length > 0) {
        return files[0].id;
      }

      // Create new sessions file if none exists
      const newFile = await this.createOrUpdateFile(
        this.SESSIONS_FILE_NAME,
        [] // Empty sessions array initially
      );

      return newFile.id;
    } catch (error) {
      console.error("Error finding or creating sessions file:", error);
      throw error;
    }
  }

  static async getSessions(): Promise<Session[]> {
    try {
      const fileId = await this.findOrCreateSessionsFile();
      return await this.readFile<Session[]>(fileId);
    } catch (error) {
      console.error("Error getting sessions from Google Drive:", error);
      return [];
    }
  }

  static async saveSession(session: Session): Promise<void> {
    try {
      const fileId = await this.findOrCreateSessionsFile();

      // Get current sessions
      const sessions = await this.readFile<Session[]>(fileId);

      // Update if exists, otherwise add
      const sessionIndex = sessions.findIndex((s) => s.id === session.id);
      if (sessionIndex >= 0) {
        sessions[sessionIndex] = session;
      } else {
        sessions.unshift(session); // Add new session to the beginning of the array
      }

      // Save updated sessions
      await this.createOrUpdateFile(this.SESSIONS_FILE_NAME, sessions, fileId);
    } catch (error) {
      console.error("Error saving session to Google Drive:", error);
      throw error;
    }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const fileId = await this.findOrCreateSessionsFile();

      // Get current sessions
      const sessions = await this.readFile<Session[]>(fileId);

      // Filter out the session to delete
      const filteredSessions = sessions.filter((s) => s.id !== sessionId);

      // Save updated sessions
      await this.createOrUpdateFile(
        this.SESSIONS_FILE_NAME,
        filteredSessions,
        fileId
      );
    } catch (error) {
      console.error("Error deleting session from Google Drive:", error);
      throw error;
    }
  }

  /**
   * Fetch all sessions from Google Drive
   */
  async fetchSessions(): Promise<Session[]> {
    return DriveStorageService.getSessions();
  }

  /**
   * Store a session in Google Drive
   */
  async storeSession(session: Session): Promise<void> {
    return DriveStorageService.saveSession(session);
  }

  /**
   * Delete a session from Google Drive by ID
   */
  async deleteSession(sessionId: string): Promise<void> {
    return DriveStorageService.deleteSession(sessionId);
  }

  /**
   * Fetch a specific session by ID from Google Drive
   */
  async fetchSessionById(sessionId: string): Promise<Session | null> {
    try {
      const sessions = await DriveStorageService.getSessions();
      const session = sessions.find((session) => session.id === sessionId);
      return session || null;
    } catch (error) {
      console.error("Error fetching session by ID from Google Drive:", error);
      return null;
    }
  }

  /**
   * Get saved tabs from Google Drive
   */
  async getSavedTabs(): Promise<SavedTab[]> {
    try {
      // Search for existing saved tabs file
      const files = await DriveStorageService.listFiles(
        `name='${DriveStorageService.SAVED_TABS_FILE_NAME}'`
      );

      if (files.length > 0) {
        return await DriveStorageService.readFile<SavedTab[]>(files[0].id);
      }

      // No saved tabs file exists yet
      return [];
    } catch (error) {
      console.error("Error getting saved tabs from Google Drive:", error);
      return [];
    }
  }

  /**
   * Save tabs to Google Drive
   */
  async saveTabs(tabs: SavedTab[]): Promise<void> {
    try {
      // Search for existing saved tabs file
      const files = await DriveStorageService.listFiles(
        `name='${DriveStorageService.SAVED_TABS_FILE_NAME}'`
      );

      if (files.length > 0) {
        // Update existing file
        await DriveStorageService.createOrUpdateFile(
          DriveStorageService.SAVED_TABS_FILE_NAME,
          tabs,
          files[0].id
        );
      } else {
        // Create new file
        await DriveStorageService.createOrUpdateFile(
          DriveStorageService.SAVED_TABS_FILE_NAME,
          tabs
        );
      }
    } catch (error) {
      console.error("Error saving tabs to Google Drive:", error);
      throw error;
    }
  }

  /**
   * Get application settings from Google Drive
   */
  async getSettings<T>(defaultSettings: T): Promise<T> {
    try {
      // Search for existing settings file
      const files = await DriveStorageService.listFiles(
        `name='${DriveStorageService.SETTINGS_FILE_NAME}'`
      );

      if (files.length > 0) {
        return await DriveStorageService.readFile<T>(files[0].id);
      }

      // No settings file exists yet, return default settings
      return defaultSettings;
    } catch (error) {
      console.error("Error getting settings from Google Drive:", error);
      return defaultSettings;
    }
  }

  /**
   * Save application settings to Google Drive
   */
  async saveSettings<T>(settings: T): Promise<void> {
    try {
      // Search for existing settings file
      const files = await DriveStorageService.listFiles(
        `name='${DriveStorageService.SETTINGS_FILE_NAME}'`
      );

      if (files.length > 0) {
        // Update existing file
        await DriveStorageService.createOrUpdateFile(
          DriveStorageService.SETTINGS_FILE_NAME,
          settings,
          files[0].id
        );
      } else {
        // Create new file
        await DriveStorageService.createOrUpdateFile(
          DriveStorageService.SETTINGS_FILE_NAME,
          settings
        );
      }
    } catch (error) {
      console.error("Error saving settings to Google Drive:", error);
      throw error;
    }
  }

  /**
   * Get data from Google Drive by key
   */
  async get(key: string): Promise<Record<string, unknown>> {
    try {
      // Search for file with name matching the key
      const files = await DriveStorageService.listFiles(`name='${key}.json'`);

      if (files.length > 0) {
        const data = await DriveStorageService.readFile<unknown>(files[0].id);
        return { [key]: data };
      }

      return { [key]: null };
    } catch (error) {
      console.error(
        `Error getting data for key ${key} from Google Drive:`,
        error
      );
      return { [key]: null };
    }
  }

  /**
   * Set data in Google Drive
   */
  async set(data: Record<string, unknown>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(data)) {
        const fileName = `${key}.json`;

        // Search for existing file
        const files = await DriveStorageService.listFiles(`name='${fileName}'`);

        if (files.length > 0) {
          // Update existing file
          await DriveStorageService.createOrUpdateFile(
            fileName,
            value,
            files[0].id
          );
        } else {
          // Create new file
          await DriveStorageService.createOrUpdateFile(fileName, value);
        }
      }
    } catch (error) {
      console.error("Error setting data in Google Drive:", error);
      throw error;
    }
  }
}

export default DriveStorageService;
