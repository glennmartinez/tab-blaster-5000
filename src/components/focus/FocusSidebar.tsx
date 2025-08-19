import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  AlertTriangle,
  Coffee,
  Users,
  Zap,
  MessageCircle,
  Target,
  TrendingUp,
  Save,
  X,
} from "lucide-react";
import { useDisruptions } from "../../hooks/useDisruptions";
import { useFocusSession } from "../../hooks/useFocusSession";
import { Disruption } from "../../interfaces/DisruptionInterface";

interface FocusSidebarProps {
  className?: string;
}

interface DisruptionFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (title: string, category: Disruption["category"]) => void;
}

const DisruptionForm: React.FC<DisruptionFormProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Disruption["category"]>("other");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim(), category);
      setTitle("");
      setCategory("other");
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4 mb-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-slate-200">
            Track Disruption
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-700/50 rounded transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What happened?"
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-md text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          autoFocus
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as Disruption["category"])
          }
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="meeting">Meeting</option>
          <option value="email">Email</option>
          <option value="slack">Slack/Chat</option>
          <option value="support">Support</option>
          <option value="bug-fix">Bug Fix</option>
          <option value="break">Break</option>
          <option value="research">Research</option>
          <option value="other">Other</option>
        </select>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Start Tracking
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-slate-200 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

interface ManualEntryFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (
    title: string,
    category: Disruption["category"],
    startTime: Date,
    duration: number
  ) => void;
}

