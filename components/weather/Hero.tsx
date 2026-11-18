"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { SearchBar } from "./SearchBar";
import type { Locality } from "@/types";

const FEATURED_CITIES: Locality[] = [
  {
    id: "6.3713-2.4277",
    name: "Cotonou",
    department: "Littoral",
    latitude: 6.3713,
    longitude: 2.4277,
    population: 679000,
    countryCode: "BJ",
  },
  {
    id: "6.4967-2.6273",
    name: "Porto-Novo",
    department: "Ouémé",
    latitude: 6.4967,
    longitude: 2.6273,
    population: 264000,
    countryCode: "BJ",
  },
  {
    id: "9.3515-2.6321",
    name: "Parakou",
    department: "Borgou",
    latitude: 9.3515,
    longitude: 2.6321,
    population: 256000,
    countryCode: "BJ",
  },
];

interface HeroProps {
  onSelect: (locality: Locality) => void;
}

export function Hero({ onSelect }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "url('/Statue%20africaine%20en%20bronze%20sous%20un%20ciel%20bleu.png')",
          backgroundSize: "cover",
          backgroundPosition: "top",
        }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇧🇯</span>
            <div>
              <h1 className="text-xl font-bold text-white">Meteo Benin</h1>
              <p className="text-xs text-white/80">Previsions locales</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 pt-20 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              La meteo de votre<br />
              commune au Benin
            </h2>
            <p className="text-lg text-white/90 max-w-md mx-auto">
              Temperature, previsions 7 jours et vigilance pluie.
            </p>

            <div className="space-y-3">
              <SearchBar
                onSelect={onSelect}
                textColor="white"
              />
              
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {FEATURED_CITIES.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => onSelect(city)}
                  className="px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-sm text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur"
                >
                  {city.name}
                </button>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </section>
  );
}
