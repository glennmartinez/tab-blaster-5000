import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Tab, WindowInfo } from "../interfaces/TabInterface";
import MetricCard from "./MetricCard";
import { Cpu, HardDrive, Wifi } from "lucide-react";
import FallbackIcon from "./FallbackIcon";

interface WindowsPanelProps {
  windowGroups: WindowInfo[];
  cpuUsage: number;
  memoryUsage: number;
  networkStatus: number;
  expandedWindows: { [windowId: number]: boolean };
  onOpenTab: (tab: Tab) => void;
  onDeleteTab: (tab: Tab) => void;
  onSaveWindowAsSession: (windowId: number) => void;
  onToggleExpand: (windowId: number) => void;
}

const WindowsPanel: React.FC<WindowsPanelProps> = ({
  windowGroups,
  cpuUsage,
  memoryUsage,
  networkStatus,
  expandedWindows,
  onOpenTab,
  onDeleteTab,
  onSaveWindowAsSession,
  onToggleExpand,
}) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MetricCard
          title="CPU Usage"
          value={cpuUsage}
          icon={Cpu}
          trend="up"
          color="cyan"
          detail="System Performance"
        />
        <MetricCard
          title="Memory"
          value={memoryUsage}
          icon={HardDrive}
          trend="stable"
          color="purple"
          detail="RAM Usage"
        />
        <MetricCard
          title="Network"
          value={networkStatus}
          icon={Wifi}
          trend="down"
          color="blue"
          detail="Connectivity"
        />
      </div>

      <div className="space-y-4 pb-4">
        {windowGroups.map((window) => {
          const isExpanded = expandedWindows[window.id] || false;
          const tabsToShow = isExpanded
            ? window.tabs
            : window.tabs.slice(0, 10);
          return (
            <div
              key={window.id}
              className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-sm p-3 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      window.focused ? "bg-cyan-500" : "bg-slate-500"
                    } mr-2`}
                  ></div>
                  <span className="text-sm font-medium text-slate-300">
                    Window {window.id}
                  </span>
                  <span className="ml-2 bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs px-2 py-0.5 rounded-full">
                    {window.tabs.length} tabs
                  </span>
                </div>
                <button
                  className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-2 py-1 rounded"
                  onClick={() => onSaveWindowAsSession(window.id)}
                >
                  <Plus className="h-3 w-3 inline mr-1" /> Save Session
                </button>
              </div>

              <div className="divide-y divide-slate-700/30">
                {tabsToShow.map((tab) => (
                  <div
                    key={tab.id}
                    className="flex items-center p-3 hover:bg-slate-700/30 cursor-pointer group"
                    onClick={() => onOpenTab(tab)}
                  >
                    <div className="flex-shrink-0 mr-3 bg-slate-700/50 rounded-full p-1 border border-slate-600/50">
                      <FallbackIcon favIconUrl={tab.favIconUrl} size="md" />
                    </div>
                    <div className="flex-1 truncate">
                      <div className="text-sm text-slate-300 truncate group-hover:text-cyan-300">
                        {tab.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {tab.url}
                      </div>
                    </div>
                    <button
                      className="flex-shrink-0 p-1.5 text-slate-400 hover:text-red-400 rounded-full opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTab(tab);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {window.tabs.length > 10 && (
                  <div className="flex justify-center py-2 bg-slate-900/40">
                    <button
                      className="text-xs text-cyan-400 hover:underline focus:outline-none"
                      onClick={() => onToggleExpand(window.id)}
                    >
                      {isExpanded
                        ? "Collapse"
                        : `Expand (${window.tabs.length - 10} more)`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {windowGroups.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <div>No active windows or tabs found.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WindowsPanel;
