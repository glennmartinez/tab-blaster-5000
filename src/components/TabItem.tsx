import React from "react";
import { Trash2 } from "lucide-react";
import { Tab } from "../interfaces/TabInterface";
import FallbackIcon from "./FallbackIcon";
import FavoriteButton from "./FavoriteButton";
import TagButton from "./TagButton";

interface TabItemProps {
  tab: Tab;
  onClick: (tab: Tab) => void;
  onDelete?: (tab: Tab) => void;
  showActions?: boolean;
  showTags?: boolean;
  activeTagInputId?: string | null;
  onTagInputStateChange?: (tabId: string, isOpen: boolean) => void;
  variant?: "session" | "window";
}

const TabItem: React.FC<TabItemProps> = ({
  tab,
  onClick,
  onDelete,
  showActions = false,
  showTags = false,
  activeTagInputId,
  onTagInputStateChange,
  variant = "session",
}) => {
  const handleClick = () => {
    onClick(tab);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(tab);
  };

  const handleTagInputStateChange = (isOpen: boolean) => {
    onTagInputStateChange?.(tab.id?.toString() || tab.url || "", isOpen);
  };

  if (variant === "session") {
    return (
      <div
        className="flex items-center p-3 hover:bg-slate-700/30 cursor-pointer group"
        onClick={handleClick}
        data-component="TabItem"
        data-variant="session"
      >
        <div className="flex-shrink-0 mr-3 bg-slate-700/50 rounded-full p-1 border border-slate-600/50">
          <FallbackIcon favIconUrl={tab.favIconUrl} size="md" />
        </div>
        <div className="flex-1 truncate">
          <div className="text-sm text-slate-300 truncate group-hover:text-cyan-300">
            {tab.title}
          </div>
          <div className="text-xs text-slate-500 truncate">{tab.url}</div>
        </div>
      </div>
    );
  }

  // Window variant with full functionality
  return (
    <div
      className="flex items-center p-3 hover:bg-slate-700/30 cursor-pointer group"
      onClick={handleClick}
      data-component="TabItem"
      data-variant="window"
    >
      <div className="flex-1 min-w-0 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex-shrink-0 mr-3">
              <FallbackIcon favIconUrl={tab.favIconUrl} size="md" />
            </div>
            <div className="flex flex-col min-w-0 flex-1 pr-2">
              <div className="text-sm text-slate-300 truncate group-hover:text-cyan-300 font-medium">
                {tab.title}
              </div>
              <div className="text-xs text-slate-500 truncate">{tab.url}</div>
            </div>
          </div>
          {showActions && (
            <div className="flex items-center gap-3">
              <FavoriteButton
                tab={{
                  id: tab.id,
                  title: tab.title || "",
                  url: tab.url || "",
                  favicon: tab.favIconUrl,
                }}
                className="relative"
              />
              {onDelete && (
                <span
                  className="flex-shrink-0 p-1 text-slate-400 hover:text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleDelete}
                  title="Delete tab"
                >
                  <Trash2 className="w-4 h-4" />
                </span>
              )}
            </div>
          )}
        </div>

        {showTags && (
          <div className="flex items-center gap-2 mt-2 ml-6">
            <TagButton
              tab={{
                id: tab.id,
                title: tab.title || "",
                url: tab.url || "",
                favicon: tab.favIconUrl,
              }}
              className="relative"
              showTags={!activeTagInputId}
              onTagInputStateChange={handleTagInputStateChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

TabItem.displayName = "TabItem";

export default TabItem;
