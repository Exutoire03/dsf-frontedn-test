"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { WeatherIcon } from "./WeatherIcon";
import { Badge } from "@/components/ui/badge";
import type { DailyForecast } from "@/types";

interface DailyForecastProps {
  data: DailyForecast[];
}

export function DailyForecast({ data }: DailyForecastProps) {
  return (
    <section aria-labelledby="daily-forecast-heading" className="mt-4">
      <h2 id="daily-forecast-heading" className="sr-only">
        Prévisions sur 7 jours
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {data.map((day) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cnDayCard(day.isRainAlert)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-white">{day.dayLabel}</span>
              {day.isRainAlert && (
                <Badge variant="destructive" className="text-[10px] leading-none px-2 py-1">
                  Vigilance pluie
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 mb-3">
              <WeatherIcon code={day.weatherCode} size={28} className="shrink-0 text-white/90" />
              <span className="text-sm text-white/80 capitalize flex-1 text-right">
                {day.weatherDescription}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <TempReading label="Min" value={day.temperatureMin} />
              <TempReading label="Max" value={day.temperatureMax} />
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400" aria-hidden="true" />
                {day.precipitationSum.toFixed(1)} mm
              </span>
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
                {day.precipitationProbability}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function cnDayCard(isRainAlert: boolean): string {
  return `rounded-xl border border-white/20 bg-white/10 backdrop-blur p-4 transition-all hover:bg-white/20 ${isRainAlert ? "border-destructive/50 bg-red-500/10" : ""}`;
}

interface TempReadingProps {
  label: string;
  value: number;
}

function TempReading({ label, value }: TempReadingProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-sm font-semibold text-white">{value}°</span>
    </div>
  );
}
