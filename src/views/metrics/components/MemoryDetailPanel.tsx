import React from "react";
import { SystemMetrics } from "../../../models/SystemMetrics";
import { Memory, HardDrive, PieChart, Database } from "lucide-react";

interface MemoryDetailPanelProps {
  metrics?: SystemMetrics;
}

const MemoryDetailPanel: React.FC<MemoryDetailPanelProps> = ({ metrics }) => {
  // Format memory size to readable format
  const formatMemory = (memoryBytes?: number): string => {
    if (!memoryBytes) return "0 MB";
    
    if (memoryBytes >= 1024 * 1024 * 1024) {
      return `${(memoryBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    } else if (memoryBytes >= 1024 * 1024) {
      return `${(memoryBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else if (memoryBytes >= 1024) {
      return `${(memoryBytes / 1024).toFixed(2)} KB`;
    }
    return `${memoryBytes} Bytes`;
  };

  // Calculate memory usage percentages
  const getBrowserMemoryPercentage = (): number => {
    if (!metrics?.memoryUsage?.browserMemoryMB || !metrics?.memoryUsage?.totalMemoryMB) return 0;
    return (metrics.memoryUsage.browserMemoryMB / metrics.memoryUsage.totalMemoryMB) * 100;
  };

  // Determine memory status based on usage
  const getMemoryStatus = (): { status: string; color: string } => {
    const percentage = getBrowserMemoryPercentage();
    
    if (percentage > 80) return { status: "Critical", color: "text-red-500" };
    if (percentage > 60) return { status: "High", color: "text-amber-500" };
    if (percentage > 40) return { status: "Moderate", color: "text-yellow-500" };
    return { status: "Normal", color: "text-green-500" };
  };

  const memoryStatus = getMemoryStatus();

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Memory className="text-blue-500 mr-3" size={24} />
        <h2 className="text-xl font-bold text-slate-200">Memory Usage Details</h2>
      </div>
      
      {/* Memory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Memory Card */}
        <div className="bg-slate-800/60 rounded-lg p-5 border border-slate-700/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 font-medium">Total System Memory</h3>
            <HardDrive size={18} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatMemory(metrics?.memoryUsage?.totalMemoryMB ? metrics.memoryUsage.totalMemoryMB * 1024 * 1024 : undefined)}
          </div>
          <div className="text-sm text-slate-400">Available on your system</div>
        </div>
        
        {/* Browser Memory Card */}
        <div className="bg-slate-800/60 rounded-lg p-5 border border-slate-700/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 font-medium">Browser Memory</h3>
            <Memory size={18} className="text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatMemory(metrics?.memoryUsage?.browserMemoryMB ? metrics.memoryUsage.browserMemoryMB * 1024 * 1024 : undefined)}
          </div>
          <div className="text-sm text-slate-400">Used by browser process</div>
        </div>
        
        {/* Memory Usage Percent Card */}
        <div className="bg-slate-800/60 rounded-lg p-5 border border-slate-700/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 font-medium">Memory Usage</h3>
            <PieChart size={18} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {getBrowserMemoryPercentage().toFixed(1)}%
          </div>
          <div className="text-sm text-slate-400">Of total system memory</div>
        </div>
        
        {/* Memory Status Card */}
        <div className="bg-slate-800/60 rounded-lg p-5 border border-slate-700/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 font-medium">Memory Status</h3>
            <Database size={18} className={memoryStatus.color} />
          </div>
          <div className={`text-2xl font-bold ${memoryStatus.color} mb-1`}>
            {memoryStatus.status}
          </div>
          <div className="text-sm text-slate-400">
            {memoryStatus.status === "Normal" ? "Memory usage is healthy" : "Consider closing tabs"}
          </div>
        </div>
      </div>
      
      {/* Memory Usage Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Memory Usage Breakdown */}
        <div className="lg:col-span-2 bg-slate-800/30 rounded-lg p-6 border border-slate-700/30">
          <h3 className="text-lg font-medium text-slate-200 mb-6">Memory Distribution</h3>
          
          {/* Memory Usage Bar */}
          <div className="mb-8">
            <div className="h-8 w-full bg-slate-700/50 rounded-lg overflow-hidden flex">
              <div 
                className="h-full bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${getBrowserMemoryPercentage()}%` }}
              >
                {getBrowserMemoryPercentage() > 10 ? `${getBrowserMemoryPercentage().toFixed(1)}%` : ''}
              </div>
              <div 
                className="h-full bg-slate-700/70 flex items-center justify-center text-xs text-white font-medium"
                style={{ width: `${100 - getBrowserMemoryPercentage()}%` }}
              >
                {100 - getBrowserMemoryPercentage() > 10 ? `${(100 - getBrowserMemoryPercentage()).toFixed(1)}%` : ''}
              </div>
            </div>
            <div className="flex justify-between text-sm text-slate-400 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-blue-500 mr-2"></div>
                <span>Browser ({getBrowserMemoryPercentage().toFixed(1)}%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-sm bg-slate-700 mr-2"></div>
                <span>Other Processes ({(100 - getBrowserMemoryPercentage()).toFixed(1)}%)</span>
              </div>
            </div>
          </div>
          
          {/* Tab Memory Distribution */}
          <h4 className="text-md font-medium text-slate-300 mb-3">Tab Memory Distribution</h4>
          <div className="space-y-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Active Tabs</span>
              <span className="text-slate-300">
                {formatMemory(metrics?.memoryUsage?.activeTabsMemory)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-500"
                style={{ width: `${metrics?.memoryUsage?.activeTabsMemory ? 
                  (metrics.memoryUsage.activeTabsMemory / (metrics.memoryUsage.browserMemoryMB || 1) / 1024) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Background Tabs</span>
              <span className="text-slate-300">
                {formatMemory(metrics?.memoryUsage?.backgroundTabsMemory)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500"
                style={{ width: `${metrics?.memoryUsage?.backgroundTabsMemory ?
                  (metrics.memoryUsage.backgroundTabsMemory / (metrics.memoryUsage.browserMemoryMB || 1) / 1024) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Extensions</span>
              <span className="text-slate-300">
                {formatMemory(metrics?.memoryUsage?.extensionsMemory)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500"
                style={{ width: `${metrics?.memoryUsage?.extensionsMemory ?
                  (metrics.memoryUsage.extensionsMemory / (metrics.memoryUsage.browserMemoryMB || 1) / 1024) * 100 : 0}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Browser Processes</span>
              <span className="text-slate-300">
                {formatMemory(metrics?.memoryUsage?.browserProcessesMemory)}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${metrics?.memoryUsage?.browserProcessesMemory ?
                  (metrics.memoryUsage.browserProcessesMemory / (metrics.memoryUsage.browserMemoryMB || 1) / 1024) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm bg-cyan-500 mr-2"></div>
              <span className="text-sm text-slate-300">Active Tabs</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm bg-purple-500 mr-2"></div>
              <span className="text-sm text-slate-300">Background Tabs</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm bg-amber-500 mr-2"></div>
              <span className="text-sm text-slate-300">Extensions</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-sm bg-green-500 mr-2"></div>
              <span className="text-sm text-slate-300">Browser Processes</span>
            </div>
          </div>
        </div>
        
        {/* Memory Trends */}
        <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/30">
          <h3 className="text-lg font-medium text-slate-200 mb-6">Memory Trends</h3>
          
          <div className="space-y-4">
            {/* Placeholder for memory trend chart */}
            <div className="h-40 mb-6 rounded-md bg-slate-800/50 border border-slate-700/30 flex items-center justify-center">
              <div className="text-slate-400 text-center">
                <PieChart size={32} className="mx-auto mb-2 text-slate-500" />
                <p className="text-sm">Memory trend visualization</p>
                <p className="text-xs text-slate-500 mt-1">Data will appear here as you browse</p>
              </div>
            </div>
            
            {/* Memory metrics */}
            <div className="space-y-3">
              <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/40 flex justify-between">
                <span className="text-sm text-slate-300">Peak Memory Usage</span>
                <span className="text-sm font-medium text-blue-400">
                  {formatMemory(metrics?.memoryUsage?.peakMemoryMB ? metrics.memoryUsage.peakMemoryMB * 1024 * 1024 : undefined)}
                </span>
              </div>
              
              <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/40 flex justify-between">
                <span className="text-sm text-slate-300">Average Memory/Tab</span>
                <span className="text-sm font-medium text-green-400">
                  {formatMemory(metrics?.tabCount && metrics?.memoryUsage?.browserMemoryMB 
                    ? (metrics.memoryUsage.browserMemoryMB * 1024 * 1024) / metrics.tabCount 
                    : undefined)}
                </span>
              </div>
              
              <div className="bg-slate-800/50 p-3 rounded-md border border-slate-700/40 flex justify-between">
                <span className="text-sm text-slate-300">Memory Growth Rate</span>
                <span className="text-sm font-medium text-purple-400">
                  ~0.5 MB/tab
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Memory Management Tips */}
      <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/30">
        <h3 className="text-lg font-medium text-slate-200 mb-4">Memory Management Tips</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="min-w-[24px] h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-500 text-xs">1</span>
            </div>
            <div>
              <p className="text-slate-300">Close inactive tabs to free up memory</p>
              <p className="text-xs text-slate-500 mt-1">
                Each tab consumes memory even when not in active use. Regularly close tabs you no longer need.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="min-w-[24px] h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-green-500 text-xs">2</span>
            </div>
            <div>
              <p className="text-slate-300">Use tab groups for better organization</p>
              <p className="text-xs text-slate-500 mt-1">
                Group related tabs together and collapse groups you're not actively using to reduce mental overhead.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="min-w-[24px] h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-purple-500 text-xs">3</span>
            </div>
            <div>
              <p className="text-slate-300">Save important tab sessions</p>
              <p className="text-xs text-slate-500 mt-1">
                Instead of keeping tabs open perpetually, save them as sessions and reopen them when needed.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="min-w-[24px] h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-amber-500 text-xs">4</span>
            </div>
            <div>
              <p className="text-slate-300">Limit browser extensions</p>
              <p className="text-xs text-slate-500 mt-1">
                Each active extension consumes additional memory. Disable extensions you don't use regularly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetailPanel;