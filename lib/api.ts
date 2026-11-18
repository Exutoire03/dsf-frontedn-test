import { getWeatherDescription, isRainAlert } from "@/lib/weather-codes";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const MIN_QUERY_LENGTH = 2;

/**
 * Trouve des localités au Bénin correspondant au texte saisi.
 * Seules les localités du Bénin (countryCode=BJ) sont retournées.
 */
export async function searchLocalities(query: string) {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) {
    return [];
  }

  const params = new URLSearchParams({
    name: query.trim(),
    countryCode: "BJ",
    language: "fr",
    count: "10",
  });

  const response = await fetch(`${GEOCODING_URL}?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error("Le service de recherche est temporairement indisponible.");
  }

  const data = await response.json();
  const results = data.results || [];

  return results.map((item: any) => ({
    id: `${item.latitude}-${item.longitude}`,
    name: item.name || "Localité inconnue",
    department: item.admin1 || "",
    population: item.population,
    latitude: item.latitude,
    longitude: item.longitude,
    countryCode: item.country_code || "BJ",
  }));
}

/**
 * Récupère la météo actuelle et les prévisions 7 jours pour une localité.
 * Les dates et heures sont celles du Bénin (fuseau Africa/Porto-Novo).
 */
export async function fetchWeather(locality: {
  latitude: number;
  longitude: number;
  name: string;
  department: string;
  population?: number;
}) {
  const params = new URLSearchParams({
    latitude: String(locality.latitude),
    longitude: String(locality.longitude),
    current_weather: "true",
    hourly: "temperature_2m,relative_humidity_2m,apparent_temperature,weathercode,precipitation,precipitation_probability",
    daily: "weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
    timezone: "Africa/Porto-Novo",
  });

  const response = await fetch(`${FORECAST_URL}?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Trop de requêtes. Veuillez patienter avant de réessayer.");
    }
    throw new Error("Le service météo ne répond pas. Vérifiez votre connexion.");
  }

  const data = await response.json();

  const current = mapCurrentWeather(data);
  const daily = mapDailyForecast(data.daily);
  const hourly = mapHourlyForecast(data.hourly);

  return {
    locality: {
      id: `${locality.latitude}-${locality.longitude}`,
      name: locality.name,
      department: locality.department || "",
      population: locality.population,
      latitude: locality.latitude,
      longitude: locality.longitude,
      countryCode: "BJ",
    },
    current,
    daily,
    hourly,
  };
}

function mapCurrentWeather(data: any) {
  const current = data.current_weather || {};
  const hourly = data.hourly || {};

  const currentTime = current.time;
  const timeIndex = hourly.time?.indexOf(currentTime) ?? 0;

  return {
    temperature: Math.round(current.temperature ?? 0),
    feelsLike:
      hourly.apparent_temperature?.[timeIndex] !== undefined
        ? Math.round(hourly.apparent_temperature[timeIndex])
        : Math.round(current.temperature ?? 0),
    humidity:
      hourly.relative_humidity_2m?.[timeIndex] !== undefined
        ? hourly.relative_humidity_2m[timeIndex]
        : null,
    windSpeed: Math.round(current.windspeed ?? 0),
    weatherCode: current.weathercode ?? 0,
    weatherDescription: getWeatherDescription(current.weathercode ?? 0),
    time: currentTime,
  };
}

function mapDailyForecast(daily: any) {
  const forecasts: any[] = [];

  for (let i = 0; i < (daily.time?.length || 0); i++) {
    const weatherCode = daily.weathercode?.[i] ?? 0;
    const precipitationSum = daily.precipitation_sum?.[i] ?? 0;
    const precipitationProbability =
      daily.precipitation_probability_max?.[i] ?? 0;

    forecasts.push({
      date: daily.time[i],
      dayLabel: formatDayLabel(daily.time[i]),
      temperatureMax: Math.round(daily.temperature_2m_max?.[i] ?? 0),
      temperatureMin: Math.round(daily.temperature_2m_min?.[i] ?? 0),
      precipitationSum,
      precipitationProbability,
      weatherCode,
      weatherDescription: getWeatherDescription(weatherCode),
      isRainAlert: isRainAlert(precipitationSum, precipitationProbability),
    });
  }

  return forecasts;
}

function formatDayLabel(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  return date.toLocaleDateString("fr-BJ", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function mapHourlyForecast(hourly: any) {
  if (!hourly || !hourly.time) return [];

  const now = new Date();
  const currentHour = now.getHours();

  const forecasts = [];

  for (let i = currentHour; i < Math.min(currentHour + 24, hourly.time.length); i++) {
    const time = hourly.time[i];
    const hourLabel = formatHourLabel(time);
    forecasts.push({
      time,
      hourLabel,
      temperature: Math.round(hourly.temperature_2m?.[i] ?? 0),
      precipitation: hourly.precipitation?.[i] ?? 0,
      weatherCode: hourly.weathercode?.[i] ?? 0,
    });
  }

  return forecasts;
}

function formatHourLabel(isoTime: string): string {
  // isoTime est au format "YYYY-MM-DDTHH:00"
  const date = new Date(isoTime);
  return date.toLocaleTimeString("fr-BJ", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
