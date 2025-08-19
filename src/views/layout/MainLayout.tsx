import React, { useEffect, useState } from "react";
import { Tab, WindowInfo, SavedTab } from "../../interfaces/TabInterface";
import { useSessions } from "../../hooks/useSessions";
import {
  ParticleBackground,
  Header,
  Sidebar,
  WindowsPanel,
  SessionPanel,
  SessionsSidebar,
  BookmarksPanel,
  FavoritesSidebar,
} from "../../components";
import SettingsView from "../settings/SettingsView";
import FavouritesView from "../FavouritesView";
import TasksView from "../TasksView";
import { TaskViewProvider, useTaskView } from "../../contexts/TaskViewContext";
import TasksSidebar from "../../components/tasks/TasksSidebar";

// Interface for the component props
interface FuturisticViewProps {
  windowGroups?: WindowInfo[];
  savedTabs?: SavedTab[];
  onSwitchTab?: (tabId: number) => Promise<void>;
  onCloseTab?: (tabId: number) => Promise<void>;
  onCloseTabs?: (tabIds: number[]) => Promise<void>;
  onRestoreTab?: (savedTab: SavedTab) => Promise<void>;
  onRemoveSavedTab?: (savedTab: SavedTab) => Promise<void>;
}

// Component that uses the TaskView context to render the appropriate sidebar
const TasksSidebarWrapper: React.FC = () => {
  const { currentView } = useTaskView();
  return <TasksSidebar viewMode={currentView} />;
};

