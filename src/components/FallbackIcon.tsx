import { memo } from "react";
import { Globe } from "lucide-react";

interface FallbackIconProps {
  favIconUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const FallbackIcon = memo(
  ({ favIconUrl, size = "md", className = "" }: FallbackIconProps) => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    const iconSize = sizeClasses[size];

    if (!favIconUrl) {
      return <Globe className={`${iconSize} text-slate-400 ${className}`} />;
    }

    return (
      <div className="relative">
        <img
          src={favIconUrl}
          alt=""
          className={`${iconSize} ${className}`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement
              ?.querySelector(".fallback-icon")
              ?.classList.remove("hidden");
          }}
          loading="lazy"
        />
        <Globe
          className={`${iconSize} text-slate-400 fallback-icon hidden absolute inset-0 m-auto ${className}`}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    return (
      prevProps.favIconUrl === nextProps.favIconUrl &&
      prevProps.size === nextProps.size &&
      prevProps.className === nextProps.className
    );
  }
);

FallbackIcon.displayName = "FallbackIcon";

export default FallbackIcon;
