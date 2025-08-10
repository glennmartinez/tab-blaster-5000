import { useState, useEffect, useCallback } from "react";
import { Tab, WindowInfo, SavedTab } from "../interfaces/TabInterface";
import { TabController } from "../controllers/TabController";

/**
 * Hook to provide tab-related data and operations
 */
export const useTabs = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [windows, setWindows] = useState<WindowInfo[]>([]);
  const [savedTabs, setSavedTabs] = useState<SavedTab[]>([]);
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all tabs
   */
  const fetchTabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTabs = await TabController.fetchActiveTabs();
      setTabs(fetchedTabs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch tabs"));
      console.error("Error fetching tabs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all windows with their tabs
   */
  const fetchWindows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedWindows = await TabController.fetchActiveWindows();
      setWindows(fetchedWindows);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch windows")
      );
      console.error("Error fetching windows:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all saved tabs
   */
  const fetchSavedTabs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedSavedTabs = await TabController.getSavedTabs();
      setSavedTabs(fetchedSavedTabs);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch saved tabs")
      );
      console.error("Error fetching saved tabs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Close a tab
   */
  const closeTab = useCallback(async (tabId: number) => {
    try {
      await TabController.closeTab(tabId);
      // Update local state
      setTabs((prev) => prev.filter((tab) => tab.id !== tabId));
      setWindows(
        (prev) =>
          prev
            .map((window) => ({
              ...window,
              tabs: window.tabs.filter((tab) => tab.id !== tabId),
            }))
            .filter((window) => window.tabs.length > 0) // Remove windows with no tabs left
      );
    } catch (err) {
      console.error("Error closing tab:", err);
      throw err;
    }
  }, []);

  /**
   * Close multiple tabs
   */
  const closeTabs = useCallback(async (tabIds: number[]) => {
    try {
      await TabController.closeTabs(tabIds);
      // Update local state
      setTabs((prev) => prev.filter((tab) => !tabIds.includes(tab.id)));
      setWindows(
        (prev) =>
          prev
            .map((window) => ({
              ...window,
              tabs: window.tabs.filter((tab) => !tabIds.includes(tab.id)),
            }))
            .filter((window) => window.tabs.length > 0) // Remove windows with no tabs left
      );
    } catch (err) {
      console.error("Error closing tabs:", err);
      throw err;
    }
  }, []);

  /**
   * Switch to a tab
   */
  const switchToTab = useCallback(
    async (tabId: number) => {
      try {
        await TabController.switchToTab(tabId);
        const targetTab = tabs.find((tab) => tab.id === tabId) || null;
        if (targetTab) {
          setActiveTab(targetTab);
        }
      } catch (err) {
        console.error("Error switching to tab:", err);
        throw err;
      }
    },
    [tabs]
  );

  /**
   * Save a tab
   */
  const saveTab = useCallback(async (tab: Tab) => {
    try {
      await TabController.saveTab(tab);
    } catch (err) {
      console.error("Error saving tab:", err);
      throw err;
    }
  }, []);

  /**
   * Restore a saved tab
   */
  const restoreTab = useCallback(async (savedTab: SavedTab) => {
    try {
      if (savedTab.url) {
        await TabController.openNewTab(savedTab.url);
      }
      // Optionally remove the saved tab after restoring
      // await removeSavedTab(savedTab);
    } catch (err) {
      console.error("Error restoring tab:", err);
      throw err;
    }
  }, []);

  /**
   * Remove a saved tab
   */
  const removeSavedTab = useCallback(async (savedTab: SavedTab) => {
    try {
      await TabController.deleteSavedTab(savedTab.id);
      setSavedTabs((prev) => prev.filter((tab) => tab.id !== savedTab.id));
    } catch (err) {
      console.error("Error removing saved tab:", err);
      throw err;
    }
  }, []);

  /**
   * Filter tabs by search query
   */
  const filterTabs = useCallback(
    (query: string) => {
      if (!query.trim()) return tabs;
      return TabController.searchTabs(tabs, query);
    },
    [tabs]
  );

  /**
   * Filter windows by search query
   */
  const filterWindows = useCallback(
    (query: string) => {
      if (!query.trim()) return windows;

      return windows
        .map((window) => ({
          ...window,
          tabs: TabController.searchTabs(window.tabs, query),
        }))
        .filter((window) => window.tabs.length > 0);
    },
    [windows]
  );

  // Load tabs, windows, and saved tabs on mount
  useEffect(() => {
    fetchWindows(); // This includes tab data within windows
    fetchSavedTabs();
  }, [fetchWindows, fetchSavedTabs]);

  return {
    tabs,
    windows,
    savedTabs,
    activeTab,
    loading,
    error,
    fetchTabs,
    fetchWindows,
    fetchSavedTabs,
    closeTab,
    closeTabs,
    switchToTab,
    saveTab,
    restoreTab,
    removeSavedTab,
    filterTabs,
    filterWindows,
  };
};
