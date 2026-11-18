import * as React from "react";
import { WeatherIcon } from "./WeatherIcon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DailyForecast } from "@/types";

interface DailyForecastProps {
  data: DailyForecast[];
}

export function DailyForecast({ data }: DailyForecastProps) {
  return (
    <section aria-labelledby="daily-forecast-heading">
      <h2 id="daily-forecast-heading" className="sr-only">
        Prévisions sur 7 jours
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((day) => (
          <ForecastDay key={day.date} day={day} />
        ))}
      </div>
    </section>
  );
}

interface ForecastDayProps {
  day: DailyForecast;
}

function ForecastDay({ day }: ForecastDayProps) {
  return (
    <article
      className={cn(
        "rounded-xl border border-border bg-background p-4 flex flex-col gap-3 hover:shadow-md transition-shadow",
        day.isRainAlert ? "border-destructive/50 bg-red-50" : ""
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{day.dayLabel}</span>
        {day.isRainAlert && (
          <Badge variant="destructive" className="text-[10px] leading-none px-2 py-1">
            Vigilance pluie
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <WeatherIcon code={day.weatherCode} size={32} className="shrink-0" />
        <span className="text-sm text-muted-foreground capitalize">
          {day.weatherDescription}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
        <TempReading label="Min" value={day.temperatureMin} />
        <TempReading label="Max" value={day.temperatureMax} />
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span className="flex items-center gap-1 text-xs text-blue-600">
          <span
            className="w-2 h-2 rounded-full bg-blue-600"
            aria-hidden="true"
          />
          {day.precipitationSum.toFixed(1)} mm
        </span>
        <span className="flex items-center gap-1 text-xs text-amber-600">
          <span
            className="w-2 h-2 rounded-full bg-amber-600"
            aria-hidden="true"
          />
          {day.precipitationProbability}%
        </span>
      </div>
    </article>
  );
}

interface TempReadingProps {
  label: string;
  value: number;
}

function TempReading({ label, value }: TempReadingProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}°</span>
    </div>
  );
}
