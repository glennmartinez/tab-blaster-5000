import { useState, useEffect, useCallback } from "react";
import { SystemMetrics, SystemStatus } from "../models/SystemMetrics";
import { MetricsController } from "../controllers/MetricsController";

/**
 * Hook to provide system metrics data and operations
 */
export const useSystemMetrics = (refreshInterval: number = 30000) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch current system metrics
   */
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedMetrics = await MetricsController.getSystemMetrics();
      setMetrics(fetchedMetrics);

      // Calculate derived values
      const systemStatus = MetricsController.getSystemStatus(fetchedMetrics);
      setStatus(systemStatus);

      const metricRecommendations =
        MetricsController.getRecommendations(fetchedMetrics);
      setRecommendations(metricRecommendations);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch system metrics")
      );
      console.error("Error fetching system metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get tab usage trend
   */
  const getTabUsageTrend = useCallback(() => {
    return MetricsController.trackTabUsageTrend();
  }, []);

  // Fetch metrics on mount and set up refresh interval
  useEffect(() => {
    fetchMetrics();

    // Set up periodic refresh
    const intervalId = setInterval(() => {
      fetchMetrics();
    }, refreshInterval);

    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [fetchMetrics, refreshInterval]);

  return {
    metrics,
    status,
    recommendations,
    loading,
    error,
    fetchMetrics,
    getTabUsageTrend,
  };
};
