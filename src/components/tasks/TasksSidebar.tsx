import React from "react";
import {
  CheckSquare,
  TrendingUp,
  Filter,
  Target,
  BarChart3,
  Zap,
} from "lucide-react";

const TasksSidebar: React.FC = () => {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700/50 pb-3 mb-4">
        <h3 className="text-slate-200 font-medium flex items-center">
          <CheckSquare className="mr-2 h-4 w-4 text-cyan-400" />
          Task Analytics
        </h3>
      </div>

      {/* 80/20 Ratio Display */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300 text-sm font-medium">
              Signal vs Noise
            </span>
            <Target className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-800/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-cyan-500 h-full rounded-full"
                style={{ width: "75%" }}
              ></div>
            </div>
            <span className="text-xs text-slate-400">75/25</span>
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="space-y-3 mb-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Total Tasks</span>
            <span className="text-cyan-400 font-medium">12</span>
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm flex items-center">
              <Target className="mr-1 h-3 w-3" />
              Signal
            </span>
            <span className="text-cyan-400 font-medium">8</span>
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm flex items-center">
              <Zap className="mr-1 h-3 w-3" />
              Noise
            </span>
            <span className="text-purple-400 font-medium">4</span>
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">In Inbox</span>
            <span className="text-yellow-400 font-medium">3</span>
          </div>
        </div>
      </div>

      {/* Size Distribution */}
      <div className="mb-6">
        <h4 className="text-slate-300 text-sm font-medium mb-3 flex items-center">
          <BarChart3 className="mr-2 h-3 w-3" />
          Size Distribution
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Small (S)</span>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-1 bg-cyan-500/20 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-cyan-400 rounded-full"></div>
              </div>
              <span className="text-xs text-cyan-400 min-w-[1rem]">3</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Medium (M)</span>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-1 bg-cyan-500/30 rounded-full overflow-hidden">
                <div className="w-full h-full bg-cyan-400 rounded-full"></div>
              </div>
              <span className="text-xs text-cyan-400 min-w-[1rem]">5</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">Large (L)</span>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-1 bg-cyan-500/40 rounded-full overflow-hidden">
                <div className="w-1/2 h-full bg-cyan-300 rounded-full"></div>
              </div>
              <span className="text-xs text-cyan-300 min-w-[1rem]">3</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-sm">X-Large (XL)</span>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-1 bg-cyan-500/50 rounded-full overflow-hidden">
                <div className="w-1/4 h-full bg-cyan-200 rounded-full"></div>
              </div>
              <span className="text-xs text-cyan-200 min-w-[1rem]">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <h4 className="text-slate-300 text-sm font-medium mb-3 flex items-center">
          <Filter className="mr-2 h-3 w-3" />
          Quick Filters
        </h4>
        <div className="space-y-2">
          <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors flex items-center justify-between">
            <span>Due Today</span>
            <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">
              2
            </span>
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors flex items-center justify-between">
            <span>High Priority</span>
            <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">
              4
            </span>
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors flex items-center justify-between">
            <span>Development</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">
              6
            </span>
          </button>
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
            <span className="text-cyan-400">Moved to Signal:</span> Review tab
            performance
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/20 p-2 rounded">
            <span className="text-purple-400">Moved to Noise:</span> Update
            icons
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/20 p-2 rounded">
            <span className="text-green-400">Created:</span> Implement analytics
          </div>
        </div>
      </div>

      {/* Productivity Score */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-300 text-sm">Productivity Score</span>
            <span className="text-green-400 font-bold">85%</span>
          </div>
          <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-cyan-400 h-full rounded-full"
              style={{ width: "85%" }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Focus on Signal tasks</p>
        </div>
      </div>
    </div>
  );
};

export default TasksSidebar;
