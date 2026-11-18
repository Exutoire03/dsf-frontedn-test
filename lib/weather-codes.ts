/**
 * Codes météo WMO traduits en français.
 * Source : https://open-meteo.com/en/docs
 * Chaque code est associé à une description lisible et à une icône Lucide suggérée.
 */

export interface WeatherCodeInfo {
  code: number;
  label: string;
  icon: string; // nom de l'icône Lucide React
}

export const WEATHER_CODES: WeatherCodeInfo[] = [
  { code: 0, label: "Ciel dégagé", icon: "Sun" },
  { code: 1, label: "Peu nuageux", icon: "Sun" },
  { code: 2, label: "Ciel voilé", icon: "Cloud" },
  { code: 3, label: "Nuageux", icon: "Cloud" },
  { code: 45, label: "Brouillard", icon: "CloudFog" },
  { code: 48, label: "Brouillard givrant", icon: "CloudFog" },
  { code: 51, label: "Bruine légère", icon: "CloudDrizzle" },
  { code: 53, label: "Bruine modérée", icon: "CloudDrizzle" },
  { code: 55, label: "Bruine dense", icon: "CloudDrizzle" },
  { code: 56, label: "Bruine verglaçante légère", icon: "CloudSnow" },
  { code: 57, label: "Bruine verglaçante dense", icon: "CloudSnow" },
  { code: 61, label: "Pluie légère", icon: "CloudRain" },
  { code: 63, label: "Pluie modérée", icon: "CloudRain" },
  { code: 65, label: "Pluie forte", icon: "CloudRain" },
  { code: 66, label: "Pluie verglaçante légère", icon: "CloudSnow" },
  { code: 67, label: "Pluie verglaçante forte", icon: "CloudSnow" },
  { code: 71, label: "Neige légère", icon: "CloudSnow" },
  { code: 73, label: "Neige modérée", icon: "CloudSnow" },
  { code: 75, label: "Neige forte", icon: "CloudSnow" },
  { code: 77, label: "Grains de neige", icon: "CloudSnow" },
  { code: 80, label: "Averses de pluie légères", icon: "CloudRain" },
  { code: 81, label: "Averses de pluie modérées", icon: "CloudRain" },
  { code: 82, label: "Averses de pluie fortes", icon: "CloudRain" },
  { code: 85, label: "Averses de neige légères", icon: "CloudSnow" },
  { code: 86, label: "Averses de neige fortes", icon: "CloudSnow" },
  { code: 95, label: "Orage", icon: "CloudLightning" },
  { code: 96, label: "Orage avec grêle légère", icon: "CloudLightning" },
  { code: 99, label: "Orage avec grêle forte", icon: "CloudLightning" },
];

export function getWeatherCodeInfo(code: number): WeatherCodeInfo {
  const found = WEATHER_CODES.find((item) => item.code === code);
  return found ?? { code: -1, label: "Temps inconnu", icon: "Cloud" };
}

export function getWeatherDescription(code: number): string {
  return getWeatherCodeInfo(code).label;
}

export function isRainAlert(
  precipitationSum: number,
  precipitationProbability: number
): boolean {
  return precipitationSum >= 20 || precipitationProbability >= 80;
}
