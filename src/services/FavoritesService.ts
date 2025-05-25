import { StorageFactory } from "./StorageFactory";
import { STORAGE_KEYS } from "../constants/storageKeys";

export interface FavoriteTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  dateAdded: Date;
  tags: string[];
  tabId?: number; // Chrome tab ID if it's an active tab
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
  count: number; // Number of tabs using this tag
}

export class FavoritesService {
  private static instance: FavoritesService;
  private favoritesKey = STORAGE_KEYS.FAVOURITES;
  private tagsKey = "tags"; // We'll store tags separately

  private constructor() {}

  static getInstance(): FavoritesService {
    if (!FavoritesService.instance) {
      FavoritesService.instance = new FavoritesService();
    }
    return FavoritesService.instance;
  }

  private getStorageService() {
    return StorageFactory.getStorageService();
  }

  // Favorites management
  async getFavorites(): Promise<FavoriteTab[]> {
    try {
      const result = await this.getStorageService().get(this.favoritesKey);
      const favorites = (result[this.favoritesKey] as FavoriteTab[]) || [];

      // Convert dateAdded strings back to Date objects if needed
      return favorites.map((fav) => ({
        ...fav,
        dateAdded: new Date(fav.dateAdded),
      }));
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  }

  async addFavorite(
    tab: { id?: number; title: string; url: string; favicon?: string },
    tags: string[] = []
  ): Promise<FavoriteTab> {
    const favorites = await this.getFavorites();

    // Check if already exists
    const existingIndex = favorites.findIndex((fav) => fav.url === tab.url);
    if (existingIndex !== -1) {
      // Update existing favorite
      favorites[existingIndex].tags = [
        ...new Set([...favorites[existingIndex].tags, ...tags]),
      ];
      favorites[existingIndex].dateAdded = new Date();
      await this.saveFavorites(favorites);
      await this.updateTagCounts();
      return favorites[existingIndex];
    }

    const favorite: FavoriteTab = {
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: tab.title,
      url: tab.url,
      favicon: tab.favicon,
      dateAdded: new Date(),
      tags: [...new Set(tags)],
      tabId: tab.id,
    };

    favorites.push(favorite);
    await this.saveFavorites(favorites);
    await this.updateTagCounts();
    return favorite;
  }

  async removeFavorite(favoriteId: string): Promise<void> {
    const favorites = await this.getFavorites();
    const filteredFavorites = favorites.filter((fav) => fav.id !== favoriteId);
    await this.saveFavorites(filteredFavorites);
    await this.updateTagCounts();
  }

  async removeFavoriteByUrl(url: string): Promise<void> {
    const favorites = await this.getFavorites();
    const filteredFavorites = favorites.filter((fav) => fav.url !== url);
    await this.saveFavorites(filteredFavorites);
    await this.updateTagCounts();
  }

  async isFavorite(url: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some((fav) => fav.url === url);
  }

  async updateFavoriteTags(favoriteId: string, tags: string[]): Promise<void> {
    const favorites = await this.getFavorites();
    const favorite = favorites.find((fav) => fav.id === favoriteId);
    if (favorite) {
      favorite.tags = [...new Set(tags)];
      await this.saveFavorites(favorites);
      await this.updateTagCounts();
    }
  }

  private async saveFavorites(favorites: FavoriteTab[]): Promise<void> {
    try {
      await this.getStorageService().set({ [this.favoritesKey]: favorites });
    } catch (error) {
      console.error("Error saving favorites:", error);
    }
  }

  // Tags management
  async getTags(): Promise<Tag[]> {
    try {
      const result = await this.getStorageService().get(this.tagsKey);
      return (result[this.tagsKey] as Tag[]) || [];
    } catch (error) {
      console.error("Error getting tags:", error);
      return [];
    }
  }

  async addTag(name: string, color?: string): Promise<Tag> {
    const tags = await this.getTags();
    const existingTag = tags.find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase()
    );

    if (existingTag) {
      return existingTag;
    }

    const tag: Tag = {
      id: `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      color: color || this.getRandomTagColor(),
      count: 0,
    };

    tags.push(tag);
    await this.saveTags(tags);
    return tag;
  }

  async updateTagCounts(): Promise<void> {
    const favorites = await this.getFavorites();
    const tags = await this.getTags();

    // Reset all counts
    tags.forEach((tag) => (tag.count = 0));

    // Count tag usage
    favorites.forEach((favorite) => {
      favorite.tags.forEach((tagName) => {
        const tag = tags.find(
          (t) => t.name.toLowerCase() === tagName.toLowerCase()
        );
        if (tag) {
          tag.count++;
        }
      });
    });

    await this.saveTags(tags);
  }

  async searchTags(query: string): Promise<Tag[]> {
    const tags = await this.getTags();
    if (!query.trim()) return tags;

    return tags
      .filter((tag) => tag.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b.count - a.count);
  }

  private async saveTags(tags: Tag[]): Promise<void> {
    try {
      await this.getStorageService().set({ [this.tagsKey]: tags });
    } catch (error) {
      console.error("Error saving tags:", error);
    }
  }

  private getRandomTagColor(): string {
    const colors = [
      "#ef4444",
      "#f97316",
      "#eab308",
      "#22c55e",
      "#06b6d4",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Filter favorites by tags
  async getFavoritesByTags(tags: string[]): Promise<FavoriteTab[]> {
    const favorites = await this.getFavorites();
    if (tags.length === 0) return favorites;

    return favorites.filter((favorite) =>
      tags.some((tag) =>
        favorite.tags.some(
          (favTag) => favTag.toLowerCase() === tag.toLowerCase()
        )
      )
    );
  }
}
