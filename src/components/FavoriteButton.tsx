import React, { useState } from "react";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface FavoriteButtonProps {
  id: string;
  name: string;
  type: "team" | "driver" | "event";
  variant?: "default" | "icon";
}

export function FavoriteButton({ id, name, type, variant = "default" }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(() => {
    const favorites = localStorage.getItem("favorites");
    if (favorites) {
      const parsed = JSON.parse(favorites);
      return parsed.includes(id);
    }
    return false;
  });

  const toggleFavorite = () => {
    const favorites = localStorage.getItem("favorites");
    let parsed = favorites ? JSON.parse(favorites) : [];

    if (isFavorite) {
      parsed = parsed.filter((fav: string) => fav !== id);
      toast.success("Removido dos favoritos", {
        description: `${name} foi removido da sua lista`,
      });
    } else {
      parsed.push(id);
      toast.success("Adicionado aos favoritos", {
        description: `${name} foi adicionado à sua lista`,
      });
    }

    localStorage.setItem("favorites", JSON.stringify(parsed));
    setIsFavorite(!isFavorite);
  };

  if (variant === "icon") {
    return (
      <Button
        onClick={toggleFavorite}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
      >
        <Heart
          className={`h-4 w-4 transition-all ${
            isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
          }`}
        />
      </Button>
    );
  }

  return (
    <Button
      onClick={toggleFavorite}
      variant={isFavorite ? "default" : "outline"}
      size="sm"
      className={isFavorite ? "bg-red-500 hover:bg-red-600" : ""}
    >
      <Heart
        className={`h-4 w-4 mr-1 transition-all ${
          isFavorite ? "fill-white" : ""
        }`}
      />
      {isFavorite ? "Favorito" : "Favoritar"}
    </Button>
  );
}
