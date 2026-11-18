import { useCallback, useState } from "react";
import { fetchWeather } from "@/lib/api";
import type { Locality, WeatherData, WeatherState } from "@/types";

/**
 * Gère l'état de la météo d'une localité : données, chargement et erreur.
 * Offre une fonction de rechargement pour le bouton « Réessayer ».
 */
export function useWeather() {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: false,
    error: null,
  });

  const load = useCallback(async (locality: Locality) => {
    setState({ data: null, loading: true, error: null });

    try {
      const data: WeatherData = await fetchWeather(locality);
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Impossible de joindre le service météo. Vérifiez votre connexion.",
      });
    }
  }, []);

  const retry = useCallback(() => {
    if (state.data) {
      load(state.data.locality);
    }
  }, [load, state.data]);

  return { ...state, load, retry };
}
