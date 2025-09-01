 import { StorageFactory } from "../../../services/StorageFactory";
import { STORAGE_KEYS } from "../../../constants/storageKeys";
import { FirebaseStorageService } from "../../../services/firebase/FirebaseStorageService";
import {
  serializeTaskForFirebase,
  deserializeTaskFromFirebase,
} from "../../../services/firebase/FirebaseSerializer";
import { Task, TaskFilters, TaskStats } from "../types/TaskInterface";

export class TasksService {
  /**
   * Get the current storage service (dynamic lookup)
   */
  private getStorage() {
    return StorageFactory.getStorageService();
  }

  /**
   * Get all tasks from storage
   */
  async getTasks(): Promise<Task[]> {
    try {
      const storage = this.getStorage();
      console.log(
        `TasksService.getTasks() using storage: ${storage.constructor.name}`
      );

      const data = await storage.get(STORAGE_KEYS.TASKS);
      const tasksData = (data[STORAGE_KEYS.TASKS] as unknown[]) || [];

      console.log(
        `Retrieved ${tasksData.length} raw task records from storage`
      );

      // Handle different storage types
      if (storage instanceof FirebaseStorageService) {
        // Use Firebase deserializer for Firebase storage
        const tasks = tasksData
          .map((taskData) => {
            try {
              return deserializeTaskFromFirebase(
                taskData as Record<string, unknown>
              );
            } catch (error) {
              console.error(
                "Error deserializing task from Firebase:",
                error,
                taskData
              );
              return null;
            }
          })
          .filter((task): task is Task => task !== null);

        console.log(
          `Successfully deserialized ${tasks.length} tasks from Firebase`
        );
        return tasks;
      } else {
        // Handle other storage types with legacy date parsing
        const tasks = tasksData
          .map((taskData) => {
            try {
              const task = taskData as Task;
              // Convert date strings back to Date objects for non-Firebase storage
              const parsedTask: Task = {
                ...task,
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                createdAt: new Date(task.createdAt),
                updatedAt: new Date(task.updatedAt),
              };
              return parsedTask;
            } catch (error) {
              console.error("Error parsing task dates:", error, taskData);
              return null;
            }
          })
          .filter((task): task is Task => task !== null);

        console.log(
          `Successfully parsed ${tasks.length} tasks from ${storage.constructor.name}`
        );
        return tasks;
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  }

  /**
   * Validate and sanitize a task's dates
   */
  private validateTaskDates(task: Task): Task {
    const now = new Date();

    // Ensure createdAt is valid
    let createdAt = task.createdAt;
    if (!createdAt || isNaN(new Date(createdAt).getTime())) {
      console.warn(`Invalid createdAt for task ${task.id}, using current time`);
      createdAt = now;
    }

    // Ensure updatedAt is valid
    let updatedAt = task.updatedAt;
    if (!updatedAt || isNaN(new Date(updatedAt).getTime())) {
      console.warn(`Invalid updatedAt for task ${task.id}, using current time`);
      updatedAt = now;
    }

    // Validate dueDate if it exists
    let dueDate = task.dueDate;
    if (dueDate && isNaN(new Date(dueDate).getTime())) {
      console.warn(`Invalid dueDate for task ${task.id}, removing dueDate`);
      dueDate = undefined;
    }

    return {
      ...task,
      createdAt,
      updatedAt,
      dueDate,
    };
  }

  /**
   * Save all tasks to storage
   */
  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      const storage = this.getStorage();
      console.log(
        `TasksService.saveTasks() saving ${tasks.length} tasks using storage: ${storage.constructor.name}`
      );

      // Validate dates first
      const validatedTasks = tasks.map((task) => this.validateTaskDates(task));

      // Handle serialization based on storage type
      let tasksToStore: unknown[];

      if (storage instanceof FirebaseStorageService) {
        // Use Firebase serializer for proper data formatting
        console.log(
          "Using Firebase storage - serializing with Firebase serializer"
        );
        tasksToStore = validatedTasks.map((task) => {
          try {
            return serializeTaskForFirebase(task);
          } catch (error) {
            console.error("Error serializing task for Firebase:", error, task);
            throw error;
          }
        });
      } else {
        // For other storage types, serialize to ISO strings
        console.log(
          "Using non-Firebase storage - serializing dates to ISO strings"
        );
        tasksToStore = validatedTasks.map((task) => ({
          ...task,
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString()
            : undefined,
          createdAt: new Date(task.createdAt).toISOString(),
          updatedAt: new Date(task.updatedAt).toISOString(),
        }));
      }

      console.log(
        "Task data sample being stored:",
        tasksToStore[0]
          ? {
              id: (tasksToStore[0] as Record<string, unknown>).id,
              title: (tasksToStore[0] as Record<string, unknown>).title,
              createdAt: (tasksToStore[0] as Record<string, unknown>).createdAt,
              updatedAt: (tasksToStore[0] as Record<string, unknown>).updatedAt,
              dueDate: (tasksToStore[0] as Record<string, unknown>).dueDate,
              storageType: storage.constructor.name,
            }
          : "No tasks to store"
      );

      await storage.set({
        [STORAGE_KEYS.TASKS]: tasksToStore,
      });

      console.log(
        `✅ Successfully saved ${tasks.length} tasks to ${storage.constructor.name}`
      );
    } catch (error) {
      console.error("Error saving tasks:", error);
      if (error instanceof Error) {
        console.error("TasksService save error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
      throw error;
    }
  }

  /**
   * Create a new task
   */
  async createTask(
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<Task> {
    const now = new Date();
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };

    const tasks = await this.getTasks();
    tasks.push(newTask);
    await this.saveTasks(tasks);

    return newTask;
  }

  /**
   * Update an existing task
   */
  async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<Task | null> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === taskId);

    if (taskIndex === -1) {
      console.error(`Task with ID ${taskId} not found`);
      return null;
    }

    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };

