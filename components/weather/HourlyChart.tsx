"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
} from "recharts";
import type { HourlyForecast } from "@/types";

interface HourlyChartProps {
  data: HourlyForecast[];
}

export function HourlyChart({ data }: HourlyChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        Aucune donnee horaire disponible.
      </div>
    );
  }

  const tempColor = "#0f766e";
  const rainColor = "#f59e0b";

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="hourLabel"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={(value) => {
              // N'affiche qu'une étiquette sur deux pour éviter la surcharge
              const index = data.findIndex((d) => d.hourLabel === value);
              return index % 2 === 0 ? value : "";
            }}
            tickMargin={8}
            axisLine={false}
          />
          <YAxis
            type="number"
            domain={[0, "dataMax"]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            label={{ value: "Pluie (mm)", angle: -90, position: "insideLeft" }}
          />
          <YAxis
            type="number"
            domain={[0, "dataMax"]}
            orientation="right"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            label={{ value: "Température (°C)", angle: -90, position: "insideRight" }}
          />
          <Tooltip
            content={({ active, payload }: any) => {
              if (!active || !payload || payload.length === 0) return null;
              const item = payload[0].payload as HourlyForecast;
              return (
                <div className="p-3 border border-border bg-background rounded-lg shadow-lg">
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.time}
                  </p>
                  <p className="text-sm font-bold text-primary">
                    {item.temperature}°C
                  </p>
                  <p className="text-sm text-amber-600">
                    Pluie : {item.precipitation.toFixed(1)} mm
                  </p>
                </div>
              );
            }}
          />
          <Legend />
          <Bar
            dataKey="precipitation"
            fill={rainColor}
            radius={[4, 4, 0, 0]}
            stackId="a"
            zIndex={1}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke={tempColor}
            strokeWidth={2}
            dot={{ fill: tempColor, strokeWidth: 2 }}
            zIndex={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
