import { STORAGE_KEYS } from "../../constants/storageKeys";
import { FocusSession, TaskFocusData } from "../../interfaces/FocusSession";
import { BaseRepository, RepositoryResult } from "./BaseRepository";

// Type for creating new focus sessions (without auto-generated fields)
export type FocusSessionCreateDto = Omit<
  FocusSession,
  "id" | "totalMinutes"
> & {
  totalMinutes?: number; // Optional since it's usually calculated
};

export class FocusSessionRepository extends BaseRepository<
  FocusSession,
  FocusSessionCreateDto
> {
  protected readonly entityName = "FocusSession";
  protected readonly storageKey = STORAGE_KEYS.TASK_FOCUS_DATA; // We'll store sessions as part of task focus data

  protected deserialize(data: unknown): FocusSession | null {
    try {
      if (!data || typeof data !== "object") {
        return null;
      }

      const sessionData = data as Record<string, unknown>;

      const session: FocusSession = {
        id: sessionData.id as string,
        taskId: sessionData.taskId as string,
        startTime: new Date(sessionData.startTime as string),
        endTime: sessionData.endTime
          ? new Date(sessionData.endTime as string)
          : undefined,
        totalMinutes: sessionData.totalMinutes as number,
      };

      return session;
    } catch (error) {
      console.error("Error deserializing focus session:", error, data);
      return null;
    }
  }

  protected serialize(entity: FocusSession): unknown {
    return {
      id: entity.id,
      taskId: entity.taskId,
      startTime: entity.startTime.toISOString(),
      endTime: entity.endTime?.toISOString(),
      totalMinutes: entity.totalMinutes,
    };
  }

  protected createEntity(dto: FocusSessionCreateDto): FocusSession {
    return {
      id: `focus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId: dto.taskId,
      startTime: dto.startTime,
      endTime: dto.endTime,
      totalMinutes: dto.totalMinutes || 0,
    };
  }

  protected getId(entity: FocusSession): string {
    return entity.id;
  }

  protected validateEntity(entity: FocusSession): boolean {
    return !!(
      entity.id &&
      entity.taskId &&
      entity.startTime &&
      typeof entity.totalMinutes === "number"
    );
  }

  /**
   * Get all focus sessions from task focus data
   */
  async findAll(): Promise<RepositoryResult<FocusSession[]>> {
    const startTime = Date.now();
    const operation = "findAll";

    try {
      console.log(`🔍 ${this.entityName}Repository.${operation}() - Starting`);

      const storage = this.getStorage();
      const rawData = await storage.get(this.storageKey);
      const taskFocusDataMap =
        (rawData[this.storageKey] as { [taskId: string]: TaskFocusData }) || {};

      console.log(
        `📊 Retrieved task focus data for ${
          Object.keys(taskFocusDataMap).length
        } tasks`
      );

      // Extract all sessions from all tasks
      const allSessions: FocusSession[] = [];
      Object.values(taskFocusDataMap).forEach((taskData) => {
        if (taskData.sessions && taskData.sessions.length > 0) {
          taskData.sessions.forEach((session) => {
            const deserializedSession = this.deserialize(session);
            if (deserializedSession) {
              allSessions.push(deserializedSession);
            }
          });
        }
      });

      console.log(
        `✅ Successfully retrieved ${allSessions.length} focus sessions`
      );

      return {
        success: true,
        data: allSessions,
        metadata: {
          provider: storage.constructor.name,
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
   * Get sessions for a specific task
   */
  async findByTaskId(
    taskId: string
  ): Promise<RepositoryResult<FocusSession[]>> {
    const startTime = Date.now();
    const operation = "findByTaskId";

    try {
      console.log(
        `🔍 ${this.entityName}Repository.${operation}(${taskId}) - Starting`
      );

      const taskFocusData = await this.getTaskFocusData(taskId);
      const sessions = taskFocusData?.sessions || [];

      console.log(`✅ Found ${sessions.length} sessions for task ${taskId}`);

      return {
        success: true,
        data: sessions,
        metadata: {
          provider: this.getStorage().constructor.name,
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
   * Add a session to a task's focus data
   */
  async addSessionToTask(
    session: FocusSession
  ): Promise<RepositoryResult<FocusSession>> {
    const startTime = Date.now();
    const operation = "addSessionToTask";

    try {
      console.log(`📝 ${this.entityName}Repository.${operation}() - Starting`);

      // Get current task focus data
      const taskFocusData = await this.getTaskFocusData(session.taskId);

      // Add the session
      if (!taskFocusData.sessions) {
        taskFocusData.sessions = [];
      }
      taskFocusData.sessions.push(session);

      // Update statistics
      taskFocusData.totalSessions = taskFocusData.sessions.length;
      taskFocusData.totalFocusTime = taskFocusData.sessions.reduce(
        (sum, s) => sum + s.totalMinutes,
        0
      );
      taskFocusData.averageFocusTime = Math.round(
        taskFocusData.totalFocusTime / taskFocusData.totalSessions
      );

      // Save updated data
      await this.saveTaskFocusData(taskFocusData);

      console.log(`✅ Added session to task ${session.taskId}`);

      return {
        success: true,
        data: session,
        metadata: {
          provider: this.getStorage().constructor.name,
          operation,
          timestamp: new Date(),
          duration: Date.now() - startTime,
        },
      };
    } catch (error) {
      return this.handleError(error, operation, session, startTime);
    }
  }

  /**
   * Get task focus data for a specific task
   */
  async getTaskFocusData(taskId: string): Promise<TaskFocusData> {
    try {
      const storage = this.getStorage();
      const rawData = await storage.get(this.storageKey);
      const taskFocusDataMap =
        (rawData[this.storageKey] as { [taskId: string]: TaskFocusData }) || {};

      if (taskFocusDataMap[taskId]) {
        const taskData = taskFocusDataMap[taskId];
        // Convert session date strings back to Date objects
        taskData.sessions = taskData.sessions
          .map((session) => this.deserialize(session))
          .filter(Boolean) as FocusSession[];
        return taskData;
      }

      // Return default data if none exists
      return {
        taskId,
        totalFocusTime: 0,
        averageFocusTime: 0,
        totalSessions: 0,
        sessions: [],
      };
    } catch (error) {
      console.error("Error fetching task focus data:", error);
      return {
        taskId,
        totalFocusTime: 0,
        averageFocusTime: 0,
        totalSessions: 0,
        sessions: [],
      };
    }
  }

  /**
   * Save task focus data
   */
  async saveTaskFocusData(taskData: TaskFocusData): Promise<void> {
    try {
      const storage = this.getStorage();
      const rawData = await storage.get(this.storageKey);
      const taskFocusDataMap =
        (rawData[this.storageKey] as { [taskId: string]: unknown }) || {};

      // Serialize the sessions before saving
      const serializedTaskData = {
        ...taskData,
        sessions: taskData.sessions.map((session) => this.serialize(session)),
      };

      taskFocusDataMap[taskData.taskId] = serializedTaskData;

      await storage.set({
        [this.storageKey]: taskFocusDataMap,
      });
    } catch (error) {
      console.error("Error saving task focus data:", error);
      throw error;
    }
  }

  /**
   * Get current active session
   */
  async getCurrentSession(): Promise<FocusSession | null> {
    try {
      const storage = this.getStorage();
      const data = await storage.get(STORAGE_KEYS.CURRENT_FOCUS_SESSION);
      const sessionData = data[STORAGE_KEYS.CURRENT_FOCUS_SESSION];

      if (!sessionData) return null;

      return this.deserialize(sessionData);
    } catch (error) {
      console.error("Error getting current session:", error);
      return null;
    }
  }

  /**
   * Set current active session
   */
  async setCurrentSession(session: FocusSession): Promise<void> {
    try {
      const storage = this.getStorage();
      await storage.set({
        [STORAGE_KEYS.CURRENT_FOCUS_SESSION]: this.serialize(session),
      });
    } catch (error) {
      console.error("Error setting current session:", error);
      throw error;
    }
  }

  /**
   * Clear current active session
   */
  async clearCurrentSession(): Promise<void> {
    try {
      const storage = this.getStorage();
      await storage.remove([STORAGE_KEYS.CURRENT_FOCUS_SESSION]);
    } catch (error) {
      console.error("Error clearing current session:", error);
      throw error;
    }
  }
}
