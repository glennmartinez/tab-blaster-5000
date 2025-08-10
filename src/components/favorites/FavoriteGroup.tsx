import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Hash,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";
import { FavoriteTab } from "../../services/FavoritesService";
import { FavoriteItem } from "./FavoriteItem";

interface FavoriteGroupProps {
  title: string;
  favorites: FavoriteTab[];
  defaultExpanded?: boolean;
  isSmartGroup?: boolean;
  onUpdatePriority: (favoriteId: string, priority: number) => void;
  onRemove: (favoriteId: string) => void;
  onOpen: (url: string) => void;
  onUpdateTags: (favoriteId: string, tags: string[]) => void;
}

export const FavoriteGroup: React.FC<FavoriteGroupProps> = ({
  title,
  favorites,
  defaultExpanded = false,
  isSmartGroup = false,
  onUpdatePriority,
  onRemove,
  onOpen,
  onUpdateTags,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getGroupIcon = () => {
    switch (title) {
      case "Most Frequent":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "High Priority":
        return <Star className="w-4 h-4 text-yellow-400" />;
      case "Recent":
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return <Hash className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getGroupColor = () => {
    if (isSmartGroup) {
      switch (title) {
        case "Most Frequent":
          return "border-green-400/30 bg-green-400/5";
        case "High Priority":
          return "border-yellow-400/30 bg-yellow-400/5";
        case "Recent":
          return "border-blue-400/30 bg-blue-400/5";
        default:
          return "border-slate-600/50 bg-slate-700/30";
      }
    }
    return "border-cyan-400/30 bg-cyan-400/5";
  };

  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className={`border rounded-lg ${getGroupColor()} mb-4`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {getGroupIcon()}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
            {favorites.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-slate-600/50">
          {favorites.map((favorite, index) => (
            <div key={favorite.id}>
              <div className="p-3">
                <FavoriteItem
                  favorite={favorite}
                  onUpdatePriority={onUpdatePriority}
                  onRemove={onRemove}
                  onOpen={onOpen}
                  onUpdateTags={onUpdateTags}
                />
              </div>
              {index < favorites.length - 1 && (
                <div className="border-b border-slate-700/30" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
