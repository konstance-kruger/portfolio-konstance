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

## Claude (Anthropic) — novembre 2026, jusqu’au 16 novembre

Outil : Claude, assistant conversationnel d’Anthropic, utilisé dans l’application Claude. À partir du 16 novembre, Claude a aussi écrit directement les fichiers dans le dossier du projet, avec mon autorisation d’accès à ce seul dossier.

### Étapes et usages
- Intégration de mes maquettes Figma (doubles pages « MacBook Air ») en Astro, CSS et JavaScript.
- Navigation « magazine » : caméra qui se déplace entre les doubles pages, molette, clavier, tactile, sommaire.
- Animations d’arrivée (lettres, photos, traits), inspirées de références Awwwards que j’ai fournies (vivmgmt).
- Contrôle du site par rapport au cahier des charges et corrections techniques (voir plus bas).

### Ce que Claude a produit
- `src/components/EditorialJourney.astro` (structure des doubles pages), `src/styles/editorial-journey.css` (mise en page et animations), `src/scripts/editorial-journey.js` (navigation et animations).
- Correctif de `src/components/Media.astro` : les images ne s’affichaient pas (mauvais chemin) ; option pour une vidéo sans bouton de son.
- 16 novembre : page des mentions légales, redirection des anciennes pages, favicon, `robots.txt`, balises de partage, compression des images, retrait de Tailwind et DaisyUI (non utilisés), premier jet de ce paragraphe, de l’entrée du journal et de la grille qualité.

### Ce que j’ai rejeté, corrigé ou imposé
- J’ai rejeté la première proposition de Claude (une page en défilement unique, sans mes maquettes) : j’ai demandé que le site reproduise fidèlement mes maquettes.
- J’ai interdit le rose corail proposé et limité les polices à Melodrama et General Sans.
- J’ai fait retirer les objets décoratifs (manette, micro, canette…) et le ballon choisi par Claude, remplacés par mes propres dessins (ballon enflammé, mains qui filment).
- J’ai choisi l’ordre des chapitres et des pages, supprimé des pages (« Mon univers », « Imaginer », « Créer ») et ajouté les pages Vie au campus, SPAC, Festival Inouï, Journée portes ouvertes, Podcast et Tournois e-sport d’après mes maquettes.
- J’ai fait corriger : la mauvaise photo SPAC, la mascotte qui touchait le texte, le titre e-sport trop petit, la lettre « S » coupée, l’ajout de légendes, le fondu noir sous les textes, la vidéo CAPS sans son.
- Textes : ceux des pages viennent de mes maquettes ; Claude a corrigé l’orthographe (« événements », « détendus », « voire »). La citation de la page « À propos » a été proposée par Claude : à remplacer ou valider avec mes propres mots.

### Compréhension et maîtrise
À travailler avant la soutenance, pour pouvoir expliquer chaque partie : déplacement de la caméra (`transform: translate3d`), détection d’un geste de molette, `IntersectionObserver` sur mobile, ajustement des titres à la largeur (`fitTitles`), animations CSS déclenchées par la classe `.is-shown`.
