import React from "react";
import Button from "./Button";
import SearchBar from "./SearchBar";

interface HeaderProps {
  title: string;
  activeTabs: number;
  savedTabs: number;
  activeView: "active" | "saved" | "sessions";
  setActiveView: (view: "active" | "saved" | "sessions") => void;
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
  savedTabs,
  activeView,
  setActiveView,
  searchQuery,
  setSearchQuery,
  onSidebarToggle,
  onGroupTabs,
  onSaveAllTabs,
  loadSavedSessions,
}) => {
  // This ensures we load saved sessions when switching to views
  const handleViewChange = (view: "active" | "saved" | "sessions") => {
    console.log(`Switching to ${view} view...`);
    setActiveView(view);
    if (view === "saved" && loadSavedSessions) {
      console.log("Loading saved tabs...");
      loadSavedSessions();
    }
    // Sessions view loads its own data in its useEffect
  };

  const debugStorage = () => {
    console.log("DEBUGGING STORAGE:");
    // Check localStorage
    try {
      console.log("All localStorage keys:", Object.keys(localStorage));
      const backup = localStorage.getItem("backup_savedSessions");
      if (backup) {
        const parsed = JSON.parse(backup);
        console.log(`Found ${parsed.length} sessions in localStorage`);
      } else {
        console.log("No backup_savedSessions found in localStorage");
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
    // Check chrome.storage
    if (chrome?.storage) {
      chrome.storage.local.get(null, (allData) => {
        console.log("All chrome.storage keys:", Object.keys(allData));
      });
    } else {
      console.log("Chrome storage API not available");
    }
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
            onClick={() => handleViewChange("saved")}
            className={
              activeView === "saved"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 hover:bg-gray-600"
            }
          >
            Saved Tabs ({savedTabs})
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
          <Button
            onClick={debugStorage}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Debug
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
