// Background script for the Ultimate Tab Manager extension

console.log("Background script loaded");

// Initialize when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Ultimate Tab Manager extension installed');
  
  // Initialize storage with default values if needed
  chrome.storage.local.set({
    settings: {
      groupByDomain: true,
      autoSuspendInactive: false,
      inactiveTimeout: 30 // minutes
    },
    savedGroups: []
  });
});

// Listen for tab events to manage tabs
chrome.tabs.onCreated.addListener((tab) => {
  // Handle new tab creation
  console.log('New tab created:', tab.id);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Handle tab updates
  if (changeInfo.status === 'complete') {
    console.log('Tab updated:', tabId, tab.url);
  }
});

// Message handling between popup and background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getTabs') {
    chrome.tabs.query({}, (tabs) => {
      sendResponse({ tabs });
    });
    return true; // Required for async response
  }
});

// Listen for messages from the extension popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Background script received message:", request);
  
  if (request.action === "saveAndCloseTabs") {
    console.log("Handling saveAndCloseTabs action");
    
    // Immediately send a response to prevent connection issues
    sendResponse({ status: "processing" });
    
    // Handle the tab operations independently of the popup
    handleTabOperations(request.tabIds, request.tabManagerUrl);
  }
  
  // No need to return true here since we're sending the response synchronously
});

// Separate function to handle operations independently of the message port
function handleTabOperations(tabIds, tabManagerUrl) {
  console.log(`Preparing to manage ${tabIds.length} tabs`);
  
  // First open the tab manager
  chrome.tabs.create({ url: tabManagerUrl }, function(newTab) {
    console.log("Tab manager opened with ID:", newTab.id);
    
    // Remove the tab manager tab ID from the list of tabs to close
    const tabsToClose = tabIds.filter(id => id !== newTab.id);
    console.log(`Filtered tabs to close: ${tabsToClose.length}`);
    
    // Wait for the new tab to load before closing others
    setTimeout(() => {
      if (tabsToClose.length > 0) {
        chrome.tabs.remove(tabsToClose)
          .then(() => {
            console.log(`Successfully closed ${tabsToClose.length} tabs`);
          })
          .catch((error) => {
            console.error("Error closing tabs:", error);
          });
      } else {
        console.log("No tabs to close after filtering");
      }
    }, 500);
  });
}

// Log when the background script loads
console.log("Background script initialized and ready");