import React from "react";
import {
  Bookmark,
  Clock,
  ExternalLink,
  Layers,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { SessionSummary } from "../models/Session";

interface SessionsSidebarProps {
  sessionSummaries: SessionSummary[];
  loading: boolean;
  onSelectSession: (sessionId: string) => void;
  onRefreshSessions: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRestoreSession: (sessionId: string) => void;
  onCreateSession: () => void;
}

const SessionsSidebar: React.FC<SessionsSidebarProps> = ({
  sessionSummaries,
  loading,
  onSelectSession,
  onRefreshSessions,
  onDeleteSession,
  onRestoreSession,
  onCreateSession,
}) => {
  // Group sessions by date
  const groupSessionsByDate = () => {
    const grouped: { [date: string]: SessionSummary[] } = {};

    sessionSummaries.forEach((session) => {
      const date = new Date(session.createdAt).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });

    return grouped;
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg overflow-hidden h-full flex flex-col">
      <div className="p-3 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-slate-100 flex items-center font-medium">
            <Bookmark className="mr-2 h-5 w-5 text-purple-500" />
            Saved Sessions
          </h2>
          <button
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/50"
            onClick={onRefreshSessions}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-purple-400 font-mono text-xs">
              LOADING SESSIONS
            </div>
          </div>
        ) : sessionSummaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="text-slate-400 text-sm">
              No saved sessions found
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {Object.entries(groupSessionsByDate()).map(([date, sessions]) => (
              <div key={date} className="py-2">
                <div className="px-4 py-2">
                  <div className="text-xs font-mono text-slate-500 mb-1">
                    {date}
                  </div>

                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="mb-3 bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden cursor-pointer hover:border-cyan-500/50"
                      onClick={() => onSelectSession(session.id)}
                    >
                      <div className="p-3 bg-gradient-to-r from-slate-800/80 to-slate-800/40 backdrop-blur-sm border-b border-slate-700/50">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-cyan-400">
                            {session.name}
                          </div>
                          <div className="flex space-x-1">
                            <button
                              className="p-1 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRestoreSession(session.id);
                              }}
                              title="Restore all tabs"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </button>
                            <button
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                              }}
                              title="Delete session"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(session.createdAt).toLocaleTimeString()} •
                          <Layers className="h-3 w-3 mx-1" />
                          {session.tabCount}{" "}
                          {session.tabCount === 1 ? "tab" : "tabs"}
                        </div>
                        {session.description && (
                          <div className="text-xs text-slate-400 mt-1 truncate">
                            {session.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
        <div className="w-full flex justify-between items-center">
          <div className="text-xs text-slate-500">
            {sessionSummaries.length}{" "}
            {sessionSummaries.length === 1 ? "session" : "sessions"}
          </div>
          <button
            className="text-xs border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-cyan-400 px-2 py-1 rounded flex items-center"
            onClick={onCreateSession}
          >
            <Plus className="h-3 w-3 mr-1" /> Create Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionsSidebar;
