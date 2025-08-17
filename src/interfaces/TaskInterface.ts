export interface Task {
  id: string;
  title: string;
  description?: string;
  category: "development" | "design" | "research" | "meeting" | "other";
  size: "S" | "M" | "L" | "XL";
  priority: "low" | "medium" | "high";
  status: "inbox" | "signal" | "noise" | "done";
  dueDate?: Date;
  schedule?: "morning" | "midday" | "evening";
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface TaskFilters {
  status?: Task["status"][];
  category?: Task["category"][];
  size?: Task["size"][];
  priority?: Task["priority"][];
  search?: string;
}

export interface TaskStats {
  total: number;
  inbox: number;
  signal: number;
  noise: number;
  done: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
}
