import React from "react";
import { BarChart3, LineChart } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  trend: "up" | "down" | "stable";
  color: string;
  detail: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
  detail,
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
        return <BarChart3 className="h-4 w-4 text-amber-500" />;
      case "down":
        return <BarChart3 className="h-4 w-4 rotate-180 text-green-500" />;
      case "stable":
        return <LineChart className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-slate-800/50 rounded-md border ${getColor()} p-3 relative overflow-hidden`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">{title}</div>
        <Icon className="h-4 w-4 text-cyan-500" />
      </div>
      <div className="text-xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">
        {value}%
      </div>
      <div className="text-xs text-slate-500">{detail}</div>
      <div className="absolute bottom-2 right-2 flex items-center">
        {getTrendIcon()}
      </div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-cyan-500 to-blue-500"></div>
    </div>
  );
};

export default MetricCard;
