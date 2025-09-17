import React, { useState, useEffect } from "react";
import { StorageProvider, StorageService } from "../../services/StorageService";
import {
  StorageFactory,
  StorageType,
} from "../../services/factories/StorageFactory";
import { SimpleAuthSetup } from "./SimpleAuthSetup";
import { SimpleAuthService } from "../../services/SimpleAuthService";
import { STORAGE_KEYS } from "../../constants/storageKeys";

interface StorageSettingsProps {
  onStorageChange?: (provider: StorageProvider) => void;
}

const StorageSettings: React.FC<StorageSettingsProps> = ({
  onStorageChange,
}) => {
  const [storageProvider, setStorageProvider] = useState<
    StorageProvider | "auth"
  >("local");

  // Simple Auth states
  const [showAuthSetup, setShowAuthSetup] = useState(false);
  const [authConfigured, setAuthConfigured] = useState(false);

  // Load current storage provider on mount
  useEffect(() => {
    // Get the current storage provider from local storage or default to 'local'
    const loadStorageProvider = async () => {
      try {
        // First, initialize the storage factory to get the current preferred type
        const currentType = StorageFactory.getPreferredStorageType();
        console.log("Current preferred storage type:", currentType);

        // Map StorageType back to our UI state
        let provider: StorageProvider | "auth" = "local";
        switch (currentType) {
          case StorageType.CHROME_STORAGE:
            provider = "chrome";
            break;
          case StorageType.SERVER:
            provider = "auth";
            break;
          case StorageType.LOCAL_STORAGE:
          default:
            provider = "local";
            break;
        }

        // Check if auth was previously selected
        const settings = await StorageService.get(STORAGE_KEYS.SETTINGS);
        const savedSettings = settings[STORAGE_KEYS.SETTINGS] as
          | { storageProvider?: string }
          | undefined;
        if (savedSettings?.storageProvider === "auth") {
          provider = "auth";
        }

        console.log("Setting storage provider to:", provider);
        setStorageProvider(provider);

        // Handle specific provider initialization
        if (provider === "auth") {
          await checkAuthStatus();
        } else {
          setAuthConfigured(false);
        }
      } catch (error) {
        console.error("Error loading storage provider setting:", error);
      }
    };

    loadStorageProvider();
  }, []);

  // Check Auth configuration
  const checkAuthStatus = async () => {
    try {
      const authService = SimpleAuthService.getInstance();
      const currentUser = await authService.getCurrentUser();
      console.log("Auth status check:", { currentUser });
      setAuthConfigured(!!currentUser);
    } catch (error) {
      console.error("Failed to check auth status:", error);
      setAuthConfigured(false);
    }
  };

  // Handle Simple Auth configuration complete
  const handleAuthConfigured = () => {
    setShowAuthSetup(false);
    setAuthConfigured(true);
    setStorageProvider("auth");

    // Use SERVER storage type for authenticated users
    StorageFactory.setPreferredStorageType(StorageType.SERVER);

    // Save to settings
    saveProviderToSettings("auth");

    // Note: Not calling onStorageChange for backwards compatibility
    // as it would interfere with the server storage setup
  };

  // Save provider to settings
  const saveProviderToSettings = async (provider: string) => {
    try {
      const settings = await StorageService.get(STORAGE_KEYS.SETTINGS);
      const updatedSettings = {
        ...(settings[STORAGE_KEYS.SETTINGS] || {}),
        storageProvider: provider,
      };
      await StorageService.set({ [STORAGE_KEYS.SETTINGS]: updatedSettings });
    } catch (error) {
      console.error("Error saving storage provider setting:", error);
    }
  };

  const handleStorageChange = async (provider: StorageProvider | "auth") => {
    // Handle Simple Auth selection
    if (provider === "auth") {
      // Check if user is already authenticated
      const authService = SimpleAuthService.getInstance();
      const currentUser = await authService.getCurrentUser();

      if (!currentUser) {
        // Show auth setup form
        setShowAuthSetup(true);
        return;
      }

      // Auth is ready, user is logged in - use SERVER storage
      setAuthConfigured(true);
      StorageFactory.setPreferredStorageType(StorageType.SERVER);
    }
    // Handle regular providers
    else {
      StorageService.setStorageProvider(provider);
    }

    setStorageProvider(provider);

    // Save the selection to settings
    await saveProviderToSettings(provider);

    if (onStorageChange) {
      onStorageChange(provider as StorageProvider);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Storage Options</h3>

      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="inline-flex items-center mb-2">
            <input
              type="radio"
              className="form-radio h-4 w-4 text-blue-600"
              name="storage-provider"
              value="local"
              checked={storageProvider === "local"}
              onChange={() => handleStorageChange("local")}
            />
            <span className="ml-2 text-gray-200">Local Storage 💾</span>
          </label>
          <p className="text-xs text-gray-400 ml-6 mb-3">
            Store data locally in your browser. Fast access, but data is tied to
            this browser only.
          </p>

          <label className="inline-flex items-center mb-2">
            <input
              type="radio"
              className="form-radio h-4 w-4 text-green-600"
              name="storage-provider"
              value="chrome"
              checked={storageProvider === "chrome"}
              onChange={() => handleStorageChange("chrome")}
            />
            <span className="ml-2 text-gray-200">Chrome Storage 🌐</span>
          </label>
          <p className="text-xs text-gray-400 ml-6 mb-3">
            Sync data across your Chrome browsers. Requires Chrome extension
            permissions.
          </p>

          <label className="inline-flex items-center mb-2">
            <input
              type="radio"
              className="form-radio h-4 w-4 text-purple-600"
              name="storage-provider"
              value="auth"
              checked={storageProvider === "auth"}
              onChange={() => handleStorageChange("auth")}
            />
            <span className="ml-2 text-gray-200">Server Storage 🚀</span>
          </label>
          <p className="text-xs text-gray-400 ml-6 mb-3">
            Store data on our secure server with user authentication.
            <span className="text-green-400">
              Enhanced performance and cross-device sync.
            </span>
            Professional grade storage.
          </p>
        </div>

        {storageProvider === "auth" && (
          <div className="p-4 bg-gray-700 rounded border">
            <h4 className="text-white font-medium mb-3">
              Server Authentication
            </h4>
            {!authConfigured ? (
              <div className="space-y-3">
                <div className="text-yellow-400 text-sm">
                  ⚠️ Authentication required for server storage
                </div>
                <button
                  onClick={() => setShowAuthSetup(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  Set Up Authentication
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-green-400 text-sm">
                  ✓ Server storage authenticated and ready
                </div>
                <div className="text-gray-400 text-xs">
                  Your data is securely stored on our server with optimized
                  collection structure for maximum performance.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simple Auth Setup Modal */}
      {showAuthSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <SimpleAuthSetup
              onConfigured={handleAuthConfigured}
              onCancel={() => setShowAuthSetup(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageSettings;
