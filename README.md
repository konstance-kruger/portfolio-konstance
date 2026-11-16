# Portfolio Konstance Kruger — Astro, JavaScript et CSS

Magazine numérique en doubles pages : la page d’accueil contient tout le portfolio.

## Démarrer dans VS Code

Ouvrir ce dossier, puis dans le terminal intégré :

```sh
npm install
npm run dev
```

Ouvrir l’adresse locale indiquée par Astro. Après avoir ajouté une image ou une vidéo, relancer `npm run dev` : le site vérifie au démarrage quels fichiers existent.

## Technologies

- **Astro** (seule dépendance) : composants `.astro`, génération d’un site statique.
- **CSS sur mesure** (`src/styles/editorial-journey.css`) : mise en page des doubles pages et animations.
- **JavaScript** (`src/scripts/editorial-journey.js`) : navigation entre les doubles pages, animations, vidéos.
- **Polices** : General Sans et Melodrama (Fontshare, licence ITF Free Font License).

Tailwind et DaisyUI ont été retirés le 16 novembre 2026 : le magazine ne les utilisait pas.

## Organisation

- `src/pages/index.astro` : le magazine. `mentions-legales.astro` : mentions légales. Les autres pages redirigent vers le magazine.
- `src/components/EditorialJourney.astro` : toutes les doubles pages.
- `src/components/Media.astro` : image, vidéo ou emplacement réservé.
- `src/data/profile.js` : e-mail et liens des réseaux.
- `public/assets/images/` et `public/assets/videos/` : médias.
- `IA.md`, `JOURNAL.md`, `QUALITE.md` : livrables demandés par la consigne.

## Publier sur Infomaniak

```sh
npm run build
```

Envoyer le **contenu** du dossier `dist/` dans le dossier web du domaine (FTP ou gestionnaire de fichiers Infomaniak). Ne pas envoyer `node_modules` ni les sources. Une fois le domaine connu, le renseigner dans `astro.config.mjs` (`site`) et dans `public/robots.txt`.
