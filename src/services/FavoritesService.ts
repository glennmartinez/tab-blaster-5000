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
  priority: number; // 1-5 scale, default 3
  usage: {
    visitCount: number; // Track how often visited
    lastAccess: Date | null; // Timestamp of last visit
  };
  calculatedScore: number; // Derived from priority + usage (update dynamically)
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

      // Convert dateAdded strings back to Date objects and ensure backward compatibility
      return favorites.map((fav) => ({
        ...fav,
        dateAdded: new Date(fav.dateAdded),
        priority: fav.priority ?? 3, // Default priority for existing items
        usage: fav.usage ?? { visitCount: 0, lastAccess: null }, // Default usage for existing items
        calculatedScore: fav.calculatedScore ?? 0, // Default score for existing items
      }));
    } catch (error) {
      console.error("Error getting favorites:", error);
      return [];
    }
  }

  async addFavorite(
    tab: { id?: number; title: string; url: string; favicon?: string },
    tags: string[] = [],
    priority: number = 3
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
      favorites[existingIndex].priority = priority;
      await this.saveFavorites(favorites);
      await this.updateTagCounts();
      await this.recalculateScores();
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
      priority: priority, // Use provided priority
      usage: {
        visitCount: 0,
        lastAccess: null,
      },
      calculatedScore: 0, // Will be calculated
    };

    favorites.push(favorite);
    await this.saveFavorites(favorites);
    await this.updateTagCounts();
    await this.recalculateScores();
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

  // Priority and scoring methods
  async updateFavoritePriority(
    favoriteId: string,
    priority: number
  ): Promise<void> {
    const favorites = await this.getFavorites();
    const favorite = favorites.find((fav) => fav.id === favoriteId);
    if (favorite) {
      favorite.priority = Math.max(1, Math.min(5, priority)); // Ensure 1-5 range
      await this.saveFavorites(favorites);
      await this.recalculateScores();
    }
  }

  async trackVisit(url: string): Promise<void> {
    const favorites = await this.getFavorites();
    const favorite = favorites.find((fav) => fav.url === url);
    if (favorite) {
      favorite.usage.visitCount++;
      favorite.usage.lastAccess = new Date();
      await this.saveFavorites(favorites);
      await this.recalculateScores();
    }
  }

  async recalculateScores(): Promise<void> {
    const favorites = await this.getFavorites();
    if (favorites.length === 0) return;

    // Find max visit count for normalization
    const maxVisitCount = Math.max(
      ...favorites.map((fav) => fav.usage.visitCount),
      1
    );

    favorites.forEach((favorite) => {
      const normalizedVisitCount = favorite.usage.visitCount / maxVisitCount;

      // Calculate recency factor
      let recencyFactor = 0;
      if (favorite.usage.lastAccess) {
        const daysSinceLastAccess =
          (Date.now() - favorite.usage.lastAccess.getTime()) /
          (1000 * 60 * 60 * 24);
        if (daysSinceLastAccess < 7) {
          recencyFactor = 1;
        } else if (daysSinceLastAccess < 30) {
          recencyFactor = 0.5;
        }
      }

      // Calculate score: priority (50%) + frequency (30%) + recency (20%)
      favorite.calculatedScore =
        favorite.priority * 0.5 +
        normalizedVisitCount * 0.3 +
        recencyFactor * 0.2;
    });

    await this.saveFavorites(favorites);
  }

  // Get favorites sorted by calculated score
  async getFavoritesByScore(): Promise<FavoriteTab[]> {
    const favorites = await this.getFavorites();
    return favorites.sort((a, b) => b.calculatedScore - a.calculatedScore);
  }

  // Get smart groups
  async getSmartGroups(): Promise<{ [key: string]: FavoriteTab[] }> {
    const favorites = await this.getFavorites();
    await this.recalculateScores(); // Ensure scores are up to date

    const sortedByScore = favorites.sort(
      (a, b) => b.calculatedScore - a.calculatedScore
    );
    const sortedByRecent = favorites
      .filter((fav) => fav.usage.lastAccess)
      .sort((a, b) => {
        const aTime = a.usage.lastAccess?.getTime() || 0;
        const bTime = b.usage.lastAccess?.getTime() || 0;
        return bTime - aTime;
      });

    return {
      "Most Frequent": sortedByScore.slice(0, 10),
      "High Priority": favorites.filter((fav) => fav.calculatedScore > 3.5),
      Recent: sortedByRecent.slice(0, 10),
    };
  }

  // Get favorites grouped by tags
  async getFavoritesGroupedByTags(): Promise<{ [key: string]: FavoriteTab[] }> {
    const favorites = await this.getFavorites();
    const groups: { [key: string]: FavoriteTab[] } = {};

    // Group by tags
    favorites.forEach((favorite) => {
      if (favorite.tags.length === 0) {
        if (!groups["Other"]) groups["Other"] = [];
        groups["Other"].push(favorite);
      } else {
        favorite.tags.forEach((tag) => {
          if (!groups[tag]) groups[tag] = [];
          groups[tag].push(favorite);
        });
      }
    });

    return groups;
  }

  // Integration with session analytics
  async getCombinedAnalytics(): Promise<{
    favoriteUrls: Set<string>;
    sessionUrls: Set<string>;
    bothFavoriteAndSession: Set<string>;
  }> {
    const [favorites, sessions] = await Promise.all([
      this.getFavorites(),
      this.getStorageService().fetchSessions(),
    ]);

    const favoriteUrls = new Set(favorites.map(fav => fav.url));
    const sessionUrls = new Set<string>();

    sessions.forEach(session => {
      if (session.tabs && Array.isArray(session.tabs)) {
        session.tabs.forEach(tab => {
          if (tab.url) {
            sessionUrls.add(tab.url);
          }
        });
      }
    });

    const bothFavoriteAndSession = new Set(
      [...favoriteUrls].filter(url => sessionUrls.has(url))
    );

    return {
      favoriteUrls,
      sessionUrls,
      bothFavoriteAndSession,
    };
  }

  // Get enhanced smart groups that include session data
  async getEnhancedSmartGroups(): Promise<{ [key: string]: FavoriteTab[] }> {
    const [favorites, combinedAnalytics] = await Promise.all([
      this.getFavorites(),
      this.getCombinedAnalytics(),
    ]);

    await this.recalculateScores(); // Ensure scores are up to date

    const sortedByScore = favorites.sort(
      (a, b) => b.calculatedScore - a.calculatedScore
    );
    const sortedByRecent = favorites
      .filter((fav) => fav.usage.lastAccess)
      .sort((a, b) => {
        const aTime = a.usage.lastAccess?.getTime() || 0;
        const bTime = b.usage.lastAccess?.getTime() || 0;
        return bTime - aTime;
      });

    // Filter favorites that are also in sessions
    const crossPlatformFavorites = favorites.filter(fav => 
      combinedAnalytics.bothFavoriteAndSession.has(fav.url)
    );

    return {
      "Most Frequent": sortedByScore.slice(0, 10),
      "High Priority": favorites.filter((fav) => fav.calculatedScore > 3.5),
      "Recent": sortedByRecent.slice(0, 10),
      "Cross-Platform": crossPlatformFavorites.sort((a, b) => b.calculatedScore - a.calculatedScore),
    };
  }
}
