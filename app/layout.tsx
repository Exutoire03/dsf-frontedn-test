import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Météo Bénin - Prévisions locales",
  description:
    "Météo actuelle et prévisions sur 7 jours pour les localités du Bénin. Application en français pour les agents de préfecture, mairies et protection civile.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr-FR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
