/**
 * Tab information interface
 */
export interface Tab {
  id: number;
  title?: string;
  url?: string;
  favIconUrl?: string;
  windowId: number;
  index: number;
}

/**
 * Saved tab information interface with additional metadata
 */
export interface SavedTab extends Tab {
  savedAt: string;
}

/**
 * Window information interface
 */
export interface WindowInfo {
  id: number;
  focused: boolean;
  tabs: Tab[];
}
