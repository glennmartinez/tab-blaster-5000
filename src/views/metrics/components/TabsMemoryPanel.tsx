import React, { useState } from "react";
import { SystemMetrics, TabMemoryInfo } from "../../../models/SystemMetrics";
import { Layers, HardDrive, Search, X, ExternalLink } from "lucide-react";

interface TabsMemoryPanelProps {
  metrics?: SystemMetrics;
  topMemoryConsumers?: TabMemoryInfo[];
}

const TabsMemoryPanel: React.FC<TabsMemoryPanelProps> = ({ 
  metrics,
  topMemoryConsumers = [] 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"memory" | "name">("memory");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Format memory size to readable format - KB to MB
  const formatMemory = (memoryBytes: number | undefined): string => {
    if (!memoryBytes) return "0 MB";
    const memoryMB = memoryBytes / 1024;
    return memoryMB >= 1024
      ? `${(memoryMB / 1024).toFixed(2)} GB`
      : `${memoryMB.toFixed(2)} MB`;
  };

  // Filtered and sorted tabs
  const filteredTabs = topMemoryConsumers
    .filter(tab => 
      tab.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tab.url?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "memory") {
        return sortDirection === "desc" 
          ? (b.memoryUsage || 0) - (a.memoryUsage || 0) 
          : (a.memoryUsage || 0) - (b.memoryUsage || 0);
      } else {
        return sortDirection === "desc"
          ? (b.title || "").localeCompare(a.title || "")
          : (a.title || "").localeCompare(b.title || "");
      }
    });

  // Toggle sort order
  const toggleSort = (column: "memory" | "name") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Layers className="text-green-500 mr-3" size={24} />
        <h2 className="text-xl font-bold text-slate-200">Tab Memory Usage</h2>
      </div>
      
      {/* Memory Usage Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Tabs Card */}
        <div className="bg-slate-800/60 rounded-lg p-5 border border-slate-700/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 font-medium">Total Tabs</h3>
            <Layers size={18} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics?.tabCount || 0}
          </div>
          <div className="text-sm text-slate-400">
            Across {metrics?.windowCount || 0} windows
          </div>
        </div>
        
        {/* Browser Memory Card */}
        <div className="bg-slate-800/60 rounded-lg p-5 border border-slate-700/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 font-medium">Browser Memory</h3>
            <HardDrive size={18} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {formatMemory(metrics?.memoryUsage?.browserMemoryMB ? metrics.memoryUsage.browserMemoryMB * 1024 : undefined)}
          </div>
          <div className="text-sm text-slate-400">
            {metrics?.memoryUsage?.browserMemoryMB && metrics?.memoryUsage?.totalMemoryMB
              ? `${((metrics.memoryUsage.browserMemoryMB / metrics.memoryUsage.totalMemoryMB) * 100).toFixed(1)}% of total memory`
              : "Percentage of total memory usage"}
          </div>
        </div>
        
        {/* Average Tab Memory Card */}
        <div className="bg-slate-800/60 rounded-lg p-5 border border-slate-700/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 font-medium">Average Tab Memory</h3>
            <HardDrive size={18} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {metrics?.tabCount && metrics?.memoryUsage?.browserMemoryMB
              ? formatMemory((metrics.memoryUsage.browserMemoryMB * 1024) / metrics.tabCount)
              : "0 MB"}
          </div>
          <div className="text-sm text-slate-400">
            Memory used per tab on average
          </div>
        </div>
      </div>
      
      {/* Tab Memory List */}
      <div className="bg-slate-800/30 rounded-lg border border-slate-700/30 mb-8 overflow-hidden">
        <div className="p-4 border-b border-slate-700/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-medium text-slate-200">Tab Memory Usage Details</h3>
            
            {/* Search Field */}
            <div className="relative max-w-xs">
              <input
                type="text"
                placeholder="Search tabs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1.5 pl-8 pr-8 rounded-md bg-slate-900/70 border border-slate-700/50 text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-500" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 h-4 w-4 text-slate-500 hover:text-slate-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-700/50">
                <th className="px-6 py-3 text-slate-400 font-medium text-sm">
                  <button 
                    onClick={() => toggleSort("name")}
                    className="flex items-center hover:text-slate-200"
                  >
                    Tab
                    {sortBy === "name" && (
                      <span className="ml-1">
                        {sortDirection === "desc" ? "↓" : "↑"}
                      </span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-slate-400 font-medium text-sm">Window</th>
                <th className="px-6 py-3 text-slate-400 font-medium text-sm text-right">
                  <button 
                    onClick={() => toggleSort("memory")}
                    className="flex items-center ml-auto hover:text-slate-200"
                  >
                    Memory Usage
                    {sortBy === "memory" && (
                      <span className="ml-1">
                        {sortDirection === "desc" ? "↓" : "↑"}
                      </span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-slate-400 font-medium text-sm text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTabs.length > 0 ? (
                filteredTabs.map((tab, index) => (
                  <tr 
                    key={tab.tabId || index} 
                    className="border-b border-slate-700/30 hover:bg-slate-800/30"
                  >
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center">
                        {tab.favIconUrl ? (
                          <img src={tab.favIconUrl} alt="" className="w-5 h-5 mr-3" />
                        ) : (
                          <div className="w-5 h-5 bg-slate-700 rounded-sm mr-3 flex items-center justify-center">
                            <span className="text-xs text-slate-400">
                              {(tab.url?.replace(/^https?:\/\//, '').charAt(0) || '?').toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="truncate max-w-[300px]" title={tab.title}>{tab.title}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[300px]">{tab.url}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{tab.windowId}</td>
                    <td className="px-6 py-4 text-right">
                      <div className={`mb-1 font-medium ${
                        (tab.memoryUsage || 0) > 100000 
                          ? "text-red-400" 
                          : (tab.memoryUsage || 0) > 50000 
                            ? "text-amber-400" 
                            : "text-green-400"
                      }`}>
                        {formatMemory(tab.memoryUsage)}
                      </div>
                      <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            (tab.memoryUsage || 0) > 100000 
                              ? "bg-red-500" 
                              : (tab.memoryUsage || 0) > 50000 
                                ? "bg-amber-500" 
                                : "bg-green-500"
                          }`}
                          style={{ 
                            width: `${Math.min(100, ((tab.memoryUsage || 0) / 200000) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <button 
                          className="p-1.5 rounded-md bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                          title="Switch to tab"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    {searchQuery 
                      ? "No tabs match your search query" 
                      : "No tab memory data available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Memory Optimization Tips */}
      <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/30">
        <h3 className="text-lg font-medium text-slate-200 mb-4">Tab Memory Optimization Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/40">
              <h4 className="text-green-400 text-sm font-medium mb-2">Identifying Memory-Heavy Tabs</h4>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Media sites (video/audio) typically use more memory</li>
                <li>• Web applications (like Google Docs, complex dashboards)</li>
                <li>• Sites with infinite scrolling can accumulate large memory usage</li>
              </ul>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/40">
              <h4 className="text-blue-400 text-sm font-medium mb-2">Session Management</h4>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Save groups of tabs as sessions for later use</li>
                <li>• Split your work into different browser windows</li>
                <li>• Use tab groups to organize related tabs</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/40">
              <h4 className="text-purple-400 text-sm font-medium mb-2">Reduce Browser Memory Usage</h4>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Close tabs you haven't used in the past few hours</li>
                <li>• Use tab suspenders to free memory from inactive tabs</li>
                <li>• Limit the number of tabs open at once (aim for &lt; 20)</li>
              </ul>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/40">
              <h4 className="text-cyan-400 text-sm font-medium mb-2">Browser Health</h4>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Restart your browser periodically</li>
                <li>• Clear cache and cookies regularly</li>
                <li>• Disable unnecessary extensions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabsMemoryPanel;