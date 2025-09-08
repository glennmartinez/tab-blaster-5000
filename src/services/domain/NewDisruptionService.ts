import {
  Disruption,
  DisruptionSummary,
  TimelineEntry,
} from "../../interfaces/DisruptionInterface";
import { FocusSession } from "../../interfaces/FocusSession";
import {
  DisruptionRepository,
  DisruptionCreateDto,
} from "../repositories/DisruptionRepository";
import { NewTasksService } from "./NewTasksService";

export class NewDisruptionService {
  private repository: DisruptionRepository;
  private tasksService: NewTasksService;

  constructor() {
    this.repository = new DisruptionRepository();
    this.tasksService = new NewTasksService();
  }

  /**
   * Start tracking a new disruption
   */
  async startDisruption(
    title: string,
    category: Disruption["category"],
    taskId?: string
  ): Promise<Disruption> {
    const disruptionDto: DisruptionCreateDto = {
      title,
      category,
      startTime: new Date(),
      taskId,
      isManualEntry: false,
    };

    const result = await this.repository.create(disruptionDto);
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to create disruption");
    }

    return result.data;
  }

  /**
   * End a disruption
   */
  async endDisruption(disruptionId: string): Promise<Disruption | null> {
    const result = await this.repository.endDisruption(disruptionId);
    if (!result.success) {
      throw new Error(result.error?.message || "Failed to end disruption");
    }
    return result.data || null;
  }

  /**
   * Create a manual disruption entry (when user forgot to track)
   */
  async createManualDisruption(
    title: string,
    category: Disruption["category"],
    startTime: Date,
    duration: number,
    taskId?: string,
    description?: string
  ): Promise<Disruption> {
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const disruptionDto: DisruptionCreateDto = {
      title,
      category,
      startTime,
      endTime,
      duration,
      taskId,
      description,
      isManualEntry: true,
    };

    const result = await this.repository.create(disruptionDto);
    if (!result.success || !result.data) {
      throw new Error(
        result.error?.message || "Failed to create manual disruption"
      );
    }

    return result.data;
  }

  /**
   * Get a specific disruption
   */
  async getDisruption(disruptionId: string): Promise<Disruption | null> {
    try {
      const result = await this.repository.findById(disruptionId);
      if (result.success) {
        return result.data || null;
      } else {
        console.error("Failed to get disruption:", result.error);
        return null;
      }
    } catch (error) {
      console.error("Error getting disruption:", error);
      return null;
    }
  }

  /**
   * Get all disruptions for a specific date
   */
  async getDisruptionsForDate(date: string): Promise<Disruption[]> {
    try {
      const result = await this.repository.findByDate(date);
      if (result.success && result.data) {
        return result.data.sort(
          (a, b) => a.startTime.getTime() - b.startTime.getTime()
        );
      } else {
        console.error("Failed to get disruptions for date:", result.error);
        return [];
      }
    } catch (error) {
      console.error("Error getting disruptions for date:", error);
      return [];
    }
  }

  /**
   * Get disruption summary for a date
   */
  async getDisruptionSummary(date: string): Promise<DisruptionSummary> {
    try {
      const disruptions = await this.getDisruptionsForDate(date);
      const completedDisruptions = disruptions.filter(
        (d) => d.duration !== undefined
      );

      const totalDisruptions = completedDisruptions.length;
      const totalDisruptionTime = completedDisruptions.reduce(
        (sum, d) => sum + (d.duration || 0),
        0
      );
      const averageDisruptionLength =
        totalDisruptions > 0 ? totalDisruptionTime / totalDisruptions : 0;

      const disruptionsByCategory: Record<string, number> = {};
      const disruptionTimeByCategory: Record<string, number> = {};

      completedDisruptions.forEach((d) => {
        disruptionsByCategory[d.category] =
          (disruptionsByCategory[d.category] || 0) + 1;
        disruptionTimeByCategory[d.category] =
          (disruptionTimeByCategory[d.category] || 0) + (d.duration || 0);
      });

      const mostCommonCategory =
        Object.entries(disruptionsByCategory).sort(
          ([, a], [, b]) => b - a
        )[0]?.[0] || "none";

      return {
        totalDisruptions,
        totalDisruptionTime,
        averageDisruptionLength,
        mostCommonCategory,
        disruptionsByCategory,
        disruptionTimeByCategory,
      };
    } catch (error) {
      console.error("Error calculating disruption summary:", error);
      return {
        totalDisruptions: 0,
        totalDisruptionTime: 0,
        averageDisruptionLength: 0,
        mostCommonCategory: "none",
        disruptionsByCategory: {},
        disruptionTimeByCategory: {},
      };
    }
  }

  /**
   * Create timeline combining focus sessions and disruptions
   */
  async createTimeline(
    date: string,
    focusSessions: FocusSession[]
  ): Promise<TimelineEntry[]> {
    try {
      const disruptions = await this.getDisruptionsForDate(date);
      const timeline: TimelineEntry[] = [];

      // Add focus sessions to timeline
      for (const session of focusSessions) {
        if (session.endTime) {
          // Try to get task title
          let taskTitle = `Task: ${session.taskId}`;
          try {
            const task = await this.tasksService.findTaskById(session.taskId);
            if (task) {
              taskTitle = `Task: ${task.title}`;
            }
          } catch (error) {
            // Use fallback title if task lookup fails
            console.warn("Could not get task title for timeline:", error);
          }

          timeline.push({
            id: session.id,
            type: "task",
            title: taskTitle,
            startTime: session.startTime,
            endTime: session.endTime,
            duration: session.totalMinutes,
            category: "focus",
            taskId: session.taskId,
          });
        }
      }

      // Add disruptions to timeline
      disruptions.forEach((disruption) => {
        if (disruption.endTime && disruption.duration) {
          timeline.push({
            id: disruption.id,
            type: "disruption",
            title: disruption.title,
            startTime: disruption.startTime,
            endTime: disruption.endTime,
            duration: disruption.duration,
            category: disruption.category,
            taskId: disruption.taskId,
          });
        }
      });

      return timeline.sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );
    } catch (error) {
      console.error("Error creating timeline:", error);
      return [];
    }
  }

  /**
   * Get active disruption (one that's started but not ended)
   */
  async getActiveDisruption(): Promise<Disruption | null> {
    try {
      const result = await this.repository.findActive();
      if (result.success) {
        return result.data || null;
      } else {
        console.error("Failed to get active disruption:", result.error);
        return null;
      }
    } catch (error) {
      console.error("Error getting active disruption:", error);
      return null;
    }
  }

  /**
   * Delete a disruption
   */
  async deleteDisruption(disruptionId: string): Promise<boolean> {
    try {
      const result = await this.repository.delete(disruptionId);
      if (result.success) {
        return result.data || false;
      } else {
        console.error("Failed to delete disruption:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error deleting disruption:", error);
      return false;
    }
  }

  /**
   * Get disruptions for a specific task
   */
  async getDisruptionsForTask(taskId: string): Promise<Disruption[]> {
    try {
      const result = await this.repository.findByTaskId(taskId);
      if (result.success && result.data) {
        return result.data.sort(
          (a, b) => a.startTime.getTime() - b.startTime.getTime()
        );
      } else {
        console.error("Failed to get disruptions for task:", result.error);
        return [];
      }
    } catch (error) {
      console.error("Error getting disruptions for task:", error);
      return [];
    }
  }

  /**
   * Update a disruption
   */
  async updateDisruption(
    disruptionId: string,
    updates: Partial<Disruption>
  ): Promise<Disruption | null> {
    try {
      const result = await this.repository.update(disruptionId, updates);
      if (result.success) {
        return result.data || null;
      } else {
        console.error("Failed to update disruption:", result.error);
        return null;
      }
    } catch (error) {
      console.error("Error updating disruption:", error);
      return null;
    }
  }
}

// Export singleton instance
export const newDisruptionService = new NewDisruptionService();
