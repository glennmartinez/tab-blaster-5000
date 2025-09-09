import { STORAGE_KEYS } from "../../constants/storageKeys";
import { Disruption } from "../../interfaces/DisruptionInterface";
import { BaseRepository, RepositoryResult } from "./BaseRepository";

// Type for creating new disruptions (without auto-generated fields)
export type DisruptionCreateDto = Omit<Disruption, "id" | "date"> & {
  date?: string; // Optional since we can auto-generate from startTime
};

export class DisruptionRepository extends BaseRepository<
  Disruption,
  DisruptionCreateDto
> {
  protected readonly entityName = "Disruption";
  protected readonly storageKey = STORAGE_KEYS.DISRUPTIONS;

  protected deserialize(data: unknown): Disruption | null {
    try {
      if (!data || typeof data !== "object") {
        return null;
      }

      const disruptionData = data as Record<string, unknown>;

      const disruption: Disruption = {
        id: disruptionData.id as string,
        title: disruptionData.title as string,
        category: disruptionData.category as Disruption["category"],
        startTime: new Date(disruptionData.startTime as string),
        endTime: disruptionData.endTime
          ? new Date(disruptionData.endTime as string)
          : undefined,
        duration: disruptionData.duration as number | undefined,
        description: disruptionData.description as string | undefined,
        isManualEntry: disruptionData.isManualEntry as boolean | undefined,
        taskId: disruptionData.taskId as string | undefined,
        date: disruptionData.date as string,
      };

      return disruption;
    } catch (error) {
      console.error("Error deserializing disruption:", error, data);
      return null;
    }
  }

  protected serialize(entity: Disruption): unknown {
    return {
      id: entity.id,
      title: entity.title,
      category: entity.category,
      startTime: entity.startTime.toISOString(),
      endTime: entity.endTime?.toISOString(),
      duration: entity.duration,
      description: entity.description,
      isManualEntry: entity.isManualEntry,
      taskId: entity.taskId,
      date: entity.date,
    };
  }

  protected createEntity(dto: DisruptionCreateDto): Disruption {
    return {
      id: `disruption_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: dto.title,
      category: dto.category,
      startTime: dto.startTime,
      endTime: dto.endTime,
      duration: dto.duration,
      description: dto.description,
      isManualEntry: dto.isManualEntry || false,
      taskId: dto.taskId,
      date: dto.date || dto.startTime.toISOString().split("T")[0], // Auto-generate from startTime if not provided
    };
  }

  protected getId(entity: Disruption): string {
    return entity.id;
  }

  protected validateEntity(entity: Disruption): boolean {
    return !!(
      entity.id &&
      entity.title &&
      entity.category &&
      entity.startTime &&
      entity.date
    );
  }

  /**
   * Find disruptions by date
   */
  async findByDate(date: string): Promise<RepositoryResult<Disruption[]>> {
    const startTime = Date.now();
    const operation = "findByDate";

    try {
      console.log(
        `🔍 ${this.entityName}Repository.${operation}(${date}) - Starting`
      );

      const allDisruptionsResult = await this.findAll();
      if (!allDisruptionsResult.success || !allDisruptionsResult.data) {
        throw new Error("Failed to fetch disruptions for findByDate");
      }

      const disruptionsForDate = allDisruptionsResult.data.filter(
        (disruption) => disruption.date === date
      );

      console.log(
        `✅ Found ${disruptionsForDate.length} disruptions for date ${date}`
      );

      return {
        success: true,
        data: disruptionsForDate,
        metadata: {
          provider: allDisruptionsResult.metadata.provider,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(error, operation, [], startTime);
    }
  }

  /**
   * Find disruptions by task ID
   */
  async findByTaskId(taskId: string): Promise<RepositoryResult<Disruption[]>> {
    const startTime = Date.now();
    const operation = "findByTaskId";

    try {
      console.log(
        `🔍 ${this.entityName}Repository.${operation}(${taskId}) - Starting`
      );

      const allDisruptionsResult = await this.findAll();
      if (!allDisruptionsResult.success || !allDisruptionsResult.data) {
        throw new Error("Failed to fetch disruptions for findByTaskId");
      }

      const disruptionsForTask = allDisruptionsResult.data.filter(
        (disruption) => disruption.taskId === taskId
      );

      console.log(
        `✅ Found ${disruptionsForTask.length} disruptions for task ${taskId}`
      );

      return {
        success: true,
        data: disruptionsForTask,
        metadata: {
          provider: allDisruptionsResult.metadata.provider,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(error, operation, [], startTime);
    }
  }

  /**
   * Find active disruption (one without an end time)
   */
  async findActive(): Promise<RepositoryResult<Disruption | null>> {
    const startTime = Date.now();
    const operation = "findActive";

    try {
      console.log(`🔍 ${this.entityName}Repository.${operation}() - Starting`);

      const allDisruptionsResult = await this.findAll();
      if (!allDisruptionsResult.success || !allDisruptionsResult.data) {
        throw new Error("Failed to fetch disruptions for findActive");
      }

      const activeDisruption =
        allDisruptionsResult.data.find((disruption) => !disruption.endTime) ||
        null;

      console.log(
        `${activeDisruption ? "✅" : "⚠️"} Active disruption ${
          activeDisruption ? "found" : "not found"
        }`
      );

      return {
        success: true,
        data: activeDisruption,
        metadata: {
          provider: allDisruptionsResult.metadata.provider,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(error, operation, null, startTime);
    }
  }

  /**
   * End a disruption by setting end time and calculating duration
   */
  async endDisruption(
    disruptionId: string
  ): Promise<RepositoryResult<Disruption | null>> {
    const startTime = Date.now();
    const operation = "endDisruption";

    try {
      console.log(
        `📝 ${this.entityName}Repository.${operation}(${disruptionId}) - Starting`
      );

      const disruptionResult = await this.findById(disruptionId);
      if (!disruptionResult.success || !disruptionResult.data) {
        console.warn(`⚠️ Disruption ${disruptionId} not found for ending`);
        return {
          success: true,
          data: null,
          metadata: {
            provider: this.getStorage().constructor.name,
            operation,
            timestamp: new Date(),
            duration: Date.now() - startTime,
          },
        };
      }

      const disruption = disruptionResult.data;
      const endTime = new Date();
      const duration = Math.floor(
        (endTime.getTime() - disruption.startTime.getTime()) / (1000 * 60)
      );

      const updateResult = await this.update(disruptionId, {
        endTime,
        duration,
      });

      console.log(
        `✅ Ended disruption ${disruptionId} with duration ${duration} minutes`
      );

      return {
        success: true,
        data: updateResult.data,
        metadata: {
          provider: updateResult.metadata.provider,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(error, operation, null, startTime);
    }
  }
}
