import React, { useState } from "react";
import { ExternalLink, Trash2, Edit3 } from "lucide-react";
import { FavoriteTab } from "../../services/FavoritesService";
import { PriorityStars } from "./PriorityStars";
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

  const handlePriorityChange = (priority: number) => {
    onUpdatePriority(favorite.id, priority);
  };

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

  return (
    <div className="group">
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="flex-shrink-0 mt-0.5">
          <FallbackIcon favIconUrl={favorite.favicon} size="sm" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and URL */}
          <div className="mb-2">
            <button
              onClick={() => onOpen(favorite.url)}
              className="text-left group/link"
              title={`Open ${favorite.title}`}
            >
              <h4 className="text-sm font-medium text-white group-hover/link:text-cyan-400 transition-colors truncate">
                {favorite.title}
              </h4>
              <p className="text-xs text-slate-400 group-hover/link:text-slate-300 transition-colors truncate">
                {getDomainFromUrl(favorite.url)}
              </p>
            </button>
          </div>

          {/* Priority */}
          <div className="mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Priority:</span>
              <PriorityStars
                priority={favorite.priority}
                onChange={handlePriorityChange}
                size="sm"
              />
            </div>
          </div>

          {/* Usage */}
          <div className="mb-2">
            <UsageIndicator
              visitCount={favorite.usage.visitCount}
              lastAccess={favorite.usage.lastAccess}
              calculatedScore={favorite.calculatedScore}
              compact={true}
            />
          </div>

          {/* Tags */}
          <div className="mb-2">
            {isEditingTags ? (
              <SimpleTagEditor
                initialTags={favorite.tags}
                onSave={handleTagsChange}
                onCancel={() => setIsEditingTags(false)}
                placeholder="Add tags..."
              />
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400">Tags:</span>
                {favorite.tags.length > 0 ? (
                  favorite.tags.map((tag) => (
                    <TagChip key={tag} name={tag} size="sm" />
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No tags</span>
                )}
                <button
                  onClick={() => setIsEditingTags(true)}
                  className="text-xs text-slate-400 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}
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
