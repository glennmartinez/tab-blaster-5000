import React, { useState, useEffect } from "react";
import { Hash, X } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import InlineTagInput from "./InlineTagInput";

interface TagButtonProps {
  tab: {
    id?: number;
    title: string;
    url: string;
    favicon?: string;
  };
  className?: string;
  showTags?: boolean;
  onTagInputStateChange?: (isOpen: boolean) => void;
}

const TagButton: React.FC<TagButtonProps> = ({
  tab,
  className = "",
  showTags = true,
  onTagInputStateChange,
}) => {
  const { getFavoriteState, updateFavoriteTags, tags, addTag, toggleFavorite } =
    useFavorites();

  const [showInput, setShowInput] = useState(false);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);

  // Check favorite status and tags
  useEffect(() => {
    const favoriteData = getFavoriteState(tab.url);
    setIsFavorited(!!favoriteData);
    setCurrentTags(favoriteData?.tags || []);
  }, [tab.url, getFavoriteState]);

  const handleHashClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowInput(true);
    onTagInputStateChange?.(true);
  };

  const handleInlineTagsChange = async (newTagNames: string[]) => {
    // Immediately update local state for instant UI feedback
    setCurrentTags(newTagNames);

    try {
      // Add any new tags that don't exist yet
      for (const tagName of newTagNames) {
        const existingTag = tags.find(
          (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
        );
        if (!existingTag) {
          await addTag(tagName);
        }
      }

      // If tab is not favorited yet, favorite it first
      if (!isFavorited) {
        await toggleFavorite(tab, newTagNames);
        setIsFavorited(true);
      } else {
        // Update tags if this is already a favorite
        const favoriteData = getFavoriteState(tab.url);
        if (favoriteData) {
          await updateFavoriteTags(favoriteData.id, newTagNames);
        }
      }
    } catch (error) {
      console.error("Error updating tags:", error);
      // Revert local state on error
      const favoriteData = getFavoriteState(tab.url);
      setCurrentTags(favoriteData?.tags || []);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const newTags = currentTags.filter((tag) => tag !== tagToRemove);
    await handleInlineTagsChange(newTags);
  };

  const handleCloseInput = () => {
    setShowInput(false);
    onTagInputStateChange?.(false);
  };

  if (showInput) {
    return (
      <div className={` w-auto ${className}`}>
        <InlineTagInput
          placeholder="Add tags..."
          suggestions={tags}
          selectedTags={currentTags}
          onTagsChange={handleInlineTagsChange}
          onClose={handleCloseInput}
          maxTags={10}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      data-component="TagButton"
      data-testid="tag-button"
    >
      <span
        onClick={handleHashClick}
        className="p-0.5 rounded transition-colors text-purple-500 hover:text-purple-400 cursor-pointer"
        title="Add tags"
        data-testid="tag-hash-button"
      >
        <Hash className="w-3 h-3" />
      </span>

      {/* Completely hide inline tags when showTags is false (controlled by parent) */}
      {isFavorited && currentTags.length > 0 && showTags && (
        <div
          className="flex items-center gap-1 ml-1 flex-wrap"
          data-testid="tag-list"
        >
          {currentTags.slice(0, 2).map((tagName) => {
            const tagData = tags.find((t) => t.name === tagName);
            return (
              <div
                key={tagName}
                className="group inline-flex items-center text-xs rounded-full bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50 transition-colors"
                data-component="Tag"
                data-testid={`tag-${tagName}`}
                style={
                  tagData?.color
                    ? {
                        backgroundColor: `${tagData.color}20`,
                        borderColor: `${tagData.color}40`,
                        color: tagData.color,
                      }
                    : {}
                }
              >
                <span className="px-2 py-1 pointer-events-none select-none">
                  {tagName}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(tagName);
                  }}
                  className="flex items-center justify-center px-1 py-1 rounded-r-full hover:bg-red-500/30 hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100 border-l border-slate-600/30 cursor-pointer"
                  title={`Remove ${tagName} tag`}
                  data-testid={`tag-remove-${tagName}`}
                >
                  <X className="h-3 w-3 text-slate-400 group-hover:text-red-400 transition-colors" />
                </span>
              </div>
            );
          })}
          {currentTags.length > 2 && (
            <span className="text-xs text-slate-400" data-testid="tag-overflow">
              +{currentTags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

TagButton.displayName = "TagButton";

export default TagButton;
