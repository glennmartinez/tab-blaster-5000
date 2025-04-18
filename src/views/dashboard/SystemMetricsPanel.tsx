import React from "react";
import { SystemMetrics, SystemStatus } from "../../models/SystemMetrics";

interface SystemMetricsPanelProps {
  metrics: SystemMetrics | null;
  status: SystemStatus | null;
  recommendations: string[];
  loading: boolean;
}

/**
 * Component to display system metrics and recommendations
 */
const SystemMetricsPanel: React.FC<SystemMetricsPanelProps> = ({
  metrics,
  status,
  recommendations,
  loading,
}) => {
  if (loading && !metrics) {
    return (
      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-pulse text-blue-400">Loading metrics...</div>
        </div>
      </div>
    );
  }

  // Determine status color
  const statusColor = status
    ? {
        healthy: "bg-green-500",
        warning: "bg-yellow-500",
        critical: "bg-red-500",
      }[status.status]
    : "bg-gray-500";

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-lg font-semibold text-white">System Overview</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Memory Usage */}
        <div className="bg-slate-800/60 rounded-lg p-4 flex flex-col">
          <div className="text-sm text-slate-400 mb-1">Memory Usage</div>
          <div className="text-2xl font-semibold">
            {metrics?.memoryUsage.usagePercentage || 0}%
          </div>
          <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                (metrics?.memoryUsage.usagePercentage || 0) > 80
                  ? "bg-red-500"
                  : (metrics?.memoryUsage.usagePercentage || 0) > 60
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${metrics?.memoryUsage.usagePercentage || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Open Tabs Count */}
        <div className="bg-slate-800/60 rounded-lg p-4 flex flex-col">
          <div className="text-sm text-slate-400 mb-1">Open Tabs</div>
          <div className="text-2xl font-semibold">{metrics?.tabCount || 0}</div>
          <div className="mt-2 text-sm text-slate-400">
            Across {metrics?.windowCount || 0} window
            {(metrics?.windowCount || 0) !== 1 ? "s" : ""}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-slate-800/60 rounded-lg p-4 flex flex-col">
          <div className="text-sm text-slate-400 mb-1">System Status</div>
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${statusColor}`}></div>
            <div className="text-lg font-semibold capitalize">
              {status?.status || "Unknown"}
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-400">
            {status?.message || "No status information available"}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="p-4 pt-0">
          <div className="bg-slate-800/40 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-2">
              Recommendations:
            </h3>
            <ul className="space-y-1">
              {recommendations.map((recommendation, index) => (
                <li
                  key={index}
                  className="text-sm text-slate-400 flex items-start"
                >
                  <span className="text-blue-400 mr-2">•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemMetricsPanel;
