// =====================================================================
// SCRIPT DE LA LONGUE PAGE (DA « grille ») — tout le comportement du site.
//
// COMMENT LIRE CE FICHIER
// Le HTML (GridSite.astro) décrit ce qu'il y a sur la page ; le CSS (grid-site.css)
// décrit l'apparence ; ce script ne fait que RÉAGIR : au défilement, à la souris,
// à l'arrivée d'un élément dans l'écran. Il s'appuie sur trois notions :
//
//  • getBoundingClientRect() : donne la position d'un élément par rapport à l'écran.
//    Avec elle, on calcule une « progression » p entre 0 (pas commencé) et 1 (fini).
//  • Variables CSS (--p, --sw, --turn…) : le script écrit la progression dans une variable
//    de l'élément (style.setProperty) et le CSS s'en sert dans calc() pour déplacer,
//    agrandir ou faire apparaître. Le JS calcule, le CSS dessine.
//  • IntersectionObserver : prévient le script quand un élément entre dans l'écran
//    (photos qui se dévoilent, vidéos lancées, mascotte qui saute).
//  • requestAnimationFrame : demande au navigateur d'appeler une fonction juste avant
//    le prochain affichage (≈ 60 fois par seconde) ; sert aux animations fluides.
//
// ORDRE DU FICHIER
//  0. Accueil : textes ajustés à la maquette (data-box), profondeur (data-speed),
//     éléments déplaçables (data-drag), stickers qui réagissent au curseur.
//  1. Photos qui se dévoilent (data-wipe / data-drop).
//  2. Texte qui s'écrit lettre par lettre au défilement (data-type).
//  3. Transition « liquide » vers Vie au campus (data-liquid).
//  4. Colonnes d'affiches qui montent (data-rise).
//  5. À propos puis Contact : l'écran reste collé et le défilement pilote tout (data-turn).
//
// Respect de l'accessibilité : si la personne a demandé « réduire les animations »
// (prefers-reduced-motion), tout ce qui est animé est sauté et la page reste lisible.
// =====================================================================
function initGridSite() {
  const root = document.querySelector('[data-gs]');
  if (!root) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  // 0. ACCUEIL — Chaque texte à data-box occupe exactement la boîte relevée sur
  //    la maquette (x0,y0,x1,y1 en % de l'accueil) : la taille est réglée pour la
  //    largeur, un étirement vertical (scaleY) pour la hauteur, puis on le place.
  const hero = root.querySelector('[data-hero-frame]') || root.querySelector('.gs-hero');
  const ctx = document.createElement('canvas').getContext('2d');
  const fit = () => {
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const hw = hero.clientWidth;
    const hh = hero.clientHeight;
    root.querySelectorAll('[data-box]').forEach((el) => {
      const box = (mobile && el.dataset.boxM) || el.dataset.box;
      const [x0, y0, x1, y1] = box.split(',').map((n) => Number(n) / 100);
      const cs = getComputedStyle(el);
      const text = cs.textTransform === 'uppercase' ? el.textContent.toUpperCase() : el.textContent;

      // Largeur : on mesure à 100 px puis on met à l'échelle.
      el.style.transform = 'none';
      el.style.fontSize = '100px';
      const width100 = el.getBoundingClientRect().width;
      const size = (100 * (x1 - x0) * hw) / width100;
      el.style.fontSize = `${size}px`;

      // Hauteur de l'encre (sans les espaces au-dessus et en dessous des lettres).
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${size}px ${cs.fontFamily}`;
      const m = ctx.measureText(text);
      const ascent = m.actualBoundingBoxAscent;
      const inkHeight = ascent + m.actualBoundingBoxDescent;
      const fontAscent = m.fontBoundingBoxAscent ?? ascent;
      const fontDescent = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;
      const baseline = (size - (fontAscent + fontDescent)) / 2 + fontAscent; // line-height: 1
      const scaleY = 1; // pas d'étirement : la police garde ses vraies proportions

      el.style.left = `${x0 * hw + m.actualBoundingBoxLeft}px`;
      el.style.top = `${y0 * hh - (baseline - ascent) * scaleY}px`;
      el.style.transform = 'none';
    });
  };
  fit();
  document.fonts?.ready.then(fit);
  window.addEventListener('resize', fit, { passive: true });

  // PROFONDEUR — Les photos défilent plus lentement que la page (elles semblent
  // loin derrière), les textes un peu plus vite (ils passent devant) ;
  // le quadrillage, lui, reste fixe. data-speed : 1 = vitesse normale.
  const layers = Array.from(root.querySelectorAll('[data-speed]'));
  let depthFrame = null;
  const depth = () => {
    depthFrame = null;
    if (window.matchMedia('(max-width: 760px)').matches) {
      layers.forEach((el) => (el.style.translate = ''));
      return;
    }
    const center = window.innerHeight / 2;
    layers.forEach((el) => {
      const box = el.getBoundingClientRect();
      const shift = (box.top + box.height / 2 - center) * (Number(el.dataset.speed) - 1);
      el.style.translate = `0 ${shift.toFixed(1)}px`;
    });
  };

  // DÉPLACER — Les éléments data-drag se prennent et se posent où l'on veut
  //   (souris, trackpad ou doigt). Un double-clic les remet à leur place.
  root.querySelectorAll('[data-drag]').forEach((el) => {
    let start = null;
    let offset = { x: 0, y: 0 };
    el.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      el.setPointerCapture(event.pointerId);
      offset = el.__off || offset;
      start = { x: event.clientX - offset.x, y: event.clientY - offset.y };
      el.classList.add('is-dragging', 'is-stuck');   // is-stuck reste : l'animation d'arrivée ne se rejoue jamais
      el.getAnimations().forEach((a) => { if (!a.animationName) a.cancel(); });
      el.animate([{ scale: '1' }, { scale: '1.08' }], { duration: 180, easing: 'ease-out', fill: 'forwards' });
      // Le dernier élément déplacé passe au premier plan.
      root.querySelectorAll('.is-front').forEach((other) => other.classList.remove('is-front'));
      el.classList.add('is-front');
    });
    el.addEventListener('pointermove', (event) => {
      if (!start) return;
      offset = { x: event.clientX - start.x, y: event.clientY - start.y };
      el.__off = offset;
      el.style.translate = `${offset.x}px ${offset.y}px`;
    });
    // Lâcher : le sticker retombe sur la page et s'y « colle » — il est un peu
    // plus gros quand on le tient, s'écrase légèrement en touchant le fond,
    // puis reprend sa taille avec une ombre courte (posé à plat).
    const drop = () => {
      if (!start) return;
      start = null;
      el.classList.remove('is-dragging');
      const tilt = (Math.random() - 0.5) * 6;
      el.animate(
        [
          { scale: '1.08', rotate: '0deg', filter: 'drop-shadow(0 26px 30px rgb(0 0 0 / 0.30))' },
          { scale: '0.95', rotate: `${tilt}deg`, filter: 'drop-shadow(0 2px 3px rgb(0 0 0 / 0.30))', offset: 0.45 },
          { scale: '1.02', rotate: `${tilt}deg`, filter: 'drop-shadow(0 5px 7px rgb(0 0 0 / 0.20))', offset: 0.75 },
          { scale: '1', rotate: `${tilt}deg`, filter: 'drop-shadow(0 4px 6px rgb(0 0 0 / 0.18))' },
        ],
        { duration: 420, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)', fill: 'forwards' }
      );
    };
    el.addEventListener('pointerup', drop);
    el.addEventListener('pointercancel', drop);
    el.addEventListener('dblclick', () => {
      offset = { x: 0, y: 0 };
      el.__off = offset;
      if (el.__v) { el.__v.x = 0; el.__v.y = 0; }
      el.style.translate = '';
      el.getAnimations().forEach((a) => { if (!a.animationName) a.cancel(); });
    });
  });

  // ======================= EFFETS « WOW » =======================
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mouse = { x: -999, y: -999 };

  // A. ACCUEIL — les stickers recouvrent le nom. Le curseur est comme une main posée
  //    sur la table : quand il balaie un sticker il l'entraîne dans SA direction
  //    (vers la gauche si on va à gauche…), puis le sticker glisse et s'arrête
  //    (frottement), rebondit sur les bords de l'accueil.
  const hf = root.querySelector('[data-hero-frame]');
  const stickers = hf ? Array.from(hf.querySelectorAll('.gs-sticker')) : [];
  if (hf && stickers.length && !reduced && fine) {
    const targets = { shirt: [0.3, 0.4], camera: [0.38, 0.58], ticket: [0.52, 0.44], star: [0.68, 0.46] };
    stickers.forEach((el) => { el.__off = { x: 0, y: 0 }; el.__v = { x: 0, y: 0 }; });
    Promise.all(stickers.map((el) => (el.decode ? el.decode().catch(() => {}) : Promise.resolve()))).then(() => {
      const fr = hf.getBoundingClientRect();
      stickers.forEach((el) => {
        const key = Object.keys(targets).find((k) => el.classList.contains(`gs-sticker--${k}`));
        const r = el.getBoundingClientRect();
        const [tx, ty] = targets[key] || [0.5, 0.45];
        el.__off = {
          x: fr.left + fr.width * tx - (r.left + r.width / 2),
          y: fr.top + fr.height * ty - (r.top + r.height / 2),
        };
        el.style.translate = `${el.__off.x}px ${el.__off.y}px`;
      });
      hf.classList.add('is-piled');
    });
    // vitesse du curseur (px/s), lissée
    const cur = { x: 0, y: 0, vx: 0, vy: 0, t: 0, in: false };
    hf.addEventListener('pointermove', (e) => {
      const now = performance.now();
      const dt = Math.max(8, now - cur.t) / 1000;
      if (cur.t && now - cur.t < 120) {
        cur.vx = cur.vx * 0.5 + ((e.clientX - cur.x) / dt) * 0.5;
        cur.vy = cur.vy * 0.5 + ((e.clientY - cur.y) / dt) * 0.5;
      } else { cur.vx = 0; cur.vy = 0; }
      cur.x = e.clientX; cur.y = e.clientY; cur.t = now; cur.in = true;
    }, { passive: true });
    hf.addEventListener('pointerleave', () => { cur.in = false; cur.vx = 0; cur.vy = 0; });
    let prev = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.033, (now - prev) / 1000);
      prev = now;
      const fr = hf.getBoundingClientRect();
      const moving = cur.in && now - cur.t < 90;
      stickers.forEach((el) => {
        if (!el.__v) return;
        if (el.classList.contains('is-dragging')) { el.__v.x = 0; el.__v.y = 0; return; }
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const v = el.__v;
        // le curseur entraîne ce qu'il touche
        if (moving && Math.abs(cur.x - cx) < r.width * 0.28 && Math.abs(cur.y - cy) < r.height * 0.28) {
          const sp = Math.hypot(cur.vx, cur.vy);
          if (sp > 320) {
            const gain = Math.min(1, 3.5 * dt);
            const cap = Math.min(1, 1300 / sp);
            v.x += (cur.vx * cap * 0.55 - v.x) * gain;
            v.y += (cur.vy * cap * 0.55 - v.y) * gain;
            if (hf.classList.contains('is-piled')) hf.classList.remove('is-piled');
          }
        }
        const f = Math.exp(-5 * dt);       // frottement
        v.x *= f; v.y *= f;
        if (Math.abs(v.x) + Math.abs(v.y) < 3) return;
        let nx = cx + v.x * dt, ny = cy + v.y * dt;
        // rebond sur les bords de l'accueil
        if (nx < fr.left) { nx = fr.left; v.x = Math.abs(v.x) * 0.45; }
        if (nx > fr.right) { nx = fr.right; v.x = -Math.abs(v.x) * 0.45; }
        if (ny < fr.top) { ny = fr.top; v.y = Math.abs(v.y) * 0.45; }
        if (ny > fr.bottom) { ny = fr.bottom; v.y = -Math.abs(v.y) * 0.45; }
        el.__off = { x: el.__off.x + (nx - cx), y: el.__off.y + (ny - cy) };
        el.style.translate = `${el.__off.x}px ${el.__off.y}px`;
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    // si on attrape un sticker à la main, la pile se défait aussi
    stickers.forEach((el) => el.addEventListener('pointerdown', () => hf.classList.remove('is-piled')));
  }

  // B. VISEUR DE CAMÉRA + GRILLE LUMINEUSE (souris seulement).
  const cursor = root.querySelector('.gs-cursor');
  const glow = root.querySelector('.gs-glow');
  if (fine && cursor && !reduced) {
    root.classList.add('has-cursor');
    let cx = -999, cy = -999;
    window.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY;
      cursor.classList.add('is-on');
      const el = e.target instanceof Element ? e.target : null;
      cursor.classList.toggle('is-photo', Boolean(el && el.closest('.gs-photo, .gs-thumb, .media, .gs-cover, video')));
      cursor.classList.toggle('is-hero', Boolean(el && el.closest('.gs-hero')));
      cursor.classList.toggle('is-big', Boolean(el && el.closest('a, [data-drag], .gs-mascot[data-mascot]')));
      if (glow) { glow.style.setProperty('--mx', `${e.clientX}px`); glow.style.setProperty('--my', `${e.clientY}px`); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
    const follow = () => {
      cx += (mouse.x - cx) * 0.35;
      cy += (mouse.y - cy) * 0.35;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(follow);
    };
    cx = mouse.x; cy = mouse.y;
    follow();
  }

  // C. MASCOTTE — petit saut quand elle arrive à l'écran ; le clin d'œil au survol est en CSS.
  const mascot = root.querySelector('[data-mascot]');
  if (mascot && !reduced) {
    const inner = mascot.querySelector('.gs-mascot__in');
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        inner.classList.remove('is-hop');
        void inner.offsetWidth;
        inner.classList.add('is-hop');
      });
    }, { threshold: 0.6 }).observe(mascot);
  }

  // VIDÉOS — Muettes, en boucle, lancées automatiquement ; pause hors de l'écran.
  // (Safari exige muted + playsinline + autoplay posés AVANT la lecture.)
  const play = (v) => {
    v.muted = true;
    v.defaultMuted = true;
    const promise = v.play();
    if (promise) promise.catch(() => {});
  };
  const videoObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => (e.isIntersecting ? play(e.target) : e.target.pause())),
    { threshold: 0.1 }
  );
  root.querySelectorAll('video').forEach((v) => {
    v.muted = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('autoplay', '');
    v.preload = 'auto';
    v.load();
    v.addEventListener('canplay', () => {
      const box = v.getBoundingClientRect();
      if (box.bottom > 0 && box.top < window.innerHeight) play(v);
    }, { once: true });
    videoObserver.observe(v);
  });

  if (reduced) return;
  document.documentElement.classList.add('js-gs');

  // 1. Photos
  const wipeObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('is-in')),
    { threshold: 0.25 }
  );
  root.querySelectorAll('[data-wipe], [data-drop]').forEach((el) => wipeObserver.observe(el));

  // 2. Texte écrit : découpe en lettres.
  //    Accessibilité : les lettres animées sont cachées aux lecteurs d'écran (aria-hidden)
  //    et le texte complet est placé dans un <span class="sr-only"> (visible uniquement
  //    pour eux). Ainsi la phrase est lue d'un bloc, pas lettre par lettre.
  const blocks = Array.from(root.querySelectorAll('[data-type]')).map((block) => {
    const fullText = block.textContent.replace(/\s+/g, ' ').trim();
    const letters = [];
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.append(document.createTextNode(' '));
            const word = document.createElement('span');
            word.style.whiteSpace = 'nowrap';
            word.setAttribute('aria-hidden', 'true');
            Array.from(part).forEach((char) => {
              const span = document.createElement('span');
              span.className = 'ch';
              span.textContent = char;
              word.append(span);
              letters.push(span);
            });
            frag.append(word);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(block);
    const reader = document.createElement('span');
    reader.className = 'sr-only';
    reader.textContent = fullText;
    block.prepend(reader);
    // Dans un bloc « un écran », l'écriture suit la position du bloc entier :
    // le texte est complet quand le bloc est posé en haut de l'écran.
    const screen = block.closest('.gs-screen, .gs-pod');
    // Bloc « épinglé » (JPO) : la page reste collée tant que le texte n'est pas fini.
    const pin = block.closest('.gs-jpo-pin, .gs-cover-pin');
    return { block, anchor: pin || screen || block, inScreen: Boolean(screen), pin: Boolean(pin), driven: Boolean(block.closest('.gs-cover--campus')), letters, shown: 0 };
  });

  let frame = null;
  function update() {
    frame = null;
    const vh = window.innerHeight;
    blocks.forEach((item) => {
      if (item.driven) return;                 // texte piloté par la transition (voir liquide)
      const rect = item.anchor.getBoundingClientRect();
      const top = rect.top;
      const pinned = item.pin && window.matchMedia('(min-width: 761px)').matches;
      const progress = pinned
        // texte complet aux 85 % de la course d'épinglage, puis un court temps de lecture
        ? Math.min(1, Math.max(0, (vh * 0.12 - top) / Math.max(1, (rect.height - vh) * 0.85)))
        : item.inScreen
        ? Math.min(1, Math.max(0, (vh * 0.9 - top) / (vh * 0.7)))
        : Math.min(1, Math.max(0, (vh * 0.95 - top) / Math.max(1, Math.min(vh * 0.45, vh * 0.95 - (top - Math.max(0, document.documentElement.scrollHeight - vh - window.scrollY))))));
      const target = Math.round(progress * item.letters.length);
      if (target === item.shown) return;
      const [from, to] = target > item.shown ? [item.shown, target] : [target, item.shown];
      for (let k = from; k < to; k += 1) item.letters[k].classList.toggle('on', k < target);
      item.shown = target;
    });
  }
  // Transition « liquide rose clair » (tournois e-sport → Vie au campus).
  // Le défilement reste collé sur place : un liquide (canvas) monte sur l'écran, avec une vraie
  // petite physique (ressort + vagues) : il rattrape sa hauteur en rebondissant et il est secoué
  // par le défilement, même quand on s'arrête au milieu. Une fois l'écran plein, le liquide
  // s'écarte sur le côté et laisse apparaître « Vie au campus ».
  const liqs = Array.from(root.querySelectorAll('[data-liquid]'));
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const seg = (p, a, b) => clamp01((p - a) / (b - a));
  const ease = (t) => t * t * (3 - 2 * t);
  liqs.forEach((el) => {
    const stage = el.querySelector('.gs-liq-stage');
    const cv = el.querySelector('.gs-liq-canvas');
    const ctx = cv && cv.getContext('2d');
    if (!stage || !ctx) return;
    const N = 96;
    const d = new Float32Array(N + 1);        // écart de la surface par colonne (px)
    const dv = new Float32Array(N + 1);       // sa vitesse
    let W = 1, H = 1, dpr = 1;
    let level = 0, levelV = 0, target = 0;    // hauteur remplie (0 → 1,2 × l'écran)
    let tilt = 0, tiltV = 0;                  // bascule d'un côté à l'autre
    let slosh = 0, sloshV = 0;                // second mode : le liquide se creuse / se bombe
    const ptr = { x: 0, y: 0, t: 0, on: false };
    let wipe = 0, wipeTarget = 0, p = 0;
    let lastY = window.scrollY, lastT = performance.now(), visible = false, raf = 0, ambient = 0;
    const seed = (k) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = stage.clientWidth; H = stage.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function progress() {
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      const run = Math.max(1, rect.height - (vh - 58));
      return clamp01((58 - rect.top) / run);
    }
    function onScroll() {
      const now = performance.now();
      const dt = Math.max(8, now - lastT) / 1000;
      const dy = window.scrollY - lastY;
      lastY = window.scrollY; lastT = now;
      p = progress();
      target = ease(seg(p, 0.1, 0.52)) * 1.22;
      wipeTarget = seg(p, 0.6, 0.84);
      stage.classList.toggle('is-camp', p >= 0.57);
      el.style.setProperty('--reveal', seg(p, 0.6, 0.9).toFixed(3));
      el.style.setProperty('--title', seg(p, 0.7, 0.88).toFixed(3));
      // le texte de la couverture s'écrit lettre par lettre ; la page reste collée tant qu'il n'est pas fini
      const typed = seg(p, 0.74, 0.95);
      blocks.forEach((item) => {
        if (!item.driven || !el.contains(item.block)) return;
        const target = Math.round(typed * item.letters.length);
        if (target === item.shown) return;
        const [from, to] = target > item.shown ? [item.shown, target] : [target, item.shown];
        for (let k = from; k < to; k += 1) item.letters[k].classList.toggle('on', k < target);
        item.shown = target;
      });
      // la secousse du défilement : rebond du niveau, bascule, vagues aléatoires
      const vel = Math.max(-3000, Math.min(3000, dy / dt));
      levelV -= vel * 0.00022;
      tiltV += vel * 0.03;
      sloshV += Math.abs(vel) * 0.03 * (Math.random() < 0.5 ? -1 : 1);
      const amp = Math.min(900, Math.abs(vel) * 0.18);
      for (let n = 0; n < 4; n += 1) {
        const i = 2 + Math.floor(Math.random() * (N - 4));
        const s = (Math.random() - 0.5) * 2 * amp;
        dv[i] += s; dv[i - 1] += s * 0.5; dv[i + 1] += s * 0.5;
      }
      start();
    }
    function step(h) {
      // niveau : ressort amorti (il dépasse un peu avant de se poser)
      levelV += ((target - level) * 38 - levelV * 8.5) * h;
      level += levelV * h;
      tiltV += (-tilt * 9 - tiltV * 0.9) * h;
      tilt += tiltV * h;
      if (tilt > 150 || tilt < -150) { tilt = Math.max(-150, Math.min(150, tilt)); tiltV *= -0.4; }
      sloshV += (-slosh * 22 - sloshV * 1.1) * h;
      slosh += sloshV * h;
      // vagues : équation d'onde amortie
      for (let i = 0; i <= N; i += 1) {
        const l = d[i === 0 ? 1 : i - 1], r = d[i === N ? N - 1 : i + 1];
        dv[i] += (-18 * d[i] + 2600 * (l + r - 2 * d[i]) - 2.4 * dv[i]) * h;
      }
      for (let i = 0; i <= N; i += 1) d[i] += dv[i] * h;
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      if (level < 0.002 && wipe < 0.001 && p < 0.01) return;
      const base = H * (1 - level);
      const surf = (i, layer) => {
        const x = (i / N) * W;
        const mid = 4 * level * Math.max(0, 1.25 - level);              // plus la surface est au milieu de l'écran, plus elle est vallonnée
        const idle = (18 + 34 * Math.min(1, mid)) * Math.sin(x * 0.0042 + t * 0.7)
                   + (10 + 16 * Math.min(1, mid)) * Math.sin(x * 0.0093 - t * 1.15 + 1.3)
                   + 6 * Math.sin(x * 0.021 + t * 1.8) + 3 * Math.sin(x * 0.043 - t * 2.4);
        return base + d[i] + tilt * (i / N - 0.5) * 2 + slosh * Math.cos((i / N) * 6.2832) + idle;
      };
      const layer = (color, layerIdx) => {
        ctx.beginPath(); ctx.moveTo(0, H + 20);
        for (let i = 0; i <= N; i += 1) ctx.lineTo((i / N) * W, surf(i, layerIdx));
        ctx.lineTo(W, H + 20); ctx.closePath(); ctx.fillStyle = color; ctx.fill();
      };
      layer('#f0c6de', 0);
      // le liquide quitte l'écran par le côté (de gauche à droite), bord ondulé et bulleux
      if (wipe > 0.001) {
        const ex = -140 + wipe * (W + 360);
        const edge = (y) => ex + 38 * Math.sin(y * 0.012 + t * 2.2) + 20 * Math.sin(y * 0.031 - t * 1.4);
        ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.moveTo(-10, -10);
        for (let y = -10; y <= H + 10; y += 8) ctx.lineTo(edge(y), y);
        ctx.lineTo(-10, H + 10); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
    function frame(now) {
      raf = 0;
      if (!visible) return;
      const t = now / 1000;
      wipe += (wipeTarget - wipe) * 0.14;
      if (now - ambient > 450) {
        ambient = now;
        const i = 2 + Math.floor(Math.random() * (N - 4)), s = (Math.random() - 0.5) * 260;
        dv[i] += s; dv[i - 1] += s * 0.6; dv[i + 1] += s * 0.6;
        tiltV += (Math.random() - 0.5) * 14;
      }
      for (let k = 0; k < 4; k += 1) step(1 / 240);
      draw(t);
      raf = requestAnimationFrame(frame);        // continue : la surface respire toujours
    }
    function start() { if (!raf && visible) raf = requestAnimationFrame(frame); }
    // le curseur dans le liquide : il le pousse comme une main (vagues, bascule, creux)
    window.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) { ptr.on = false; return; }
      const now = performance.now();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      const dt = Math.max(8, now - ptr.t) / 1000;
      if (ptr.on && now - ptr.t < 150) {
        const vx = Math.max(-3500, Math.min(3500, (x - ptr.x) / dt));
        const vy = Math.max(-3500, Math.min(3500, (y - ptr.y) / dt));
        const col = Math.min(N - 2, Math.max(2, Math.round((x / W) * N)));
        const surface = H * (1 - level) + d[col];
        if (level > 0.03 && y > surface - 40) {
          tiltV -= vx * 0.02;                         // la main pousse : le liquide s'empile devant
          sloshV += Math.abs(vx) * 0.01;
          const push = vy * 0.5 + Math.abs(vx) * 0.12;
          for (let k = -3; k <= 3; k += 1) dv[col + k] += push * Math.exp(-(k * k) / 3.5);
          levelV -= vy * 0.00008;
        }
      }
      ptr.x = x; ptr.y = y; ptr.t = now; ptr.on = true;
      start();
    }, { passive: true });
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) { size(); onScroll(); start(); } }, { rootMargin: '200px' }).observe(stage);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { size(); onScroll(); }, { passive: true });
    size(); onScroll();
  });

  // Rectangle blanc d'affiches qui monte (transition) : colonnes pilotées par le défilement.
  const rises = Array.from(root.querySelectorAll('[data-rise]'));
  const riseMq = window.matchMedia('(min-width: 761px) and (prefers-reduced-motion: no-preference)');
  function updateRises() {
    rises.forEach((el) => {
      if (!riseMq.matches) { el.style.removeProperty('--p'); el.style.removeProperty('--rise'); return; }
      const rect = el.getBoundingClientRect();
      const top = 57.6;
      const run = Math.max(1, rect.height - (window.innerHeight - top));
      const p = Math.min(1, Math.max(0, (top - rect.top) / run));
      el.style.setProperty('--p', p.toFixed(4));
      // vraie transition : les colonnes montent l'une après l'autre, dans le désordre, à des vitesses différentes
      const starts = [0.05, 0.16, 0.0, 0.11, 0.08];
      const dur = [0.24, 0.2, 0.27, 0.22, 0.25];
      el.querySelectorAll('.gs-rise__col').forEach((col, i) => {
        const t = Math.min(1, Math.max(0, (p - starts[i % 5]) / dur[i % 5]));
        col.style.setProperty('--r', (t * t * t * (t * (6 * t - 15) + 10)).toFixed(4));   // départ et arrivée tout en douceur
      });
    });
  }
  if (rises.length) {
    window.addEventListener('scroll', updateRises, { passive: true });
    window.addEventListener('resize', updateRises);
    updateRises();
  }

  // « À propos » → « Contact » : la zone (.gs-turn) est très haute (640 % de l'écran) et son
  // contenu reste collé (position: sticky) pendant qu'on la traverse. On calcule la
  // progression p (0 → 1) de ce trajet, puis on la découpe en phases, chacune dans sa variable :
  //   --sw  texte de présentation → liste des compétences
  //   --sk  les compétences arrivent une par une
  //   --sw2 compétences → logiciels
  //   --tl  les logiciels arrivent un par un
  //   --turn la page « À propos » sort à gauche et « Contact » arrive depuis la droite
  // Le CSS lit ces variables pour décaler les blocs : aucune transparence, que des glissements.
  const turns = Array.from(root.querySelectorAll('[data-turn]'));
  const turnMq = window.matchMedia('(min-width: 761px) and (prefers-reduced-motion: no-preference)');
  function updateTurns() {
    turns.forEach((el) => {
      const page = el.querySelector('.gs-turn__page');
      if (!page) return;
      if (!turnMq.matches) { el.style.removeProperty('--turn'); el.style.removeProperty('--sw'); el.style.removeProperty('--sk'); el.style.removeProperty('--sw2'); el.style.removeProperty('--tl'); page.classList.remove('is-turned', 'is-turning'); return; }
      const rect = el.getBoundingClientRect();
      const top = 57.6;                                   // 3,6 rem : hauteur de la barre de navigation
      const run = Math.max(1, rect.height - (window.innerHeight - top));
      const p = Math.min(1, Math.max(0, (top - rect.top) / run));
      // Chaque phase = « clamp » : on borne (valeur - début) / durée entre 0 et 1.
      const sw = Math.min(1, Math.max(0, (p - 0.07) / 0.15));   // texte → « ce que je sais faire »
      el.style.setProperty('--sw', (sw * sw * (3 - 2 * sw)).toFixed(4));
      el.style.setProperty('--sk', Math.min(1, Math.max(0, (p - 0.22) / 0.22)).toFixed(4));   // compétences une par une
      el.style.setProperty('--sw2', Math.min(1, Math.max(0, (p - 0.5) / 0.15)).toFixed(4));   // compétences → logiciels
      el.style.setProperty('--tl', Math.min(1, Math.max(0, (p - 0.62) / 0.12)).toFixed(4));   // logiciels un par un
      const t = Math.min(1, Math.max(0, (p - 0.76) / 0.22));
      const e = t * t * (3 - 2 * t);                      // « smoothstep » : départ et arrivée en douceur
      el.style.setProperty('--turn', e.toFixed(4));
      page.classList.toggle('is-turned', e > 0.5);
      page.classList.toggle('is-turning', e > 0.005);
      el.classList.toggle('is-turning', e > 0.005);
    });
  }
  if (turns.length) {
    window.addEventListener('scroll', updateTurns, { passive: true });
    window.addEventListener('resize', updateTurns);
    updateTurns();
  }

  const request = () => { if (frame === null) frame = requestAnimationFrame(update); };
  window.addEventListener('scroll', request, { passive: true });
  if (layers.length) {
    const requestDepth = () => { if (depthFrame === null) depthFrame = requestAnimationFrame(depth); };
    window.addEventListener('scroll', requestDepth, { passive: true });
    window.addEventListener('resize', requestDepth, { passive: true });
    depth();
  }
  window.addEventListener('resize', request, { passive: true });
  update();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initGridSite, { once: true });
else initGridSite();
