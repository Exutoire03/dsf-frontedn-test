# Meteo Benin – Previsions locales pour les collectivites

Application web simple et rapide qui affiche la météo actuelle et les prévisions sur 7 jours pour n'importe quelle localité du Bénin. Conçue pour les agents de préfecture, mairies et protection civile, en français, sans clé d'API.

## Démo en ligne

[URL à indiquer après déploiement sur Vercel]

## Installation et démarrage

### Prérequis
- Node.js 18 ou supérieur
- npm

### Lancer en développement

```bash
# Cloner le dépôt
git clone <URL_DU_DEPOT>
cd dsf-frontedn-test

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application est alors accessible sur `http://localhost:3000`.

### Build de production

```bash
npm run build
npm run start
```

### Lancer les tests automatisés

```bash
npm test
```

## Fonctionnalités

### Socle obligatoire (100% implémenté)

| Fonctionnalité | Statut |
|----------------|--------|
| Recherche de localité au Bénin (à partir de 2 caractères, debounce 300ms) | ✅ |
| Météo actuelle : température, ressenti, humidité, vent, description FR, pictogramme | ✅ |
| Prévisions sur 7 jours : date FR, min/max, pluie (1 décimale), probabilité, pictogramme | ✅ |
| Favoris : ajout/retrait, persistance après rechargement, pas de doublons | ✅ |
| États de feedback : chargement, aucun résultat, erreur API avec bouton "Reessayer" | ✅ |
| Pas de page blanche, messages en français clairs | ✅ |

### Règles de gestion respectées

- Recherche à partir de 2 caractères, pas de requête à chaque frappe (debounce)
- Seules les localités du Bénin (countryCode=BJ)
- Dates et heures à l'heure du Bénin (GMT+1, fuseau Africa/Porto-Novo)
- Températures en °C arrondies à l'entier, vent en km/h, pluie en mm avec une décimale
- Badge "Vigilance pluie" visible si cumul ≥ 20 mm ou probabilité ≥ 80 %
- Une localité ne figure qu'une seule fois dans les favoris
- Responsive mobile-first (360 px et plus), pas de défilement horizontal
- Jamais de page blanche, jamais de message technique incompréhensible

### Bonus réalisés (5 sur 6)

| Bonus | Statut |
|-------|--------|
| Adresse partageable : la localité affichée apparaît dans l'URL (`?locality=Nom`) | ✅ |
| Bouton "Ma position" avec géolocalisation et message clair en cas de refus | ✅ |
| Navigation complète au clavier et règles d'accessibilité WCAG 2.1 | ✅ |
| Graphique de l'évolution température/pluie sur 24 heures (Recharts) | ✅ |
| Tests automatisés (traduction codes météo + règle vigilance pluie) | ✅ |
| Déploiement en ligne | À venir (voir ci-dessous) |

## Choix techniques

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Framework | Next.js 16 (App Router) | Routing fichier-based, déploiement facile sur Vercel, rendu serveur/client hybride |
| Langage | TypeScript | Sécurité du code, lisibilité, maintenabilité |
| Styling | Tailwind CSS v4 | Design mobile-first, responsive, cohérent, sans fichiers CSS volumineux |
| Animations | Framer Motion | Transitions fluides, apparitions échelonnées, header qui se cache au scroll |
| Icônes | Lucide React | Icônes propres, légères, accessibles |
| Graphique | Recharts | Graphique réactif, léger, personnalisable |
| Tests | Vitest | Tests unitaires rapides, configuration minimale |
| Requêtes API | fetch natif | Pas de dépendance supplémentaire, Open-Meteo est simple |
| Persistance favoris | localStorage | Pas de backend requis, persistance navigateur |

### Organisation du code

```
app/
  layout.tsx      # Racine : métadonnées, langue fr-FR
  page.tsx        # Server Component : lit l'URL (?locality=) via Suspense
components/
  ui/             # Design système : Button, Card, Badge, Input, Label, Skeleton
  weather/        # Composants métiers :
    WeatherApp.tsx        # Orchestrateur client (état, favoris, retry, géolocalisation)
    Hero.tsx              # Page d'accueil immersive avec image de fond
    SearchBar.tsx         # Recherche avec debounce, navigation clavier, ARIA
    CurrentWeather.tsx    # Météo actuelle, grande température, icône météo
    DailyForecast.tsx     # Prévisions 7 jours + badge Vigilance pluie
    FavoriteButton.tsx    # Ajouter/retirer favori (étoile)
    RetryButton.tsx       # Bouton Reessayer
    WeatherIcon.tsx       # Icône selon code WMO
    WeatherBackground.tsx # Fond animé selon la météo (soleil, pluie, orage, etc.)
    HourlyChart.tsx       # Graphique 24h (Recharts)
hooks/
  useDebounce.ts   # Anti-spam d'appels API (300ms)
  useFavorites.ts  # localStorage, pas de doublons
  useWeather.ts    # État chargement/données/erreur + retry
lib/
  api.ts           # Appels Open-Meteo (géocodage BJ + prévisions)
  weather-codes.ts # Mapping codes WMO → libellé FR + icône + règle vigilance
  utils.ts         # Utilitaire cn() pour Tailwind
types/
  index.ts         # Types TypeScript stricts
lib/__tests__/
  weather-codes.test.ts  # Tests unitaires (traduction + vigilance)
public/
  Statue africaine en bronze sous un ciel bleu.png  # Image de fond d'accueil
```

## État d'avancement

Le socle obligatoire est entièrement fonctionnel et vérifié par le build de production. Les 5 premiers bonus sont implémentés. Le déploiement en ligne est la dernière étape.

## Déploiement en ligne (Vercel)

1. Pousser ce dépôt sur GitHub (dépôt public ou privé avec accès aux adresses du jury).
2. Se connecter sur [vercel.com](https://vercel.com) avec un compte GitHub.
3. Cliquer sur "Add New Project" et importer ce dépôt.
4. Vercel détecte automatiquement Next.js et propose les bons réglages.
5. Cliquer sur "Deploy".
6. Une fois déployé, indiquer l'URL Vercel dans ce README (section "Demo en ligne").

## Remise du travail

- Dépôt Git accessible au jury (GitHub, GitLab ou équivalent).
- Envoyer l'URL du dépôt par email avant la fin du temps imparti.
- Objet : `Étude de cas DSF 2026 – Frontend – [Votre Nom]`
- Destinataire : fhounmenou@asin.bj
- Copie : jbgandonou@presidence.bj, olabissi@wds.africa, serge@wds.africa

## Données

Les données météorologiques proviennent de [Open-Meteo](https://open-meteo.com), un service public gratuit sans clé d'API. La recherche de localités utilise l'API de géocodage d'Open-Meteo, limitée aux localités du Bénin (countryCode=BJ).
