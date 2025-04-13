import { useState, useEffect } from "react";
import "./App.css";
import { Tab, SavedTab, WindowInfo } from "./interfaces/TabInterface";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import PopupView from "./components/PopupView";
import SessionsView from "./components/SessionsView";
import FuturisticView from "./components/FuturisticView";

function App() {
  const [activeTabs, setActiveTabs] = useState<Tab[]>([]);
  const [windowGroups, setWindowGroups] = useState<WindowInfo[]>([]);
  const [savedTabs, setSavedTabs] = useState<SavedTab[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<
    "active" | "sessions" | "futuristic"
  >("active");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchActiveTabs();
    fetchSavedTabs();
  }, []);

  const fetchActiveTabs = () => {
    setLoading(true);
    if (chrome?.tabs) {
      if (chrome.windows) {
        chrome.windows.getAll({ populate: true }, (windows) => {
          const windowInfos: WindowInfo[] = windows.map((chromeWindow) => {
            return {
              id: chromeWindow.id || 0,
              focused: chromeWindow.focused,
              tabs: (chromeWindow.tabs || []).map((tab) => ({
                id: tab.id || 0,
                title: tab.title || "Untitled Tab",
                url: tab.url || "",
                favIconUrl: tab.favIconUrl || "",
                windowId: tab.windowId,
              })),
            };
          });

          setWindowGroups(windowInfos);

          const allTabs: Tab[] = windowInfos.flatMap((window) => window.tabs);
          setActiveTabs(allTabs);

          setLoading(false);
        });
      } else {
        chrome.tabs.query({}, (tabs) => {
          setActiveTabs(tabs as Tab[]);

          const tabsByWindow: Record<number, Tab[]> = {};
          tabs.forEach((tab) => {
            const windowId = tab.windowId || 0;
            if (!tabsByWindow[windowId]) {
              tabsByWindow[windowId] = [];
            }
            tabsByWindow[windowId].push(tab as Tab);
          });

          const windowInfos: WindowInfo[] = Object.entries(tabsByWindow).map(
            ([windowIdStr, tabs]) => {
              const windowId = parseInt(windowIdStr, 10);
              return {
                id: windowId,
                tabs: tabs,
              };
            }
          );

          setWindowGroups(windowInfos);
          setLoading(false);
        });
      }
    } else {
      console.log("Chrome API not available. Using mock data.");
      const mockTabs = [
        {
          id: 1,
          title: "Google",
          url: "https://www.google.com",
          favIconUrl: "https://www.google.com/favicon.ico",
          windowId: 1,
        },
        {
          id: 2,
          title: "GitHub",
          url: "https://www.github.com",
          favIconUrl: "https://github.com/favicon.ico",
          windowId: 1,
        },
        {
          id: 3,
          title: "Stack Overflow",
          url: "https://stackoverflow.com",
          favIconUrl: "https://stackoverflow.com/favicon.ico",
          windowId: 2,
        },
      ];

      setActiveTabs(mockTabs);

      const mockWindowGroups: WindowInfo[] = [
        {
          id: 1,
          focused: true,
          tabs: mockTabs.filter((tab) => tab.windowId === 1),
        },
        {
          id: 2,
          focused: false,
          tabs: mockTabs.filter((tab) => tab.windowId === 2),
        },
      ];

      setWindowGroups(mockWindowGroups);
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
        setWindowGroups(
          windowGroups.map((windowGroup) => ({
            ...windowGroup,
            tabs: windowGroup.tabs.filter((tab) => tab.id !== tabId),
          }))
        );
      });
    } else {
      setActiveTabs(activeTabs.filter((tab) => tab.id !== tabId));
      setWindowGroups(
        windowGroups.map((windowGroup) => ({
          ...windowGroup,
          tabs: windowGroup.tabs.filter((tab) => tab.id !== tabId),
        }))
      );
    }
  };

  const switchToTab = (tabId: number) => {
    if (chrome?.tabs) {
      const tabToActivate = activeTabs.find((tab) => tab.id === tabId);

      if (tabToActivate?.windowId) {
        chrome.windows.update(tabToActivate.windowId, { focused: true }, () => {
          chrome.tabs.update(tabId, { active: true });
        });
      } else {
        chrome.tabs.update(tabId, { active: true });
      }
    }
  };

  const restoreSavedTab = (tab: SavedTab) => {
    if (chrome?.tabs) {
      chrome.tabs.create({ url: tab.url }, () => {
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
      chrome.tabs.query({}, (currentTabs) => {
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
              const tabIds = currentTabs
                .map((tab) => tab.id)
                .filter((id): id is number => id !== undefined);

              if (tabIds.length > 0) {
                chrome.tabs.remove(tabIds);
              }

              setSavedTabs(updatedSavedTabs);
              setActiveTabs([]);
            }
          );
        });
      });
    } else {
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
    const selectedTabs = activeTabs.slice(0, 3).map((tab) => tab.id);
    chrome.tabs.group({ tabIds: selectedTabs }, (groupId) => {
      console.log("Created tab group with ID:", groupId);
    });
  };

  const getFilteredTabs = () => {
    const tabsToFilter = activeView === "active" ? activeTabs : savedTabs;

    if (activeFilter === "all" && !searchQuery) return tabsToFilter;

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

  const getFilteredWindowGroups = () => {
    if (!searchQuery && activeFilter === "all") {
      return windowGroups;
    }

    return windowGroups
      .map((windowGroup) => ({
        ...windowGroup,
        tabs: windowGroup.tabs.filter((tab) => {
          const matchesDomain =
            activeFilter === "all" || tab.url.includes(activeFilter);
          const matchesSearch =
            !searchQuery ||
            tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tab.url.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesDomain && matchesSearch;
        }),
      }))
      .filter((windowGroup) => windowGroup.tabs.length > 0);
  };

  const filteredWindowGroups = getFilteredWindowGroups();

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

  const renderView = () => {
    switch (activeView) {
      case "active":
        return (
          <PopupView
            loading={loading}
            activeView={activeView}
            filteredTabs={filteredTabs}
            windowGroups={filteredWindowGroups}
            savedTabGroups={savedTabGroups}
            onSwitchTab={switchToTab}
            onCloseTab={closeTab}
            onRestoreTab={restoreSavedTab}
            onRemoveSavedTab={removeSavedTab}
          />
        );
      case "sessions":
        return <SessionsView />;
      case "futuristic":
        return (
          <FuturisticView
            activeTabs={activeTabs}
            savedTabs={savedTabs}
            windowGroups={windowGroups}
            onSwitchTab={switchToTab}
            onCloseTab={closeTab}
            onRestoreTab={restoreSavedTab}
            onRemoveSavedTab={removeSavedTab}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-mint-500 text-white ">
      <Sidebar
        open={sidebarOpen}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={
            activeView === "active"
              ? "Active Tabs"
              : activeView === "sessions"
              ? "Sessions"
              : "Futuristic View"
          }
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
        {renderView()}
        {activeView !== "futuristic" && (
          <footer className="bg-gray-800 border-t border-gray-700 p-3 text-center">
            <p className="text-sm text-gray-400">
              {activeView === "active"
                ? `${filteredTabs.length} active tabs`
                : "Sessions view"}
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}

export default App;
