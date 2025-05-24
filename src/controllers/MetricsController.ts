import {
  SystemMetrics,
  SystemStatus,
  MemoryMetrics,
  TabMemoryInfo,
  WindowMemoryInfo,
  CpuMetrics,
} from "../models/SystemMetrics";
import { ChromeService } from "../services/ChromeService";

// Define interface for tabMetricsHistory entries
interface TabMetricEntry {
  count: number;
  timestamp: number;
}

/**
 * Controller for handling system metrics
 */
export class MetricsController {
  /**
   * Get current system metrics
   */
  static async getSystemMetrics(): Promise<SystemMetrics> {
    const [tabs, windows, processInfo] = await Promise.all([
      ChromeService.getTabs(),
      ChromeService.getWindows(),
      ChromeService.getProcessInfo(),
    ]);

    // Default memory metrics
    const memoryUsage: MemoryMetrics = {
      usagePercentage: 0,
      totalMemoryMB: 0,
      usedMemoryMB: 0,
      isTabsOnlyMetric: false,
      showAbsoluteOnly: false,
    };

    // Get system memory info if available in Chrome
    if (chrome?.system?.memory) {
      await new Promise<void>((resolve) => {
        chrome.system.memory.getInfo((info) => {
          // Convert bytes to MB for easier reading
          const totalMemoryMB = Math.round(info.capacity / (1024 * 1024));
          const usedMemoryMB = Math.round(
            (info.capacity - info.availableCapacity) / (1024 * 1024)
          );

          memoryUsage.usagePercentage = Math.round(
            ((info.capacity - info.availableCapacity) / info.capacity) * 100
          );
          memoryUsage.totalMemoryMB = totalMemoryMB;
          memoryUsage.usedMemoryMB = usedMemoryMB;
          memoryUsage.isTabsOnlyMetric = false; // This is system-wide memory
          resolve();
        });
      });
    } else {
      // If system API not available, use the tab memory absolute values instead of misleading percentages
      
      // Calculate tabs total memory in MB
      const tabsTotalMemoryKB = processInfo.totalMemory || 0;
      const tabsTotalMemoryMB = Math.round(tabsTotalMemoryKB / 1024);
      
      // Rather than showing a misleading percentage of unknown total memory,
      // we'll display the absolute memory usage and avoid showing a percentage
      memoryUsage.usagePercentage = 0; // We'll use this to indicate "not available"
      memoryUsage.totalMemoryMB = 0; // Unknown total system memory
      memoryUsage.usedMemoryMB = tabsTotalMemoryMB;
      memoryUsage.isTabsOnlyMetric = true; // Flag that this is only measuring tabs, not system
      memoryUsage.showAbsoluteOnly = true; // Flag to show only absolute value, not percentage
    }

    // Calculate Chrome browser memory usage
    const browserMemory = await this.estimateBrowserMemoryUsage(tabs.length);
    memoryUsage.browserMemoryMB = browserMemory.totalMB;
    memoryUsage.extensionMemoryMB = browserMemory.extensionMB;

    // Process tab memory information
    const tabMemoryInfo: TabMemoryInfo[] = tabs
      .filter((tab) => tab.id !== undefined)
      .map((tab) => {
        const tabId = tab.id!;
        const processData = processInfo.tabInfo[tabId] || {
          memory: 0,
          processId: -1,
          cpu: 0,
        };

        return {
          tabId,
          title: tab.title || "Unknown",
          url: tab.url || "about:blank",
          memoryUsage: processData.memory,
          processId: processData.processId,
          windowId: tab.windowId || 0,
          cpuUsage: processData.cpu,
        };
      });

    // Calculate window memory usage by aggregating tab memory info
    const windowMemoryMap = new Map<
      number,
      {
        memory: number;
        tabCount: number;
        cpu: number;
      }
    >();

    tabMemoryInfo.forEach((tabInfo) => {
      const windowData = windowMemoryMap.get(tabInfo.windowId) || {
        memory: 0,
        tabCount: 0,
        cpu: 0,
      };
      windowMemoryMap.set(tabInfo.windowId, {
        memory: windowData.memory + tabInfo.memoryUsage,
        tabCount: windowData.tabCount + 1,
        cpu: windowData.cpu + (tabInfo.cpuUsage || 0),
      });
    });

    const windowMemoryInfo: WindowMemoryInfo[] = Array.from(
      windowMemoryMap.entries()
    ).map(([windowId, data]) => ({
      windowId,
      memoryUsage: data.memory,
      tabCount: data.tabCount,
      cpuUsage: data.cpu,
    }));

    // Create CPU metrics
    const cpuUsage: CpuMetrics = {
      totalUsage: Math.min(processInfo.totalCpu || 0, 100),
      perTabUsage: new Map(
        tabMemoryInfo
          .filter((tab) => tab.cpuUsage !== undefined)
          .map((tab) => [tab.tabId, tab.cpuUsage || 0])
      ),
    };

    // Create system metrics object
    const metrics: SystemMetrics = {
      timestamp: Date.now(),
      memoryUsage,
      tabCount: tabs.length,
      windowCount: windows.length,
      tabMemoryInfo,
      windowMemoryInfo,
      cpuUsage,
    };

    return metrics;
  }

