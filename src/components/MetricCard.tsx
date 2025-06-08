import React from "react";
import { BarChart3, LineChart } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend: "up" | "down" | "stable";
  color: string;
  detail: string;
  showPercentageSymbol?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
  detail,
  showPercentageSymbol = true,
}) => {
  const getColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500 border-cyan-500/30";
      case "green":
        return "from-green-500 to-emerald-500 border-green-500/30";
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-500/30";
      case "purple":
        return "from-purple-500 to-pink-500 border-purple-500/30";
      default:
        return "from-cyan-500 to-blue-500 border-cyan-500/30";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return (
          <BarChart3 className="w-4 h-4 text-red-400" data-testid="trend-up" />
        );
      case "down":
        return (
          <LineChart
            className="w-4 h-4 text-green-400"
            data-testid="trend-down"
          />
        );
      case "stable":
      default:
        return (
          <div
            className="w-4 h-4 border-2 border-slate-400 rounded-full"
            data-testid="trend-stable"
          ></div>
        );
    }
  };

  const displayValue = () => {
    if (typeof value === "string") return value;
    return `${value}${showPercentageSymbol ? "%" : ""}`;
  };

  return (
    <div
      className={`relative bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 backdrop-blur-sm overflow-hidden`}
      data-component="MetricCard"
      data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
      data-metric-type={color}
    >
      <div className="flex items-center justify-between mb-2">
        <h3
          className="text-sm font-medium text-slate-300"
          data-testid="metric-title"
        >
          {title}
        </h3>
        <Icon
          className={`h-4 w-4 bg-gradient-to-r ${getColor()} bg-clip-text`}
          data-testid="metric-icon"
        />
      </div>
      <div
        className="text-xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300"
        data-testid="metric-value"
      >
        {displayValue()}
      </div>
      <div className="text-xs text-slate-500" data-testid="metric-detail">
        {detail}
      </div>
      <div
        className="absolute bottom-2 right-2 flex items-center"
        data-testid="metric-trend"
      >
        {getTrendIcon()}
      </div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-cyan-500 to-blue-500"></div>
    </div>
  );
};

MetricCard.displayName = "MetricCard";

export default MetricCard;
