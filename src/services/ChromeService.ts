import { Tab, WindowInfo } from "../interfaces/TabInterface";
import { Bookmark, BookmarkTreeNode } from "../interfaces/BookmarkInterface";

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

// Mock bookmark data for development
const mockBookmarks: BookmarkTreeNode[] = [
  {
    id: "1",
    title: "Bookmarks bar",
    children: [
      {
        id: "2",
        title: "Google",
        url: "https://google.com",
        dateAdded: Date.now() - 86400000, // 1 day ago
      },
      {
        id: "3",
        title: "GitHub",
        url: "https://github.com",
        dateAdded: Date.now() - 172800000, // 2 days ago
      },
      {
        id: "4",
        title: "Development",
        children: [
          {
            id: "5",
            title: "MDN Web Docs",
            url: "https://developer.mozilla.org",
            dateAdded: Date.now() - 259200000, // 3 days ago
          },
          {
            id: "6",
            title: "Stack Overflow",
            url: "https://stackoverflow.com",
            dateAdded: Date.now() - 345600000, // 4 days ago
          },
        ],
      },
    ],
  },
  {
    id: "7",
    title: "Other bookmarks",
    children: [
      {
        id: "8",
        title: "YouTube",
        url: "https://youtube.com",
        dateAdded: Date.now() - 432000000, // 5 days ago
      },
    ],
  },
];

/**
 * Type guard to check if chrome system memory API is available
 */
function hasSystemMemoryApi(
  chromeApi: typeof chrome
): chromeApi is typeof chrome & {
  system: typeof chrome.system & {
    memory: {
      getInfo(callback: (info: chrome.system.memory.MemoryInfo) => void): void;
    };
  };
} {
  return (
    chromeApi?.system?.memory &&
    typeof chromeApi.system.memory.getInfo === "function"
  );
}

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
   * Close multiple tabs by their IDs
   */
  static closeTabs(tabIds: number[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (chrome?.tabs && tabIds.length > 0) {
        chrome.tabs.remove(tabIds, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      } else {
        // Mock behavior for development
        console.log(`Mock: Closing ${tabIds.length} tabs:`, tabIds);
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

  /**
   * Get memory information and estimated CPU usage
   * @returns Object with memory usage details and estimated CPU usage
   */
  static getProcessInfo(): Promise<{
    tabInfo: Record<
      number,
      {
        memory: number;
        processId: number;
        cpu: number; // CPU usage percentage
      }
    >;
    totalMemory: number;
    totalCpu: number; // Total CPU usage percentage
  }> {
    return new Promise((resolve) => {
      // Use the chrome.system.memory API for memory information
      if (hasSystemMemoryApi(chrome)) {
        chrome.system.memory.getInfo((info) => {
          // Calculate memory values
          const totalGB = (info.capacity / (1024 * 1024 * 1024)).toFixed(2);
          const availableGB = (
            info.availableCapacity /
            (1024 * 1024 * 1024)
          ).toFixed(2);
          const usedGB = (
            (info.capacity - info.availableCapacity) /
            (1024 * 1024 * 1024)
          ).toFixed(2);
          const usedPercent =
            ((info.capacity - info.availableCapacity) / info.capacity) * 100;

          console.log(`Total memory: ${totalGB} GB`);
          console.log(`Available memory: ${availableGB} GB`);
          console.log(`Used memory: ${usedGB} GB (${usedPercent.toFixed(2)}%)`);

          // Convert bytes to KB for consistency with old API
          const usedMemoryKB = Math.round(
            (info.capacity - info.availableCapacity) / 1024
          );

          // Basic tab info with memory estimation
          const tabInfo: Record<
            number,
            { memory: number; processId: number; cpu: number }
          > = {};

          // Get tabs to create basic tab info entries
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
              if (tab.id) {
                // We can't get per-tab memory usage without the processes API,
                // so we'll estimate based on the total used memory divided by tab count
                const estimatedTabMemory =
                  tabs.length > 0 ? Math.round(usedMemoryKB / tabs.length) : 0;

                tabInfo[tab.id] = {
                  memory: estimatedTabMemory,
                  processId: -1, // We don't have actual process IDs
                  cpu: 0, // We don't have per-tab CPU usage
                };
              }
            });

            // Estimate total CPU based on memory usage (this is just a rough approximation)
            // A more accurate approach would require the chrome.system.cpu API
            const totalCpu = Math.min(usedPercent / 2, 100); // Very rough estimate

            resolve({
              tabInfo,
              totalMemory: usedMemoryKB,
              totalCpu,
            });
          });
        });
      } else {
        // API not available - return empty values
        console.log("System memory API not available");
        resolve({
          tabInfo: {},
          totalMemory: 0,
          totalCpu: 0,
        });
      }
    });
  }

  /**
   * Get all bookmarks from Chrome
   */
  static getBookmarks(): Promise<BookmarkTreeNode[]> {
    return new Promise((resolve) => {
      if (chrome?.bookmarks) {
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
          resolve(bookmarkTreeNodes as BookmarkTreeNode[]);
        });
      } else {
        // Mock data for development
        resolve([...mockBookmarks]);
      }
    });
  }

  /**
   * Search bookmarks by query
   */
  static searchBookmarks(query: string): Promise<Bookmark[]> {
    return new Promise((resolve) => {
      if (chrome?.bookmarks) {
        chrome.bookmarks.search(query, (results) => {
          resolve(results as Bookmark[]);
        });
      } else {
        // Mock search for development
        const flattenBookmarks = (nodes: BookmarkTreeNode[]): Bookmark[] => {
          const result: Bookmark[] = [];
          for (const node of nodes) {
            if (node.url) {
              result.push({
                id: node.id,
                title: node.title,
                url: node.url,
                dateAdded: node.dateAdded,
              });
            }
            if (node.children) {
              result.push(...flattenBookmarks(node.children));
            }
          }
          return result;
        };

        const allBookmarks = flattenBookmarks(mockBookmarks);
        const filtered = allBookmarks.filter(
          (bookmark) =>
            bookmark.title.toLowerCase().includes(query.toLowerCase()) ||
            bookmark.url?.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filtered);
      }
    });
  }

  /**
   * Create a new bookmark
   */
  static createBookmark(bookmark: {
    parentId?: string;
    title: string;
    url?: string;
  }): Promise<Bookmark> {
    return new Promise((resolve, reject) => {
      if (chrome?.bookmarks) {
        chrome.bookmarks.create(bookmark, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result as Bookmark);
          }
        });
      } else {
        // Mock creation for development
        const newBookmark: Bookmark = {
          id: Date.now().toString(),
          title: bookmark.title,
          url: bookmark.url,
          parentId: bookmark.parentId || "1",
          dateAdded: Date.now(),
        };
        console.log("Mock: Creating bookmark", newBookmark);
        resolve(newBookmark);
      }
    });
  }
}
