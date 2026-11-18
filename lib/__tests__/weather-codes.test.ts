import { describe, it, expect } from "vitest";
import {
  getWeatherDescription,
  getWeatherCodeInfo,
  isRainAlert,
  WEATHER_CODES,
} from "@/lib/weather-codes";

describe("Traduction des codes météo WMO", () => {
  it("retourne 'Ciel dégagé' pour le code 0", () => {
    expect(getWeatherDescription(0)).toBe("Ciel dégagé");
  });

  it("retourne 'Pluie modérée' pour le code 63", () => {
    expect(getWeatherDescription(63)).toBe("Pluie modérée");
  });

  it("retourne 'Orage' pour le code 95", () => {
    expect(getWeatherDescription(95)).toBe("Orage");
  });

  it("retourne 'Temps inconnu' pour un code non répertorié", () => {
    expect(getWeatherDescription(999)).toBe("Temps inconnu");
  });

  it("retourne l'info complète avec icône pour un code connu", () => {
    const info = getWeatherCodeInfo(63);
    expect(info.code).toBe(63);
    expect(info.label).toBe("Pluie modérée");
    expect(info.icon).toBe("CloudRain");
  });

  it("retourne l'icône par défaut pour un code inconnu", () => {
    const info = getWeatherCodeInfo(999);
    expect(info.label).toBe("Temps inconnu");
    expect(info.icon).toBe("Cloud");
  });

  it("tous les codes de WEATHER_CODES ont un libellé et une icône", () => {
    for (const item of WEATHER_CODES) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.icon.length).toBeGreaterThan(0);
    }
  });
});

describe("Règle de vigilance pluie", () => {
  it("déclenche la vigilance quand la pluie atteint 20 mm", () => {
    expect(isRainAlert(20, 0)).toBe(true);
    expect(isRainAlert(25, 0)).toBe(true);
  });

  it("déclenche la vigilance quand la probabilité atteint 80 %", () => {
    expect(isRainAlert(0, 80)).toBe(true);
    expect(isRainAlert(0, 100)).toBe(true);
  });

  it("ne déclenche pas la vigilance en dessous des seuils", () => {
    expect(isRainAlert(19.9, 0)).toBe(false);
    expect(isRainAlert(0, 79)).toBe(false);
    expect(isRainAlert(0, 0)).toBe(false);
  });

  it("déclenche la vigilance si l'un des deux seuils est atteint", () => {
    expect(isRainAlert(20, 0)).toBe(true);
    expect(isRainAlert(0, 80)).toBe(true);
    expect(isRainAlert(30, 90)).toBe(true);
  });
});
