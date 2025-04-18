import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

/**
 * Reusable search bar component
 * Responsible for capturing user search input and passing it to parent components
 */
const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search...",
  initialValue = "",
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-md bg-slate-700/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-white placeholder-slate-400"
        value={searchQuery}
        onChange={handleChange}
      />
    </div>
  );
};

export default SearchBar;
