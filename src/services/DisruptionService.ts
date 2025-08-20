import {
  Disruption,
  DisruptionSummary,
  TimelineEntry,
} from "../interfaces/DisruptionInterface";
import { FocusSession } from "../interfaces/FocusSession";
import { StorageFactory } from "./StorageFactory";

export class DisruptionService {
  /**
   * Get the current storage service (dynamic lookup)
   */
  private getStorage() {
    return StorageFactory.getStorageService();
  }

  private readonly DISRUPTION_IDS_KEY = "disruption_ids";

  /**
   * Get all disruption IDs
   */
  private async getDisruptionIds(): Promise<string[]> {
    try {
      const result = await this.getStorage().get(this.DISRUPTION_IDS_KEY);
      return (result[this.DISRUPTION_IDS_KEY] as string[]) || [];
    } catch (error) {
      console.error("Error getting disruption IDs:", error);
      return [];
    }
  }

  /**
   * Add disruption ID to the list
   */
  private async addDisruptionId(disruptionId: string): Promise<void> {
    const ids = await this.getDisruptionIds();
    if (!ids.includes(disruptionId)) {
      ids.push(disruptionId);
      await this.getStorage().set({ [this.DISRUPTION_IDS_KEY]: ids });
    }
  }

  /**
   * Remove disruption ID from the list
   */
  private async removeDisruptionId(disruptionId: string): Promise<void> {
    const ids = await this.getDisruptionIds();
    const updatedIds = ids.filter((id) => id !== disruptionId);
    await this.getStorage().set({ [this.DISRUPTION_IDS_KEY]: updatedIds });
  }

  /**
   * Start tracking a new disruption
   */
  async startDisruption(
    title: string,
    category: Disruption["category"],
    taskId?: string
  ): Promise<Disruption> {
    const disruption: Disruption = {
      id: `disruption_${Date.now()}`,
      title,
      category,
      startTime: new Date(),
      taskId,
      date: new Date().toISOString().split("T")[0],
      isManualEntry: false,
    };

    await this.getStorage().set({
      [`disruption_${disruption.id}`]: disruption,
    });
    await this.addDisruptionId(disruption.id);
    return disruption;
  }

  /**
   * End a disruption
   */
  async endDisruption(disruptionId: string): Promise<Disruption | null> {
    const disruption = await this.getDisruption(disruptionId);
    if (!disruption) return null;

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - disruption.startTime.getTime()) / (1000 * 60)
    );

    const updatedDisruption: Disruption = {
      ...disruption,
      endTime,
      duration,
    };

    await this.getStorage().set({
      [`disruption_${disruptionId}`]: updatedDisruption,
    });
    return updatedDisruption;
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
    const disruption: Disruption = {
      id: `disruption_${Date.now()}`,
      title,
      category,
      startTime,
      endTime: new Date(startTime.getTime() + duration * 60 * 1000),
      duration,
      taskId,
      description,
      date: startTime.toISOString().split("T")[0],
      isManualEntry: true,
    };

    await this.getStorage().set({
      [`disruption_${disruption.id}`]: disruption,
    });
    await this.addDisruptionId(disruption.id);
    return disruption;
  }

  /**
   * Get a specific disruption
   */
  async getDisruption(disruptionId: string): Promise<Disruption | null> {
    try {
      const data = await this.getStorage().get(`disruption_${disruptionId}`);
      const disruption = data[`disruption_${disruptionId}`] as Disruption;
      if (!disruption) return null;

      // Convert date strings back to Date objects
      return {
        ...disruption,
        startTime: new Date(disruption.startTime),
        endTime: disruption.endTime ? new Date(disruption.endTime) : undefined,
      };
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
      const disruptionIds = await this.getDisruptionIds();
      const disruptions: Disruption[] = [];

      for (const disruptionId of disruptionIds) {
        const result = await this.getStorage().get(
          `disruption_${disruptionId}`
        );
        const disruption = result[`disruption_${disruptionId}`] as Disruption;

        if (disruption && disruption.date === date) {
          disruptions.push({
            ...disruption,
            startTime: new Date(disruption.startTime),
            endTime: disruption.endTime
              ? new Date(disruption.endTime)
              : undefined,
          });
        }
      }

      return disruptions.sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
      );
    } catch (error) {
      console.error("Error getting disruptions for date:", error);
      return [];
    }
  }

  /**
   * Get disruption summary for a date
   */
  async getDisruptionSummary(date: string): Promise<DisruptionSummary> {
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
  }

  /**
   * Create timeline combining focus sessions and disruptions
   */
  async createTimeline(
    date: string,
    focusSessions: FocusSession[]
  ): Promise<TimelineEntry[]> {
    const disruptions = await this.getDisruptionsForDate(date);
    const timeline: TimelineEntry[] = [];

    // Add focus sessions to timeline
    focusSessions.forEach((session) => {
      if (session.endTime) {
        timeline.push({
          id: session.id,
          type: "task",
          title: `Task: ${session.taskId}`, // We'd need to get actual task title
          startTime: session.startTime,
          endTime: session.endTime,
          duration: session.totalMinutes,
          category: "focus",
          taskId: session.taskId,
        });
      }
    });

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
  }

  /**
   * Get active disruption (one that's started but not ended)
   */
  async getActiveDisruption(): Promise<Disruption | null> {
    try {
      const disruptionIds = await this.getDisruptionIds();

      for (const disruptionId of disruptionIds) {
        const result = await this.getStorage().get(
          `disruption_${disruptionId}`
        );
        const disruption = result[`disruption_${disruptionId}`] as Disruption;

        if (disruption && !disruption.endTime) {
          return {
            ...disruption,
            startTime: new Date(disruption.startTime),
          };
        }
      }
      return null;
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
      await this.getStorage().remove([`disruption_${disruptionId}`]);
      await this.removeDisruptionId(disruptionId);
      return true;
    } catch (error) {
      console.error("Error deleting disruption:", error);
      return false;
    }
  }
}
