import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Disruption,
  DisruptionSummary,
  TimelineEntry,
} from "../interfaces/DisruptionInterface";
import { NewDisruptionService } from "../services/domain/NewDisruptionService";
import { FocusSession } from "../interfaces/FocusSession";

export const useDisruptions = () => {
  const [activeDisruption, setActiveDisruption] = useState<Disruption | null>(
    null
  );
  const [todaysDisruptions, setTodaysDisruptions] = useState<Disruption[]>([]);
  const [disruptionSummary, setDisruptionSummary] =
    useState<DisruptionSummary | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create service instance once
  const disruptionService = useMemo(() => new NewDisruptionService(), []);

  /**
   * Get today's date string
   */
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  /**
   * Load today's disruptions and summary
   */
  const loadTodaysData = useCallback(async () => {
    const today = getTodayDate();
    try {
      const disruptions = await disruptionService.getDisruptionsForDate(today);
      const summary = await disruptionService.getDisruptionSummary(today);

      setTodaysDisruptions(disruptions);
      setDisruptionSummary(summary);
    } catch (error) {
      console.error("Error loading today's disruption data:", error);
    }
  }, [disruptionService]);

  /**
   * Load active disruption
   */
  const loadActiveDisruption = useCallback(async () => {
    try {
      const active = await disruptionService.getActiveDisruption();
      setActiveDisruption(active);
    } catch (error) {
      console.error("Error loading active disruption:", error);
    }
  }, [disruptionService]);

  /**
   * Create timeline with focus sessions
   */
  const createTimelineWithSessions = useCallback(
    async (focusSessions: FocusSession[]) => {
      const today = getTodayDate();
      try {
        const timelineData = await disruptionService.createTimeline(
          today,
          focusSessions
        );
        setTimeline(timelineData);
      } catch (error) {
        console.error("Error creating timeline:", error);
      }
    },
    [disruptionService]
  );

  /**
   * Start a new disruption
   */
  const startDisruption = useCallback(
    async (
      title: string,
      category: Disruption["category"],
      taskId?: string
    ): Promise<Disruption | null> => {
      setIsLoading(true);
      try {
        const disruption = await disruptionService.startDisruption(
          title,
          category,
          taskId
        );
        setActiveDisruption(disruption);
        await loadTodaysData();
        return disruption;
      } catch (error) {
        console.error("Error starting disruption:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [disruptionService, loadTodaysData]
  );

  /**
   * End the active disruption
   */
  const endDisruption = useCallback(async (): Promise<Disruption | null> => {
    if (!activeDisruption) return null;

    setIsLoading(true);
    try {
      const completedDisruption = await disruptionService.endDisruption(
        activeDisruption.id
      );
      setActiveDisruption(null);
      await loadTodaysData();
      return completedDisruption;
    } catch (error) {
      console.error("Error ending disruption:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeDisruption, disruptionService, loadTodaysData]);

  /**
   * Create a manual disruption entry
   */
  const createManualDisruption = useCallback(
    async (
      title: string,
      category: Disruption["category"],
      startTime: Date,
      duration: number,
      taskId?: string,
      description?: string
    ): Promise<Disruption | null> => {
      setIsLoading(true);
      try {
        const disruption = await disruptionService.createManualDisruption(
          title,
          category,
          startTime,
          duration,
          taskId,
          description
        );
        await loadTodaysData();
        return disruption;
      } catch (error) {
        console.error("Error creating manual disruption:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [disruptionService, loadTodaysData]
  );

  /**
   * Delete a disruption
   */
  const deleteDisruption = useCallback(
    async (disruptionId: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        const success = await disruptionService.deleteDisruption(disruptionId);
        if (success) {
          // If we deleted the active disruption, clear it
          if (activeDisruption && activeDisruption.id === disruptionId) {
            setActiveDisruption(null);
          }
          await loadTodaysData();
        }
        return success;
      } catch (error) {
        console.error("Error deleting disruption:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [activeDisruption, disruptionService, loadTodaysData]
  );

  /**
   * Get disruption duration as formatted string
   */
  const getDisruptionDuration = (disruption: Disruption): string => {
    if (disruption.duration !== undefined) {
      const hours = Math.floor(disruption.duration / 60);
      const minutes = disruption.duration % 60;
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }

    // If active, calculate current duration
    const now = new Date();
    const duration = Math.floor(
      (now.getTime() - disruption.startTime.getTime()) / (1000 * 60)
    );
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  /**
   * Get active disruption duration timer
   */
  const getActiveDisruptionTimer = (): string => {
    if (!activeDisruption) return "0m";
    return getDisruptionDuration(activeDisruption);
  };

  // Load initial data
  useEffect(() => {
    loadTodaysData();
    loadActiveDisruption();
  }, [loadTodaysData, loadActiveDisruption]);

  // Update active disruption timer every minute
  useEffect(() => {
    if (!activeDisruption) return;

    const timer = setInterval(() => {
      setActiveDisruption((prev) => (prev ? { ...prev } : null));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [activeDisruption]);

  return {
    activeDisruption,
    todaysDisruptions,
    disruptionSummary,
    timeline,
    isLoading,
    startDisruption,
    endDisruption,
    createManualDisruption,
    deleteDisruption,
    loadTodaysData,
    createTimelineWithSessions,
    getDisruptionDuration,
    getActiveDisruptionTimer,
  };
};
