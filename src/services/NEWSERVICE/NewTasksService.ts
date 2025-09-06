import { TaskRepository, TaskCreateDto } from "../repositories/TaskRepository";
import {
  Task,
  TaskFilters,
  TaskStats,
} from "../../views/Tasks/types/TaskInterface";

export class NewTasksService {
  private repository: TaskRepository;

  constructor() {
    this.repository = new TaskRepository();
  }

  /**
   * Get all tasks
   */
  async getTasks(): Promise<Task[]> {
    try {
      const result = await this.repository.findAll();
      if (result.success && result.data) {
        console.log(
          `📋 Retrieved ${result.data.length} tasks using ${result.metadata.provider}`
        );
        return result.data;
      } else {
        console.error("Failed to get tasks:", result.error);
        return [];
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }
  }

  /**
   * Create a new task
   */
  async createTask(taskData: TaskCreateDto): Promise<Task> {
    try {
      const result = await this.repository.create(taskData);
      if (result.success && result.data) {
        console.log(
          `✅ Created task: ${result.data.title} (${result.data.id})`
        );
        return result.data;
      } else {
        throw new Error(result.error?.message || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(
    taskId: string,
    updates: Partial<Task>
  ): Promise<Task | null> {
    try {
      // Add updatedAt timestamp
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date(),
      };

      const result = await this.repository.update(taskId, updatesWithTimestamp);
      if (result.success) {
        if (result.data) {
          console.log(`📝 Updated task: ${taskId}`);
        } else {
          console.warn(`⚠️ Task not found for update: ${taskId}`);
        }
        return result.data || null;
      } else {
        throw new Error(result.error?.message || "Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const result = await this.repository.delete(taskId);
      if (result.success && result.data !== undefined) {
        if (result.data) {
          console.log(`🗑️ Deleted task: ${taskId}`);
        } else {
          console.warn(`⚠️ Task not found for deletion: ${taskId}`);
        }
        return result.data;
      } else {
        throw new Error(result.error?.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  /**
   * Get tasks filtered by criteria
   */
  async getFilteredTasks(filters: TaskFilters): Promise<Task[]> {
    try {
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
    } catch (error) {
      console.error("Error filtering tasks:", error);
      return [];
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStats(): Promise<TaskStats> {
    try {
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
    } catch (error) {
      console.error("Error calculating task stats:", error);
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
    try {
      const tasks = await this.getTasks();
      const updatedTasks = [...tasks];

      // Apply updates
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

      // Save all updated tasks
      const saveResult = await this.repository.findAll();
      if (saveResult.success && saveResult.data) {
        // Use the repository's saveAll method through the protected interface
        // For now, we'll update each task individually
        const promises = updates.map(({ id, updates: taskUpdates }) =>
          this.updateTask(id, taskUpdates)
        );

        await Promise.all(promises);

        // Return the updated tasks
        return await this.getTasks();
      }

      throw new Error("Failed to bulk update tasks");
    } catch (error) {
      console.error("Error bulk updating tasks:", error);
      throw error;
    }
  }

  /**
   * Find task by ID
   */
  async findTaskById(taskId: string): Promise<Task | null> {
    try {
      const result = await this.repository.findById(taskId);
      if (result.success) {
        return result.data || null;
      } else {
        console.error("Failed to find task by ID:", result.error);
        return null;
      }
    } catch (error) {
      console.error("Error finding task by ID:", error);
      return null;
    }
  }
}

// Export singleton instance
export const newTasksService = new NewTasksService();
