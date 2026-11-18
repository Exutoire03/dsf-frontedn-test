"use client";

import * as React from "react";
import { Search, ChevronRight } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { searchLocalities } from "@/lib/api";
import type { Locality } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSelect: (locality: Locality) => void;
}

export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Locality[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    let cancelled = false;

    const runSearch = async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setResults([]);
        setError(null);
        setOpen(false);
        setHighlightedIndex(-1);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await searchLocalities(debouncedQuery);
        if (!cancelled) {
          setResults(data);
          setOpen(data.length > 0);
          setHighlightedIndex(data.length > 0 ? 0 : -1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de rechercher des localites. Reessayez."
          );
          setResults([]);
          setOpen(false);
          setHighlightedIndex(-1);
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev >= results.length - 1 ? 0 : prev + 1
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev <= 0 ? results.length - 1 : prev - 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        setHighlightedIndex(-1);
        setError(null);
        break;
    }
  };

  const handleSelect = (locality: Locality) => {
    onSelect(locality);
    setQuery(locality.name);
    setResults([]);
    setOpen(false);
    setHighlightedIndex(-1);
  };

  const handleResultMouseEnter = (index: number) => {
    setHighlightedIndex(index);
  };

  return (
    <section aria-labelledby="search-heading">
      <h2 id="search-heading" className="sr-only">
        Rechercher une localite au Benin
      </h2>

      <div className="relative w-full max-w-2xl">
        <label htmlFor="locality-search" className="sr-only">
          Rechercher une ville ou une commune au Benin
        </label>
        <div className="flex items-center">
          <Search
            className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            id="locality-search"
            role="combobox"
            aria-expanded={open}
            aria-controls="locality-results"
            aria-activedescendant={
              highlightedIndex >= 0
                ? `locality-result-${highlightedIndex}`
                : undefined
            }
            placeholder="Ex: Cotonou, Parakou, Porto-Novo…"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setOpen(results.length > 0)}
            onKeyDown={handleKeyDown}
            className="pl-10 placeholder:text-foreground/60"
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
          <div
            role="alert"
            className="mt-2 p-3 rounded-lg border border-destructive/50 bg-destructive/50 text-destructive text-sm"
          >
            {error}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setQuery("");
                setResults([]);
                setOpen(false);
                setHighlightedIndex(-1);
              }}
              className="ml-2 text-destructive underline underline-offset-4 hover:text-destructive/90 text-xs font-medium"
            >
              Fermer
            </button>
          </div>
        )}

        {open && results.length > 0 && (
          <div
            id="locality-results"
            role="listbox"
            aria-label="Resultats de recherche"
            className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg max-h-64 overflow-y-auto"
          >
            {results.map((locality, index) => (
              <button
                key={locality.id}
                id={`locality-result-${index}`}
                type="button"
                role="option"
                aria-selected={highlightedIndex === index}
                onClick={() => handleSelect(locality)}
                onMouseEnter={() => handleResultMouseEnter(index)}
                className={cnListboxItem(highlightedIndex === index)}
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
                <ChevronRight
                  className="w-3 h-3 text-muted-foreground"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        )}

        {open && results.length > 0 && (
          <div
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {results.length} localite{results.length > 1 ? "s" : ""} trouvee{
              results.length > 1 ? "s" : ""
            }. Utilisez les fleches pour naviguer, Entree pour selectionner.
          </div>
        )}

        {query.trim().length >= 2 && !loading && !error && results.length === 0 && (
          <div
            role="status"
            className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg p-3 text-sm text-muted-foreground"
          >
            Aucune localite trouvee au Benin.
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-foreground">
        Tapez au moins 2 caracteres pour rechercher une ville ou une commune du
        Benin.
      </p>
    </section>
  );
}

function cnListboxItem(isSelected: boolean): string {
  return cn(
    "w-full flex items-center justify-between px-4 py-3 text-left transition-colors outline-none",
    isSelected
      ? "bg-primary text-primary-foreground"
      : "hover:bg-secondary focus:bg-secondary"
  );
}
