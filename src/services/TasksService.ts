import { Task, TaskFilters, TaskStats } from "../interfaces/TaskInterface";
import { StorageFactory } from "./StorageFactory";
import { STORAGE_KEYS } from "../constants/storageKeys";

export class TasksService {
  private storage = StorageFactory.getStorageService();

  /**
   * Get all tasks from storage
   */
  async getTasks(): Promise<Task[]> {
    try {
      const data = await this.storage.get(STORAGE_KEYS.TASKS);
      const tasks = (data[STORAGE_KEYS.TASKS] as Task[]) || [];

      // Convert date strings back to Date objects
      return tasks.map((task) => ({
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  }

  /**
   * Save all tasks to storage
   */
  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await this.storage.set({
        [STORAGE_KEYS.TASKS]: tasks,
      });
    } catch (error) {
      console.error("Error saving tasks:", error);
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
