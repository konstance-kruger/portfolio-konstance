# Portfolio Konstance Kruger — Astro, JavaScript et CSS

Portfolio en une seule longue page (direction artistique « grille ») : fond quadrillé, menu collé en haut, parallaxe, textes qui s’écrivent au défilement, stickers déplaçables.

- Site en ligne : https://portfolio.kkruger.fr
- Dépôt GitHub : https://github.com/konstance-kruger/portfolio-konstance

## Démarrer dans VS Code

Ouvrir ce dossier, puis dans le terminal intégré :

```sh
npm install
npm run dev
```

Ouvrir l’adresse locale indiquée par Astro. Après avoir ajouté une image ou une vidéo, relancer `npm run dev` : le site vérifie au démarrage quels fichiers existent.

## Technologies

- **Astro** (seule dépendance) : composants `.astro`, génération d’un site statique.
- **CSS sur mesure** (`src/styles/grid-site.css`) : mise en page de la longue page, transitions pilotées par le défilement (variables CSS `--sw`, `--turn`…).
- **JavaScript** (`src/scripts/grid-site.js`) : lit la position de défilement et met à jour ces variables ; textes écrits lettre par lettre ; stickers déplaçables ; vidéos.
- **Polices** : General Sans et Melodrama (Fontshare, licence ITF Free Font License) ; Rubik Spray Paint pour le mot « Passion » (licence SIL OFL, hébergée dans `public/assets/fonts/`).
- **Formulaire de contact** : géré par Netlify Forms (attribut `data-netlify="true"`), à activer dans l’interface Netlify (rubrique « Forms »).

Tailwind et DaisyUI ont été retirés le 16 novembre 2026 : le site ne les utilisait pas.

## Organisation

- `src/pages/index.astro` : la longue page. `mentions-legales.astro` : mentions légales. Les anciennes adresses (`/caps/`, `/spac/`…) redirigent vers la bonne partie de la page.
- `src/components/GridSite.astro` : tout le contenu de la longue page (accueil, CAPS, vie au campus, affiches, à propos, contact).
- `src/components/Media.astro` : image, vidéo ou emplacement réservé.
- `src/data/profile.js` : e-mail et liens des réseaux. `src/data/skills.js` : compétences et logiciels.
- `public/assets/images/` et `public/assets/videos/` : médias. Les affiches sont lues automatiquement dans `public/assets/images/affiches/`.
- `public/assets/documents/` : le CV doit s’appeler `cv-konstance-kruger.pdf` (voir `LISEZMOI.txt`).
- `IA.md`, `JOURNAL.md`, `QUALITE.md`, `docs/` : livrables demandés par la consigne.

## Publier sur Netlify

Le VPS de l’école étant bloqué, le site est hébergé sur Netlify. Le nom de domaine `kkruger.fr` reste chez Infomaniak : un enregistrement DNS **CNAME** `portfolio` pointe vers `portfolio-kkruger.netlify.app`.

- `netlify.toml` : Netlify lance `npm run build` et publie `dist/` (Node 22).
- `public/_redirects` : redirections des anciennes adresses.
- Le HTTPS (certificat Let’s Encrypt) est fourni et renouvelé automatiquement par Netlify.

Avec le dépôt GitHub relié à Netlify, chaque `git push` met le site à jour.
