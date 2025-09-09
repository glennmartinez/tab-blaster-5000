// Server-based storage service that communicates with our Go server
import { SessionInterface } from "../SessionInterface";
import { Session } from "../../models/Session";
import { SavedTab } from "../../interfaces/TabInterface";
import { SimpleAuthService } from "../SimpleAuthService";
import { ConfigService } from "../../config/environment";

export class ServerStorageAdapter implements SessionInterface {
  private authService: SimpleAuthService;

  constructor() {
    this.authService = SimpleAuthService.getInstance();
  }

  private async makeAuthenticatedRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = await this.authService.getToken();
    if (!token) {
      throw new Error("User is not authenticated");
    }

    const url = `${ConfigService.getApiUrl()}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh or logout
        console.error(
          "ServerStorageService: 401 response received, logging out user"
        );
        console.error("Request was:", endpoint, options);
        console.error("Token was:", token ? "present" : "missing");
        await this.authService.logout();
        throw new Error("Authentication expired. Please login again.");
      }
      const errorData = await response
        .json()
        .catch(() => ({ error: "Request failed" }));
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return response;
  }

  // Session Interface Implementation
  async fetchSessions(): Promise<Session[]> {
    try {
      const response = await this.makeAuthenticatedRequest("/sessions");
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Failed to fetch sessions from server:", error);
      throw error;
    }
  }

  async storeSession(session: Session): Promise<void> {
    try {
      const endpoint = session.id ? `/sessions/${session.id}` : "/sessions";
      const method = session.id ? "PUT" : "POST";

      await this.makeAuthenticatedRequest(endpoint, {
        method,
        body: JSON.stringify(session),
      });
    } catch (error) {
      console.error("Failed to store session on server:", error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.makeAuthenticatedRequest(`/sessions/${sessionId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete session from server:", error);
      throw error;
    }
  }

  async fetchSessionById(sessionId: string): Promise<Session | null> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/sessions/${sessionId}`
      );
      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error("Failed to fetch session by ID from server:", error);
      return null;
    }
  }

  // Saved Tabs Implementation
  async getSavedTabs(): Promise<SavedTab[]> {
    try {
      const response = await this.makeAuthenticatedRequest("/tabs");
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Failed to fetch saved tabs from server:", error);
      throw error;
    }
  }

  async saveTabs(tabs: SavedTab[]): Promise<void> {
    try {
      await this.makeAuthenticatedRequest("/tabs", {
        method: "POST",
        body: JSON.stringify({ tabs }),
      });
    } catch (error) {
      console.error("Failed to save tabs to server:", error);
      throw error;
    }
  }

  // Settings Implementation
  async getSettings<T>(defaultSettings: T): Promise<T> {
    try {
      const response = await this.makeAuthenticatedRequest("/settings");
      const result = await response.json();
      return result.data || defaultSettings;
    } catch (error) {
      console.warn(
        "Failed to fetch settings from server, using defaults:",
        error
      );
      return defaultSettings;
    }
  }

  async saveSettings<T>(settings: T): Promise<void> {
    try {
      await this.makeAuthenticatedRequest("/settings", {
        method: "POST",
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error("Failed to save settings to server:", error);
      throw error;
    }
  }

  // Generic storage operations
  async get(key: string): Promise<Record<string, unknown>> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `/storage/${encodeURIComponent(key)}`
      );
      const result = await response.json();
      return { [key]: result.data };
    } catch (error) {
      console.warn(`Failed to fetch ${key} from server:`, error);
      return {};
    }
  }

  async set(data: Record<string, unknown>): Promise<void> {
    try {
      // Send each key-value pair to the server
      const promises = Object.entries(data).map(([key, value]) =>
        this.makeAuthenticatedRequest(`/storage/${encodeURIComponent(key)}`, {
          method: "POST",
          body: JSON.stringify({ value }),
        })
      );

      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to save data to server:", error);
      throw error;
    }
  }

  async remove(keys: string[]): Promise<void> {
    try {
      const promises = keys.map((key) =>
        this.makeAuthenticatedRequest(`/storage/${encodeURIComponent(key)}`, {
          method: "DELETE",
        })
      );

      await Promise.all(promises);
    } catch (error) {
      console.error("Failed to remove data from server:", error);
      throw error;
    }
  }

  // Helper method to check if the service is available
  async isAvailable(): Promise<boolean> {
    try {
      const currentUser = await this.authService.getCurrentUser();
      return !!currentUser;
    } catch (error) {
      return false;
    }
  }
}
