import { useState, useEffect, useCallback } from "react";
import { Bookmark, BookmarkFolder } from "../interfaces/BookmarkInterface";
import { BookmarkController } from "../controllers/BookmarkController";

/**
 * Hook to provide bookmark-related data and operations
 */
export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [bookmarkFolders, setBookmarkFolders] = useState<BookmarkFolder[]>([]);
  const [recentBookmarks, setRecentBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all bookmarks
   */
  const fetchBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bookmarkNodes = await BookmarkController.getBookmarks();
      const { bookmarks: allBookmarks } =
        BookmarkController.flattenBookmarks(bookmarkNodes);
      setBookmarks(allBookmarks);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch bookmarks")
      );
      console.error("Error fetching bookmarks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch bookmark folders
   */
  const fetchBookmarkFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const folders = await BookmarkController.getBookmarkFolders();
      setBookmarkFolders(folders);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch bookmark folders")
      );
      console.error("Error fetching bookmark folders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch recent bookmarks
   */
  const fetchRecentBookmarks = useCallback(async (limit: number = 10) => {
    try {
      const recent = await BookmarkController.getRecentBookmarks(limit);
      setRecentBookmarks(recent);
    } catch (err) {
      console.error("Error fetching recent bookmarks:", err);
    }
  }, []);

  /**
   * Search bookmarks
   */
  const searchBookmarks = useCallback(
    async (query: string): Promise<Bookmark[]> => {
      try {
        return await BookmarkController.searchBookmarks(query);
      } catch (err) {
        console.error("Error searching bookmarks:", err);
        return [];
      }
    },
    []
  );

  /**
   * Create a new bookmark
   */
  const createBookmark = useCallback(
    async (bookmark: { parentId?: string; title: string; url?: string }) => {
      try {
        const newBookmark = await BookmarkController.createBookmark(bookmark);
        // Refresh bookmarks after creation
        await fetchBookmarks();
        await fetchRecentBookmarks();
        return newBookmark;
      } catch (err) {
        console.error("Error creating bookmark:", err);
        throw err;
      }
    },
    [fetchBookmarks, fetchRecentBookmarks]
  );

  /**
   * Open a bookmark URL
   */
  const openBookmark = useCallback((bookmark: Bookmark) => {
    if (bookmark.url) {
      if (chrome?.tabs) {
        chrome.tabs.create({ url: bookmark.url });
      } else {
        window.open(bookmark.url, "_blank");
      }
    }
  }, []);

  // Load bookmarks on mount
  useEffect(() => {
    fetchBookmarks();
    fetchBookmarkFolders();
    fetchRecentBookmarks();
  }, [fetchBookmarks, fetchBookmarkFolders, fetchRecentBookmarks]);

  return {
    bookmarks,
    bookmarkFolders,
    recentBookmarks,
    loading,
    error,
    fetchBookmarks,
    fetchBookmarkFolders,
    fetchRecentBookmarks,
    searchBookmarks,
    createBookmark,
    openBookmark,
  };
};
