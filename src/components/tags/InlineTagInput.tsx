import React, { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";

interface Tag {
  name: string;
  color?: string;
}

interface InlineTagInputProps {
  placeholder?: string;
  suggestions?: Tag[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  maxTags?: number;
  className?: string;
  onClose: () => void;
}

const InlineTagInput: React.FC<InlineTagInputProps> = ({
  placeholder = "Add tags...",
  suggestions = [],
  selectedTags,
  onTagsChange,
  maxTags = 10,
  className = "",
  onClose,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper functions
  const getTagsFromInput = useCallback(() => {
    return inputValue
      .split(/\s+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }, [inputValue]);

  const getLastWord = useCallback(() => {
    const words = inputValue.split(/\s+/);
    return words[words.length - 1] || "";
  }, [inputValue]);

  const handleSaveAndClose = useCallback(() => {
    // Remove duplicates and combine with existing tags
    const allTags = [...new Set([...currentTags, ...getTagsFromInput()])];
    onTagsChange(allTags);
    onClose();
  }, [currentTags, getTagsFromInput, onTagsChange, onClose]);

  // Convert typed words to tag chips
  const convertWordsToTags = useCallback(() => {
    const newInputTags = getTagsFromInput();
    if (newInputTags.length > 0) {
      // Remove duplicates from both existing and new tags
      const allTags = [...currentTags];
      newInputTags.forEach((tag) => {
        if (
          !allTags.some(
            (existingTag) => existingTag.toLowerCase() === tag.toLowerCase()
          )
        ) {
          allTags.push(tag);
        }
      });
      setCurrentTags(allTags);
      setInputValue(""); // Clear input after converting to chips
    }
  }, [currentTags, getTagsFromInput]);

  // Filter suggestions based on current input
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      suggestion.name.toLowerCase().includes(getLastWord().toLowerCase()) &&
      !currentTags.some(
        (tag) => tag.toLowerCase() === suggestion.name.toLowerCase()
      ) &&
      !getTagsFromInput().some(
        (tag) => tag.toLowerCase() === suggestion.name.toLowerCase()
      )
  );

  // Initialize with existing tags
  useEffect(() => {
    setCurrentTags([...selectedTags]);
    setInputValue("");

    // Auto focus
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedTags]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        convertWordsToTags();
        handleSaveAndClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleSaveAndClose, convertWordsToTags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const lastWord = value.split(/\s+/).pop() || "";
    setShowSuggestions(lastWord.length > 0 && filteredSuggestions.length > 0);
    setHighlightedIndex(-1);
  };

  const insertSuggestion = (suggestionName: string) => {
    // Add suggestion as a chip, not to input text
    if (
      !currentTags.some(
        (tag) => tag.toLowerCase() === suggestionName.toLowerCase()
      )
    ) {
      setCurrentTags([...currentTags, suggestionName]);
    }
    setInputValue("");
    setShowSuggestions(false);
    setHighlightedIndex(-1);

    // Focus back to input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (
        showSuggestions &&
        highlightedIndex >= 0 &&
        filteredSuggestions[highlightedIndex]
      ) {
        insertSuggestion(filteredSuggestions[highlightedIndex].name);
      } else if (inputValue.trim()) {
        // Convert current input to chip on Enter, but don't close dialog
        const trimmedInput = inputValue.trim();
        if (
          !currentTags.some(
            (tag) => tag.toLowerCase() === trimmedInput.toLowerCase()
          )
        ) {
          setCurrentTags([...currentTags, trimmedInput]);
          setInputValue("");
          setShowSuggestions(false);
        }
      }
      // Don't close dialog on Enter - only close on Escape or click outside
    } else if (e.key === " ") {
      // Convert current word to chip on space
      const trimmedInput = inputValue.trim();
      if (
        trimmedInput &&
        !currentTags.some(
          (tag) => tag.toLowerCase() === trimmedInput.toLowerCase()
        )
      ) {
        setCurrentTags([...currentTags, trimmedInput]);
        setInputValue("");
        setShowSuggestions(false);
      }
    } else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      e.preventDefault();
      // Save current state and close on Escape
      const allTags = [...new Set([...currentTags, ...getTagsFromInput()])];
      onTagsChange(allTags);
      onClose();
    } else if (
      e.key === "Backspace" &&
      inputValue === "" &&
      currentTags.length > 0
    ) {
      // Remove last tag if input is empty
      removeTag(currentTags[currentTags.length - 1]);
    } else if (e.key === "Tab" && showSuggestions && highlightedIndex >= 0) {
      e.preventDefault();
      insertSuggestion(filteredSuggestions[highlightedIndex].name);
    }
  };

  const handleInputFocus = () => {
    const lastWord = getLastWord();
    if (lastWord.length > 0 && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Increase timeout to allow click events to be processed
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div
      className={`relative ${className}`}
      ref={containerRef}
      data-component="InlineTagInput"
    >
      {/* Main input container */}
      <div className="flex flex-wrap items-center gap-1 p-0.5 border border-purple-500/50 rounded-md bg-slate-800/50 focus-within:ring-2 focus-within:ring-purple-500/50 min-h-[36px] w-full">
        {/* Display current tags as lozenges/chips */}
        {currentTags.map((tagName, index) => {
          const tagData = suggestions.find((s) => s.name === tagName);
          return (
            <span
              key={`${tagName}-${index}`}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-300 whitespace-nowrap"
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
              <span className="pointer-events-none select-none">{tagName}</span>
              <span
                className="flex items-center justify-center w-4 h-4 -mr-1 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tagName);
                }}
                title={`Remove ${tagName} tag`}
              >
                <X className="h-3 w-3" />
              </span>
            </span>
          );
        })}

        {/* Text input */}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={currentTags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[80px] border-0 bg-transparent text-slate-200 placeholder-slate-400 focus:outline-none p-0 h-6 text-xs"
          disabled={currentTags.length >= maxTags}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-[60] mt-1 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl max-h-32 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.name}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                insertSuggestion(suggestion.name);
              }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700/50 transition-colors flex items-center gap-2 ${
                index === highlightedIndex ? "bg-slate-700/50" : ""
              }`}
              style={
                suggestion.color
                  ? { borderLeft: `3px solid ${suggestion.color}` }
                  : {}
              }
            >
              <span className="text-slate-300">#{suggestion.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Helper text for duplicate detection - improved visibility */}
      {inputValue.trim() &&
        currentTags.some(
          (tag) => tag.toLowerCase() === inputValue.trim().toLowerCase()
        ) && (
          <div className="absolute top-full left-0 right-0 z-[60] mt-1 bg-amber-900/95 backdrop-blur-sm border border-amber-700/50 rounded-lg shadow-xl">
            <div className="px-3 py-2 text-xs text-amber-300">
              Tag "{inputValue.trim()}" already exists
            </div>
          </div>
        )}

      {/* Create new tag hint */}
      {inputValue.trim() &&
        filteredSuggestions.length === 0 &&
        !currentTags.some(
          (tag) => tag.toLowerCase() === inputValue.trim().toLowerCase()
        ) && (
          <div className="absolute top-full left-0 right-0 z-[60] mt-1 bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-xl">
            <div className="px-3 py-2 text-xs text-slate-400">
              Press Space or Enter to create "#{inputValue.trim()}"
            </div>
          </div>
        )}
    </div>
  );
};

InlineTagInput.displayName = "InlineTagInput";

export default InlineTagInput;
