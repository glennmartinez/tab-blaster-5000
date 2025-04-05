export interface Tab {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
}

export interface SavedTab extends Tab {
  savedAt: string;
}
