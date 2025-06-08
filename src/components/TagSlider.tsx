import React, { useState, useEffect, useRef } from "react";
import { X, Check } from "lucide-react";

interface Tag {
  name: string;
  color?: string;
}

interface TagSliderProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: Tag[];
  onAddTag: (name: string, color?: string) => Promise<Tag>;
  tabTitle: string;
}

const TagSlider: React.FC<TagSliderProps> = ({
  isOpen,
  onClose,
  selectedTags,
  onTagsChange,
  availableTags,
  onAddTag,
  tabTitle,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Focus input when slider opens
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter available tags based on input value
    if (inputValue.trim()) {
      const filtered = availableTags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.includes(tag.name)
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags([]);
    }
  }, [inputValue, availableTags, selectedTags]);

  const handleInputSubmit = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    // Check if tag already exists
    const existingTag = availableTags.find(
      (tag) => tag.name.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (existingTag) {
      // Add existing tag
      if (!selectedTags.includes(existingTag.name)) {
        onTagsChange([...selectedTags, existingTag.name]);
      }
    } else {
      // Create new tag
      await onAddTag(trimmedValue);
      onTagsChange([...selectedTags, trimmedValue]);
    }

    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleInputSubmit();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleTagClick = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      onTagsChange([...selectedTags, tagName]);
    }
    setInputValue("");
  };

  const handleRemoveTag = (tagName: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagName));
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Slider */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-slate-900/95 backdrop-blur-md border-l border-slate-700/50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-component="TagSlider"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/80 to-slate-800/40">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-200">
                Manage Tags
              </h3>
              <p className="text-sm text-slate-400 truncate mt-1">{tabTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full pb-16">
          {/* Tag Input */}
          <div className="p-4 border-b border-slate-700/30">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type to add tags..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
              {inputValue.trim() && (
                <button
                  onClick={handleInputSubmit}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filtered Tags (Suggestions) */}
          {filteredTags.length > 0 && (
            <div className="p-4 border-b border-slate-700/30">
              <h4 className="text-sm font-medium text-slate-300 mb-3">
                Suggestions
              </h4>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.name}
                    onClick={() => handleTagClick(tag.name)}
                    className="px-3 py-1.5 text-xs rounded-lg bg-slate-700/50 text-slate-300 hover:bg-purple-600/20 hover:text-purple-300 transition-all duration-200 transform hover:scale-105"
                    style={
                      tag.color
                        ? {
                            borderLeft: `3px solid ${tag.color}`,
                          }
                        : {}
                    }
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Tags */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h4 className="text-sm font-medium text-slate-300 mb-3">
              Selected Tags
            </h4>
            {selectedTags.length === 0 ? (
              <p className="text-slate-500 text-sm italic">
                No tags selected. Start typing to add tags.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedTags.map((tagName) => {
                  const tagData = availableTags.find((t) => t.name === tagName);
                  return (
                    <div
                      key={tagName}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all group"
                    >
                      <span
                        className="text-sm font-medium text-slate-200 flex items-center gap-2"
                        style={tagData?.color ? { color: tagData.color } : {}}
                      >
                        {tagData?.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tagData.color }}
                          />
                        )}
                        #{tagName}
                      </span>
                      <button
                        onClick={() => handleRemoveTag(tagName)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-800/80 border-t border-slate-700/50 backdrop-blur-sm">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

TagSlider.displayName = "TagSlider";

export default TagSlider;
