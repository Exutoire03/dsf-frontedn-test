"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Hero } from "./Hero";
import { SearchBar } from "./SearchBar";
import { CurrentWeather } from "./CurrentWeather";
import { DailyForecast } from "./DailyForecast";
import { FavoriteButton } from "./FavoriteButton";
import { RetryButton } from "./RetryButton";
import { WeatherBackground } from "./WeatherBackground";
import { HourlyChart } from "./HourlyChart";
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
      <div className="h-24 w-1/2 rounded-md bg-muted animate-pulse" />
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
            className="h-40 rounded-2xl border border-border bg-muted animate-pulse"
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
  const [positionLoading, setPositionLoading] = React.useState(false);
  const [positionError, setPositionError] = React.useState<string | null>(null);
  const [headerHidden, setHeaderHidden] = React.useState(false);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  const { favorites, add, remove, isFavorite } = useFavorites();
  const { data, loading, error, load, retry } = useWeather();

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHeaderHidden(true);
      } else if (currentScrollY < lastScrollY) {
        setHeaderHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

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
        const locality: Locality = {
          id: `${latitude.toFixed(4)}-${longitude.toFixed(4)}`,
          name: "Ma position",
          department: "Position actuelle",
          latitude,
          longitude,
          countryCode: "BJ",
        };
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

  if (!data && !loading && !error && !urlError && !positionError) {
    return <Hero onSelect={handleLocalitySelect} />;
  }

  const baseHeader = (
    <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 sm:py-3 md:px-6 md:py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">🇧🇯</span>
        <div>
          <h1 className="text-lg font-bold text-white">Meteo Benin</h1>
          <p className="text-[10px] text-white/70">
            Previsions locales pour les collectivites
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleUseMyPosition}
          disabled={positionLoading}
          aria-label={
            positionLoading
              ? "Determination de votre position en cours"
              : "Afficher la meteo de votre position actuelle"
          }
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-white/30 bg-white/10 text-[11px] font-medium text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {positionLoading ? (
            <svg className="w-3 h-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <MapPin className="w-3 h-3" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {positionLoading ? "Position…" : "Ma position"}
          </span>
        </button>
        <FavoriteButton
          isFavorite={isFav}
          onToggle={handleToggleFavorite}
          localityName={localityToLoad!.name}
        />
      </div>
    </div>
  );

  const renderSearchBar = () => (
    <SearchBar
      onSelect={handleLocalitySelect}
      textColor="white"
    />
  );

  if (urlLoading && !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b border-border bg-background sticky top-0 z-50">
          {baseHeader}
        </nav>
        <div className="max-w-5xl mx-auto p-4 space-y-6 pt-[100px]">
          {renderSearchBar()}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Chargement depuis l'adresse…</CardTitle>
            </CardHeader>
            <CardContent>
              <WeatherSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (urlError && !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b border-border bg-background sticky top-0 z-50">
          {baseHeader}
        </nav>
        <div className="max-w-5xl mx-auto p-4 space-y-6 pt-[100px]">
          {renderSearchBar()}
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
      </div>
    );
  }

  if (positionError && !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b border-border bg-background sticky top-0 z-50">
          {baseHeader}
        </nav>
        <div className="max-w-5xl mx-auto p-4 space-y-6 pt-[100px]">
          {renderSearchBar()}
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
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b border-border bg-background sticky top-0 z-50">
          {baseHeader}
        </nav>
        <div className="max-w-5xl mx-auto p-4 space-y-6 pt-[100px]">
          {renderSearchBar()}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Chargement de la meteo…</CardTitle>
            </CardHeader>
            <CardContent>
              <WeatherSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <nav className="border-b border-border bg-background sticky top-0 z-50">
          {baseHeader}
        </nav>
        <div className="max-w-5xl mx-auto p-4 space-y-6 pt-[100px]">
          {renderSearchBar()}
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
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { locality, current, daily, hourly } = data;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <WeatherBackground weatherCode={current.weatherCode} />
      <div className="fixed inset-0 bg-black/20 z-10" />

      <motion.div
        initial={{ y: 0 }}
        animate={{ y: headerHidden ? -60 : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed top-0 left-0 right-0 z-40"
      >
        <nav className="border-b border-white/20 bg-white/10 backdrop-blur-md">
          {baseHeader}
        </nav>
      </motion.div>

      <main className="relative z-20 flex-1 max-w-5xl mx-auto p-6 pt-[80px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          {renderSearchBar()}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="relative overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-6">
              <div className="flex-1">
                <CardTitle className="text-4xl font-bold text-white mb-1">
                  {locality.name}
                </CardTitle>
                <p className="text-sm text-white/80 flex items-center gap-1">
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
                <span className="text-[10px] font-medium bg-white/20 text-white rounded-full px-2 py-1 uppercase tracking-tighter border border-white/10">
                  Benin
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-0 pb-8">
              <CurrentWeather data={current} localityName={locality.name} />
              <DailyForecast data={daily} />
            </CardContent>
          </Card>
        </motion.div>

        {hourly && hourly.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <Card className="border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">
                  Evolution des 24 prochaines heures
                </CardTitle>
                <p className="text-sm text-white/80">
                  Temperature et pluie heure par heure a l'heure locale du Benin.
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <HourlyChart data={hourly} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <Card className="border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Vos localites favorites</CardTitle>
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
                      className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary text-white"
                    >
                      <span className="text-sm font-medium">{fav.name}</span>
                      <span className="text-xs text-white/70">{fav.department}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <footer className="mt-12 pt-6 border-t border-white/10 text-xs text-white/50 text-center">
          Donnees fournies par{" "}
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-white"
          >
            Open-Meteo
          </a>
          {" . "}
          <a
            href="https://geocoding-api.open-meteo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-white"
          >
            Open-Meteo Geocodage
          </a>
        </footer>
      </main>
    </div>
  );
}
