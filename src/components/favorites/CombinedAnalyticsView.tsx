import React, { useState, useEffect } from 'react';
import { BarChart3, Link, Heart, Folder } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useSessionAnalytics } from '../../hooks/useSessionAnalytics';

interface SessionTabAnalytics {
  url: string;
  title: string;
  visitCount: number;
  lastAccess: Date | null;
  sessionNames: string[];
}

interface CombinedAnalyticsProps {
  onClose: () => void;
}

export const CombinedAnalyticsView: React.FC<CombinedAnalyticsProps> = ({ onClose }) => {
  const { getCombinedAnalytics } = useFavorites();
  const { getMostVisited, getRecentlyAccessed } = useSessionAnalytics();
  
  const [combinedData, setCombinedData] = useState<{
    favoriteUrls: Set<string>;
    sessionUrls: Set<string>;
    bothFavoriteAndSession: Set<string>;
  } | null>(null);
  const [mostVisitedSessions, setMostVisitedSessions] = useState<SessionTabAnalytics[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionTabAnalytics[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [combined, mostVisited, recent] = await Promise.all([
          getCombinedAnalytics(),
          getMostVisited(5),
          getRecentlyAccessed(5)
        ]);
        
        setCombinedData(combined);
        setMostVisitedSessions(mostVisited);
        setRecentSessions(recent);
      } catch (error) {
        console.error('Error loading combined analytics:', error);
      }
    };

    loadData();
  }, [getCombinedAnalytics, getMostVisited, getRecentlyAccessed]);

  if (!combinedData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-white">Combined Analytics</h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors text-xl"
            >
              ×
            </button>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-pink-500" />
                <h3 className="text-sm font-medium text-slate-300">Favorites Only</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {combinedData.favoriteUrls.size - combinedData.bothFavoriteAndSession.size}
              </p>
              <p className="text-xs text-slate-400">URLs only in favorites</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Folder className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-medium text-slate-300">Sessions Only</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {combinedData.sessionUrls.size - combinedData.bothFavoriteAndSession.size}
              </p>
              <p className="text-xs text-slate-400">URLs only in sessions</p>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
              <div className="flex items-center gap-3 mb-2">
                <Link className="w-5 h-5 text-green-500" />
                <h3 className="text-sm font-medium text-slate-300">Cross-Platform</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                {combinedData.bothFavoriteAndSession.size}
              </p>
              <p className="text-xs text-slate-400">URLs in both favorites & sessions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most Visited Session Tabs */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                Most Visited Session Tabs
              </h3>
              <div className="space-y-2">
                {mostVisitedSessions.length > 0 ? (
                  mostVisitedSessions.map((tab) => (
                    <div
                      key={tab.url}
                      className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {tab.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {tab.url}
                          </p>
                          <p className="text-xs text-slate-500">
                            Sessions: {tab.sessionNames.join(', ')}
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-sm font-bold text-cyan-400">
                            {tab.visitCount}
                          </p>
                          <p className="text-xs text-slate-400">visits</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No session visits tracked yet</p>
                )}
              </div>
            </div>

            {/* Recently Accessed */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-400" />
                Recently Accessed
              </h3>
              <div className="space-y-2">
                {recentSessions.length > 0 ? (
                  recentSessions.map((tab) => (
                    <div
                      key={tab.url}
                      className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/30"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            {tab.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">
                            {tab.url}
                          </p>
                          <p className="text-xs text-slate-500">
                            Sessions: {tab.sessionNames.join(', ')}
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="text-xs text-slate-400">
                            {tab.lastAccess 
                              ? tab.lastAccess.toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No recent session access tracked</p>
                )}
              </div>
            </div>
          </div>

          {/* Cross-Platform URLs */}
          {combinedData.bothFavoriteAndSession.size > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Link className="w-5 h-5 text-green-500" />
                Cross-Platform URLs
              </h3>
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                <div className="flex flex-wrap gap-2">
                  {Array.from(combinedData.bothFavoriteAndSession).map((url) => (
                    <span
                      key={url}
                      className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-300 border border-green-500/50 rounded text-xs"
                    >
                      {new URL(url).hostname}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
