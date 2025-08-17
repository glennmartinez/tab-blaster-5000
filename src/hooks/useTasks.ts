import { useState, useEffect } from "react";
import { Task, TaskFilters, TaskStats } from "../interfaces/TaskInterface";
import { tasksService } from "../services/TasksService";

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedTasks = await tasksService.getTasks();
      setTasks(loadedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setError(null);
      const newTask = await tasksService.createTask(taskData);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      setError(null);
      const updatedTask = await tasksService.updateTask(taskId, updates);
      if (updatedTask) {
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? updatedTask : task))
        );
      }
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setError(null);
      const success = await tasksService.deleteTask(taskId);
      if (success) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      throw err;
    }
  };

  const moveTaskToStatus = async (
    taskId: string,
    newStatus: Task["status"]
  ) => {
    try {
      setError(null);
      const updatedTask = await tasksService.moveTaskToStatus(
        taskId,
        newStatus
      );
      if (updatedTask) {
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? updatedTask : task))
        );
      }
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move task");
      throw err;
    }
  };

  const getFilteredTasks = async (filters: TaskFilters) => {
    try {
      setError(null);
      return await tasksService.getFilteredTasks(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter tasks");
      return [];
    }
  };

  const getTaskStats = async (): Promise<TaskStats> => {
    try {
      setError(null);
      return await tasksService.getTaskStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get task stats");
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
  };

  // Helper functions for common operations
  const getTasksByStatus = (status: Task["status"]) => {
    return tasks.filter((task) => task.status === status);
  };

  const getOverdueTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter(
      (task) =>
        task.dueDate && new Date(task.dueDate) < today && task.status !== "done"
    );
  };

  const getTasksDueToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) >= today &&
        new Date(task.dueDate) < tomorrow &&
        task.status !== "done"
    );
  };

  return {
    tasks,
    loading,
    error,
    // CRUD operations
    createTask,
    updateTask,
    deleteTask,
    moveTaskToStatus,
    // Utility functions
    loadTasks,
    getFilteredTasks,
    getTaskStats,
    getTasksByStatus,
    getOverdueTasks,
    getTasksDueToday,
    // Stats
    stats: {
      total: tasks.length,
      inbox: getTasksByStatus("inbox").length,
      signal: getTasksByStatus("signal").length,
      noise: getTasksByStatus("noise").length,
      done: getTasksByStatus("done").length,
      overdue: getOverdueTasks().length,
      dueToday: getTasksDueToday().length,
    },
  };
};
