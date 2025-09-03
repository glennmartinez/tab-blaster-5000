import {
  BaseRepository,
  RepositoryResult,
  RepositoryOptions,
} from "./BaseRepository";
import { STORAGE_KEYS } from "../../constants/storageKeys";
import { FirebaseStorageService } from "../firebase/FirebaseStorageService";

// Define the Task interface (you'd import this from your actual Task interface)
interface Task {
  id: string;
  title: string;
  description?: string;
  status: "inbox" | "signal" | "noise" | "done";
  priority: "low" | "medium" | "high";
  category: string;
  size: "small" | "medium" | "large";
  tags?: string[];
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  totalSessions?: number;
  totalFocusTime?: number;
  averageFocusTime?: number;
  focusSessions?: FocusSession[]; // You'd import the proper type
}

interface FocusSession {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  totalMinutes: number;
}

// Create DTO for task creation (excludes auto-generated fields)
interface TaskCreateDto {
  title: string;
  description?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  category?: string;
  size?: Task["size"];
  tags?: string[];
  dueDate?: Date;
}

/**
 * Task Repository - Concrete implementation of BaseRepository
 *
 * This is where you implement the "serializer/deserializer" logic
 * that you're familiar with from Java, but as abstract methods instead
 * of injected dependencies.
 */
export class TaskRepository extends BaseRepository<Task, TaskCreateDto> {
  // Define repository metadata
  protected readonly entityName = "Task";
  protected readonly storageKey = STORAGE_KEYS.TASKS;

