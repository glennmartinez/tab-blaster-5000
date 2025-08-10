import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "../../hooks/useFavorites";

interface FavoriteButtonProps {
  tab: {
    id?: number;
    title: string;
    url: string;
    favicon?: string;
  };
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  tab,
  className = "",
}) => {
  const { getFavoriteState, toggleFavorite } = useFavorites();

  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check favorite status
  useEffect(() => {
    const favoriteData = getFavoriteState(tab.url);
    setIsFavorited(!!favoriteData);
  }, [tab.url, getFavoriteState]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    try {
      const newState = await toggleFavorite(tab);
      setIsFavorited(newState);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <span
      onClick={handleToggleFavorite}
      className={`flex-shrink-0 p-1 text-slate-400 hover:text-pink-400 rounded-full transition-colors cursor-pointer ${
        isFavorited ? "text-pink-500" : ""
      } ${className}`}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
      data-component="FavoriteButton"
      data-testid="favorite-button"
      data-favorited={isFavorited}
    >
      <Heart
        className={`w-4 h-4 transition-all duration-200 ${
          isFavorited ? "fill-current scale-110" : ""
        } ${isLoading ? "animate-pulse" : ""}`}
      />
    </span>
  );
};

FavoriteButton.displayName = "FavoriteButton";

export default FavoriteButton;
