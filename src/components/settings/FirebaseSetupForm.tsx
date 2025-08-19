import React, { useState } from "react";
import { UserFirebaseConfig } from "../../services/firebase/FirebaseTypes";
import { FirebaseConfigService } from "../../services/firebase/FirebaseConfigService";
import { FirebaseStorageService } from "../../services/firebase/FirebaseStorageService";

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
  });

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testResult, setTestResult] = useState<string>("");

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

      // Create a temporary Firebase storage service to test the connection
      const tempService = new FirebaseStorageService();
      await tempService.testConnection(config);

      setTestResult(
        "✅ Connection successful! Firebase configuration is valid."
      );
      setSuccess("Connection test passed");
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setTestResult(`❌ Connection failed: ${errorMessage}`);
      setError("Connection test failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
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
          <button
            type="button"
            onClick={testConnection}
            disabled={isTesting || !config.apiKey || !config.projectId}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {isTesting ? "Testing..." : "Test Connection"}
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {isLoading ? "Saving..." : "Save Configuration"}
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
