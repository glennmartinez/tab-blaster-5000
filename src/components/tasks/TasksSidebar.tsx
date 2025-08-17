import React from 'react';
import { CheckSquare, Calendar, TrendingUp, Filter } from 'lucide-react';

const TasksSidebar: React.FC = () => {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-700/50 pb-3 mb-4">
        <h3 className="text-slate-200 font-medium flex items-center">
          <CheckSquare className="mr-2 h-4 w-4 text-cyan-400" />
          Task Overview
        </h3>
      </div>

      {/* Task Statistics */}
      <div className="space-y-3 mb-6">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Active Tasks</span>
            <span className="text-cyan-400 font-medium">5</span>
          </div>
        </div>
        
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Completed Today</span>
            <span className="text-green-400 font-medium">3</span>
          </div>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Overdue</span>
            <span className="text-red-400 font-medium">1</span>
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
          <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors">
            High Priority
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors">
            Due Today
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/50 rounded-md transition-colors">
            In Progress
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
            <span className="text-green-400">Completed:</span> Update extension icons
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/20 p-2 rounded">
            <span className="text-cyan-400">Created:</span> Review tab management performance
          </div>
          <div className="text-xs text-slate-400 bg-slate-800/20 p-2 rounded">
            <span className="text-purple-400">Updated:</span> Implement session analytics
          </div>
        </div>
      </div>

      {/* Calendar/Schedule Widget */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            This Week
          </span>
        </div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between text-slate-500">
            <span>Mon</span>
            <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Tue</span>
            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Wed</span>
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksSidebar;
