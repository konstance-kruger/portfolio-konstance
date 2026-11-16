# Accueil — comprendre et vérifier

index.astro assemble les composants ; BaseLayout fournit les métadonnées, l’en-tête et le pied de page. Un composant est une partie réutilisable de l’interface. Les données de contact sont dans src/data/profile.js.

Media.astro vérifie les fichiers au moment du build : déposer portrait-hero.webp, caps-cover.webp, bde-cover.webp et affiche-01.webp dans public/assets/images. Relancer npm run build pour mettre à jour le site publié. Les fichiers absents laissent place à des blocs explicitement provisoires.

revelations : IntersectionObserver observe l’entrée d’un bloc dans la fenêtre. Une classe CSS déclenche une transition, puis l’observation s’arrête. Si prefers-reduced-motion demande moins de mouvement, aucun masquage n’est appliqué. Aucun scroll forcé.

Vérifier avec npm run dev : menu mobile, liens vers les ancres et pages projets, navigation au clavier, largeur 375px puis ordinateur, absence de débordement et lecture sans JavaScript. Les coordonnées étant vides, aucun faux lien de contact n’apparaît.

À expliquer au jury : composants et props Astro, slot, variables CSS, media queries, événements et classes CSS, IntersectionObserver, différence entre build et JavaScript navigateur.

Encore à faire : véritables polices et licences, validation visuelle du Hero avec portrait, animations synchronisées au scroll, galerie et contact réel. Aucun audit navigateur final déclaré.
