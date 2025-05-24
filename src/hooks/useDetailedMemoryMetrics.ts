import { useState, useEffect, useCallback } from "react";
import { TabMemoryInfo, WindowMemoryInfo } from "../models/SystemMetrics";
import { useSystemMetrics } from "./useSystemMetrics";

/**
 * Custom hook to provide detailed memory and CPU metrics for tabs and windows
 */
export const useDetailedMemoryMetrics = (refreshInterval: number = 30000) => {
  const [tabMemoryInfo, setTabMemoryInfo] = useState<TabMemoryInfo[]>([]);
  const [windowMemoryInfo, setWindowMemoryInfo] = useState<WindowMemoryInfo[]>(
    []
  );
  const [topMemoryConsumers, setTopMemoryConsumers] = useState<TabMemoryInfo[]>(
    []
  );
  const [topCpuConsumers, setTopCpuConsumers] = useState<TabMemoryInfo[]>([]);
  const [totalMemoryUsage, setTotalMemoryUsage] = useState<number>(0);
  const [totalCpuUsage, setTotalCpuUsage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Use the existing system metrics hook
  const {
    metrics,
    fetchMetrics,
    loading: metricsLoading,
  } = useSystemMetrics(refreshInterval);

  /**
   * Calculate memory and CPU statistics from system metrics
   */
  const processMetrics = useCallback(() => {
    if (!metrics) return;

    // Set tab and window memory info from metrics
    if (metrics.tabMemoryInfo) {
      setTabMemoryInfo(metrics.tabMemoryInfo);

      // Calculate top memory consumers (top 5)
      const sortedByMemory = [...metrics.tabMemoryInfo]
        .sort((a, b) => b.memoryUsage - a.memoryUsage)
        .slice(0, 5);

      setTopMemoryConsumers(sortedByMemory);

      // Calculate top CPU consumers (top 5)
      const sortedByCpu = [...metrics.tabMemoryInfo]
        .filter((tab) => tab.cpuUsage !== undefined)
        .sort((a, b) => (b.cpuUsage || 0) - (a.cpuUsage || 0))
        .slice(0, 5);

      setTopCpuConsumers(sortedByCpu);

      // Calculate total memory usage
      const totalMemory = metrics.tabMemoryInfo.reduce(
        (sum, tab) => sum + tab.memoryUsage,
        0
      );
      setTotalMemoryUsage(totalMemory);
    }

    if (metrics.windowMemoryInfo) {
      setWindowMemoryInfo(metrics.windowMemoryInfo);
    }

    if (metrics.cpuUsage) {
      setTotalCpuUsage(metrics.cpuUsage.totalUsage);
    }

    setLoading(false);
  }, [metrics]);

  // Process metrics when they change
  useEffect(() => {
    processMetrics();
  }, [metrics, processMetrics]);

  /**
   * Format memory size for display (converts KB to MB or GB as appropriate)
   */
  const formatMemorySize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) {
      return `${sizeInKB.toFixed(2)} KB`;
    } else if (sizeInKB < 1024 * 1024) {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    } else {
      return `${(sizeInKB / (1024 * 1024)).toFixed(2)} GB`;
    }
  };

  /**
   * Get memory usage percentage for a specific tab relative to total
   */
  const getTabMemoryPercentage = (tabId: number): number => {
    if (totalMemoryUsage === 0) return 0;

    const tab = tabMemoryInfo.find((t) => t.tabId === tabId);
    if (!tab) return 0;

    return Math.round((tab.memoryUsage / totalMemoryUsage) * 100);
  };

  /**
   * Get CPU usage percentage for a specific tab
   */
  const getTabCpuPercentage = (tabId: number): number => {
    const tab = tabMemoryInfo.find((t) => t.tabId === tabId);
    if (!tab || tab.cpuUsage === undefined) return 0;

    return tab.cpuUsage;
  };

  /**
   * Get memory usage percentage for a specific window relative to total
   */
  const getWindowMemoryPercentage = (windowId: number): number => {
    if (totalMemoryUsage === 0) return 0;

    const window = windowMemoryInfo.find((w) => w.windowId === windowId);
    if (!window) return 0;

    return Math.round((window.memoryUsage / totalMemoryUsage) * 100);
  };

  /**
   * Get CPU usage percentage for a specific window
   */
  const getWindowCpuPercentage = (windowId: number): number => {
    const window = windowMemoryInfo.find((w) => w.windowId === windowId);
    if (!window || window.cpuUsage === undefined) return 0;

    return window.cpuUsage;
  };

  return {
    // Memory metrics
    tabMemoryInfo,
    windowMemoryInfo,
    topMemoryConsumers,
    totalMemoryUsage,
    formatMemorySize,
    getTabMemoryPercentage,
    getWindowMemoryPercentage,

    // CPU metrics
    topCpuConsumers,
    totalCpuUsage,
    getTabCpuPercentage,
    getWindowCpuPercentage,

    // Common
    loading: loading || metricsLoading,
    refreshMetrics: fetchMetrics,
  };
};
