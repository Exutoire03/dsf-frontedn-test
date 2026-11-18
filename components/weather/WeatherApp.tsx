"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
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

/**
 * Construit une localisation temporaire a partir des coordonnes GPS.
 */
function localityFromCoords(latitude: number, longitude: number): Locality {
  return {
    id: `${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
    name: "Ma position",
    department: "Position actuelle",
    latitude,
    longitude,
    countryCode: "BJ",
  };
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
  const [positionLoading, setPositionLoading] = React.useState(false);
  const [positionError, setPositionError] = React.useState<string | null>(null);

  const { favorites, add, remove, isFavorite } = useFavorites();
  const { data, loading, error, load, retry } = useWeather();

  // Au montage, si une localite est passee dans l'URL, on la charge directement.
  React.useEffect(() => {
    if (!initialLocality) return;

    let cancelled = false;

    const run = async () => {
      setUrlLoading(true);
      setUrlError(null);

      try {
        const results = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(initialLocality)}&countryCode=BJ&language=fr&count=10`
        ).then((r) => r.json());

        if (cancelled) return;

        const localities = (results.results || []).map(
          (item: any) => ({
            id: `${item.latitude}-${item.longitude}`,
            name: item.name || "Localite inconnue",
            department: item.admin1 || "",
            population: item.population,
            latitude: item.latitude,
            longitude: item.longitude,
            countryCode: item.country_code || "BJ",
          })
        );

        if (localities.length === 0) {
          setUrlError("Aucune localite trouvee pour cette adresse.");
          setUrlLoading(false);
          return;
        }

        setSelectedLocality(localities[0]);
        load(localities[0]);
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
    router.replace(`?locality=${encodeURIComponent(locality.name)}`);
  };

  /**
   * Demande la position GPS de l'utilisateur et charge la meteo correspondante.
   * Aucun message technique n'est affiche a l'utilisateur.
   */
  const handleUseMyPosition = () => {
    if (!navigator.geolocation) {
      setPositionError(
        "La geolocalisation n'est pas supportee par ce navigateur."
      );
      return;
    }

    setPositionLoading(true);
    setPositionError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locality = localityFromCoords(latitude, longitude);
        setSelectedLocality(locality);
        load(locality);
        router.replace(
          `?lat=${latitude.toFixed(4)}&lon=${longitude.toFixed(4)}`
        );
        setPositionLoading(false);
      },
      (error) => {
        setPositionLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setPositionError(
              "Vous avez refuse la geolocalisation. Cherchez une ville manuellement."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setPositionError(
              "Votre position est indisponible. Cherchez une ville manuellement."
            );
            break;
          case error.TIMEOUT:
            setPositionError(
              "Le temps de geolocalisation est depasse. Reessayez."
            );
            break;
          default:
            setPositionError(
              "Impossible de determiner votre position. Cherchez une ville."
            );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
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

  const closePositionError = () => setPositionError(null);

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

  // Erreur de geolocalisation affichee en dessous de la recherche.
  if (positionError && !data) {
    return (
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <SearchBar onSelect={handleLocalitySelect} />
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Position introuvable
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">{positionError}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closePositionError}
                className="text-xs underline underline-offset-4 text-muted-foreground hover:text-primary"
              >
                Fermer
              </button>
              <RetryButton onRetry={handleRetry} />
            </div>
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
          <button
            type="button"
            onClick={handleUseMyPosition}
            disabled={positionLoading}
            aria-label={
              positionLoading
                ? "Determination de votre position en cours"
                : "Afficher la meteo de votre position actuelle"
            }
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none"
          >
            {positionLoading ? (
              <svg
                className="w-4 h-4 animate-spin"
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
            ) : (
              <MapPin className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{positionLoading ? "Position…" : "Ma position"}</span>
          </button>
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
