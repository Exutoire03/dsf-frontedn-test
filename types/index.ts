export interface Locality {
  id: string;
  name: string;
  department: string;
  population?: number;
  latitude: number;
  longitude: number;
  countryCode: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescription: string;
  time: string; // heure locale Bénin
}

export interface DailyForecast {
  date: string; // ISO du jour
  dayLabel: string; // "mar. 18 nov."
  temperatureMax: number;
  temperatureMin: number;
  precipitationSum: number; // mm
  precipitationProbability: number; // %
  weatherCode: number;
  weatherDescription: string;
  isRainAlert: boolean;
}

export interface WeatherData {
  locality: Locality;
  current: CurrentWeather;
  daily: DailyForecast[];
}

export interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

export interface FavoriteLocality extends Locality {}