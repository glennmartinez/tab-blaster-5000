import React, { useState, useEffect, useRef } from "react";
import { ExternalLink, Trash2, Edit3, Flag } from "lucide-react";
import { FavoriteTab } from "../../services/FavoritesService";
import { UsageIndicator } from "./UsageIndicator";
import { TagChip } from "./TagChip";
import { SimpleTagEditor } from "./SimpleTagEditor";
import FallbackIcon from "../common/FallbackIcon";

interface FavoriteItemProps {
  favorite: FavoriteTab;
  onUpdatePriority: (favoriteId: string, priority: number) => void;
  onRemove: (favoriteId: string) => void;
  onOpen: (url: string) => void;
  onUpdateTags: (favoriteId: string, tags: string[]) => void;
}

export const FavoriteItem: React.FC<FavoriteItemProps> = ({
  favorite,
  onUpdatePriority,
  onRemove,
  onOpen,
  onUpdateTags,
}) => {
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [currentPriority, setCurrentPriority] = useState(favorite.priority);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update local priority when favorite prop changes
  useEffect(() => {
    setCurrentPriority(favorite.priority);
  }, [favorite.priority]);

  const handlePriorityChange = (priority: number) => {
    setCurrentPriority(priority); // Update local state immediately
    onUpdatePriority(favorite.id, priority); // Update parent state
    setShowPriorityDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowPriorityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTagsChange = (tags: string[]) => {
    onUpdateTags(favorite.id, tags);
    setIsEditingTags(false);
  };

  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getPriorityColor = (priority: number): string => {
    const colors = [
      "text-gray-400", // Priority 1 - Lowest
      "text-amber-400", // Priority 2
      "text-orange-400", // Priority 3
      "text-red-400", // Priority 4
      "text-red-500", // Priority 5 - Highest
    ];
    return colors[priority - 1] || "text-gray-400";
  };

  return (
    <div className="group">
      <div className="flex items-center gap-3">
        {/* Favicon */}
        <div className="flex-shrink-0">
          <FallbackIcon favIconUrl={favorite.favicon} size="md" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and URL */}
          <div
            className="mb-1 cursor-pointer"
            onClick={() => onOpen(favorite.url)}
          >
            <h4 className="text-sm font-medium text-slate-300 hover:text-cyan-300 transition-colors truncate">
              {favorite.title}
            </h4>
            <p className="text-xs text-slate-500 truncate">
              {getDomainFromUrl(favorite.url)}
            </p>
          </div>

          {/* Single row with Priority, Usage, and Tags */}
          <div className="flex items-center gap-4 text-xs">
            {/* Priority Flag with Dropdown */}
            <div ref={dropdownRef} className="relative flex items-center gap-1">
              <button
                onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                className={`${getPriorityColor(
                  currentPriority
                )} hover:scale-110 transition-transform bg-transparent border-none p-0`}
                title={`Priority: ${currentPriority}/5`}
              >
                <Flag className="w-4 h-4" />
              </button>

              {showPriorityDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded shadow-lg z-10">
                  {[1, 2, 3, 4, 5].map((priority) => (
                    <button
                      key={priority}
                      onClick={() => handlePriorityChange(priority)}
                      className={`flex items-center gap-2 w-full px-3 py-2 text-xs text-left hover:bg-slate-700 transition-colors ${
                        currentPriority === priority ? "bg-slate-700" : ""
                      }`}
                    >
                      <Flag
                        className={`w-3 h-3 ${getPriorityColor(priority)}`}
                      />
                      <span className="text-white">
                        {priority === 1 && "Low"}
                        {priority === 2 && "Medium-Low"}
                        {priority === 3 && "Medium"}
                        {priority === 4 && "High"}
                        {priority === 5 && "Critical"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Usage */}
            <div className="flex items-center">
              <UsageIndicator
                visitCount={favorite.usage.visitCount}
                lastAccess={favorite.usage.lastAccess}
                calculatedScore={favorite.calculatedScore}
                compact={true}
              />
            </div>

            {/* Tags */}
            <div className="flex items-center gap-1 flex-1">
              {isEditingTags ? (
                <SimpleTagEditor
                  initialTags={favorite.tags}
                  onSave={handleTagsChange}
                  onCancel={() => setIsEditingTags(false)}
                  placeholder="Add tags..."
                />
              ) : (
                <div className="flex items-center gap-1 flex-wrap">
                  {favorite.tags.length > 0 ? (
                    favorite.tags.map((tag) => (
                      <TagChip key={tag} name={tag} size="sm" />
                    ))
                  ) : (
                    <span className="text-slate-500">No tags</span>
                  )}
                  <button
                    onClick={() => setIsEditingTags(true)}
                    className="text-slate-400 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                    title="Edit tags"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onOpen(favorite.url)}
            className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => onRemove(favorite.id)}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
            title="Remove favorite"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
