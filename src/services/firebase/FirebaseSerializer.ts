/**
 * Firebase Serialization Helper
 * Handles proper serialization/deserialization of data for Firebase Firestore
 */

import { Session } from "../../models/Session";
import { Task } from "../../views/Tasks/types/TaskInterface";

/**
 * Clean object by removing undefined values and converting dates
 */
export function cleanObjectForFirebase(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (obj instanceof Date) {
    // Convert Date to ISO string format like your example
    return obj.toISOString();
  }

  if (Array.isArray(obj)) {
    return obj
      .map((item) => cleanObjectForFirebase(item))
      .filter((item) => item !== undefined);
  }

  if (typeof obj === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanObjectForFirebase(value);
      }
    }
    return cleaned;
  }

  return obj;
}

/**
 * Parse dates from Firebase format back to Date objects
 */
export function parseDateFromFirebase(value: unknown): Date | undefined {
  if (!value) return undefined;

  // Handle Firebase Timestamp objects
  if (
    value &&
    typeof value === "object" &&
    "seconds" in value &&
    "nanoseconds" in value
  ) {
    const timestamp = value as { seconds: number; nanoseconds: number };
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }

  // Handle ISO string format
  if (typeof value === "string") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }

  // Handle Date objects
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? undefined : value;
  }

  return undefined;
}

/**
 * Serialized Task interface for Firebase
 */
interface SerializedTask {
  id: string;
  title: string;
  description: string | null;
  category: string;
  size: string;
  priority: string;
  status: string;
  dueDate: string | null;
  schedule: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  totalFocusTime: number | null;
  averageFocusTime: number | null;
  totalSessions: number | null;
}

/**
 * Serialize Task for Firebase storage
 */
export function serializeTaskForFirebase(task: Task): SerializedTask {
  const serialized: SerializedTask = {
    id: task.id,
    title: task.title,
    description: task.description || null,
    category: task.category,
    size: task.size,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    schedule: task.schedule || null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    tags: task.tags || [],
    totalFocusTime: task.totalFocusTime || null,
    averageFocusTime: task.averageFocusTime || null,
    totalSessions: task.totalSessions || null,
  };

  console.log("Serialized task for Firebase:", serialized);
  return serialized;
}

/**
 * Deserialize Task from Firebase storage
 */
export function deserializeTaskFromFirebase(
  data: Record<string, unknown>
): Task {
  const task: Task = {
    id: data.id as string,
    title: data.title as string,
    description: (data.description as string) || undefined,
    category: data.category as Task["category"],
    size: data.size as Task["size"],
    priority: data.priority as Task["priority"],
    status: data.status as Task["status"],
    dueDate: parseDateFromFirebase(data.dueDate),
    schedule: (data.schedule as Task["schedule"]) || undefined,
    createdAt: parseDateFromFirebase(data.createdAt) || new Date(),
    updatedAt: parseDateFromFirebase(data.updatedAt) || new Date(),
    tags: (data.tags as string[]) || [],
    totalFocusTime: (data.totalFocusTime as number) || undefined,
    averageFocusTime: (data.averageFocusTime as number) || undefined,
    totalSessions: (data.totalSessions as number) || undefined,
  };

  console.log("Deserialized task from Firebase:", task);
  return task;
}

/**
 * Serialized Session interface for Firebase
 */
interface SerializedSession {
  id: string;
  name: string;
  tabs: unknown[];
  createdAt: unknown;
  lastModified: unknown;
  description: string | null;
}

/**
 * Serialize Session for Firebase storage
 */
export function serializeSessionForFirebase(
  session: Session
): SerializedSession {
  const serialized: SerializedSession = {
    id: session.id,
    name: session.name,
    tabs: session.tabs || [],
    createdAt: session.createdAt,
    lastModified: session.lastModified,
    description: session.description || null,
  };

  console.log("Serialized session for Firebase:", serialized);
  return cleanObjectForFirebase(serialized) as SerializedSession;
}

/**
 * Deserialize Session from Firebase storage
 */
export function deserializeSessionFromFirebase(
  data: Record<string, unknown>
): Session {
  const session: Session = {
    id: data.id as string,
    name: data.name as string,
    tabs: (data.tabs as Session["tabs"]) || [],
    createdAt: data.createdAt as Session["createdAt"],
    lastModified: data.lastModified as Session["lastModified"],
    description: (data.description as string) || undefined,
  };

  console.log("Deserialized session from Firebase:", session);
  return session;
}
