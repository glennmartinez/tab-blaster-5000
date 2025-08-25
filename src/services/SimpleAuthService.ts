// Simple authentication service that works with our Go server backend
import { ConfigService } from "../config/environment";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  email: string;
  token: string; // JWT token
  expires_at: string;
}

export interface AuthUser {
  user_id: string;
  email: string;
  email_verified?: boolean;
  display_name?: string;
  photo_url?: string;
}

export class SimpleAuthService {
  private static instance: SimpleAuthService;
  private currentUser: AuthUser | null = null;
  private customToken: string | null = null;

  private constructor() {}

  static getInstance(): SimpleAuthService {
    if (!SimpleAuthService.instance) {
      SimpleAuthService.instance = new SimpleAuthService();
    }
    return SimpleAuthService.instance;
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const authUrl = `${ConfigService.getAuthApiUrl()}/login`;

    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const result = await response.json();
    const data: LoginResponse = result.data;

    this.currentUser = {
      user_id: data.user_id,
      email: data.email,
    };
    this.customToken = data.token; // Store JWT token

    // Store auth info in Chrome storage
    await this.storeAuthInfo();

    return this.currentUser;
  }

  async logout(): Promise<void> {
    if (!this.currentUser) {
      return;
    }

    try {
      const authUrl = `${ConfigService.getAuthApiUrl()}/logout`;

      await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: this.currentUser.user_id }),
      });
    } catch (error) {
      console.warn("Server logout failed:", error);
    }

    // Clear local state
    this.currentUser = null;
    this.customToken = null;

    // Clear stored auth info
    await this.clearAuthInfo();
  }

  async verifyToken(token?: string): Promise<AuthUser | null> {
    const tokenToVerify = token || this.customToken;
    if (!tokenToVerify) {
      return null;
    }

    try {
      const authUrl = `${ConfigService.getAuthApiUrl()}/verify`;

      const response = await fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_token: tokenToVerify }),
      });

      if (!response.ok) {
        await this.clearAuthInfo();
        return null;
      }

      const result = await response.json();
      const userInfo = result.data;

      this.currentUser = {
        user_id: userInfo.user_id,
        email: userInfo.email,
        email_verified: userInfo.email_verified,
      };

      return this.currentUser;
    } catch (error) {
      console.warn("Token verification failed:", error);
      await this.clearAuthInfo();
      return null;
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from storage
    await this.restoreAuthInfo();

    if (this.currentUser && this.customToken) {
      // Verify the stored token is still valid
      return await this.verifyToken();
    }

    return null;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async getToken(): Promise<string | null> {
    if (!this.customToken) {
      // Try to restore from storage first
      await this.restoreAuthInfo();
    }
    return this.customToken;
  }

  private async storeAuthInfo(): Promise<void> {
    try {
      const dataToStore = {
        authUser: this.currentUser,
        customToken: this.customToken,
      };
      
      console.log("Storing auth info:", dataToStore);
      await chrome.storage.local.set(dataToStore);
      console.log("Auth info stored successfully");
    } catch (error) {
      console.error("Failed to store auth info:", error);
    }
  }

  private async restoreAuthInfo(): Promise<void> {
    try {
      const stored = await chrome.storage.local.get([
        "authUser",
        "customToken",
      ]);
      console.log("Restored auth info:", stored);
      
      if (stored.authUser && stored.customToken) {
        this.currentUser = stored.authUser;
        this.customToken = stored.customToken;
        console.log("Auth info restored successfully");
      } else {
        console.log("No auth info found in storage");
      }
    } catch (error) {
      console.warn("Failed to restore auth info:", error);
    }
  }

  private async clearAuthInfo(): Promise<void> {
    this.currentUser = null;
    this.customToken = null;

    try {
      await chrome.storage.local.remove(["authUser", "customToken"]);
    } catch (error) {
      console.error("Failed to clear auth info:", error);
    }
  }
}
