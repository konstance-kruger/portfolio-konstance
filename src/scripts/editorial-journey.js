// =====================================================================
// KONSTANCE KRUGER — PORTFOLIO ÉDITORIAL
// Navigation spatiale entre les 16 doubles pages + animations d'arrivée.
//
// 1. NAVIGATION (trackpad / molette)
// Un geste de trackpad produit d'abord les événements du doigt, puis ceux de
// l'INERTIE, qui continuent en diminuant. L'ancien script déclarait un geste
// « terminé » après 190 ms de silence : en fin d'inertie, Safari espace ses
// événements, d'où un deuxième saut ; et un vrai geste pendant l'inertie était
// ignoré, d'où l'impression de blocage.
// Ici, un nouveau geste est reconnu seulement :
//   - après une vraie pause (250 ms), avec au moins 30 px cumulés ;
//   - ou si l'intensité REMONTE nettement pendant l'inertie (doigt relancé).
// Un seul écouteur « wheel », et une seule navigation à la fois.
//
// 2. CAMÉRA
// La caméra vise la position réelle de chaque double page (offsetLeft / offsetTop)
// et prend un léger recul pendant le trajet (zoom arrière puis avant).
//
// 3. ANIMATIONS (inspirées de vivmgmt.com)
// À l'arrivée sur une double page, la classe .is-shown déclenche en CSS :
// lettres qui sortent d'un flou, lettres qui montent, aplats qui dévoilent les
// photos. La page d'où l'on vient garde son état jusqu'à la fin du trajet.
//
// LIMITE : aucun navigateur n'indique si un événement vient du doigt ou de
// l'inertie ; la détection par l'intensité reste une estimation, la plus fiable connue.
// =====================================================================

