import { useState, useEffect, useCallback } from "react";
import {
  SessionAnalyticsService,
  SessionTabAnalytics,
} from "../services/SessionAnalyticsService";

export const useSessionAnalytics = () => {
  const [analytics, setAnalytics] = useState<SessionTabAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const sessionAnalyticsService = SessionAnalyticsService.getInstance();

  // Load all session tab analytics
  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sessionAnalyticsService.getSessionTabAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading session analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [sessionAnalyticsService]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Get most visited session tabs
  const getMostVisited = useCallback(
    async (limit: number = 10): Promise<SessionTabAnalytics[]> => {
      return await sessionAnalyticsService.getMostVisitedSessionTabs(limit);
    },
    [sessionAnalyticsService]
  );

  // Get recently accessed session tabs
  const getRecentlyAccessed = useCallback(
    async (limit: number = 10): Promise<SessionTabAnalytics[]> => {
      return await sessionAnalyticsService.getRecentSessionTabs(limit);
    },
    [sessionAnalyticsService]
  );

  // Get high traffic session tabs
  const getHighTraffic = useCallback(
    async (minVisits: number = 5): Promise<SessionTabAnalytics[]> => {
      return await sessionAnalyticsService.getHighTrafficSessionTabs(minVisits);
    },
    [sessionAnalyticsService]
  );

  // Get analytics for a specific session
  const getSessionAnalytics = useCallback(
    async (sessionId: string): Promise<SessionTabAnalytics[]> => {
      return await sessionAnalyticsService.getSessionSpecificAnalytics(
        sessionId
      );
    },
    [sessionAnalyticsService]
  );

  // Get cross-session tabs
  const getCrossSessionTabs = useCallback(async (): Promise<
    SessionTabAnalytics[]
  > => {
    return await sessionAnalyticsService.getCrossSessionTabs();
  }, [sessionAnalyticsService]);

  // Track a visit manually
  const trackVisit = useCallback(
    async (url: string): Promise<void> => {
      await sessionAnalyticsService.trackSessionTabVisit(url);
      await loadAnalytics(); // Refresh data
    },
    [sessionAnalyticsService, loadAnalytics]
  );

  return {
    analytics,
    loading,
    getMostVisited,
    getRecentlyAccessed,
    getHighTraffic,
    getSessionAnalytics,
    getCrossSessionTabs,
    trackVisit,
    refreshAnalytics: loadAnalytics,
  };
};
