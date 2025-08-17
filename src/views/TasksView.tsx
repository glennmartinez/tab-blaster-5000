import React, { useState, useEffect, useCallback } from "react";
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Target,
  Edit3,
  Save,
  X,
  Sun,
  Sunrise,
  Sunset,
  Timer,
  Flag,
  Play,
  Pause,
  Check,
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

// Focus View interfaces and types
interface TimeSlot {
  id: "morning" | "midday" | "evening";
  label: string;
  icon: React.ReactNode;
  startHour: number;
  endHour: number;
  tasks: Task[];
}

interface DailyProgress {
  totalTasks: number;
  completedTasks: number;
  totalSize: number;
  completedSize: number;
  progressPercentage: number;
}

// Focus View Components
const DailyProgressBar: React.FC<{
  progress: DailyProgress;
  currentHour: number;
}> = ({ progress, currentHour }) => {
  const dayProgressPercentage = ((currentHour - 6) / 18) * 100; // 6 AM to 12 AM (18 hours)
  const timeOfDayLabel =
    currentHour < 12 ? "Morning" : currentHour < 17 ? "Midday" : "Evening";

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-medium text-slate-200">
            Today's Progress
          </h2>
        </div>
        <div className="text-sm text-slate-400">
          {timeOfDayLabel} • {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Task Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-300 mb-1">
          <span>Tasks Completed</span>
          <span>
            {progress.completedTasks}/{progress.totalTasks}
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Size Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-300 mb-1">
          <span>Size Points Completed</span>
          <span>
            {progress.completedSize}/{progress.totalSize}
          </span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                (progress.completedSize / progress.totalSize) * 100 || 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Day Timeline */}
      <div className="relative">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>6 AM</span>
          <span>12 PM</span>
          <span>6 PM</span>
          <span>12 AM</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-1 relative">
          <div
            className="bg-gradient-to-r from-orange-500 to-yellow-400 h-1 rounded-full transition-all duration-300"
            style={{
              width: `${Math.max(0, Math.min(100, dayProgressPercentage))}%`,
            }}
          />
          {/* Current time indicator */}
          <div
            className="absolute top-0 w-0.5 h-3 bg-yellow-400 rounded-full transform -translate-x-0.5 -translate-y-1"
            style={{
              left: `${Math.max(0, Math.min(100, dayProgressPercentage))}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const CurrentTaskSection: React.FC<{
  currentTask: Task | null;
  timerSeconds: number;
  isTimerRunning: boolean;
  onPause: () => void;
  onResume: () => void;
  onComplete: () => void;
  onDrop: (taskId: string) => void;
  formatTime: (seconds: number) => string;
}> = ({ currentTask, timerSeconds, isTimerRunning, onPause, onResume, onComplete, onDrop, formatTime }) => {
  const [dragOver, setDragOver] = useState(false);
  
  const priorityColors = {
    high: "text-red-500",
    medium: "text-yellow-500",
    low: "text-blue-500",
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDrop(taskId);
    }
  };

  if (!currentTask) {
    return (
      <div 
        className={`
          bg-slate-800/40 border rounded-lg p-4 mb-6 transition-colors
          ${dragOver 
            ? 'border-cyan-400 bg-cyan-400/10' 
            : 'border-slate-700/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-2 mb-2">
          <Play className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-medium text-slate-200">Current Task</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-400">No task in progress</p>
          <p className="text-slate-500 text-sm">Drag a task here to start working</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Play className="h-5 w-5 text-green-400" />
        <h3 className="text-lg font-medium text-slate-200">Current Task</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Task Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Flag className={`h-4 w-4 ${priorityColors[currentTask.priority]}`} />
            <h4 className="text-slate-200 font-medium text-lg">{currentTask.title}</h4>
            <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded font-medium">
              {currentTask.size}
            </span>
          </div>
          
          {currentTask.description && (
            <p className="text-slate-400 text-sm leading-relaxed">
              {currentTask.description}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded">
              {currentTask.category}
            </span>
            {currentTask.dueDate && (
              <span className="text-xs text-slate-500">
                Due: {currentTask.dueDate.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Right: Timer and Controls */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-slate-200 mb-2">
              {formatTime(timerSeconds)}
            </div>
            <p className="text-slate-400 text-sm">
              {isTimerRunning ? 'In Progress' : 'Paused'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isTimerRunning ? (
              <button
                onClick={onPause}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Pause className="h-4 w-4" />
                Pause
              </button>
            ) : (
              <button
                onClick={onResume}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Play className="h-4 w-4" />
                Resume
              </button>
            )}
            
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Check className="h-4 w-4" />
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeSlotSection: React.FC<{
  timeSlot: TimeSlot;
  onDrop: (taskId: string, timeSlotId: TimeSlot["id"]) => void;
  onUnschedule: (taskId: string) => void;
  onStartTask: (task: Task) => void;
  currentTask?: Task | null;
  currentHour: number;
}> = ({ timeSlot, onDrop, onUnschedule, onStartTask, currentTask, currentHour }) => {
  const [dragOver, setDragOver] = useState(false);
  const isActiveTime =
    currentHour >= timeSlot.startHour && currentHour < timeSlot.endHour;

  // Sort tasks by priority (high to low) and then by size
  const sortedTasks = [...timeSlot.tasks].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    const sizeOrder = { XL: 4, L: 3, M: 2, S: 1 };
    return sizeOrder[b.size] - sizeOrder[a.size];
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDrop(taskId, timeSlot.id);
    }
  };

  const getBorderStyle = () => {
    if (dragOver) return "border-cyan-500/60 border-2";
    if (isActiveTime) return "border-yellow-500/50 border-2";
    return "border-slate-700/50 border-2 border-dashed";
  };

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        {timeSlot.icon}
        <h3
          className={`font-medium ${
            isActiveTime ? "text-yellow-300" : "text-slate-300"
          }`}
        >
          {timeSlot.label}
        </h3>
        <span className="text-xs text-slate-500">
          ({timeSlot.startHour}:00 - {timeSlot.endHour}:00)
        </span>
        {isActiveTime && (
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        )}
      </div>

      <div
        className={`min-h-64 bg-slate-800/20 rounded-lg p-3 transition-all duration-200 ${getBorderStyle()}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500">
            <Clock className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No tasks scheduled</p>
            <p className="text-xs">Drag tasks here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedTasks.map((task) => (
              <FocusTaskCard
                key={task.id}
                task={task}
                onUnschedule={onUnschedule}
                onStartTask={onStartTask}
                isCurrentTask={currentTask?.id === task.id}
                timeSlotId={timeSlot.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FocusTaskCard: React.FC<{
  task: Task;
  onUnschedule: (taskId: string) => void;
  onStartTask: (task: Task) => void;
  isCurrentTask?: boolean;
  timeSlotId: TimeSlot["id"];
}> = ({ task, onUnschedule, onStartTask, isCurrentTask = false }) => {
  const priorityColors = {
    high: "text-red-500",
    medium: "text-yellow-500", 
    low: "text-blue-500",
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  return (
    <div
      className={`
        bg-slate-800/40 border rounded-lg p-3 hover:bg-slate-800/60 transition-colors cursor-move group relative
        ${isCurrentTask 
          ? 'border-purple-500 animate-pulse shadow-lg shadow-purple-500/20' 
          : 'border-slate-700/50'
        }
      `}
      draggable
      onDragStart={handleDragStart}
      title="Drag to move task"
    >
      {/* Start Task Button (appears on hover) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onStartTask(task);
        }}
        className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-green-600/80 hover:bg-green-600 text-white p-1 rounded-full z-10"
        title="Start working on this task"
      >
        <Play className="h-3 w-3" />
      </button>

      <div className="flex items-start justify-between mb-2">
        <h4 className="text-slate-200 font-medium text-sm flex-1 pr-2 ml-6">
          {task.title}
        </h4>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Flag className={`h-3 w-3 ${priorityColors[task.priority]}`} />
          <span className="text-xs px-1.5 py-0.5 bg-slate-700/50 text-slate-300 rounded font-medium">
            {task.size}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnschedule(task.id);
            }}
            className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
            title="Remove from schedule"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-slate-400 text-xs mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded">
          {task.category}
        </span>
        <div className="flex items-center gap-1">
          {task.dueDate && (
            <span className="text-xs text-slate-500">
              Due: {task.dueDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Weekly Planning View interfaces and components
interface DayNavigation {
  date: Date;
  dayName: string;
  dayShort: string;
  isToday: boolean;
  isWeekend: boolean;
  taskCount: number;
}

interface DayTimeSlot {
  id: "morning" | "midday" | "evening";
  label: string;
  timeRange: string;
  icon: React.ReactNode;
  tasks: Task[];
}

// Weekly Planning Components
const WeekNavBar: React.FC<{
  days: DayNavigation[];
  selectedDay: Date;
  onDaySelect: (date: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  currentWeek: Date;
}> = ({
  days,
  selectedDay,
  onDaySelect,
  onPreviousWeek,
  onNextWeek,
  currentWeek,
}) => {
  return (
    <div className="bg-slate-800/40 border-b border-slate-700/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-green-400" />
          <div>
            <h2 className="text-xl font-semibold text-slate-200">
              Weekly Planning
            </h2>
            <p className="text-sm text-slate-400">
              {days[0]?.date.toLocaleDateString()} -{" "}
              {days[6]?.date.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-300">Plan your week</p>
            <p className="text-xs text-slate-500">Drag tasks to time slots</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPreviousWeek}
              className="p-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-lg transition-colors"
              title="Previous Week"
            >
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="text-center px-3">
              <p className="text-sm font-medium text-slate-300">
                Week of{" "}
                {currentWeek.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={onNextWeek}
              className="p-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-lg transition-colors"
              title="Next Week"
            >
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {days.map((day) => (
          <button
            key={day.date.toISOString()}
            onClick={() => onDaySelect(day.date)}
            className={`flex-shrink-0 px-4 py-3 rounded-lg border transition-all duration-200 ${
              day.date.toDateString() === selectedDay.toDateString()
                ? "bg-green-500/20 border-green-500/50 text-green-300"
                : day.isToday
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20"
                : day.isWeekend
                ? "bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                : "bg-slate-800/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
            }`}
          >
            <div className="text-center">
              <div className="text-xs font-medium">{day.dayShort}</div>
              <div className="text-lg font-bold">{day.date.getDate()}</div>
              {day.taskCount > 0 && (
                <div className="text-xs mt-1 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">
                  {day.taskCount}
                </div>
              )}
              {day.isToday && (
                <div className="w-2 h-2 bg-yellow-400 rounded-full mx-auto mt-1 animate-pulse" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const TaskPool: React.FC<{
  weekTasks: Task[];
  onTaskEdit: (task: Task) => void;
}> = ({ weekTasks, onTaskEdit }) => {
  // Group tasks by priority
  const tasksByPriority = {
    high: weekTasks.filter((task) => task.priority === "high"),
    medium: weekTasks.filter((task) => task.priority === "medium"),
    low: weekTasks.filter((task) => task.priority === "low"),
  };

  const TaskPoolItem: React.FC<{ task: Task }> = ({ task }) => {
    const priorityColors = {
      high: "text-red-500",
      medium: "text-yellow-500",
      low: "text-blue-500",
    };

    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData("taskId", task.id);
    };

    return (
      <div
        className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2 mb-2 hover:bg-slate-800/80 transition-colors cursor-pointer group"
        draggable
        onDragStart={handleDragStart}
        onClick={() => onTaskEdit(task)}
      >
        <div className="flex items-start justify-between mb-1">
          <h4 className="text-slate-200 font-medium text-sm flex-1 pr-2 line-clamp-2">
            {task.title}
          </h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Flag className={`h-3 w-3 ${priorityColors[task.priority]}`} />
            <span className="text-xs px-1 py-0.5 bg-slate-700/50 text-slate-300 rounded font-medium">
              {task.size}
            </span>
            <Edit3 className="h-3 w-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {task.description && (
          <p className="text-slate-400 text-xs mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded">
            {task.category}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-80 bg-slate-900/50 border-r border-slate-700/50 p-4 overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-cyan-400" />
        <h3 className="text-lg font-medium text-slate-200">Task Pool</h3>
        <span className="text-xs bg-slate-800/50 text-slate-400 px-2 py-1 rounded-full">
          {weekTasks.length}
        </span>
      </div>

      {weekTasks.length === 0 ? (
        <div className="text-center py-8">
          <CheckSquare className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No unscheduled tasks</p>
          <p className="text-slate-600 text-xs">All tasks are planned!</p>
        </div>
      ) : (
        <div className="space-y-1">
          {/* High Priority Tasks */}
          {tasksByPriority.high.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                High Priority ({tasksByPriority.high.length})
              </h4>
              {tasksByPriority.high.map((task) => (
                <TaskPoolItem key={task.id} task={task} />
              ))}
            </div>
          )}

          {/* Medium Priority Tasks */}
          {tasksByPriority.medium.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-yellow-400 mb-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                Medium Priority ({tasksByPriority.medium.length})
              </h4>
              {tasksByPriority.medium.map((task) => (
                <TaskPoolItem key={task.id} task={task} />
              ))}
            </div>
          )}

          {/* Low Priority Tasks */}
          {tasksByPriority.low.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium text-green-400 mb-2 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Low Priority ({tasksByPriority.low.length})
              </h4>
              {tasksByPriority.low.map((task) => (
                <TaskPoolItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DayTimeSection: React.FC<{
  timeSlot: DayTimeSlot;
  onDrop: (taskId: string, timeSlotId: DayTimeSlot["id"]) => void;
  onTaskEdit: (task: Task) => void;
  isActiveTime: boolean;
}> = ({ timeSlot, onDrop, onTaskEdit, isActiveTime }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      onDrop(taskId, timeSlot.id);
    }
  };

  const getBorderStyle = () => {
    if (dragOver) return "border-green-500/60 bg-green-500/10";
    if (isActiveTime) return "border-yellow-500/50 bg-yellow-500/5";
    return "border-slate-700/50";
  };

  return (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        {timeSlot.icon}
        <div>
          <h3
            className={`font-medium ${
              isActiveTime ? "text-yellow-300" : "text-slate-300"
            }`}
          >
            {timeSlot.label}
          </h3>
          <p className="text-xs text-slate-500">{timeSlot.timeRange}</p>
        </div>
        {isActiveTime && (
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse ml-auto" />
        )}
      </div>

      <div
        className={`min-h-64 border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${getBorderStyle()}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {timeSlot.tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500">
            <Clock className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No tasks planned</p>
            <p className="text-xs">Drag tasks here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {timeSlot.tasks.map((task) => (
              <WeeklyPlanTaskCard
                key={task.id}
                task={task}
                onEdit={onTaskEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const WeeklyPlanTaskCard: React.FC<{
  task: Task;
  onEdit: (task: Task) => void;
}> = ({ task, onEdit }) => {
  const priorityColors = {
    high: "text-red-500",
    medium: "text-yellow-500",
    low: "text-blue-500",
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
  };

  return (
    <div
      className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-2 hover:bg-slate-800/80 transition-colors cursor-pointer group"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start justify-between mb-1">
        <h4 className="text-slate-200 font-medium text-sm flex-1 pr-2 line-clamp-1">
          {task.title}
        </h4>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Flag className={`h-3 w-3 ${priorityColors[task.priority]}`} />
          <span className="text-xs px-1 py-0.5 bg-slate-700/50 text-slate-300 rounded font-medium">
            {task.size}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="text-slate-400 text-xs mb-1 line-clamp-1">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs px-1.5 py-0.5 bg-slate-700/50 text-slate-300 rounded">
          {task.category}
        </span>
      </div>
    </div>
  );
};

const TasksView: React.FC = () => {
  const { tasks, createTask, updateTask, moveTaskToStatus, getTasksByStatus } =
    useTasks();

  const [currentView, setCurrentView] = useState<"triage" | "weekly" | "focus">(
    "triage"
  );
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

  // Focus View Logic
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [timeSlotTasks, setTimeSlotTasks] = useState<{
    [key in TimeSlot["id"]]: Task[];
  }>({
    morning: [],
    midday: [],
    evening: [],
  });

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentHour(now.getHours());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get tasks for today (due today or no due date but status is not noise)
  const getTodaysTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter((task: Task) => {
      // Include tasks due today or tasks with no due date that are not noise
      return (
        ((task.dueDate &&
          new Date(task.dueDate) >= today &&
          new Date(task.dueDate) < tomorrow) ||
          (!task.dueDate && task.status !== "noise")) &&
        task.status !== "done"
      );
    });
  }, [tasks]);

  // Handle task drop into time slots
  const handleTimeSlotDrop = async (
    taskId: string,
    timeSlotId: TimeSlot["id"]
  ) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      // Update the task with the new schedule
      await updateTask(taskId, {
        schedule: timeSlotId as "morning" | "midday" | "evening",
        status: "signal", // Move to signal when scheduled
        dueDate: task.dueDate || new Date(), // Set today if no due date
      });

      // The useEffect will automatically update the timeSlotTasks state
    } catch (error) {
      console.error("Failed to schedule task:", error);
    }
  };

  // Handle unscheduling a task (removing it from time slots)
  const handleUnscheduleTask = async (taskId: string) => {
    try {
      await updateTask(taskId, {
        schedule: undefined, // Remove the schedule field
      });
      // The useEffect will automatically update the timeSlotTasks state
    } catch (error) {
      console.error("Failed to unschedule task:", error);
    }
  };

  // Calculate daily progress
  const getDailyProgress = (): DailyProgress => {
    const todaysTasks = getTodaysTasks();
    const completedTasks = todaysTasks.filter(
      (task: Task) => task.status === "done"
    );
    const sizePoints = { S: 1, M: 2, L: 3, XL: 5 };

    const totalSize = todaysTasks.reduce(
      (sum: number, task: Task) => sum + sizePoints[task.size],
      0
    );
    const completedSize = completedTasks.reduce(
      (sum: number, task: Task) => sum + sizePoints[task.size],
      0
    );

    return {
      totalTasks: todaysTasks.length,
      completedTasks: completedTasks.length,
      totalSize,
      completedSize,
      progressPercentage:
        todaysTasks.length > 0
          ? (completedTasks.length / todaysTasks.length) * 100
          : 0,
    };
  };

  // Timer control functions
  const startTask = (task: Task) => {
    setCurrentTask(task);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const completeCurrentTask = async () => {
    if (!currentTask) return;
    
    try {
      await updateTask(currentTask.id, { status: "done" });
      setCurrentTask(null);
      setTimerSeconds(0);
      setIsTimerRunning(false);
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const handleCurrentTaskDrop = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      startTask(task);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // Define time slots
  const timeSlots: TimeSlot[] = [
    {
      id: "morning",
      label: "Morning",
      icon: <Sunrise className="h-5 w-5 text-yellow-400" />,
      startHour: 9,
      endHour: 11,
      tasks: timeSlotTasks.morning,
    },
    {
      id: "midday",
      label: "Midday",
      icon: <Sun className="h-5 w-5 text-orange-400" />,
      startHour: 12,
      endHour: 14,
      tasks: timeSlotTasks.midday,
    },
    {
      id: "evening",
      label: "Evening",
      icon: <Sunset className="h-5 w-5 text-purple-400" />,
      startHour: 15,
      endHour: 18,
      tasks: timeSlotTasks.evening,
    },
  ];

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

  // Weekly drag and drop handler
  const handleWeeklyDrop = async (
    e: React.DragEvent,
    targetStatus: Task["status"],
    weekType: "current" | "next" | "following"
  ) => {
    e.preventDefault();
    if (draggedTask) {
      try {
        // Calculate the Friday of the target week
        const targetDueDate = getWeekEndDate(weekType);

        await updateTask(draggedTask.id, {
          status: targetStatus,
          dueDate: targetDueDate,
        });
      } catch (error) {
        console.error("Failed to move task:", error);
      }
    }
    setDraggedTask(null);
  };

  // Utility functions for week calculations
  const getWeekStartDate = (
    weekType: "current" | "next" | "following"
  ): Date => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Sunday = 0, Monday = 1

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    switch (weekType) {
      case "current":
        return monday;
      case "next": {
        const nextWeek = new Date(monday);
        nextWeek.setDate(monday.getDate() + 7);
        return nextWeek;
      }
      case "following": {
        const followingWeek = new Date(monday);
        followingWeek.setDate(monday.getDate() + 14);
        return followingWeek;
      }
    }
  };

  const getWeekEndDate = (weekType: "current" | "next" | "following"): Date => {
    const weekStart = getWeekStartDate(weekType);
    const friday = new Date(weekStart);
    friday.setDate(weekStart.getDate() + 4); // Friday is 4 days after Monday
    friday.setHours(23, 59, 59, 999);
    return friday;
  };

  const getWeekRange = (
    weekType: "current" | "next" | "following"
  ): { start: Date; end: Date } => {
    const start = getWeekStartDate(weekType);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Sunday is 6 days after Monday
    end.setHours(23, 59, 59, 999);
    return { start, end };
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

  // Helper functions for weekly organization (updated to use new approach)
  const formatWeekLabel = (weekStart: Date): string => {
    return `Week of ${weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`;
  };

  const categorizeTasksByWeek = (
    tasks: Task[]
  ): {
    currentWeek: Task[];
    nextWeek: Task[];
    future: Task[];
  } => {
    const currentWeekRange = getWeekRange("current");
    const nextWeekRange = getWeekRange("next");

    const currentWeek: Task[] = [];
    const nextWeek: Task[] = [];
    const future: Task[] = [];

    tasks.forEach((task) => {
      if (!task.dueDate) {
        // Tasks without due dates go to current week
        currentWeek.push(task);
        return;
      }

      const taskDate = new Date(task.dueDate);

      if (
        taskDate >= currentWeekRange.start &&
        taskDate <= currentWeekRange.end
      ) {
        currentWeek.push(task);
      } else if (
        taskDate >= nextWeekRange.start &&
        taskDate <= nextWeekRange.end
      ) {
        nextWeek.push(task);
      } else {
        future.push(task);
      }
    });

    return { currentWeek, nextWeek, future };
  };

  // Weekly Task Column Component (for Signal and Noise)
  const WeeklyTaskColumn: React.FC<{
    title: string;
    tasks: Task[];
    icon: React.ReactNode;
    accent: string;
    status: Task["status"];
  }> = ({ title, tasks, icon, accent, status }) => {
    const [dragOverSection, setDragOverSection] = useState<string | null>(null);

    const { currentWeek, nextWeek, future } = categorizeTasksByWeek(tasks);
    const currentWeekStart = getWeekStartDate("current");
    const nextWeekStart = getWeekStartDate("next");

    const handleSectionDragOver = (e: React.DragEvent, section: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverSection(section);
    };

    const handleSectionDragLeave = (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
        setDragOverSection(null);
      }
    };

    const handleSectionDrop = async (e: React.DragEvent, section: string) => {
      e.preventDefault();
      setDragOverSection(null);
      if (draggedTask) {
        let weekType: "current" | "next" | "following";
        switch (section) {
          case "current":
            weekType = "current";
            break;
          case "next":
            weekType = "next";
            break;
          case "future":
          default:
            weekType = "following";
            break;
        }
        await handleWeeklyDrop(e, status, weekType);
      }
    };

    const getSectionStyle = (section: string) => {
      const baseStyle =
        "flex-1 border-2 border-dashed rounded-lg p-3 transition-all duration-200";
      let colorStyle = "border-slate-600/50";

      if (dragOverSection === section) {
        switch (section) {
          case "current":
            colorStyle = "border-yellow-400 bg-yellow-500/10";
            break;
          case "next":
            colorStyle = "border-red-400 bg-red-500/10";
            break;
          case "future":
            colorStyle = "border-green-400 bg-green-500/10";
            break;
        }
      }

      return `${baseStyle} ${colorStyle}`;
    };

    const WeekSection: React.FC<{
      section: string;
      title: string;
      sectionTasks: Task[];
      borderAccent: string;
    }> = ({ section, title, sectionTasks, borderAccent }) => {
      const handleWeekDrop = async (e: React.DragEvent) => {
        await handleSectionDrop(e, section);
      };

      return (
        <div className="flex-1 flex flex-col">
          <div className={`border-l-4 ${borderAccent} pl-3 mb-2`}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-slate-300">{title}</h4>
              <span className="text-xs text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                {sectionTasks.length}
              </span>
            </div>
          </div>

          <div
            className={getSectionStyle(section)}
            onDragOver={(e) => handleSectionDragOver(e, section)}
            onDragLeave={handleSectionDragLeave}
            onDrop={handleWeekDrop}
          >
            {sectionTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Calendar className="h-6 w-6 mb-2 opacity-50" />
                <p className="text-xs text-center">Drop tasks here</p>
              </div>
            ) : (
              <div className="space-y-1 overflow-y-auto max-h-full">
                {sectionTasks.map((task) => (
                  <div key={task.id} onClick={() => handleEditTask(task)}>
                    <TaskCard task={task} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="flex-1 min-w-0">
        <div
          className={`bg-slate-900/50 border ${accent} backdrop-blur-sm rounded-lg h-full flex flex-col group`}
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

          <div className="flex-1 p-2 flex flex-col gap-2 min-h-0">
            <WeekSection
              section="current"
              title={formatWeekLabel(currentWeekStart)}
              sectionTasks={currentWeek}
              borderAccent="border-l-yellow-500/50"
            />

            <WeekSection
              section="next"
              title={formatWeekLabel(nextWeekStart)}
              sectionTasks={nextWeek}
              borderAccent="border-l-red-500/50"
            />

            <WeekSection
              section="future"
              title="Future Tasks"
              sectionTasks={future}
              borderAccent="border-l-green-500/50"
            />
          </div>
        </div>
      </div>
    );
  };

  // Weekly Planning Logic
  const [selectedWeek, setSelectedWeek] = useState<Date>(() => {
    // Default to current week
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() + mondayOffset);
    currentWeekStart.setHours(0, 0, 0, 0);

    return currentWeekStart;
  });

  const [selectedDay, setSelectedDay] = useState<Date>(() => {
    // Default to Monday of the selected week
    return new Date(selectedWeek);
  });

  // Get tasks for Focus view (use selectedDay if it's today, otherwise use today)
  const getFocusTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Use selectedDay if it's today, otherwise default to today
    const targetDay = selectedDay.toDateString() === today.toDateString() ? selectedDay : today;
    
    return tasks.filter((task: Task) => {
      if (!task.dueDate) {
        // Include tasks with no due date that are not noise (for today only)
        return targetDay.toDateString() === today.toDateString() && task.status !== "noise" && task.status !== "done";
      }
      
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.toDateString() === targetDay.toDateString() &&
        task.status !== "done" &&
        (task.status === "signal" || task.status === "inbox")
      );
    });
  }, [tasks, selectedDay]);

  // Initialize time slot tasks based on schedule field
  useEffect(() => {
    const focusTasks = getFocusTasks();
    setTimeSlotTasks({
      morning: focusTasks.filter((task: Task) => task.schedule === "morning"),
      midday: focusTasks.filter((task: Task) => task.schedule === "midday"),
      evening: focusTasks.filter((task: Task) => task.schedule === "evening"),
    });
  }, [getFocusTasks]);

  const createWeekNavigation = (): DayNavigation[] => {
    const weekStart = getCurrentWeekStart();
    const today = new Date();

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      const isToday = date.toDateString() === today.toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6; // Sunday or Saturday
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const dayShort = date.toLocaleDateString("en-US", { weekday: "short" });

      // Count tasks scheduled for this day
      const taskCount = tasks.filter((task) => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.toDateString() === date.toDateString() &&
          (task.status === "signal" || task.status === "inbox")
        );
      }).length;

      return {
        date,
        dayName,
        dayShort,
        isToday,
        isWeekend,
        taskCount,
      };
    });
  };

  const getUnscheduledWeekTasks = (): Task[] => {
    // Get Signal and Inbox tasks that don't have a due date or are scheduled for this week but not yet assigned to time slots
    const weekStart = getCurrentWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return tasks.filter((task) => {
      const isSignalOrInbox =
        task.status === "signal" || task.status === "inbox";
      if (!isSignalOrInbox) return false;

      // Exclude tasks that already have a schedule (are assigned to time slots)
      if (task.schedule) return false;

      // Include tasks with no due date (truly unscheduled)
      if (!task.dueDate) return true;

      const taskDate = new Date(task.dueDate);
      // Include tasks that are within the selected week but not scheduled to time slots
      return taskDate >= weekStart && taskDate <= weekEnd;
    });
  };

  const getSelectedDayTasks = (): Task[] => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.toDateString() === selectedDay.toDateString() &&
        (task.status === "signal" || task.status === "inbox")
      );
    });
  };

  const createDayTimeSlots = (): DayTimeSlot[] => {
    const selectedDayTasks = getSelectedDayTasks();

    // Categorize tasks based on their schedule field
    const categorizeTasks = () => {
      const morningTasks: Task[] = [];
      const middayTasks: Task[] = [];
      const eveningTasks: Task[] = [];

      selectedDayTasks.forEach((task) => {
        // Use the schedule field to categorize tasks
        if (task.schedule === "morning") {
          morningTasks.push(task);
        } else if (task.schedule === "midday") {
          middayTasks.push(task);
        } else if (task.schedule === "evening") {
          eveningTasks.push(task);
        }
        // Tasks without a schedule field don't appear in time slots
      });

      return { morningTasks, middayTasks, eveningTasks };
    };

    const { morningTasks, middayTasks, eveningTasks } = categorizeTasks();

    return [
      {
        id: "morning",
        label: "Morning",
        timeRange: "9:00 AM - 11:00 AM",
        icon: <Sunrise className="h-5 w-5 text-yellow-400" />,
        tasks: morningTasks,
      },
      {
        id: "midday",
        label: "Midday",
        timeRange: "12:00 PM - 2:00 PM",
        icon: <Sun className="h-5 w-5 text-orange-400" />,
        tasks: middayTasks,
      },
      {
        id: "evening",
        label: "Evening",
        timeRange: "3:00 PM - 6:00 PM",
        icon: <Sunset className="h-5 w-5 text-purple-400" />,
        tasks: eveningTasks,
      },
    ];
  };

  const handleDayTimeSlotDrop = async (
    taskId: string,
    timeSlotId: DayTimeSlot["id"]
  ) => {
    try {
      // Set the due date to the selected day with specific time based on slot
      const dueDate = new Date(selectedDay);

      // Set time based on slot to match our time ranges
      switch (timeSlotId) {
        case "morning":
          dueDate.setHours(10, 0, 0, 0); // 10 AM (middle of 9-11 range)
          break;
        case "midday":
          dueDate.setHours(13, 0, 0, 0); // 1 PM (middle of 12-2 range)
          break;
        case "evening":
          dueDate.setHours(16, 30, 0, 0); // 4:30 PM (middle of 3-6 range)
          break;
      }

      await updateTask(taskId, {
        dueDate,
        schedule: timeSlotId as "morning" | "midday" | "evening", // Set the schedule field
        status: "signal", // Move to signal when planned
      });
    } catch (error) {
      console.error("Failed to schedule task:", error);
    }
  };

  // Week Navigation Functions
  const navigateToPreviousWeek = () => {
    const prevWeek = new Date(selectedWeek);
    prevWeek.setDate(selectedWeek.getDate() - 7);
    setSelectedWeek(prevWeek);

    // Update selected day to the same weekday in the new week
    const dayOffset = selectedDay.getDate() - selectedWeek.getDate();
    const newSelectedDay = new Date(prevWeek);
    newSelectedDay.setDate(prevWeek.getDate() + dayOffset);
    setSelectedDay(newSelectedDay);
  };

  const navigateToNextWeek = () => {
    const nextWeek = new Date(selectedWeek);
    nextWeek.setDate(selectedWeek.getDate() + 7);
    setSelectedWeek(nextWeek);

    // Update selected day to the same weekday in the new week
    const dayOffset = selectedDay.getDate() - selectedWeek.getDate();
    const newSelectedDay = new Date(nextWeek);
    newSelectedDay.setDate(nextWeek.getDate() + dayOffset);
    setSelectedDay(newSelectedDay);
  };

  const getCurrentWeekStart = (): Date => {
    return selectedWeek;
  };
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
              onClick={() => setCurrentView("weekly")}
              className={`px-2 py-1 text-xs rounded-full transition-colors flex items-center ${
                currentView === "weekly"
                  ? "bg-green-500/20 text-green-400 border border-green-500/50"
                  : "bg-slate-800/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700/50"
              }`}
            >
              <Calendar className="mr-1 h-3 w-3" />
              Weekly
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

            <WeeklyTaskColumn
              title="Signal (80%)"
              tasks={getTasksByStatus("signal")}
              icon={<Target className="mr-1 h-3 w-3 text-cyan-400" />}
              accent="border-cyan-500/50"
              status="signal"
            />

            <WeeklyTaskColumn
              title="Noise (20%)"
              tasks={getTasksByStatus("noise")}
              icon={<Clock className="mr-1 h-3 w-3 text-purple-400" />}
              accent="border-purple-500/30"
              status="noise"
            />
          </div>
        ) : currentView === "weekly" ? (
          // Weekly Planning View - Day Navigation with Time Slots
          <div className="h-full flex flex-col">
            {/* Week Navigation */}
            <WeekNavBar
              days={createWeekNavigation()}
              selectedDay={selectedDay}
              onDaySelect={setSelectedDay}
              onPreviousWeek={navigateToPreviousWeek}
              onNextWeek={navigateToNextWeek}
              currentWeek={selectedWeek}
            />

            {/* Main Layout: Task Pool + Selected Day */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Task Pool */}
              <TaskPool
                weekTasks={getUnscheduledWeekTasks()}
                onTaskEdit={handleEditTask}
              />

              {/* Right: Selected Day with Time Slots */}
              <div className="flex-1 p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-200 mb-2">
                    {selectedDay.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                  <p className="text-slate-400">
                    {selectedDay.toDateString() === new Date().toDateString()
                      ? "Today - Plan your day"
                      : "Drag tasks from the left to schedule them"}
                  </p>
                </div>

                {/* Time Slots for Selected Day - Vertical Layout */}
                <div className="space-y-6 h-full overflow-y-auto">
                  {createDayTimeSlots().map((timeSlot) => (
                    <DayTimeSection
                      key={timeSlot.id}
                      timeSlot={timeSlot}
                      onDrop={handleDayTimeSlotDrop}
                      onTaskEdit={handleEditTask}
                      isActiveTime={false} // We can add logic for this later
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Focus View - Daily Timeline
          <div className="space-y-6">
            {/* Daily Progress */}
            <DailyProgressBar
              progress={getDailyProgress()}
              currentHour={currentHour}
            />

            {/* Current Task */}
            <CurrentTaskSection
              currentTask={currentTask}
              timerSeconds={timerSeconds}
              isTimerRunning={isTimerRunning}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onComplete={completeCurrentTask}
              onDrop={handleCurrentTaskDrop}
              formatTime={formatTime}
            />

            {/* Time Slots */}
            <div className="space-y-6">
              {timeSlots.map((timeSlot) => (
                <TimeSlotSection
                  key={timeSlot.id}
                  timeSlot={timeSlot}
                  onDrop={handleTimeSlotDrop}
                  onUnschedule={handleUnscheduleTask}
                  onStartTask={startTask}
                  currentTask={currentTask}
                  currentHour={currentHour}
                />
              ))}
            </div>

            {/* Unscheduled Tasks */}
            {getTodaysTasks().filter(
              (task: Task) =>
                !timeSlots.some((slot) =>
                  slot.tasks.some((t: Task) => t.id === task.id)
                )
            ).length > 0 && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4">
                <h3 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Unscheduled Tasks
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {getTodaysTasks()
                    .filter(
                      (task: Task) =>
                        !timeSlots.some((slot) =>
                          slot.tasks.some((t: Task) => t.id === task.id)
                        )
                    )
                    .map((task: Task) => (
                      <div
                        key={task.id}
                        className="bg-slate-800/60 border border-slate-700/50 rounded p-2 text-sm cursor-pointer hover:bg-slate-800/80 transition-colors"
                        draggable
                        onDragStart={(e) =>
                          e.dataTransfer.setData("taskId", task.id)
                        }
                        onClick={() => handleEditTask(task)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-slate-200 truncate">
                            {task.title}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">
                            {task.size}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
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
