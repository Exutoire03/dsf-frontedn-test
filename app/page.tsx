import * as React from "react";
import { WeatherApp } from "@/components/weather/WeatherApp";

export default function Home({
  searchParams,
}: Readonly<{ searchParams: { [key: string]: string | string[] | undefined } }>) {
  const urlLocality = searchParams?.locality as string | undefined;

  return <WeatherApp initialLocality={urlLocality} />;
}
