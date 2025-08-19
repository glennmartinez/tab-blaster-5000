import { useState, useEffect } from "react";
import "./App.css";
import { ViewType } from "./interfaces/ViewTypes";
import MainLayout from "./views/layout/MainLayout";
import { SessionsView } from "./components";
import { useTabs } from "./hooks/useTabs";
import { StorageFactory } from "./services/StorageFactory";

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
    closeTabs,
    restoreTab,
    removeSavedTab,
  } = useTabs();

  // Initialize storage on app startup
  useEffect(() => {
    console.log("App initializing - setting up storage factory");
    // Initialize the StorageFactory to ensure the correct storage provider is loaded
    StorageFactory.initialize();
    const storageService = StorageFactory.getStorageService();
    console.log(
      "Storage service initialized:",
      storageService.constructor.name
    );
  }, []);

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
            <MainLayout
              windowGroups={windowGroups}
              savedTabs={savedTabs}
              onSwitchTab={switchToTab}
              onCloseTab={closeTab}
              onCloseTabs={closeTabs}
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
        return <MainLayout />;
    }
  };

  return <>{renderView()}</>;
}

export default App;