const ManualEntryForm: React.FC<ManualEntryFormProps> = ({
  isVisible,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Disruption["category"]>("other");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (isVisible && !startTime) {
      // Default to current time minus 10 minutes
      const now = new Date();
      now.setMinutes(now.getMinutes() - 10);
      setStartTime(now.toISOString().slice(0, 16));
    }
  }, [isVisible, startTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && startTime && duration) {
      const startDateTime = new Date(startTime);
      const durationMinutes = parseInt(duration, 10);
      onSubmit(title.trim(), category, startDateTime, durationMinutes);
      setTitle("");
      setStartTime("");
      setDuration("");
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4 mb-4 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-slate-200">Manual Entry</h4>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-700/50 rounded transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Disruption description"
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-md text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          autoFocus
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as Disruption["category"])
          }
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="meeting">Meeting</option>
          <option value="email">Email</option>
          <option value="slack">Slack/Chat</option>
          <option value="support">Support</option>
          <option value="bug-fix">Bug Fix</option>
          <option value="break">Break</option>
          <option value="research">Research</option>
          <option value="other">Other</option>
        </select>

        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />

        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (minutes)"
          min="1"
          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/30 rounded-md text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Save Entry
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-slate-200 rounded-md text-sm font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const FocusSidebar: React.FC<FocusSidebarProps> = ({ className = "" }) => {
  const {
    activeDisruption,
    todaysDisruptions,
    disruptionSummary,
    startDisruption,
    endDisruption,
    createManualDisruption,
    getActiveDisruptionTimer,
  } = useDisruptions();

  const { currentSession } = useFocusSession();

  const [showDisruptionForm, setShowDisruptionForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [activeDisruptionTimer, setActiveDisruptionTimer] = useState("");

  // Update active disruption timer every minute
  useEffect(() => {
    const updateTimer = () => {
      setActiveDisruptionTimer(getActiveDisruptionTimer());
    };

    updateTimer(); // Initial update
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeDisruption, getActiveDisruptionTimer]);

  const handleStartDisruption = async (
    title: string,
    category: Disruption["category"]
  ) => {
    await startDisruption(title, category, currentSession?.taskId);
  };

  const handleEndDisruption = async () => {
    await endDisruption();
  };

  const handleManualEntry = async (
    title: string,
    category: Disruption["category"],
    startTime: Date,
    duration: number
  ) => {
    await createManualDisruption(
      title,
      category,
      startTime,
      duration,
      currentSession?.taskId
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "meeting":
        return <Users className="h-4 w-4" />;
      case "break":
        return <Coffee className="h-4 w-4" />;
      case "email":
        return <MessageCircle className="h-4 w-4" />;
      case "slack":
        return <MessageCircle className="h-4 w-4" />;
      case "bug-fix":
        return <AlertTriangle className="h-4 w-4" />;
      case "support":
        return <Users className="h-4 w-4" />;
      case "research":
        return <Zap className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "meeting":
        return "text-blue-400";
      case "break":
        return "text-green-400";
      case "email":
        return "text-yellow-400";
      case "slack":
        return "text-purple-400";
      case "bug-fix":
        return "text-red-400";
      case "support":
        return "text-cyan-400";
      case "research":
        return "text-orange-400";
      default:
        return "text-slate-400";
    }
  };

  return (
    <div
      className={`bg-slate-800/40 backdrop-blur-sm border-l border-slate-600/30 min-h-screen ${className}`}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Target className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Focus Mode</h3>
            <p className="text-sm text-slate-400">
              Track disruptions & stay focused
            </p>
          </div>
        </div>

        {/* Active Disruption */}
        {activeDisruption && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getCategoryIcon(activeDisruption.category)}
                <span className="font-medium text-red-400">
                  Active Disruption
                </span>
              </div>
              <span className="text-sm text-slate-300 font-mono">
                {activeDisruptionTimer}
              </span>
            </div>
            <p className="text-slate-200 mb-3">{activeDisruption.title}</p>
            <button
              onClick={handleEndDisruption}
              className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              End Disruption
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-300">Quick Actions</h4>

          {!activeDisruption && (
            <button
              onClick={() => setShowDisruptionForm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 font-medium">
                Track Disruption
              </span>
            </button>
          )}

          <button
            onClick={() => setShowManualForm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg transition-colors"
          >
            <Save className="h-4 w-4 text-green-400" />
            <span className="text-green-400 font-medium">Manual Entry</span>
          </button>
        </div>

        {/* Forms */}
        <DisruptionForm
          isVisible={showDisruptionForm}
          onClose={() => setShowDisruptionForm(false)}
          onSubmit={handleStartDisruption}
        />

        <ManualEntryForm
          isVisible={showManualForm}
          onClose={() => setShowManualForm(false)}
          onSubmit={handleManualEntry}
        />

        {/* Today's Summary */}
        {disruptionSummary && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300">
              Today's Summary
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-slate-200">
                  {disruptionSummary.totalDisruptions}
                </div>
                <div className="text-xs text-slate-400">Disruptions</div>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                <div className="text-lg font-semibold text-slate-200">
                  {Math.round(disruptionSummary.totalDisruptionTime)}m
                </div>
                <div className="text-xs text-slate-400">Lost Time</div>
              </div>
            </div>

            {disruptionSummary.averageDisruptionLength > 0 && (
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Avg Length</span>
                  <span className="text-sm font-medium text-slate-200">
                    {Math.round(disruptionSummary.averageDisruptionLength)}m
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-slate-300">Most Common</span>
                  <span
                    className={`text-sm font-medium capitalize ${getCategoryColor(
                      disruptionSummary.mostCommonCategory
                    )}`}
                  >
                    {disruptionSummary.mostCommonCategory}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Disruptions */}
        {todaysDisruptions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-300">
              Recent Disruptions
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {todaysDisruptions
                .filter((d) => d.endTime) // Only show completed disruptions
                .slice(-5) // Last 5
                .reverse() // Most recent first
                .map((disruption) => (
                  <div
                    key={disruption.id}
                    className="bg-slate-700/20 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={getCategoryColor(disruption.category)}>
                        {getCategoryIcon(disruption.category)}
                      </span>
                      <span className="text-sm font-medium text-slate-200 flex-1">
                        {disruption.title}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {disruption.duration}m
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {disruption.startTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Focus Tips */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Focus Tip</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {disruptionSummary?.totalDisruptions &&
            disruptionSummary.totalDisruptions > 3
              ? "Consider setting specific times for emails and messages to reduce interruptions."
              : "You're doing great! Keep tracking disruptions to identify patterns and improve focus."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FocusSidebar;