    tasks[taskIndex] = updatedTask;
    await this.saveTasks(tasks);

    return updatedTask;
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<boolean> {
    const tasks = await this.getTasks();
    const initialLength = tasks.length;
    const filteredTasks = tasks.filter((task) => task.id !== taskId);

    if (filteredTasks.length === initialLength) {
      console.error(`Task with ID ${taskId} not found`);
      return false;
    }

    await this.saveTasks(filteredTasks);
    return true;
  }

  /**
   * Get tasks filtered by criteria
   */
  async getFilteredTasks(filters: TaskFilters): Promise<Task[]> {
    const tasks = await this.getTasks();

    return tasks.filter((task) => {
      // Status filter
      if (filters.status && !filters.status.includes(task.status)) {
        return false;
      }

      // Category filter
      if (filters.category && !filters.category.includes(task.category)) {
        return false;
      }

      // Size filter
      if (filters.size && !filters.size.includes(task.size)) {
        return false;
      }

      // Priority filter
      if (filters.priority && !filters.priority.includes(task.priority)) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          task.title,
          task.description,
          ...(task.tags || []),
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get task statistics
   */
  async getTaskStats(): Promise<TaskStats> {
    const tasks = await this.getTasks();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const stats: TaskStats = {
      total: tasks.length,
      inbox: 0,
      signal: 0,
      noise: 0,
      done: 0,
      overdue: 0,
      dueToday: 0,
      dueThisWeek: 0,
    };

    tasks.forEach((task) => {
      // Status counts
      switch (task.status) {
        case "inbox":
          stats.inbox++;
          break;
        case "signal":
          stats.signal++;
          break;
        case "noise":
          stats.noise++;
          break;
        case "done":
          stats.done++;
          break;
      }

      // Due date counts
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (dueDate < today) {
          stats.overdue++;
        } else if (dueDate.toDateString() === today.toDateString()) {
          stats.dueToday++;
        } else if (dueDate <= weekFromNow) {
          stats.dueThisWeek++;
        }
      }
    });

    return stats;
  }

  /**
   * Move task to different status (for drag & drop)
   */
  async moveTaskToStatus(
    taskId: string,
    newStatus: Task["status"]
  ): Promise<Task | null> {
    return this.updateTask(taskId, { status: newStatus });
  }

  /**
   * Bulk update tasks
   */
  async bulkUpdateTasks(
    updates: Array<{ id: string; updates: Partial<Task> }>
  ): Promise<Task[]> {
    const tasks = await this.getTasks();
    const updatedTasks = [...tasks];

    updates.forEach(({ id, updates: taskUpdates }) => {
      const taskIndex = updatedTasks.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          ...taskUpdates,
          updatedAt: new Date(),
        };
      }
    });

    await this.saveTasks(updatedTasks);
    return updatedTasks;
  }
}

// Export a singleton instance
export const tasksService = new TasksService();
