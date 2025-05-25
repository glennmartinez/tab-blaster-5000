import React, { useState } from "react";
import { SystemMetrics, TabMemoryInfo } from "../../models/SystemMetrics";
import {
  ArrowLeft,
  Activity,
  HardDrive,
  Cpu,
  Chrome,
  BarChart3,
} from "lucide-react";
import CpuDetailPanel from "./components/CpuDetailPanel";
import MemoryDetailPanel from "./components/MemoryDetailPanel";
import TabsMemoryPanel from "./components/TabsMemoryPanel";

interface SystemMetricsViewProps {
  onBack?: () => void;
}

const SystemMetricsView: React.FC<SystemMetricsViewProps> = ({ onBack }) => {
  const [activePanel, setActivePanel] = useState<
    "overview" | "memory" | "cpu" | "tabs"
  >("overview");
  const [metrics] = useState<SystemMetrics | undefined>(undefined);
  const [topMemoryConsumers] = useState<TabMemoryInfo[]>([]);
  const [topCpuConsumers] = useState<TabMemoryInfo[]>([]);
  const [totalCpuUsage] = useState<number>(0);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 text-slate-400 hover:text-slate-300"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white">System Metrics</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActivePanel("overview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activePanel === "overview"
                ? "bg-cyan-500 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <Activity className="h-4 w-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActivePanel("memory")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activePanel === "memory"
                ? "bg-cyan-500 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <HardDrive className="h-4 w-4 inline mr-2" />
            Memory
          </button>
          <button
            onClick={() => setActivePanel("cpu")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activePanel === "cpu"
                ? "bg-cyan-500 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <Cpu className="h-4 w-4 inline mr-2" />
            CPU
          </button>
          <button
            onClick={() => setActivePanel("tabs")}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              activePanel === "tabs"
                ? "bg-cyan-500 text-white"
                : "text-slate-400 hover:text-slate-300"
            }`}
          >
            <Chrome className="h-4 w-4 inline mr-2" />
            Tabs
          </button>
        </nav>
      </div>

      {/* Panel Content */}
      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg overflow-hidden">
        {activePanel === "overview" && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-300">
                    Total Tabs
                  </h3>
                  <Chrome className="h-4 w-4 text-cyan-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {metrics?.tabCount || 0}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-300">
                    Memory Usage
                  </h3>
                  <HardDrive className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {metrics?.memoryUsage?.usagePercentage.toFixed(1)}%
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-300">
                    CPU Usage
                  </h3>
                  <Cpu className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {totalCpuUsage.toFixed(1)}%
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-slate-300">
                    Windows
                  </h3>
                  <BarChart3 className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {metrics?.windowCount || 0}
                </div>
              </div>
            </div>
          </div>
        )}
        {activePanel === "memory" && <MemoryDetailPanel metrics={metrics} />}
        {activePanel === "cpu" && (
          <CpuDetailPanel
            topCpuConsumers={topCpuConsumers}
            totalCpuUsage={totalCpuUsage}
          />
        )}
        {activePanel === "tabs" && (
          <TabsMemoryPanel
            metrics={metrics}
            topMemoryConsumers={topMemoryConsumers}
          />
        )}
      </div>
    </div>
  );
};

export default SystemMetricsView;
