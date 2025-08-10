import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Tab, WindowInfo } from "../../interfaces/TabInterface";
import { SystemMetricsWidget } from "../metrics";
import { TabItem } from "../tabs";

interface WindowsPanelProps {
  windowGroups: WindowInfo[];
  expandedWindows: { [windowId: number]: boolean };
  onOpenTab: (tab: Tab) => void;
  onDeleteTab: (tab: Tab) => void;
  onSaveWindowAsSession: (windowId: number) => Promise<void>;
  onToggleExpand: (windowId: number) => void;
}

const WindowsPanel: React.FC<WindowsPanelProps> = ({
  windowGroups,
  expandedWindows,
  onOpenTab,
  onDeleteTab,
  onSaveWindowAsSession,
  onToggleExpand,
}) => {
  const [activeTagInputId, setActiveTagInputId] = useState<string | null>(null);
  const [savingWindows, setSavingWindows] = useState<Set<number>>(new Set());

  const handleTagInputStateChange = (tabId: string, isOpen: boolean) => {
    setActiveTagInputId(isOpen ? tabId : null);
  };

  const handleSaveSession = async (windowId: number) => {
    setSavingWindows((prev) => new Set(prev).add(windowId));
    try {
      await onSaveWindowAsSession(windowId);
    } finally {
      setSavingWindows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(windowId);
        return newSet;
      });
    }
  };

  return (
    <div
      className="space-y-6"
      data-component="WindowsPanel"
      data-testid="windows-panel"
    >
      {/* Use the new SystemMetricsWidget component instead of hard-coded metrics */}
      <SystemMetricsWidget />

      <div className="space-y-4 pb-4">
        {windowGroups.map((window) => {
          const isExpanded = expandedWindows[window.id] || false;
          const isSaving = savingWindows.has(window.id);
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
                  className={`text-xs px-2 py-1 rounded ${
                    isSaving
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-cyan-600 hover:bg-cyan-700"
                  } text-white`}
                  onClick={() => handleSaveSession(window.id)}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-3 w-3 inline mr-1 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3 inline mr-1" />
                  )}
                  {isSaving ? "Saving..." : "Save Session"}
                </button>
              </div>

              <div className="divide-y divide-slate-700/30">
                {tabsToShow.map((tab) => (
                  <TabItem
                    key={tab.id}
                    tab={tab}
                    onClick={onOpenTab}
                    onDelete={onDeleteTab}
                    showActions={true}
                    showTags={true}
                    activeTagInputId={activeTagInputId}
                    onTagInputStateChange={handleTagInputStateChange}
                    variant="window"
                  />
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

WindowsPanel.displayName = "WindowsPanel";

export default WindowsPanel;
