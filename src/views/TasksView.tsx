import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Target,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { Task } from "../interfaces/TaskInterface";
import { useTasks } from "../hooks/useTasks";

// Modal Dialog Component for Task Editing
interface TaskEditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, updates: Partial<Task>) => void;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    category: task.category,
    size: task.size,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<Task> = {
      title: formData.title,
      description: formData.description || undefined,
      category: formData.category,
      size: formData.size,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    };
    onSave(task.id, updates);
    onClose();
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      title: task.title,
      description: task.description || "",
      category: task.category,
      size: task.size,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split("T")[0] : "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/50 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-cyan-400" />
              Edit Task
            </h2>
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-slate-800/50 border border-slate-600/50 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-slate-800/50 border border-slate-600/50 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
                rows={3}
                placeholder="Optional description..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as Task["category"],
                    })
                  }
                  className="w-full bg-slate-800/50 border border-slate-600/50 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                >
                  <option value="development">Development</option>
                  <option value="design">Design</option>
                  <option value="research">Research</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Size
                </label>
                <select
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      size: e.target.value as Task["size"],
                    })
                  }
                  className="w-full bg-slate-800/50 border border-slate-600/50 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                >
                  <option value="S">Small (S)</option>
                  <option value="M">Medium (M)</option>
                  <option value="L">Large (L)</option>
                  <option value="XL">Extra Large (XL)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: e.target.value as Task["priority"],
                    })
                  }
                  className="w-full bg-slate-800/50 border border-slate-600/50 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full bg-slate-800/50 border border-slate-600/50 text-slate-200 text-sm px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 text-sm font-medium rounded transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const TasksView: React.FC = () => {
  const {
    createTask,
    updateTask,
    moveTaskToStatus,
    getTasksByStatus,
  } = useTasks();

  const [currentView, setCurrentView] = useState<"triage" | "focus">("triage");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

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
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await createTask({
        title: newTaskTitle,
        category: "other",
        size: "M",
        priority: "medium",
        status: "inbox",
      });
      setNewTaskTitle("");
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  // Modal handlers
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
  };

  const handleSaveTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
      setEditingTask(null);
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetStatus: Task["status"]
  ) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== targetStatus) {
      try {
        await moveTaskToStatus(draggedTask.id, targetStatus);
      } catch (error) {
        console.error("Failed to move task:", error);
      }
    }
    setDraggedTask(null);
  };

  // Simple Task Card Component that opens modal for editing
  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    return (
      <div
        className="bg-slate-800/40 border border-slate-700/50 rounded p-2 mb-1 hover:bg-slate-800/60 transition-colors cursor-move group"
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
      >
        <div
          onClick={() => handleEditTask(task)}
          className="cursor-pointer min-w-0"
        >
          <div className="flex items-start justify-between mb-1">
            <h4 className="text-slate-200 font-medium text-xs flex-1 truncate pr-1">
              {task.title}
            </h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Edit3 className="h-2.5 w-2.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full border ${
                  sizeColors[task.size]
                } flex-shrink-0`}
              >
                {task.size}
              </span>
            </div>
          </div>

          {task.description && (
            <p className="text-slate-400 text-xs mb-1 line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full border ${
                categoryColors[task.category]
              } truncate`}
            >
              {task.category}
            </span>

            {task.dueDate && (
              <div className="flex items-center text-xs text-slate-500 flex-shrink-0 ml-1">
                <Calendar className="mr-0.5 h-2.5 w-2.5" />
                <span className="text-xs">
                  {task.dueDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Column Component
  const TaskColumn: React.FC<{
    title: string;
    tasks: Task[];
    icon: React.ReactNode;
    accent: string;
    status: Task["status"];
  }> = ({ title, tasks, icon, accent, status }) => (
    <div className="flex-1 min-w-0">
      <div
        className={`bg-slate-900/50 border ${accent} backdrop-blur-sm rounded-lg h-full flex flex-col group`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        <div className="px-2 py-2 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-200 font-medium flex items-center text-xs truncate">
              {icon}
              <span className="truncate">{title}</span>
            </h3>
            <span className="text-xs bg-slate-800/50 text-slate-400 px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
              {tasks.length}
            </span>
          </div>
        </div>

        <div className="p-1 flex-1 overflow-y-auto min-h-[200px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}

          {tasks.length === 0 && (
            <div className="text-center text-slate-500 py-6">
              <div className="text-lg mb-1">📥</div>
              <p className="text-xs">Drop tasks here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-700/50 px-3 py-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-slate-100 flex items-center font-medium text-sm">
            <CheckSquare className="mr-2 h-4 w-4 text-cyan-400" />
            Task Manager - 80/20 Signal vs Noise
          </h2>

          {/* View Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentView("triage")}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                currentView === "triage"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                  : "bg-slate-800/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700/50"
              }`}
            >
              Triage
            </button>
            <button
              onClick={() => setCurrentView("focus")}
              className={`px-2 py-1 text-xs rounded-full transition-colors flex items-center ${
                currentView === "focus"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/50"
                  : "bg-slate-800/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700/50"
              }`}
            >
              <Target className="mr-1 h-3 w-3" />
              Focus
            </button>
          </div>
        </div>

        {/* Quick Add Task */}
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            placeholder="Add a new task..."
            className="flex-1 bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 px-2 py-1.5 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
          />
          <button
            onClick={addTask}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 px-2 py-1.5 rounded flex items-center transition-colors text-sm flex-shrink-0"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 flex-1 overflow-hidden">
        {currentView === "triage" ? (
          // Triage View - Three Columns
          <div className="flex gap-1 h-full">
            <TaskColumn
              title="Inbox"
              tasks={getTasksByStatus("inbox")}
              icon={<CheckSquare className="mr-1 h-3 w-3 text-slate-400" />}
              accent="border-slate-700/50"
              status="inbox"
            />

            <TaskColumn
              title="Signal (80%)"
              tasks={getTasksByStatus("signal")}
              icon={<Target className="mr-1 h-3 w-3 text-cyan-400" />}
              accent="border-cyan-500/50"
              status="signal"
            />

            <TaskColumn
              title="Noise (20%)"
              tasks={getTasksByStatus("noise")}
              icon={<Clock className="mr-1 h-3 w-3 text-purple-400" />}
              accent="border-purple-500/30"
              status="noise"
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

      {/* Task Edit Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          isOpen={!!editingTask}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

export default TasksView;
