// ACCESSIBILITÉ — Les utilisateurs demandant moins de mouvements voient le contenu immédiatement.
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const elements = document.querySelectorAll('[data-reveal]');
// APPARITIONS — N’active les transitions que pour les éléments encore sous l’écran.
if (!preference.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    // VISIBILITÉ — Révèle chaque bloc une seule fois, puis cesse de le surveiller.
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('reveal-pending');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  elements.forEach((element) => {
    if (element.getBoundingClientRect().top > window.innerHeight) {
      element.classList.add('reveal-pending');
      observer.observe(element);
    }
  });
  // CHANGEMENT DE PRÉFÉRENCE — Rend immédiatement visibles les éléments si les mouvements sont réduits.
  preference.addEventListener('change', () => {
    if (preference.matches) {
      elements.forEach((element) => element.classList.remove('reveal-pending'));
      observer.disconnect();
    }
  });
}
