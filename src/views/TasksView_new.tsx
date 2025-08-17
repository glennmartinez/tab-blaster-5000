import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  ArrowRight,
  Calendar,
  Clock,
  Target,
} from "lucide-react";

// Task interface
interface Task {
  id: string;
  title: string;
  description?: string;
  category: "development" | "design" | "research" | "meeting" | "other";
  size: "S" | "M" | "L" | "XL";
  dueDate?: Date;
  createdAt: Date;
  status: "inbox" | "signal" | "noise" | "completed";
}

// Sample data
const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Review tab management performance",
    description: "Analyze memory usage and optimize tab handling",
    category: "development",
    size: "L",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    status: "signal",
  },
  {
    id: "2",
    title: "Update extension icons",
    description: "Create new icon set for the extension",
    category: "design",
    size: "M",
    createdAt: new Date(),
    status: "noise",
  },
  {
    id: "3",
    title: "Implement session analytics",
    description: "Add detailed analytics for saved sessions",
    category: "development",
    size: "XL",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    status: "inbox",
  },
];

const TasksView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [currentView, setCurrentView] = useState<"triage" | "focus">("triage");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Category colors
  const categoryColors = {
    development: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    design: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    research: "bg-green-500/20 text-green-400 border-green-500/30",
    meeting: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  // Size colors
  const sizeColors = {
    S: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    M: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    L: "bg-cyan-500/30 text-cyan-300 border-cyan-500/40",
    XL: "bg-cyan-500/40 text-cyan-200 border-cyan-500/50",
  };

  // Add new task
  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      category: "other",
      size: "M",
      createdAt: new Date(),
      status: "inbox",
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  // Filter tasks by status
  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status);
  };

  // Task Card Component
  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 mb-3 hover:bg-slate-800/60 transition-colors cursor-move">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-slate-200 font-medium text-sm">{task.title}</h4>
        <div className="flex items-center space-x-1">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${
              sizeColors[task.size]
            }`}
          >
            {task.size}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-slate-400 text-xs mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span
          className={`text-xs px-2 py-0.5 rounded-full border ${
            categoryColors[task.category]
          }`}
        >
          {task.category}
        </span>

        {task.dueDate && (
          <div className="flex items-center text-xs text-slate-500">
            <Calendar className="mr-1 h-3 w-3" />
            {task.dueDate.toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );

  // Column Component
  const TaskColumn: React.FC<{
    title: string;
    tasks: Task[];
    icon: React.ReactNode;
    accent: string;
  }> = ({ title, tasks, icon, accent }) => (
    <div className="flex-1">
      <div
        className={`bg-slate-900/50 border ${accent} backdrop-blur-sm rounded-lg h-full flex flex-col`}
      >
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-200 font-medium flex items-center">
              {icon}
              {title}
            </h3>
            <span className="text-xs bg-slate-800/50 text-slate-400 px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto max-h-96">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}

          {tasks.length === 0 && (
            <div className="text-center text-slate-500 py-8">
              <div className="text-2xl mb-2">📥</div>
              <p className="text-sm">No tasks here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-700/50 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-slate-100 flex items-center font-medium">
            <CheckSquare className="mr-2 h-5 w-5 text-cyan-400" />
            Task Manager - 80/20 Signal vs Noise
          </h2>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView("triage")}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                currentView === "triage"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                  : "bg-slate-800/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700/50"
              }`}
            >
              Triage View
            </button>
            <button
              onClick={() => setCurrentView("focus")}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                currentView === "focus"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                  : "bg-slate-800/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700/50"
              }`}
            >
              <Target className="mr-1 h-3 w-3" />
              Focus View
            </button>
          </div>
        </div>

        {/* Quick Add Task */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 flex items-center space-x-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTask()}
              placeholder="Add a new task..."
              className="flex-1 bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
            />
            <button
              onClick={addTask}
              className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 px-3 py-2 rounded-md flex items-center transition-colors text-sm"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-0 flex-1 overflow-hidden">
        {currentView === "triage" ? (
          // Triage View - Three Columns
          <div className="flex space-x-4 h-full">
            <TaskColumn
              title="Inbox"
              tasks={getTasksByStatus("inbox")}
              icon={<CheckSquare className="mr-2 h-4 w-4 text-slate-400" />}
              accent="border-slate-700/50"
            />

            <div className="flex items-center">
              <ArrowRight className="h-5 w- text-slate-600" />
            </div>

            <TaskColumn
              title="Signal (80%)"
              tasks={getTasksByStatus("signal")}
              icon={<Target className="mr-2 h-4 w-4 text-cyan-400" />}
              accent="border-cyan-500/50"
            />

            <div className="flex items-center">
              <ArrowRight className="h-5 w-5 text-slate-600" />
            </div>

            <TaskColumn
              title="Noise (20%)"
              tasks={getTasksByStatus("noise")}
              icon={<Clock className="mr-2 h-4 w-4 text-purple-400" />}
              accent="border-purple-500/30"
            />
          </div>
        ) : (
          // Focus View - Coming Soon
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Target className="mx-auto h-16 w-16 text-slate-600 mb-4" />
              <h3 className="text-slate-300 text-lg font-medium mb-2">
                Focus View
              </h3>
              <p className="text-slate-500 text-sm">
                Coming soon - Daily task management
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;
