import React, { useState, useEffect } from "react";
import { Heart, Hash } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import TagDialog from "./TagDialog";

interface FavoriteButtonProps {
  tab: {
    id?: number;
    title: string;
    url: string;
    favicon?: string;
  };
  className?: string;
  showTags?: boolean;
  showTagsOnly?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  tab,
  className = "",
  showTags = false,
  showTagsOnly = false,
}) => {
  const { getFavoriteState, toggleFavorite, updateFavoriteTags, tags, addTag } =
    useFavorites();

  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [currentTags, setCurrentTags] = useState<string[]>([]);

  // Check favorite status
  useEffect(() => {
    const favoriteData = getFavoriteState(tab.url);
    setIsFavorited(!!favoriteData);
    setCurrentTags(favoriteData?.tags || []);
  }, [tab.url, getFavoriteState]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    try {
      const newState = await toggleFavorite(tab, currentTags);
      setIsFavorited(newState);

      if (!newState) {
        setShowTagDialog(false);
        setCurrentTags([]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagsChange = async (newTags: string[]) => {
    setCurrentTags(newTags);

    // If not favorited yet, favorite it first
    if (!isFavorited) {
      setIsLoading(true);
      try {
        const newState = await toggleFavorite(tab, newTags);
        setIsFavorited(newState);
      } catch (error) {
        console.error("Error favoriting tab:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Update tags if this is already a favorite
      const favoriteData = getFavoriteState(tab.url);
      if (favoriteData) {
        await updateFavoriteTags(favoriteData.id, newTags);
        // Force re-check to ensure UI updates immediately
        const updatedFavoriteData = getFavoriteState(tab.url);
        setCurrentTags(updatedFavoriteData?.tags || []);
      }
    }
  };

  const handleShowTags = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowTagDialog(true);
  };

  const handleCloseTagDialog = () => {
    setShowTagDialog(false);
  };

  // If showTagsOnly is true, only show the purple # icon for tag management
  if (showTagsOnly) {
    return (
      <>
        <div className={`flex items-center gap-1 ${className}`}>
          <button
            onClick={handleShowTags}
            className="p-0.5 rounded transition-colors text-purple-500 hover:text-purple-400 hover:bg-purple-500/10"
            title="Manage tags"
          >
            <Hash className="w-3 h-3" />
          </button>
          {/* Display current tags inline for favorited tabs */}
          {isFavorited && currentTags.length > 0 && (
            <div className="flex items-center gap-1 ml-1">
              {currentTags.slice(0, 2).map((tagName) => {
                const tagData = tags.find((t) => t.name === tagName);
                return (
                  <span
                    key={tagName}
                    className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-600/50"
                    style={
                      tagData?.color
                        ? {
                            borderColor: `${tagData.color}40`,
                            color: tagData.color,
                          }
                        : {}
                    }
                  >
                    #{tagName}
                  </span>
                );
              })}
              {currentTags.length > 2 && (
                <span className="text-xs text-slate-400">
                  +{currentTags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        <TagDialog
          isOpen={showTagDialog}
          onClose={handleCloseTagDialog}
          selectedTags={currentTags}
          onTagsChange={handleTagsChange}
          availableTags={tags}
          onAddTag={addTag}
          tabTitle={tab.title}
        />
      </>
    );
  }

  return (
    <>
      <div className={`flex items-center gap-1 ${className}`}>
        {/* Heart Button */}
        <button
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className={`p-0.5 rounded transition-all duration-200 ${
            isFavorited
              ? "text-red-500 hover:text-red-400"
              : "text-slate-400 hover:text-red-500 hover:bg-red-500/10"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          title={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-3 h-3 transition-all duration-200 ${
              isFavorited ? "fill-current" : ""
            } ${isLoading ? "animate-pulse" : ""}`}
          />
        </button>

        {/* Tags Button (only show if favorited and showTags is true) */}
        {isFavorited && showTags && (
          <button
            onClick={handleShowTags}
            className="relative p-0.5 rounded transition-colors text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10"
            title="Manage tags"
          >
            <Hash className="w-3 h-3" />
            {currentTags.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-cyan-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center leading-none">
                {currentTags.length}
              </span>
            )}
          </button>
        )}

        {/* Display current tags (compact view) when not editing */}
        {isFavorited && currentTags.length > 0 && !showTags && (
          <div className="flex items-center gap-1 ml-1">
            {currentTags.slice(0, 2).map((tagName) => {
              const tagData = tags.find((t) => t.name === tagName);
              return (
                <span
                  key={tagName}
                  className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-600/50"
                  style={
                    tagData?.color
                      ? {
                          borderColor: `${tagData.color}40`,
                          color: tagData.color,
                        }
                      : {}
                  }
                >
                  #{tagName}
                </span>
              );
            })}
            {currentTags.length > 2 && (
              <span className="text-xs text-slate-400">
                +{currentTags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Show compact tags inline when showTags is true but not editing */}
        {isFavorited && currentTags.length > 0 && showTags && (
          <div className="flex items-center gap-1 ml-1">
            {currentTags.slice(0, 3).map((tagName) => {
              const tagData = tags.find((t) => t.name === tagName);
              return (
                <span
                  key={tagName}
                  className="text-xs px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-600/50"
                  style={
                    tagData?.color
                      ? {
                          borderColor: `${tagData.color}40`,
                          color: tagData.color,
                        }
                      : {}
                  }
                >
                  #{tagName}
                </span>
              );
            })}
            {currentTags.length > 3 && (
              <span className="text-xs text-slate-400">
                +{currentTags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <TagDialog
        isOpen={showTagDialog}
        onClose={handleCloseTagDialog}
        selectedTags={currentTags}
        onTagsChange={handleTagsChange}
        availableTags={tags}
        onAddTag={addTag}
        tabTitle={tab.title}
      />
    </>
  );
};

export default FavoriteButton;
