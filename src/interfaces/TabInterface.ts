export interface Tab {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  windowId?: number; // Add windowId to track which window a tab belongs to
  index?: number; // Add index to track the tab's position in a window
}

export interface SavedTab extends Tab {
  savedAt: string;
}

export interface WindowInfo {
  id: number;
  title?: string;
  focused?: boolean;
  tabs: Tab[];
}
