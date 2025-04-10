import React, { useState, useEffect } from "react";
import Button from "./Button";

const ExtensionPopup: React.FC = () => {
  const [tabCount, setTabCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

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
      chrome.storage.local.get(["savedSessions"], (result) => {
        const savedSessions = result.savedSessions || [];
        setSessionCount(savedSessions.length);
      });
    }
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

      // Create session object with metadata
      const newSession = {
        id: `session_${Date.now()}`,
        name: `Session ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        tabs: currentTabs.map((tab) => {
          return {
            id: tab.id ? tab.id : null,
            title: tab.title || "Untitled Tab",
            url: tab.url || "",
            favIconUrl: tab.favIconUrl || "",
          };
        }),
      };

      console.log("Created new session object:", newSession);

      // Get existing sessions
      chrome.storage.local.get(["savedSessions"], (result) => {
        const existingSessions = result.savedSessions || [];
        console.log(
          `Retrieved ${existingSessions.length} existing sessions:`,
          existingSessions
        );

        // Add new session to the beginning of the array
        const updatedSessions = [newSession, ...existingSessions];

        // Add backup to localStorage as well (for redundancy)
        try {
          localStorage.setItem(
            "backup_savedSessions",
            JSON.stringify(updatedSessions)
          );
          console.log("Backup saved to localStorage");
        } catch (e) {
          console.warn("Could not save backup to localStorage:", e);
        }

        // Save updated sessions
        chrome.storage.local.set({ savedSessions: updatedSessions }, () => {
          console.log("Successfully saved session to chrome.storage.local");

          // Immediately verify the save worked
          chrome.storage.local.get(["savedSessions"], (verifyResult) => {
            console.log(
              "Verification - saved sessions count:",
              verifyResult.savedSessions?.length || 0
            );
          });

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
            // Use a try-catch block to handle potential errors with message sending
            chrome.runtime.sendMessage(
              {
                action: "saveAndCloseTabs",
                tabIds: tabIdsInWindow,
                tabManagerUrl: chrome.runtime.getURL(
                  "index.html?view=fullpage"
                ),
              },
              (response) => {
                // We may not get this response if popup closes, and that's OK
                if (response) {
                  console.log("Background script response:", response);
                }
              }
            );

            // Show success message to user
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
      });
    });
  };

  const launchTabManager = () => {
    // Open the full tab manager in a new tab
    const url = chrome.runtime.getURL("index.html?view=fullpage");
    chrome.tabs.create({ url });
  };

  return (
    <div className="extension-popup bg-gray-900 text-white p-6 flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Ultimate Tab Manager</h1>
        <p className="text-gray-400">Manage your browser tabs efficiently</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-4xl font-bold text-blue-500 mb-2">
            {tabCount}
          </div>
          <div className="text-sm text-gray-400">Open Tabs</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-4xl font-bold text-green-500 mb-2">
            {sessionCount}
          </div>
          <div className="text-sm text-gray-400">Saved Tabs</div>
        </div>
      </div>

      <div className="space-y-4">
        <Button
          onClick={saveCurrentSession}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 px-4 rounded-lg flex items-center justify-center text-lg"
        >
          <svg
            className="w-6 h-6 mr-2"
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
          className="bg-gray-700 hover:bg-gray-800 text-white w-full py-3 px-4 rounded-lg flex items-center justify-center text-lg"
        >
          <svg
            className="w-6 h-6 mr-2"
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

        <Button
          onClick={() => saveLocal()}
          className="bg-red-600 hover:bg-red-700 text-white w-full py-3 px-4 rounded-lg flex items-center justify-center text-lg"
        >
          test
        </Button>

        <Button
          onClick={saveToActiveTabLocalStorage}
          className="bg-yellow-600 hover:bg-yellow-700 text-white w-full py-3 px-4 rounded-lg flex items-center justify-center text-lg"
        >
          Save to Active Tab LocalStorage
        </Button>
      </div>

      <div
        id="status"
        className="text-green-500 h-6 text-center mt-4 text-lg"
      ></div>

      <div className="mt-auto text-center text-sm text-gray-500 pt-4">
        <p>Ultimate Tab Manager v0.1.0</p>
        <p className="text-xs mt-1">Manage your browsing efficiently</p>
      </div>
    </div>
  );
};

export default ExtensionPopup;
