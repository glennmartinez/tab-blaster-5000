import {
  SystemMetrics,
  SystemStatus,
  MemoryMetrics,
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
    const [tabs, windows] = await Promise.all([
      ChromeService.getTabs(),
      ChromeService.getWindows(),
    ]);

    // Default memory metrics
    const memoryUsage: MemoryMetrics = {
      usagePercentage: 0,
    };

    // Get memory info if available in Chrome
    if (chrome?.system?.memory) {
      await new Promise<void>((resolve) => {
        chrome.system.memory.getInfo((info) => {
          memoryUsage.usagePercentage = Math.round(
            ((info.capacity - info.availableCapacity) / info.capacity) * 100
          );
          resolve();
        });
      });
    } else if (typeof performance !== "undefined" && "memory" in performance) {
      // Use performance.memory as a fallback (only works in Chrome)
      // TypeScript doesn't know about this Chrome-specific property
      const memory = (performance as any).memory as {
        jsHeapSizeLimit: number;
        totalJSHeapSize: number;
        usedJSHeapSize: number;
      };

      memoryUsage.jsHeapSizeLimit = memory.jsHeapSizeLimit;
      memoryUsage.totalJSHeapSize = memory.totalJSHeapSize;
      memoryUsage.usedJSHeapSize = memory.usedJSHeapSize;
      memoryUsage.usagePercentage = Math.round(
        (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      );
    } else {
      // Mock data for development
      memoryUsage.usagePercentage = Math.round(30 + Math.random() * 40); // 30-70% usage
    }

    // Create system metrics object
    const metrics: SystemMetrics = {
      timestamp: Date.now(),
      memoryUsage,
      tabCount: tabs.length,
      windowCount: windows.length,
    };

    return metrics;
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
