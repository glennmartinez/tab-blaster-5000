import { SavedTab } from "../interfaces/TabInterface";
import { Session } from "../models/Session";

export interface SessionInterface {
  // Existing session methods
  fetchSessions(): Promise<Session[]>;
  storeSession(session: Session): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
  fetchSessionById(sessionId: string): Promise<Session | null>;

  // Additional methods from StorageService
  getSavedTabs(): Promise<SavedTab[]>;
  saveTabs(tabs: SavedTab[]): Promise<void>;
  getSettings<T>(defaultSettings: T): Promise<T>;
  saveSettings<T>(settings: T): Promise<void>;
  get(key: string): Promise<Record<string, unknown>>;
  set(data: Record<string, unknown>): Promise<void>;
}
