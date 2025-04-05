import React from "react";
import { SavedTab } from "../interfaces/TabInterface";
import TabList from "./TabList";

interface TabGroupProps {
  date: string;
  tabs: SavedTab[];
  onRestoreTab: (tab: SavedTab) => void;
  onRemoveSavedTab: (tab: SavedTab) => void;
}

const TabGroup: React.FC<TabGroupProps> = ({
  date,
  tabs,
  onRestoreTab,
  onRemoveSavedTab,
}) => {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg mb-6">
      <div className="p-4 border-b border-gray-700 bg-gray-750">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-lg font-medium text-blue-400">
            {formatDate(date)}
          </h2>
        </div>
      </div>

      <TabList
        tabs={tabs}
        type="saved"
        onRestoreTab={onRestoreTab}
        onRemoveSavedTab={onRemoveSavedTab}
      />
    </div>
  );
};

export default TabGroup;
