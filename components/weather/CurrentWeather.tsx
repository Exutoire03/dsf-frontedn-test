import * as React from "react";
import { Wind, Droplets, Thermometer, Sun } from "lucide-react";
import { WeatherIcon } from "./WeatherIcon";
import type { CurrentWeather } from "@/types";

interface CurrentWeatherProps {
  data: CurrentWeather;
  localityName: string;
}

export function CurrentWeather({ data, localityName }: CurrentWeatherProps) {
  return (
    <section aria-labelledby="current-weather-heading">
      <h2 id="current-weather-heading" className="sr-only">
        Météo actuelle à {localityName}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Température principale */}
        <div className="md:col-span-7">
          <div className="flex flex-col items-start justify-center gap-2">
            <div className="flex items-end gap-1">
              <span className="text-5xl font-bold tracking-tight">
                {data.temperature}°
              </span>
              <span className="text-xl font-medium text-muted-foreground">C</span>
            </div>
            <p className="text-sm text-muted-foreground capitalize">
              {data.weatherDescription}
            </p>
            <WeatherIcon code={data.weatherCode} size={64} className="mt-4" />
          </div>
        </div>

        {/* Détails */}
        <div className="md:col-span-5 grid grid-cols-2 gap-4">
          <DetailItem
            icon={<Thermometer className="w-5 h-5" aria-hidden="true" />}
            label="Ressenti"
            value={`${data.feelsLike}°C`}
          />
          <DetailItem
            icon={<Droplets className="w-5 h-5" aria-hidden="true" />}
            label="Humidité"
            value={
              data.humidity !== null ? `${data.humidity}%` : "Non disponible"
            }
          />
          <DetailItem
            icon={<Wind className="w-5 h-5" aria-hidden="true" />}
            label="Vent"
            value={`${data.windSpeed} km/h`}
          />
          <DetailItem
            icon={<Sun className="w-5 h-5" aria-hidden="true" />}
            label="Heure locale"
            value={data.time}
          />
        </div>
      </div>
    </section>
  );
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 p-3 flex items-center gap-3">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