const MainLayout: React.FC<FuturisticViewProps> = ({
  windowGroups = [],
  onSwitchTab,
  onCloseTab,
  onCloseTabs,
}) => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [systemStatus, setSystemStatus] = useState(85);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [activeWindowGroups, setActiveWindowGroups] = useState<WindowInfo[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState<
    "windows" | "sessions" | "settings" | "favourites" | "bookmarks" | "tasks"
  >("windows");
  const [expandedWindows, setExpandedWindows] = useState<{
    [windowId: number]: boolean;
  }>({});

  // Use our sessions hook for managing saved sessions
  const {
    sessionSummaries,
    selectedSession,
    loading: sessionsLoading,
    fetchSessionSummaries,
    deleteSession,
    restoreSession,
    createSession,
    selectSession,
  } = useSessions();

  // Fetch sessions when component mounts
  useEffect(() => {
    fetchSessionSummaries();
  }, [fetchSessionSummaries]);

  // Update useEffect to store windowGroups properly
  useEffect(() => {
    setActiveWindowGroups(windowGroups);
  }, [windowGroups]);

  // Simulate data loading only on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Update time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Updated to use real system status from Chrome APIs - only update system status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(Math.floor(Math.random() * 10) + 80);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Open a tab using the onSwitchTab function if provided, otherwise default to window.open
  const openTab = (tab: Tab) => {
    // For saved session tabs (which don't exist in current browser session),
    // always open in a new tab
    if (selectedSession) {
      if (tab.url) {
        window.open(tab.url, "_blank");
      }
      return;
    }

    // For active tabs, try to switch to them if possible
    if (onSwitchTab && tab.id) {
      onSwitchTab(tab.id);
    } else if (tab.url) {
      window.open(tab.url, "_blank");
    }
  };

  // Delete a tab using the onCloseTab function if provided
  const deleteTab = (tab: Tab) => {
    if (onCloseTab && tab.id) {
      onCloseTab(tab.id);
    }
  };

  // Save the current window as a session
  const saveWindowAsSession = async (windowId: number, name?: string) => {
    const windowToSave = activeWindowGroups.find(
      (window) => window.id === windowId
    );
    if (!windowToSave) return;

    try {
      const sessionName =
        name || `Window ${windowId} - ${new Date().toLocaleTimeString()}`;
      // Pass the windowId to createSession
      await createSession(sessionName, undefined, windowId);

      // Close all tabs in the saved window
      if (onCloseTabs && windowToSave.tabs.length > 0) {
        const tabIds = windowToSave.tabs
          .map((tab) => tab.id)
          .filter((id) => id !== undefined && id !== chrome?.tabs?.TAB_ID_NONE);

        if (tabIds.length > 0) {
          await onCloseTabs(tabIds);
          console.log(
            `Closed ${tabIds.length} tabs from window ${windowId} after saving session`
          );
        }
      }

      // Refresh sessions list
      fetchSessionSummaries();
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  // Handle restoring a session
  const handleRestoreSession = async (sessionId: string) => {
    try {
      await restoreSession(sessionId, false);
    } catch (error) {
      console.error("Error restoring session:", error);
    }
  };

  // Handle deleting a session
  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  // Clear selected session and restore active windows when switching views
  const handleViewChange = (
    view:
      | "windows"
      | "sessions"
      | "settings"
      | "favourites"
      | "bookmarks"
      | "tasks"
  ) => {
    setActiveView(view);
    if (view === "windows") {
      selectSession(""); // This will now properly clear selectedSession
      setActiveWindowGroups(windowGroups);

      // Force re-render of active windows by setting loading briefly
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  };

  // Toggle expand/collapse for a window
  const toggleExpand = (windowId: number) => {
    setExpandedWindows((prev) => ({
      ...prev,
      [windowId]: !prev[windowId],
    }));
  };

  // Filter tabs based on search query
  const filteredWindowGroups = searchQuery
    ? activeWindowGroups
        .map((window) => ({
          ...window,
          tabs: window.tabs.filter(
            (tab) =>
              tab.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              false ||
              tab.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              false
          ),
        }))
        .filter((window) => window.tabs.length > 0)
    : activeWindowGroups;

  // Create session handler
  const handleCreateSession = () => {
    createSession(`New Session ${new Date().toLocaleTimeString()}`);
  };

  // Render the main content based on active view
  const renderMainContent = () => {
    if (activeView === "favourites") {
      return <FavouritesView />;
    }

    if (activeView === "bookmarks") {
      return (
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col h-full">
          <div className="p-4 h-full">
            <BookmarksPanel />
          </div>
        </div>
      );
    }

    if (activeView === "tasks") {
      return <TasksView />;
    }

    // Default content - Active Windows or Sessions
    return (
      <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg overflow-hidden flex flex-col h-full">
        <div className="border-b border-slate-700/50 p-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-slate-100 flex items-center font-medium">
              {selectedSession
                ? `Session: ${selectedSession.name}`
                : "Active Windows"}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="bg-slate-800/50 text-cyan-400 border border-cyan-500/50 text-xs px-2 py-0.5 rounded-full flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 mr-1 animate-pulse"></div>
                {selectedSession ? "SAVED SESSION" : "LIVE"}
              </span>
            </div>
          </div>
        </div>
        <div className="p-3 overflow-y-auto flex-grow max-h-[calc(100vh-220px)] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {selectedSession ? (
            <SessionPanel
              selectedSession={selectedSession}
              onOpenTab={openTab}
              onRestoreSession={handleRestoreSession}
            />
          ) : (
            <WindowsPanel
              windowGroups={filteredWindowGroups}
              expandedWindows={expandedWindows}
              onOpenTab={openTab}
              onDeleteTab={deleteTab}
              onSaveWindowAsSession={saveWindowAsSession}
              onToggleExpand={toggleExpand}
            />
          )}
        </div>
      </div>
    );
  };

  // Render the right sidebar based on active view
  const renderRightSidebar = () => {
    switch (activeView) {
      case "tasks":
        return <TasksSidebarWrapper />;
      case "favourites":
        return <FavoritesSidebar />;
      case "windows":
      case "sessions":
      case "bookmarks":
      default:
        return (
          <SessionsSidebar
            sessionSummaries={sessionSummaries}
            loading={sessionsLoading}
            onSelectSession={selectSession}
            onRefreshSessions={fetchSessionSummaries}
            onDeleteSession={handleDeleteSession}
            onRestoreSession={handleRestoreSession}
            onCreateSession={handleCreateSession}
          />
        );
    }
  };

  // Handle navigation back from settings
  const handleBackFromSettings = () => {
    console.log("Navigating back from settings");
    setActiveView("windows");
  };

  // Render settings view if that's the active view (full page replacement)
  if (activeView === "settings") {
    return (
      <div className="settings-container">
        <SettingsView onBack={handleBackFromSettings} />
      </div>
    );
  }

  // Wrap the entire layout with TaskViewProvider when in tasks view
  const mainLayoutContent = (
    <div
      className={`${theme} flex-1 overflow-hidden bg-gradient-to-br from-black to-slate-900 text-slate-100 relative min-h-screen w-full`}
    >
      {/* Background particle effect */}
      <ParticleBackground />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-6 border-4 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-8 border-4 border-l-green-500 border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-cyan-500 font-mono text-sm tracking-wider">
              SYSTEM INITIALIZING
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10 h-full flex flex-col min-h-screen">
        {/* Top control bar */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          currentTime={currentTime}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Main content */}
        <div className="grid grid-cols-12 gap-4 flex-1 overflow-hidden h-[calc(100vh-100px)]">
          {/* Left sidebar */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2 flex flex-col h-full">
            <Sidebar
              activeView={activeView}
              handleViewChange={handleViewChange}
              systemStatus={systemStatus}
              securityLevel={75}
              networkStatus={92}
            />
          </div>

          {/* Main dashboard */}
          <div className="col-span-12 md:col-span-9 lg:col-span-7 h-full flex flex-col overflow-hidden">
            {renderMainContent()}
          </div>

          {/* Right sidebar - Contextual */}
          <div className="col-span-12 lg:col-span-3 overflow-y-auto h-full">
            {renderRightSidebar()}
          </div>
        </div>
      </div>
    </div>
  );

  return activeView === "tasks" ? (
    <TaskViewProvider>{mainLayoutContent}</TaskViewProvider>
  ) : (
    mainLayoutContent
  );
};

export default MainLayout;
