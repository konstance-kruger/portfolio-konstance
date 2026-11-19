# Déclaration d’usage de l’IA

## ChatGPT / Codex — 6 novembre 2026

- Étapes : clarification du besoin, proposition de structure et préparation du développement.
- Production : arborescence, pages HTML de départ, CSS de structure, menu JavaScript et documentation.
- Sources : échanges avec Konstance, consigne universitaire, cahier des charges, maquettes et moodboards fournis.
- Modifications, corrections et propositions rejetées par Konstance : à renseigner au fil de sa relecture ; aucune validation du code ne doit être présumée.
- Compréhension et maîtrise : à vérifier ensemble avant la soutenance.

Ajouter les autres outils et les usages réels au fur et à mesure.

## Conversion technique — 6 novembre 2026

À la demande de Konstance : remplacement du socle HTML par Astro, composants partagés, JavaScript et intégration Tailwind/DaisyUI avec thème personnalisé. Documentation adaptée.

## Développement de l’accueil — 6 novembre 2026

Création des composants Hero, Presentation, Projects, Contact et Media. Parcours vertical, palette exacte et navigation par ancres. Révélations simples avec IntersectionObserver ; transformation du Hero et animation de cadrage encore à développer. Polices de secours provisoires, coordonnées et médias non fournis.

## Hero et blanc pur
Recomposition du Hero depuis la maquette : prénom fin, nom gras incliné, ovale lime, accent PASSION rose. Fonds beiges remplacés par #FFFFFF. Familles chargées via Fontshare ; Melodrama inclinée par le navigateur. Objets originaux encore à fournir (hero-tshirt.webp, hero-ticket.webp, hero-etoile.webp, hero-television.webp).

## Claude (Anthropic) — novembre 2026

Outil : Claude, assistant d’Anthropic. Il a écrit directement les fichiers dans le dossier du projet, avec mon autorisation d’accès à ce seul dossier. Je teste dans Safari et je commit / pousse moi-même sur GitHub.

### Étapes et usages
- 6–16 novembre : intégration de mes maquettes en magazine, contrôle du cahier des charges, mise en ligne (voir JOURNAL.md).
- 17–19 novembre : nouvelle direction artistique « grille » : transitions au défilement, À propos, Contact, menu, billet du hero ; audit de l’énoncé ; correction de l’accessibilité, des mentions légales, nettoyage et commentaires du code.

### Ce que Claude a produit
- `src/components/GridSite.astro`, `src/styles/grid-site.css`, `src/scripts/grid-site.js` (toute la longue page), `Media.astro`, `BaseLayout.astro`, mentions légales, documents du dépôt.
- Les photos, vidéos, dessins, affiches, mascotte, textes de présentation et choix de design viennent de moi et de mon équipe.

### Ce que j’ai rejeté, corrigé ou imposé
- J’ai rejeté la première proposition (page sans mes maquettes), le rose corail, les objets décoratifs, puis, pour la page À propos : les cercles de langues, les éléments qui tombent, la carte avec stickers (« c’est moche »), le cadre autour du texte, le texte trop long (réduit à : 19 ans, cheffe de projet, BUT 2), les compétences présentées comme un sommaire.
- J’ai imposé : compétences et logiciels en simple texte (Melodrama / General Sans en alternance), à droite pour les compétences et à gauche pour les logiciels, apparition une par une, aucune transition en transparence ; Contact qui arrive depuis la droite ; formulaire blanc encadré aux couleurs du site ; menu et sous-menus de mon choix ; billet du hero sans texte.
- J’ai ralenti l’arrivée des colonnes d’affiches (seulement à l’entrée, pas pendant le défilement).
- Textes : ils viennent de moi (qualités, parcours, objectif). Claude les a seulement mis en forme.
- Police « PASSION » : Dirty Stains DEMO retirée (licence), remplacée par Rubik Spray Paint (OFL), que j’ai validée.

### Compréhension et maîtrise
À savoir expliquer : voir la liste « Notions à savoir expliquer » dans `docs/SOUTENANCE.md` (variables CSS pilotées par le défilement, `position: sticky`, `IntersectionObserver`, texte lettre par lettre, `prefers-reduced-motion`, Netlify Forms).
