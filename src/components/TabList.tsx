import React from "react";
import { Tab, SavedTab } from "../interfaces/TabInterface";

interface TabListProps {
  tabs: Tab[] | SavedTab[];
  onSwitchTab?: (tabId: number) => void;
  onCloseTab?: (tabId: number) => void;
  onRestoreTab?: (tab: SavedTab) => void;
  onRemoveSavedTab?: (tab: SavedTab) => void;
  type: "active" | "saved";
}

const TabList: React.FC<TabListProps> = ({
  tabs,
  onSwitchTab,
  onCloseTab,
  onRestoreTab,
  onRemoveSavedTab,
  type,
}) => {
  if (tabs.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">No {type} tabs found.</div>
    );
  }

  return (
    <ul className="divide-y divide-gray-700">
      {tabs.map((tab) => (
        <li key={tab.id} className="hover:bg-gray-700">
          <div
            className="flex items-center p-4 cursor-pointer"
            onClick={() => {
              if (type === "active" && onSwitchTab) {
                onSwitchTab(tab.id);
              } else if (type === "saved" && onRestoreTab) {
                onRestoreTab(tab as SavedTab);
              }
            }}
          >
            {tab.favIconUrl && (
              <img
                src={tab.favIconUrl}
                alt=""
                className="w-6 h-6 mr-3 rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tab.title}</p>
              <p className="text-xs text-gray-400 truncate">{tab.url}</p>
              {type === "saved" && "savedAt" in tab && (
                <p className="text-xs text-gray-500">
                  Saved:{" "}
                  {new Date((tab as SavedTab).savedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                className="p-1 rounded-full hover:bg-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  if (type === "active" && onCloseTab) {
                    onCloseTab(tab.id);
                  } else if (type === "saved" && onRemoveSavedTab) {
                    onRemoveSavedTab(tab as SavedTab);
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TabList;