function initializeEditorialJourney() {
  const magazine = document.querySelector('[data-mag]');
  if (!magazine) return;

  // Protection : jamais deux initialisations (rechargement à chaud d'Astro).
  if (window.__editorialJourneyCleanup) window.__editorialJourneyCleanup();

  const viewport = magazine.querySelector('[data-viewport]');
  const world = magazine.querySelector('[data-world]');
  const scenes = Array.from(magazine.querySelectorAll('[data-scene]'));
  const previousButton = magazine.querySelector('[data-prev]');
  const nextButton = magazine.querySelector('[data-next]');
  const counter = magazine.querySelector('[data-count]');
  const progress = magazine.querySelector('[data-progress]');
  const liveRegion = magazine.querySelector('[data-live]');

  if (!viewport || !world || scenes.length === 0) {
    console.error('[Portfolio] Structure du magazine incomplète.');
    return;
  }

  const controller = new AbortController();
  const { signal } = controller;

  const mobile = window.matchMedia('(max-width: 760px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---------------------------------------------------------------
  // RÉGLAGES
  // ---------------------------------------------------------------
  const settings = {
    duration: 1000,         // durée du trajet entre deux doubles pages (ms)
    zoom: 0.1,              // recul de la caméra au milieu du trajet (10 %)
    gestureGap: 250,        // pause qui sépare deux gestes distincts (ms)
    startDistance: 30,      // distance cumulée nécessaire pour lancer un geste (px)
    relaunchRatio: 1.6,     // intensité 1,6 × plus forte que l'inertie = nouveau geste
    relaunchMinimum: 18,    // … et d'au moins 18 px
    swipeDistance: 50,      // tactile sur tablette : glissement minimal (px)
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // ---------------------------------------------------------------
  // ÉTAT
  // ---------------------------------------------------------------
  let current = 0;
  let cameraX = 0;
  let cameraY = 0;
  let animationFrame = null;
  let animating = false;

  let gestureLocked = false;
  let accumulated = 0;
  let lastWheelTime = -Infinity;
  let recentIntensity = [];

  // ---------------------------------------------------------------
  // 1. DÉCOUPAGE DES TEXTES EN LETTRES (data-chars, data-rise)
  // Chaque mot devient <span class="w"> et chaque lettre <span class="ch">,
  // numérotée par --i pour décaler son apparition. Les sauts de ligne et les
  // espaces insécables sont conservés. Le texte complet reste lisible par les
  // lecteurs d'écran grâce à aria-label.
  // ---------------------------------------------------------------
  function splitLetters(element) {
    if (element.dataset.split === 'done') return;
    if (!element.hasAttribute('aria-label')) {
      element.setAttribute('aria-label', element.textContent.replace(/\s+/g, ' ').trim());
    }
    let index = 0;

    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const fragment = document.createDocumentFragment();
          // On sépare les mots en gardant les espaces (normaux) entre eux.
          child.textContent.split(/( +|\n+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              fragment.append(document.createTextNode(' '));
              return;
            }
            const word = document.createElement('span');
            word.className = 'w';
            word.setAttribute('aria-hidden', 'true');
            Array.from(part).forEach((letter) => {
              const span = document.createElement('span');
              span.className = 'ch';
              span.textContent = letter;
              span.style.setProperty('--i', index++);
              word.append(span);
            });
            fragment.append(word);
          });
          child.replaceWith(fragment);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };

    walk(element);
    element.dataset.split = 'done';
  }

  magazine.querySelectorAll('[data-chars], [data-rise]').forEach(splitLetters);

  // ---------------------------------------------------------------
  // 2. AJUSTEMENT DES GRANDS TITRES
  // data-fit           : la ligne occupe toute la largeur de sa page ;
  //                      même valeur = même groupe = même taille.
  // data-fit-width     : largeur visée en fraction de la double page (ex. 0.6).
  // data-fit-max-vh    : taille maximale en % de la hauteur d'écran.
  // data-fit-block     : bloc de plusieurs lignes ; la plus longue remplit la page.
  // ---------------------------------------------------------------
  function contentWidth(element) {
    const style = getComputedStyle(element);
    return element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  }

  function naturalWidth(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect().width;
  }

  function fitTitles() {
    if (mobile.matches) {
      // Sur mobile, les tailles viennent du CSS.
      magazine.querySelectorAll('[data-fit], [data-fit-block]').forEach((el) => el.style.removeProperty('font-size'));
      return;
    }

    scenes.forEach((scene) => {
      const groups = {};

      scene.querySelectorAll('[data-fit]').forEach((element) => {
        const available = element.dataset.fitWidth
          ? scene.clientWidth * Number(element.dataset.fitWidth)
          : contentWidth(element.parentElement);

        element.style.fontSize = '100px';
        const measured = naturalWidth(element);
        if (!measured) return;

        let size = (100 * available) / measured;
        if (element.dataset.fitMaxVh) {
          size = Math.min(size, (window.innerHeight * Number(element.dataset.fitMaxVh)) / 100);
        }
        const key = element.dataset.fit || `seul-${Math.random()}`;
        (groups[key] ||= []).push({ element, size });
      });

      Object.values(groups).forEach((items) => {
        const size = Math.min(...items.map((item) => item.size));
        items.forEach(({ element }) => (element.style.fontSize = `${size}px`));
      });

      // Citation sur plusieurs lignes : on mesure chaque ligne sans justification.
      scene.querySelectorAll('[data-fit-block]').forEach((block) => {
        block.style.fontSize = '100px';
        block.classList.add('is-measuring');
        const lines = block.querySelectorAll('.about__line');
        const widest = Math.max(...Array.from(lines).map(naturalWidth));
        block.classList.remove('is-measuring');
        const parent = block.parentElement;
        const available = contentWidth(parent);
        if (widest) {
          let size = (100 * available) / widest;
          block.style.fontSize = `${size}px`;
          // Si la citation devient plus haute que la page, on la réduit d'autant.
          const style = getComputedStyle(parent);
          const room = parent.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
          if (block.offsetHeight > room) {
            size *= room / block.offsetHeight;
            block.style.fontSize = `${size}px`;
          }
        }
      });
    });
  }

  // ---------------------------------------------------------------
  // 3. ANIMATIONS D'ARRIVÉE
  // ---------------------------------------------------------------
  function show(index) {
    scenes[index].classList.add('is-shown');
  }

  // Les autres doubles pages sont « rembobinées » une fois hors champ.
  function rewindOthers() {
    scenes.forEach((scene, index) => {
      if (index !== current) scene.classList.remove('is-shown');
    });
  }

  // ---------------------------------------------------------------
  // 4. INTERFACE (compteur, barre, boutons, accessibilité)
  // ---------------------------------------------------------------
  function updateInterface() {
    scenes.forEach((scene, index) => {
      const active = index === current;
      scene.classList.toggle('is-current', active);
      scene.inert = !mobile.matches && !active;
    });

    if (counter) counter.textContent = `${String(current + 1).padStart(2, '0')} / ${scenes.length}`;
    if (progress) progress.style.width = `${((current + 1) / scenes.length) * 100}%`;
    if (previousButton) previousButton.disabled = current === 0;
    if (nextButton) nextButton.disabled = current === scenes.length - 1;
    if (liveRegion) liveRegion.textContent = scenes[current].getAttribute('aria-label') || '';

    updateVideos();
  }

  // ---------------------------------------------------------------
  // 5. CAMÉRA — translate3d + léger zoom arrière pendant le trajet.
  // ---------------------------------------------------------------
  function paint(scale = 1) {
    world.style.transform = `translate3d(${-cameraX}px, ${-cameraY}px, 0)`;
    viewport.style.transform = scale === 1 ? '' : `scale(${scale})`;
  }

  function targetOf(index) {
    const scene = scenes[index];
    return { x: scene.offsetLeft, y: scene.offsetTop };
  }

  // Accélère puis ralentit en douceur (courbe « expo »).
  function easeInOutExpo(t) {
    if (t === 0 || t === 1) return t;
    return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
  }

  function stopAnimation() {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    animating = false;
  }

  function moveCamera(index, smooth) {
    const { x: endX, y: endY } = targetOf(index);
    stopAnimation();

    if (!smooth || reducedMotion.matches) {
      cameraX = endX;
      cameraY = endY;
      paint();
      show(index);
      rewindOthers();
      return;
    }

    const startX = cameraX;
    const startY = cameraY;
    let startTime = null;
    let revealed = false;
    animating = true;

    const step = (time) => {
      if (startTime === null) startTime = time;
      const t = clamp((time - startTime) / settings.duration, 0, 1);
      const eased = easeInOutExpo(t);
      cameraX = startX + (endX - startX) * eased;
      cameraY = startY + (endY - startY) * eased;

      // Recul maximal au milieu du trajet, retour à 100 % à l'arrivée.
      paint(1 - settings.zoom * Math.sin(Math.PI * t));

      // Les animations de la page d'arrivée démarrent pendant l'approche.
      if (!revealed && t > 0.55) {
        revealed = true;
        show(index);
      }

      if (t < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        animationFrame = null;
        animating = false;
        paint();
        rewindOthers();
      }
    };

    animationFrame = requestAnimationFrame(step);
  }

  // ---------------------------------------------------------------
  // 6. NAVIGATION
  // ---------------------------------------------------------------
  function goTo(index, smooth = true) {
    const next = clamp(index, 0, scenes.length - 1);

    if (mobile.matches) {
      current = next;
      updateInterface();
      scenes[next].scrollIntoView({ behavior: smooth && !reducedMotion.matches ? 'smooth' : 'auto' });
      return;
    }

    if (next === current && smooth) return;
    current = next;
    updateInterface();
    moveCamera(next, smooth);
  }

  const nextPage = () => goTo(current + 1);
  const previousPage = () => goTo(current - 1);

  // ---------------------------------------------------------------
  // 7. MOLETTE ET TRACKPAD — un geste = une seule double page.
  // ---------------------------------------------------------------
  function normalizeDelta(event) {
    let delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (event.deltaMode === 1) delta *= 16;
    else if (event.deltaMode === 2) delta *= window.innerHeight;
    return delta;
  }

  function onWheel(event) {
    if (mobile.matches) return;
    if (event.ctrlKey || event.metaKey) return; // zoom du navigateur
    event.preventDefault();

    const delta = normalizeDelta(event);
    const intensity = Math.abs(delta);
    if (!Number.isFinite(delta) || intensity === 0) return;

    const now = performance.now();
    const gap = now - lastWheelTime;
    lastWheelTime = now;

    // a) Vraie pause : nouveau geste.
    if (gap > settings.gestureGap) {
      gestureLocked = false;
      accumulated = 0;
      recentIntensity = [];
    }

    // b) Geste déjà utilisé : on n'accepte qu'une relance nette du doigt.
    if (gestureLocked) {
      const inertiaLevel = Math.max(...recentIntensity, 0);
      const relaunch =
        !animating &&
        intensity >= settings.relaunchMinimum &&
        intensity > inertiaLevel * settings.relaunchRatio;

      recentIntensity = [...recentIntensity.slice(-3), intensity];
      if (!relaunch) return;
      gestureLocked = false;
      accumulated = 0;
    }

    // c) Pas de navigation empilée pendant un trajet.
    if (animating) return;

    // d) Seuil atteint : une seule double page.
    accumulated += delta;
    if (Math.abs(accumulated) < settings.startDistance) return;

    const direction = Math.sign(accumulated);
    gestureLocked = true;
    accumulated = 0;
    recentIntensity = [intensity];

    if (direction > 0) nextPage();
    else previousPage();
  }

  // ---------------------------------------------------------------
  // 8. TACTILE SUR GRAND ÉCRAN (tablette en paysage)
  // ---------------------------------------------------------------
  let touchStart = null;

  function onTouchStart(event) {
    if (mobile.matches) return;
    const touch = event.touches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event) {
    if (mobile.matches || !touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touchStart.x - touch.clientX;
    const dy = touchStart.y - touch.clientY;
    touchStart = null;
    const distance = Math.abs(dy) > Math.abs(dx) ? dy : dx;
    if (Math.abs(distance) < settings.swipeDistance || animating) return;
    if (distance > 0) nextPage();
    else previousPage();
  }

  // ---------------------------------------------------------------
  // 9. CLAVIER
  // ---------------------------------------------------------------
  function onKeyDown(event) {
    if (mobile.matches || event.altKey || event.ctrlKey || event.metaKey) return;
    if (document.activeElement?.matches('input, textarea, select, [contenteditable="true"]')) return;
    if (event.repeat) return;

    if (['ArrowDown', 'ArrowRight', 'PageDown', ' '].includes(event.key)) {
      event.preventDefault();
      nextPage();
    } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      previousPage();
    } else if (event.key === 'Home') {
      event.preventDefault();
      goTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      goTo(scenes.length - 1);
    }
  }

  // ---------------------------------------------------------------
  // 10. LIENS : sommaire (data-jump) et adresses avec ancre (#caps…)
  // ---------------------------------------------------------------
  function indexFromHash() {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return -1;
    return scenes.findIndex((scene) => scene.id === id);
  }

  magazine.querySelectorAll('[data-jump]').forEach((link) => {
    link.addEventListener(
      'click',
      (event) => {
        const index = Number(link.dataset.jump);
        if (!Number.isInteger(index)) return;
        event.preventDefault();
        history.replaceState(null, '', link.getAttribute('href'));
        goTo(index);
      },
      { signal }
    );
  });

  // ---------------------------------------------------------------
  // 11. VIDÉOS — lecture muette sur la double page affichée, pause ailleurs.
  // ---------------------------------------------------------------
  const videos = Array.from(magazine.querySelectorAll('[data-video]'));

  function playVideo(video) {
    if (reducedMotion.matches && video.muted) return;
    video.play().catch(() => {});
  }

  function updateVideos() {
    if (mobile.matches) return;
    videos.forEach((video) => {
      if (scenes[current].contains(video)) playVideo(video);
      else video.pause();
    });
  }

  const videoObserver = new IntersectionObserver(
    (entries) => {
      if (!mobile.matches) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) playVideo(entry.target);
        else entry.target.pause();
      });
    },
    { threshold: 0.5 }
  );

  videos.forEach((video) => {
    videoObserver.observe(video);
    const button = video.parentElement.querySelector('[data-video-sound]');
    button?.addEventListener(
      'click',
      () => {
        video.muted = !video.muted;
        button.setAttribute('aria-pressed', String(!video.muted));
        button.textContent = video.muted ? 'Activer le son' : 'Couper le son';
        if (!video.muted) video.play().catch(() => {});
      },
      { signal }
    );
  });

  // ---------------------------------------------------------------
  // 12. MOBILE — les doubles pages s'animent quand elles entrent à l'écran.
  // ---------------------------------------------------------------
  const sceneObserver = new IntersectionObserver(
    (entries) => {
      if (!mobile.matches) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-shown');
      });
    },
    { threshold: 0.2 }
  );
  scenes.forEach((scene) => sceneObserver.observe(scene));

  // ---------------------------------------------------------------
  // 13. TRAÎNÉE D'IMAGES (page Contact, souris uniquement)
  // Toutes les 80 px parcourus, une petite photo apparaît sous le curseur,
  // grandit, puis s'efface. Au maximum 8 images à la fois.
  // ---------------------------------------------------------------
  const trail = magazine.querySelector('[data-trail]');
  const trailImages = trail ? JSON.parse(trail.dataset.images || '[]') : [];

  if (trail && trailImages.length && !reducedMotion.matches) {
    const zone = trail.parentElement;
    let last = null;
    let next = 0;

    zone.addEventListener(
      'pointermove',
      (event) => {
        if (event.pointerType !== 'mouse' || mobile.matches) return;
        const box = zone.getBoundingClientRect();
        const x = event.clientX - box.left;
        const y = event.clientY - box.top;
        if (last && Math.hypot(x - last.x, y - last.y) < 80) return;
        last = { x, y };

        const image = document.createElement('img');
        image.src = trailImages[next];
        image.alt = '';
        image.style.left = `${x}px`;
        image.style.top = `${y}px`;
        image.style.rotate = `${(Math.random() - 0.5) * 10}deg`;
        next = (next + 1) % trailImages.length;
        trail.append(image);

        while (trail.children.length > 8) trail.firstElementChild.remove();

        image
          .animate(
            [
              { opacity: 0, transform: 'translate(-50%, -50%) scale(0.6)' },
              { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.2 },
              { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.7 },
              { opacity: 0, transform: 'translate(-50%, -50%) scale(0.92)' },
            ],
            { duration: 1100, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
          )
          .finished.then(() => image.remove())
          .catch(() => {});
      },
      { signal }
    );
  }

  // ---------------------------------------------------------------
  // 14. REDIMENSIONNEMENT ET CHANGEMENT ORDINATEUR / MOBILE
  // ---------------------------------------------------------------
  function onResize() {
    fitTitles();
    if (mobile.matches) {
      stopAnimation();
      world.style.transform = '';
      viewport.style.transform = '';
    } else {
      moveCamera(current, false);
    }
    updateInterface();
  }

  // Un élément qui reçoit le focus peut faire défiler la zone : on la remet à zéro.
  function lockViewportScroll() {
    if (viewport.scrollTop || viewport.scrollLeft) {
      viewport.scrollTop = 0;
      viewport.scrollLeft = 0;
    }
  }

  // ---------------------------------------------------------------
  // 15. ÉCOUTEURS — un seul de chaque type.
  // ---------------------------------------------------------------
  window.addEventListener('wheel', onWheel, { passive: false, signal });
  window.addEventListener('keydown', onKeyDown, { signal });
  window.addEventListener('touchstart', onTouchStart, { passive: true, signal });
  window.addEventListener('touchend', onTouchEnd, { passive: true, signal });
  window.addEventListener('resize', onResize, { passive: true, signal });
  window.addEventListener(
    'hashchange',
    () => {
      const index = indexFromHash();
      if (index >= 0) goTo(index);
    },
    { signal }
  );
  viewport.addEventListener('scroll', lockViewportScroll, { passive: true, signal });
  mobile.addEventListener('change', onResize, { signal });
  previousButton?.addEventListener('click', previousPage, { signal });
  nextButton?.addEventListener('click', nextPage, { signal });

  window.__editorialJourneyCleanup = () => {
    controller.abort();
    stopAnimation();
    videoObserver.disconnect();
    sceneObserver.disconnect();
    window.__editorialJourneyCleanup = null;
  };

  // ---------------------------------------------------------------
  // 16. DÉMARRAGE
  // ---------------------------------------------------------------
  window.__magReady = true;
  fitTitles();

  const startIndex = indexFromHash();
  current = startIndex >= 0 ? startIndex : 0;
  if (mobile.matches && startIndex >= 0) scenes[current].scrollIntoView();
  if (!mobile.matches) {
    cameraX = targetOf(current).x;
    cameraY = targetOf(current).y;
    paint();
  }
  updateInterface();

  // On attend les polices (tailles exactes) avant de lancer l'ouverture.
  const start = () => {
    fitTitles();
    requestAnimationFrame(() => show(current));
  };
  if (document.fonts?.ready) {
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]).then(start);
  } else {
    start();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEditorialJourney, { once: true });
} else {
  initializeEditorialJourney();
}