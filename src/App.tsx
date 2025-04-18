import { useState, useEffect } from "react";
import "./App.css";
import { ViewType } from "./interfaces/ViewTypes";
import DashboardView from "./views/dashboard/DashboardView";
import FuturisticView from "./components/FuturisticView";
import SessionsView from "./components/SessionsView";
import { useTabs } from "./hooks/useTabs";

/**
 * Main App component that serves as the router for different views
 * This component is responsible fo routing between different views
 * - Managing global application state
 */
function App() {
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [useFuturisticUI, setUseFuturisticUI] = useState(() => {
    // Check localStorage for user preference, default to true to show futuristic UI
    const saved = localStorage.getItem("useFuturisticUI");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const {
    windows: windowGroups,
    savedTabs,
    switchToTab,
    closeTab,
    restoreTab,
    removeSavedTab,
  } = useTabs();

  // Save UI preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("useFuturisticUI", JSON.stringify(useFuturisticUI));
  }, [useFuturisticUI]);

  // Check URL parameters for view selection
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");

    if (viewParam === "fullpage") {
      // Determine which subview to show
      const subView = params.get("subview") as ViewType | null;
      if (subView && ["dashboard", "active", "sessions"].includes(subView)) {
        setActiveView(subView as ViewType);
      }
    }
  }, []);

  // Toggle between futuristic and standard UI
  const toggleUI = () => {
    setUseFuturisticUI((prev: boolean) => !prev);
  };

  // Route to the appropriate view component based on activeView
  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return useFuturisticUI ? (
          <div className="relative">
            <button
              onClick={toggleUI}
              className="absolute top-4 right-4 z-50 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs"
            >
              Switch to Standard UI
            </button>
            <FuturisticView
              windowGroups={windowGroups}
              savedTabs={savedTabs}
              onSwitchTab={switchToTab}
              onCloseTab={closeTab}
              onRestoreTab={restoreTab}
              onRemoveSavedTab={removeSavedTab}
            />
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={toggleUI}
              className="absolute top-4 right-4 z-50 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs"
            >
              Switch to Futuristic UI
            </button>
            <DashboardView />
          </div>
        );
      case "active":
        // Will be replaced with TabsView in future iterations
        return (
          <div className="flex justify-center items-center h-screen bg-slate-950 text-white">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Active Tabs View</h2>
              <p>This view is coming soon in the next phase of development.</p>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                onClick={() => setActiveView("dashboard")}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );
      case "sessions":
        return <SessionsView />;
      default:
        return useFuturisticUI ? <FuturisticView /> : <DashboardView />;
    }
  };

  return <>{renderView()}</>;
}

export default App;
