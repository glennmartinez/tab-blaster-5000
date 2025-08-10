import React, { useState } from "react";
import { Star } from "lucide-react";

interface PriorityStarsProps {
  priority: number;
  onChange?: (priority: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export const PriorityStars: React.FC<PriorityStarsProps> = ({
  priority,
  onChange,
  readonly = false,
  size = "sm",
}) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const handleStarClick = (starIndex: number) => {
    if (!readonly && onChange) {
      onChange(starIndex + 1);
    }
  };

  const handleStarHover = (starIndex: number) => {
    if (!readonly) {
      setHoveredStar(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredStar(null);
    }
  };

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={handleMouseLeave}>
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const isFilled =
          starIndex < (hoveredStar !== null ? hoveredStar + 1 : priority);

        return (
          <button
            key={starIndex}
            onClick={() => handleStarClick(starIndex)}
            onMouseEnter={() => handleStarHover(starIndex)}
            disabled={readonly}
            className={`
              transition-colors duration-150
              ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}
              ${!readonly ? "hover:text-yellow-400" : ""}
            `}
          >
            <Star
              className={`
                ${sizeClasses[size]}
                ${
                  isFilled
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-slate-600"
                }
                transition-all duration-150
              `}
            />
          </button>
        );
      })}
      {!readonly && (
        <span className="ml-2 text-xs text-slate-400">({priority}/5)</span>
      )}
    </div>
  );
};
