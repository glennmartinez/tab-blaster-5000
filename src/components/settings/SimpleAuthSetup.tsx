import React, { useState, useEffect } from "react";
import { SimpleAuthService } from "../../services/SimpleAuthService";
import { ConfigService } from "../../config/environment";

interface SimpleAuthSetupProps {
  onConfigured: () => void;
  onCancel: () => void;
}

export const SimpleAuthSetup: React.FC<SimpleAuthSetupProps> = ({
  onConfigured,
  onCancel,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionVerified, setConnectionVerified] = useState(false);

  useEffect(() => {
    // Load current server URL from config
    const currentConfig = ConfigService.getConfig();
    console.log("[SIMPLE AUTH SETUP] Current Config is: ", currentConfig);
    setServerUrl(currentConfig.serverUrl);
  }, []);

  const testConnection = async () => {
    if (!serverUrl.trim()) {
      setError("Please enter a server URL");
      return;
    }

    setIsTestingConnection(true);
    setError("");
    setConnectionVerified(false);

    try {
      // Update config temporarily for testing
      await ConfigService.saveConfig({ serverUrl: serverUrl.trim() });

      // Test server connection
      const healthUrl = `${serverUrl.trim()}/health`;
      const response = await fetch(healthUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const result = await response.json();

      if (result.message && result.message.includes("healthy")) {
        setConnectionVerified(true);
        setSuccess(
          "✅ Server connection successful! You can now test authentication."
        );
      } else {
        throw new Error("Invalid server response");
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(`❌ Connection failed: ${errorMessage}`);
      setConnectionVerified(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testAuthentication = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (!connectionVerified) {
      setError("Please test server connection first");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const authService = SimpleAuthService.getInstance();
      const user = await authService.login(email, password);

      setSuccess(`✅ Authentication successful! Logged in as: ${user.email}`);

      // Wait a moment to show success message
      setTimeout(() => {
        onConfigured();
      }, 1500);
    } catch (error) {
      console.error("Authentication test failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed";
      setError(`❌ Authentication failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await testAuthentication();
  };

  const handleServerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerUrl(e.target.value);
    setConnectionVerified(false);
    setError("");
    setSuccess("");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-white mb-2">
          Setup User Authentication
        </h3>
        <p className="text-slate-400 text-base leading-relaxed">
          Configure your authentication server and login credentials for secure
          cloud sync.
        </p>
      </div>

      {/* Server Configuration */}
      <div className="space-y-4 mb-6">
        <div className="border-b border-slate-700 pb-4">
          <h4 className="text-lg font-medium text-white mb-3">
            Server Configuration
          </h4>
          <div className="space-y-4">
            <div>
              <input
                type="url"
                placeholder="Server URL (e.g., http://localhost:8080)"
                value={serverUrl}
                onChange={handleServerUrlChange}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <button
              type="button"
              onClick={testConnection}
              disabled={isTestingConnection || !serverUrl.trim()}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center justify-center"
            >
              {isTestingConnection ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Testing Connection...
                </>
              ) : (
                "Test Server Connection"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Authentication Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border-b border-slate-700 pb-4">
          <h4 className="text-lg font-medium text-white mb-3">
            User Authentication
          </h4>
          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Your Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Account Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading || !connectionVerified || !email || !password}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5"
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
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Authenticating...
              </>
            ) : (
              "Login & Save Configuration"
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
        <p className="text-slate-300 text-sm">
          <strong>Note:</strong> This will connect to your Go server for
          authentication. Make sure your server is running and accessible at the
          specified URL.
        </p>
      </div>
    </div>
  );
};
