import React, { useState } from "react";
import { FirebaseConfigService } from "../../services/firebase/FirebaseConfigService";

interface FirebasePasswordPromptProps {
  onUnlocked: () => void;
  onCancel: () => void;
  isExpiringSoon?: boolean;
}

export const FirebasePasswordPrompt: React.FC<FirebasePasswordPromptProps> = ({
  onUnlocked,
  onCancel,
  isExpiringSoon = false,
}) => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await FirebaseConfigService.unlockWithPassword(password);
      onUnlocked();
    } catch (err) {
      console.error("Failed to unlock with password:", err);

      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (err instanceof Error) {
        if (err.message === "PASSWORD_EXPIRED") {
          setError(
            "Your password has expired. Please reconfigure Firebase storage."
          );
        } else {
          setError(`Invalid password. ${3 - newAttempts} attempts remaining.`);
        }
      } else {
        setError(`Invalid password. ${3 - newAttempts} attempts remaining.`);
      }

      // Lock out after 3 failed attempts
      if (newAttempts >= 3) {
        setError(
          "Too many failed attempts. Please reconfigure Firebase storage."
        );
        setTimeout(() => {
          onCancel();
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPromptMessage = () => {
    if (isExpiringSoon) {
      return {
        title: "🔔 Password Expiring Soon",
        message:
          "Your Firebase password will expire in less than 24 hours. Please re-enter it to extend access for another week.",
      };
    }

    return {
      title: "🔒 Enter Firebase Password",
      message:
        "Please enter your password to access Firebase storage. Your password expired for security.",
    };
  };

  const { title, message } = getPromptMessage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75" onClick={onCancel}></div>
      <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="firebase-password"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Firebase Password
            </label>
            <input
              id="firebase-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your Firebase password"
              autoFocus
              required
              disabled={isLoading || attempts >= 3}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-600/50 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 hover:text-white transition-all duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none"
              disabled={isLoading || !password || attempts >= 3}
            >
              {isLoading ? "Unlocking..." : "Unlock Firebase"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-slate-500">
            🛡️ For your security, Firebase access expires weekly and requires
            password re-entry.
          </p>

          {attempts >= 3 && (
            <p className="text-xs text-red-400">
              Too many failed attempts. You can reconfigure Firebase in
              Settings.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
