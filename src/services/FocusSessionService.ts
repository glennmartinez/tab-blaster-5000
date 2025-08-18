import { FocusSession, TaskFocusData } from "../interfaces/FocusSession";
import { StorageFactory } from "./StorageFactory";
import { STORAGE_KEYS } from "../constants/storageKeys";

export class FocusSessionService {
  private storage = StorageFactory.getStorageService();

  /**
   * Start a new focus session for a task
   */
  async startFocusSession(taskId: string): Promise<FocusSession> {
    console.log('📊 Starting focus session for task:', taskId); // Debug log
    const now = new Date();
    
    // End any currently active session first
    console.log('📊 Ending any existing session first'); // Debug log
    await this.endCurrentActiveSession();
    
    const session: FocusSession = {
      id: `focus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      startTime: now,
      totalMinutes: 0
    };

    console.log('📊 Saving new session:', session); // Debug log
    // Save as current session
    await this.setCurrentSession(session);
    
    console.log('📊 Focus session started successfully'); // Debug log
    return session;
  }

  /**
   * End the current active session
   */
  async endCurrentActiveSession(): Promise<FocusSession | null> {
    const currentSession = await this.getCurrentSession();
    if (!currentSession) {
      return null;
    }

    const now = new Date();
    const startTime = new Date(currentSession.startTime);
    const totalMinutes = Math.round((now.getTime() - startTime.getTime()) / (1000 * 60));

    // Complete the session
    const completedSession: FocusSession = {
      ...currentSession,
      endTime: now,
      totalMinutes
    };

    // Add to sessions history
    await this.addSessionToHistory(completedSession);
    
    // Update task focus data
    await this.updateTaskFocusData(completedSession);
    
    // Clear current session
    await this.clearCurrentSession();
    
    return completedSession;
  }

  /**
   * Get current active session
   */
  async getCurrentSession(): Promise<FocusSession | null> {
    console.log('📊 Getting current session...'); // Debug log
    try {
      const data = await this.storage.get(STORAGE_KEYS.CURRENT_FOCUS_SESSION);
      const session = data[STORAGE_KEYS.CURRENT_FOCUS_SESSION] as FocusSession;
      console.log('📊 Current session retrieved:', session); // Debug log
      
      if (!session) return null;
      
      // Convert date string back to Date object
      return {
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      };
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  /**
   * Set current active session
   */
  private async setCurrentSession(session: FocusSession): Promise<void> {
    console.log('📊 Setting current session in storage:', session); // Debug log
    await this.storage.set({
      [STORAGE_KEYS.CURRENT_FOCUS_SESSION]: session
    });
    console.log('📊 Session saved to storage successfully'); // Debug log
  }

  /**
   * Clear current active session
   */
  private async clearCurrentSession(): Promise<void> {
    await this.storage.remove([STORAGE_KEYS.CURRENT_FOCUS_SESSION]);
  }

  /**
   * Add completed session to task's focus sessions
   */
  private async addSessionToHistory(session: FocusSession): Promise<void> {
    console.log('📝 Adding session to task history:', session); // Debug log
    try {
      // Get the TasksService dynamically to avoid circular dependency
      const { TasksService } = await import('./TasksService');
      const tasksService = new TasksService();
      
      // Get all tasks and find the one we need
      const tasks = await tasksService.getTasks();
      const task = tasks.find(t => t.id === session.taskId);
      if (!task) {
        console.error('❌ Task not found for session:', session.taskId);
        return;
      }

      // Add session to task's focusSessions array
      if (!task.focusSessions) {
        task.focusSessions = [];
      }
      task.focusSessions.push(session);

      // Update task statistics
      task.totalSessions = (task.totalSessions || 0) + 1;
      task.totalFocusTime = (task.totalFocusTime || 0) + session.totalMinutes;
      task.averageFocusTime = task.totalFocusTime / task.totalSessions;

      // Save the updated task
      await tasksService.updateTask(task.id, {
        focusSessions: task.focusSessions,
        totalSessions: task.totalSessions,
        totalFocusTime: task.totalFocusTime,
        averageFocusTime: task.averageFocusTime
      });
      console.log('✅ Session added to task history. Task total sessions:', task.totalSessions); // Debug log
    } catch (error) {
      console.error("❌ Error saving focus session to task:", error);
      throw error;
    }
  }

  /**
   * Get all focus sessions from all tasks
   */
  async getAllSessions(): Promise<FocusSession[]> {
    console.log('📊 Getting all sessions from tasks...'); // Debug log
    try {
      // Get the TasksService dynamically to avoid circular dependency
      const { TasksService } = await import('./TasksService');
      const tasksService = new TasksService();
      
      const tasks = await tasksService.getTasks();
      const allSessions: FocusSession[] = [];
      
      // Collect all sessions from all tasks
      tasks.forEach(task => {
        if (task.focusSessions && task.focusSessions.length > 0) {
          allSessions.push(...task.focusSessions);
        }
      });
      
      console.log('📊 All sessions retrieved from tasks:', allSessions.length); // Debug log
      
      // Convert date strings back to Date objects
      return allSessions.map(session => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      }));
    } catch (error) {
      console.error('Error getting all sessions from tasks:', error);
      return [];
    }
  }

  /**
   * Get sessions for a specific task
   */
  async getSessionsForTask(taskId: string): Promise<FocusSession[]> {
    const sessions = await this.getAllSessions();
    return sessions.filter(session => session.taskId === taskId);
  }

  /**
   * Update task focus statistics after a session
   */
  private async updateTaskFocusData(session: FocusSession): Promise<void> {
    try {
      // Get task focus data
      const taskFocusData = await this.getTaskFocusData(session.taskId);
      
      // Add this session
      taskFocusData.sessions.push(session);
      taskFocusData.totalSessions = taskFocusData.sessions.length;
      taskFocusData.totalFocusTime = taskFocusData.sessions.reduce((sum, s) => sum + s.totalMinutes, 0);
      taskFocusData.averageFocusTime = Math.round(taskFocusData.totalFocusTime / taskFocusData.totalSessions);

      // Save updated data
      await this.saveTaskFocusData(taskFocusData);

      // Also update the task itself via TasksService
      const { TasksService } = await import('./TasksService');
      const tasksService = new TasksService();
      await tasksService.updateTask(session.taskId, {
        totalFocusTime: taskFocusData.totalFocusTime,
        averageFocusTime: taskFocusData.averageFocusTime,
        totalSessions: taskFocusData.totalSessions
      });
    } catch (error) {
      console.error("Error updating task focus data:", error);
    }
  }

  /**
   * Get focus data for a specific task
   */
  async getTaskFocusData(taskId: string): Promise<TaskFocusData> {
    try {
      const data = await this.storage.get(STORAGE_KEYS.TASK_FOCUS_DATA);
      const allTaskData = (data[STORAGE_KEYS.TASK_FOCUS_DATA] as { [taskId: string]: TaskFocusData }) || {};
      
      if (allTaskData[taskId]) {
        // Convert date strings back to Date objects
        const taskData = allTaskData[taskId];
        taskData.sessions = taskData.sessions.map(session => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        }));
        return taskData;
      }

      // Return default data if none exists
      return {
        taskId,
        totalFocusTime: 0,
        averageFocusTime: 0,
        totalSessions: 0,
        sessions: []
      };
    } catch (error) {
      console.error("Error fetching task focus data:", error);
      return {
        taskId,
        totalFocusTime: 0,
        averageFocusTime: 0,
        totalSessions: 0,
        sessions: []
      };
    }
  }

  /**
   * Save task focus data
   */
  private async saveTaskFocusData(taskData: TaskFocusData): Promise<void> {
    try {
      const data = await this.storage.get(STORAGE_KEYS.TASK_FOCUS_DATA);
      const allTaskData = (data[STORAGE_KEYS.TASK_FOCUS_DATA] as { [taskId: string]: TaskFocusData }) || {};
      
      allTaskData[taskData.taskId] = taskData;

      await this.storage.set({
        [STORAGE_KEYS.TASK_FOCUS_DATA]: allTaskData
      });
    } catch (error) {
      console.error("Error saving task focus data:", error);
      throw error;
    }
  }

  /**
   * Get current session duration in minutes
   */
  getCurrentSessionDuration(): number {
    return 0; // Will be calculated in the hook
  }

  /**
   * Format time helper
   */
  formatTime(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  }
}
