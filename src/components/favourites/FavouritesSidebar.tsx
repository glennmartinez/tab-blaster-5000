import React from "react";
import { Heart, Star, TrendingUp, Clock } from "lucide-react";

interface FavouritesSidebarProps {
  // Add props as needed for favourites management
}

const FavouritesSidebar: React.FC<FavouritesSidebarProps> = () => {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700/50 pb-3 mb-4">
        <h3 className="text-slate-200 font-medium flex items-center">
          <Heart className="mr-2 h-4 w-4 text-pink-400" />
          Favourites Stats
        </h3>
      </div>

      {/* Favourites Statistics */}
      <div className="space-y-3 mb-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Total Favourites</span>
            <span className="text-pink-400 font-medium">12</span>
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Most Visited</span>
            <span className="text-cyan-400 font-medium">8</span>
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Tagged Items</span>
            <span className="text-purple-400 font-medium">5</span>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="mb-6">
        <h4 className="text-slate-300 text-sm font-medium mb-3 flex items-center">
          <Star className="mr-2 h-3 w-3" />
          Top Categories
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Development</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              4
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Design</span>
            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
              3
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Research</span>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              2
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="flex-1">
        <h4 className="text-slate-300 text-sm font-medium mb-3 flex items-center">
          <TrendingUp className="mr-2 h-3 w-3" />
          Recent Activity
        </h4>
        <div className="space-y-2">
          <div className="text-xs text-slate-400 bg-slate-800/20 p-2 rounded">
            <span className="text-pink-400">Added:</span> GitHub Copilot
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/20 p-2 rounded">
            <span className="text-cyan-400">Visited:</span> React Documentation
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/20 p-2 rounded">
            <span className="text-green-400">Tagged:</span> TypeScript Guide
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <h4 className="text-slate-300 text-sm font-medium mb-3">
          Quick Actions
        </h4>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors flex items-center">
            <Clock className="mr-2 h-3 w-3" />
            Recently Added
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors flex items-center">
            <Star className="mr-2 h-3 w-3" />
            Most Visited
          </button>
        </div>
      </div>
    </div>
  );
};

export default FavouritesSidebar;
