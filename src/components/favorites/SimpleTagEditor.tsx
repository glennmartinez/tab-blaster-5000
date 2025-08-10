import React, { useState, useRef, useEffect } from "react";
import { X, Plus, Check } from "lucide-react";
import { TagChip } from "./TagChip";

interface SimpleTagEditorProps {
  initialTags: string[];
  onSave: (tags: string[]) => void;
  onCancel: () => void;
  placeholder?: string;
}

export const SimpleTagEditor: React.FC<SimpleTagEditorProps> = ({
  initialTags,
  onSave,
  onCancel,
  placeholder = "Add tags...",
}) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      setTags([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
  };

  const handleSave = () => {
    onSave(tags);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-3">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <div key={tag} className="relative group">
            <TagChip name={tag} size="sm" />
            <button
              onClick={() => handleRemoveTag(tag)}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-2 h-2" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-slate-400"
        />

        <button
          onClick={handleAddTag}
          disabled={!inputValue.trim()}
          className="p-1 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-600/50">
        <button
          onClick={onCancel}
          className="px-3 py-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-3 py-1 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors flex items-center gap-1"
        >
          <Check className="w-3 h-3" />
          Save
        </button>
      </div>
    </div>
  );
};
