import { STORAGE_KEYS } from "../../constants/storageKeys";
import { Task } from "../../views/Tasks/types/TaskInterface";
import { BaseRepository } from "./BaseRepository";

// Type for creating new tasks (without auto-generated fields)
export type TaskCreateDto = Omit<Task, "id" | "createdAt" | "updatedAt">;

export class TaskRepository extends BaseRepository<Task, TaskCreateDto> {
  protected readonly entityName = "Task";
  protected readonly storageKey = STORAGE_KEYS.TASKS;

  protected deserialize(data: unknown): Task | null {
    try {
      if (!data || typeof data !== "object") {
        return null;
      }

      const taskData = data as Record<string, unknown>;

      // Parse dates from ISO strings and handle all fields from TaskInterface
      const task: Task = {
        id: taskData.id as string,
        title: taskData.title as string,
        description: taskData.description as string | undefined,
        status: taskData.status as Task["status"],
        priority: taskData.priority as Task["priority"],
        category: taskData.category as Task["category"],
        size: taskData.size as Task["size"],
        tags: (taskData.tags as string[]) || [],
        dueDate: taskData.dueDate
          ? new Date(taskData.dueDate as string)
          : undefined,
        schedule: taskData.schedule as Task["schedule"] | undefined,
        createdAt: new Date(taskData.createdAt as string),
        updatedAt: new Date(taskData.updatedAt as string),
        // Focus tracking fields
        totalFocusTime: taskData.totalFocusTime as number | undefined,
        averageFocusTime: taskData.averageFocusTime as number | undefined,
        totalSessions: taskData.totalSessions as number | undefined,
        focusSessions: taskData.focusSessions as
          | Task["focusSessions"]
          | undefined,
      };

      return task;
    } catch (error) {
      console.error("Error deserializing task:", error, data);
      return null;
    }
  }
  protected serialize(task: Task): unknown {
    try {
      // Convert dates to ISO strings for storage
      return {
        ...task,
        dueDate: task.dueDate ? task.dueDate.toISOString() : undefined,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error("Error serializing task:", error, task);
      throw error;
    }
  }

  protected createEntity(dto: TaskCreateDto): Task {
    const now = new Date();
    return {
      ...dto,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };
  }

  protected getId(task: Task): string {
    return task.id;
  }

  protected validateEntity(task: Task): boolean {
    try {
      // Basic validation
      if (!task.id || typeof task.id !== "string") {
        console.warn("Task validation failed: invalid id");
        return false;
      }

      if (!task.title || typeof task.title !== "string") {
        console.warn("Task validation failed: invalid title");
        return false;
      }

      if (!task.createdAt || isNaN(new Date(task.createdAt).getTime())) {
        console.warn("Task validation failed: invalid createdAt");
        return false;
      }

      if (!task.updatedAt || isNaN(new Date(task.updatedAt).getTime())) {
        console.warn("Task validation failed: invalid updatedAt");
        return false;
      }

      // Validate dueDate if it exists
      if (task.dueDate && isNaN(new Date(task.dueDate).getTime())) {
        console.warn("Task validation failed: invalid dueDate");
        return false;
      }

      // Validate required enums based on TaskInterface.ts
      const validStatuses = ["inbox", "done"];
      if (!validStatuses.includes(task.status)) {
        console.warn("Task validation failed: invalid status");
        return false;
      }

      const validPriorities = ["low", "medium", "high"];
      if (!validPriorities.includes(task.priority)) {
        console.warn("Task validation failed: invalid priority");
        return false;
      }

      const validCategories = [
        "development",
        "design",
        "research",
        "meeting",
        "other",
      ];
      if (!validCategories.includes(task.category)) {
        console.warn("Task validation failed: invalid category");
        return false;
      }

      const validSizes = ["S", "M", "L", "XL"];
      if (!validSizes.includes(task.size)) {
        console.warn("Task validation failed: invalid size");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating task:", error, task);
      return false;
    }
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
