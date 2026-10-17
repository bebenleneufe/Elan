/**
 * Se centralizan los iconos vectoriales Lucide y los datos de entrenamiento con textos
 * ultracompactos para priorizar la lectura visual e iconográfica sin párrafos innecesarios.
 */
window.AppData = (function createAppData() {
  /**
   * Se emplean iconos SVG de trazo uniforme estilo Lucide (stroke-width 2, 24x24)
   * para reemplazar etiquetas verbosas por iconografía clara en toda la interfaz.
   */
  const ICONS = {
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>',
    skipForward: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    volume2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    volumeX: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>',
    activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    rotateCcw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
    sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',
    trendingUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    trendingDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    chevronUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>',
    externalLink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>'
  };


  const CATEGORY_ICONS = {
    echauffement: ICONS.wind,
    jambes: ICONS.zap,
    haut: ICONS.dumbbell,
    core: ICONS.shield,
    cardio: ICONS.flame,
    etirement: ICONS.wind
  };

  const CATEGORY_LABELS = {
    echauffement: 'Échauffement',
    jambes: 'Jambes',
    haut: 'Haut du corps',
    core: 'Gainage',
    cardio: 'Cardio',
    etirement: 'Étirement'
  };

  /**
   * Fotografías de dominio público (free-exercise-db, Unlicense) en assets/photos/<carpeta>/0|1.jpg.
   * Las dos imágenes (posición inicial y final) se alternan para mostrar el movimiento.
   */
  function getExerciseMedia(photo, alt, extraClass) {
    const base = `assets/photos/${photo}`;
    return `
      <div class="photo-flip ${extraClass || ''}">
        <img src="${base}/0.jpg" alt="${alt}" loading="lazy" decoding="async" />
        <img src="${base}/1.jpg" alt="" aria-hidden="true" loading="lazy" decoding="async" />
      </div>
    `;
  }

  /**
   * Cada ejercicio tiene hasta tres niveles; cada nivel es una variante real con su propia foto,
   * su valor base y, si cambia, su modo (repeticiones o tiempo).
   */
  const EXERCISES = [
    // --- Échauffement ---
    {
      id: 'arm-circles',
      name: 'Cercles de bras',
      category: 'echauffement',
      muscles: 'Épaules',
      mode: 'timer',
      cues: ['Bras tendus à l’horizontale', 'Petits cercles, puis plus grands', 'Changez de sens au bip'],
      levels: { 1: { label: 'Cercles de bras', photo: 'arm-circles', base: 30 } }
    },
    {
      id: 'cat-stretch',
      name: 'Dos rond, dos creux',
      category: 'echauffement',
      muscles: 'Colonne • Dos',
      mode: 'timer',
      cues: ['À quatre pattes, mains sous les épaules', 'Expirez en arrondissant le dos', 'Inspirez en creusant doucement'],
      levels: { 1: { label: 'Dos rond, dos creux', photo: 'cat-stretch', base: 30 } }
    },
    {
      id: 'hip-circles',
      name: 'Cercles de hanches',
      category: 'echauffement',
      muscles: 'Hanches',
      mode: 'timer',
      cues: ['Mains sur les hanches, genoux souples', 'Grands cercles lents', 'Changez de sens au bip'],
      levels: { 1: { label: 'Cercles de hanches', photo: 'standing-hip-circles', base: 30 } }
    },
    {
      id: 'inchworm',
      name: 'Chenille',
      // Sujet décentré sur la photo : cadrage des vignettes portrait
      focus: '72% 50%',
      category: 'echauffement',
      muscles: 'Ischios • Épaules',
      mode: 'timer',
      cues: ['Penchez-vous, mains au sol', 'Marchez avec les mains jusqu’à la planche', 'Revenez en marchant, genoux pliés si besoin'],
      levels: { 1: { label: 'Chenille', photo: 'inchworm', base: 30 } }
    },
    {
      id: 'worlds-greatest',
      name: 'Fente et rotation',
      category: 'echauffement',
      muscles: 'Hanches • Dos',
      mode: 'timer',
      cues: ['Grande fente, main au sol', 'Ouvrez l’autre bras vers le plafond', 'Changez de côté au bip'],
      levels: { 1: { label: 'Fente et rotation', photo: 'worlds-greatest-stretch', base: 30 } }
    },

    // --- Bloc principal ---
    {
      id: 'squat',
      name: 'Squat',
      category: 'jambes',
      muscles: 'Cuisses • Fessiers',
      mode: 'reps',
      cues: ['Pieds largeur d’épaules', 'Fesses en arrière, dos droit', 'Poussez dans les talons pour remonter'],
      levels: {
        1: { label: 'Demi-squat', photo: 'bodyweight-squat', base: 10 },
        2: { label: 'Squat complet', photo: 'bodyweight-squat', base: 12 },
        3: { label: 'Squat sauté', photo: 'freehand-jump-squat', base: 10 }
      }
    },
    {
      id: 'fente',
      name: 'Fente',
      category: 'jambes',
      muscles: 'Cuisses • Fessiers',
      mode: 'reps',
      perSide: true,
      cues: ['Buste droit, regard devant', 'Genou avant au-dessus de la cheville', 'Genou arrière vers le sol, sans le cogner'],
      levels: {
        1: { label: 'Fente sur place', photo: 'split-squats', base: 8 },
        2: { label: 'Fente arrière', photo: 'crossover-reverse-lunge', base: 10 },
        3: { label: 'Fente marchée', photo: 'bodyweight-walking-lunge', base: 12 }
      }
    },
    {
      id: 'pont',
      name: 'Pont fessier',
      category: 'jambes',
      muscles: 'Fessiers • Ischios',
      mode: 'reps',
      cues: ['Sur le dos, pieds à plat près des fesses', 'Montez le bassin en serrant les fessiers', 'Redescendez lentement'],
      levels: {
        1: { label: 'Bascule du bassin', photo: 'pelvic-tilt-into-bridge', base: 10 },
        2: { label: 'Pont fessier', photo: 'butt-lift-bridge', base: 12 },
        3: { label: 'Pont sur une jambe', photo: 'single-leg-glute-bridge', base: 8, perSide: true }
      }
    },
    {
      id: 'pompes',
      name: 'Pompes',
      category: 'haut',
      muscles: 'Pectoraux • Bras',
      mode: 'reps',
      cues: ['Mains un peu plus larges que les épaules', 'Corps gainé en une seule ligne', 'Descendez la poitrine, pas les hanches'],
      levels: {
        1: { label: 'Mains sur une chaise ou le canapé', photo: 'incline-push-up', base: 8 },
        2: { label: 'Pompes au sol', photo: 'pushups', base: 8 },
        3: { label: 'Pieds surélevés', photo: 'push-ups-with-feet-elevated', base: 8 }
      }
    },
    {
      id: 'superman',
      name: 'Superman',
      category: 'haut',
      muscles: 'Dos • Épaules',
      mode: 'reps',
      cues: ['À plat ventre, bras devant', 'Décollez la poitrine et les bras, regard au sol', 'Redescendez sans relâcher d’un coup'],
      levels: {
        1: { label: 'Bras seuls', photo: 'superman', base: 10 },
        2: { label: 'Bras et jambes', photo: 'superman', base: 12 },
        3: { label: 'Position tenue', photo: 'superman', base: 30, mode: 'timer' }
      }
    },
    {
      id: 'planche',
      name: 'Planche',
      category: 'core',
      muscles: 'Abdos • Épaules',
      mode: 'timer',
      cues: ['Coudes sous les épaules', 'Fessiers serrés, bassin aligné', 'Respirez calmement'],
      levels: {
        1: { label: 'Sur les genoux', photo: 'plank', base: 20 },
        2: { label: 'Planche', photo: 'plank', base: 30 },
        3: { label: 'Pompe + planche latérale', photo: 'push-up-to-side-plank', base: 6, mode: 'reps' }
      }
    },
    {
      id: 'dead-bug',
      name: 'Dead bug',
      category: 'core',
      muscles: 'Abdos profonds',
      mode: 'reps',
      cues: ['Sur le dos, bas du dos collé au sol', 'Bras vers le plafond, genoux à 90°', 'Allongez bras et jambe opposés'],
      levels: {
        1: { label: 'Jambes seules', photo: 'dead-bug', base: 8 },
        2: { label: 'Bras et jambe opposés', photo: 'dead-bug', base: 10 },
        3: { label: 'Descente lente (3 s)', photo: 'dead-bug', base: 10 }
      }
    },
    {
      id: 'planche-laterale',
      name: 'Planche latérale',
      category: 'core',
      muscles: 'Obliques • Hanches',
      mode: 'timer',
      cues: ['Coude sous l’épaule', 'Hanches hautes, corps aligné', 'Changez de côté au bip'],
      levels: {
        1: { label: 'Sur les genoux', photo: 'side-bridge', base: 20 },
        2: { label: 'Jambes tendues', photo: 'side-bridge', base: 30 },
        3: { label: 'Tenue longue', photo: 'side-bridge', base: 40 }
      }
    },
    {
      id: 'cardio',
      name: 'Grimpeur',
      category: 'cardio',
      muscles: 'Cardio • Gainage',
      mode: 'timer',
      cues: ['Position de pompe, mains sous les épaules', 'Ramenez un genou après l’autre', 'Gardez le dos plat'],
      levels: {
        1: { label: 'Grimpeur lent', photo: 'mountain-climbers', base: 25 },
        2: { label: 'Grimpeur', photo: 'mountain-climbers', base: 30 },
        3: { label: 'Saut en étoile', photo: 'star-jump', base: 30 }
      }
    },

    // --- Retour au calme ---
    {
      id: 'hip-flexor',
      name: 'Étirement du psoas',
      category: 'etirement',
      muscles: 'Avant des hanches',
      mode: 'timer',
      cues: ['Un genou au sol, l’autre pied devant', 'Avancez le bassin doucement', 'Changez de côté au bip'],
      levels: { 1: { label: 'Étirement du psoas', photo: 'kneeling-hip-flexor', base: 40 } }
    },
    {
      id: 'childs-pose',
      name: 'Posture de l’enfant',
      category: 'etirement',
      muscles: 'Dos • Épaules',
      mode: 'timer',
      cues: ['Assis sur les talons', 'Allongez les bras loin devant', 'Respirez lentement dans le dos'],
      levels: { 1: { label: 'Posture de l’enfant', photo: 'childs-pose', base: 40 } }
    },
    {
      id: 'hamstring',
      name: 'Étirement des ischios',
      category: 'etirement',
      muscles: 'Arrière des cuisses',
      mode: 'timer',
      cues: ['Sur le dos, une jambe vers le plafond', 'Tenez derrière la cuisse', 'Changez de jambe au bip'],
      levels: { 1: { label: 'Étirement des ischios', photo: '90-90-hamstring', base: 40 } }
    },
    {
      id: 'spinal',
      name: 'Torsion assise',
      category: 'etirement',
      muscles: 'Dos • Taille',
      mode: 'timer',
      cues: ['Assis bien droit', 'Tournez le buste lentement', 'Changez de côté au bip'],
      levels: { 1: { label: 'Torsion assise', photo: 'spinal-stretch', base: 40 } }
    }
  ];

  /**
   * Cada sesión: calentamiento → bloque principal en varias vueltas → vuelta a la calma.
   */
  const WORKOUT_TEMPLATES = [
    {
      id: 'haut-a',
      letter: 'A',
      title: 'Haut du corps',
      focus: 'Pompes & dos',
      warmup: ['arm-circles', 'cat-stretch', 'inchworm'],
      main: ['pompes', 'superman', 'planche', 'dead-bug'],
      cooldown: ['childs-pose', 'spinal']
    },
    {
      id: 'bas-a',
      letter: 'B',
      title: 'Bas du corps',
      focus: 'Squats & fessiers',
      warmup: ['hip-circles', 'worlds-greatest', 'inchworm'],
      main: ['squat', 'pont', 'fente', 'planche-laterale'],
      cooldown: ['hip-flexor', 'hamstring']
    },
    {
      id: 'haut-b',
      letter: 'C',
      title: 'Haut du corps',
      focus: 'Gainage & cardio',
      warmup: ['arm-circles', 'cat-stretch', 'inchworm'],
      main: ['pompes', 'superman', 'planche-laterale', 'cardio'],
      cooldown: ['childs-pose', 'spinal']
    },
    {
      id: 'bas-b',
      letter: 'D',
      title: 'Bas du corps',
      focus: 'Fentes & fessiers',
      warmup: ['hip-circles', 'worlds-greatest', 'inchworm'],
      main: ['fente', 'squat', 'pont', 'dead-bug'],
      cooldown: ['hip-flexor', 'hamstring']
    },
    {
      id: 'mobilite',
      letter: 'M',
      title: 'Mobilité',
      optional: true,
      warmup: [],
      main: ['cat-stretch', 'worlds-greatest', 'hip-circles', 'hip-flexor', 'hamstring', 'spinal', 'childs-pose'],
      cooldown: []
    }
  ];

  /**
   * Programa sin fin en ciclos de 4 semanas × 4 sesiones alternando tren superior e inferior
   * (A haut, B bas, C haut, D bas): cada zona descansa mientras se trabaja la otra.
   * Semana 1 base, 2 y 3 más volumen, 4 descarga. Desde el ciclo 2 se añade una vuelta.
   */
  const SESSIONS_PER_WEEK = 4;
  const WEEKS_PER_CYCLE = 4;
  const SESSION_ROTATION = ['haut-a', 'bas-a', 'haut-b', 'bas-b'];
  const CYCLE_NAMES = ['Reprise', 'Fondations', 'Progression'];
  const WEEK_FACTORS = [1, 1.1, 1.2, 0.8];

  function getCycleName(cycleIndex) {
    return CYCLE_NAMES[cycleIndex] || `Élan ${cycleIndex - CYCLE_NAMES.length + 1}`;
  }

  function getProgramPosition(sessionIndex) {
    const n = Math.max(0, sessionIndex || 0);
    const perCycle = SESSIONS_PER_WEEK * WEEKS_PER_CYCLE;
    const cycleIndex = Math.floor(n / perCycle);
    const sessionInCycle = n % perCycle;
    const weekIndex = Math.floor(sessionInCycle / SESSIONS_PER_WEEK);
    const sessionInWeek = sessionInCycle % SESSIONS_PER_WEEK;
    const isDeload = weekIndex === WEEKS_PER_CYCLE - 1;
    const baseRounds = cycleIndex === 0 ? 2 : 3;

    return {
      sessionIndex: n,
      cycleIndex,
      cycleName: getCycleName(cycleIndex),
      sessionInCycle,
      sessionsPerCycle: perCycle,
      weekIndex,
      weeksPerCycle: WEEKS_PER_CYCLE,
      sessionInWeek,
      sessionsPerWeek: SESSIONS_PER_WEEK,
      isDeload,
      isLastOfCycle: sessionInCycle === perCycle - 1,
      templateId: SESSION_ROTATION[sessionInWeek],
      rounds: isDeload ? Math.max(2, baseRounds - 1) : baseRounds,
      volumeFactor: WEEK_FACTORS[weekIndex] * (1 + 0.05 * Math.min(cycleIndex, 6))
    };
  }

  function getExerciseLevel(exercise, level) {
    for (let l = Math.min(3, level || 1); l >= 1; l -= 1) {
      if (exercise.levels[l]) {
        const lv = exercise.levels[l];
        return {
          level: l,
          label: lv.label,
          photo: lv.photo,
          base: lv.base,
          mode: lv.mode || exercise.mode,
          perSide: lv.perSide !== undefined ? lv.perSide : Boolean(exercise.perSide)
        };
      }
    }
    return null;
  }

  /**
   * Objetivo final de una serie: el calentamiento y los estiramientos no escalan con el volumen.
   */
  function computeTarget(exercise, level, volumeFactor, intensityMultiplier) {
    const lv = getExerciseLevel(exercise, level);
    const scales = exercise.category !== 'echauffement' && exercise.category !== 'etirement';
    const raw = lv.base * (scales ? (volumeFactor || 1) * (intensityMultiplier || 1) : 1);
    return lv.mode === 'timer'
      ? Math.max(15, Math.round(raw / 5) * 5)
      : Math.max(4, Math.round(raw));
  }

  function formatTarget(value, lv) {
    if (lv.mode === 'timer') return `${value} s`;
    return lv.perSide ? `${value} rép. / côté` : `${value} rép.`;
  }

  // Jours sans séance de renforcement : marche d’un bon pas
  const WALK_TARGET_MIN = 30;

  const REST_BETWEEN_EXERCISES = 25;
  const REST_BETWEEN_ROUNDS = 60;
  const TRANSITION_SECONDS = 10;

  function estimateDurationMin(template, position, level, intensityMultiplier) {
    const secondsFor = (id) => {
      const ex = EXERCISES.find((e) => e.id === id);
      const lv = getExerciseLevel(ex, level);
      const target = computeTarget(ex, level, position.volumeFactor, intensityMultiplier);
      return lv.mode === 'timer' ? target : target * 3.5 * (lv.perSide ? 2 : 1);
    };
    const rounds = template.optional ? 1 : position.rounds;
    let total = 0;
    template.warmup.concat(template.cooldown).forEach((id) => {
      total += secondsFor(id) + TRANSITION_SECONDS;
    });
    total += rounds * template.main.reduce((sum, id) => sum + secondsFor(id) + REST_BETWEEN_EXERCISES, 0);
    total += (rounds - 1) * (REST_BETWEEN_ROUNDS - REST_BETWEEN_EXERCISES);
    return Math.max(5, Math.round(total / 60));
  }

  return {
    ICONS,
    CATEGORY_ICONS,
    CATEGORY_LABELS,
    EXERCISES,
    WORKOUT_TEMPLATES,
    WALK_TARGET_MIN,
    REST_BETWEEN_EXERCISES,
    REST_BETWEEN_ROUNDS,
    TRANSITION_SECONDS,
    getExerciseMedia,
    getProgramPosition,
    SESSION_ROTATION,
    getExerciseLevel,
    computeTarget,
    formatTarget,
    estimateDurationMin,
    getExerciseById(id) {
      return EXERCISES.find((ex) => ex.id === id) || EXERCISES[0];
    },
    getTemplateById(id) {
      return WORKOUT_TEMPLATES.find((tpl) => tpl.id === id) || WORKOUT_TEMPLATES[0];
    }
  };
})();
