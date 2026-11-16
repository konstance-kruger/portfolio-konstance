# Journal de bord

## 6 novembre 2026

- Clarification du positionnement événementiel et audiovisuel.
- Confirmation des associations CAPS et SPAC, des couleurs et des typographies.
- Création du socle local, des pages navigables et des dossiers pour VS Code avec Codex.
- Création du menu mobile et des premiers styles de structure.
- À faire : direction artistique finale, médias, trois études de cas, contact et mise en ligne.

À compléter chaque semaine : travail réalisé, difficultés, décisions et raisons. Ne consigner que le travail réellement effectué.

- Changement de stack demandé : Astro, JavaScript, CSS et DaisyUI. Création des composants partagés et adaptation des chemins.

## Développement de l’accueil — 6 novembre 2026

Création des composants Hero, Presentation, Projects, Contact et Media. Parcours vertical, palette exacte et navigation par ancres. Révélations simples avec IntersectionObserver ; transformation du Hero et animation de cadrage encore à développer. Polices de secours provisoires, coordonnées et médias non fournis.

- Pages CAPS, SPAC et créations structurées avec les éléments réels fournis ; processus détaillés et bilans à compléter. Contact et présentation dédiés réutilisent les composants de l’accueil.

## Hero et blanc pur
Recomposition du Hero depuis la maquette : prénom fin, nom gras incliné, ovale lime, accent PASSION rose. Fonds beiges remplacés par #FFFFFF. Familles chargées via Fontshare ; Melodrama inclinée par le navigateur. Objets originaux encore à fournir (hero-tshirt.webp, hero-ticket.webp, hero-etoile.webp, hero-television.webp).

## Novembre 2026 — intégration des maquettes avec Claude (dates à préciser)

- Passage du site « une seule page qui défile » à un magazine en doubles pages, d’après mes maquettes Figma.
- Première proposition rejetée (ne respectait pas mes maquettes) ; règles fixées : deux polices, palette sans rose corail, pas d’objets décoratifs.
- Ajout des pages CAPS (présentation vidéo, Nuits du sport, Podcast, Tournois e-sport), Vie au campus, SPAC, Festival Inouï et Journée portes ouvertes.
- Difficultés : images qui ne s’affichaient pas (chemin incorrect dans Media.astro, corrigé) ; une ancienne version du CSS restée dans mon projet a cassé plusieurs pages, corrigée en remplaçant le fichier.

## 16 novembre 2026

- Ajout de mes dessins (ballon, mains), fondu noir sous les textes des photos, vidéo CAPS muette en boucle.
- Contrôle du projet point par point avec le cahier des charges : manquent les trois études de cas, le contact, le dépôt Git, la mise en ligne, LinkedIn.
- Corrections : mentions légales complétées et accessibles depuis le sommaire, anciennes pages redirigées vers le magazine, favicon, robots.txt, balises de partage, images compressées (7,5 Mo → 0,8 Mo).
- Décision : retrait de Tailwind et DaisyUI, que le magazine n’utilisait pas (code chargé pour rien) ; le site n’utilise plus qu’Astro et du CSS écrit sur mesure.
- Décision : le chapitre « Créer » s’affiche seulement quand mes créations sont déposées, pour ne pas publier de pages vides.
- Constat : le projet n’était pas suivi par Git. Dépôt à créer maintenant ; je ne reconstitue pas d’historique fictif.
- Mise en ligne : nom de domaine kkruger.fr (Infomaniak), sous-domaine portfolio.kkruger.fr. Le VPS de l’école prévu en cours étant bloqué, décision d’héberger le site sur Netlify (HTTPS automatique) ; le DNS du sous-domaine pointe vers Netlify.
- Dépôt GitHub créé et rendu public : https://github.com/konstance-kruger/portfolio-konstance. Netlify est relié au dépôt : chaque envoi (Sync Changes) republie le site.
- HTTPS : premier échec du certificat Let’s Encrypt (« We could not provision a certificate ») car le domaine n’était pas encore ajouté dans Netlify. Après ajout de portfolio.kkruger.fr dans Domain management et vérification du DNS (CNAME seul, aucun enregistrement CAA bloquant), certificat obtenu. Site en ligne sur https://portfolio.kkruger.fr, domaine principal du projet Netlify.
