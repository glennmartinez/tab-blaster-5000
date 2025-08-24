import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from "firebase/auth";
import { UserFirebaseConfig, FirebaseAuthState } from "./FirebaseTypes";

export class FirebaseAuthService {
  private static app: FirebaseApp | null = null;
  private static auth: Auth | null = null;
  private static currentUser: User | null = null;
  private static authStateListeners: ((state: FirebaseAuthState) => void)[] =
    [];

  /**
   * Initialize Firebase Auth with config
   */
  static async initialize(config: UserFirebaseConfig): Promise<void> {
    try {
      console.log("🔐 Initializing Firebase Auth...");

      // Initialize Firebase app if not already done
      if (!this.app) {
        this.app = initializeApp(config, "tab-blaster-auth");
        this.auth = getAuth(this.app);

        // Set up auth state listener
        onAuthStateChanged(this.auth, (user) => {
          this.currentUser = user;
          const authState: FirebaseAuthState = {
            isAuthenticated: !!user,
            userId: user?.uid || null,
            email: user?.email || null,
            lastSignIn: user?.metadata.lastSignInTime
              ? new Date(user.metadata.lastSignInTime).getTime()
              : 0,
          };

          console.log("🔐 Auth state changed:", authState);
          this.notifyAuthStateListeners(authState);
        });
      }

      console.log("🔐 Firebase Auth initialized successfully");
    } catch (error) {
      console.error("🔐 Error initializing Firebase Auth:", error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(
    email: string,
    password: string
  ): Promise<FirebaseAuthState> {
    try {
      if (!this.auth) {
        throw new Error("Firebase Auth not initialized");
      }

      console.log("🔐 Signing in user:", email);
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const authState: FirebaseAuthState = {
        isAuthenticated: true,
        userId: userCredential.user.uid,
        email: userCredential.user.email,
        lastSignIn: Date.now(),
      };

      console.log("🔐 Sign in successful:", authState);
      return authState;
    } catch (error) {
      console.error("🔐 Sign in failed:", error);
      throw error;
    }
  }

  /**
   * Create new user account
   */
  static async createAccount(
    email: string,
    password: string
  ): Promise<FirebaseAuthState> {
    try {
      if (!this.auth) {
        throw new Error("Firebase Auth not initialized");
      }

      console.log("🔐 Creating new user account:", email);
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      const authState: FirebaseAuthState = {
        isAuthenticated: true,
        userId: userCredential.user.uid,
        email: userCredential.user.email,
        lastSignIn: Date.now(),
      };

      console.log("🔐 Account created successfully:", authState);
      return authState;
    } catch (error) {
      console.error("🔐 Account creation failed:", error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  static async signOut(): Promise<void> {
    try {
      if (!this.auth) {
        throw new Error("Firebase Auth not initialized");
      }

      console.log("🔐 Signing out user");
      await signOut(this.auth);
      this.currentUser = null;
      console.log("🔐 Sign out successful");
    } catch (error) {
      console.error("🔐 Sign out failed:", error);
      throw error;
    }
  }

  /**
   * Get current authentication state
   */
  static getCurrentAuthState(): FirebaseAuthState {
    return {
      isAuthenticated: !!this.currentUser,
      userId: this.currentUser?.uid || null,
      email: this.currentUser?.email || null,
      lastSignIn: this.currentUser?.metadata.lastSignInTime
        ? new Date(this.currentUser.metadata.lastSignInTime).getTime()
        : 0,
    };
  }

  /**
   * Get current user ID (for consistent data storage)
   */
  static getCurrentUserId(): string | null {
    return this.currentUser?.uid || null;
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  /**
   * Add auth state change listener
   */
  static addAuthStateListener(
    listener: (state: FirebaseAuthState) => void
  ): void {
    this.authStateListeners.push(listener);
  }

  /**
   * Remove auth state change listener
   */
  static removeAuthStateListener(
    listener: (state: FirebaseAuthState) => void
  ): void {
    const index = this.authStateListeners.indexOf(listener);
    if (index > -1) {
      this.authStateListeners.splice(index, 1);
    }
  }

  /**
   * Notify all auth state listeners
   */
  private static notifyAuthStateListeners(state: FirebaseAuthState): void {
    this.authStateListeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        console.error("🔐 Error in auth state listener:", error);
      }
    });
  }

  /**
   * Attempt automatic sign-in with stored credentials
   */
  static async attemptAutoSignIn(
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      await this.signIn(email, password);
      return true;
    } catch {
      console.log("🔐 Auto sign-in failed, will need manual authentication");
      return false;
    }
  }

  /**
   * Clean up resources
   */
  static cleanup(): void {
    this.authStateListeners = [];
    this.currentUser = null;
    this.auth = null;
    this.app = null;
  }
}
