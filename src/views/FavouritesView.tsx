import React, { useState, useEffect, useCallback } from "react";
import {
  Heart,
  Search,
  Filter,
  LayoutGrid,
  List,
  Star,
  TrendingUp,
} from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { FavoriteTab } from "../services/FavoritesService";
import { FavoriteGroup, FavoriteItem } from "../components/favorites";

type ViewMode = "all" | "groups" | "frequent";
type SortOption = "score" | "priority" | "alphabetical" | "recent";

const FavouritesView: React.FC = () => {
  const {
    favorites,
    tags,
    loading,
    removeFavorite,
    updateFavoritePriority,
    updateFavoriteTags,
    trackVisit,
    getSmartGroups,
    getFavoritesGroupedByTags,
  } = useFavorites();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [sortOption, setSortOption] = useState<SortOption>("score");
  const [filteredFavourites, setFilteredFavourites] = useState<FavoriteTab[]>(
    []
  );
  const [smartGroups, setSmartGroups] = useState<{
    [key: string]: FavoriteTab[];
  }>({});
  const [tagGroups, setTagGroups] = useState<{ [key: string]: FavoriteTab[] }>(
    {}
  );

  // Helper function to apply current filters to any set of favorites
  const applyFilters = useCallback(
    async (favoritesToFilter: FavoriteTab[]): Promise<FavoriteTab[]> => {
      let filtered = favoritesToFilter;

      // Filter by tags first
      if (selectedTags.length > 0) {
        filtered = filtered.filter((favorite) =>
          selectedTags.some((tag) =>
            favorite.tags.some(
              (favTag) => favTag.toLowerCase() === tag.toLowerCase()
            )
          )
        );
      }

      // Then filter by search query
      if (searchQuery.trim()) {
        filtered = filtered.filter(
          (fav) =>
            fav.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            fav.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
            fav.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
      }

      return filtered;
    },
    [selectedTags, searchQuery]
  );

  // Filter and sort favorites
  useEffect(() => {
    const filterAndSortFavorites = async () => {
      const filtered = await applyFilters(favorites);

      // Sort favorites
      const sorted = [...filtered].sort((a, b) => {
        switch (sortOption) {
          case "score":
            return b.calculatedScore - a.calculatedScore;
          case "priority":
            return b.priority - a.priority;
          case "alphabetical":
            return a.title.localeCompare(b.title);
          case "recent": {
            const aTime = a.usage.lastAccess?.getTime() || 0;
            const bTime = b.usage.lastAccess?.getTime() || 0;
            return bTime - aTime;
          }
          default:
            return 0;
        }
      });

      setFilteredFavourites(sorted);
    };

    filterAndSortFavorites();
  }, [favorites, searchQuery, selectedTags, sortOption]);

  // Load groups when needed
  useEffect(() => {
    const loadGroups = async () => {
      if (viewMode === "groups") {
        const [smart, byTags] = await Promise.all([
          getSmartGroups(),
          getFavoritesGroupedByTags(),
        ]);

        // Apply filters to each group
        const filteredSmartGroups: { [key: string]: FavoriteTab[] } = {};
        for (const [groupName, groupFavorites] of Object.entries(smart)) {
          const filtered = await applyFilters(groupFavorites);
          if (filtered.length > 0) {
            filteredSmartGroups[groupName] = filtered;
          }
        }

        const filteredTagGroups: { [key: string]: FavoriteTab[] } = {};
        for (const [groupName, groupFavorites] of Object.entries(byTags)) {
          const filtered = await applyFilters(groupFavorites);
          if (filtered.length > 0) {
            filteredTagGroups[groupName] = filtered;
          }
        }

        setSmartGroups(filteredSmartGroups);
        setTagGroups(filteredTagGroups);
      }
    };

    loadGroups();
  }, [
    viewMode,
    favorites,
    getSmartGroups,
    getFavoritesGroupedByTags,
    applyFilters,
    searchQuery,
    selectedTags,
  ]);

  const handleOpenFavourite = async (url: string) => {
    console.log("Opening favorite:", url); // Debug log

    // Open the tab first to avoid popup blockers
    window.open(url, "_blank");

    // Track visit after opening (don't let tracking failures prevent opening)
    try {
      await trackVisit(url);
    } catch (error) {
      console.error("Failed to track visit:", error);
    }
  };

  const handleRemoveFavourite = async (id: string) => {
    await removeFavorite(id);
  };

  const handleUpdatePriority = async (favoriteId: string, priority: number) => {
    await updateFavoritePriority(favoriteId, priority);
  };

  const handleUpdateTags = async (favoriteId: string, tags: string[]) => {
    await updateFavoriteTags(favoriteId, tags);
  };

  const availableTagNames = Array.from(
    new Set(favorites.flatMap((fav) => fav.tags))
  );
  const tagCategories = availableTagNames
    .map((name) => {
      const tagData = tags.find((t) => t.name === name);
      return { name, count: tagData?.count || 0, color: tagData?.color };
    })
    .sort((a, b) => b.count - a.count);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-950 text-white">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <Heart className="w-16 h-16 text-pink-500 animate-pulse" />
          </div>
          <div className="text-lg font-semibold text-slate-300">
            Loading Favourites...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-pink-500 mr-3" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                Favourites
              </h1>
              <span className="ml-3 text-sm text-slate-400">
                {viewMode === "all"
                  ? `${filteredFavourites.length} ${
                      filteredFavourites.length === 1 ? "favorite" : "favorites"
                    }`
                  : viewMode === "groups"
                  ? `${
                      Object.keys(smartGroups).length +
                      Object.keys(tagGroups).length
                    } groups`
                  : `${
                      smartGroups["Most Frequent"]?.length || 0
                    } top favorites`}
                {(searchQuery || selectedTags.length > 0) && " (filtered)"}
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode("all")}
                className={`px-3 py-1 rounded text-sm flex items-center gap-2 transition-colors ${
                  viewMode === "all"
                    ? "bg-cyan-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <List className="w-4 h-4" />
                All
              </button>
              <button
                onClick={() => setViewMode("groups")}
                className={`px-3 py-1 rounded text-sm flex items-center gap-2 transition-colors ${
                  viewMode === "groups"
                    ? "bg-cyan-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Groups
              </button>
              <button
                onClick={() => setViewMode("frequent")}
                className={`px-3 py-1 rounded text-sm flex items-center gap-2 transition-colors ${
                  viewMode === "frequent"
                    ? "bg-cyan-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Top
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search favourites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg focus:outline-none focus:border-pink-500/50 text-white placeholder-slate-400"
                />
              </div>

              {/* Sort */}
              {viewMode === "all" && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={sortOption}
                    onChange={(e) =>
                      setSortOption(e.target.value as SortOption)
                    }
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="score">By Score</option>
                    <option value="priority">By Priority</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="recent">Most Recent</option>
                  </select>
                </div>
              )}
            </div>

            {/* Tag Filter */}
            {tagCategories.length > 0 && (
              <div>
                <div className="text-sm text-slate-400 mb-2">
                  Filter by tags:
                </div>
                <div className="flex flex-wrap gap-2">
                  {tagCategories.map(({ name, count, color }) => (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(name)
                            ? prev.filter((t) => t !== name)
                            : [...prev, name]
                        );
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(name)
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                          : "bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-600/50"
                      }`}
                      style={
                        color && selectedTags.includes(name)
                          ? {
                              backgroundColor: `${color}20`,
                              borderColor: `${color}50`,
                              color: color,
                            }
                          : {}
                      }
                    >
                      #{name}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === "all" && (
            <div>
              {filteredFavourites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Heart className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No favourites found
                  </h3>
                  <p className="text-center">
                    {searchQuery || selectedTags.length > 0
                      ? "Try adjusting your search or filter criteria"
                      : "Start adding tabs to your favorites by clicking the heart icon on any tab"}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg">
                  {filteredFavourites.map((favourite, index) => (
                    <div key={favourite.id}>
                      <div className="p-4">
                        <FavoriteItem
                          favorite={favourite}
                          onUpdatePriority={handleUpdatePriority}
                          onRemove={handleRemoveFavourite}
                          onOpen={handleOpenFavourite}
                          onUpdateTags={handleUpdateTags}
                        />
                      </div>
                      {index < filteredFavourites.length - 1 && (
                        <div className="border-b border-slate-700/50" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {viewMode === "groups" && (
            <div>
              {Object.keys(smartGroups).length === 0 &&
              Object.keys(tagGroups).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <LayoutGrid className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No groups found
                  </h3>
                  <p className="text-center">
                    {searchQuery || selectedTags.length > 0
                      ? "Try adjusting your search or filter criteria"
                      : "Add some favorites with tags to see groups here"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Smart Groups */}
                  {Object.keys(smartGroups).length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        Smart Groups
                      </h2>
                      {Object.entries(smartGroups).map(
                        ([groupName, groupFavorites]) => (
                          <FavoriteGroup
                            key={groupName}
                            title={groupName}
                            favorites={groupFavorites}
                            defaultExpanded={groupName === "Most Frequent"}
                            isSmartGroup={true}
                            onUpdatePriority={handleUpdatePriority}
                            onRemove={handleRemoveFavourite}
                            onOpen={handleOpenFavourite}
                            onUpdateTags={handleUpdateTags}
                          />
                        )
                      )}
                    </div>
                  )}

                  {/* Tag Groups */}
                  {Object.keys(tagGroups).length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-cyan-400" />
                        By Tags
                      </h2>
                      {Object.entries(tagGroups).map(
                        ([groupName, groupFavorites]) => (
                          <FavoriteGroup
                            key={groupName}
                            title={groupName}
                            favorites={groupFavorites}
                            defaultExpanded={false}
                            isSmartGroup={false}
                            onUpdatePriority={handleUpdatePriority}
                            onRemove={handleRemoveFavourite}
                            onOpen={handleOpenFavourite}
                            onUpdateTags={handleUpdateTags}
                          />
                        )
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {viewMode === "frequent" && (
            <div>
              {smartGroups["Most Frequent"] &&
              smartGroups["Most Frequent"].length > 0 ? (
                <div className="bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm rounded-lg">
                  {smartGroups["Most Frequent"].map((favourite, index) => (
                    <div key={favourite.id}>
                      <div className="p-4">
                        <FavoriteItem
                          favorite={favourite}
                          onUpdatePriority={handleUpdatePriority}
                          onRemove={handleRemoveFavourite}
                          onOpen={handleOpenFavourite}
                          onUpdateTags={handleUpdateTags}
                        />
                      </div>
                      {index < smartGroups["Most Frequent"].length - 1 && (
                        <div className="border-b border-slate-700/50" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <TrendingUp className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    No frequent favorites found
                  </h3>
                  <p className="text-center">
                    {searchQuery || selectedTags.length > 0
                      ? "Try adjusting your search or filter criteria"
                      : "Visit your favorite sites to see them appear here"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavouritesView;
