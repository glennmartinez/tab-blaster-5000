import React from "react";

interface SidebarProps {
  activeView: "dashboard" | "tabs" | "sessions" | "settings";
}

/**
 * Sidebar navigation component
 */
const Sidebar: React.FC<SidebarProps> = ({ activeView }) => {
  const navigation = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
    },
    {
      id: "tabs",
      name: "Tabs",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      ),
    },
    {
      id: "sessions",
      name: "Sessions",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      ),
    },
    {
      id: "settings",
      name: "Settings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-16 md:w-64 h-full bg-slate-900 border-r border-slate-700">
      <div className="h-16 flex items-center justify-center md:justify-start px-4 border-b border-slate-700">
        <div className="flex-shrink-0 flex items-center">
          <img src="/icons/icon48.png" alt="Logo" className="h-8 w-8" />
          <span className="hidden md:block ml-2 text-xl font-bold text-white">
            Tab Manager
          </span>
        </div>
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = item.id === activeView;
          return (
            <a
              key={item.id}
              href="#"
              className={`
                ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }
                group flex items-center px-2 py-3 text-sm font-medium rounded-md transition-colors
              `}
              onClick={(e) => {
                e.preventDefault();
                // Handle navigation (can be implemented later)
              }}
            >
              <div className="flex items-center">
                <div
                  className={`
                  ${
                    isActive
                      ? "text-blue-400"
                      : "text-slate-400 group-hover:text-slate-300"
                  }
                  mr-3
                `}
                >
                  {item.icon}
                </div>
                <span className="hidden md:block">{item.name}</span>
              </div>
            </a>
          );
        })}
      </nav>

      <div className="flex-shrink-0 flex bg-slate-800/30 p-4 mb-4 mx-2 rounded-lg">
        <div className="flex items-center w-full">
          <div className="hidden md:flex flex-col">
            <div className="text-xs font-medium text-slate-300 truncate">
              Ultimate Tab Manager
            </div>
            <div className="text-xs text-slate-400">v1.0.0</div>
          </div>
          <div className="md:hidden flex items-center justify-center w-full">
            <div className="text-xs text-slate-400">v1.0</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
