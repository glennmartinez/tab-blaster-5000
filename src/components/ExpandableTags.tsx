import React, { useState } from 'react';

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
}

const ExpandableTags: React.FC<ExpandableTagsProps> = ({ 
  tags, 
  availableTags, 
  className = "",
  maxCompactTags = 2,
  showOnHover = false
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

  return (
    <div 
      className={`flex items-center gap-1 ${className} ${
        isExpanded ? 'w-4/5' : ''
      } transition-all duration-200`}
      onClick={handleToggleExpand}
    >
      <div className={`flex items-center gap-1 ${isExpanded ? 'flex-wrap' : ''}`}>
        {tagsToShow.map((tagName) => {
          const tagData = availableTags.find(t => t.name === tagName);
          return (
            <span
              key={tagName}
              className={`text-xs px-1.5 py-0.5 rounded cursor-pointer hover:bg-slate-600/30 transition-colors ${
                showOnHover 
                  ? 'text-slate-400 hover:text-slate-300' 
                  : 'bg-slate-700/50 text-slate-300 border border-slate-600/50 hover:bg-slate-600/50'
              }`}
              style={tagData?.color && !showOnHover ? { 
                backgroundColor: `${tagData.color}20`,
                borderColor: `${tagData.color}40`,
                color: tagData.color 
              } : tagData?.color && showOnHover ? {
                color: tagData.color
              } : {}}
            >
              #{tagName}
            </span>
          );
        })}
        
        {!isExpanded && hasMoreTags && (
          <span 
            className="text-xs text-slate-400 hover:text-slate-300 cursor-pointer px-1"
            title={`Click to see ${tags.length - maxCompactTags} more tags`}
          >
            ...
          </span>
        )}
      </div>
      
      {isExpanded && (
        <span 
          className="text-xs text-slate-400 hover:text-slate-300 cursor-pointer ml-2"
          title="Click to collapse"
        >
          ←
        </span>
      )}
    </div>
  );
};

export default ExpandableTags;