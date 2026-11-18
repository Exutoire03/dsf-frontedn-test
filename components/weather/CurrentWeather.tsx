"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Wind, Droplets, Thermometer, Sun, Cloud, CloudRain, CloudSnow, CloudLightning } from "lucide-react";
import { WeatherIcon } from "./WeatherIcon";
import type { CurrentWeather } from "@/types";

interface CurrentWeatherProps {
  data: CurrentWeather;
  localityName: string;
}

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Sun,
  Cloud,
  CloudFog: Cloud,
  CloudDrizzle: CloudRain,
  CloudRain,
  CloudSnow,
  CloudLightning,
};

export function CurrentWeather({ data, localityName }: CurrentWeatherProps) {
  const { icon: iconName } = WeatherIconPropsHelper(data.weatherCode);
  const Icon = ICON_COMPONENTS[iconName] || Cloud;

  return (
    <section aria-labelledby="current-weather-heading" className="space-y-6">
      <h2 id="current-weather-heading" className="sr-only">
        Météo actuelle à {localityName}
      </h2>

      {/* Température principale grande et mise en avant */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center gap-4 text-center"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-6xl md:text-7xl font-bold text-white tracking-tight">
            {data.temperature}
          </span>
          <span className="text-2xl font-medium text-white/90">°C</span>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Icon
            className="w-24 h-24 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
            aria-hidden="true"
          />
          <span className="text-lg md:text-xl font-medium text-white/90 capitalize">
            {data.weatherDescription}
          </span>
        </div>
      </motion.div>

      {/* Détails en grille */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DetailItem
          icon={<Thermometer className="w-5 h-5 text-primary" aria-hidden="true" />}
          label="Ressenti"
          value={`${data.feelsLike}°C`}
        />
        <DetailItem
          icon={<Droplets className="w-5 h-5 text-blue-400" aria-hidden="true" />}
          label="Humidité"
          value={
            data.humidity !== null ? `${data.humidity}%` : "Non disponible"
          }
        />
        <DetailItem
          icon={<Wind className="w-5 h-5 text-blue-300" aria-hidden="true" />}
          label="Vent"
          value={`${data.windSpeed} km/h`}
        />
        <DetailItem
          icon={<Sun className="w-5 h-5 text-amber-400" aria-hidden="true" />}
          label="Heure locale"
          value={data.time}
        />
      </div>
    </section>
  );
}

function WeatherIconPropsHelper(code: number): { icon: string } {
  const map: Record<number, string> = {
    0: "Sun",
    1: "Sun",
    2: "Cloud",
    3: "Cloud",
    45: "CloudFog",
    48: "CloudFog",
    51: "CloudDrizzle",
    53: "CloudDrizzle",
    55: "CloudDrizzle",
    56: "CloudSnow",
    57: "CloudSnow",
    61: "CloudRain",
    63: "CloudRain",
    65: "CloudRain",
    66: "CloudSnow",
    67: "CloudSnow",
    71: "CloudSnow",
    73: "CloudSnow",
    75: "CloudSnow",
    77: "CloudSnow",
    80: "CloudRain",
    81: "CloudRain",
    82: "CloudRain",
    85: "CloudSnow",
    86: "CloudSnow",
    95: "CloudLightning",
    96: "CloudLightning",
    99: "CloudLightning",
  };
  return { icon: map[code] || "Cloud" };
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur p-4 flex flex-col items-center gap-2">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="text-center">
        <p className="text-xs text-white/60">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
