export interface FocusSession {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date; // undefined if session is still active
  totalMinutes: number; // calculated when session ends
}

export interface TaskFocusData {
  taskId: string;
  totalFocusTime: number; // total minutes across all sessions
  averageFocusTime: number; // average session length in minutes
  totalSessions: number; // count of completed sessions
  sessions: FocusSession[]; // array of all focus sessions for this task
}
