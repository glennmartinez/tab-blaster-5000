import React, { useState, useEffect } from "react";
import { X, Plus, Hash } from "lucide-react";

interface Tag {
  name: string;
  color?: string;
}

interface TagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: Tag[];
  onAddTag: (name: string, color?: string) => Promise<Tag>;
  tabTitle: string;
}

const TagDialog: React.FC<TagDialogProps> = ({
  isOpen,
  onClose,
  selectedTags,
  onTagsChange,
  availableTags,
  onAddTag,
  tabTitle,
}) => {
  const [newTagName, setNewTagName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNewTagName("");
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleTag = (tagName: string) => {
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter((t) => t !== tagName)
      : [...selectedTags, tagName];
    onTagsChange(newTags);
  };

  const handleAddNewTag = async () => {
    if (newTagName.trim()) {
      await onAddTag(newTagName.trim());
      const newTags = [...selectedTags, newTagName.trim()];
      onTagsChange(newTags);
      setNewTagName("");
    }
  };

  const filteredTags = availableTags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg border border-slate-700 shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <Hash className="w-5 h-5 text-purple-500" />
                Manage Tags
              </h3>
              <p className="text-sm text-slate-400 truncate mt-1">{tabTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-96">
          {/* Search/Filter */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">
                Selected Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tagName) => {
                  const tagData = availableTags.find((t) => t.name === tagName);
                  return (
                    <button
                      key={tagName}
                      onClick={() => handleToggleTag(tagName)}
                      className="px-2 py-1 text-xs rounded bg-purple-600/20 border border-purple-500/50 text-purple-300 hover:bg-purple-600/30 transition-colors"
                      style={
                        tagData?.color
                          ? {
                              backgroundColor: `${tagData.color}20`,
                              borderColor: `${tagData.color}50`,
                              color: tagData.color,
                            }
                          : {}
                      }
                    >
                      #{tagName} ✕
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Tags */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">
              Available Tags
            </h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {filteredTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.name}
                    onClick={() => handleToggleTag(tag.name)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      isSelected
                        ? "bg-purple-600/20 border-purple-500/50 text-purple-300"
                        : "bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/50"
                    }`}
                    style={
                      tag.color && isSelected
                        ? {
                            backgroundColor: `${tag.color}20`,
                            borderColor: `${tag.color}50`,
                            color: tag.color,
                          }
                        : tag.color && !isSelected
                        ? {
                            borderColor: `${tag.color}30`,
                            color: `${tag.color}80`,
                          }
                        : {}
                    }
                  >
                    #{tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add New Tag */}
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">
              Add New Tag
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddNewTag()}
                className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded text-slate-200 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <button
                onClick={handleAddNewTag}
                disabled={!newTagName.trim()}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/50 p-4 border-t border-slate-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-slate-200 transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagDialog;
