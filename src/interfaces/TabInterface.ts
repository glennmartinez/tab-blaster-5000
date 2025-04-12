export interface Tab {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  windowId?: number; // Add windowId to track which window a tab belongs to
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
