import React from "react";
import Button from "./Button";

interface SidebarProps {
  open: boolean;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  activeView: "active" | "sessions";
  setActiveView: (view: "active" | "sessions") => void;
  filters?: Array<{ id: string; name: string }>;
}

const Sidebar: React.FC<SidebarProps> = ({
  open,
  activeFilter,
  setActiveFilter,
  activeView,
  setActiveView,
  filters = [
    { id: "all", name: "All Tabs" },
    { id: "google", name: "Google" },
    { id: "github", name: "GitHub" },
  ],
}) => {
  return (
    <div
      className={`${
        open ? "w-64" : "w-0"
      } transition-width duration-300 bg-gray-800 border-r border-gray-700 overflow-hidden`}
    >
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-blue-400">
          Ultimate Tab Manager
        </h2>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-sm uppercase text-gray-400 mb-2">Navigation</h3>
        <div className="space-y-1">
          <button
            className={`w-full text-left px-3 py-2 rounded-md ${
              activeView === "active"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveView("active")}
          >
            Active Tabs
          </button>

          <button
            className={`w-full text-left px-3 py-2 rounded-md ${
              activeView === "sessions"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveView("sessions")}
          >
            Sessions
          </button>
        </div>
      </div>

      {/* Filters - Only show for active and saved views */}
      {activeView !== "sessions" && (
        <div className="p-4">
          <h3 className="text-sm uppercase text-gray-400 mb-2">Filters</h3>
          <div className="space-y-1">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  activeFilter === filter.id
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-700"
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeView !== "sessions" && (
        <div className="mt-6 p-4 border-t border-gray-700">
          <Button
            onClick={() => setActiveFilter("all")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
