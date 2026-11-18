"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { getWeatherCodeInfo } from "@/lib/weather-codes";

interface WeatherBackgroundProps {
  weatherCode: number;
  className?: string;
}

/**
 * Détermine la catégorie météo à partir d'un code WMO.
 */
function weatherCategory(code: number): "sunny" | "cloudy" | "rainy" | "stormy" | "foggy" | "snowy" {
  if (code >= 95 && code <= 99) return "stormy";
  if (code >= 51 && code <= 67) return "rainy";
  if (code >= 71 && code <= 77) return "snowy";
  if (code >= 45 && code <= 48) return "foggy";
  if (code >= 2 && code <= 3) return "cloudy";
  return "sunny";
}

export function WeatherBackground({ weatherCode, className }: WeatherBackgroundProps) {
  const category = weatherCategory(weatherCode);
  const { icon } = getWeatherCodeInfo(weatherCode);

  return (
    <div className={cnBackground(className)}>
      {/* Dégradé de fond selon la catégorie météo */}
      <div className="absolute inset-0" style={backgroundGradient(category)} />

      {/* Éléments animés selon la météo */}
      {category === "sunny" && (
        <>
          {/* Soleil */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 right-20 w-32 h-32 bg-amber-400 rounded-full shadow-[0_0_60px_rgba(251,191,36,0.6)] mix-blend-overlay"
          />
          {/* Nuages légers */}
          <FloatingCloud top="10%" left="10%" delay={0} />
          <FloatingCloud top="20%" left="60%" delay={2} />
        </>
      )}

      {category === "cloudy" && (
        <>
          <FloatingCloud top="15%" left="5%" delay={0} size="large" />
          <FloatingCloud top="25%" left="55%" delay={1.5} size="large" />
          <FloatingCloud top="10%" left="75%" delay={3} size="medium" />
        </>
      )}

      {category === "rainy" && (
        <>
          <FloatingCloud top="10%" left="10%" delay={0} size="large" />
          <FloatingCloud top="20%" left="60%" delay={2} size="large" />
          <Rain effectIntensity="heavy" />
        </>
      )}

      {category === "stormy" && (
        <>
          <FloatingCloud top="5%" left="5%" delay={0} size="large" stormy />
          <FloatingCloud top="15%" left="60%" delay={1} size="large" stormy />
          <Rain effectIntensity="extreme" />
          <Lightning />
        </>
      )}

      {category === "foggy" && (
        <>
          <FogBand top="30%" delay={0} />
          <FogBand top="50%" delay={3} />
          <FogBand top="70%" delay={6} />
        </>
      )}

      {category === "snowy" && (
        <>
          <FloatingCloud top="15%" left="10%" delay={0} size="medium" />
          <Snow effectIntensity="medium" />
        </>
      )}
    </div>
  );
}

function cnBackground(className?: string): string {
  return `fixed inset-0 z-0 overflow-hidden ${className ?? ""}`;
}

function backgroundGradient(category: string): React.CSSProperties {
  const gradients: Record<string, string> = {
    sunny: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #0f766e 100%)",
    cloudy: "linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)",
    rainy: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
    stormy: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1e293b 100%)",
    foggy: "linear-gradient(135deg, #94a3b8 0%, #64748b 50%, #475569 100%)",
    snowy: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)",
  };
  return { background: gradients[category] || gradients.sunny };
}

/**
 * Nuage flottant avec animation de déplacement.
 */
function FloatingCloud({
  top,
  left,
  delay = 0,
  size = "medium",
  stormy = false,
}: {
  top: string;
  left: string;
  delay?: number;
  size?: "small" | "medium" | "large";
  stormy?: boolean;
}) {
  const sizes: Record<string, { w: string; h: string }> = {
    small: { w: "w-40", h: "h-16" },
    medium: { w: "w-64", h: "h-24" },
    large: { w: "w-96", h: "h-32" },
  };
  const { w, h } = sizes[size];

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{
        x: [0, 100, 0],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
      className={`absolute ${top} ${left} ${w} ${h} ${stormy ? "opacity-60" : "opacity-40"} pointer-events-none`}
      style={{
        background: stormy
          ? "linear-gradient(to bottom, #475569, #334155)"
          : "linear-gradient(to bottom, #ffffff, #cbd5e1)",
        borderRadius: "50% 50% 40% 40% / 30% 30% 40% 40%",
        filter: "blur(20px)",
        mixBlendMode: "soft-light",
      }}
    />
  );
}

/**
 * Pluie animée.
 */
function Rain({ effectIntensity = "medium" }: { effectIntensity?: "light" | "medium" | "heavy" | "extreme" }) {
  const dropCount = effectIntensity === "extreme" ? 80 : effectIntensity === "heavy" ? 50 : 30;
  const drops = Array.from({ length: dropCount }, (_, i) => i);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {drops.map((i) => (
        <motion.div
          key={i}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: 100,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 2,
          }}
          className="absolute w-px h-[20px] bg-blue-400/60 blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * -20}%`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Neige animée.
 */
function Snow({ effectIntensity = "medium" }: { effectIntensity?: "light" | "medium" | "heavy" }) {
  const flakeCount = effectIntensity === "heavy" ? 40 : 25;
  const flakes = Array.from({ length: flakeCount }, (_, i) => i);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flakes.map((i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: 0, opacity: 0 }}
          animate={{
            y: 100,
            x: [0, 20, -20, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 3,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5,
          }}
          className="absolute w-2 h-2 bg-white/60 rounded-full blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * -20}%`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Bande de brouillard animée.
 */
function FogBand({ top, delay }: { top: string; delay: number }) {
  return (
    <motion.div
      initial={{ x: -200, opacity: 0 }}
      animate={{
        x: [0, 300, 0],
        opacity: [0, 0.4, 0.4, 0],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
      className={`absolute ${top} left-0 w-full h-32 bg-white/30 blur-[40px] pointer-events-none`}
    />
  );
}

/**
 * Éclairs pour les orages.
 */
function Lightning() {
  return (
    <motion.div
      animate={{
        opacity: [0, 0, 0.3, 0, 0, 0, 0.1, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "linear",
      }}
      className="absolute inset-0 bg-white/10 pointer-events-none"
    />
  );
}
