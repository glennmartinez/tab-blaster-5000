import React, { useState, useEffect } from 'react';
import { Heart, Hash } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import TagInput from './TagInput';

interface FavoriteButtonProps {
  tab: {
    id?: number;
    title: string;
    url: string;
    favicon?: string;
  };
  className?: string;
  showTags?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  tab, 
  className = "",
  showTags = false 
}) => {
  const { 
    getFavoriteState, 
    toggleFavorite, 
    updateFavoriteTags, 
    tags, 
    addTag 
  } = useFavorites();

  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
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
      
      // Show tag input when adding to favorites
      if (newState) {
        setShowTagInput(true);
      } else {
        setShowTagInput(false);
        setCurrentTags([]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagsChange = async (newTags: string[]) => {
    setCurrentTags(newTags);
    
    // Update tags if this is already a favorite
    if (isFavorited) {
      const favoriteData = getFavoriteState(tab.url);
      if (favoriteData) {
        await updateFavoriteTags(favoriteData.id, newTags);
      }
    }
  };

  const handleShowTags = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowTagInput(!showTagInput);
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Heart Button */}
      <button
        onClick={handleToggleFavorite}
        disabled={isLoading}
        className={`p-1 rounded transition-all duration-200 ${
          isFavorited
            ? 'text-red-500 hover:text-red-400'
            : 'text-slate-400 hover:text-red-500 hover:bg-red-500/10'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart 
          className={`w-4 h-4 transition-all duration-200 ${
            isFavorited ? 'fill-current' : ''
          } ${isLoading ? 'animate-pulse' : ''}`}
        />
      </button>

      {/* Tags Button (only show if favorited and showTags is true) */}
      {isFavorited && showTags && (
        <button
          onClick={handleShowTags}
          className={`p-1 rounded transition-colors ${
            showTagInput 
              ? 'text-cyan-400 bg-cyan-500/10' 
              : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10'
          }`}
          title="Manage tags"
        >
          <Hash className="w-4 h-4" />
          {currentTags.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {currentTags.length}
            </span>
          )}
        </button>
      )}

      {/* Tag Input (positioned absolutely) */}
      {showTagInput && isFavorited && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <TagInput
            selectedTags={currentTags}
            onTagsChange={handleTagsChange}
            availableTags={tags}
            onAddTag={addTag}
            placeholder="Add tags..."
            className="w-full"
          />
        </div>
      )}

      {/* Display current tags (compact view) */}
      {isFavorited && currentTags.length > 0 && !showTags && (
        <div className="flex gap-1">
          {currentTags.slice(0, 2).map((tagName) => {
            const tagData = tags.find(t => t.name === tagName);
            return (
              <span
                key={tagName}
                className="text-xs px-1 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-slate-600/50"
                style={tagData?.color ? { 
                  borderColor: `${tagData.color}40`,
                  color: tagData.color 
                } : {}}
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
  );
};

export default FavoriteButton;