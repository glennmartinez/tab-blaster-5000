import React from "react";
import { BookmarkCheck, Moon, Search, Sun } from "lucide-react";

interface FuturisticHeaderProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
  currentTime: Date;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Header: React.FC<FuturisticHeaderProps> = ({
  theme,
  toggleTheme,
  currentTime,
  searchQuery,
  setSearchQuery,
}) => {
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className="flex items-center justify-between py-2 border-b border-slate-700/50 mb-4"
      data-component="Header"
    >
      <div className="flex items-center space-x-2">
        <BookmarkCheck className="h-6 w-6 text-cyan-500" />
        <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
          Tab Blaster 5000
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tabs..."
            className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-slate-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="text-cyan-500 font-mono text-sm">
          {formatTime(currentTime)}
        </div>

        <button
          className="p-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-slate-100"
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};

Header.displayName = "Header";

export default Header;
