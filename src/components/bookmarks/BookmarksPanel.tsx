import React, { useState } from "react";
import {
  Bookmark,
  Search,
  ExternalLink,
  Plus,
  ChevronDown,
  ChevronRight,
  Folder,
  Clock,
} from "lucide-react";
import { Bookmark as BookmarkType } from "../../interfaces/BookmarkInterface";
import { useBookmarks } from "../../hooks/useBookmarks";

interface BookmarksPanelProps {
  className?: string;
}

const BookmarksPanel: React.FC<BookmarksPanelProps> = ({ className = "" }) => {
  const {
    bookmarkFolders,
    recentBookmarks,
    loading,
    error,
    searchBookmarks,
    openBookmark,
  } = useBookmarks();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<BookmarkType[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [activeView, setActiveView] = useState<"recent" | "folders" | "search">(
    "recent"
  );

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setActiveView("search");
      const results = await searchBookmarks(query);
      setSearchResults(results);
    } else {
      setActiveView("recent");
      setSearchResults([]);
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const BookmarkItem: React.FC<{ bookmark: BookmarkType }> = ({ bookmark }) => (
    <div
      className="flex items-center p-2 hover:bg-slate-700/30 rounded cursor-pointer group"
      onClick={() => openBookmark(bookmark)}
    >
      <div className="flex-shrink-0 mr-3">
        {bookmark.url ? (
          <img
            src={`https://www.google.com/s2/favicons?domain=${
              new URL(bookmark.url).hostname
            }&sz=16`}
            alt=""
            className="w-4 h-4"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjMzc0MTUxIiByeD0iMiIvPgo8L3N2Zz4K";
            }}
          />
        ) : (
          <Bookmark className="w-4 h-4 text-cyan-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-300 truncate">
          {bookmark.title}
        </p>
        {bookmark.url && (
          <p className="text-xs text-slate-500 truncate">
            {new URL(bookmark.url).hostname}
          </p>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500">Loading bookmarks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="text-red-400">Error loading bookmarks</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-cyan-400">Bookmarks</h2>
        <Plus className="w-4 h-4 text-slate-400 hover:text-cyan-400 cursor-pointer" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search bookmarks..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* View Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => {
            setActiveView("recent");
            setSearchQuery("");
            setSearchResults([]);
          }}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            activeView === "recent"
              ? "bg-cyan-600 text-white"
              : "bg-slate-800/50 text-slate-400 hover:text-cyan-400"
          }`}
        >
          <Clock className="w-3 h-3 inline mr-1" />
          Recent
        </button>
        <button
          onClick={() => setActiveView("folders")}
          className={`px-3 py-1 text-xs rounded-full transition-colors ${
            activeView === "folders"
              ? "bg-cyan-600 text-white"
              : "bg-slate-800/50 text-slate-400 hover:text-cyan-400"
          }`}
        >
          <Folder className="w-3 h-3 inline mr-1" />
          Folders
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {activeView === "search" && searchResults.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-slate-500 mb-2">
              {searchResults.length} result
              {searchResults.length !== 1 ? "s" : ""}
            </div>
            {searchResults.map((bookmark) => (
              <BookmarkItem key={bookmark.id} bookmark={bookmark} />
            ))}
          </div>
        )}

        {activeView === "search" &&
          searchQuery &&
          searchResults.length === 0 && (
            <div className="text-center py-4 text-slate-500">
              No bookmarks found for "{searchQuery}"
            </div>
          )}

        {activeView === "recent" && (
          <div className="space-y-1">
            {recentBookmarks.length > 0 ? (
              recentBookmarks.map((bookmark) => (
                <BookmarkItem key={bookmark.id} bookmark={bookmark} />
              ))
            ) : (
              <div className="text-center py-4 text-slate-500">
                No recent bookmarks
              </div>
            )}
          </div>
        )}

        {activeView === "folders" && (
          <div className="space-y-1">
            {bookmarkFolders.length > 0 ? (
              bookmarkFolders.map((folder) => (
                <div key={folder.id}>
                  <div
                    className="flex items-center p-2 hover:bg-slate-700/30 rounded cursor-pointer"
                    onClick={() => toggleFolder(folder.id)}
                  >
                    {expandedFolders.has(folder.id) ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 mr-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 mr-2" />
                    )}
                    <Folder className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-sm font-medium text-slate-300">
                      {folder.title}
                    </span>
                    <span className="ml-auto text-xs text-slate-500">
                      {folder.children.length}
                    </span>
                  </div>
                  {expandedFolders.has(folder.id) && (
                    <div className="ml-6 space-y-1">
                      {folder.children.map((bookmark) => (
                        <BookmarkItem key={bookmark.id} bookmark={bookmark} />
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-500">
                No bookmark folders
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

BookmarksPanel.displayName = "BookmarksPanel";

export default BookmarksPanel;
