import {
  Bookmark,
  BookmarkTreeNode,
  BookmarkFolder,
} from "../interfaces/BookmarkInterface";
import { ChromeService } from "../services/ChromeService";

/**
 * Controller for bookmark-related operations
 */
export class BookmarkController {
  /**
   * Get all bookmarks
   */
  static async getBookmarks(): Promise<BookmarkTreeNode[]> {
    return await ChromeService.getBookmarks();
  }

  /**
   * Search bookmarks by query
   */
  static async searchBookmarks(query: string): Promise<Bookmark[]> {
    return await ChromeService.searchBookmarks(query);
  }

  /**
   * Create a new bookmark
   */
  static async createBookmark(bookmark: {
    parentId?: string;
    title: string;
    url?: string;
  }): Promise<Bookmark> {
    return await ChromeService.createBookmark(bookmark);
  }

  /**
   * Flatten bookmark tree into a list of folders and bookmarks
   */
  static flattenBookmarks(nodes: BookmarkTreeNode[]): {
    folders: BookmarkFolder[];
    bookmarks: Bookmark[];
  } {
    const folders: BookmarkFolder[] = [];
    const bookmarks: Bookmark[] = [];

    const processNode = (node: BookmarkTreeNode) => {
      if (node.children && node.children.length > 0) {
        // This is a folder
        const folderBookmarks: Bookmark[] = [];

        for (const child of node.children) {
          if (child.url) {
            // This is a bookmark
            folderBookmarks.push({
              id: child.id,
              title: child.title,
              url: child.url,
              dateAdded: child.dateAdded,
              parentId: node.id,
            });
          } else if (child.children) {
            // This is a subfolder - process recursively
            processNode(child);
          }
        }

        if (folderBookmarks.length > 0) {
          folders.push({
            id: node.id,
            title: node.title,
            children: folderBookmarks,
          });
        }

        // Also add individual bookmarks to the main list
        bookmarks.push(...folderBookmarks);
      }
    };

    for (const node of nodes) {
      processNode(node);
    }

    return { folders, bookmarks };
  }

  /**
   * Get recent bookmarks (last 20)
   */
  static async getRecentBookmarks(limit: number = 20): Promise<Bookmark[]> {
    const allNodes = await this.getBookmarks();
    const { bookmarks } = this.flattenBookmarks(allNodes);

    return bookmarks
      .filter((bookmark) => bookmark.dateAdded)
      .sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0))
      .slice(0, limit);
  }

  /**
   * Get bookmarks organized by folders
   */
  static async getBookmarkFolders(): Promise<BookmarkFolder[]> {
    const allNodes = await this.getBookmarks();
    const { folders } = this.flattenBookmarks(allNodes);
    return folders;
  }
}
