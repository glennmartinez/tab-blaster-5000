import React from "react";
import { Tab, SavedTab, WindowInfo } from "../interfaces/TabInterface";
import TabList from "./TabList";
import TabGroup from "./TabGroup";
import WindowGroup from "./WindowGroup";

interface PopupViewProps {
  loading: boolean;
  activeView: "active" | "saved";
  filteredTabs: (Tab | SavedTab)[];
  windowGroups?: WindowInfo[]; // Add the windowGroups property
  savedTabGroups: Record<string, SavedTab[]>;
  onSwitchTab: (tabId: number) => void;
  onCloseTab: (tabId: number) => void;
  onRestoreTab: (tab: SavedTab) => void;
  onRemoveSavedTab: (tab: SavedTab) => void;
}

const PopupView: React.FC<PopupViewProps> = ({
  loading,
  activeView,
  filteredTabs,
  windowGroups = [], // Default to empty array
  savedTabGroups,
  onSwitchTab,
  onCloseTab,
  onRestoreTab,
  onRemoveSavedTab,
}) => {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-900 p-4">
      {loading && activeView === "active" ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Active Tabs View */}
          {activeView === "active" && (
            <>
              {windowGroups.length > 0 ? (
                // Display tabs grouped by windows
                windowGroups.map((windowInfo) => (
                  <WindowGroup
                    key={windowInfo.id}
                    windowInfo={windowInfo}
                    onSwitchTab={onSwitchTab}
                    onCloseTab={onCloseTab}
                  />
                ))
              ) : (
                // Fallback to original flat list if window grouping isn't available
                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                  <div className="p-4 border-b border-gray-700">
                    <h2 className="text-lg font-medium text-blue-400">
                      Active Tabs
                    </h2>
                  </div>
                  <TabList
                    tabs={filteredTabs as Tab[]}
                    type="active"
                    onSwitchTab={onSwitchTab}
                    onCloseTab={onCloseTab}
                  />
                </div>
              )}
            </>
          )}
          {/* Saved Tabs View */}
          {activeView === "saved" && (
            <>
              {Object.keys(savedTabGroups).length > 0 ? (
                Object.entries(savedTabGroups).map(([dateStr, dateTabs]) => (
                  <TabGroup
                    key={dateStr}
                    date={dateStr}
                    tabs={dateTabs}
                    onRestoreTab={onRestoreTab}
                    onRemoveSavedTab={onRemoveSavedTab}
                  />
                ))
              ) : (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <p className="text-gray-400">No saved tabs found.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
};

export default PopupView;
