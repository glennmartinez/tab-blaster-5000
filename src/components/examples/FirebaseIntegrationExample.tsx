// Example: How to integrate Firebase storage into your existing app

import React, { useState, useEffect } from "react";
import { StorageFactory, StorageType } from "../../services/StorageFactory";
import { FirebaseConfigService } from "../../services/firebase/FirebaseConfigService";
import {
  FirebaseSetupForm,
  FirebasePasswordPrompt,
} from "../../components/settings";
import { EnhancedStorageSettings } from "../../components/settings/EnhancedStorageSettings";

import { Session } from "../../models/Session";

// Example component showing Firebase integration
export const ExampleFirebaseIntegration: React.FC = () => {
  const [needsFirebaseSetup, setNeedsFirebaseSetup] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    initializeStorage();
  }, []);

  const initializeStorage = async () => {
    try {
      // Check current storage type
      const currentType = StorageFactory.getCurrentStorageType();

      if (currentType === StorageType.FIREBASE) {
        // Check if Firebase is configured
        const hasConfig = await FirebaseConfigService.hasValidConfig();

        if (!hasConfig) {
          setNeedsFirebaseSetup(true);
          return;
        }

        // Check if password session is valid
        const hasValidSession =
          await FirebaseConfigService.hasValidPasswordSession();

        if (!hasValidSession) {
          setNeedsPassword(true);
          return;
        }
      }

      // Storage is ready
      setStorageReady(true);
    } catch (error) {
      console.error("Failed to initialize storage:", error);
      setError("Failed to initialize storage");
    }
  };

  const handleFirebaseSetup = () => {
    setNeedsFirebaseSetup(false);
    setStorageReady(true);
  };

  const handlePasswordUnlock = () => {
    setNeedsPassword(false);
    setStorageReady(true);
  };

  const handleCancel = () => {
    // Fall back to local storage
    StorageFactory.setPreferredStorageType(StorageType.LOCAL_STORAGE);
    setNeedsFirebaseSetup(false);
    setNeedsPassword(false);
    setStorageReady(true);
  };

  // Show Firebase setup if needed
  if (needsFirebaseSetup) {
    return (
      <FirebaseSetupForm
        onConfigured={handleFirebaseSetup}
        onCancel={handleCancel}
      />
    );
  }

  // Show password prompt if needed
  if (needsPassword) {
    return (
      <FirebasePasswordPrompt
        onUnlocked={handlePasswordUnlock}
        onCancel={handleCancel}
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="error-state">
        <h3>Storage Error</h3>
        <p>{error}</p>
        <button onClick={initializeStorage}>Retry</button>
      </div>
    );
  }

  // Show main app when storage is ready
  if (storageReady) {
    return (
      <div className="app-content">
        <h2>✅ Storage Ready!</h2>
        <p>Your app is now connected to storage and ready to use.</p>

        {/* This is where your main app content would go */}
        <ExampleAppContent />
      </div>
    );
  }

  // Loading state
  return (
    <div className="loading-state">
      <h3>Initializing Storage...</h3>
      <p>Setting up your storage connection.</p>
    </div>
  );
};

// Example of using the storage service
const ExampleAppContent: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const storageService = StorageFactory.getStorageService();
      const sessionData = await storageService.fetchSessions();
      setSessions(sessionData);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveExampleSession = async () => {
    try {
      const storageService = StorageFactory.getStorageService();
      const newSession = {
        id: Date.now().toString(),
        name: "Example Session",
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tabs: [],
      };

      await storageService.storeSession(newSession);
      await loadSessions(); // Refresh the list
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  };

  if (isLoading) {
    return <div>Loading sessions...</div>;
  }

  return (
    <div>
      <h3>Your Sessions ({sessions.length})</h3>

      <button onClick={saveExampleSession} className="create-session-btn">
        Create Example Session
      </button>

      <div className="sessions-list">
        {sessions.length === 0 ? (
          <p>No sessions yet. Create your first session!</p>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="session-item">
              <h4>{session.name}</h4>
              <p>Created: {new Date(session.createdAt).toLocaleDateString()}</p>
              <p>Tabs: {session.tabs?.length || 0}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Example settings page integration
export const ExampleSettingsPage: React.FC = () => {
  return (
    <div className="settings-page">
      <h2>Settings</h2>

      {/* Use the enhanced storage settings component */}
      <EnhancedStorageSettings />

      {/* Other settings sections would go here */}
    </div>
  );
};
