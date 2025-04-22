import React from "react";
import { ExternalLink } from "lucide-react";
import { Tab } from "../interfaces/TabInterface";
import FallbackIcon from "./FallbackIcon";

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
  if (!selectedSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8">
        <div className="text-slate-400">No session selected</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
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
                <div className="text-xs text-slate-500 truncate">{tab.url}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SessionPanel;
