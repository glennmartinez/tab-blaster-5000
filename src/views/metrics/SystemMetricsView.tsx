import React, { useState, useEffect } from "react";
import { useSystemMetrics } from "../../hooks/useSystemMetrics";
import { useDetailedMemoryMetrics } from "../../hooks/useDetailedMemoryMetrics";
import { ArrowLeft, Activity, HardDrive, Cpu, Wifi, Chrome, BarChart3 } from "lucide-react";
import SystemMetricsWidget from "../../components/SystemMetricsWidget";
import MemoryDetailPanel from "./components/MemoryDetailPanel";
import CpuDetailPanel from "./components/CpuDetailPanel";
import TabsMemoryPanel from "./components/TabsMemoryPanel";
import BrowserMemoryPanel from "./components/BrowserMemoryPanel";

interface SystemMetricsViewProps {
  onBack: () => void;
}

const SystemMetricsView: React.FC<SystemMetricsViewProps> = ({ onBack }) => {
  const [activePanel, setActivePanel] = useState<'overview' | 'memory' | 'cpu' | 'tabs' | 'browser'>('overview');
  
  // Fetch metrics with a shorter refresh interval for this detailed view
  const { metrics } = useSystemMetrics(3000); // Refresh every 3 seconds
  const { topCpuConsumers, totalCpuUsage, topMemoryConsumers } = useDetailedMemoryMetrics(3000);
  
  // Format memory size to a readable format
  const formatMemory = (memoryMB: number | undefined): string => {
    if (!memoryMB) return "0 MB";
    return memoryMB >= 1024
      ? `${(memoryMB / 1024).toFixed(1)} GB`
      : `${memoryMB} MB`;
  };

  return (
    <div className="bg-black/80 min-h-screen w-full overflow-y-auto">
      <div className="container mx-auto p-4 relative z-10">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={onBack} 
            className="mr-4 p-2 rounded-full bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">System Metrics Dashboard</h1>
        </div>
        
        {/* Overview Cards */}
        <div className="mb-6">
          <h2 className="text-slate-300 text-lg font-medium mb-3 flex items-center">
            <Activity size={18} className="mr-2 text-cyan-500" />
            System Overview
          </h2>
          <SystemMetricsWidget />
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap mb-6 gap-2">
          <button 
            onClick={() => setActivePanel('overview')} 
            className={`px-4 py-2 rounded-md flex items-center ${
              activePanel === 'overview' 
                ? 'bg-blue-600/70 text-white' 
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70'
            }`}
          >
            <BarChart3 size={16} className="mr-2" />
            Overview
          </button>
          <button 
            onClick={() => setActivePanel('memory')} 
            className={`px-4 py-2 rounded-md flex items-center ${
              activePanel === 'memory' 
                ? 'bg-purple-600/70 text-white' 
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70'
            }`}
          >
            <HardDrive size={16} className="mr-2" />
            System Memory
          </button>
          <button 
            onClick={() => setActivePanel('cpu')} 
            className={`px-4 py-2 rounded-md flex items-center ${
              activePanel === 'cpu' 
                ? 'bg-cyan-600/70 text-white' 
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70'
            }`}
          >
            <Cpu size={16} className="mr-2" />
            CPU Usage
          </button>
          <button 
            onClick={() => setActivePanel('tabs')} 
            className={`px-4 py-2 rounded-md flex items-center ${
              activePanel === 'tabs' 
                ? 'bg-green-600/70 text-white' 
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70'
            }`}
          >
            <Activity size={16} className="mr-2" />
            Tab Resources
          </button>
          <button 
            onClick={() => setActivePanel('browser')} 
            className={`px-4 py-2 rounded-md flex items-center ${
              activePanel === 'browser' 
                ? 'bg-indigo-600/70 text-white' 
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700/70'
            }`}
          >
            <Chrome size={16} className="mr-2" />
            Browser Memory
          </button>
        </div>
        
        {/* Detail Panel */}
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg overflow-hidden mb-8">
          {activePanel === 'overview' && (
            <div className="p-6 text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Summary stats */}
                <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700/30">
                  <h3 className="text-lg font-medium text-slate-200 mb-3">System Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Memory:</span>
                      <span className="text-slate-200">{formatMemory(metrics?.memoryUsage?.totalMemoryMB)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Used Memory:</span>
                      <span className="text-slate-200">{formatMemory(metrics?.memoryUsage?.usedMemoryMB)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Browser Memory:</span>
                      <span className="text-slate-200">{formatMemory(metrics?.memoryUsage?.browserMemoryMB)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Extension Memory:</span>
                      <span className="text-slate-200">{formatMemory(metrics?.memoryUsage?.extensionMemoryMB)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">CPU Usage:</span>
                      <span className="text-slate-200">{Math.round(totalCpuUsage || 0)}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Windows and Tabs */}
                <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700/30">
                  <h3 className="text-lg font-medium text-slate-200 mb-3">Tab Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Windows:</span>
                      <span className="text-slate-200">{metrics?.windowCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tabs:</span>
                      <span className="text-slate-200">{metrics?.tabCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Average per Window:</span>
                      <span className="text-slate-200">
                        {metrics?.windowCount ? (metrics.tabCount / metrics.windowCount).toFixed(1) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Average Tab Memory:</span>
                      <span className="text-slate-200">
                        {metrics?.tabCount && metrics?.memoryUsage?.browserMemoryMB 
                          ? formatMemory(metrics.memoryUsage.browserMemoryMB / metrics.tabCount) 
                          : '0 MB'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Highest Consumers */}
                <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700/30">
                  <h3 className="text-lg font-medium text-slate-200 mb-3">Top Consumers</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-cyan-400 mb-1">Highest CPU</p>
                      {topCpuConsumers && topCpuConsumers.length > 0 ? (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 text-sm truncate max-w-[180px]">
                            {topCpuConsumers[0].title}
                          </span>
                          <span className="text-slate-300 font-medium">
                            {(topCpuConsumers[0].cpuUsage || 0).toFixed(1)}%
                          </span>
                        </div>
                      ) : (
                        <p className="text-slate-400 text-sm">No data</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-purple-400 mb-1">Highest Memory</p>
                      {topMemoryConsumers && topMemoryConsumers.length > 0 ? (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 text-sm truncate max-w-[180px]">
                            {topMemoryConsumers[0].title}
                          </span>
                          <span className="text-slate-300 font-medium">
                            {Math.round(topMemoryConsumers[0].memoryUsage / 1024)} MB
                          </span>
                        </div>
                      ) : (
                        <p className="text-slate-400 text-sm">No data</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recommendations */}
              {metrics && (
                <div className="mt-6 bg-slate-800/30 p-4 rounded-lg border border-slate-700/30">
                  <h3 className="text-lg font-medium text-slate-200 mb-2">Recommendations</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {metrics.memoryUsage.usagePercentage > 80 && (
                      <li className="text-amber-400">High memory usage detected. Consider closing unused tabs or applications.</li>
                    )}
                    {metrics.tabCount > 30 && (
                      <li>You have {metrics.tabCount} tabs open. Consider saving some as sessions to improve performance.</li>
                    )}
                    {metrics.windowCount > 3 && (
                      <li>Consider consolidating your {metrics.windowCount} windows to improve organization.</li>
                    )}
                    {metrics.tabCount > 0 && metrics.windowCount > 0 && metrics.tabCount / metrics.windowCount > 10 && (
                      <li>Your windows have many tabs (avg: {(metrics.tabCount / metrics.windowCount).toFixed(1)}). Consider grouping related tabs.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activePanel === 'memory' && <MemoryDetailPanel metrics={metrics} />}
          {activePanel === 'cpu' && <CpuDetailPanel metrics={metrics} topCpuConsumers={topCpuConsumers} totalCpuUsage={totalCpuUsage} />}
          {activePanel === 'tabs' && <TabsMemoryPanel metrics={metrics} topMemoryConsumers={topMemoryConsumers} />}
          {activePanel === 'browser' && <BrowserMemoryPanel metrics={metrics} />}
        </div>
      </div>
    </div>
  );
};

export default SystemMetricsView;