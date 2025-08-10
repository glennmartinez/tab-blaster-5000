import React, { useState } from "react";
import { Heart, Plus } from "lucide-react";
import { useFavorites } from "../../hooks/useFavorites";
import { PriorityStars } from "../favorites/PriorityStars";
import { SimpleTagEditor } from "../favorites/SimpleTagEditor";

interface AddFavoriteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: {
    title: string;
    url: string;
    favicon?: string;
  };
}

export const AddFavoriteDialog: React.FC<AddFavoriteDialogProps> = ({
  isOpen,
  onClose,
  initialTab,
}) => {
  const { addFavorite } = useFavorites();
  const [priority, setPriority] = useState(3);
  const [tags, setTags] = useState<string[]>([]);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialTab) return;

    setIsLoading(true);
    try {
      await addFavorite(initialTab, tags, priority);
      onClose();
    } catch (error) {
      console.error("Error adding favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
    setIsEditingTags(false);
  };

  if (!isOpen || !initialTab) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <Heart className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-semibold text-white">Add to Favorites</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tab Info */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-3">
              {initialTab.favicon && (
                <img src={initialTab.favicon} alt="" className="w-4 h-4" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">
                  {initialTab.title}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                  {initialTab.url}
                </p>
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Priority
            </label>
            <div className="flex items-center gap-3">
              <PriorityStars
                priority={priority}
                onChange={setPriority}
                size="md"
              />
              <span className="text-sm text-slate-400">
                {priority === 1 && "Low"}
                {priority === 2 && "Below Average"}
                {priority === 3 && "Average"}
                {priority === 4 && "High"}
                {priority === 5 && "Critical"}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags
            </label>
            {isEditingTags ? (
              <SimpleTagEditor
                initialTags={tags}
                onSave={handleTagsChange}
                onCancel={() => setIsEditingTags(false)}
                placeholder="Add tags..."
              />
            ) : (
              <div>
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 mb-2">No tags added</p>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingTags(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {tags.length > 0 ? "Edit Tags" : "Add Tags"}
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  Add to Favorites
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
