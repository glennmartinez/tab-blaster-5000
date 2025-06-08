import React, { useState } from "react";
import { WindowInfo } from "../interfaces/TabInterface";
import TabList from "./TabList";
import Button from "./Button";
import { StorageFactory } from "../services/StorageFactory";
import { Session } from "../models/Session";

interface WindowGroupProps {
  windowInfo: WindowInfo;
  onSwitchTab: (tabId: number) => void;
  onCloseTab: (tabId: number) => void;
}

const WindowGroup: React.FC<WindowGroupProps> = ({
  windowInfo,
  onSwitchTab,
  onCloseTab,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [closeAfterSave, setCloseAfterSave] = useState(false);

  const saveWindowSession = async () => {
    setIsSaving(true);
    setSaveStatus("Saving session...");

    try {
      const newSession: Session = {
        id: `session_${Date.now()}_window_${windowInfo.id}`,
        name: `Window ${windowInfo.id} - ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        tabs: windowInfo.tabs.map((tab) => ({
          id: tab.id,
          title: tab.title || "Untitled Tab",
          url: tab.url || "",
          favIconUrl: tab.favIconUrl || "",
          windowId: windowInfo.id,
          index: 0,
        })),
      };

      const storageService = StorageFactory.getStorageService();
      await storageService.storeSession(newSession);

      console.log(
        `Successfully saved Window ${windowInfo.id} session to storage`
      );

      // If closeAfterSave is enabled, close the tabs
      if (closeAfterSave) {
        const tabIds = windowInfo.tabs
          .map((tab) => tab.id)
          .filter((id) => id !== undefined && id !== chrome.tabs.TAB_ID_NONE);

        // Close the tabs
        if (tabIds.length > 0 && chrome.tabs) {
          chrome.tabs.remove(tabIds);
        }
      }

      setIsSaving(false);
      setSaveStatus("Window saved!");

      setTimeout(() => {
        setSaveStatus("");
      }, 3000);
    } catch (error) {
      console.error("Error saving window session:", error);
      setIsSaving(false);
      setSaveStatus("Error saving session");

      setTimeout(() => {
        setSaveStatus("");
      }, 3000);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-6">
      <div className="p-4 border-b border-gray-700 bg-gray-750">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-lg font-medium text-blue-400">
              Window {windowInfo.id} {windowInfo.focused && "(Current)"}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              {windowInfo.tabs.length}{" "}
              {windowInfo.tabs.length === 1 ? "tab" : "tabs"}
            </div>
            <div className="flex items-center">
              <label className="flex items-center mr-2 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={closeAfterSave}
                  onChange={() => setCloseAfterSave(!closeAfterSave)}
                  className="mr-1"
                />
                Close tabs
              </label>
              <Button
                onClick={saveWindowSession}
                disabled={isSaving}
                className={`px-3 py-1 text-sm rounded ${
                  isSaving
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <div className="flex items-center">
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
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  {isSaving ? "Saving..." : "Save Window"}
                </div>
              </Button>
            </div>
          </div>
        </div>
        {saveStatus && (
          <div className="mt-2 text-sm text-green-400 text-right">
            {saveStatus}
          </div>
        )}
      </div>
      <TabList
        tabs={windowInfo.tabs}
        type="active"
        onSwitchTab={onSwitchTab}
        onCloseTab={onCloseTab}
      />
    </div>
  );
};

export default WindowGroup;
