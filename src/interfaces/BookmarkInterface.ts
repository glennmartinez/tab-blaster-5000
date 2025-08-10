/**
 * Bookmark interfaces for Chrome bookmarks API
 */

export interface Bookmark {
  id: string;
  parentId?: string;
  title: string;
  url?: string;
  dateAdded?: number;
  dateGroupModified?: number;
  children?: Bookmark[];
}

export interface BookmarkTreeNode {
  id: string;
  parentId?: string;
  index?: number;
  url?: string;
  title: string;
  dateAdded?: number;
  dateGroupModified?: number;
  children?: BookmarkTreeNode[];
}

export interface BookmarkFolder {
  id: string;
  title: string;
  children: Bookmark[];
  isExpanded?: boolean;
}
