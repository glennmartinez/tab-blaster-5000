import React, { useEffect, useState } from "react";
import { Tab } from "../interfaces/TabInterface";
import FallbackIcon from "./FallbackIcon";

interface SavedSession {
  id: string;
  name: string;
  createdAt: string;
  tabs: Tab[];
}

const SessionsView: React.FC = () => {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("SessionsView mounted, loading saved sessions...");
    loadSavedSessions();
  }, []);

  const loadSavedSessions = () => {
    setLoading(true);
    console.log("Loading saved sessions lads...");

    // First try to get sessions from localStorage (our backup source)
    try {
      const backupData = localStorage.getItem("backup_savedSessions");
      console.log(
        "LOCAL STORAGE RAW DATA:",
        backupData ? backupData.substring(0, 50) + "..." : "null"
      );

      if (backupData) {
        try {
          const parsedSessions = JSON.parse(backupData);
          console.log("PARSED SESSIONS:", parsedSessions);

          if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
            console.log(
              `✅ SUCCESS: Loaded ${parsedSessions.length} sessions from localStorage`
            );
            setSavedSessions(parsedSessions);
            setLoading(false);

            // Also synchronize with chrome storage if available
            if (chrome?.storage) {
              chrome.storage.local.set(
                { savedSessions: parsedSessions },
                () => {
                  console.log(
                    "Synchronized localStorage sessions to chrome.storage"
                  );
                }
              );
            }
            return;
          } else {
            console.log("⚠️ localStorage data isn't a valid array or is empty");
          }
        } catch (parseError) {
          console.error(
            "❌ ERROR: Failed to parse localStorage data:",
            parseError
          );
        }
      } else {
        console.log("⚠️ No backup_savedSessions key found in localStorage");
      }
    } catch (e) {
      console.error("❌ ERROR: Failed to access localStorage:", e);
    }

    // If localStorage fails, try Chrome storage
    console.log("Falling back to chrome.storage...");
    if (chrome?.storage) {
      chrome.storage.local.get(["savedSessions"], (result) => {
        console.log("Chrome storage raw result:", result);

        if (
          result &&
          result.savedSessions &&
          Array.isArray(result.savedSessions)
        ) {
          console.log(
            `✅ SUCCESS: Loaded ${result.savedSessions.length} sessions from chrome.storage`
          );
          setSavedSessions(result.savedSessions);

          // Sync to localStorage for next time
          try {
            localStorage.setItem(
              "backup_savedSessions",
              JSON.stringify(result.savedSessions)
            );
            console.log("✅ Updated localStorage with chrome storage data");
          } catch (e) {
            console.error("❌ ERROR: Failed to update localStorage:", e);
          }
        } else {
          console.log("⚠️ No valid sessions found in chrome.storage");
          setSavedSessions([]);
        }
        setLoading(false);
      });
    } else {
      console.log("⚠️ Chrome storage API not available");
      setLoading(false);
      setSavedSessions([]); // Ensure we set empty array if both methods fail
    }
  };

  const debugStorage = () => {
    console.log("🔍 DEBUGGING STORAGE:");

    console.log("📌 CHECKING COMPONENT STATE:");
    console.log(
      `Current savedSessions state: ${savedSessions.length} sessions`
    );

    console.log("📌 CHECKING LOCALSTORAGE:");
    try {
      console.log("All localStorage keys:", Object.keys(localStorage));
      const backup = localStorage.getItem("backup_savedSessions");
      console.log(
        "backup_savedSessions raw data:",
        backup ? backup.substring(0, 100) + "..." : "null"
      );

      if (backup) {
        try {
          const parsed = JSON.parse(backup);
          console.log(`Sessions from localStorage: ${parsed.length} items`);
          console.log("First session (if available):", parsed[0]);
        } catch (e) {
          console.error("Failed to parse localStorage data:", e);
        }
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }

    console.log("📌 CHECKING CHROME.STORAGE:");
    if (chrome?.storage) {
      chrome.storage.local.get(null, (allData) => {
        console.log("All chrome.storage keys:", Object.keys(allData));
        console.log("Full chrome.storage data:", allData);
      });
    }

    // Testing localStorage write
    try {
      const testObj = { test: "test-" + Date.now() };
      localStorage.setItem("debug_test", JSON.stringify(testObj));
      const readBack = localStorage.getItem("debug_test");
      console.log(
        `localStorage write test: ${readBack ? "SUCCESS" : "FAILED"}`
      );
    } catch (e) {
      console.error("localStorage write test failed:", e);
    }
  };

  const openTab = (url: string) => {
    if (chrome?.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, "_blank");
    }
  };

  const deleteSession = (sessionId: string) => {
    const updatedSessions = savedSessions.filter(
      (session) => session.id !== sessionId
    );

    setSavedSessions(updatedSessions);

    // Always update localStorage first
    try {
      localStorage.setItem(
        "backup_savedSessions",
        JSON.stringify(updatedSessions)
      );
      console.log("Updated localStorage after deleting session");
    } catch (e) {
      console.warn("Could not update localStorage:", e);
    }

    // Then update chrome.storage if available
    if (chrome?.storage) {
      chrome.storage.local.set({ savedSessions: updatedSessions }, () => {
        console.log(`Session ${sessionId} deleted from chrome.storage`);
      });
    }
  };

  const restoreSession = (session: SavedSession) => {
    session.tabs.forEach((tab) => {
      if (tab.url) {
        openTab(tab.url);
      }
    });
  };

  const groupSessionsByDate = () => {
    const grouped: { [date: string]: SavedSession[] } = {};

    savedSessions.forEach((session) => {
      const date = new Date(session.createdAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });

    return grouped;
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Saved Sessions</h1>
          <p className="text-gray-400 text-sm mt-1">
            {savedSessions.length}{" "}
            {savedSessions.length === 1 ? "session" : "sessions"} found
          </p>
        </div>
        <div className="space-x-2">
          <button
            onClick={loadSavedSessions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Refresh
          </button>
          <button
            onClick={debugStorage}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
          >
            Debug Storage
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading sessions...</p>
        </div>
      ) : savedSessions.length === 0 ? (
        <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
          <p className="text-gray-300 mb-2">No saved sessions found</p>
          <p className="text-gray-400 text-sm mb-4">
            Save sessions from the extension popup to see them here.
          </p>
          <button
            onClick={debugStorage}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
          >
            Debug Storage
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupSessionsByDate()).map(([date, sessions]) => (
            <div key={date} className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-300 border-b border-gray-700 pb-2">
                {date}
              </h2>

              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-blue-400">
                      {session.name}
                    </h3>
                    <div className="space-x-2">
                      <button
                        onClick={() => restoreSession(session)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        title="Restore all tabs from this session"
                      >
                        Restore All
                      </button>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        title="Delete this session"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-3">
                    {new Date(session.createdAt).toLocaleString()} •{" "}
                    {session.tabs.length}{" "}
                    {session.tabs.length === 1 ? "tab" : "tabs"}
                  </div>

                  <div className="space-y-2 mt-3">
                    {session.tabs.map((tab, index) => (
                      <div
                        key={`${session.id}-${index}`}
                        className="flex items-center p-2 hover:bg-slate-700/30 rounded-md group"
                      >
                        <div className="flex-shrink-0 mr-2 bg-slate-700/50 rounded-full p-1 border border-slate-600/50">
                          <FallbackIcon favIconUrl={tab.favIconUrl} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-300 truncate">
                            {tab.title}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionsView;
