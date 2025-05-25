import React, { useState, useEffect } from "react";
import { Heart, Trash2, ExternalLink, Hash } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { FavoriteTab } from "../services/FavoritesService";
import TagInput from "../components/TagInput";

const FavouritesView: React.FC = () => {
  const { 
    favorites, 
    tags, 
    loading, 
    removeFavorite, 
    updateFavoriteTags, 
    addTag,
    getFavoritesByTags 
  } = useFavorites();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredFavourites, setFilteredFavourites] = useState<FavoriteTab[]>([]);
  const [editingTags, setEditingTags] = useState<string | null>(null);

  // Filter favorites based on search and tags
  useEffect(() => {
    const filterFavorites = async () => {
      let filtered = favorites;

      // Filter by tags first
      if (selectedTags.length > 0) {
        filtered = await getFavoritesByTags(selectedTags);
      }

      // Then filter by search query
      if (searchQuery.trim()) {
        filtered = filtered.filter(fav =>
          fav.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fav.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          fav.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      setFilteredFavourites(filtered);
    };

    filterFavorites();
  }, [favorites, searchQuery, selectedTags, getFavoritesByTags]);

  const handleOpenFavourite = (url: string) => {
    window.open(url, "_blank");
  };

  const handleRemoveFavourite = async (id: string) => {
    await removeFavorite(id);
  };

  const handleTagsUpdate = async (favoriteId: string, newTags: string[]) => {
    await updateFavoriteTags(favoriteId, newTags);
    setEditingTags(null);
  };

  const availableTagNames = Array.from(new Set(favorites.flatMap(fav => fav.tags)));
  const tagCategories = availableTagNames.map(name => {
    const tagData = tags.find(t => t.name === name);
    return { name, count: tagData?.count || 0, color: tagData?.color };
  }).sort((a, b) => b.count - a.count);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-950 text-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Heart className="w-16 h-16 text-pink-500 animate-pulse" />
          </div>
          <div className="text-lg font-semibold text-slate-300">Loading Favourites...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Heart className="w-8 h-8 text-pink-500 mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
              Favourites
            </h1>
            <span className="ml-3 text-sm text-slate-400">
              {filteredFavourites.length} {filteredFavourites.length === 1 ? 'favorite' : 'favorites'}
            </span>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search favourites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:border-pink-500/50 text-white placeholder-slate-400"
                />
              </div>
            </div>

            {/* Tag Filter */}
            {tagCategories.length > 0 && (
              <div>
                <div className="text-sm text-slate-400 mb-2">Filter by tags:</div>
                <div className="flex flex-wrap gap-2">
                  {tagCategories.map(({ name, count, color }) => (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(name) 
                            ? prev.filter(t => t !== name)
                            : [...prev, name]
                        );
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(name)
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                          : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-600/50'
                      }`}
                      style={color && selectedTags.includes(name) ? {
                        backgroundColor: `${color}20`,
                        borderColor: `${color}50`,
                        color: color
                      } : {}}
                    >
                      <Hash className="w-3 h-3" />
                      {name}
                      <span className="text-xs opacity-70">({count})</span>
                    </button>
                  ))}
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="px-3 py-1 text-xs text-slate-400 hover:text-slate-300 underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Favourites Grid */}
        <div className="flex-1 overflow-y-auto">
          {filteredFavourites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Heart className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No favourites found</h3>
              <p className="text-center">
                {searchQuery || selectedTags.length > 0
                  ? "Try adjusting your search or filter criteria" 
                  : "Start adding tabs to your favorites by clicking the heart icon on any tab"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFavourites.map((favourite) => (
                <div
                  key={favourite.id}
                  className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg p-4 hover:border-pink-500/50 transition-colors group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center mr-3">
                        <Heart className="w-4 h-4 text-pink-500 fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">
                          {favourite.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-3 truncate">
                    {favourite.url}
                  </p>

                  {/* Tags */}
                  {favourite.tags.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {favourite.tags.map((tagName) => {
                          const tagData = tags.find(t => t.name === tagName);
                          return (
                            <span
                              key={tagName}
                              className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30"
                              style={tagData?.color ? {
                                backgroundColor: `${tagData.color}20`,
                                borderColor: `${tagData.color}40`,
                                color: tagData.color
                              } : {}}
                            >
                              #{tagName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tag editing */}
                  {editingTags === favourite.id && (
                    <div className="mb-3">
                      <TagInput
                        selectedTags={favourite.tags}
                        onTagsChange={(newTags) => handleTagsUpdate(favourite.id, newTags)}
                        availableTags={tags}
                        onAddTag={addTag}
                        placeholder="Add tags..."
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Added {new Date(favourite.dateAdded).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingTags(editingTags === favourite.id ? null : favourite.id)}
                        className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                        title="Edit tags"
                      >
                        <Hash className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenFavourite(favourite.url)}
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveFavourite(favourite.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                        title="Remove from favourites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavouritesView;
