import React from "react";
import { SystemMetrics } from "../../../models/SystemMetrics";
import { HardDrive, PieChart, Database } from "lucide-react";

interface MemoryDetailPanelProps {
  metrics?: SystemMetrics;
}

const MemoryDetailPanel: React.FC<MemoryDetailPanelProps> = ({ metrics }) => {
  const formatMemory = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes.toFixed(2)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const getMemoryPercentage = (memoryMB: number) => {
    if (!metrics?.memoryUsage?.browserMemoryMB) return 0;
    return (memoryMB / metrics.memoryUsage.browserMemoryMB) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Browser Memory Section */}
      <div className="bg-slate-800/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-100">
            Browser Memory Usage
          </h3>
          <div className="flex items-center text-sm text-slate-400">
            <Database className="w-4 h-4 mr-1" />
            {formatMemory(
              metrics?.memoryUsage?.browserMemoryMB
                ? metrics.memoryUsage.browserMemoryMB * 1024 * 1024
                : undefined
            )}
          </div>
        </div>

        {/* Active Tabs Memory */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <div className="text-sm text-slate-400">Active Tabs</div>
            <div className="text-sm text-slate-400">
              {formatMemory(
                metrics?.memoryUsage?.usedMemoryMB
                  ? metrics.memoryUsage.usedMemoryMB * 1024 * 1024
                  : 0
              )}
            </div>
          </div>
          <div className="w-full bg-slate-700/30 rounded-full h-2">
            <div
              className="bg-cyan-500 rounded-full h-2 transition-all duration-300"
              style={{
                width: `${
                  metrics?.memoryUsage?.usedMemoryMB
                    ? getMemoryPercentage(metrics.memoryUsage.usedMemoryMB)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Extension Memory */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <div className="text-sm text-slate-400">Extensions</div>
            <div className="text-sm text-slate-400">
              {formatMemory(
                metrics?.memoryUsage?.extensionMemoryMB
                  ? metrics.memoryUsage.extensionMemoryMB * 1024 * 1024
                  : 0
              )}
            </div>
          </div>
          <div className="w-full bg-slate-700/30 rounded-full h-2">
            <div
              className="bg-purple-500 rounded-full h-2 transition-all duration-300"
              style={{
                width: `${
                  metrics?.memoryUsage?.extensionMemoryMB
                    ? getMemoryPercentage(metrics.memoryUsage.extensionMemoryMB)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Browser Processes */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <div className="text-sm text-slate-400">Browser Processes</div>
            <div className="text-sm text-slate-400">
              {formatMemory(metrics?.memoryUsage?.totalJSHeapSize)}
            </div>
          </div>
          <div className="w-full bg-slate-700/30 rounded-full h-2">
            <div
              className="bg-blue-500 rounded-full h-2 transition-all duration-300"
              style={{
                width: `${
                  metrics?.memoryUsage?.totalJSHeapSize
                    ? (metrics.memoryUsage.totalJSHeapSize /
                        (metrics.memoryUsage.jsHeapSizeLimit || 1)) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Memory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <HardDrive className="w-5 h-5 mr-2 text-cyan-500" />
            <h3 className="text-lg font-medium text-slate-100">Memory Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="text-sm text-slate-400">Total Memory</div>
              <div className="text-sm text-slate-300">
                {formatMemory(
                  metrics?.memoryUsage?.totalMemoryMB
                    ? metrics.memoryUsage.totalMemoryMB * 1024 * 1024
                    : undefined
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-slate-400">Used Memory</div>
              <div className="text-sm text-slate-300">
                {formatMemory(
                  metrics?.memoryUsage?.usedMemoryMB
                    ? metrics.memoryUsage.usedMemoryMB * 1024 * 1024
                    : undefined
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-slate-400">JS Heap Size</div>
              <div className="text-sm text-slate-300">
                {formatMemory(metrics?.memoryUsage?.totalJSHeapSize)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="flex items-center mb-4">
            <PieChart className="w-5 h-5 mr-2 text-purple-500" />
            <h3 className="text-lg font-medium text-slate-100">Usage Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <div className="text-sm text-slate-400">Memory Usage</div>
              <div className="text-sm text-slate-300">
                {metrics?.memoryUsage?.usagePercentage.toFixed(1)}%
              </div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-slate-400">Total Windows</div>
              <div className="text-sm text-slate-300">
                {metrics?.windowCount}
              </div>
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-slate-400">Total Tabs</div>
              <div className="text-sm text-slate-300">{metrics?.tabCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetailPanel;
