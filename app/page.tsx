"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/weather/SearchBar";
import { CurrentWeather } from "@/components/weather/CurrentWeather";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { FavoriteButton } from "@/components/weather/FavoriteButton";
import { RetryButton } from "@/components/weather/RetryButton";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFavorites } from "@/hooks/useFavorites";
import { useWeather } from "@/hooks/useWeather";
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
          <div key={i} className="h-32 rounded-xl border border-border bg-muted animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const searchParams = useSearchParams();
  const urlLocality = searchParams.get("locality");

  const [selectedLocality, setSelectedLocality] = React.useState<Locality | null>(
    null
  );

  const { favorites, add, remove, isFavorite } = useFavorites();
  const { data, loading, error, load, retry } = useWeather();

  const localityToLoad = selectedLocality ?? (data ? data.locality : null);

  const isFav = localityToLoad ? isFavorite(localityToLoad.id) : false;

  React.useEffect(() => {
    if (urlLocality && urlLocality.trim().length > 0) {
      // On tente de charger directement depuis l'URL.
      // Comme nous n'avons pas encore les coordonnées, on laisse l'utilisateur
      // sélectionner via la recherche, ou on pourrait appeler l'API de géocodage.
      // Pour l'instant, on indique juste qu'une localité est attendue.
    }
  }, [urlLocality]);

  const handleLocalitySelect = (locality: Locality) => {
    setSelectedLocality(locality);
    load(locality);
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

  if (loading && !data) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SearchBar onSelect={handleLocalitySelect} />
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Chargement de la météo…</CardTitle>
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
              Impossible de charger la météo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">
              {error}
            </p>
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
            <CardTitle className="text-center">
              Bienvenue sur Météo Bénin
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-6 text-muted-foreground max-w-md">
              Recherchez une ville ou une commune du Bénin pour consulter la
              météo actuelle et les prévisions sur 7 jours.
            </p>
            <p className="text-xs text-muted-foreground">
              Les données proviennent de Open-Meteo, un service public gratuit.
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
          <span className="text-2xl font-bold text-primary">🇧🇯</span>
          <div>
            <h1 className="text-xl font-bold">Météo Bénin</h1>
            <p className="text-xs text-muted-foreground">
              Prévisions locales pour les collectivités
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
              {locality.department && (
                <span>{locality.department}</span>
              )}
              {locality.population && (
                <>
                  <span> · </span>
                  <span>{locality.population.toLocaleString("fr-FR")} habitants</span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium bg-secondary text-secondary-foreground rounded-full px-2 py-1 uppercase tracking-tighter">
              Bénin
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
            <CardTitle>Vos localités favorites</CardTitle>
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
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-border bg-background hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <span className="text-sm font-medium">{fav.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {fav.department}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <footer className="mt-8 pt-4 border-t border-border text-xs text-muted-foreground text-center">
        Données fournies par{" "}
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Open-Meteo
        </a>
        {" · "}
        <a
          href="https://geocoding-api.open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Open-Meteo Géocodage
        </a>
      </footer>
    </div>
  );
}
