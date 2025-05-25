import React, { useState, useRef, useEffect } from 'react';
import { Hash, X, Plus, Check } from 'lucide-react';
import { Tag } from '../services/FavoritesService';

interface InlineTagInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: Tag[];
  onAddTag: (name: string) => Promise<Tag>;
  onClose: () => void;
  placeholder?: string;
}

const InlineTagInput: React.FC<InlineTagInputProps> = ({
  selectedTags,
  onTagsChange,
  availableTags,
  onAddTag,
  onClose,
  placeholder = "Add tags..."
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Filter tags based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.includes(tag.name)
      );
      setFilteredTags(filtered.slice(0, 5)); // Limit to 5 suggestions
      setShowSuggestions(true);
    } else {
      setFilteredTags([]);
      setShowSuggestions(false);
    }
  }, [inputValue, availableTags, selectedTags]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

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
      onClose();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      onClose();
    }
  };

  const addTag = async (tagName: string) => {
    if (!tagName || selectedTags.includes(tagName)) return;

    // Check if tag exists
    const existingTag = availableTags.find(tag => 
      tag.name.toLowerCase() === tagName.toLowerCase()
    );

    if (!existingTag) {
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

  const canCreateNewTag = inputValue.trim() && 
    !availableTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) &&
    !selectedTags.includes(inputValue.trim());

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Inline input with selected tags */}
      <div className="flex items-center gap-1 bg-slate-800/80 border border-cyan-500/50 rounded px-2 py-1 max-w-xs">
        {/* Show selected tags as small chips */}
        {selectedTags.map((tag, index) => {
          const tagData = availableTags.find(t => t.name === tag);
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-xs border border-cyan-500/30"
              style={tagData?.color ? { 
                backgroundColor: `${tagData.color}15`, 
                borderColor: `${tagData.color}40`,
                color: tagData.color 
              } : {}}
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:bg-red-500/20 rounded p-0.5 transition-colors ml-1"
              >
                <X className="w-2 h-2" />
              </button>
            </span>
          );
        })}

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={selectedTags.length === 0 ? placeholder : ""}
          className="bg-transparent border-none outline-none text-white placeholder-slate-400 text-xs min-w-[60px] flex-1"
        />

        {/* Done button */}
        <button
          onClick={onClose}
          className="ml-1 p-0.5 text-green-400 hover:text-green-300 transition-colors"
          title="Done"
        >
          <Check className="w-3 h-3" />
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (filteredTags.length > 0 || canCreateNewTag) && (
        <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600/50 rounded-lg shadow-lg z-50 min-w-[200px] max-h-40 overflow-y-auto">
          {filteredTags.length > 0 && (
            <>
              {filteredTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => selectSuggestion(tag)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-700/50 flex items-center gap-2 transition-colors text-xs"
                >
                  <Hash 
                    className="w-3 h-3" 
                    style={{ color: tag.color }}
                  />
                  <span className="text-white">{tag.name}</span>
                  <span className="text-xs text-slate-400 ml-auto">
                    {tag.count}
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
                className="w-full px-3 py-2 text-left hover:bg-slate-700/50 flex items-center gap-2 transition-colors text-cyan-400 text-xs"
              >
                <Plus className="w-3 h-3" />
                <span>Create "{inputValue.trim()}"</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineTagInput;