import { useState, useEffect } from "react";
import "./App.css";
import { ViewType } from "./interfaces/ViewTypes";
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

  const {
    windows: windowGroups,
    savedTabs,
    switchToTab,
    closeTab,
    restoreTab,
    removeSavedTab,
  } = useTabs();

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

  // Route to the appropriate view component based on activeView
  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="relative">
            <FuturisticView
              windowGroups={windowGroups}
              savedTabs={savedTabs}
              onSwitchTab={switchToTab}
              onCloseTab={closeTab}
              onRestoreTab={restoreTab}
              onRemoveSavedTab={removeSavedTab}
            />
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
        return <FuturisticView />;
    }
  };

  return <>{renderView()}</>;
}

export default App;
