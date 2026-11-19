# Journal IA — résumé de mon usage de l’IA

## 1. Outils utilisés, étapes et rôle de chacun
- **ChatGPT / Codex** : au départ du projet, pour clarifier le besoin et préparer la structure.
- **Claude (Anthropic)** : pour la réalisation technique. Je lui décris précisément ce que je veux (comportement, mise en page, animation) et il écrit le code correspondant directement dans mon dossier de projet, avec mon autorisation d’accès à ce seul dossier. Je teste chaque résultat dans Safari, je lui renvoie des captures ou des vidéos pour demander des corrections, et je fais moi-même les commits et les envois sur GitHub.

**Qui fait quoi.** La conception est de moi : positionnement, maquettes Figma, direction artistique, choix des animations et de leur rythme, textes, photos, vidéos, affiches, dessins et mascotte (réalisée avec mon équipe). Le code (Astro, CSS, JavaScript) a été écrit par Claude à partir de mes consignes. Et j'ai demandé de mieux structuré ce journal IA à partir de ce que j'ai donné comme informations.

## 2. Mes prompts
Je donne mes consignes en langage courant, souvent avec une capture d’écran ou une vidéo de référence. À l’origine, je rédige un grand prompt pour expliquer le concept, ma maquette et mes inspirations, afin que l’IA comprenne ce que je cherche réellement. Si elle fait une erreur, je lui dis précisément ce qu’il faut arranger.

Exemples réels :
- « J’aime la façon dont ça transitionne, juste que les affiches arrivent moins vite. »
- « Arrête de faire des transitions en transparence. Juste tout à droite et aligné à droite, et la même chose pile poil mais à gauche pour les logiciels. »
- « Pour la page contact, fais-la apparaître comme si on scrollait sur la gauche, mais on scrolle vers le bas, avec les réseaux sociaux d’un côté et de l’autre un formulaire et un endroit où télécharger mon CV. »
- « Relis tout l’énoncé du prof et dis-moi ce qui va et ce qui ne va pas. »

## 3. Ce que l’IA m’a apporté
- Transformer mes maquettes Figma en code Astro, CSS et JavaScript, et me faire gagner un temps énorme sur les animations liées au défilement (textes qui s’écrivent, transitions des affiches, page À propos puis Contact, stickers déplaçables).
- Un audit complet de mon site par rapport à l’énoncé (accessibilité, performance, mentions légales, code inutile) pour m’assurer de répondre à toutes les consignes.
- Des propositions de concepts pour les animations, parmi lesquelles j’ai choisi.
- Des explications du code, pour pouvoir le défendre.

## 4. Ce que j’ai dû corriger, rejeter ou imposer
- **Propositions rejetées :** un site qui ne respectait pas mes maquettes, le rose corail, des objets décoratifs inventés ; pour la page À propos, les cercles de langues, les éléments qui tombent, la carte avec stickers (« c’est moche »), le cadre autour du texte, un texte trop long, des compétences présentées comme un sommaire.
- **Réglages imposés :** compétences et logiciels en simple texte, en alternant Melodrama et General Sans ; compétences à droite, logiciels à gauche ; apparition une par une ; aucune transition en transparence ; arrivée des affiches ralentie ; billet du hero sans texte ; menu et sous-menus de mon choix ; écran de chargement testé puis abandonné parce qu’il ne me convenait pas.
- **Erreurs techniques à faire corriger :** texte du billet qui débordait dans Safari, images qui ne s’affichaient pas, page À propos qui s’effondrait, sous-menus mal alignés, contrastes insuffisants, ballon dessiné déformé, affiches mal affichées sur mobile, police d’essai non publiable remplacée par une police libre.

## 5. Ce que je comprends et sais expliquer
Je m’entraîne à expliquer : les variables CSS pilotées par le défilement, `position: sticky`, `IntersectionObserver`, le texte lettre par lettre, `prefers-reduced-motion`, Netlify Forms. Le détail est dans `docs/SOUTENANCE.md`, et `grid-site.js` commence par un guide de lecture. Je ne revendique que le niveau technique que je sais défendre devant le jury.
