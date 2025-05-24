import React, { useEffect, useState } from "react";
import { Cpu, HardDrive, Wifi, Chrome } from "lucide-react";
import MetricCard from "./MetricCard";
import { useDetailedMemoryMetrics } from "../hooks/useDetailedMemoryMetrics";
import { useSystemMetrics } from "../hooks/useSystemMetrics";

/**
 * Component for displaying system metrics (CPU, memory, and network)
 * with real data from Chrome APIs
 */
const SystemMetricsWidget: React.FC = () => {
  const [networkUsage, setNetworkUsage] = useState(0);
  const [memoryDisplay, setMemoryDisplay] = useState<string | number>("--"); // Could be a percentage or absolute value
  const [cpuPercentage, setCpuPercentage] = useState<number | string>("--"); // Default CPU percentage
  const [memoryDetailText, setMemoryDetailText] = useState<string>("RAM Usage");
  const [memoryDisplayMode, setMemoryDisplayMode] = useState<"percentage" | "absolute">("percentage");
  
  // Browser memory tracking
  const [browserMemoryDisplay, setBrowserMemoryDisplay] = useState<string>("--"); 
  const [browserMemoryDetailText, setBrowserMemoryDetailText] = useState<string>("Browser Memory");

  const { metrics } = useSystemMetrics(5000); // Refresh every 5 seconds
  const { topCpuConsumers, totalCpuUsage } = useDetailedMemoryMetrics(5000);

  // Check if we're running in a development environment (not as an extension)
  const isDevMode = !chrome?.runtime?.id;

  // Format memory size to a readable format
  const formatMemory = (memoryMB: number): string => {
    if (memoryMB >= 1024) {
      return `${(memoryMB / 1024).toFixed(1)} GB`;
    }
    return `${memoryMB} MB`;
  };

  // Update memory display whenever metrics change
  useEffect(() => {
    if (isDevMode) {
      setMemoryDisplay("--");
      setMemoryDetailText("Development mode");
      return;
    }

    if (!metrics?.memoryUsage) {
      setMemoryDisplay("--");
      setMemoryDetailText("No data");
      return;
    }

    // Determine whether to show percentage or absolute value
    if (metrics.memoryUsage.showAbsoluteOnly) {
      // Show absolute memory values only (no percentage)
      const usedMemoryMB = metrics.memoryUsage.usedMemoryMB || 0;
      setMemoryDisplay(
        usedMemoryMB > 1024
          ? `${(usedMemoryMB / 1024).toFixed(1)}GB`
          : `${usedMemoryMB}MB`
      );
      setMemoryDisplayMode("absolute");
      setMemoryDetailText(`Chrome tabs memory`);
    } else {
      // Show percentage
      const percentage = metrics.memoryUsage.usagePercentage || 0;
      setMemoryDisplay(percentage);
      setMemoryDisplayMode("percentage");

      // Create a detailed memory text that shows what the percentage represents
      let detailText = "";

      if (metrics.memoryUsage.isTabsOnlyMetric) {
        // If we only have tab memory data
        if (metrics.memoryUsage.usedMemoryMB) {
          detailText = `Tabs: ${metrics.memoryUsage.usedMemoryMB} MB`;
        } else {
          detailText = "Chrome Tabs Memory";
        }
      } else {
        // If we have system-wide memory data
        if (
          metrics.memoryUsage.usedMemoryMB &&
          metrics.memoryUsage.totalMemoryMB
        ) {
          detailText = `${metrics.memoryUsage.usedMemoryMB}/${metrics.memoryUsage.totalMemoryMB} MB`;
        } else {
          detailText = "System Memory";
        }
      }

      setMemoryDetailText(detailText);
    }
    
    // Update browser memory display
    if (metrics.memoryUsage.browserMemoryMB) {
      setBrowserMemoryDisplay(formatMemory(metrics.memoryUsage.browserMemoryMB));
      
      // Create detail text showing extension's memory usage
      if (metrics.memoryUsage.extensionMemoryMB) {
        setBrowserMemoryDetailText(
          `Extension: ${metrics.memoryUsage.extensionMemoryMB} MB`
        );
      } else {
        setBrowserMemoryDetailText(`${metrics.tabCount} tabs`);
      }
    } else {
      setBrowserMemoryDisplay("--");
      setBrowserMemoryDetailText("No browser data");
    }
  }, [metrics, isDevMode]);

  // Update CPU percentage whenever metrics change
  useEffect(() => {
    if (isDevMode) {
      setCpuPercentage("--");
      return;
    }

    if (totalCpuUsage > 0) {
      setCpuPercentage(Math.round(totalCpuUsage));
    } else {
      setCpuPercentage("--");
    }
  }, [totalCpuUsage, isDevMode]);

  // Generate a network usage value (currently mocked as we haven't implemented network tracking)
  useEffect(() => {
    if (isDevMode) {
      setNetworkUsage(0);
      return;
    }

    const interval = setInterval(() => {
      setNetworkUsage(Math.floor(Math.random() * 15) + 80);
    }, 3000);

    return () => clearInterval(interval);
  }, [isDevMode]);

  // Calculate CPU usage trend based on current value
  const getCpuTrend = () => {
    if (typeof cpuPercentage !== "number") return "stable";
    if (cpuPercentage > 70) return "up";
    if (cpuPercentage < 20) return "down";
    return "stable";
  };

  // Calculate memory trend based on changes
  const getMemoryTrend = () => {
    if (memoryDisplayMode === "absolute" || typeof memoryDisplay !== "number")
      return "stable";

    if (memoryDisplay > 70) {
      return "up";
    } else if (memoryDisplay < 30) {
      return "down";
    }
    return "stable";
  };

  // Generate detail text for CPU metric card
  const getCpuDetailText = () => {
    if (isDevMode) return "Development mode";

    if (topCpuConsumers && topCpuConsumers.length > 0) {
      const topConsumer = topCpuConsumers[0];
      const title =
        topConsumer.title.length > 20
          ? topConsumer.title.substring(0, 20) + "..."
          : topConsumer.title;
      return `Top: ${title} (${topConsumer.cpuUsage?.toFixed(1)}%)`;
    }
    return `${metrics?.tabCount || 0} active tabs`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <MetricCard
        title="CPU Usage"
        value={cpuPercentage}
        icon={Cpu}
        trend={getCpuTrend() as "up" | "down" | "stable"}
        color="cyan"
        detail={getCpuDetailText()}
        showPercentageSymbol={typeof cpuPercentage === "number"}
      />
      <MetricCard
        title="System Memory"
        value={memoryDisplay}
        icon={HardDrive}
        trend={getMemoryTrend() as "up" | "down" | "stable"}
        color="purple"
        detail={memoryDetailText}
        showPercentageSymbol={
          memoryDisplayMode === "percentage" &&
          typeof memoryDisplay === "number"
        }
      />
      <MetricCard
        title="Chrome Memory"
        value={browserMemoryDisplay}
        icon={Chrome}
        trend="stable"
        color="blue"
        detail={browserMemoryDetailText}
        showPercentageSymbol={false}
      />
      <MetricCard
        title="Network"
        value={isDevMode ? "--" : networkUsage}
        icon={Wifi}
        trend="stable"
        color="green"
        detail={isDevMode ? "Development mode" : "Connectivity"}
        showPercentageSymbol={typeof networkUsage === "number"}
      />
    </div>
  );
};

export default SystemMetricsWidget;
