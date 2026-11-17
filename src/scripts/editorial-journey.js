// =====================================================================
// KONSTANCE KRUGER — PORTFOLIO ÉDITORIAL
// Défilement continu (one scroll) entre les doubles pages + animations d'arrivée.
//
// 1. DÉFILEMENT
// Toutes les doubles pages sont dans la page, l'une sous l'autre, et collées en
// haut de l'écran (position: sticky en CSS). En défilant, la suivante monte
// par-dessus la précédente, comme une feuille posée sur une pile. C'est le
// défilement natif du navigateur (trackpad, molette, barre) : fluide, sans
// blocage. Le JS règle --cover sur chaque page (0 → 1) pour la faire reculer
// et s'assombrir pendant qu'elle est recouverte.
//
// LECTURE AU DÉFILEMENT : chaque double page reste posée un moment (une « pause »
// de défilement, ajoutée par un bloc invisible après elle). Pendant cette pause,
// ses textes (data-reveal) s'écrivent lettre après lettre, de gauche à droite,
// au rythme du défilement, comme si on était en train de les écrire ; quand la
// dernière lettre est affichée, la page suivante arrive.
//
// 2. ANIMATIONS (inspirées de vivmgmt.com)
// À l'arrivée sur une double page, la classe .is-shown déclenche en CSS :
// lettres qui sortent d'un flou, lettres qui montent, aplats qui dévoilent les
// photos. Elles se rejouent quand on revient sur la page.
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

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // ---------------------------------------------------------------
  // ÉTAT
  // ---------------------------------------------------------------
  let current = 0;
  let frame = null;
  let starts = [];      // position de défilement où chaque page est posée (px)
  let dwells = [];      // longueur de la pause de lecture de chaque page (px)
  const reveals = scenes.map((scene) => Array.from(scene.querySelectorAll('[data-reveal]')));

  // Étapes d'écriture de chaque page, dans l'ordre de lecture : une lettre = une étape.
  // Un bloc qui contient un lien ou une image apparaît d'un coup (12 étapes),
  // pour que le lien reste lisible par les lecteurs d'écran.
  let steps = [];
  const shown = scenes.map(() => 0);

  // Pause de lecture : un peu de défilement par texte et par lettre, plafonnée.
  const dwellFor = (index) => clamp(0.25 + reveals[index].length * 0.08 + steps[index].length / 900, 0.4, 1.6);

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

  // Textes écrits au défilement : on découpe aussi les blocs data-reveal en lettres.
  steps = reveals.map((elements) => {
    const list = [];
    elements.forEach((element) => {
      if (element.querySelector('a, button, img, svg, video')) {
        for (let k = 0; k < 12; k += 1) list.push(k === 0 ? element : null);
        return;
      }
      if (!element.querySelector('.ch')) splitLetters(element);
      element.classList.add('is-typed');
      element.querySelectorAll('.ch').forEach((letter) => list.push(letter));
    });
    return list;
  });

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
      const blockGroups = {};
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
          // Les citations d'un même groupe (data-fit-block="jpo") prennent la même taille.
          if (block.dataset.fitBlock) (blockGroups[block.dataset.fitBlock] ||= []).push({ block, size });
        }
      });

      Object.values(blockGroups).forEach((items) => {
        const size = Math.min(...items.map((item) => item.size));
        items.forEach(({ block }) => (block.style.fontSize = `${size}px`));
      });
    });
  }

  // ---------------------------------------------------------------
  // 3. INTERFACE (compteur, barre, boutons, accessibilité)
  // ---------------------------------------------------------------
  function updateInterface() {
    scenes.forEach((scene, index) => scene.classList.toggle('is-current', index === current));

    if (counter) counter.textContent = `${String(current + 1).padStart(2, '0')} / ${scenes.length}`;
    if (progress) progress.style.width = `${((current + 1) / scenes.length) * 100}%`;
    if (previousButton) previousButton.disabled = current === 0;
    if (nextButton) nextButton.disabled = current === scenes.length - 1;
    if (liveRegion) liveRegion.textContent = scenes[current].getAttribute('aria-label') || '';

    updateVideos();
  }

  // ---------------------------------------------------------------
  // 4. EMPILEMENT ET LECTURE AU DÉFILEMENT
  // ---------------------------------------------------------------
  // Un bloc invisible après chaque page crée sa pause de lecture.
  const spacers = scenes.map((scene) => {
    const spacer = document.createElement('div');
    spacer.className = 'mag__dwell';
    spacer.setAttribute('aria-hidden', 'true');
    scene.after(spacer);
    return spacer;
  });

  function measure() {
    const height = window.innerHeight;
    let position = 0;
    starts = [];
    dwells = [];
    scenes.forEach((scene, index) => {
      const dwell = mobile.matches ? 0 : dwellFor(index) * height;
      spacers[index].style.height = `${dwell}px`;
      starts.push(position);
      dwells.push(dwell);
      position += height + dwell;
    });
  }

  // Affiche les « count » premières étapes d'écriture de la page (les autres sont masquées).
  function setWritten(index, count) {
    const list = steps[index];
    const target = clamp(count, 0, list.length);
    const from = Math.min(shown[index], target);
    const to = Math.max(shown[index], target);
    for (let k = from; k < to; k += 1) {
      const item = list[k];
      if (!item) continue;
      item.classList.toggle(item.classList.contains('ch') ? 'on' : 'is-in', k < target);
    }
    shown[index] = target;
  }

  function update() {
    frame = null;
    if (mobile.matches) return;

    const y = window.scrollY;
    const height = window.innerHeight;
    let active = 0;

    scenes.forEach((scene, index) => {
      // Recouvrement par la page suivante (0 → 1) : elle monte depuis le bas.
      const nextStart = starts[index + 1];
      const cover = nextStart === undefined ? 0 : clamp((y - (nextStart - height)) / height, 0, 1);
      scene.style.setProperty('--cover', cover.toFixed(3));

      const arrived = y >= starts[index] - height * 0.5;
      if (arrived) active = index;

      if (arrived && cover < 1) {
        // Page à l'écran : titres et photos s'animent, puis les textes
        // apparaissent un par un au fil de la pause de lecture.
        scene.classList.add('is-shown');
        // On finit d'écrire un peu avant la fin de la pause (90 %).
        const progress = dwells[index] ? clamp((y - starts[index]) / (dwells[index] * 0.9), 0, 1) : 1;
        setWritten(index, Math.ceil(progress * steps[index].length));
      } else if (!arrived || y > (nextStart ?? Infinity) + height * 0.5) {
        // Page loin (pas encore arrivée, ou bien recouverte) : on la rembobine.
        scene.classList.remove('is-shown');
        setWritten(index, 0);
      }
    });

    if (active !== current) {
      current = active;
      updateInterface();
    }
  }

  function requestUpdate() {
    if (frame === null) frame = requestAnimationFrame(update);
  }

  // ---------------------------------------------------------------
  // 5. NAVIGATION (boutons, clavier, sommaire) — défilement doux.
  // ---------------------------------------------------------------
  function goTo(index, smooth = true) {
    const next = clamp(index, 0, scenes.length - 1);
    const behavior = smooth && !reducedMotion.matches ? 'smooth' : 'auto';
    if (mobile.matches) {
      scenes[next].scrollIntoView({ behavior });
    } else {
      window.scrollTo({ top: starts[next], behavior });
    }
  }

  const nextPage = () => goTo(current + 1);
  const previousPage = () => goTo(current - 1);

  function onKeyDown(event) {
    if (mobile.matches || event.altKey || event.ctrlKey || event.metaKey) return;
    if (document.activeElement?.matches('input, textarea, select, [contenteditable="true"]')) return;

    if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(event.key)) {
      event.preventDefault();
      nextPage();
    } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      previousPage();
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
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-shown');
        entry.target.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-in'));
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
    measure();
    if (mobile.matches) scenes.forEach((scene) => scene.style.removeProperty('--cover'));
    requestUpdate();
  }

  // ---------------------------------------------------------------
  // 15. ÉCOUTEURS — un seul de chaque type.
  // ---------------------------------------------------------------
  window.addEventListener('scroll', requestUpdate, { passive: true, signal });
  window.addEventListener('keydown', onKeyDown, { signal });
  window.addEventListener('resize', onResize, { passive: true, signal });
  window.addEventListener(
    'hashchange',
    () => {
      const index = indexFromHash();
      if (index >= 0) goTo(index);
    },
    { signal }
  );
  mobile.addEventListener('change', onResize, { signal });
  previousButton?.addEventListener('click', previousPage, { signal });
  nextButton?.addEventListener('click', nextPage, { signal });

  window.__editorialJourneyCleanup = () => {
    controller.abort();
    if (frame !== null) cancelAnimationFrame(frame);
    spacers.forEach((spacer) => spacer.remove());
    videoObserver.disconnect();
    sceneObserver.disconnect();
    window.__editorialJourneyCleanup = null;
  };

  // ---------------------------------------------------------------
  // 16. DÉMARRAGE
  // ---------------------------------------------------------------
  window.__magReady = true;
  fitTitles();

  measure();
  const startIndex = indexFromHash();
  if (startIndex >= 0) goTo(startIndex, false);
  current = startIndex >= 0 ? startIndex : 0;
  updateInterface();
  update();

  // On attend les polices (tailles exactes) avant de lancer l'ouverture.
  const start = () => {
    fitTitles();
    requestAnimationFrame(() => {
      if (!mobile.matches) scenes[current].classList.add('is-shown');
      update();
    });
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