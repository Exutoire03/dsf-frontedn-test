"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "./SearchBar";
import { CurrentWeather } from "./CurrentWeather";
import { DailyForecast } from "./DailyForecast";
import { FavoriteButton } from "./FavoriteButton";
import { RetryButton } from "./RetryButton";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFavorites } from "@/hooks/useFavorites";
import { useWeather } from "@/hooks/useWeather";
import { searchLocalities } from "@/lib/api";
import { type Locality } from "@/types";

function WeatherSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-3/4 rounded-md bg-muted animate-pulse" />
      <div className="h-20 w-1/2 rounded-md bg-muted animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-12 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-12 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-12 w-full rounded-md bg-muted animate-pulse" />
        <div className="h-12 w-full rounded-md bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="h-32 rounded-xl border border-border bg-muted animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export function WeatherApp({
  initialLocality,
}: {
  initialLocality?: string;
}) {
  const router = useRouter();

  const [selectedLocality, setSelectedLocality] = React.useState<Locality | null>(
    null
  );
  const [urlLoading, setUrlLoading] = React.useState(false);
  const [urlError, setUrlError] = React.useState<string | null>(null);

  const { favorites, add, remove, isFavorite } = useFavorites();
  const { data, loading, error, load, retry } = useWeather();

  // Au montage, si une localité est passee dans l'URL, on la charge directement.
  React.useEffect(() => {
    if (!initialLocality) return;

    let cancelled = false;

    const run = async () => {
      setUrlLoading(true);
      setUrlError(null);

      try {
        const results = await searchLocalities(initialLocality);
        if (cancelled) return;

        if (results.length === 0) {
          setUrlError("Aucune localite trouvee pour cette adresse.");
          setUrlLoading(false);
          return;
        }

        const locality = results[0];
        setSelectedLocality(locality);
        load(locality);
      } catch {
        if (cancelled) return;
        setUrlError("Impossible de charger la localite depuis cette adresse.");
      } finally {
        if (!cancelled) setUrlLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [initialLocality, load]);

  const localityToLoad = selectedLocality ?? (data ? data.locality : null);
  const isFav = localityToLoad ? isFavorite(localityToLoad.id) : false;

  const handleLocalitySelect = (locality: Locality) => {
    setSelectedLocality(locality);
    load(locality);
    // Met a jour l'adresse dans la barre du navigateur sans recharger la page.
    // Ainsi, l'URL reste partageable.
    router.replace(`?locality=${encodeURIComponent(locality.name)}`);
  };

  const handleToggleFavorite = () => {
    if (!localityToLoad) return;
    if (isFav) {
      remove(localityToLoad.id);
    } else {
      add(localityToLoad);
    }
  };

  const handleRetry = () => {
    retry();
  };

  // Etat de chargement lorsqu'on vient d'une URL partageable.
  if (urlLoading && !data) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SearchBar onSelect={handleLocalitySelect} />
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Chargement depuis l'adresse…
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeatherSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (urlError && !data) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SearchBar onSelect={handleLocalitySelect} />
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Adresse introuvable
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">{urlError}</p>
            <RetryButton onRetry={handleRetry} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SearchBar onSelect={handleLocalitySelect} />
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Chargement de la meteo…</CardTitle>
          </CardHeader>
          <CardContent>
            <WeatherSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SearchBar onSelect={handleLocalitySelect} />
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Impossible de charger la meteo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">{error}</p>
            <RetryButton onRetry={handleRetry} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SearchBar onSelect={handleLocalitySelect} />
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Bienvenue sur Meteo Benin</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-6 text-muted-foreground max-w-md">
              Recherchez une ville ou une commune du Benin pour consulter la
              meteo actuelle et les previsions sur 7 jours.
            </p>
            <p className="text-xs text-muted-foreground">
              Les donnees proviennent de Open-Meteo, un service public gratuit.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { locality, current, daily } = data;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">🇧🇯</span>
          <div>
            <h1 className="text-xl font-bold">Meteo Benin</h1>
            <p className="text-xs text-muted-foreground">
              Previsions locales pour les collectivites
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <FavoriteButton
            isFavorite={isFav}
            onToggle={handleToggleFavorite}
            localityName={locality.name}
          />
        </div>
      </header>

      <SearchBar onSelect={handleLocalitySelect} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{locality.name}</CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {locality.department && <span>{locality.department}</span>}
              {locality.population && (
                <>
                  <span> . </span>
                  <span>{locality.population.toLocaleString("fr-FR")} habitants</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-secondary text-secondary-foreground rounded-full px-2 py-1 uppercase tracking-tighter">
              Benin
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <CurrentWeather data={current} localityName={locality.name} />
          <DailyForecast data={daily} />
        </CardContent>
      </Card>

      {favorites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vos localites favorites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {favorites.map((fav) => (
                <button
                  key={fav.id}
                  type="button"
                  onClick={() => {
                    setSelectedLocality(fav);
                    load(fav);
                    router.replace(`?locality=${encodeURIComponent(fav.name)}`);
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <span className="text-sm font-medium">{fav.name}</span>
                  <span className="text-xs text-muted-foreground">{fav.department}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <footer className="mt-8 pt-4 border-t border-border text-xs text-muted-foreground text-center">
        Donnees fournies par{" "}
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Open-Meteo
        </a>
        {" . "}
        <a
          href="https://geocoding-api.open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Open-Meteo Geocodage
        </a>
      </footer>
    </div>
  );
}
