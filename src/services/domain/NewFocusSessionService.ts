import { FocusSession, TaskFocusData } from "../../interfaces/FocusSession";
import {
  FocusSessionRepository,
  FocusSessionCreateDto,
} from "../repositories/FocusSessionRepository";
import { NewTasksService } from "./NewTasksService";

export class NewFocusSessionService {
  private repository: FocusSessionRepository;
  private tasksService: NewTasksService;

  constructor() {
    this.repository = new FocusSessionRepository();
    this.tasksService = new NewTasksService();
  }

  /**
   * Start a new focus session for a task
   */
  async startFocusSession(taskId: string): Promise<FocusSession> {
    console.log("📊 Starting focus session for task:", taskId);

    // End any currently active session first
    console.log("📊 Ending any existing session first");
    await this.endCurrentActiveSession();

    const now = new Date();
    const sessionDto: FocusSessionCreateDto = {
      taskId,
      startTime: now,
      totalMinutes: 0,
    };

    console.log("📊 Creating new session:", sessionDto);

    // Create the session using repository
    const result = await this.repository.create(sessionDto);
    if (!result.success || !result.data) {
      throw new Error(
        result.error?.message || "Failed to create focus session"
      );
    }

    const session = result.data;

    // Save as current session
    await this.repository.setCurrentSession(session);

    console.log("📊 Focus session started successfully");
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
    const totalMinutes = Math.round(
      (now.getTime() - startTime.getTime()) / (1000 * 60)
    );

    // Complete the session
    const completedSession: FocusSession = {
      ...currentSession,
      endTime: now,
      totalMinutes,
    };

    // Add to sessions history
    await this.addSessionToHistory(completedSession);

    // Clear current session
    await this.repository.clearCurrentSession();

    return completedSession;
  }

  /**
   * Get current active session
   */
  async getCurrentSession(): Promise<FocusSession | null> {
    console.log("📊 Getting current session...");
    try {
      const session = await this.repository.getCurrentSession();
      console.log("📊 Current session retrieved:", session);
      return session;
    } catch (error) {
      console.error("Error getting current session:", error);
      return null;
    }
  }

  /**
   * Add completed session to task's focus sessions
   * Returns the updated task data for React state updates
   */
  private async addSessionToHistory(session: FocusSession): Promise<void> {
    console.log("📝 Adding session to task history:", session);
    try {
      // Add session to repository
      const result = await this.repository.addSessionToTask(session);
      if (!result.success) {
        throw new Error(
          result.error?.message || "Failed to add session to task"
        );
      }

      // Get the task focus data for stats
      const taskFocusData = await this.repository.getTaskFocusData(
        session.taskId
      );

      // Update task statistics via TasksService
      const updatedTask = await this.tasksService.updateTask(session.taskId, {
        totalSessions: taskFocusData.totalSessions,
        totalFocusTime: taskFocusData.totalFocusTime,
        averageFocusTime: taskFocusData.averageFocusTime,
        focusSessions: taskFocusData.sessions, // Update the task's focus sessions array
      });

      if (!updatedTask) {
        console.error("❌ Task not found for session:", session.taskId);
        return;
      }

      console.log(
        "✅ Session added to task history. Task total sessions:",
        taskFocusData.totalSessions
      );
    } catch (error) {
      console.error("❌ Error saving focus session to task:", error);
      throw error;
    }
  }

  /**
   * Get all focus sessions from all tasks
   */
  async getAllSessions(): Promise<FocusSession[]> {
    console.log("📊 Getting all sessions from repository...");
    try {
      const result = await this.repository.findAll();
      if (result.success && result.data) {
        console.log("📊 All sessions retrieved:", result.data.length);
        return result.data;
      } else {
        console.error("Failed to get all sessions:", result.error);
        return [];
      }
    } catch (error) {
      console.error("Error getting all sessions:", error);
      return [];
    }
  }

  /**
   * Get sessions for a specific task
   */
  async getSessionsForTask(taskId: string): Promise<FocusSession[]> {
    try {
      const result = await this.repository.findByTaskId(taskId);
      if (result.success && result.data) {
        return result.data;
      } else {
        console.error("Failed to get sessions for task:", result.error);
        return [];
      }
    } catch (error) {
      console.error("Error getting sessions for task:", error);
      return [];
    }
  }

  /**
   * Get focus data for a specific task
   */
  async getTaskFocusData(taskId: string): Promise<TaskFocusData> {
    try {
      return await this.repository.getTaskFocusData(taskId);
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

// Export singleton instance
export const newFocusSessionService = new NewFocusSessionService();
