import { useCallback, useEffect, useState } from "react";
import type { Locality } from "@/types";

const STORAGE_KEY = "meteo_benin_favorites";

/**
 * Gère la liste des localités favorites stockée dans le navigateur (localStorage).
 * Une localité ne figure qu'une seule fois, même si on l'ajoute plusieurs fois.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Locality[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch {
      // En cas d'erreur de lecture, on part d'une liste vide.
      setFavorites([]);
    }
  }, []);

  const persist = useCallback((next: Locality[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage indisponible (mode privé par exemple), on ignore silencieusement.
    }
  }, []);

  const add = useCallback((locality: Locality) => {
    setFavorites((prev: Locality[]) => {
      const exists = prev.some((f: Locality) => f.id === locality.id);
      if (exists) return prev;
      const next = [...prev, locality];
      persist(next);
      return next;
    });
  }, [persist]);

  const remove = useCallback((id: string) => {
    setFavorites((prev: Locality[]) => {
      const next = prev.filter((f: Locality) => f.id !== id);
      persist(next);
      return next;
    });
  }, [persist]);

  const isFavorite = useCallback(
    (id: string) => favorites.some((f: Locality) => f.id === id),
    [favorites]
  );

  return { favorites, add, remove, isFavorite };
}
