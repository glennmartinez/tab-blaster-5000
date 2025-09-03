import { TaskRepository } from "./TaskRepository";
import { RepositoryResult } from "./BaseRepository";

// Import types from the TaskRepository file
type Task = {
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
};

type TaskCreateDto = {
  title: string;
  description?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  category?: string;
  size?: Task["size"];
  tags?: string[];
  dueDate?: Date;
};

type TaskFilters = {
  status?: Task["status"][];
  category?: string[];
  size?: Task["size"][];
  priority?: Task["priority"][];
  search?: string;
};

type TaskStats = {
  total: number;
  inbox: number;
  signal: number;
  noise: number;
  done: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
};

import { TaskRepository } from "./TaskRepository";
import { RepositoryResult } from "./BaseRepository";

// Import types from the TaskRepository file
type Task = {
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
};

type TaskCreateDto = {
  title: string;
  description?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  category?: string;
  size?: Task["size"];
  tags?: string[];
  dueDate?: Date;
};

type TaskFilters = {
  status?: Task["status"][];
  category?: string[];
  size?: Task["size"][];
  priority?: Task["priority"][];
  search?: string;
};

type TaskStats = {
  total: number;
  inbox: number;
  signal: number;
  noise: number;
  done: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
};

/**
 * Task Service using Repository Pattern
 *
 * This service wraps the repository and provides business logic.
 * It uses the existing TaskRepository which has better error handling
 * and Firebase integration than what I initially created.
 */
export class NewTasksService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  /**
   * Get all tasks - with error handling for UI
   */
  async getTasks(): Promise<Task[]> {
    const result = await this.taskRepository.findAll();

    if (!result.success) {
      console.error("Failed to load tasks:", result.error);
      // For UI consumption, we can return empty array and let UI handle errors
      return [];
    }

    return result.data || [];
  }

  /**
   * Create a new task - with business logic
   */
  async createTask(taskData: TaskCreateDto): Promise<Task> {
    // Additional business logic can go here
    this.logTaskOperation("create", taskData.title);

    const result = await this.taskRepository.create(taskData);

    if (!result.success) {
      throw new Error(`Failed to create task: ${result.error?.message}`);
    }

    if (!result.data) {
      throw new Error("Task creation succeeded but no data returned");
    }

    return result.data;
  }

  /**
   * Update a task - with validation and business logic
   */
  async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<Task | null> {
    this.logTaskOperation("update", taskId);

    const result = await this.taskRepository.update(taskId, updates);

    if (!result.success) {
      if (result.error?.type === "NOT_FOUND") {
        console.warn(`Task ${taskId} not found for update`);
        return null;
      }
      throw new Error(`Failed to update task: ${result.error?.message}`);
    }

    return result.data || null;
  }

  /**
   * Delete a task - with cleanup logic
   */
  async deleteTask(taskId: string): Promise<boolean> {
    this.logTaskOperation("delete", taskId);

    // Could add cleanup logic here (delete related focus sessions, etc.)

    const result = await this.taskRepository.delete(taskId);

    if (!result.success) {
      if (result.error?.type === "NOT_FOUND") {
        console.warn(`Task ${taskId} not found for deletion`);
        return false;
      }
      throw new Error(`Failed to delete task: ${result.error?.message}`);
    }

    return result.data || false;
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<Task | null> {
    const result = await this.taskRepository.findById(taskId);

    if (!result.success) {
      console.error("Failed to load task:", result.error);
      return null;
    }

    return result.data || null;
  }

  /**
   * Get tasks by status - using existing repository method
   */
  async getTasksByStatus(status: Task["status"]): Promise<Task[]> {
    const result = await this.taskRepository.findByStatus(status);

    if (!result.success) {
      console.error("Failed to load tasks by status:", result.error);
      return [];
    }

    return result.data || [];
  }

  /**
   * Get tasks by category - using existing repository method
   */
  async getTasksByCategory(category: string): Promise<Task[]> {
    const result = await this.taskRepository.findByCategory(category);

    if (!result.success) {
      console.error("Failed to load tasks by category:", result.error);
      return [];
    }

    return result.data || [];
  }

  /**
   * Calculate task statistics
   */
  async getTaskStats(): Promise<TaskStats> {
    const tasksResult = await this.taskRepository.findAll();

    if (!tasksResult.success || !tasksResult.data) {
      console.error("Failed to load tasks for stats:", tasksResult.error);
      // Return empty stats as fallback
      return {
        total: 0,
        inbox: 0,
        signal: 0,
        noise: 0,
        done: 0,
        overdue: 0,
        dueToday: 0,
        dueThisWeek: 0,
      };
    }

    const tasks = tasksResult.data;
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
    const results = await Promise.all(
      updates.map(({ id, updates: taskUpdates }) =>
        this.taskRepository.update(id, taskUpdates)
      )
    );

    // Filter successful updates
    return results
      .filter((result) => result.success && result.data)
      .map((result) => result.data!) as Task[];
  }

  /**
   * Business logic helper methods
   */

  /**
   * Check if storage needs to be refreshed (useful when storage type changes)
   */
  refreshStorage(): void {
    // Create a new repository instance to get fresh storage
    this.taskRepository = new TaskRepository();
  }

  /**
   * Get raw repository result for advanced error handling
   */
  async getTasksWithMetadata(): Promise<RepositoryResult<Task[]>> {
    return this.taskRepository.findAll();
  }

  /**
   * Private helper for logging
   */
  private logTaskOperation(operation: string, identifier: string): void {
    console.log(`🔨 TaskService.${operation} called for: ${identifier}`);
  }
}

// Export singleton instance for easy consumption
export const newTasksService = new NewTasksService();
