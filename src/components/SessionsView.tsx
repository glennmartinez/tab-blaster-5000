import React, { useEffect, useState } from "react";
import { Tab } from "../interfaces/TabInterface";
import FallbackIcon from "./FallbackIcon";
import { STORAGE_KEYS } from "../constants/storageKeys";
import StorageSettings from "./StorageSettings";
import { StorageProvider } from "../services/StorageService";

interface SavedSession {
  id: string;
  name: string;
  createdAt: string;
  tabs: Tab[];
}

const SessionsView: React.FC = () => {
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  useEffect(() => {
    console.log("SessionsView mounted, loading saved sessions...");
    loadSavedSessions();
  }, []);

  const loadSavedSessions = () => {
    setLoading(true);
    console.log("Loading saved sessions...");

    // Use Chrome storage only
    if (chrome?.storage) {
      chrome.storage.local.get([STORAGE_KEYS.SESSIONS], (result) => {
        console.log("Chrome storage raw result:", result);

        if (
          result &&
          result[STORAGE_KEYS.SESSIONS] &&
          Array.isArray(result[STORAGE_KEYS.SESSIONS])
        ) {
          console.log(
            `✅ SUCCESS: Loaded ${
              result[STORAGE_KEYS.SESSIONS].length
            } sessions from chrome.storage`
          );
          setSavedSessions(result[STORAGE_KEYS.SESSIONS]);
        } else {
          console.log("⚠️ No valid sessions found in chrome.storage");
          setSavedSessions([]);
        }
        setLoading(false);
      });
    } else {
      console.log("⚠️ Chrome storage API not available");
      setLoading(false);
      setSavedSessions([]); // Ensure we set empty array if method fails
    }
  };

  const debugStorage = () => {
    console.log("🔍 DEBUGGING STORAGE:");

    console.log("📌 CHECKING COMPONENT STATE:");
    console.log(
      `Current savedSessions state: ${savedSessions.length} sessions`
    );

    console.log("📌 CHECKING CHROME.STORAGE:");
    if (chrome?.storage) {
      chrome.storage.local.get(null, (allData) => {
        console.log("All chrome.storage keys:", Object.keys(allData));
        console.log("Full chrome.storage data:", allData);
      });
    } else {
      console.log("Chrome storage API not available");
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

    // Update chrome.storage
    if (chrome?.storage) {
      chrome.storage.local.set(
        { [STORAGE_KEYS.SESSIONS]: updatedSessions },
        () => {
          console.log(`Session ${sessionId} deleted from chrome.storage`);
        }
      );
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

  const handleStorageChange = (_provider: StorageProvider) => {
    // Reload sessions after storage provider change
    loadSavedSessions();
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Storage Settings
          </button>
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

      {showSettings && (
        <div className="mb-6">
          <StorageSettings onStorageChange={handleStorageChange} />
        </div>
      )}

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
