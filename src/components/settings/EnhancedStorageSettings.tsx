// Enhanced StorageSettings with Firebase support
// This demonstrates how to integrate Firebase into your existing settings

import React, { useState, useEffect } from "react";
import { StorageType, StorageFactory } from "../../services/StorageFactory";
import { FirebaseConfigService } from "../../services/firebase/FirebaseConfigService";
import {
  FirebaseSetupForm,
  FirebasePasswordPrompt,
  FirebaseStatus,
} from "./index";

export const EnhancedStorageSettings: React.FC = () => {
  const [currentStorageType, setCurrentStorageType] = useState<StorageType>(
    StorageType.LOCAL_STORAGE
  );
  const [showFirebaseSetup, setShowFirebaseSetup] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeSettings();
  }, []);

  const initializeSettings = async () => {
    try {
      // Get current storage type
      const currentType = StorageFactory.getCurrentStorageType();
      setCurrentStorageType(currentType);

      // Check if Firebase is configured
      if (currentType === StorageType.FIREBASE) {
        const hasConfig = await FirebaseConfigService.hasValidConfig();
        setFirebaseConfigured(hasConfig);

        // Check if password is needed
        const hasValidSession =
          await FirebaseConfigService.hasValidPasswordSession();
        if (hasConfig && !hasValidSession) {
          setShowPasswordPrompt(true);
        }
      }
    } catch (error) {
      console.error("Failed to initialize storage settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStorageTypeChange = async (newType: StorageType) => {
    if (newType === StorageType.FIREBASE) {
      // Check if Firebase is already configured
      const hasConfig = await FirebaseConfigService.hasValidConfig();

      if (!hasConfig) {
        setShowFirebaseSetup(true);
        return;
      }

      // Check if password is needed
      const hasValidSession =
        await FirebaseConfigService.hasValidPasswordSession();
      if (!hasValidSession) {
        setShowPasswordPrompt(true);
        return;
      }
    }

    // Set the storage type
    StorageFactory.setPreferredStorageType(newType);
    setCurrentStorageType(newType);
  };

  const handleFirebaseConfigured = () => {
    setShowFirebaseSetup(false);
    setFirebaseConfigured(true);
    setCurrentStorageType(StorageType.FIREBASE);
    StorageFactory.setPreferredStorageType(StorageType.FIREBASE);
  };

  const handleFirebaseUnlocked = () => {
    setShowPasswordPrompt(false);
    setCurrentStorageType(StorageType.FIREBASE);
    StorageFactory.setPreferredStorageType(StorageType.FIREBASE);
  };

  const handleFirebaseDisabled = () => {
    setFirebaseConfigured(false);
    setCurrentStorageType(StorageType.LOCAL_STORAGE);
    StorageFactory.setPreferredStorageType(StorageType.LOCAL_STORAGE);
  };

  if (isLoading) {
    return (
      <div className="storage-settings loading">
        Loading storage settings...
      </div>
    );
  }

  // Show Firebase setup form
  if (showFirebaseSetup) {
    return (
      <FirebaseSetupForm
        onConfigured={handleFirebaseConfigured}
        onCancel={() => setShowFirebaseSetup(false)}
      />
    );
  }

  // Show password prompt
  if (showPasswordPrompt) {
    return (
      <FirebasePasswordPrompt
        onUnlocked={handleFirebaseUnlocked}
        onCancel={() => {
          setShowPasswordPrompt(false);
          // Fall back to local storage if user cancels
          setCurrentStorageType(StorageType.LOCAL_STORAGE);
          StorageFactory.setPreferredStorageType(StorageType.LOCAL_STORAGE);
        }}
      />
    );
  }

  return (
    <div className="enhanced-storage-settings">
      <div className="settings-header">
        <h3>🗄️ Storage Settings</h3>
        <p className="description">
          Choose where to store your tabs, sessions, and settings.
        </p>
      </div>

      <div className="storage-options">
        {/* Local Storage Option */}
        <div className="storage-option">
          <label className="storage-option-label">
            <input
              type="radio"
              name="storage-type"
              value={StorageType.LOCAL_STORAGE}
              checked={currentStorageType === StorageType.LOCAL_STORAGE}
              onChange={() =>
                handleStorageTypeChange(StorageType.LOCAL_STORAGE)
              }
            />
            <div className="option-content">
              <div className="option-header">
                <span className="option-icon">💾</span>
                <span className="option-title">Local Storage</span>
                <span className="option-badge basic">Basic</span>
              </div>
              <p className="option-description">
                Data stored in your browser. Fast and private, but limited to
                this device.
              </p>
              <ul className="option-features">
                <li className="feature-item">✅ Fast access</li>
                <li className="feature-item">✅ No setup required</li>
                <li className="feature-item">❌ Device-specific only</li>
                <li className="feature-item">
                  ❌ Data lost if browser data cleared
                </li>
              </ul>
            </div>
          </label>
        </div>

        {/* Chrome Storage Option */}
        <div className="storage-option">
          <label className="storage-option-label">
            <input
              type="radio"
              name="storage-type"
              value={StorageType.CHROME_STORAGE}
              checked={currentStorageType === StorageType.CHROME_STORAGE}
              onChange={() =>
                handleStorageTypeChange(StorageType.CHROME_STORAGE)
              }
            />
            <div className="option-content">
              <div className="option-header">
                <span className="option-icon">🌐</span>
                <span className="option-title">Chrome Storage</span>
                <span className="option-badge standard">Standard</span>
              </div>
              <p className="option-description">
                Uses Chrome's extension storage. Can sync across devices with
                Chrome sync.
              </p>
              <ul className="option-features">
                <li className="feature-item">✅ Chrome sync support</li>
                <li className="feature-item">✅ Reliable storage</li>
                <li className="feature-item">❌ Chrome-specific only</li>
                <li className="feature-item">
                  ❌ Data lost if extension removed
                </li>
              </ul>
            </div>
          </label>
        </div>

        {/* Google Drive Option */}
        <div className="storage-option">
          <label className="storage-option-label">
            <input
              type="radio"
              name="storage-type"
              value={StorageType.DRIVE}
              checked={currentStorageType === StorageType.DRIVE}
              onChange={() => handleStorageTypeChange(StorageType.DRIVE)}
            />
            <div className="option-content">
              <div className="option-header">
                <span className="option-icon">📁</span>
                <span className="option-title">Google Drive</span>
                <span className="option-badge premium">Premium</span>
              </div>
              <p className="option-description">
                Store data in your Google Drive. Works across all devices and
                browsers.
              </p>
              <ul className="option-features">
                <li className="feature-item">✅ Universal device access</li>
                <li className="feature-item">✅ Persistent storage</li>
                <li className="feature-item">✅ Google account backup</li>
                <li className="feature-item">
                  ⚠️ Requires Google authentication
                </li>
              </ul>
            </div>
          </label>
        </div>

        {/* Firebase Option - NEW */}
        <div className="storage-option firebase-option">
          <label className="storage-option-label">
            <input
              type="radio"
              name="storage-type"
              value={StorageType.FIREBASE}
              checked={currentStorageType === StorageType.FIREBASE}
              onChange={() => handleStorageTypeChange(StorageType.FIREBASE)}
            />
            <div className="option-content">
              <div className="option-header">
                <span className="option-icon">🔥</span>
                <span className="option-title">Firebase (Your Own)</span>
                <span className="option-badge enterprise">Enterprise</span>
              </div>
              <p className="option-description">
                Use your own Firebase project for maximum control and security.
                Data encrypted locally.
              </p>
              <ul className="option-features">
                <li className="feature-item">✅ Your own Firebase project</li>
                <li className="feature-item">✅ End-to-end encryption</li>
                <li className="feature-item">✅ Complete data control</li>
                <li className="feature-item">✅ Scalable and reliable</li>
                <li className="feature-item">⚠️ Requires Firebase setup</li>
                <li className="feature-item">🔒 Weekly password expiry</li>
              </ul>
            </div>
          </label>
        </div>
      </div>

      {/* Firebase Status Section */}
      {currentStorageType === StorageType.FIREBASE && firebaseConfigured && (
        <div className="firebase-status-section">
          <FirebaseStatus
            onReconfigure={() => setShowFirebaseSetup(true)}
            onDisable={handleFirebaseDisabled}
          />
        </div>
      )}

      {/* Storage Type Info */}
      <div className="current-storage-info">
        <h4>Current Storage: {getStorageDisplayName(currentStorageType)}</h4>
        <p>{getStorageDescription(currentStorageType)}</p>

        {currentStorageType === StorageType.FIREBASE && !firebaseConfigured && (
          <div className="setup-prompt">
            <p>Firebase selected but not configured.</p>
            <button
              onClick={() => setShowFirebaseSetup(true)}
              className="setup-button"
            >
              Setup Firebase
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
function getStorageDisplayName(type: StorageType): string {
  switch (type) {
    case StorageType.LOCAL_STORAGE:
      return "Local Storage";
    case StorageType.CHROME_STORAGE:
      return "Chrome Storage";
    case StorageType.DRIVE:
      return "Google Drive";
    case StorageType.FIREBASE:
      return "Firebase";
    default:
      return "Unknown";
  }
}

function getStorageDescription(type: StorageType): string {
  switch (type) {
    case StorageType.LOCAL_STORAGE:
      return "Data is stored locally in your browser. Fast but device-specific.";
    case StorageType.CHROME_STORAGE:
      return "Data is stored using Chrome's extension storage with sync support.";
    case StorageType.DRIVE:
      return "Data is stored in your Google Drive account across all devices.";
    case StorageType.FIREBASE:
      return "Data is stored in your own Firebase project with end-to-end encryption.";
    default:
      return "";
  }
}
