import React from "react";
import { Tab } from "../interfaces/TabInterface";
import "../styles/TabContent.css";

interface TabContentProps {
  tabs: Tab[];
  activeTab: number | null;
}

const TabContent: React.FC<TabContentProps> = ({ tabs, activeTab }) => {
  if (!activeTab)
    return <div className="empty-tab-content">No tab selected</div>;

  const activeTabContent = tabs.find((tab) => tab.id === activeTab);

  if (!activeTabContent)
    return <div className="empty-tab-content">Tab not found</div>;

  return (
    <div className="tab-content-container">
      <div className="tab-content">
        <div className="tab-header">
          <h2>{activeTabContent.title}</h2>
          <div className="tab-url">{activeTabContent.url}</div>
        </div>

        <div className="tab-body">
          {/* Tab content can be expanded here with additional information */}
          {activeTabContent.favIconUrl && (
            <img
              src={activeTabContent.favIconUrl}
              alt="Tab favicon"
              className="tab-favicon"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}

          <div className="tab-metadata">
            <div className="metadata-item">
              <span className="metadata-label">Window ID:</span>
              <span className="metadata-value">
                {activeTabContent.windowId}
              </span>
            </div>
            {activeTabContent.index !== undefined && (
              <div className="metadata-item">
                <span className="metadata-label">Tab Index:</span>
                <span className="metadata-value">{activeTabContent.index}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabContent;
