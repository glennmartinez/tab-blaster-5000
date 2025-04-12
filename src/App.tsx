import { useState, useEffect } from "react";
import "./App.css";
import { Tab, SavedTab } from "./interfaces/TabInterface";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PopupView from "./components/PopupView";
import SessionsView from "./components/SessionsView";

function App() {
  const [activeTabs, setActiveTabs] = useState<Tab[]>([]);
  const [savedTabs, setSavedTabs] = useState<SavedTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"active" | "sessions">("active");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Load tabs when component mounts
    fetchActiveTabs();
    fetchSavedTabs();
  }, []);

  const fetchActiveTabs = () => {
    setLoading(true);
    // Use Chrome API to get tabs
    if (chrome?.tabs) {
      chrome.tabs.query({}, (tabs) => {
        setActiveTabs(tabs as Tab[]);
        setLoading(false);
      });
    } else {
      // For development without Chrome API
      console.log("Chrome API not available. Using mock data.");
      setActiveTabs([
        {
          id: 1,
          title: "Google",
          url: "https://www.google.com",
          favIconUrl: "https://www.google.com/favicon.ico",
        },
        {
          id: 2,
          title: "GitHub",
          url: "https://www.github.com",
          favIconUrl: "https://github.com/favicon.ico",
        },
      ]);
      setLoading(false);
    }
  };

  const fetchSavedTabs = () => {
    if (chrome?.storage) {
      chrome.storage.local.get(["savedTabs"], (result) => {
        if (result.savedTabs) {
          setSavedTabs(result.savedTabs);
        }
      });
    } else {
      // For development without Chrome API
      console.log("Chrome storage API not available. Using mock data.");
      setSavedTabs([
        {
          id: 3,
          title: "Saved Tab Example",
          url: "https://example.com",
          favIconUrl: "https://example.com/favicon.ico",
          savedAt: new Date().toISOString(),
        },
      ]);
    }
  };

  const closeTab = (tabId: number) => {
    if (chrome?.tabs) {
      chrome.tabs.remove(tabId, () => {
        setActiveTabs(activeTabs.filter((tab) => tab.id !== tabId));
      });
    } else {
      setActiveTabs(activeTabs.filter((tab) => tab.id !== tabId));
    }
  };

  const switchToTab = (tabId: number) => {
    if (chrome?.tabs) {
      chrome.tabs.update(tabId, { active: true });
    }
  };

  const restoreSavedTab = (tab: SavedTab) => {
    if (chrome?.tabs) {
      chrome.tabs.create({ url: tab.url }, () => {
        // Remove from saved tabs
        removeSavedTab(tab);
      });
    } else {
      window.open(tab.url, "_blank");
      removeSavedTab(tab);
    }
  };

  const removeSavedTab = (tab: SavedTab) => {
    const updatedSavedTabs = savedTabs.filter(
      (savedTab) => savedTab.url !== tab.url || savedTab.savedAt !== tab.savedAt
    );

    if (chrome?.storage) {
      chrome.storage.local.set({ savedTabs: updatedSavedTabs }, () => {
        setSavedTabs(updatedSavedTabs);
      });
    } else {
      setSavedTabs(updatedSavedTabs);
    }
  };

  const saveAllTabs = () => {
    if (chrome?.tabs && chrome?.storage) {
      // Get current tabs
      chrome.tabs.query({}, (currentTabs) => {
        // Save to storage
        chrome.storage.local.get(["savedTabs"], (result) => {
          const existingSavedTabs = result.savedTabs || [];
          const tabsToSave = currentTabs.map((tab) => ({
            id: tab.id,
            title: tab.title,
            url: tab.url,
            favIconUrl: tab.favIconUrl,
            savedAt: new Date().toISOString(),
          }));

          const updatedSavedTabs = [...existingSavedTabs, ...tabsToSave];

          chrome.storage.local.set(
            {
              savedTabs: updatedSavedTabs,
            },
            () => {
              // Close tabs that were saved - fix the TypeScript error by filtering out undefined values
              const tabIds = currentTabs
                .map((tab) => tab.id)
                .filter((id): id is number => id !== undefined);

              if (tabIds.length > 0) {
                chrome.tabs.remove(tabIds);
              }

              // Update state
              setSavedTabs(updatedSavedTabs);
              setActiveTabs([]);
            }
          );
        });
      });
    } else {
      // For development without Chrome API
      console.log("Simulating saving all tabs");
      const tabsToSave = activeTabs.map((tab) => ({
        ...tab,
        savedAt: new Date().toISOString(),
      }));

      setSavedTabs([...savedTabs, ...tabsToSave]);
      setActiveTabs([]);
    }
  };

  const groupTabs = () => {
    if (!chrome?.tabGroups) {
      alert("Tab grouping is not supported in this environment");
      return;
    }
    // Get the selected tabs (this is a simplified example)
    const selectedTabs = activeTabs.slice(0, 3).map((tab) => tab.id);
    chrome.tabs.group({ tabIds: selectedTabs }, (groupId) => {
      console.log("Created tab group with ID:", groupId);
    });
  };

  const getFilteredTabs = () => {
    const tabsToFilter = activeView === "active" ? activeTabs : savedTabs;

    if (activeFilter === "all" && !searchQuery) return tabsToFilter;

    // Combined filtering for domain and search query
    return tabsToFilter.filter((tab) => {
      const matchesDomain =
        activeFilter === "all" || tab.url.includes(activeFilter);
      const matchesSearch =
        !searchQuery ||
        tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tab.url.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesDomain && matchesSearch;
    });
  };

  const filteredTabs = getFilteredTabs();

  // Group saved tabs by date
  const groupTabsByDate = () => {
    const groups: { [key: string]: SavedTab[] } = {};
    savedTabs.forEach((tab) => {
      const date = new Date(tab.savedAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tab);
    });

    return groups;
  };

  const savedTabGroups = groupTabsByDate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Render the correct view based on activeView state
  const renderView = () => {
    switch (activeView) {
      case "active":
        return (
          <PopupView
            loading={loading}
            activeView={activeView}
            filteredTabs={filteredTabs}
            savedTabGroups={savedTabGroups}
            onSwitchTab={switchToTab}
            onCloseTab={closeTab}
            onRestoreTab={restoreSavedTab}
            onRemoveSavedTab={removeSavedTab}
          />
        );
      case "sessions":
        return <SessionsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Component */}
      <Sidebar
        open={sidebarOpen}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Component */}
        <Header
          title={activeView === "active" ? "Active Tabs" : "Sessions"}
          activeTabs={activeTabs.length}
          savedTabs={savedTabs.length}
          activeView={activeView}
          setActiveView={setActiveView}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSidebarToggle={toggleSidebar}
          onGroupTabs={groupTabs}
          onSaveAllTabs={saveAllTabs}
        />

        {/* Main Content View */}
        {renderView()}

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 p-3 text-center">
          <p className="text-sm text-gray-400">
            {activeView === "active"
              ? `${filteredTabs.length} active tabs`
              : "Sessions view"}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
