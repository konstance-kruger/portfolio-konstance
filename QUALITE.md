# Vérifications qualité

Grille construite pour ce site : un magazine d’une seule page, très visuel (photos, vidéo, animations), navigué à la molette, au clavier et au doigt, sans formulaire ni cookie. Chaque ligne indique ce qui a été réellement vérifié, comment, et ce qui a été corrigé. « À faire » = pas encore vérifié.

## Accessibilité

| Critère | Vérification | Résultat / correction |
| --- | --- | --- |
| Langue de la page | Code : `<html lang="fr">` | Conforme |
| Lien d’évitement | Code : « Aller au contenu » vers `#contenu` | Présent |
| Navigation au clavier | Code : flèches, Page suivante/précédente, Tab sur le sommaire ; doubles pages hors écran rendues inertes (`inert`) | Implémenté — test réel au clavier dans Safari : à faire |
| Focus visible | Code : contour 2 px gris foncé sur tous les éléments | Présent |
| Animations réduites | Code : toutes les animations dépendent de `prefers-reduced-motion: no-preference` ; vidéo non lancée sinon | Conforme ; vérifié en capture avec le réglage « réduire les animations » |
| Textes alternatifs | Relecture de chaque image : photos décrites, dessins décoratifs en `alt=""` | Conforme |
| Lisibilité des textes blancs sur photo | Captures des pages Inouï, Radio Campus, Journée portes ouvertes | Fondu noir ajouté sous les textes (16/11) |
| Contraste du texte gris foncé #323232 sur rose #F0C6DE et lime #C7F000 | Calcul du rapport de contraste (formule WCAG) | 8,4:1 sur rose et 9,7:1 sur lime : conforme (seuil 4,5:1) |
| Lecteur d’écran | VoiceOver sur Mac | À faire |

## Sobriété et performance

| Critère | Vérification | Résultat / correction |
| --- | --- | --- |
| Poids des photos | Mesure des fichiers de `public/assets/images` | 7,5 Mo → 0,8 Mo : conversion WebP avec perte (qualité 80), 1 800 px maximum (16/11) |
| Code inutile | Recherche des classes Tailwind/DaisyUI dans le projet | Non utilisées par le magazine : retirées (16/11) |
| Vidéo | Code : `preload="none"`, lecture seulement sur sa double page, pause ailleurs | Conforme |
| Chargement des images | Code : `loading="lazy"` sur les photos | Présent |
| Mesure globale | Lighthouse (Chrome) ou EcoIndex sur le site en ligne | À faire après mise en ligne |

## Référencement

| Critère | Vérification | Résultat / correction |
| --- | --- | --- |
| Titre et description | Code de `BaseLayout.astro` | Description rendue précise (16/11) |
| Structure des titres | Un seul `h1` (mon nom), `h2` par double page | Conforme |
| Anciennes pages en double | Liste des pages générées | `/caps/`, `/spac/`, `/a-propos/`, `/contact/`, `/creations/` redirigent vers le magazine : redirection 301 Netlify (`_redirects`) et page de secours Astro (16/11) |
| robots.txt, plan du site, favicon, partage, adresse canonique | Fichiers et balises, `https://portfolio.kkruger.fr` | Ajoutés (16/11) |

## Conformité juridique

| Critère | Vérification | Résultat / correction |
| --- | --- | --- |
| Mentions légales accessibles | Depuis l’accueil | Lien ajouté dans le sommaire (16/11) |
| Éditrice et hébergeur | Contenu de la page | Hébergeur Netlify, Inc. (adresse de ses conditions contractuelles) ; domaine chez Infomaniak ; mon e-mail affiché (16/11) |
| Crédits photo | Relecture des photos | « © Ethan HDM » pour la Nuit du volley ; auteur de la mascotte SPAC : à préciser |
| Droit à l’image | Personnes identifiables sur les photos | Procédure de retrait indiquée ; accords des personnes : à obtenir |
| Polices | Licence | ITF Free Font License (Fontshare), mentionnée |
| Données personnelles | Cookies, formulaires, statistiques | Aucun ; transmission technique de l’IP à Netlify (États-Unis) et Fontshare signalée |

## Tests d’affichage réalisés

- Compilation Astro sans erreur (16/11).
- Captures de chaque double page à 1280 × 832 et 1260 × 648 (format de mon écran) : pas de chevauchement.
- Version mobile, Safari et iPhone : à faire.
