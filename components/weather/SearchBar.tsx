"use client";

import * as React from "react";
import { Search, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchLocalities } from "@/lib/api";
import type { Locality } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSelect: (locality: Locality) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Locality[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    let cancelled = false;

    const runSearch = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setResults([]);
        setError(null);
        setOpen(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await searchLocalities(debouncedQuery);
        if (!cancelled) {
          setResults(data);
          setOpen(data.length > 0);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de rechercher des localités. Réessayez."
          );
          setResults([]);
          setOpen(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setError(null);
  };

  const handleSelect = (locality: Locality) => {
    onSelect(locality);
    setQuery(locality.name);
    setResults([]);
    setOpen(false);
  };

  return (
    <section aria-labelledby="search-heading">
      <h2 id="search-heading" className="sr-only">
        Rechercher une localité au Bénin
      </h2>

      <div className="relative w-full max-w-2xl">
        <label htmlFor="locality-search" className="sr-only">
          Rechercher une ville ou une commune au Bénin
        </label>
        <div className="flex items-center">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <Input
            id="locality-search"
            placeholder="Ex: Cotonou, Parakou, Porto-Novo…"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setOpen(results.length > 0)}
            className="pl-10"
            disabled={loading}
          />
          {loading && (
            <button
              type="button"
              disabled
              aria-label="Chargement de la recherche"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground"
            >
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </button>
          )}
        </div>

        {error && (
          <div className="mt-2 p-3 rounded-lg border border-destructive/50 bg-destructive/50 text-destructive text-sm">
            {error}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setQuery("");
                setResults([]);
                setOpen(false);
              }}
              className="ml-2 text-destructive underline underline-offset-4 hover:text-destructive/90 text-xs font-medium"
            >
              Fermer
            </button>
          </div>
        )}

        {open && results.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
            {results.map((locality) => (
              <button
                key={locality.id}
                type="button"
                onClick={() => handleSelect(locality)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary focus:outline-none focus:bg-secondary transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{locality.name}</span>
                  {locality.department && (
                    <span className="text-xs text-muted-foreground">
                      {locality.department}
                    </span>
                  )}
                  {locality.population && (
                    <span className="text-xs text-muted-foreground">
                      {locality.population.toLocaleString("fr-FR")} habitants
                    </span>
                  )}
                </div>
                <ChevronRight className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}

        {query.trim().length >= 2 && !loading && !error && results.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg p-3 text-sm text-muted-foreground">
            Aucune localité trouvée au Bénin.
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Tapez au moins 2 caractères pour rechercher une ville ou une commune du
        Bénin.
      </p>
    </section>
  );
}
