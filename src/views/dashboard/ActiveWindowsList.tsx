import React from "react";
import { WindowInfo } from "../../interfaces/TabInterface";
import FallbackIcon from "../../components/FallbackIcon";

interface ActiveWindowsListProps {
  windows: WindowInfo[];
  loading: boolean;
  onTabClick?: (tabId: number) => void;
  onTabClose?: (tabId: number) => void;
}

/**
 * Component to display active windows and their tabs
 */
const ActiveWindowsList: React.FC<ActiveWindowsListProps> = ({
  windows,
  loading,
  onTabClick,
  onTabClose,
}) => {
  if (loading && windows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-blue-400">
          Loading windows and tabs...
        </div>
      </div>
    );
  }

  if (windows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400">
        No windows or tabs match your search.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-700/50">
      {windows.map((window) => (
        <div key={window.id} className="p-4">
          <div className="flex items-center mb-3">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                window.focused ? "bg-blue-500" : "bg-slate-500"
              }`}
            ></div>
            <h3 className="text-md font-medium text-slate-200">
              Window {window.id} {window.focused && "(Active)"}
            </h3>
            <span className="ml-2 text-xs text-slate-400">
              {window.tabs.length} tabs
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
            {window.tabs.map((tab) => (
              <div
                key={tab.id}
                className="flex items-start bg-slate-800/40 hover:bg-slate-800/60 rounded-md p-3 transition-colors cursor-pointer"
                onClick={() => onTabClick && onTabClick(tab.id)}
              >
                <div className="flex-shrink-0 w-6 h-6 mr-3">
                  {tab.favIconUrl ? (
                    <img
                      src={tab.favIconUrl}
                      alt=""
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const nextElement = target.nextElementSibling;
                        if (nextElement && nextElement instanceof HTMLElement) {
                          nextElement.style.display = "block";
                        }
                      }}
                    />
                  ) : (
                    <FallbackIcon favIconUrl={tab.url} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200 truncate">
                    {tab.title}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-1">
                    {tab.url}
                  </div>
                </div>
                {onTabClose && (
                  <button
                    className="ml-2 text-slate-400 hover:text-red-400 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTabClose(tab.id);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActiveWindowsList;
