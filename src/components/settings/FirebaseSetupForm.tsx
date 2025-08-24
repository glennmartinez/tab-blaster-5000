import React, { useState } from "react";
import { UserFirebaseConfig } from "../../services/firebase/FirebaseTypes";
import { FirebaseConfigService } from "../../services/firebase/FirebaseConfigService";
import { FirebaseStorageService } from "../../services/firebase/FirebaseStorageService";
import { FirebaseAuthService } from "../../services/firebase/FirebaseAuthService";

interface FirebaseSetupFormProps {
  onConfigured: () => void;
  onCancel: () => void;
}

export const FirebaseSetupForm: React.FC<FirebaseSetupFormProps> = ({
  onConfigured,
  onCancel,
}) => {
  const [config, setConfig] = useState<UserFirebaseConfig>({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    userEmail: "",
    userPassword: "",
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testResult, setTestResult] = useState<string>("");
  const [authTestResult, setAuthTestResult] = useState<string>("");
  const [connectionVerified, setConnectionVerified] = useState(false);
  const [authVerified, setAuthVerified] = useState(false);

  const testConnection = async () => {
    if (!config.apiKey || !config.projectId) {
      setError(
        "Please fill in at least API Key and Project ID to test connection"
      );
      return;
    }

    setIsTesting(true);
    setTestResult("");
    setError("");

    try {
      console.log("Testing Firebase connection with config:", {
        ...config,
        apiKey: config.apiKey.substring(0, 10) + "...", // Don't log full API key
      });

      // Test basic Firebase connection without auth
      const tempConfig = {
        ...config,
        userEmail: "test@example.com", // Temporary for connection test
        userPassword: "testpass123",
      };

      // Create a temporary Firebase storage service to test the connection
      const tempService = new FirebaseStorageService();
      await tempService.testConnection(tempConfig);

      setTestResult(
        "✅ Firebase connection successful! Configuration is valid."
      );
      setConnectionVerified(true);
      setSuccess("Connection test passed - you can now test authentication");
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setTestResult(`❌ Connection failed: ${errorMessage}`);
      setError(
        "Connection test failed. Please check your Firebase configuration."
      );
      setConnectionVerified(false);
    } finally {
      setIsTesting(false);
    }
  };

  const testAuthentication = async () => {
    if (!config.userEmail || !config.userPassword) {
      setError(
        "Please enter both email and account password to test authentication"
      );
      return;
    }

    if (!connectionVerified) {
      setError("Please test and verify Firebase connection first");
      return;
    }

    setIsTestingAuth(true);
    setAuthTestResult("");
    setError("");

    try {
      // Initialize Firebase Auth with config
      await FirebaseAuthService.initialize(config);

      // Try to sign in with provided credentials
      const authResult = await FirebaseAuthService.signIn(
        config.userEmail,
        config.userPassword
      );

      setAuthTestResult(
        `✅ Authentication successful! Signed in as: ${authResult.email}`
      );
      setAuthVerified(true);
      setSuccess("Authentication verified - ready to save configuration");
    } catch (error: unknown) {
      console.error("Firebase authentication test failed:", error);

      // Handle specific auth errors
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code === "auth/user-not-found") {
        // Try to create the account
        try {
          const createResult = await FirebaseAuthService.createAccount(
            config.userEmail,
            config.userPassword
          );
          setAuthTestResult(
            `✅ New account created and authenticated! User: ${createResult.email}`
          );
          setAuthVerified(true);
          setSuccess("New account created - ready to save configuration");
        } catch (createError: unknown) {
          const createFirebaseError = createError as { message?: string };
          setAuthTestResult(
            `❌ Account creation failed: ${
              createFirebaseError.message || "Unknown error"
            }`
          );
          setError("Failed to create Firebase Auth account");
          setAuthVerified(false);
        }
      } else if (firebaseError.code === "auth/wrong-password") {
        setAuthTestResult(
          "❌ Authentication failed: Incorrect password for this email"
        );
        setError("The password is incorrect for this email address");
        setAuthVerified(false);
      } else if (firebaseError.code === "auth/invalid-email") {
        setAuthTestResult("❌ Authentication failed: Invalid email format");
        setError("Please enter a valid email address");
        setAuthVerified(false);
      } else {
        const errorMessage =
          firebaseError.message || "Unknown authentication error";
        setAuthTestResult(`❌ Authentication failed: ${errorMessage}`);
        setError("Authentication test failed");
        setAuthVerified(false);
      }
    } finally {
      setIsTestingAuth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that both tests have passed
    if (!connectionVerified) {
      setError("Please test and verify Firebase connection first");
      return;
    }

    if (!authVerified) {
      setError("Please test and verify Firebase authentication first");
      return;
    }

    // Validate required fields
    if (!config.userEmail || !config.userPassword) {
      setError("Email and account password are required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.userEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (config.userPassword.length < 6) {
      setError("Account password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Encryption passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Encryption password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("Saving Firebase configuration...", {
        ...config,
        apiKey: config.apiKey.substring(0, 10) + "...", // Don't log full API key
      });

      await FirebaseConfigService.storeConfig(config, password);
      console.log("✅ Firebase configuration saved successfully!");

      setSuccess("✅ Configuration saved successfully!");

      // Small delay to show success message
      setTimeout(() => {
        onConfigured();
      }, 1000);
    } catch (error) {
      console.error("❌ Failed to save Firebase configuration:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to save configuration: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = (field: keyof UserFirebaseConfig, value: string) => {
    setConfig((prev: UserFirebaseConfig) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-semibold text-white mb-2">
          Setup Firebase Storage
        </h3>
        <p className="text-slate-400 text-base leading-relaxed">
          Configure your Firebase project for secure cloud storage. Your data
          will be encrypted with your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="API Key *"
              value={config.apiKey}
              onChange={(e) => updateConfig("apiKey", e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Auth Domain (optional)"
              value={config.authDomain}
              onChange={(e) => updateConfig("authDomain", e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Project ID *"
              value={config.projectId}
              onChange={(e) => updateConfig("projectId", e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Storage Bucket (optional)"
              value={config.storageBucket}
              onChange={(e) => updateConfig("storageBucket", e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Messaging Sender ID (optional)"
              value={config.messagingSenderId}
              onChange={(e) =>
                updateConfig("messagingSenderId", e.target.value)
              }
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="App ID (optional)"
              value={config.appId}
              onChange={(e) => updateConfig("appId", e.target.value)}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* User Authentication Section */}
          <div className="border-t border-slate-700 pt-4 mt-6">
            <h4 className="text-lg font-medium text-white mb-3">
              User Authentication (for cross-browser sync)
            </h4>
            <div className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Your Email *"
                  value={config.userEmail}
                  onChange={(e) => updateConfig("userEmail", e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Account Password *"
                  value={config.userPassword}
                  onChange={(e) => updateConfig("userPassword", e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Encryption Section */}
          <div className="border-t border-slate-700 pt-4 mt-6">
            <h4 className="text-lg font-medium text-white mb-3">
              Local Encryption Password
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="password"
                placeholder="Encryption Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />

              <input
                type="password"
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-lg border font-medium ${
              testResult.includes("✅")
                ? "bg-green-900/30 border-green-600/50 text-green-400"
                : "bg-red-900/30 border-red-600/50 text-red-400"
            }`}
          >
            {testResult}
          </div>
        )}

        {authTestResult && (
          <div
            className={`p-3 rounded-lg border font-medium ${
              authTestResult.includes("✅")
                ? "bg-green-900/30 border-green-600/50 text-green-400"
                : "bg-red-900/30 border-red-600/50 text-red-400"
            }`}
          >
            {authTestResult}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-900/30 border border-red-600/50 text-red-400 font-medium">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-900/30 border border-green-600/50 text-green-400 font-medium">
            ✅ {success}
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-center pt-4">
          {/* Step 1: Test Connection */}
          <button
            type="button"
            onClick={testConnection}
            disabled={isTesting || !config.apiKey || !config.projectId}
            className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none ${
              connectionVerified
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isTesting
              ? "Testing..."
              : connectionVerified
              ? "✅ Connection Verified"
              : "1. Test Connection"}
          </button>

          {/* Step 2: Test Authentication */}
          <button
            type="button"
            onClick={testAuthentication}
            disabled={
              isTestingAuth ||
              !connectionVerified ||
              !config.userEmail ||
              !config.userPassword
            }
            className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none ${
              authVerified
                ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isTestingAuth
              ? "Authenticating..."
              : authVerified
              ? "✅ Auth Verified"
              : "2. Test Authentication"}
          </button>

          {/* Step 3: Save Configuration */}
          <button
            type="submit"
            disabled={isLoading || !connectionVerified || !authVerified}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {isLoading ? "Saving..." : "3. Save Configuration"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 hover:text-white transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
