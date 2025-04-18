/**
 * Memory usage metrics
 */
export interface MemoryMetrics {
  usagePercentage: number;
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
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
}
