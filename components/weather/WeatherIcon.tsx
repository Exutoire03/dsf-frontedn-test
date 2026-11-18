import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Sun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
} from "lucide-react";
import { getWeatherCodeInfo } from "@/lib/weather-codes";

const ICONS: Record<string, React.ElementType> = {
  Sun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
};

export interface WeatherIconProps {
  code: number;
  size?: number;
  className?: string;
}

export function WeatherIcon({ code, size = 48, className }: WeatherIconProps) {
  const { icon } = getWeatherCodeInfo(code);
  const Icon = ICONS[icon] || Cloud;

  return (
    <Icon
      className={cn(
        "w-6 h-6",
        size ? `w-${size} h-${size}` : "",
        className
      )}
      aria-hidden="true"
    />
  );
}
