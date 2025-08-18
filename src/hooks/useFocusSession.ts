import { useState, useEffect, useCallback, useMemo } from 'react';
import { FocusSession } from '../interfaces/FocusSession';
import { FocusSessionService } from '../services/FocusSessionService';
import { Task } from '../interfaces/TaskInterface';

export const useFocusSession = () => {
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDuration, setCurrentDuration] = useState(0);

  const focusService = useMemo(() => new FocusSessionService(), []);

  // Real-time timer update
  useEffect(() => {
    if (!currentSession) {
      setCurrentDuration(0);
      return;
    }

    const updateDuration = () => {
      const now = new Date();
      const startTime = new Date(currentSession.startTime);
      const totalSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setCurrentDuration(Math.max(0, totalSeconds));
    };

    // Update immediately
    updateDuration();

    // Update every second
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [currentSession]);

  const loadCurrentSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = await focusService.getCurrentSession();
      console.log('Loaded current session:', session); // Debug log
      setCurrentSession(session);
      setError(null);
    } catch (err) {
      console.error('Error loading current session:', err);
      setError('Failed to load current session');
    } finally {
      setIsLoading(false);
    }
  }, [focusService]);

  // Load current session on mount
  useEffect(() => {
    loadCurrentSession();
  }, [loadCurrentSession]);

  const startFocusSession = useCallback(async (task: Task) => {
    try {
      setError(null);
      console.log('Starting focus session for task:', task.title); // Debug log
      const session = await focusService.startFocusSession(task.id);
      console.log('Focus session started:', session); // Debug log
      setCurrentSession(session);
      return session;
    } catch (err) {
      console.error('Error starting focus session:', err);
      setError('Failed to start focus session');
      throw err;
    }
  }, [focusService]);

  const endSession = useCallback(async () => {
    try {
      setError(null);
      console.log('Ending current session'); // Debug log
      const session = await focusService.endCurrentActiveSession();
      console.log('Session ended:', session); // Debug log
      setCurrentSession(null);
      return session;
    } catch (err) {
      console.error('Error ending session:', err);
      setError('Failed to end session');
      throw err;
    }
  }, [focusService]);

  const getSessionsForTask = useCallback(async (taskId: string): Promise<FocusSession[]> => {
    try {
      const sessions = await focusService.getSessionsForTask(taskId);
      return sessions;
    } catch (err) {
      console.error('Error getting sessions for task:', err);
      setError('Failed to get task sessions');
      return [];
    }
  }, [focusService]);

  // Utility function to calculate current session duration in seconds
  const getCurrentSessionDuration = useCallback((): number => {
    if (!currentSession || !currentSession.startTime) return 0;

    const now = new Date();
    const startTime = new Date(currentSession.startTime);
    const totalSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    
    return Math.max(0, totalSeconds);
  }, [currentSession]);



  // Format time helper - now takes seconds as input
  const formatTime = useCallback((totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    } else if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }, []);

  return {
    // State
    currentSession,
    currentDuration,
    isLoading,
    error,
    
    // Actions
    startFocusSession,
    endSession,
    
    // Queries
    getSessionsForTask,
    
    // Utilities
    getCurrentSessionDuration,
    formatTime,
    
    // Refresh
    loadCurrentSession
  };
};
