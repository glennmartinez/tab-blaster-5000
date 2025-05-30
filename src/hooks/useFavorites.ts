import { useState, useEffect, useCallback } from "react";
import {
  FavoritesService,
  FavoriteTab,
  Tag,
} from "../services/FavoritesService";

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteTab[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const favoritesService = FavoritesService.getInstance();

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [favoritesData, tagsData] = await Promise.all([
        favoritesService.getFavorites(),
        favoritesService.getTags(),
      ]);
      setFavorites(favoritesData);
      setTags(tagsData);
    } catch (error) {
      console.error("Error loading favorites data:", error);
    } finally {
      setLoading(false);
    }
  }, [favoritesService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check if a URL is favorited
  const isFavorite = useCallback(
    async (url: string): Promise<boolean> => {
      return await favoritesService.isFavorite(url);
    },
    [favoritesService]
  );

  // Add a tab to favorites
  const addFavorite = useCallback(
    async (
      tab: { id?: number; title: string; url: string; favicon?: string },
      tags: string[] = []
    ): Promise<FavoriteTab> => {
      const favorite = await favoritesService.addFavorite(tab, tags);
      await loadData(); // Refresh data
      return favorite;
    },
    [favoritesService, loadData]
  );

  // Remove a favorite
  const removeFavorite = useCallback(
    async (favoriteId: string): Promise<void> => {
      await favoritesService.removeFavorite(favoriteId);
      await loadData(); // Refresh data
    },
    [favoritesService, loadData]
  );

  // Remove favorite by URL
  const removeFavoriteByUrl = useCallback(
    async (url: string): Promise<void> => {
      await favoritesService.removeFavoriteByUrl(url);
      await loadData(); // Refresh data
    },
    [favoritesService, loadData]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (
      tab: { id?: number; title: string; url: string; favicon?: string },
      tags: string[] = []
    ): Promise<boolean> => {
      const isCurrentlyFavorite = await isFavorite(tab.url);

      if (isCurrentlyFavorite) {
        await removeFavoriteByUrl(tab.url);
        return false;
      } else {
        await addFavorite(tab, tags);
        return true;
      }
    },
    [isFavorite, removeFavoriteByUrl, addFavorite]
  );

  // Update tags for a favorite
  const updateFavoriteTags = useCallback(
    async (favoriteId: string, tags: string[]): Promise<void> => {
      await favoritesService.updateFavoriteTags(favoriteId, tags);
      await loadData(); // Refresh data
    },
    [favoritesService, loadData]
  );

  // Add a new tag
  const addTag = useCallback(
    async (name: string, color?: string): Promise<Tag> => {
      const tag = await favoritesService.addTag(name, color);
      await loadData(); // Refresh data
      return tag;
    },
    [favoritesService, loadData]
  );

  // Search tags
  const searchTags = useCallback(
    async (query: string): Promise<Tag[]> => {
      return await favoritesService.searchTags(query);
    },
    [favoritesService]
  );

  // Get favorites by tags
  const getFavoritesByTags = useCallback(
    async (tags: string[]): Promise<FavoriteTab[]> => {
      return await favoritesService.getFavoritesByTags(tags);
    },
    [favoritesService]
  );

  // Get favorite state for a specific URL
  const getFavoriteState = useCallback(
    (url: string) => {
      return favorites.find((fav) => fav.url === url);
    },
    [favorites]
  );

  return {
    favorites,
    tags,
    loading,
    isFavorite,
    addFavorite,
    removeFavorite,
    removeFavoriteByUrl,
    toggleFavorite,
    updateFavoriteTags,
    addTag,
    searchTags,
    getFavoritesByTags,
    getFavoriteState,
    refreshData: loadData,
  };
};
