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
          const availableGB = (info.availableCapacity / (1024 * 1024 * 1024)).toFixed(2);
          const usedGB = ((info.capacity - info.availableCapacity) / (1024 * 1024 * 1024)).toFixed(2);
          const usedPercent = ((info.capacity - info.availableCapacity) / info.capacity * 100);
          
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
}
