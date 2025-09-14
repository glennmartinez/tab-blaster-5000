// Environment configuration for the Chrome extension
export interface AppConfig {
  serverUrl: string;
  apiVersion: string;
  isDevelopment: boolean;
}

// Default configuration
const defaultConfig: AppConfig = {
  serverUrl:
    import.meta.env.VITE_IS_DEVELOPMENT === "true"
      ? import.meta.env.VITE_DEV_SERVER_URL || "http://localhost:8080"
      : import.meta.env.VITE_PROD_SERVER_URL ||
        "https://tab-blaster-5k-19786549408.us-central1.run.app",
  apiVersion: import.meta.env.VITE_API_VERSION || "v1",
  isDevelopment: import.meta.env.VITE_IS_DEVELOPMENT === "true",
};

// Load configuration from environment variables or storage
export class ConfigService {
  private static config: AppConfig = defaultConfig;

  static async loadConfig(): Promise<AppConfig> {
    try {
      // Try to load from Chrome storage first
      const stored = await chrome.storage.local.get(["appConfig"]);
      if (stored.appConfig) {
        this.config = { ...defaultConfig, ...stored.appConfig };
      }
    } catch (error) {
      console.warn(
        "Failed to load config from storage, using defaults:",
        error
      );
    }

    return this.config;
  }

  static async saveConfig(config: Partial<AppConfig>): Promise<void> {
    try {
      const newConfig = { ...this.config, ...config };
      await chrome.storage.local.set({ appConfig: newConfig });
      this.config = newConfig;
    } catch (error) {
      console.error("Failed to save config to storage:", error);
      throw error;
    }
  }

  static getConfig(): AppConfig {
    return this.config;
  }

  static getServerUrl(): string {
    return this.config.serverUrl;
  }

  static getApiUrl(): string {
    return `${this.config.serverUrl}/api`;
  }

  static getAuthApiUrl(): string {
    return `${this.config.serverUrl}/api/auth`;
  }

  static isDevelopment(): boolean {
    return this.config.isDevelopment;
  }
}

// Initialize config on module load
ConfigService.loadConfig().catch(console.error);
