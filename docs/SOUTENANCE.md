# Préparation et livrables

Liens rendus le 16 novembre 2026. Le site continue d’évoluer ensuite (modifications autorisées). Les projets présentés ont été validés par l’enseignant.

- [x] Site sur le nom de domaine, hébergé sur Netlify (HTTPS).
- [x] Dépôt GitHub public.
- [x] JOURNAL.md, IA.md et QUALITE.md mis à jour le 19 novembre 2026.
- [x] Note de positionnement (`docs/POSITIONNEMENT.md`).
- [x] Mentions légales à jour (formulaire, polices, crédits).
- [ ] CV au format PDF à déposer : `public/assets/documents/cv-konstance-kruger.pdf`.
- [ ] Formulaire : activer « Forms » dans Netlify et envoyer un message de test.
- [ ] Vérifier sur le site en ligne : Lighthouse, Safari, iPhone, lecteur d’écran (VoiceOver).
- [ ] Présentation orale (8 minutes) et explication d’une portion de code entraînées.

## Notions à savoir expliquer (code)

- **Composant Astro** : partie réutilisable ; `GridSite.astro` contient la page, `Media.astro` affiche une image ou une vidéo. Le code entre `---` s’exécute au build ; le script `grid-site.js` s’exécute dans le navigateur.
- **Variables CSS pilotées par le défilement** : `grid-site.js` calcule une progression entre 0 et 1 (`getBoundingClientRect`) et l’écrit dans `--turn`, `--sw`… ; le CSS les lit dans `calc()` pour déplacer les blocs (`translate`). Voir `updateTurns()`.
- **position: sticky** : la scène À propos / Contact reste collée pendant que la zone haute défile.
- **IntersectionObserver** : prévient quand un élément entre dans l’écran (photos qui se dévoilent, vidéos, mascotte).
- **Texte lettre par lettre** : chaque lettre devient un `<span>` ; le nombre de lettres allumées dépend du défilement. Le texte complet est aussi dans un `<span class="sr-only">` pour les lecteurs d’écran.
- **prefers-reduced-motion** : si la personne demande moins d’animations, elles sont coupées.
- **Netlify Forms** : `data-netlify="true"` sur le `<form>` suffit ; Netlify récupère les messages à la mise en ligne.
