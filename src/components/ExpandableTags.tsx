import React, { useState } from "react";
import { X } from "lucide-react";

interface Tag {
  name: string;
  color?: string;
}

interface ExpandableTagsProps {
  tags: string[];
  availableTags: Tag[];
  className?: string;
  maxCompactTags?: number;
  showOnHover?: boolean;
  onTagRemove?: (tagName: string) => void;
}

const ExpandableTags: React.FC<ExpandableTagsProps> = ({
  tags,
  availableTags,
  className = "",
  maxCompactTags = 5,
  showOnHover = false,
  onTagRemove,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (tags.length === 0) return null;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  const tagsToShow = isExpanded ? tags : tags.slice(0, maxCompactTags);
  const hasMoreTags = tags.length > maxCompactTags;
  const remainingTagsCount = tags.length - maxCompactTags;

  return (
    <div
      className={`flex items-center gap-1 ${className} ${
        isExpanded ? "w-4/5" : ""
      } transition-all duration-200`}
      onClick={handleToggleExpand}
      data-component="ExpandableTags"
      data-testid="expandable-tags"
    >
      <div
        className={`flex items-center gap-1 ${isExpanded ? "flex-wrap" : ""}`}
        data-testid="tags-container"
      >
        {tagsToShow.map((tagName) => {
          const tagData = availableTags.find((t) => t.name === tagName);
          return (
            <div
              key={tagName}
              className={`inline-flex items-center text-xs rounded-full transition-colors group ${
                showOnHover
                  ? "text-slate-400 hover:text-slate-300"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50"
              }`}
              data-component="ExpandableTag"
              data-testid={`expandable-tag-${tagName}`}
              style={
                tagData?.color && !showOnHover
                  ? {
                      backgroundColor: `${tagData.color}20`,
                      borderColor: `${tagData.color}40`,
                      color: tagData.color,
                    }
                  : tagData?.color && showOnHover
                  ? {
                      color: tagData.color,
                    }
                  : {}
              }
            >
              <span className="px-2 py-1 pointer-events-none select-none">
                #{tagName}
              </span>
              {!showOnHover && onTagRemove && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagRemove(tagName);
                  }}
                  className="flex items-center justify-center w-6 h-6 rounded-r-full hover:bg-red-500/30 hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100 border-l border-slate-600/30 cursor-pointer"
                  title={`Remove ${tagName} tag`}
                  data-testid={`expandable-tag-remove-${tagName}`}
                >
                  <X className="h-3 w-3 text-slate-400 group-hover:text-red-400 transition-colors" />
                </span>
              )}
            </div>
          );
        })}

        {!isExpanded && hasMoreTags && (
          <span
            className="text-xs text-slate-400 hover:text-slate-300 cursor-pointer px-1.5 py-0.5 rounded bg-slate-700/30 hover:bg-slate-600/50 transition-colors"
            title={`Click to see ${remainingTagsCount} more tags`}
            data-testid="tags-expand-trigger"
          >
            +{remainingTagsCount}
          </span>
        )}
      </div>

      {isExpanded && (
        <span
          className="text-xs text-slate-400 hover:text-slate-300 cursor-pointer ml-2"
          title="Click to collapse"
          data-testid="tags-collapse-trigger"
        >
          ←
        </span>
      )}
    </div>
  );
};

ExpandableTags.displayName = "ExpandableTags";

export default ExpandableTags;
