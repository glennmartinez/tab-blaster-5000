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

  // Create daily alarm for score recalculation
  chrome.alarms.create('recalculateScores', {
    delayInMinutes: 1, // Start after 1 minute
    periodInMinutes: 24 * 60 // Repeat every 24 hours
  });
});

// Listen for tab events to manage tabs
chrome.tabs.onCreated.addListener((tab) => {
  // Handle new tab creation - only log for debugging if needed
  // console.log('New tab created:', tab.id);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Handle tab updates
  if (changeInfo.status === 'complete' && tab.url) {
    // Only log for debugging if needed - comment out to reduce console noise
    // console.log('Tab updated:', tabId, tab.url);
    
    // Track visit for both favorites and session tabs
    trackVisit(tab.url);
  }
});

// Function to track visits for favorites and session tabs
async function trackVisit(url) {
  try {
    // Get both favorites and sessions from storage
    const result = await chrome.storage.local.get(['favourites', 'sessions']);
    const favorites = result.favourites || [];
    const sessions = result.sessions || [];
    
    let updated = false;

    // Track visit for favorites
    const favoriteIndex = favorites.findIndex(fav => fav.url === url);
    if (favoriteIndex !== -1) {
      // Update visit count and last access for favorite
      favorites[favoriteIndex].usage = favorites[favoriteIndex].usage || { visitCount: 0, lastAccess: null };
      favorites[favoriteIndex].usage.visitCount++;
      favorites[favoriteIndex].usage.lastAccess = new Date().toISOString();
      updated = true;
      
      // console.log('Updated favorite visit for:', url);
    }

    // Track visit for tabs in sessions
    sessions.forEach(session => {
      if (session.tabs && Array.isArray(session.tabs)) {
        session.tabs.forEach(tab => {
          if (tab.url === url) {
            // Initialize usage tracking for session tabs
            tab.usage = tab.usage || { visitCount: 0, lastAccess: null };
            tab.usage.visitCount++;
            tab.usage.lastAccess = new Date().toISOString();
            updated = true;
            
            // console.log('Updated session tab visit for:', url, 'in session:', session.name);
          }
        });
      }
    });

    // Save back to storage if anything was updated
    if (updated) {
      // Recalculate scores for favorites
      if (favoriteIndex !== -1) {
        recalculateScores(favorites);
      }
      
      await chrome.storage.local.set({ 
        favourites: favorites,
        sessions: sessions 
      });
    }
  } catch (error) {
    console.error('Error tracking visit:', error);
  }
}

// Function to recalculate scores for all favorites
function recalculateScores(favorites) {
  if (favorites.length === 0) return;

  // Find max visit count for normalization
  const maxVisitCount = Math.max(...favorites.map(fav => (fav.usage?.visitCount || 0)), 1);

  favorites.forEach(favorite => {
    const usage = favorite.usage || { visitCount: 0, lastAccess: null };
    const normalizedVisitCount = usage.visitCount / maxVisitCount;
    
    // Calculate recency factor
    let recencyFactor = 0;
    if (usage.lastAccess) {
      const lastAccessDate = new Date(usage.lastAccess);
      const daysSinceLastAccess = (Date.now() - lastAccessDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastAccess < 7) {
        recencyFactor = 1;
      } else if (daysSinceLastAccess < 30) {
        recencyFactor = 0.5;
      }
    }

    // Calculate score: priority (50%) + frequency (30%) + recency (20%)
    const priority = favorite.priority || 3;
    favorite.calculatedScore = (priority * 0.5) + (normalizedVisitCount * 0.3) + (recencyFactor * 0.2);
  });
}

// Daily score recalculation alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'recalculateScores') {
    recalculateFavoriteScores();
  }
});

// Function to recalculate all scores
async function recalculateFavoriteScores() {
  try {
    const result = await chrome.storage.local.get(['favourites', 'sessions']);
    const favorites = result.favourites || [];
    const sessions = result.sessions || [];
    
    // Recalculate scores for favorites
    recalculateScores(favorites);
    
    // Update sessions with any usage data (no scoring for sessions, just preserve the usage data)
    
    await chrome.storage.local.set({ 
      favourites: favorites,
      sessions: sessions 
    });
    console.log('Daily score recalculation completed');
  } catch (error) {
    console.error('Error during daily score recalculation:', error);
  }
}

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
    // Only log for debugging if needed
    // console.log("Handling saveAndCloseTabs action");    // Immediately send a response to prevent connection issues
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