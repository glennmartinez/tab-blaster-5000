export interface Disruption {
  id: string;
  title: string;
  category:
    | "meeting"
    | "email"
    | "slack"
    | "bug-fix"
    | "support"
    | "break"
    | "research"
    | "other";
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  description?: string;
  isManualEntry?: boolean; // true if user manually entered start/duration
  taskId?: string; // if it was interrupting a specific task
  date: string; // YYYY-MM-DD format for easy filtering
}

export interface DisruptionSummary {
  totalDisruptions: number;
  totalDisruptionTime: number; // in minutes
  averageDisruptionLength: number;
  mostCommonCategory: string;
  disruptionsByCategory: Record<string, number>;
  disruptionTimeByCategory: Record<string, number>;
}

export interface TimelineEntry {
  id: string;
  type: "task" | "disruption";
  title: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  category: string;
  taskId?: string;
  isActive?: boolean;
}
