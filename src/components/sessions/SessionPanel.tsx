import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Tab } from "../../interfaces/TabInterface";
import { TabItem } from "../tabs";

interface SessionPanelProps {
  selectedSession: {
    id: string;
    name: string;
    tabs: Tab[];
    createdAt: string;
  } | null;
  onOpenTab: (tab: Tab) => void;
  onRestoreSession: (sessionId: string) => void;
}

const SessionPanel: React.FC<SessionPanelProps> = ({
  selectedSession,
  onOpenTab,
  onRestoreSession,
}) => {
  const [activeTagInputId, setActiveTagInputId] = useState<string | null>(null);

  const handleTagInputStateChange = (tabId: string, isOpen: boolean) => {
    setActiveTagInputId(isOpen ? tabId : null);
  };

  if (!selectedSession) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full py-8"
        data-component="SessionPanel"
      >
        <div className="text-slate-400">No session selected</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4" data-component="SessionPanel">
      <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-sm p-3 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-cyan-500 mr-2"></div>
            <span className="text-sm font-medium text-slate-300">
              Saved Tabs
            </span>
            <span className="ml-2 bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs px-2 py-0.5 rounded-full">
              {selectedSession.tabs.length} tabs
            </span>
          </div>
          <button
            className="text-xs bg-cyan-600 hover:bg-cyan-700 text-white px-2 py-1 rounded"
            onClick={() => onRestoreSession(selectedSession.id)}
          >
            <ExternalLink className="h-3 w-3 inline mr-1" /> Restore All
          </button>
        </div>
        <div className="divide-y divide-slate-700/30">
          {selectedSession.tabs.map((tab) => (
            <TabItem
              key={tab.id}
              tab={tab}
              onClick={onOpenTab}
              showActions={true}
              showTags={true}
              activeTagInputId={activeTagInputId}
              onTagInputStateChange={handleTagInputStateChange}
              variant="window"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

SessionPanel.displayName = "SessionPanel";

export default SessionPanel;
