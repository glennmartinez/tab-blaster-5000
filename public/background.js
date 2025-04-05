// Background script for the Ultimate Tab Manager extension

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