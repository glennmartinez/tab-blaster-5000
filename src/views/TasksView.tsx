import React from "react";
import { CheckSquare, Clock, Plus, Filter } from "lucide-react";

const TasksView: React.FC = () => {
  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-700/50 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-slate-100 flex items-center font-medium">
            <CheckSquare className="mr-2 h-5 w-5 text-cyan-400" />
            Task Manager
          </h2>
          <div className="flex items-center space-x-2">
            <button className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 text-xs px-3 py-1 rounded-full flex items-center transition-colors">
              <Plus className="mr-1 h-3 w-3" />
              Add Task
            </button>
            <button className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 text-slate-300 text-xs px-3 py-1 rounded-full flex items-center transition-colors">
              <Filter className="mr-1 h-3 w-3" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto flex-grow">
        <div className="space-y-3">
          {/* Sample tasks */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-cyan-500 bg-transparent border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <div>
                  <h3 className="text-slate-200 font-medium">
                    Review tab management performance
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Analyze memory usage and optimize tab handling
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full">
                      High Priority
                    </span>
                    <span className="text-xs text-slate-500 flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Due in 2 days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked
                  className="mt-1 w-4 h-4 text-cyan-500 bg-transparent border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
                  readOnly
                />
                <div className="opacity-60">
                  <h3 className="text-slate-200 font-medium line-through">
                    Update extension icons
                  </h3>
                  <p className="text-slate-400 text-sm mt-1 line-through">
                    Create new icon set for the extension
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 text-cyan-500 bg-transparent border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
                />
                <div>
                  <h3 className="text-slate-200 font-medium">
                    Implement session analytics
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Add detailed analytics for saved sessions
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                      Medium Priority
                    </span>
                    <span className="text-xs text-slate-500 flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      Due in 1 week
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add more task placeholder */}
          <div className="bg-slate-800/20 border-2 border-dashed border-slate-700/50 rounded-lg p-8 text-center">
            <CheckSquare className="mx-auto h-8 w-8 text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">No more tasks to display</p>
            <p className="text-slate-600 text-xs mt-1">
              Click "Add Task" to create a new one
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksView;
