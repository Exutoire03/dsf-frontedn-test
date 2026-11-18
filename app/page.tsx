import { Suspense } from "react";
import { WeatherApp } from "@/components/weather/WeatherApp";

export default function Home({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>) {
  return (
    <Suspense fallback={<div>Chargement…</div>}>
      <WeatherSearchParams searchParams={searchParams} />
    </Suspense>
  );
}

async function WeatherSearchParams({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>) {
  const params = await searchParams;
  const urlLocality = params?.locality as string | undefined;
  return <WeatherApp initialLocality={urlLocality} />;
}
