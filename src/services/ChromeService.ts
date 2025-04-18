import { Tab, WindowInfo } from "../interfaces/TabInterface";

// Mock data for development outside of Chrome extension environment
const mockTabs: Tab[] = [
  {
    id: 1,
    title: "Google",
    url: "https://google.com",
    favIconUrl: "https://google.com/favicon.ico",
    windowId: 1,
    index: 0,
  },
  {
    id: 2,
    title: "GitHub",
    url: "https://github.com",
    favIconUrl: "https://github.com/favicon.ico",
    windowId: 1,
    index: 1,
  },
];

const mockWindows: WindowInfo[] = [{ id: 1, focused: true, tabs: mockTabs }];

/**
 * Service to interact with Chrome browser APIs
 */
export class ChromeService {
  /**
   * Get all open tabs from Chrome
   */
  static getTabs(): Promise<Tab[]> {
    return new Promise((resolve) => {
      if (chrome?.tabs) {
        chrome.tabs.query({}, (tabs) => {
          resolve(tabs as Tab[]);
        });
      } else {
        // Mock data for development
        resolve([...mockTabs]);
      }
    });
  }

  /**
   * Get all open windows from Chrome
   */
  static getWindows(): Promise<WindowInfo[]> {
    return new Promise((resolve) => {
      if (chrome?.windows) {
        chrome.windows.getAll({ populate: true }, (windows) => {
          const formattedWindows: WindowInfo[] = windows.map((window) => ({
            id: window.id || 0, // Provide default value if ID is undefined
            focused: window.focused || false,
            tabs: (window.tabs || []) as Tab[],
          }));
          resolve(formattedWindows);
        });
      } else {
        // Mock data for development
        resolve([...mockWindows]);
      }
    });
  }

  /**
   * Close a tab by ID
   */
  static closeTab(tabId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (chrome?.tabs) {
        chrome.tabs.remove(tabId, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else {
        // Mock behavior for development
        console.log(`Mock: Closing tab ${tabId}`);
        resolve();
      }
    });
  }

  /**
   * Switch to a specific tab
   */
  static switchToTab(tabId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (chrome?.tabs) {
        chrome.tabs.update(tabId, { active: true }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else {
        // Mock behavior for development
        console.log(`Mock: Switching to tab ${tabId}`);
        resolve();
      }
    });
  }

  /**
   * Create a new tab, optionally in a specific window
   * @param url The URL to open in the new tab
   * @param windowId Optional window ID to create the tab in
   */
  static createTab(url: string, windowId?: number): Promise<Tab> {
    return new Promise((resolve, reject) => {
      if (chrome?.tabs) {
        const createOptions: chrome.tabs.CreateProperties = { url };

        // Add windowId to options if specified
        if (windowId !== undefined) {
          createOptions.windowId = windowId;
        }

        chrome.tabs.create(createOptions, (tab) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(tab as Tab);
          }
        });
      } else {
        // Mock behavior for development
        const newTab = {
          id: Math.floor(Math.random() * 1000),
          title: "New Tab",
          url,
          windowId: windowId || 1,
          index: mockTabs.length,
        };
        console.log(
          `Mock: Creating tab with URL ${url} in window ${
            windowId || "current"
          }`,
          newTab
        );
        resolve(newTab);
      }
    });
  }

  /**
   * Get the currently active tab
   */
  static getActiveTab(): Promise<Tab | null> {
    return new Promise((resolve) => {
      if (chrome?.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          resolve(tabs.length > 0 ? (tabs[0] as Tab) : null);
        });
      } else {
        // Mock behavior for development
        resolve(mockTabs[0]);
      }
    });
  }
}
