import {
  UserFirebaseConfig,
  EncryptedFirebaseConfig,
  PasswordSession,
  SecurityPreferences,
} from "./FirebaseTypes";

const DEFAULT_SECURITY_PREFS: SecurityPreferences = {
  passwordExpiryDays: 7,
  requirePasswordForChanges: true,
  autoLockOnIdle: false,
  idleTimeoutMinutes: 30,
};

const STORAGE_KEYS = {
  FIREBASE_CONFIG: "firebase_config_encrypted",
  FIREBASE_SESSION: "firebase_password_session",
  FIREBASE_SECURITY: "firebase_security_preferences",
};

export class FirebaseConfigService {
  private static sessionKey: CryptoKey | null = null;
  private static configCache: UserFirebaseConfig | null = null;

  /**
   * Check if Firebase configuration exists and is valid
   */
  static async hasValidConfig(): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get([
        STORAGE_KEYS.FIREBASE_CONFIG,
      ]);
      return !!result[STORAGE_KEYS.FIREBASE_CONFIG];
    } catch (error) {
      console.error("Error checking Firebase config:", error);
      return false;
    }
  }

  /**
   * Store Firebase configuration with encryption
   */
  static async storeConfig(
    config: UserFirebaseConfig,
    password: string
  ): Promise<void> {
    try {
      // Generate random salt for this config
      const salt = crypto.getRandomValues(new Uint8Array(16));

      // Derive encryption key from password + salt + device info
      const encryptionKey = await this.deriveEncryptionKey(password, salt);

      // Encrypt the configuration
      const configJson = JSON.stringify(config);
      const encoder = new TextEncoder();
      const data = encoder.encode(configJson);
      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        encryptionKey,
        data
      );

      // Calculate password expiry (7 days from now)
      const now = Date.now();
      const expiryTime = now + 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

      const encryptedConfig: EncryptedFirebaseConfig = {
        data: Array.from(new Uint8Array(encryptedBuffer)),
        iv: Array.from(iv),
        salt: Array.from(salt),
        timestamp: now,
        passwordExpiry: expiryTime,
      };

      // Store encrypted config
      await chrome.storage.local.set({
        [STORAGE_KEYS.FIREBASE_CONFIG]: encryptedConfig,
      });

      // Create password session
      await this.createPasswordSession(encryptionKey, expiryTime);

      // Cache the config and key for this session
      this.configCache = config;
      this.sessionKey = encryptionKey;

      console.log("Firebase configuration stored securely");
    } catch (error) {
      console.error("Failed to store Firebase config:", error);
      throw new Error("Failed to store Firebase configuration");
    }
  }

  /**
   * Get Firebase configuration (prompts for password if expired)
   */
  static async getConfig(): Promise<UserFirebaseConfig> {
    // Return cached config if available
    if (this.configCache && this.sessionKey) {
      return this.configCache;
    }

    // Check if we have a valid password session
    const hasValidSession = await this.hasValidPasswordSession();

    if (!hasValidSession) {
      // Need to prompt for password
      throw new Error("PASSWORD_REQUIRED");
    }

    // Load and decrypt config
    return await this.loadAndDecryptConfig();
  }

  /**
   * Check if current password session is still valid
   */
  static async hasValidPasswordSession(): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get([
        STORAGE_KEYS.FIREBASE_SESSION,
      ]);
      const session: PasswordSession = result[STORAGE_KEYS.FIREBASE_SESSION];

      if (!session) {
        return false;
      }

      const now = Date.now();
      const isExpired = now > session.expiresAt;

      if (isExpired) {
        // Clean up expired session
        await this.clearPasswordSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking password session:", error);
      return false;
    }
  }

  /**
   * Unlock Firebase config with password
   */
  static async unlockWithPassword(
    password: string
  ): Promise<UserFirebaseConfig> {
    try {
      // Get encrypted config
      const result = await chrome.storage.local.get([
        STORAGE_KEYS.FIREBASE_CONFIG,
      ]);
      const encryptedConfig: EncryptedFirebaseConfig =
        result[STORAGE_KEYS.FIREBASE_CONFIG];

      if (!encryptedConfig) {
        throw new Error("No Firebase configuration found");
      }

      // Check if password has expired globally
      const now = Date.now();
      if (now > encryptedConfig.passwordExpiry) {
        throw new Error("PASSWORD_EXPIRED");
      }

      // Derive key from password and stored salt
      const salt = new Uint8Array(encryptedConfig.salt);
      const encryptionKey = await this.deriveEncryptionKey(password, salt);

      // Decrypt config
      const iv = new Uint8Array(encryptedConfig.iv);
      const encryptedData = new Uint8Array(encryptedConfig.data);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        encryptionKey,
        encryptedData
      );

      const decoder = new TextDecoder();
      const configJson = decoder.decode(decryptedBuffer);
      const config: UserFirebaseConfig = JSON.parse(configJson);

      // Create new password session (extends for another week from now)
      const newExpiryTime = now + 7 * 24 * 60 * 60 * 1000;
      await this.createPasswordSession(encryptionKey, newExpiryTime);

      // Cache for this session
      this.configCache = config;
      this.sessionKey = encryptionKey;

      return config;
    } catch (error) {
      console.error("Failed to unlock Firebase config:", error);
      if (error instanceof Error && error.message === "PASSWORD_EXPIRED") {
        throw new Error(
          "Your password has expired. Please re-enter your Firebase configuration."
        );
      }
      throw new Error("Invalid password or corrupted configuration");
    }
  }

  /**
   * Test Firebase configuration connectivity
   */
  static async testConnection(config: UserFirebaseConfig): Promise<boolean> {
    try {
      // Import Firebase dynamically to avoid bundle bloat
      const { initializeApp } = await import("firebase/app");
      const { getFirestore, doc, setDoc } = await import("firebase/firestore");

      // Initialize temporary Firebase app for testing
      const testApp = initializeApp(config, "test-connection");
      const db = getFirestore(testApp);

      // Try a simple write operation to test connectivity
      const testDoc = doc(db, "connection-test", "test");
      await setDoc(testDoc, { timestamp: Date.now() });

      return true;
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      return false;
    }
  }

  /**
   * Derive encryption key from password and salt
   */
  private static async deriveEncryptionKey(
    password: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();

    // Create base key material from password + device info
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password + chrome.runtime.id),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    // Derive strong encryption key - make it extractable for session creation
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt as BufferSource,
        iterations: 600000, // High iteration count for security
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true, // Make extractable so we can create session hash
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Create a password session
   */
  private static async createPasswordSession(
    key: CryptoKey,
    expiresAt: number
  ): Promise<void> {
    // Create a hash of the key for session validation
    const keyBuffer = await crypto.subtle.exportKey("raw", key);
    const keyHash = await crypto.subtle.digest("SHA-256", keyBuffer);

    const session: PasswordSession = {
      keyHash: Array.from(new Uint8Array(keyHash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
      expiresAt,
      createdAt: Date.now(),
    };

    await chrome.storage.local.set({
      [STORAGE_KEYS.FIREBASE_SESSION]: session,
    });
  }

  /**
   * Load and decrypt configuration using cached session key
   */
  private static async loadAndDecryptConfig(): Promise<UserFirebaseConfig> {
    if (!this.sessionKey) {
      throw new Error("No valid session key available");
    }

    const result = await chrome.storage.local.get([
      STORAGE_KEYS.FIREBASE_CONFIG,
    ]);
    const encryptedConfig: EncryptedFirebaseConfig =
      result[STORAGE_KEYS.FIREBASE_CONFIG];

    const iv = new Uint8Array(encryptedConfig.iv);
    const encryptedData = new Uint8Array(encryptedConfig.data);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      this.sessionKey,
      encryptedData
    );

    const decoder = new TextDecoder();
    const configJson = decoder.decode(decryptedBuffer);
    const config: UserFirebaseConfig = JSON.parse(configJson);

    this.configCache = config;
    return config;
  }

  /**
   * Clear password session and cached data
   */
  static async clearPasswordSession(): Promise<void> {
    await chrome.storage.local.remove([STORAGE_KEYS.FIREBASE_SESSION]);
    this.sessionKey = null;
    this.configCache = null;
  }

  /**
   * Clear all Firebase configuration
   */
  static async clearAllConfig(): Promise<void> {
    await chrome.storage.local.remove([
      STORAGE_KEYS.FIREBASE_CONFIG,
      STORAGE_KEYS.FIREBASE_SESSION,
      STORAGE_KEYS.FIREBASE_SECURITY,
    ]);
    this.sessionKey = null;
    this.configCache = null;
  }

  /**
   * Get security preferences
   */
  static async getSecurityPreferences(): Promise<SecurityPreferences> {
    try {
      const result = await chrome.storage.local.get([
        STORAGE_KEYS.FIREBASE_SECURITY,
      ]);
      return result[STORAGE_KEYS.FIREBASE_SECURITY] || DEFAULT_SECURITY_PREFS;
    } catch (error) {
      console.error("Error getting security preferences:", error);
      return DEFAULT_SECURITY_PREFS;
    }
  }

  /**
   * Update security preferences
   */
  static async updateSecurityPreferences(
    preferences: SecurityPreferences
  ): Promise<void> {
    await chrome.storage.local.set({
      [STORAGE_KEYS.FIREBASE_SECURITY]: preferences,
    });
  }

  /**
   * Check if password will expire soon (within 24 hours)
   */
  static async isPasswordExpiringSoon(): Promise<boolean> {
    try {
      const result = await chrome.storage.local.get([
        STORAGE_KEYS.FIREBASE_SESSION,
      ]);
      const session: PasswordSession = result[STORAGE_KEYS.FIREBASE_SESSION];

      if (!session) return false;

      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      return session.expiresAt - now < twentyFourHours;
    } catch {
      return false;
    }
  }
}
