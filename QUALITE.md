# Vérifications qualité

Site : une seule longue page très visuelle (photos, vidéo, animations au défilement) + mentions légales. Un formulaire de contact (Netlify Forms), aucun cookie. « À faire » = pas encore vérifié.

## Accessibilité

| Critère | Vérification | Résultat / correction |
| --- | --- | --- |
| Mesure automatique | PageSpeed Insights (Lighthouse) sur portfolio.kkruger.fr, le 19/11 | Accessibilité 100 en mobile et en desktop ; bonnes pratiques 100 ; SEO 100 ; mentions légales 100 |
| Langue, lien d’évitement | Code : `lang="fr"`, « Aller au contenu » | Conforme |
| Structure | Un seul `<main>` (doublon supprimé le 19/11), un `h1`, `h2` par grande partie | Conforme |
| Texte animé lettre par lettre | Lettres en `aria-hidden`, texte complet dans un `<span class="sr-only">` (l’`aria-label` sur `<p>` est interdit) | Corrigé le 19/11 ; test VoiceOver : à faire |
| Contrastes | Lighthouse + calcul WCAG | Rose vif #e94bb0 en petit texte (3,4:1) remplacé par #b3217b (6,1:1) ; sur gris foncé, texte lime (9,7:1) ; boutons au survol fond foncé + texte lime |
| Nom du lien logo | Lighthouse (« label in name ») | Libellé visible repris tel quel |
| Animations réduites | Code `prefers-reduced-motion` : animations et lecture automatique coupées, page empilée lisible | Conforme |
| Clavier | Sous-menus ouverts aussi au focus (`:focus-within`) | Test réel au clavier dans Safari : à faire |
| Alternatives | Photos décrites, dessins décoratifs `alt=""` | Conforme |

## Sobriété et performance

| Critère | Vérification | Résultat / correction |
| --- | --- | --- |
| Poids du site | Dossier `dist` (19/11) | 8,3 Mo → 4,4 Mo : vidéo 4,3 → 2,3 Mo, canette PNG → WebP (362 → 26 Ko), police du mot « Passion » réduite à ses lettres (120 → 9 Ko), photo trop grande redimensionnée, fichiers inutilisés supprimés |
| Téléphone | Écran ≤ 760 px | Mode simple : pas de texte lettre par lettre, de parallaxe ni de transitions ; la vidéo n’est pas téléchargée (image d’affiche à la place) ; moins de calculs, de données et de batterie |
| Polices | Fontshare (3 feuilles) | Chargées sans bloquer l’affichage (`media="print"` + `onload`) ; police du mot « Passion » hébergée (≈ 15 Ko) |
| Code inutile | Analyse des classes CSS non utilisées | CSS 87 Ko → 65 Ko, anciennes pages et scripts supprimés, JS « cercles » retiré |
| Images | WebP, `loading="lazy"` | Présent |
| Mesure Lighthouse (19/11, local) | Performance, bonnes pratiques, SEO | Mobile : 89 / 96 / 100 ; desktop : 99 / 96 / 100 ; décalage de mise en page (CLS) 0 ; LCP 3,7 s en mobile simulé (réseau lent), 0,8 s en desktop |
| Décalage de mise en page | Lighthouse : CLS 0,27 au départ, dû au nom du hero qui changeait de place quand la police se chargeait | Corrigé le 19/11 : les textes du hero restent invisibles jusqu'au chargement des polices, puis s'affichent à leur place (CLS 0) |
| Mesure en ligne (PageSpeed Insights, 19/11) | Performance / accessibilité / bonnes pratiques / SEO sur portfolio.kkruger.fr | Mobile : 77 / 100 / 100 / 100 ; desktop : 83 / 100 / 100 / 100. Performance correcte pour un site très visuel (images, vidéo, animations au scroll) ; piste d'amélioration : alléger encore les médias |

## Référencement

| Critère | Résultat |
| --- | --- |
| Lighthouse SEO | 100 / 100 |
| Titre, description, balises de partage, canonique, `robots.txt`, `sitemap.xml` | Présents ; plan du site mis à jour le 19/11 |
| Anciennes adresses | `/caps/`, `/spac/`, `/a-propos/`, `/contact/`, `/creations/` redirigent (301) vers la bonne partie de la page |

## Conformité juridique

| Critère | Résultat / correction |
| --- | --- |
| Mentions légales | Réécrites le 19/11 : éditrice, hébergeur Netlify, domaine Infomaniak |
| Données personnelles | Formulaire (nom, e-mail, message) : finalité, base légale, destinataire Netlify, durée (12 mois max.), droits, CNIL ; aucun cookie |
| Polices | General Sans et Melodrama (ITF Free Font License, Fontshare) ; Rubik Spray Paint (SIL OFL 1.1) ; Dirty Stains DEMO retirée |
| Crédits | « © Ethan HDM » (Nuit du volley) ; mascotte SPAC : créée avec l’équipe SPAC |
| Droit à l’image | Personnes connues et d’accord ; procédure de retrait indiquée |
| Lien depuis le site | Lien « Mentions légales » ajouté sur la page Contact |

## Tests d’affichage

- Compilation Astro sans erreur (19/11).
- Captures comparées avant / après nettoyage du CSS (22 positions de défilement, ordinateur 1440 × 900) : rendu identique.
- Capture mobile 390 px : À propos, Contact et menu corrigés (accueil masqué dans le menu, À propos avant Contact).
- Safari, iPhone réel, VoiceOver, envoi réel du formulaire : à faire.
