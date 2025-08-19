import React, { useState, useEffect } from "react";
import { FirebaseConfigService } from "../../services/firebase/FirebaseConfigService";
import { SecurityPreferences } from "../../services/firebase/FirebaseTypes";

interface FirebaseStatusProps {
  onReconfigure: () => void;
  onDisable: () => void;
}

export const FirebaseStatus: React.FC<FirebaseStatusProps> = ({
  onReconfigure,
  onDisable,
}) => {
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [securityPrefs, setSecurityPrefs] =
    useState<SecurityPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    try {
      const [hasValidSession, expiringSoon, preferences] = await Promise.all([
        FirebaseConfigService.hasValidPasswordSession(),
        FirebaseConfigService.isPasswordExpiringSoon(),
        FirebaseConfigService.getSecurityPreferences(),
      ]);

      setIsPasswordValid(hasValidSession);
      setIsExpiringSoon(expiringSoon);
      setSecurityPrefs(preferences);
    } catch (error) {
      console.error("Failed to check Firebase status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = async () => {
    if (
      confirm(
        "Are you sure you want to clear the current Firebase session? You'll need to re-enter your password."
      )
    ) {
      try {
        await FirebaseConfigService.clearPasswordSession();
        setIsPasswordValid(false);
      } catch (error) {
        console.error("Failed to clear session:", error);
      }
    }
  };

  const handleDisableFirebase = async () => {
    if (
      confirm(
        "Are you sure you want to disable Firebase storage? This will clear all Firebase configuration and switch to local storage."
      )
    ) {
      try {
        await FirebaseConfigService.clearAllConfig();
        onDisable();
      } catch (error) {
        console.error("Failed to disable Firebase:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="firebase-status loading">
        <p>Loading Firebase status...</p>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (!isPasswordValid) return "🔒";
    if (isExpiringSoon) return "⚠️";
    return "✅";
  };

  const getStatusText = () => {
    if (!isPasswordValid) return "Locked - Password required";
    if (isExpiringSoon) return "Password expires soon";
    return "Active and secure";
  };

  const getStatusClass = () => {
    if (!isPasswordValid) return "status-locked";
    if (isExpiringSoon) return "status-warning";
    return "status-active";
  };

  return (
    <div className="firebase-status">
      <div className="status-header">
        <h4>🔥 Firebase Storage</h4>
        <div className={`status-indicator ${getStatusClass()}`}>
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{getStatusText()}</span>
        </div>
      </div>

      <div className="status-details">
        {securityPrefs && (
          <div className="security-settings">
            <h5>Security Settings</h5>
            <ul>
              <li>
                Password expires every {securityPrefs.passwordExpiryDays} days
              </li>
              <li>
                Password required for changes:{" "}
                {securityPrefs.requirePasswordForChanges ? "Yes" : "No"}
              </li>
              {securityPrefs.autoLockOnIdle && (
                <li>
                  Auto-lock after {securityPrefs.idleTimeoutMinutes} minutes of
                  inactivity
                </li>
              )}
            </ul>
          </div>
        )}

        {isPasswordValid && (
          <div className="active-session">
            <p>Firebase is connected and ready to sync your data.</p>
            {isExpiringSoon && (
              <div className="expiry-warning">
                <p>
                  <strong>⚠️ Password expires within 24 hours</strong>
                </p>
                <p>
                  You'll be prompted to re-enter your password soon for
                  continued access.
                </p>
              </div>
            )}
          </div>
        )}

        {!isPasswordValid && (
          <div className="locked-session">
            <p>
              Firebase is configured but locked. Enter your password to unlock
              access.
            </p>
          </div>
        )}
      </div>

      <div className="status-actions">
        {isPasswordValid && (
          <button onClick={handleClearSession} className="secondary-button">
            Lock Session
          </button>
        )}

        <button onClick={onReconfigure} className="primary-button">
          Reconfigure
        </button>

        <button onClick={handleDisableFirebase} className="danger-button">
          Disable Firebase
        </button>
      </div>

      <div className="firebase-info">
        <details>
          <summary>About Firebase Security</summary>
          <div className="info-content">
            <p>
              <strong>Your data security:</strong>
            </p>
            <ul>
              <li>All data encrypted locally before sending to Firebase</li>
              <li>Password expires weekly to prevent unauthorized access</li>
              <li>Your Firebase project - you control the data</li>
              <li>Zero-knowledge architecture - we can't see your data</li>
            </ul>

            <p>
              <strong>What happens when password expires:</strong>
            </p>
            <ul>
              <li>You'll be prompted to re-enter your password</li>
              <li>No data is lost - just requires re-authentication</li>
              <li>Session extends for another week after successful unlock</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};
