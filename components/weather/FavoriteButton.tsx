import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  localityName: string;
  className?: string;
}

export function FavoriteButton({
  isFavorite,
  onToggle,
  localityName,
  className,
}: FavoriteButtonProps) {
  const label = isFavorite
    ? `Retirer ${localityName} des favoris`
    : `Ajouter ${localityName} aux favoris`;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className={cn(
        "relative inline-flex items-center justify-center w-10 h-10 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        isFavorite
          ? "bg-amber-500 text-amber-foreground hover:bg-amber-600 shadow-sm"
          : "bg-background border border-border text-muted-foreground hover:bg-secondary hover:text-primary shadow-sm",
        className
      )}
    >
      <Star
        className={cn(
          "w-5 h-5 fill-current transition-transform duration-200",
          isFavorite ? "scale-110 text-amber-600" : "text-muted-foreground"
        )}
        aria-hidden="true"
      />
      {isFavorite && (
        <span className="absolute -top-1 -right-1 flex h-[10px] w-[10px] items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground font-bold ring-1 ring-background">
          +
        </span>
      )}
    </button>
  );
}
