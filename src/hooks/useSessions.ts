import { useState, useEffect, useCallback } from "react";
import { Session, SessionSummary } from "../models/Session";
import { SessionController } from "../controllers/SessionController";

/**
 * Hook to provide session-related data and operations
 */
export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionSummaries, setSessionSummaries] = useState<SessionSummary[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all sessions
   */
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSessions = await SessionController.getSessions();
      setSessions(fetchedSessions);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch sessions")
      );
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch session summaries (lightweight representation for lists)
   */
  const fetchSessionSummaries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const summaries = await SessionController.getSessionSummaries();
      console.log("Fetched session summaries:", summaries);
      setSessionSummaries(summaries);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch session summaries")
      );
      console.error("Error fetching session summaries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new session from current browser state
   */
  const createSession = useCallback(
    async (name: string, description?: string) => {
      try {
        const newSession = await SessionController.saveCurrentSession(
          name,
          description
        );
        setSessions((prev) => [...prev, newSession]);
        setSessionSummaries((prev) => [
          ...prev,
          {
            id: newSession.id,
            name: newSession.name,
            description: newSession.description,
            createdAt: newSession.createdAt,
            lastModified: newSession.lastModified,
            tabCount: newSession.tabs.length,
          },
        ]);
        return newSession;
      } catch (err) {
        console.error("Error creating session:", err);
        throw err;
      }
    },
    []
  );

  /**
   * Delete a session
   */
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      await SessionController.deleteSession(sessionId);
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
      setSessionSummaries((prev) =>
        prev.filter((summary) => summary.id !== sessionId)
      );
    } catch (err) {
      console.error("Error deleting session:", err);
      throw err;
    }
  }, []);

  /**
   * Restore a session
   */
  const restoreSession = useCallback(
    async (sessionId: string, replaceCurrentSession: boolean = false) => {
      try {
        await SessionController.restoreSession(
          sessionId,
          replaceCurrentSession
        );
        // Update the lastModified date in our local state
        setSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId
              ? { ...session, lastModified: new Date().toISOString() }
              : session
          )
        );
        setSessionSummaries((prev) =>
          prev.map((summary) =>
            summary.id === sessionId
              ? { ...summary, lastModified: new Date().toISOString() }
              : summary
          )
        );
      } catch (err) {
        console.error("Error restoring session:", err);
        throw err;
      }
    },
    []
  );

  /**
   * Update a session
   */
  const updateSession = useCallback(async (updatedSession: Session) => {
    try {
      await SessionController.updateSession(updatedSession);
      setSessions((prev) =>
        prev.map((session) =>
          session.id === updatedSession.id ? updatedSession : session
        )
      );
      // Also update the corresponding summary
      setSessionSummaries((prev) =>
        prev.map((summary) =>
          summary.id === updatedSession.id
            ? {
                ...summary,
                name: updatedSession.name,
                description: updatedSession.description,
                lastModified: updatedSession.lastModified,
                tabCount: updatedSession.tabs.length,
              }
            : summary
        )
      );
    } catch (err) {
      console.error("Error updating session:", err);
      throw err;
    }
  }, []);

  /**
   * Search sessions by query
   */
  const searchSessions = useCallback(async (query: string) => {
    try {
      return await SessionController.searchSessions(query);
    } catch (err) {
      console.error("Error searching sessions:", err);
      throw err;
    }
  }, []);

  // Load sessions and summaries on mount
  useEffect(() => {
    fetchSessionSummaries();
  }, [fetchSessionSummaries]);

  return {
    sessions,
    sessionSummaries,
    loading,
    error,
    fetchSessions,
    fetchSessionSummaries,
    createSession,
    deleteSession,
    restoreSession,
    updateSession,
    searchSessions,
  };
};
