import React from "react";
import { SystemMetrics, TabMemoryInfo } from "../../../models/SystemMetrics";
import { Cpu, ActivitySquare, AlertTriangle, ClipboardList } from "lucide-react";

interface CpuDetailPanelProps {
  metrics?: SystemMetrics;
  topCpuConsumers?: TabMemoryInfo[];
  totalCpuUsage?: number;
}

const CpuDetailPanel: React.FC<CpuDetailPanelProps> = ({ 
  metrics, 
  topCpuConsumers = [], 
  totalCpuUsage = 0 
}) => {
  // Function to determine CPU status based on usage
  const getCpuStatus = (): { status: string; color: string } => {
    if (totalCpuUsage > 90) return { status: "Very High", color: "text-red-500" };
    if (totalCpuUsage > 70) return { status: "High", color: "text-amber-500" };
    if (totalCpuUsage > 40) return { status: "Moderate", color: "text-yellow-500" };
    return { status: "Normal", color: "text-green-500" };
  };

  const cpuStatus = getCpuStatus();

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Cpu className="text-cyan-500 mr-3" size={24} />
        <h2 className="text-xl font-bold text-slate-200">CPU Usage Details</h2>
      </div>
      
      {/* CPU Usage Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Total CPU Usage Card */}
        <div className="bg-slate-800/60 rounded-lg p-5 border border-slate-700/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 font-medium">Total CPU Usage</h3>
            <Cpu size={18} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {Math.round(totalCpuUsage)}%
          </div>
          <div className="text-sm text-slate-400">Current processor utilization</div>
        </div>
        
        {/* Top Consumer Card */}
        <div className="bg-slate-800/60 rounded-lg p-5 border border-slate-700/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 font-medium">Top CPU Consumer</h3>
            <ActivitySquare size={18} className="text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white mb-1 truncate">
            {topCpuConsumers && topCpuConsumers.length > 0 ? (
              topCpuConsumers[0].title
            ) : (
              "No data"
            )}
          </div>
          <div className="text-sm text-slate-400 flex items-center justify-between">
            <span>Tab using the most CPU</span>
            {topCpuConsumers && topCpuConsumers.length > 0 && (
              <span className="text-cyan-400 font-medium">
                {topCpuConsumers[0].cpuUsage?.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
        
        {/* CPU Status Card */}
        <div className="bg-slate-800/60 rounded-lg p-5 border border-slate-700/40 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 font-medium">CPU Status</h3>
            <AlertTriangle size={18} className={cpuStatus.color} />
          </div>
          <div className={`text-2xl font-bold ${cpuStatus.color} mb-1`}>
            {cpuStatus.status}
          </div>
          <div className="text-sm text-slate-400">
            {cpuStatus.status === "Normal" 
              ? "CPU usage is at a healthy level"
              : `CPU usage is ${cpuStatus.status.toLowerCase()}, performance might be affected`}
          </div>
        </div>
      </div>
      
      {/* CPU Usage Visualization */}
      <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/30 mb-8">
        <h3 className="text-lg font-medium text-slate-200 mb-4">CPU Usage Distribution</h3>
        
        {/* Main CPU Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-300">Overall CPU Usage</span>
            <span className="text-slate-300">{Math.round(totalCpuUsage)}%</span>
          </div>
          <div className="w-full h-4 bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                totalCpuUsage > 80 
                  ? "bg-red-500" 
                  : totalCpuUsage > 60 
                    ? "bg-amber-500" 
                    : "bg-cyan-500"
              }`}
              style={{ width: `${totalCpuUsage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Per-Tab CPU Usage */}
        <div className="space-y-3">
          <h4 className="text-md font-medium text-slate-300">Per-Tab CPU Usage</h4>
          
          {topCpuConsumers && topCpuConsumers.length > 0 ? (
            topCpuConsumers.slice(0, 5).map((tab, index) => (
              <div key={tab.tabId || index} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 truncate" style={{ maxWidth: "70%" }}>
                    {tab.title}
                  </span>
                  <span className="text-slate-300">{tab.cpuUsage?.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      (tab.cpuUsage || 0) > 50 
                        ? "bg-amber-500" 
                        : (tab.cpuUsage || 0) > 25 
                          ? "bg-blue-500" 
                          : "bg-cyan-500"
                    }`}
                    style={{ width: `${tab.cpuUsage || 0}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-400 text-sm">No tab-specific CPU data available</div>
          )}
        </div>
      </div>
      
      {/* Tab CPU Details Table */}
      <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/30 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-slate-200">CPU Usage By Tab</h3>
          <ClipboardList className="text-slate-400" size={18} />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="pb-2 text-slate-400 font-medium text-sm">Tab</th>
                <th className="pb-2 text-slate-400 font-medium text-sm">Window</th>
                <th className="pb-2 text-slate-400 font-medium text-sm text-right">CPU Usage</th>
                <th className="pb-2 text-slate-400 font-medium text-sm text-right">Process ID</th>
              </tr>
            </thead>
            <tbody>
              {topCpuConsumers && topCpuConsumers.length > 0 ? (
                topCpuConsumers.slice(0, 10).map((tab, index) => (
                  <tr key={tab.tabId || index} className="border-b border-slate-700/30">
                    <td className="py-2 text-slate-300 text-sm">
                      <div className="truncate max-w-[300px]" title={tab.title}>
                        {tab.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {tab.url}
                      </div>
                    </td>
                    <td className="py-2 text-slate-300 text-sm">{tab.windowId}</td>
                    <td className="py-2 text-slate-300 text-sm text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        (tab.cpuUsage || 0) > 50 
                          ? "bg-amber-500/20 text-amber-400" 
                          : "bg-cyan-500/20 text-cyan-400"
                      }`}>
                        {tab.cpuUsage?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 text-slate-400 text-sm text-right font-mono">
                      {tab.processId || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-400 text-sm">
                    No CPU usage data available for tabs
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* CPU Usage Tips */}
      <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700/30">
        <h3 className="text-lg font-medium text-slate-200 mb-4">Optimize CPU Usage</h3>
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-cyan-500/20 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-cyan-500 text-xs">1</span>
            </div>
            <div>
              <p className="text-slate-300">Close tabs with high CPU usage</p>
              <p className="text-xs text-slate-500 mt-1">
                Media-heavy sites, video streaming, and complex web apps tend to use more CPU
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-blue-500 text-xs">2</span>
            </div>
            <div>
              <p className="text-slate-300">Disable unnecessary extensions</p>
              <p className="text-xs text-slate-500 mt-1">
                Some browser extensions can consume significant CPU resources
              </p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="h-5 w-5 rounded-full bg-purple-500/20 flex items-center justify-center mr-3 mt-0.5">
              <span className="text-purple-500 text-xs">3</span>
            </div>
            <div>
              <p className="text-slate-300">Refresh tabs that have been open for a long time</p>
              <p className="text-xs text-slate-500 mt-1">
                Long-running tabs can develop memory leaks and CPU usage issues
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CpuDetailPanel;