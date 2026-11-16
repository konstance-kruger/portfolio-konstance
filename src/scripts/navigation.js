// NAVIGATION MOBILE — Active le menu repliable une fois les éléments disponibles.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
if (menuButton && navigation) {
  document.documentElement.classList.add('js');
  menuButton.hidden = false;
  // BOUTON MENU — Affiche les liens et annonce l’état du menu aux lecteurs d’écran.
  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? 'Fermer' : 'Menu';
  });
  // TOUCHE ÉCHAP — Referme le menu ouvert et rend le focus à son bouton.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      navigation.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = 'Menu';
      menuButton.focus();
    }
  });
}
