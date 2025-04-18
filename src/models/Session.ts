import { Tab } from "../interfaces/TabInterface";

/**
 * Session model representing a saved browser state
 */
export interface Session {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastModified: string;
  tabs: Tab[];
}

/**
 * Light-weight session summary for lists
 */
export interface SessionSummary {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  lastModified: string;
  tabCount: number;
}

export interface SessionFilter {
  searchQuery?: string;
  sortBy?: "name" | "createdAt" | "lastModified" | "tabCount";
  sortDirection?: "asc" | "desc";
}