  /**
   * Estimate Chrome browser memory usage
   * This combines information from various sources to approximate Chrome's memory footprint
   */
  static async estimateBrowserMemoryUsage(tabCount: number): Promise<{totalMB: number, extensionMB: number}> {
    // Get this extension's memory usage
    let extensionMemoryMB = 0;
    
    // Use performance.memory if available (Chrome only feature)
    if (typeof performance !== "undefined" && "memory" in performance) {
      const memory = (performance as any).memory as {
        jsHeapSizeLimit: number;
        totalJSHeapSize: number;
        usedJSHeapSize: number;
      };
      
      // Convert to MB
      extensionMemoryMB = Math.round(memory.usedJSHeapSize / (1024 * 1024));
    }
    
    // Approximate memory per tab (very rough estimate)
    const averageMemoryPerTabMB = 60; // Most tabs use between 40-100MB
    
    // Approximate browser overhead (for the browser UI, renderer process, etc.)
    const browserOverheadMB = 300; // Base memory consumption for Chrome itself
    
    // Estimated browser memory: extension + tabs + overhead
    const tabsMemoryMB = tabCount * averageMemoryPerTabMB;
    const totalBrowserMemoryMB = extensionMemoryMB + tabsMemoryMB + browserOverheadMB;
    
    return {
      totalMB: totalBrowserMemoryMB,
      extensionMB: extensionMemoryMB
    };
  }

  /**
   * Analyze system health and return status
   */
  static getSystemStatus(metrics: SystemMetrics): SystemStatus {
    const { memoryUsage, tabCount } = metrics;
    const usagePercentage = memoryUsage.usagePercentage || 0;

    // Determine status based on memory usage and tab count
    if (usagePercentage > 85 || tabCount > 100) {
      return {
        status: "critical",
        message:
          usagePercentage > 85
            ? "High memory usage detected"
            : "Extremely high number of tabs open",
      };
    }

    if (usagePercentage > 70 || tabCount > 50) {
      return {
        status: "warning",
        message:
          usagePercentage > 70
            ? "Elevated memory usage detected"
            : "Large number of tabs open",
      };
    }

    return {
      status: "healthy",
      message: "System resources are optimal",
    };
  }

  /**
   * Calculate the trend of tab usage over time
   * Uses localStorage to store historical data
   */
  static trackTabUsageTrend(): {
    trend: "increasing" | "decreasing" | "stable";
    percentage: number;
  } {
    try {
      // Get historical data
      const historicalData: TabMetricEntry[] = JSON.parse(
        localStorage.getItem("tabMetricsHistory") || "[]"
      );
      const now = Date.now();

      // Add current count to history
      ChromeService.getTabs().then((tabs) => {
        const newEntry: TabMetricEntry = { count: tabs.length, timestamp: now };

        // Keep only last 7 days of data
        const recentData = [
          ...historicalData.filter(
            (entry: TabMetricEntry) =>
              entry.timestamp > now - 7 * 24 * 60 * 60 * 1000
          ),
          newEntry,
        ];

        localStorage.setItem("tabMetricsHistory", JSON.stringify(recentData));
      });

      // Calculate trend
      if (historicalData.length < 2) {
        return { trend: "stable", percentage: 0 };
      }

      // Get average of first half and second half
      const midpoint = Math.floor(historicalData.length / 2);
      const firstHalf = historicalData.slice(0, midpoint);
      const secondHalf = historicalData.slice(midpoint);

      const firstAvg =
        firstHalf.reduce(
          (sum: number, entry: TabMetricEntry) => sum + entry.count,
          0
        ) / firstHalf.length;
      const secondAvg =
        secondHalf.reduce(
          (sum: number, entry: TabMetricEntry) => sum + entry.count,
          0
        ) / secondHalf.length;

      const percentageChange = ((secondAvg - firstAvg) / firstAvg) * 100;

      if (percentageChange > 10) {
        return { trend: "increasing", percentage: Math.abs(percentageChange) };
      } else if (percentageChange < -10) {
        return { trend: "decreasing", percentage: Math.abs(percentageChange) };
      } else {
        return { trend: "stable", percentage: Math.abs(percentageChange) };
      }
    } catch (error) {
      console.error("Error tracking tab usage trend:", error);
      return { trend: "stable", percentage: 0 };
    }
  }

  /**
   * Get recommendations based on current system metrics
   */
  static getRecommendations(metrics: SystemMetrics): string[] {
    const recommendations: string[] = [];
    const { memoryUsage, tabCount, windowCount } = metrics;
    const usagePercentage = memoryUsage.usagePercentage || 0;

    if (usagePercentage > 70) {
      recommendations.push("Consider closing unused tabs to free up memory");
    }

    if (tabCount > 30) {
      recommendations.push(
        "You have many tabs open. Consider saving some as sessions for later use"
      );
    }

    if (windowCount > 3) {
      recommendations.push(
        "Consider consolidating your windows to improve organization"
      );
    }

    if (tabCount > 0 && windowCount > 0 && tabCount / windowCount > 15) {
      recommendations.push(
        "Your windows have many tabs. Consider grouping related tabs into separate windows"
      );
    }

    return recommendations;
  }
}
