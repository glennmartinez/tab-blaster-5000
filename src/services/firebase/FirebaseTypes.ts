export interface UserFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface EncryptedFirebaseConfig {
  data: number[]; // Encrypted config bytes
  iv: number[]; // Initialization vector
  salt: number[]; // Random salt for this config
  timestamp: number; // When config was encrypted
  passwordExpiry: number; // When password expires (weekly)
}

export interface SecurityPreferences {
  passwordExpiryDays: number; // Default: 7 days
  requirePasswordForChanges: boolean;
  autoLockOnIdle: boolean;
  idleTimeoutMinutes?: number;
}

export interface PasswordSession {
  keyHash: string; // Hash of derived key for validation
  expiresAt: number; // When this session expires
  createdAt: number; // When session was created
}
