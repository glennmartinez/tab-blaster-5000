import React, { useState, useEffect } from "react";
import Button from "./Button";
import { WindowInfo } from "../interfaces/TabInterface";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { BookmarkCheck } from "lucide-react";
import ParticleBackground from "./ParticleBackground";

// Define a proper interface for sessions matching the model
interface SavedSession {
  id: string;
  name: string;
  createdAt: string;
  lastModified: string;
  windows: WindowInfo[]; // Using WindowInfo from TabInterface.ts
}

const ExtensionPopup: React.FC = () => {
  const [tabCount, setTabCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const saveLocal = () => {
    console.log("Saving data using Chrome Storage API...");

    // Data to save
    const data = { key: "popit fool" };

    // Save using Chrome Storage API
    if (chrome?.storage) {
      chrome.storage.local
        .set({ poperino: data })
        .then(() => {
          console.log("Data saved successfully");

          // Optional: verify it was saved
          return chrome.storage.local.get(["poperino"]);
        })
        .then((result) => {
          console.log("Retrieved data:", result.poperino);
        })
        .catch((error) => {
          console.error("Error saving data:", error);
        });
    } else {
      // Fallback for when running in development outside extension context
      console.warn(
        "Chrome storage API not available, falling back to localStorage"
      );
      localStorage.setItem("poperino", JSON.stringify(data));
    }
  };

  const saveToActiveTabLocalStorage = () => {
    const randomeTime = Math.floor(Math.random() * 1000);
    console.log("Saving data to active tab's localStorage...");
    console.log("Random time:", randomeTime);
    localStorage.setItem("your-key", JSON.stringify(randomeTime));

    // Simple confirmation for the user
    console.log("Data saved to extension's localStorage");
  };

  useEffect(() => {
    // Count the number of open tabs
    if (chrome?.tabs) {
      chrome.tabs.query({}, (tabs) => {
        setTabCount(tabs.length);
      });
    }

    // Count saved sessions
    if (chrome?.storage) {
      chrome.storage.local.get([STORAGE_KEYS.SESSIONS], (result) => {
        const savedSessions = result.savedSessions || [];
        setSessionCount(savedSessions.length);
      });
    }

    // Show loading effect briefly
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const saveCurrentSession = () => {
    if (!chrome?.tabs || !chrome?.storage || !chrome?.runtime) {
      console.warn("Chrome APIs not available, cannot save session");
      alert("Cannot save session: Extension APIs unavailable");
      return;
    }

    console.log("Starting to save current session...");

    // Get tabs from current window
    chrome.tabs.query({ currentWindow: true }, (currentTabs) => {
      console.log(`Found ${currentTabs.length} tabs to save in current window`);

      // Create tabs array with required properties
      const formattedTabs = currentTabs.map((tab) => {
        return {
          id: tab.id || 0, // Ensuring id is a number, defaulting to 0 if undefined
          title: tab.title || "Untitled Tab",
          url: tab.url || "",
          favIconUrl: tab.favIconUrl || "",
          windowId: tab.windowId || 0,
          index: tab.index || 0,
        };
      });

      // Create window object
      const windowInfo: WindowInfo = {
        id: currentTabs.length > 0 ? currentTabs[0].windowId || 1 : 1,
        focused: true,
        tabs: formattedTabs,
      };

      // Create session object with metadata in the proper format
      const newSession: SavedSession = {
        id: `session_${Date.now()}`,
        name: `Session ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        windows: [windowInfo],
      };

      console.log("Created new session object:", newSession);

      // Get existing sessions from localStorage first (most reliable)
      let existingSessions: SavedSession[] = [];

      try {
        const localData = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        if (localData) {
          existingSessions = JSON.parse(localData) as SavedSession[];
          console.log(
            `Loaded ${existingSessions.length} existing sessions from localStorage`
          );
        }
      } catch (e) {
        console.warn(
          "Could not load from localStorage, falling back to chrome.storage",
          e
        );

        // Fall back to chrome.storage
        chrome.storage.local.get([STORAGE_KEYS.SESSIONS], (result) => {
          existingSessions = (result.savedSessions || []) as SavedSession[];
          console.log(
            `Loaded ${existingSessions.length} existing sessions from chrome.storage`
          );
          continueWithSave();
        });
        return; // Exit here since we'll continueWithSave after async chrome.storage call
      }

      // If we got here, we successfully loaded from localStorage
      continueWithSave();

      function continueWithSave() {
        // Add new session to the beginning of the array
        const updatedSessions: SavedSession[] = [
          newSession,
          ...existingSessions,
        ];

        // ALWAYS save to localStorage first (most reliable)
        try {
          localStorage.setItem(
            STORAGE_KEYS.SESSIONS,
            JSON.stringify(updatedSessions)
          );
          console.log("Saved sessions to localStorage");
        } catch (e) {
          console.warn("Could not save to localStorage:", e);
        }

        // Also save to chrome.storage for extension syncing
        chrome.storage.local.set({ savedSessions: updatedSessions }, () => {
          console.log("Successfully saved session to chrome.storage.local");

          // Update the session count
          setSessionCount(updatedSessions.length);

          // Get tab IDs that are in the current window
          const tabIdsInWindow = currentTabs
            .map((tab) => tab.id)
            .filter(
              (id): id is number =>
                id !== undefined && id !== chrome.tabs.TAB_ID_NONE
            );

          console.log("Tab IDs in current window:", tabIdsInWindow);

          try {
            // Send message to background script to handle tab operations
            chrome.runtime.sendMessage(
              {
                action: "saveAndCloseTabs",
                tabIds: tabIdsInWindow,
                tabManagerUrl: chrome.runtime.getURL(
                  "index.html?view=fullpage&view=sessions" // Add view=sessions parameter to specifically show sessions
                ),
              },
              (response) => {
                if (response) {
                  console.log("Background script response:", response);
                }
              }
            );

            const statusEl = document.getElementById("status");
            if (statusEl) {
              statusEl.textContent = "Session saved successfully!";
              setTimeout(() => {
                statusEl.textContent = "";
              }, 3000);
            }
          } catch (error) {
            console.error("Error sending message to background script:", error);
          }
        });
      }
    });
  };

  const launchTabManager = () => {
    // Open the full tab manager in a new tab
    const url = chrome.runtime.getURL("index.html?view=fullpage");
    chrome.tabs.create({ url });
  };

  return (
    <div className="extension-popup bg-gradient-to-br from-black to-slate-900 text-slate-100 p-6 flex flex-col relative">
      {/* Background particle effect */}
      <ParticleBackground />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-6 border-4 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-cyan-500 font-mono text-xs tracking-wider">
              SYSTEM INITIALIZING
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex items-center">
            <BookmarkCheck className="h-8 w-8 text-cyan-500 mr-2" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Tab Blaster 5000
            </span>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            Blast your tabs into the stratosphere!
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-cyan-500 mb-2">
              {tabCount}
            </div>
            <div className="text-sm text-slate-400 font-medium">Open Tabs</div>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              {sessionCount}
            </div>
            <div className="text-sm text-slate-400 font-medium">
              Saved Sessions
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={saveCurrentSession}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white w-full py-2.5 px-4 rounded-md flex items-center justify-center text-sm font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Save Current Session
          </Button>

          <Button
            onClick={launchTabManager}
            className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-700/80 text-slate-200 w-full py-2.5 px-4 rounded-md flex items-center justify-center text-sm font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
            Launch Tab Manager
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => saveLocal()}
              className="bg-rose-600/80 hover:bg-rose-700/80 text-white py-2.5 px-3 rounded-md flex items-center justify-center text-sm font-medium"
            >
              Test Storage
            </Button>

            <Button
              onClick={saveToActiveTabLocalStorage}
              className="bg-amber-600/80 hover:bg-amber-700/80 text-white py-2.5 px-3 rounded-md flex items-center justify-center text-sm font-medium"
            >
              Local Storage Test
            </Button>
          </div>
        </div>

        <div
          id="status"
          className="text-cyan-400 font-medium h-6 text-center mt-4 text-sm"
        ></div>

        <div className="mt-6 text-center">
          <div className="inline-block">
            <div className="text-xs font-medium bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Gmoney Labs.
            </div>
            <div className="text-xs text-slate-500 mt-1">v0.1.0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionPopup;
