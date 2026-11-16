// CONFIGURATION — Génère un site statique (fichiers HTML, CSS, JS prêts à héberger).
// site : à renseigner avec le nom de domaine (ex. 'https://konstancekruger.fr') pour
// activer l'adresse canonique et le partage sur les réseaux.
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  // site: 'https://VOTRE-DOMAINE',
});
