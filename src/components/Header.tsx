import React from "react";
import Button from "./Button";
import SearchBar from "./SearchBar";

interface HeaderProps {
  title: string;
  activeTabs: number;
  savedTabs: number;
  activeView: "active" | "saved";
  setActiveView: (view: "active" | "saved") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSidebarToggle: () => void;
  onGroupTabs?: () => void;
  onSaveAllTabs?: () => void;
}

const saveLocal = () => {
  // Logic to save local data
  console.log("Saving local data...");

  localStorage.setItem("localData", JSON.stringify({ key: "value" }));
};

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
}) => {
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
          <div className=" text-2xl font-semibold text-blue-200">{title}</div>
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
        <div className="flex items-center mr-2">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => setActiveView("active")}
            className={
              activeView === "active"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 hover:bg-gray-600"
            }
          >
            Active Tabs ({activeTabs})
          </Button>
          <Button
            onClick={() => setActiveView("saved")}
            className={
              activeView === "saved"
                ? "bg-blue-600 text-white"
                : "bg-gray-300 hover:bg-gray-600"
            }
          >
            Saved Tabs ({savedTabs})
          </Button>

          <Button
            onClick={() => saveLocal()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Local
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
