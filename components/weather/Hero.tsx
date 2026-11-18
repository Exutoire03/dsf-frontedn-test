"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { SearchBar } from "./SearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Locality } from "@/types";

interface HeroProps {
  onSelect: (locality: Locality) => void;
}

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
  {
    id: "9.7167-1.6667",
    name: "Djougou",
    department: "Donga",
    latitude: 9.7167,
    longitude: 1.6667,
    population: 234000,
    countryCode: "BJ",
  },
  {
    id: "7.1667-2.0833",
    name: "Bohicon",
    department: "Zou",
    latitude: 7.1667,
    longitude: 2.0833,
    population: 150000,
    countryCode: "BJ",
  },
];

export function Hero({ onSelect }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Fond décoratif abstrait */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
              🇧🇯
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Meteo Benin</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Previsions pour les collectivites
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              Service en ligne
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
              Heure du Benin (GMT+1)
            </span>
          </div>
        </header>

        <main className="flex-1 px-6 pt-12 pb-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Colonne gauche : Hero text */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-3"
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground">
                  Anticipez les fortes pluies<br />
                  <span className="text-primary">et les inondations</span>
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                  Une application simple, en français, pour consulter la météo
                  de n'importe quelle localité du Bénin. Température, prévisions
                  sur 7 jours, vigilance pluie et favoris — conçue pour les
                  agents de préfecture, mairies et protection civile.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                <StatCard label="Localités" value="77 communes" icon="MapPin" />
                <StatCard label="Previsions" value="7 jours" icon="Calendar" />
                <StatCard label="Vigilance" value="Pluie / Orage" icon="AlertTriangle" />
              </motion.div>
            </div>

            {/* Colonne droite : Recherche */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-4"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rechercher une localité</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Tapez le nom d'une ville ou d'une commune du Benin
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <SearchBar onSelect={(locality) => {
                      onSelect(locality);
                    }} />
                  </CardContent>
                </Card>

                <div className="flex flex-wrap gap-3">
                  {FEATURED_CITIES.map((city) => (
                    <button
                      key={city.name}
                      type="button"
                      onClick={() => onSelect(city)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    >
                      <span className="text-xs text-muted-foreground">{city.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                        {city.department}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Les donnees proviennent de Open-Meteo, service public gratuit.
                </p>
              </motion.div>
            </div>
          </div>
        </main>

        <footer className="border-t border-border bg-background/80 backdrop-blur px-6 py-4 max-w-7xl mx-auto text-xs text-muted-foreground">
          Application prototype — DSF 2026 · Donnees Open-Meteo
        </footer>
      </div>
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  const icons: Record<string, React.ElementType> = {
    MapPin: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    Calendar: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    AlertTriangle: () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.739-3.001l-0.384-1.153A6 6 0 0019.206 10c0-1.15-0.38-2.24-1.01-3.148l-0.2-0.284c-0.148-0.216-0.39-0.48-0.74-0.668a8 8 0 00-1.124-1.124c-0.188-0.35-0.452-0.592-0.668-0.74L15.674 4.52c-0.908-0.63-1.997-1.01-3.148-1.01A6 6 0 009.206 10c0 1.15 0.38 2.24 1.01 3.148l0.2 0.284c0.148 0.216 0.39 0.48 0.74 0.668a8 8 0 001.124 1.124c0.188 0.35 0.452 0.592 0.668 0.74L10.93 16.998c-0.763 1.334 0.199 3.001 1.739 3.001z" />
      </svg>
    ),
  };

  const Icon = icons[icon] || icons.MapPin;

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="text-primary" aria-hidden="true" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
