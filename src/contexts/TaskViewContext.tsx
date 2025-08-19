import React, { createContext, useContext, useState } from 'react';

export type TaskViewMode = 'triage' | 'weekly' | 'focus';

interface TaskViewContextType {
  currentView: TaskViewMode;
  setCurrentView: (view: TaskViewMode) => void;
}

const TaskViewContext = createContext<TaskViewContextType | undefined>(undefined);

export const TaskViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<TaskViewMode>('triage');

  return (
    <TaskViewContext.Provider value={{ currentView, setCurrentView }}>
      {children}
    </TaskViewContext.Provider>
  );
};

export const useTaskView = (): TaskViewContextType => {
  const context = useContext(TaskViewContext);
  if (context === undefined) {
    throw new Error('useTaskView must be used within a TaskViewProvider');
  }
  return context;
};
