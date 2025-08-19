import React, { useState, useEffect } from "react";
import { StorageProvider, StorageService } from "../../services/StorageService";
import { StorageFactory, StorageType } from "../../services/StorageFactory";
import { FirebaseConfigService } from "../../services/firebase/FirebaseConfigService";
import { FirebaseSetupForm } from "./FirebaseSetupForm";
import { FirebasePasswordPrompt } from "./FirebasePasswordPrompt";
import { STORAGE_KEYS } from "../../constants/storageKeys";

// Define the settings type - extend to include firebase
// interface Settings {
//   storageProvider?: StorageProvider | "firebase";
//   [key: string]: unknown;
// }

interface StorageSettingsProps {
  onStorageChange?: (provider: StorageProvider) => void;
}

const StorageSettings: React.FC<StorageSettingsProps> = ({
  onStorageChange,
}) => {
  const [storageProvider, setStorageProvider] = useState<
    StorageProvider | "firebase"
  >("local");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Firebase-specific states
  const [showFirebaseSetup, setShowFirebaseSetup] = useState(false);
  const [showFirebasePassword, setShowFirebasePassword] = useState(false);
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);

  // Load current storage provider on mount
  useEffect(() => {
    // Get the current storage provider from local storage or default to 'local'
    const loadStorageProvider = async () => {
      try {
        // First, initialize the storage factory to get the current preferred type
        const currentType = StorageFactory.getPreferredStorageType();
        console.log("Current preferred storage type:", currentType);

        // Map StorageType back to our UI state
        let provider: StorageProvider | "firebase" = "local";
        switch (currentType) {
          case StorageType.CHROME_STORAGE:
            provider = "chrome";
            break;
          case StorageType.DRIVE:
            provider = "drive";
            break;
          case StorageType.FIREBASE:
            provider = "firebase";
            break;
          case StorageType.LOCAL_STORAGE:
          default:
            provider = "local";
            break;
        }

        console.log("Setting storage provider to:", provider);
        setStorageProvider(provider);

        // Ensure the StorageFactory is using the correct type
        if (provider === "firebase") {
          console.log("Initializing Firebase storage");
          StorageFactory.setPreferredStorageType(StorageType.FIREBASE);
          checkFirebaseConfig();
        } else {
          // For non-firebase providers, also set the old StorageService
          StorageService.setStorageProvider(provider as StorageProvider);
        }
      } catch (error) {
        console.error("Error loading storage provider setting:", error);
      }
    };

    loadStorageProvider();
  }, []);

  // Check Firebase configuration
  const checkFirebaseConfig = async () => {
    try {
      const hasConfig = await FirebaseConfigService.hasValidConfig();
      console.log("Firebase config check:", { hasConfig });
      setFirebaseConfigured(hasConfig);

      if (hasConfig) {
        // Firebase is configured, make sure StorageFactory is set
        StorageFactory.setPreferredStorageType(StorageType.FIREBASE);

        // Check if password session is valid
        const hasValidSession =
          await FirebaseConfigService.hasValidPasswordSession();
        console.log("Firebase session check:", { hasValidSession });

        if (!hasValidSession) {
          setShowFirebasePassword(true);
        }
      }
    } catch (error) {
      console.error("Failed to check Firebase config:", error);
      setFirebaseConfigured(false);
    }
  };

  // Handle Firebase configuration complete
  const handleFirebaseConfigured = () => {
    setShowFirebaseSetup(false);
    setFirebaseConfigured(true);
    setStorageProvider("firebase");

    // Update StorageFactory
    StorageFactory.setPreferredStorageType(StorageType.FIREBASE);

    // Save to settings using the same method as other providers
    saveProviderToSettings("firebase");

    if (onStorageChange) {
      onStorageChange("firebase" as StorageProvider);
    }
  };

  // Handle Firebase password unlock
  const handleFirebaseUnlocked = () => {
    setShowFirebasePassword(false);
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

  // Check Google Drive authentication status when provider is 'drive'
  useEffect(() => {
    if (storageProvider === "drive") {
      checkDriveAuth();
    }
  }, [storageProvider]);

  const checkDriveAuth = async () => {
    setIsLoading(true);
    setAuthError(null);

    try {
      if (!chrome?.identity) {
        throw new Error("Chrome identity API not available");
      }

      // Try to get token non-interactively first
      chrome.identity.getAuthToken({ interactive: false }, (token) => {
        setIsLoading(false);

        if (chrome.runtime.lastError) {
          console.log("Not authenticated:", chrome.runtime.lastError);
          setIsAuthenticated(false);
          return;
        }

        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      });
    } catch (error) {
      setIsLoading(false);
      setIsAuthenticated(false);
      console.error("Error checking authentication:", error);
    }
  };

  const authenticateWithGoogle = () => {
    setIsLoading(true);
    setAuthError(null);

    try {
      if (!chrome?.identity) {
        throw new Error("Chrome identity API not available");
      }

      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        setIsLoading(false);

        if (chrome.runtime.lastError) {
          console.error("Authentication error:", chrome.runtime.lastError);
          setAuthError(
            chrome.runtime.lastError.message || "Authentication failed"
          );
          setIsAuthenticated(false);
          return;
        }

        if (token) {
          setIsAuthenticated(true);
          console.log("Successfully authenticated with Google");
        } else {
          setAuthError("No token received");
          setIsAuthenticated(false);
        }
      });
    } catch (error) {
      setIsLoading(false);
      setIsAuthenticated(false);
      setAuthError(error instanceof Error ? error.message : "Unknown error");
      console.error("Error authenticating:", error);
    }
  };

  const signOut = () => {
    if (!chrome?.identity) {
      console.error("Chrome identity API not available");
      return;
    }

    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      // Revoke the token
      chrome.identity.removeCachedAuthToken({ token: token as string }, () => {
        // Clear Google's token cache
        const revokeUrl = `https://accounts.google.com/o/oauth2/revoke?token=${token}`;
        fetch(revokeUrl)
          .then(() => {
            console.log("Token revoked successfully");
            setIsAuthenticated(false);
          })
          .catch((err) => {
            console.error("Error revoking token:", err);
          });
      });
    });
  };

  const handleStorageChange = async (
    provider: StorageProvider | "firebase"
  ) => {
    // Handle Firebase selection
    if (provider === "firebase") {
      const hasConfig = await FirebaseConfigService.hasValidConfig();

      if (!hasConfig) {
        // Show Firebase setup form
        setShowFirebaseSetup(true);
        return;
      }

      // Check if password is needed
      const hasValidSession =
        await FirebaseConfigService.hasValidPasswordSession();
      if (!hasValidSession) {
        setShowFirebasePassword(true);
        setStorageProvider(provider);
        return;
      }

      // Firebase is ready
      StorageFactory.setPreferredStorageType(StorageType.FIREBASE);
    } else {
      // Handle regular providers
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
            <span className="ml-2 text-gray-200">Extension localStorage</span>
          </label>
          <p className="text-xs text-gray-400 ml-6 mb-2">
            Sessions saved using browser localStorage API within extension
            context.
            <span className="text-red-400">
              Data will be lost when extension is removed.
            </span>
          </p>

          <label className="inline-flex items-center mb-2">
            <input
              type="radio"
              className="form-radio h-4 w-4 text-blue-600"
              name="storage-provider"
              value="chrome"
              checked={storageProvider === "chrome"}
              onChange={() => handleStorageChange("chrome")}
            />
            <span className="ml-2 text-gray-200">Chrome Extension Storage</span>
          </label>
          <p className="text-xs text-gray-400 ml-6 mb-2">
            Sessions saved using Chrome's extension storage API. Can sync across
            devices if enabled.
            <span className="text-red-400">
              Data will be lost when extension is removed.
            </span>
          </p>

          <label className="inline-flex items-center mb-2">
            <input
              type="radio"
              className="form-radio h-4 w-4 text-blue-600"
              name="storage-provider"
              value="drive"
              checked={storageProvider === "drive"}
              onChange={() => handleStorageChange("drive")}
            />
            <span className="ml-2 text-gray-200">Google Drive</span>
          </label>
          <p className="text-xs text-gray-400 ml-6 mb-3">
            Sessions saved to your Google Drive account.
            <span className="text-green-400">
              Data persists even if extension is removed.
            </span>
            Available across all devices and browsers.
          </p>

          <label className="inline-flex items-center mb-2">
            <input
              type="radio"
              className="form-radio h-4 w-4 text-orange-600"
              name="storage-provider"
              value="firebase"
              checked={storageProvider === "firebase"}
              onChange={() => handleStorageChange("firebase")}
            />
            <span className="ml-2 text-gray-200">Firebase (Your Own) 🔥</span>
          </label>
          <p className="text-xs text-gray-400 ml-6 mb-3">
            Use your own Firebase project for maximum security and control.
            <span className="text-blue-400">
              Encrypted locally, weekly password expiry.
            </span>
            Complete data sovereignty.
          </p>
        </div>

        {storageProvider === "drive" && (
          <div className="mt-4 p-3 bg-gray-850 rounded border border-gray-700">
            <h4 className="text-sm font-medium text-white mb-2">
              Google Drive Setup
            </h4>

            {isAuthenticated ? (
              <div>
                <div className="flex items-center text-green-500 mb-3">
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Connected to Google Drive</span>
                </div>

                <button
                  onClick={signOut}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-300 mb-3">
                  Connect your Google Drive account to store sessions in the
                  cloud.
                </p>

                <button
                  onClick={authenticateWithGoogle}
                  disabled={isLoading}
                  className={`px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>Connect to Google Drive</>
                  )}
                </button>

                {authError && (
                  <p className="text-xs text-red-500 mt-2">{authError}</p>
                )}
              </div>
            )}
          </div>
        )}

        {storageProvider === "firebase" && (
          <div className="mt-4 p-3 bg-gray-850 rounded border border-gray-700">
            <h4 className="text-sm font-medium text-white mb-2">
              Firebase Setup
            </h4>

            {firebaseConfigured ? (
              <div>
                <div className="flex items-center text-orange-500 mb-3">
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Firebase Configured</span>
                </div>

                <button
                  onClick={() => setShowFirebaseSetup(true)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded mr-2"
                >
                  Reconfigure
                </button>

                <button
                  onClick={() => {
                    FirebaseConfigService.clearAllConfig();
                    setFirebaseConfigured(false);
                    setStorageProvider("local");
                    handleStorageChange("local");
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-300 mb-3">
                  Set up your own Firebase project for secure cloud storage with
                  encryption.
                </p>

                <button
                  onClick={() => setShowFirebaseSetup(true)}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded flex items-center"
                >
                  Setup Firebase
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Firebase Setup Modal */}
      {showFirebaseSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <FirebaseSetupForm
              onConfigured={handleFirebaseConfigured}
              onCancel={() => setShowFirebaseSetup(false)}
            />
          </div>
        </div>
      )}

      {/* Firebase Password Modal */}
      {showFirebasePassword && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <FirebasePasswordPrompt
              onUnlocked={handleFirebaseUnlocked}
              onCancel={() => {
                setShowFirebasePassword(false);
                setStorageProvider("local");
                handleStorageChange("local");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StorageSettings;
