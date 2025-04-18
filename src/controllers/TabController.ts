import { Tab, SavedTab, WindowInfo } from "../interfaces/TabInterface";
import { ChromeService } from "../services/ChromeService";
import { StorageService } from "../services/StorageService";

/**
 * Controller for tab-related operations
 */
export class TabController {
  /**
   * Fetch all active tabs
   */
  static async fetchActiveTabs(): Promise<Tab[]> {
    return await ChromeService.getTabs();
  }

  /**
   * Fetch all active windows with their tabs
   */
  static async fetchActiveWindows(): Promise<WindowInfo[]> {
    return await ChromeService.getWindows();
  }

  /**
   * Close a tab by ID
   */
  static async closeTab(tabId: number): Promise<void> {
    await ChromeService.closeTab(tabId);
  }

  /**
   * Switch to a specific tab
   */
  static async switchToTab(tabId: number): Promise<void> {
    await ChromeService.switchToTab(tabId);
  }

  /**
   * Open a new tab with the given URL
   */
  static async openNewTab(url: string): Promise<Tab> {
    return await ChromeService.createTab(url);
  }

  /**
   * Save a tab to storage
   */
  static async saveTab(tab: Tab): Promise<void> {
    const savedTab: SavedTab = {
      ...tab,
      savedAt: new Date().toISOString(),
    };

    const existingSavedTabs = await StorageService.getSavedTabs();
    await StorageService.saveTabs([...existingSavedTabs, savedTab]);
  }

  /**
   * Get all saved tabs
   */
  static async getSavedTabs(): Promise<SavedTab[]> {
    return await StorageService.getSavedTabs();
  }

  /**
   * Delete a saved tab
   */
  static async deleteSavedTab(tabId: number): Promise<void> {
    const savedTabs = await StorageService.getSavedTabs();
    const updatedSavedTabs = savedTabs.filter((tab) => tab.id !== tabId);
    await StorageService.saveTabs(updatedSavedTabs);
  }

  /**
   * Search tabs by query
   */
  static searchTabs(tabs: Tab[], query: string): Tab[] {
    if (!query) return tabs;

    const lowerQuery = query.toLowerCase();
    return tabs.filter(
      (tab) =>
        tab.title?.toLowerCase().includes(lowerQuery) ||
        false ||
        tab.url?.toLowerCase().includes(lowerQuery) ||
        false
    );
  }

  /**
   * Group tabs by domain
   */
  static groupTabsByDomain(tabs: Tab[]): Record<string, Tab[]> {
    return tabs.reduce((groups, tab) => {
      try {
        if (!tab.url) {
          // Handle tabs without URLs
          if (!groups["other"]) {
            groups["other"] = [];
          }
          groups["other"].push(tab);
          return groups;
        }

        const url = new URL(tab.url);
        const domain = url.hostname;
        if (!groups[domain]) {
          groups[domain] = [];
        }
        groups[domain].push(tab);
      } catch (e) {
        // Handle invalid URLs
        throw new Error(`Invalid URL: ${tab.url}error: ${e}`);
        if (!groups["other"]) {
          groups["other"] = [];
        }
        groups["other"].push(tab);
      }
      return groups;
    }, {} as Record<string, Tab[]>);
  }
}
