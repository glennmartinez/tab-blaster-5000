import React from "react";
import { Clock, TrendingUp } from "lucide-react";

interface UsageIndicatorProps {
  visitCount: number;
  lastAccess: Date | null;
  calculatedScore: number;
  compact?: boolean;
}

export const UsageIndicator: React.FC<UsageIndicatorProps> = ({
  visitCount,
  lastAccess,
  calculatedScore,
  compact = false,
}) => {
  const formatLastAccess = (date: Date | null): string => {
    if (!date) return "Never visited";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}w ago`;
    } else {
      return `${Math.floor(diffDays / 30)}mo ago`;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 4) return "text-green-400";
    if (score >= 3) return "text-yellow-400";
    if (score >= 2) return "text-orange-400";
    return "text-slate-400";
  };

  const getScoreBackground = (score: number): string => {
    if (score >= 4) return "bg-green-400/20 border-green-400/50";
    if (score >= 3) return "bg-yellow-400/20 border-yellow-400/50";
    if (score >= 2) return "bg-orange-400/20 border-orange-400/50";
    return "bg-slate-400/20 border-slate-400/50";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>{visitCount}</span>
        </div>
        <div
          className={`px-2 py-0.5 rounded-full border text-xs ${getScoreBackground(
            calculatedScore
          )}`}
        >
          <span className={getScoreColor(calculatedScore)}>
            {calculatedScore.toFixed(1)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1 text-slate-400">
        <TrendingUp className="w-3 h-3" />
        <span>{visitCount} visits</span>
      </div>

      <div className="flex items-center gap-1 text-slate-400">
        <Clock className="w-3 h-3" />
        <span>{formatLastAccess(lastAccess)}</span>
      </div>

      <div
        className={`px-2 py-1 rounded-full border text-xs ${getScoreBackground(
          calculatedScore
        )}`}
      >
        <span className={getScoreColor(calculatedScore)}>
          Score: {calculatedScore.toFixed(1)}
        </span>
      </div>
    </div>
  );
};
