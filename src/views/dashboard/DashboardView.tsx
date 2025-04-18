import React, { useState } from "react";
import MainLayout from "../layout/MainLayout";
import SystemMetricsPanel from "./SystemMetricsPanel";
import ActiveWindowsList from "./ActiveWindowsList";
import { useSystemMetrics } from "../../hooks/useSystemMetrics";
import { useTabs } from "../../hooks/useTabs";
import SearchBar from "../../components/SearchBar";

/**
 * Dashboard view component
 * Shows system metrics and active windows/tabs overview
 */
const DashboardView: React.FC = () => {
  const {
    metrics,
    status,
    recommendations,
    loading: metricsLoading,
  } = useSystemMetrics(60000); // Refresh every minute
  const {
    windows,
    loading: tabsLoading,
    fetchWindows,
    filterWindows,
  } = useTabs();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWindows = searchQuery ? filterWindows(searchQuery) : windows;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRefresh = () => {
    fetchWindows();
  };

  return (
    <MainLayout activeView="dashboard">
      {/* System Metrics Section */}
      <div className="col-span-12 md:col-span-12 lg:col-span-12 mb-4">
        <SystemMetricsPanel
          metrics={metrics}
          status={status}
          recommendations={recommendations}
          loading={metricsLoading}
        />
      </div>

      {/* Active Windows Section */}
      <div className="col-span-12">
        <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Active Windows</h2>
            <div className="flex gap-2">
              <SearchBar onSearch={handleSearch} placeholder="Search tabs..." />
              <button
                onClick={handleRefresh}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                disabled={tabsLoading}
              >
                {tabsLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <ActiveWindowsList windows={filteredWindows} loading={tabsLoading} />
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardView;
