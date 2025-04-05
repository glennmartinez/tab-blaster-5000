import React, { useState, useEffect } from "react";
import Button from "./Button";

const ExtensionPopup: React.FC = () => {
  const [tabCount, setTabCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    // Count the number of open tabs
    if (chrome?.tabs) {
      chrome.tabs.query({}, (tabs) => {
        setTabCount(tabs.length);
      });
    }

    // Count saved sessions
    if (chrome?.storage) {
      chrome.storage.local.get(["savedTabs"], (result) => {
        const savedTabs = result.savedTabs || [];
        setSessionCount(savedTabs.length);
      });
    }
  }, []);

  const saveCurrentSession = () => {
    if (chrome?.tabs && chrome?.storage) {
      // Get current tabs
      chrome.tabs.query({}, (currentTabs) => {
        // Save to storage
        chrome.storage.local.get(["savedTabs"], (result) => {
          const existingSavedTabs = result.savedTabs || [];
          const tabsToSave = currentTabs.map((tab) => ({
            id: tab.id,
            title: tab.title,
            url: tab.url,
            favIconUrl: tab.favIconUrl,
            savedAt: new Date().toISOString(),
          }));

          const updatedSavedTabs = [...existingSavedTabs, ...tabsToSave];
          chrome.storage.local.set(
            {
              savedTabs: updatedSavedTabs,
            },
            () => {
              // Show a success message
              const statusEl = document.getElementById("status");
              if (statusEl) {
                statusEl.textContent = "Session saved!";
                setTimeout(() => {
                  statusEl.textContent = "";
                }, 2000);
              }

              // Update the session count
              setSessionCount(updatedSavedTabs.length);
            }
          );
        });
      });
    }
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
