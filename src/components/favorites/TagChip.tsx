import React from "react";
import { Hash } from "lucide-react";

interface TagChipProps {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export const TagChip: React.FC<TagChipProps> = ({
  name,
  color,
  size = "md",
  onClick,
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2 py-1 text-sm",
    lg: "px-3 py-1 text-sm",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border transition-colors
        ${sizeClasses[size]}
        ${onClick ? "cursor-pointer hover:bg-white/10" : ""}
        ${
          color
            ? "text-white border-white/20"
            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
        }
      `}
      style={
        color
          ? {
              backgroundColor: `${color}20`,
              borderColor: `${color}50`,
              color: color,
            }
          : undefined
      }
      onClick={onClick}
    >
      <Hash className={iconSizes[size]} />
      {name}
    </span>
  );
};