  /**
   * Deserialize raw data into a Task entity
   * This is like your Java deserializer - converts storage format to domain object
   */
  protected deserialize(data: unknown): Task | null {
    try {
      // Handle different storage providers
      const storage = this.getStorage();

      if (storage instanceof FirebaseStorageService) {
        // Firebase-specific deserialization - implement based on your existing logic
        // For now, fall back to standard deserialization
        console.warn('Firebase deserialization not yet implemented in repository');
        const taskData = data as Record<string, unknown>;
        if (!taskData || typeof taskData !== 'object' || !taskData.id || !taskData.title) {
          return null;
        }
        // Use the same logic as below but could be customized for Firebase format
      }
        // Handle other storage types (local, chrome, etc.)
        const taskData = data as Record<string, unknown>;

        if (!taskData || typeof taskData !== "object") {
          return null;
        }

        // Validate required fields
        if (!taskData.id || !taskData.title) {
          console.warn("Task missing required fields:", taskData);
          return null;
        }

        // Safe date parsing
        const parseDate = (dateValue: unknown): Date => {
          if (!dateValue) return new Date();
          if (dateValue instanceof Date) return dateValue;
          if (typeof dateValue === 'string' || typeof dateValue === 'number') {
            const parsed = new Date(dateValue);
            return isNaN(parsed.getTime()) ? new Date() : parsed;
          }
          return new Date();
        };

        return {
          id: String(taskData.id),
          title: String(taskData.title),
          description: taskData.description
            ? String(taskData.description)
            : undefined,
          status: (taskData.status as Task["status"]) || "inbox",
          priority: (taskData.priority as Task["priority"]) || "medium",
          category: String(taskData.category || "general"),
          size: (taskData.size as Task["size"]) || "medium",
          tags: Array.isArray(taskData.tags) ? taskData.tags.map(String) : [],
          dueDate: taskData.dueDate ? parseDate(taskData.dueDate) : undefined,
          createdAt: parseDate(taskData.createdAt),
          updatedAt: parseDate(taskData.updatedAt),
          totalSessions: Number(taskData.totalSessions || 0),
          totalFocusTime: Number(taskData.totalFocusTime || 0),
          averageFocusTime: Number(taskData.averageFocusTime || 0),
          focusSessions: Array.isArray(taskData.focusSessions)
            ? taskData.focusSessions
            : [],
        };
      }
    } catch (error) {
      console.error("Error deserializing task:", error, data);
      return null;
    }
  }

  /**
   * Serialize Task entity for storage
   * This is like your Java serializer - converts domain object to storage format
   */
  protected serialize(task: Task): unknown {
    const storage = this.getStorage();

    if (storage instanceof FirebaseStorageService) {
      // Firebase needs special date handling
      return {
        ...task,
        dueDate: task.dueDate?.toISOString() || null,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      };
    } else {
      // Other storage types - serialize dates to ISO strings
      return {
        ...task,
        dueDate: task.dueDate?.toISOString(),
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      };
    }
  }

  /**
   * Create a new Task entity from DTO
   * This handles the entity creation logic with auto-generated fields
   */
  protected createEntity(dto: TaskCreateDto): Task {
    const now = new Date();

    return {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: dto.title,
      description: dto.description,
      status: dto.status || "inbox",
      priority: dto.priority || "medium",
      category: dto.category || "general",
      size: dto.size || "medium",
      tags: dto.tags || [],
      dueDate: dto.dueDate,
      createdAt: now,
      updatedAt: now,
      totalSessions: 0,
      totalFocusTime: 0,
      averageFocusTime: 0,
      focusSessions: [],
    };
  }

  /**
   * Get the ID from a Task entity
   */
  protected getId(task: Task): string {
    return task.id;
  }

  /**
   * Validate a Task entity
   */
  protected validateEntity(task: Task): boolean {
    if (!task.id || !task.title) {
      return false;
    }

    if (!["inbox", "signal", "noise", "done"].includes(task.status)) {
      return false;
    }

    if (!["low", "medium", "high"].includes(task.priority)) {
      return false;
    }

    if (!["small", "medium", "large"].includes(task.size)) {
      return false;
    }

    return true;
  }

  // Additional task-specific methods

  /**
   * Find tasks by status
   */
  async findByStatus(
    status: Task["status"],
    options: RepositoryOptions<Task[]> = {}
  ): Promise<RepositoryResult<Task[]>> {
    try {
      const allTasksResult = await this.findAll(options);
      if (!allTasksResult.success || !allTasksResult.data) {
        throw new Error("Failed to fetch tasks");
      }

      const filteredTasks = allTasksResult.data.filter(
        (task) => task.status === status
      );

      return {
        ...allTasksResult,
        data: filteredTasks,
      };
    } catch (error) {
      return this.handleError(
        error,
        "findByStatus",
        options.fallback || [],
        Date.now()
      );
    }
  }

  /**
   * Find tasks by category
   */
  async findByCategory(
    category: string,
    options: RepositoryOptions<Task[]> = {}
  ): Promise<RepositoryResult<Task[]>> {
    try {
      const allTasksResult = await this.findAll(options);
      if (!allTasksResult.success || !allTasksResult.data) {
        throw new Error("Failed to fetch tasks");
      }

      const filteredTasks = allTasksResult.data.filter(
        (task) => task.category === category
      );

      return {
        ...allTasksResult,
        data: filteredTasks,
      };
    } catch (error) {
      return this.handleError(
        error,
        "findByCategory",
        options.fallback || [],
        Date.now()
      );
    }
  }

  /**
   * Update task focus statistics (example of domain-specific operation)
   */
  async updateFocusStats(
    taskId: string,
    sessionMinutes: number
  ): Promise<RepositoryResult<Task | null>> {
    try {
      const taskResult = await this.findById(taskId);
      if (!taskResult.success || !taskResult.data) {
        throw new Error("Task not found for focus stats update");
      }

      const task = taskResult.data;
      const newTotalSessions = (task.totalSessions || 0) + 1;
      const newTotalFocusTime = (task.totalFocusTime || 0) + sessionMinutes;
      const newAverageFocusTime = Math.round(
        newTotalFocusTime / newTotalSessions
      );

      return this.update(taskId, {
        totalSessions: newTotalSessions,
        totalFocusTime: newTotalFocusTime,
        averageFocusTime: newAverageFocusTime,
      });
    } catch (error) {
      return this.handleError(error, "updateFocusStats", null, Date.now());
    }
  }
}

// Export a factory function that creates repository instances
// This respects your dynamic storage switching requirement
export function createTaskRepository(): TaskRepository {
  return new TaskRepository();
}

// You can also export a singleton-like getter if needed
let taskRepositoryInstance: TaskRepository | null = null;

export function getTaskRepository(): TaskRepository {
  // Always create a new instance to respect storage provider changes
  // This is different from a true singleton but allows for storage switching
  return new TaskRepository();
}
