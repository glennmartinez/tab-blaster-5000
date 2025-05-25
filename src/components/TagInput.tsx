import React, { useState, useRef, useEffect } from 'react';
import { Hash, X, Plus } from 'lucide-react';
import { Tag } from '../services/FavoritesService';

interface TagInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: Tag[];
  onAddTag: (name: string) => Promise<Tag>;
  placeholder?: string;
  className?: string;
}

const TagInput: React.FC<TagInputProps> = ({
  selectedTags,
  onTagsChange,
  availableTags,
  onAddTag,
  placeholder = "Add tags...",
  className = ""
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter tags based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.includes(tag.name)
      );
      setFilteredTags(filtered);
      setShowSuggestions(filtered.length > 0 || inputValue.trim().length > 0);
    } else {
      setFilteredTags([]);
      setShowSuggestions(false);
    }
  }, [inputValue, availableTags, selectedTags]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag if input is empty
      removeTag(selectedTags[selectedTags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const addTag = async (tagName: string) => {
    if (!tagName || selectedTags.includes(tagName)) return;

    // Check if tag exists in available tags
    const existingTag = availableTags.find(tag => 
      tag.name.toLowerCase() === tagName.toLowerCase()
    );

    if (!existingTag) {
      // Create new tag
      await onAddTag(tagName);
    }

    onTagsChange([...selectedTags, tagName]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const selectSuggestion = (tag: Tag) => {
    addTag(tag.name);
  };

  const handleInputFocus = () => {
    if (inputValue.trim() || availableTags.length > 0) {
      setShowSuggestions(true);
    }
  };

  const canCreateNewTag = inputValue.trim() && 
    !availableTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) &&
    !selectedTags.includes(inputValue.trim());

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-800/50 border border-slate-600/50 rounded-lg min-h-[40px] focus-within:border-cyan-500/50 transition-colors">
        {/* Selected tags */}
        {selectedTags.map((tag, index) => {
          const tagData = availableTags.find(t => t.name === tag);
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded text-sm border border-cyan-500/30"
              style={tagData?.color ? { 
                backgroundColor: `${tagData.color}20`, 
                borderColor: `${tagData.color}40`,
                color: tagData.color 
              } : {}}
            >
              <Hash className="w-3 h-3" />
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:bg-red-500/20 rounded p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          placeholder={selectedTags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-white placeholder-slate-400"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600/50 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {filteredTags.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs text-slate-400 border-b border-slate-600/50">
                Existing Tags
              </div>
              {filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => selectSuggestion(tag)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
                >
                  <Hash 
                    className="w-3 h-3" 
                    style={{ color: tag.color }}
                  />
                  <span className="text-white">{tag.name}</span>
                  <span className="text-xs text-slate-400 ml-auto">
                    {tag.count} {tag.count === 1 ? 'use' : 'uses'}
                  </span>
                </button>
              ))}
            </>
          )}

          {canCreateNewTag && (
            <>
              {filteredTags.length > 0 && (
                <div className="border-t border-slate-600/50" />
              )}
              <button
                onClick={() => addTag(inputValue.trim())}
                className="w-full px-3 py-2 text-left hover:bg-slate-700/50 flex items-center gap-2 transition-colors text-cyan-400"
              >
                <Plus className="w-3 h-3" />
                <span>Create "{inputValue.trim()}"</span>
              </button>
            </>
          )}

          {filteredTags.length === 0 && !canCreateNewTag && inputValue.trim() && (
            <div className="px-3 py-2 text-slate-400 text-sm">
              No matching tags found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagInput;