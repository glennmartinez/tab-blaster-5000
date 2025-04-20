import { StorageService } from "./StorageService";
import { SessionInterface } from "./SessionInterface";
import { Session } from "../models/Session";
import { STORAGE_KEYS } from "../constants/storageKeys";

export class LocalStorageService implements StorageService, SessionInterface {
  // SessionInterface implementation
  
  /**
   * Fetch all sessions from localStorage
   */
  async fetchSessions(): Promise<Session[]> {
    try {
      const sessionsData = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (sessionsData) {
        return JSON.parse(sessionsData);
      }
      return [];
    } catch (error) {
      console.error("Error fetching sessions from localStorage:", error);
      return [];
    }
  }
  
  /**
   * Store a session in localStorage
   */
  async storeSession(session: Session): Promise<void> {
    try {
      const sessions = await this.fetchSessions();
      
      // Check if session already exists
      const index = sessions.findIndex(s => s.id === session.id);
      
      if (index >= 0) {
        // Update existing session
        sessions[index] = session;
      } else {
        // Add new session
        sessions.unshift(session);
      }
      
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error("Error storing session in localStorage:", error);
      throw error;
    }
  }
  
  /**
   * Delete a session from localStorage by ID
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.fetchSessions();
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error("Error deleting session from localStorage:", error);
      throw error;
    }
  }
  
  /**
   * Fetch a specific session by ID from localStorage
   */
  async fetchSessionById(sessionId: string): Promise<Session | null> {
    try {
      const sessions = await this.fetchSessions();
      const session = sessions.find(session => session.id === sessionId);
      return session || null;
    } catch (error) {
      console.error("Error fetching session by ID from localStorage:", error);
      return null;
    }
  }
}