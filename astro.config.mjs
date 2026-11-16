// CONFIGURATION — Génère un site statique (fichiers HTML, CSS, JS prêts à héberger).
// site : adresse du portfolio en ligne ; active l'adresse canonique et le partage sur les réseaux.
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  site: 'https://portfolio.kkruger.fr',
});
