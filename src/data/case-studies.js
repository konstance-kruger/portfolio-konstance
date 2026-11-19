// ÉTUDES DE CAS — Contenu des trois doubles pages « Étude de cas » du magazine.
// Tout vient de ce que Konstance a raconté : rien n'est inventé.
// Texte volontairement court : une phrase, trois repères, quatre étapes au plus.
//
// - lede   : la phrase qui résume le projet (Melodrama)
// - intro  : 2 ou 3 phrases d'explication
// - keys   : trois repères lus en un coup d'œil (keyLabels : leurs intitulés)
// - role   : mon rôle, en une ligne
// - steps  : [titre, une ligne] — 4 au maximum
// - result : { stat, label } ; link : { href, label } (facultatifs)
// - lesson : « Ce que j'en retiens » — s'affiche dès qu'il est rempli
// - lines  : le titre découpé en lignes (chaque ligne remplit la même largeur)
// - photo  : photo plein cadre facultative (avec légende), sinon page de texte

export const caseStudies = [
  {
    slug: 'nuits-du-sport',
    lines: ['Nuits du', 'sport'],
    photo: {
      file: 'caps/nuit-du-sport-coulisses.webp',
      alt: 'Les coulisses de la Nuit du sport',
      tag: 'Nuit du sport',
      date: '29 janv 2026',
    },
    number: '01',
    org: 'CAPS',
    title: 'Nuits du sport',
    lede: 'La MéMO nous demande de filmer son tournoi : on le commente en direct, comme un vrai match pro.',
    intro: 'La MéMO de notre IUT nous a proposé de filmer son tournoi de futsal et de volley. Avec CAPS, on a monté une régie dans le gymnase, et deux commentateurs se relayaient pour animer les matchs de façon amusante. Le but : que ceux qui n’étaient pas là puissent suivre le tournoi en se divertissant.',
    keys: ['29.01.26', '18 h → 00 h', 'Twitch'],
    keyLabels: ['Date', 'Horaire', 'Diffusion'],
    role: 'Commentatrice, réalisation, caméras, communication.',
    steps: [
      ['Préparer', 'Plan des caméras, câblage, régie dans le gymnase.'],
      ['Communiquer', 'Réseaux sociaux, affiches, flyers et bouche-à-oreille.'],
      ['Installer', '4 h de montage avant le live, 2 h de rangement après.'],
      ['Commenter', 'En duo, à tour de rôle, de 18 h à minuit.'],
    ],
    // frise : repères de la démarche, dans l'ordre (nouvelle DA) — [repère, mot]
    frise: [
      ['Avant', 'caméras, câblage, affiches'],
      ['4 h', 'de montage'],
      ['18 h', 'début du live'],
      ['00 h', 'fin du live'],
      ['2 h', 'de rangement'],
    ],
    result: { stat: '35–40', label: 'spectateurs en moyenne, constants sur les deux lives' },
    link: null,
    lesson: [],
  },
  {
    slug: 'festival-inoui',
    lines: ['Festival', 'Inoui'],
    number: '02',
    org: 'WebTV',
    title: 'Festival Inoui',
    lede: 'Au festival de l’innovation de mon IUT, la WebTV offre à chacun sa propre émission « TV ».',
    intro: 'Le Festival Inouï, dédié à l’innovation et aux technologies, s’est tenu dans mon école, l’IUT Nord Franche-Comté à Montbéliard. Sur le stand de la WebTV, on filmait les personnes qui le souhaitaient pour leur faire leur propre émission. J’ai aussi filmé des conférences du festival.',
    keys: ['Montbéliard', 'Plateau TV', 'Conférences'],
    keyLabels: ['Lieu', 'Format', 'Aussi'],
    role: 'Présentatrice, réalisatrice, ingénieure du son.',
    steps: [
      ['Accueillir', 'Les volontaires passent face caméra pour leur émission.'],
      ['Réaliser', 'Choisir les plans et mener chaque tournage.'],
      ['Prendre le son', 'En tant qu’ingénieure du son.'],
      ['Filmer', 'Les conférences du festival.'],
    ],
    result: { stat: '10+', label: 'personnes filmées pour leur propre émission' },
    link: null,
    lesson: [],
  },
  {
    slug: 'journee-portes-ouvertes',
    lines: ['Journée', 'portes', 'ouvertes'],
    number: '03',
    org: 'WebTV',
    title: 'Journée portes ouvertes',
    lede: 'Toute la journée, j’interviewe en direct les invités de l’IUT pour la chaîne de l’école.',
    intro: 'Pour la journée portes ouvertes, j’ai aidé au stand de la WebTV. Avant chaque interview, on préparait en 15 à 20 minutes des questions pour l’invité : intervenants des filières de l’IUT, des masters… Les interviews passaient en direct sur la chaîne YouTube de l’école.',
    keys: ['26.01.26', 'En direct', 'YouTube'],
    keyLabels: ['Date', 'Format', 'Diffusion'],
    role: 'Préparation des questions, intervieweuse.',
    steps: [
      ['Préparer', '15 à 20 min avant, des questions pour chaque invité.'],
      ['Interviewer', 'En live : filières de l’IUT, masters…'],
      ['Diffuser', 'Sur la chaîne YouTube de l’école.'],
    ],
    frise: [
      ['15–20 min', 'de questions préparées'],
      ['En direct', 'les interviews'],
      ['YouTube', 'chaîne de l’école'],
    ],
    result: null,
    link: { href: 'https://www.youtube.com/live/5t53BVs1ojQ', label: 'Voir le live sur YouTube' },
    lesson: [],
  },
];
