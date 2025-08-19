import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  Firestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { SessionInterface } from "../SessionInterface";
import { Session } from "../../models/Session";
import { SavedTab } from "../../interfaces/TabInterface";
import { FirebaseConfigService } from "./FirebaseConfigService";
import { UserFirebaseConfig } from "./FirebaseTypes";

export class FirebaseStorageService implements SessionInterface {
  private firebaseApp: FirebaseApp | null = null;
  private firestore: Firestore | null = null;
  private userId: string;
  private isConfigured: boolean = false;
  private configurationError: string | null = null;

  constructor() {
    // Generate a unique user ID for data isolation
    this.userId = this.generateUserId();
    console.log(
      `🆔 FirebaseStorageService created with userId: ${this.userId}`
    );
  }

  /**
   * Initialize Firebase connection
   */
  async initialize(): Promise<void> {
    console.log("🔧 FirebaseStorageService.initialize() called");

    if (this.isConfigured && this.firestore) {
      console.log("✅ Firebase already configured and initialized");
      return;
    }

    try {
      const config = await FirebaseConfigService.getConfig();
      console.log("✅ Retrieved Firebase config successfully");
      await this.initializeFirebase(config);
      this.isConfigured = true;
      this.configurationError = null;
      console.log("✅ Firebase initialization completed successfully");
    } catch (error) {
      console.error("❌ Firebase initialization failed:", error);
      this.isConfigured = false;

      if (error instanceof Error && error.message === "PASSWORD_REQUIRED") {
        console.log("🔐 Password required for Firebase config access");
        this.configurationError = "PASSWORD_REQUIRED";
        throw new Error("PASSWORD_REQUIRED");
      }

      this.configurationError =
        error instanceof Error ? error.message : String(error);
      console.error("💥 Critical Firebase initialization error:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new Error("Failed to initialize Firebase storage");
    }
  }

  /**
   * Initialize Firebase app and Firestore
   */
  private async initializeFirebase(config: UserFirebaseConfig): Promise<void> {
    console.log("🔧 initializeFirebase() called with config:", {
      projectId: config.projectId,
      hasApiKey: !!config.apiKey,
      authDomain: config.authDomain,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    });

    try {
      // Initialize Firebase app with unique name to avoid conflicts
      const appName = `tab-blaster-${this.userId}`;
      console.log(`🚀 Initializing Firebase app with name: ${appName}`);

      this.firebaseApp = initializeApp(config, appName);
      console.log("✅ Firebase app initialized");

      this.firestore = getFirestore(this.firebaseApp);
      console.log("✅ Firestore instance created");

      // Test the connection
      console.log("🧪 Testing Firestore connection...");
      const testRef = doc(this.firestore, "test", "connection");
      await getDoc(testRef);
      console.log("✅ Firestore connection test successful");

      console.log("🎉 Firebase initialized successfully!");
    } catch (error) {
      console.error("❌ Failed to initialize Firebase:", error);

      if (error instanceof Error) {
        console.error("Firebase initialization error details:", {
          name: error.name,
          message: error.message,
          code: (error as { code?: string }).code,
          stack: error.stack,
        });
      }

      // Clean up partial initialization
      this.firebaseApp = null;
      this.firestore = null;

      throw new Error(
        `Failed to connect to Firebase: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Check if Firebase is configured and ready to use
   */
  isReady(): boolean {
    return this.isConfigured && !!this.firestore;
  }

  /**
   * Get the current configuration error if any
   */
  getConfigurationError(): string | null {
    return this.configurationError;
  }

  /**
   * Test Firebase connection with given configuration
   * @param config Firebase configuration to test
   */
  async testConnection(config: UserFirebaseConfig): Promise<void> {
    console.log("Testing Firebase connection...");
    await this.initializeFirebase(config);

    // Try to access Firestore to ensure connection works
    const testRef = collection(this.firestore!, "test");
    await getDocs(testRef);
    console.log("Firebase connection test successful");
  }

  /**
   * Ensure Firebase is initialized - with graceful fallback
   */
  private async ensureInitialized(): Promise<void> {
    console.log(
      `🔍 ensureInitialized() - configured: ${
        this.isConfigured
      }, firestore exists: ${!!this.firestore}`
    );

    if (!this.firestore || !this.isConfigured) {
      console.log("🔧 Firestore not initialized, calling initialize()");
      try {
        await this.initialize();
      } catch (error) {
        if (error instanceof Error && error.message === "PASSWORD_REQUIRED") {
          console.log(
            "🔐 Password required - Firebase operations will prompt for password"
          );
          throw error; // Let the calling code handle password prompt
        } else {
          console.error("❌ Critical Firebase error, cannot proceed:", error);
          throw error;
        }
      }
    } else {
      console.log("✅ Firestore already initialized");
    }
  }

  /**
   * Fetch all sessions from Firestore
   */
  async fetchSessions(): Promise<Session[]> {
    console.log(
      "FirebaseStorageService.fetchSessions() called for userId:",
      this.userId
    );

    await this.ensureInitialized();

    try {
      const sessionsRef = collection(
        this.firestore!,
        "users",
        this.userId,
        "sessions"
      );
      const q = query(sessionsRef, orderBy("createdAt", "desc"));

      console.log(
        "Querying Firestore collection:",
        `users/${this.userId}/sessions`
      );
      const querySnapshot = await getDocs(q);
      console.log("Query completed. Document count:", querySnapshot.size);

      const sessions: Session[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Found session document:", { id: doc.id, data });
        sessions.push({
          id: doc.id,
          name: data.name,
          tabs: data.tabs,
          createdAt: data.createdAt,
          lastModified: data.lastModified,
          description: data.description,
        });
      });

      console.log(`✅ Fetched ${sessions.length} sessions from Firebase`);
      return sessions;
    } catch (error) {
      console.error("❌ Failed to fetch sessions from Firebase:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      throw new Error("Failed to fetch sessions");
    }
  }

  /**
   * Store a session in Firestore
   */
  async storeSession(session: Session): Promise<void> {
    console.log("FirebaseStorageService.storeSession() called with:", {
      sessionId: session.id,
      sessionName: session.name,
      tabCount: session.tabs?.length || 0,
      userId: this.userId,
    });

    await this.ensureInitialized();

    try {
      const sessionRef = doc(
        this.firestore!,
        "users",
        this.userId,
        "sessions",
        session.id
      );

      const sessionData = {
        name: session.name,
        tabs: session.tabs,
        createdAt: session.createdAt,
        lastModified: session.lastModified,
        description: session.description || "",
      };

      console.log("Attempting to store session data to Firestore:", {
        path: `users/${this.userId}/sessions/${session.id}`,
        data: sessionData,
      });

      const result = await setDoc(sessionRef, sessionData);
      console.log(
        `✅ Session ${session.id} stored successfully in Firebase!`,
        result
      );

      // Verify the data was actually stored
      const verification = await getDoc(sessionRef);
      if (verification.exists()) {
        console.log(
          "✅ Verification: Session data exists in Firestore:",
          verification.data()
        );
      } else {
        console.error(
          "❌ Verification failed: Session data not found in Firestore after storage!"
        );
      }
    } catch (error) {
      console.error("❌ Failed to store session in Firebase:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      throw new Error("Failed to store session");
    }
  }

  /**
   * Delete a session from Firestore
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.ensureInitialized();

    try {
      const sessionRef = doc(
        this.firestore!,
        "users",
        this.userId,
        "sessions",
        sessionId
      );
      await deleteDoc(sessionRef);

      console.log(`Session ${sessionId} deleted successfully`);
    } catch (error) {
      console.error("Failed to delete session from Firebase:", error);
      throw new Error("Failed to delete session");
    }
  }

  /**
   * Fetch a specific session by ID
   */
  async fetchSessionById(sessionId: string): Promise<Session | null> {
    await this.ensureInitialized();

    try {
      const sessionRef = doc(
        this.firestore!,
        "users",
        this.userId,
        "sessions",
        sessionId
      );
      const sessionDoc = await getDoc(sessionRef);

      if (sessionDoc.exists()) {
        const data = sessionDoc.data();
        return {
          id: sessionDoc.id,
          name: data.name,
          tabs: data.tabs,
          createdAt: data.createdAt,
          lastModified: data.lastModified,
          description: data.description,
        };
      }

      return null;
    } catch (error) {
      console.error("Failed to fetch session by ID from Firebase:", error);
      return null;
    }
  }

  /**
   * Get saved tabs from Firestore
   */
  async getSavedTabs(): Promise<SavedTab[]> {
    await this.ensureInitialized();

    try {
      const tabsRef = doc(
        this.firestore!,
        "users",
        this.userId,
        "data",
        "savedTabs"
      );
      const tabsDoc = await getDoc(tabsRef);

      if (tabsDoc.exists()) {
        const data = tabsDoc.data();
        return data.tabs || [];
      }

      return [];
    } catch (error) {
      console.error("Failed to get saved tabs from Firebase:", error);
      return [];
    }
  }

  /**
   * Save tabs to Firestore
   */
  async saveTabs(tabs: SavedTab[]): Promise<void> {
    await this.ensureInitialized();

    try {
      const tabsRef = doc(
        this.firestore!,
        "users",
        this.userId,
        "data",
        "savedTabs"
      );
      await setDoc(tabsRef, {
        tabs,
        updatedAt: Date.now(),
      });

      console.log("Tabs saved successfully");
    } catch (error) {
      console.error("Failed to save tabs to Firebase:", error);
      throw new Error("Failed to save tabs");
    }
  }

  /**
   * Get settings from Firestore
   */
  async getSettings<T>(defaultSettings: T): Promise<T> {
    await this.ensureInitialized();

    try {
      const settingsRef = doc(
        this.firestore!,
        "users",
        this.userId,
        "data",
        "settings"
      );
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        return { ...defaultSettings, ...data.settings };
      }

      return defaultSettings;
    } catch (error) {
      console.error("Failed to get settings from Firebase:", error);
      return defaultSettings;
    }
  }

  /**
   * Save settings to Firestore
   */
  async saveSettings<T>(settings: T): Promise<void> {
    await this.ensureInitialized();

    try {
      const settingsRef = doc(
        this.firestore!,
        "users",
        this.userId,
        "data",
        "settings"
      );
      await setDoc(settingsRef, {
        settings,
        updatedAt: Date.now(),
      });

      console.log("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings to Firebase:", error);
      throw new Error("Failed to save settings");
    }
  }

  /**
   * Check if Firebase needs password input
   */
  needsPassword(): boolean {
    return this.configurationError === "PASSWORD_REQUIRED";
  }

  /**
   * Get arbitrary data from Firestore
   */
  async get(key: string): Promise<Record<string, unknown>> {
    console.log(`🔍 FirebaseStorageService.get() called with key: ${key}`);

    try {
      await this.ensureInitialized();
    } catch (error) {
      if (error instanceof Error && error.message === "PASSWORD_REQUIRED") {
        console.log("🔐 Firebase password required for get operation");
        // Return empty data when password is required - UI should handle password prompt
        return { [key]: null };
      }
      throw error;
    }

    try {
      const dataRef = doc(this.firestore!, "users", this.userId, "data", key);
      console.log(
        `Fetching from Firestore path: users/${this.userId}/data/${key}`
      );

      const dataDoc = await getDoc(dataRef);

      if (dataDoc.exists()) {
        const data = dataDoc.data();
        console.log(`✅ Found data for key ${key}:`, data);

        // Return the data in the expected format for storage keys
        return { [key]: data.value };
      } else {
        console.log(`⚠️ No data found for key ${key}, returning empty object`);
        return { [key]: null };
      }
    } catch (error) {
      console.error(
        `❌ Failed to get data for key ${key} from Firebase:`,
        error
      );
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      return { [key]: null };
    }
  }

  /**
   * Set arbitrary data in Firestore
   */
  async set(data: Record<string, unknown>): Promise<void> {
    console.log(
      `💾 FirebaseStorageService.set() called with data:`,
      Object.keys(data)
    );

    try {
      await this.ensureInitialized();
    } catch (error) {
      if (error instanceof Error && error.message === "PASSWORD_REQUIRED") {
        console.log("🔐 Firebase password required for set operation");
        // Don't throw - let the UI handle password prompt
        throw new Error("PASSWORD_REQUIRED");
      }
      throw error;
    }

    try {
      const promises = Object.entries(data).map(async ([key, value]) => {
        const dataRef = doc(this.firestore!, "users", this.userId, "data", key);
        console.log(
          `Setting data for key ${key} at path: users/${this.userId}/data/${key}`
        );
        console.log(`Data being stored:`, {
          value,
          type: typeof value,
          length: Array.isArray(value) ? value.length : "N/A",
        });

        const firestoreData = { value, updatedAt: Date.now() };
        const result = await setDoc(dataRef, firestoreData);
        console.log(
          `✅ Firebase setDoc completed for key ${key}. Result:`,
          result
        );

        // Verify the data was stored
        const verification = await getDoc(dataRef);
        if (verification.exists()) {
          const verifiedData = verification.data();
          console.log(
            `✅ Verification: Data exists for key ${key}:`,
            verifiedData
          );
          console.log(
            `🔍 Data integrity check: Original=${JSON.stringify(
              value
            ).substring(0, 100)}... Stored=${JSON.stringify(
              verifiedData.value
            ).substring(0, 100)}...`
          );
        } else {
          console.error(
            `❌ Verification failed: Data not found for key ${key} after storage!`
          );
        }

        return result;
      });

      const results = await Promise.all(promises);
      console.log(`🎉 All Firebase storage operations completed successfully!`);
      console.log(`📊 Firebase response summary:`, {
        operationsCount: promises.length,
        results: results,
        timestamp: new Date().toISOString(),
        userId: this.userId,
      });
    } catch (error) {
      console.error("❌ Failed to set data in Firebase:", error);
      if (error instanceof Error) {
        console.error("Firebase set operation error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      throw new Error(
        `Failed to set data in Firebase: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Remove data from Firestore
   */
  async remove(keys: string[]): Promise<void> {
    await this.ensureInitialized();

    try {
      const promises = keys.map((key) => {
        const dataRef = doc(this.firestore!, "users", this.userId, "data", key);
        return deleteDoc(dataRef);
      });

      await Promise.all(promises);
      console.log("Data removed successfully");
    } catch (error) {
      console.error("Failed to remove data from Firebase:", error);
      throw new Error("Failed to remove data");
    }
  }

  /**
   * Generate a unique user ID for data isolation
   */
  private generateUserId(): string {
    // Try to get existing user ID from local storage
    const existingId = localStorage.getItem("firebase_user_id");
    if (existingId) {
      return existingId;
    }

    // Generate new unique ID
    const userId =
      "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("firebase_user_id", userId);
    return userId;
  }

  /**
   * Get current user ID
   */
  getUserId(): string {
    return this.userId;
  }

  /**
   * Clean up Firebase resources
   */
  destroy(): void {
    this.firebaseApp = null;
    this.firestore = null;
  }
}
