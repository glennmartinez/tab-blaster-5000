/**
 * Memory usage metrics
 */
export interface MemoryMetrics {
  usagePercentage: number;
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
  totalMemoryMB?: number;
  usedMemoryMB?: number;
  isTabsOnlyMetric?: boolean;
  showAbsoluteOnly?: boolean; // Flag to show absolute values only, not percentages
  browserMemoryMB?: number;   // Estimated total Chrome browser memory usage
  extensionMemoryMB?: number; // Memory used by this extension
}

/**
 * Per-tab memory metrics
 */
export interface TabMemoryInfo {
  tabId: number;
  title: string;
  url: string;
  memoryUsage: number; // Memory in kilobytes
  processId?: number;
  windowId: number;
  cpuUsage?: number; // CPU usage percentage
}

/**
 * Per-window memory metrics
 */
export interface WindowMemoryInfo {
  windowId: number;
  memoryUsage: number; // Memory in kilobytes
  tabCount: number;
  cpuUsage?: number; // CPU usage percentage
}

/**
 * CPU usage metrics
 */
export interface CpuMetrics {
  totalUsage: number; // Percentage of CPU usage (0-100)
  perTabUsage?: Map<number, number>; // Map of tab ID to CPU usage percentage
}

/**
 * System health status
 */
export interface SystemStatus {
  status: "healthy" | "warning" | "critical";
  message: string;
}

/**
 * Overall system metrics
 */
export interface SystemMetrics {
  timestamp: number;
  memoryUsage: MemoryMetrics;
  tabCount: number;
  windowCount: number;
  tabMemoryInfo?: TabMemoryInfo[];
  windowMemoryInfo?: WindowMemoryInfo[];
  cpuUsage?: CpuMetrics;
}
