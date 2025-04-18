import React, { useState, useEffect } from "react";
import { ChromeService } from "../../services/ChromeService";
import { MetricsController } from "../../controllers/MetricsController";
import { SessionController } from "../../controllers/SessionController";
import { WindowInfo } from "../../interfaces/TabInterface";
import { SystemMetrics, SystemStatus } from "../../models/SystemMetrics";
import { SessionSummary } from "../../models/Session";
import ActiveWindowsList from "./ActiveWindowsList";

const ModernDashboard: React.FC = () => {
  // State management
  const [windows, setWindows] = useState<WindowInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newSessionName, setNewSessionName] = useState("");
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [tabUsageTrend, setTabUsageTrend] = useState<{
    trend: "increasing" | "decreasing" | "stable";
    percentage: number;
  }>({ trend: "stable", percentage: 0 });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load windows with tabs
        const loadedWindows = await ChromeService.getWindows();
        setWindows(loadedWindows);

        // Load system metrics
        const currentMetrics = await MetricsController.getSystemMetrics();
        setMetrics(currentMetrics);
        setSystemStatus(MetricsController.getSystemStatus(currentMetrics));

        // Load sessions
        const sessionSummaries = await SessionController.getSessionSummaries();
        setSessions(sessionSummaries);

        // Get tab usage trend
        const trend = MetricsController.trackTabUsageTrend();
        setTabUsageTrend(trend);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Set up refresh interval
    const refreshInterval = setInterval(loadData, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  // Handle tab interactions
  const handleTabClick = async (tabId: number) => {
    try {
      await ChromeService.switchToTab(tabId);
    } catch (error) {
      console.error("Error switching to tab:", error);
    }
  };

  const handleTabClose = async (tabId: number) => {
    try {
      await ChromeService.closeTab(tabId);
      // Update windows after closing tab
      const updatedWindows = await ChromeService.getWindows();
      setWindows(updatedWindows);
    } catch (error) {
      console.error("Error closing tab:", error);
    }
  };

  // Handle session creation
  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;

    try {
      await SessionController.saveCurrentSession(newSessionName);
      setNewSessionName("");
      setShowNewSessionForm(false);

      // Refresh sessions list
      const updatedSessions = await SessionController.getSessionSummaries();
      setSessions(updatedSessions);
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleRestoreSession = async (sessionId: string) => {
    try {
      await SessionController.restoreSession(sessionId);
      // Refresh windows after restoring session
      const updatedWindows = await ChromeService.getWindows();
      setWindows(updatedWindows);
    } catch (error) {
      console.error("Error restoring session:", error);
    }
  };

  // Filter windows based on search query
  const filteredWindows = windows
    .map((window) => ({
      ...window,
      tabs: window.tabs.filter(
        (tab) =>
          tab.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tab.url?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((window) => window.tabs.length > 0);

  // Recommendations based on metrics
  const recommendations = metrics
    ? MetricsController.getRecommendations(metrics)
    : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-100 mb-4 md:mb-0">
          Tab Management Dashboard
        </h1>
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search tabs by title or URL..."
            className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* System Status Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-medium text-slate-200 mb-3">
            System Status
          </h2>
          {metrics && systemStatus ? (
            <div>
              <div className="flex items-center mb-4">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    systemStatus.status === "healthy"
                      ? "bg-green-500"
                      : systemStatus.status === "warning"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span className="text-slate-200">{systemStatus.message}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Memory Usage</span>
                    <span>{metrics.memoryUsage.usagePercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metrics.memoryUsage.usagePercentage > 80
                          ? "bg-red-500"
                          : metrics.memoryUsage.usagePercentage > 60
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${metrics.memoryUsage.usagePercentage}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Open Tabs</span>
                  <span className="text-slate-200">{metrics.tabCount}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Windows</span>
                  <span className="text-slate-200">{metrics.windowCount}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tab Trend</span>
                  <span
                    className={`font-medium ${
                      tabUsageTrend.trend === "increasing"
                        ? "text-red-400"
                        : tabUsageTrend.trend === "decreasing"
                        ? "text-green-400"
                        : "text-slate-300"
                    }`}
                  >
                    {tabUsageTrend.trend === "increasing"
                      ? "↑"
                      : tabUsageTrend.trend === "decreasing"
                      ? "↓"
                      : "–"}
                    {Math.round(tabUsageTrend.percentage)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-pulse text-slate-400">
              Loading metrics...
            </div>
          )}
        </div>

        {/* Recommendations Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-medium text-slate-200 mb-3">
            Recommendations
          </h2>
          {recommendations.length > 0 ? (
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex">
                  <svg
                    className="flex-shrink-0 w-5 h-5 text-blue-400 mt-0.5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-slate-300">{recommendation}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-slate-400">
              No recommendations at this time.
            </div>
          )}
        </div>

        {/* Sessions Management Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-medium text-slate-200 mb-3">
            Saved Sessions
          </h2>

          {showNewSessionForm ? (
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Session name"
                  className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-l-md text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                />
                <button
                  onClick={handleCreateSession}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md transition-colors"
                >
                  Save
                </button>
              </div>
              <button
                onClick={() => setShowNewSessionForm(false)}
                className="text-sm text-slate-400 hover:text-slate-300 mt-2"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewSessionForm(true)}
              className="mb-4 flex items-center text-sm text-blue-400 hover:text-blue-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Save Current Session
            </button>
          )}

          {sessions.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-slate-700/40 hover:bg-slate-700/60 rounded-md p-3 transition-colors"
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium text-slate-200">
                      {session.name}
                    </h3>
                    <span className="text-xs text-slate-400">
                      {session.tabCount} tabs
                    </span>
                  </div>
                  {session.description && (
                    <p className="text-sm text-slate-400 mt-1">
                      {session.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleRestoreSession(session.id)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Restore Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400">No saved sessions.</div>
          )}
        </div>
      </div>

      {/* Active Windows & Tabs Section */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-slate-700 px-4 py-3">
          <h2 className="text-lg font-medium text-slate-200">
            Active Windows & Tabs
            {!loading && (
              <span className="text-sm font-normal text-slate-400 ml-2">
                (
                {windows.reduce(
                  (count, window) => count + window.tabs.length,
                  0
                )}{" "}
                tabs in {windows.length} windows)
              </span>
            )}
          </h2>
        </div>

        <ActiveWindowsList
          windows={filteredWindows}
          loading={loading}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
        />
      </div>
    </div>
  );
};

export default ModernDashboard;
