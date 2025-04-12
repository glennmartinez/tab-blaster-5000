import React from "react";
import Button from "./Button";
import SearchBar from "./SearchBar";

interface HeaderProps {
  title: string;
  activeTabs: number;
  savedTabs: number;
  activeView: "active" | "sessions";
  setActiveView: (view: "active" | "sessions") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSidebarToggle: () => void;
  onGroupTabs?: () => void;
  onSaveAllTabs?: () => void;
  loadSavedSessions?: () => void; // Add this to ensure we can load sessions
}

const Header: React.FC<HeaderProps> = ({
  title,
  activeTabs,
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  onSidebarToggle,
  onGroupTabs,
  onSaveAllTabs,
}) => {
  // This ensures we load saved sessions when switching to views
  const handleViewChange = (view: "active" | "sessions") => {
    console.log(`Switching to ${view} view...`);
    setActiveView(view);
  };

  // Choose whether to show search bar based on view
  const showSearchBar = activeView !== "sessions";

  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="mr-4 text-gray-400 hover:text-white"
            onClick={onSidebarToggle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="text-2xl font-semibold text-blue-200">{title}</div>
        </div>
        <div className="flex gap-2">
          {activeView === "active" && (
            <>
              {onGroupTabs && (
                <Button
                  onClick={onGroupTabs}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm"
                >
                  Group Tabs
                </Button>
              )}
              {onSaveAllTabs && (
                <Button
                  onClick={onSaveAllTabs}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Save All Tabs
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex mt-4 space-x-2">
        {showSearchBar && (
          <div className="flex items-center mr-2">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        )}
        <div className="flex space-x-2">
          <Button
            onClick={() => handleViewChange("active")}
            className={
              activeView === "active"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 hover:bg-gray-600"
            }
          >
            Active Tabs ({activeTabs})
          </Button>

          <Button
            onClick={() => handleViewChange("sessions")}
            className={
              activeView === "sessions"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 hover:bg-gray-600"
            }
          >
            Sessions
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
