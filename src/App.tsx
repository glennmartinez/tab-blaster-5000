import { useState, useEffect } from "react";
import "./App.css";
import Button from "./components/Button";

interface Tab {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
}

function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    // Load tabs when component mounts
    fetchTabs();
  }, []);

  const fetchTabs = () => {
    setLoading(true);
    // Use Chrome API to get tabs
    if (chrome?.tabs) {
      chrome.tabs.query({}, (tabs) => {
        setTabs(tabs as Tab[]);
        setLoading(false);
      });
    } else {
      // For development without Chrome API
      console.log("Chrome API not available. Using mock data.");
      setTabs([
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

  const closeTab = (tabId: number) => {
    if (chrome?.tabs) {
      chrome.tabs.remove(tabId, () => {
        setTabs(tabs.filter((tab) => tab.id !== tabId));
      });
    } else {
      setTabs(tabs.filter((tab) => tab.id !== tabId));
    }
  };

  const switchToTab = (tabId: number) => {
    if (chrome?.tabs) {
      chrome.tabs.update(tabId, { active: true });
    }
  };

  const groupTabs = () => {
    if (!chrome?.tabGroups) {
      alert("Tab grouping is not supported in this environment");
      return;
    }

    // Get the selected tabs (this is a simplified example)
    const selectedTabs = tabs.slice(0, 3).map((tab) => tab.id);

    chrome.tabs.group({ tabIds: selectedTabs }, (groupId) => {
      console.log("Created tab group with ID:", groupId);
    });
  };

  const getFilteredTabs = () => {
    if (activeFilter === "all") return tabs;

    // Example filter by domain (simplistic)
    const domain = activeFilter;
    return tabs.filter((tab) => tab.url.includes(domain));
  };

  const filteredTabs = getFilteredTabs();

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-xl font-bold text-center mb-4 text-blue-600">
        Ultimate Tab Manager
      </h1>

      <div className="flex justify-between mb-4">
        <Button onClick={fetchTabs}>Refresh chicos</Button>
        <Button onClick={groupTabs}>Group Selected</Button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded ${
            activeFilter === "all" ? "bg-blue-400 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveFilter("all")}
        >
          All
        </button>
        <button
          className={`px-3 py-1 rounded ${
            activeFilter === "google" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveFilter("google")}
        >
          Google
        </button>
        <button
          className={`px-3 py-1 rounded ${
            activeFilter === "github" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveFilter("github")}
        >
          GitHub
        </button>
      </div>

      {loading ? (
        <p className="text-center">Loading tabs...</p>
      ) : (
        <ul className="space-y-2">
          {filteredTabs.map((tab) => (
            <li
              key={tab.id}
              className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => switchToTab(tab.id)}
            >
              {tab.favIconUrl && (
                <img src={tab.favIconUrl} alt="" className="w-4 h-4 mr-2" />
              )}
              <div className="flex-grow truncate">
                <p className="truncate text-sm">{tab.title}</p>
                <p className="text-xs text-gray-500 truncate">{tab.url}</p>
              </div>
              <button
                className="ml-2 p-1 rounded-full hover:bg-red-100"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        {tabs.length} tabs opened in total
      </p>
    </div>
  );
}

export default App;
