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
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>',
    skipForward: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    checkCircle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    volume2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    volumeX: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>',
    activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
    chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
    rotateCcw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
    repeat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
    sliders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>',
    wind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>',
    trendingUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
    trendingDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>'
  };

  const CATEGORY_ICONS = {
    mobilite: ICONS.wind,
    bas: ICONS.zap,
    haut: ICONS.dumbbell,
    core: ICONS.shield,
    cardio: ICONS.flame
  };

  function getExerciseIllustration(exerciseId) {
    const safeId = exerciseId || 'controlled-squat';
    return `
      <div class="real-exercise-gif-wrap">
        <img
          class="exercise-gif-img"
          src="assets/gifs/${safeId}.gif"
          alt="Animation de l'exercice"
          loading="lazy"
        />
      </div>
    `;
  }

  /**
   * Se condensan los nombres, músculos y claves posturales de los 14 ejercicios en micro-textos
   * directos para lectura instantánea durante el esfuerzo.
   */
  const EXERCISES = [
    {
      id: 'cat-cow',
      name: 'Ouverture Thoracique',
      category: 'mobilite',
      categoryLabel: 'Mobilité',
      muscles: 'Pectoraux • Haut du dos',
      mode: 'timer',
      baseValue: 40,
      unit: 's',
      whyFor30s: 'Redresse les épaules et ouvre la cage thoracique.',
      coachingCues: [
        'Debout, bras tendus à hauteur d’épaules.',
        'Inspirez en ouvrant grand et serrez les omoplates.',
        'Refermez avec fluidité.'
      ],
      progressions: {
        1: 'Amplitude douce, rythme lent',
        2: 'Pause 1s poitrine ouverte',
        3: 'Contraction tonique du dos'
      }
    },
    {
      id: 'thoracic-opener',
      name: 'Fente & Rotation',
      category: 'mobilite',
      categoryLabel: 'Mobilité',
      muscles: 'Dos • Hanches',
      mode: 'timer',
      baseValue: 45,
      unit: 's',
      whyFor30s: 'Délie hanches et colonne vertébrale en un mouvement.',
      coachingCues: [
        'Grand pas en fente, mains au sol.',
        'Ouvrez le bras côté jambe avant vers le plafond.',
        'Revenez au sol et alternez.'
      ],
      progressions: {
        1: 'Genou arrière posé au sol',
        2: 'Jambe arrière tendue',
        3: 'Fente + rotation + extension'
      }
    },
    {
      id: 'hip-flexor-pulse',
      name: 'Étirement Psoas',
      category: 'mobilite',
      categoryLabel: 'Mobilité',
      muscles: 'Psoas • Hanches',
      mode: 'timer',
      baseValue: 45,
      unit: 's',
      whyFor30s: 'Relâche la tension lombaire liée à la position assise.',
      coachingCues: [
        'Fente avant, buste bien vertical.',
        'Poussez le bassin vers l’avant.',
        'Changez de côté à mi-temps.'
      ],
      progressions: {
        1: 'Fente légère debout',
        2: 'Fente basse, fessier serré',
        3: 'Micro-impulsions basses'
      }
    },
    {
      id: 'controlled-squat',
      name: 'Squat',
      category: 'bas',
      categoryLabel: 'Jambes',
      muscles: 'Quadriceps • Fessiers',
      mode: 'reps',
      baseValue: 12,
      unit: '×',
      whyFor30s: 'Renforce cuisses et genoux.',
      coachingCues: [
        'Pieds largeur d’épaules, dos droit.',
        'Hanches vers l’arrière jusqu’à 90°.',
        'Poussez fort dans les talons.'
      ],
      progressions: {
        1: 'Demi-squat contrôlé',
        2: 'Squat complet parallèle',
        3: 'Pause 2s en bas'
      }
    },
    {
      id: 'glute-bridge',
      name: 'Pont Fessier',
      category: 'bas',
      categoryLabel: 'Jambes',
      muscles: 'Fessiers • Lombaires',
      mode: 'reps',
      baseValue: 14,
      unit: '×',
      whyFor30s: 'Réactive les fessiers et stabilise le bassin.',
      coachingCues: [
        'Sur le dos, pieds à plat près des fessiers.',
        'Montez le bassin jusqu’à aligner buste et genoux.',
        'Serrez les fessiers 1s en haut.'
      ],
      progressions: {
        1: 'Pause 1s en haut',
        2: 'Pause 3s contraction max',
        3: 'Sans reposer au sol'
      }
    },
    {
      id: 'reverse-lunge',
      name: 'Fentes Alternées',
      category: 'bas',
      categoryLabel: 'Jambes',
      muscles: 'Cuisses • Équilibre',
      mode: 'reps',
      baseValue: 12,
      unit: '×',
      whyFor30s: 'Équilibre la force gauche/droite des jambes.',
      coachingCues: [
        'Buste droit, fléchissez les deux genoux à 90°.',
        'Genou avant aligné avec la cheville.',
        'Repoussez et alternez.'
      ],
      progressions: {
        1: 'Demi-amplitude stable',
        2: 'Genou arrière frôlant le sol',
        3: 'Pause 2s en bas'
      }
    },
    {
      id: 'wall-sit',
      name: 'Chaise au Mur',
      category: 'bas',
      categoryLabel: 'Jambes',
      muscles: 'Quadriceps • Gainage',
      mode: 'timer',
      baseValue: 35,
      unit: 's',
      whyFor30s: 'Endurance musculaire des cuisses sans impact.',
      coachingCues: [
        'Dos plaqué au mur, genoux à 90°.',
        'Fixe ou décollez un pied après l’autre.',
        'Respirez calmement.'
      ],
      progressions: {
        1: 'Statique légèrement haut',
        2: 'À 90° talons alternés',
        3: 'Montées de pieds alternées'
      }
    },
    {
      id: 'pushup-progression',
      name: 'Pompes',
      category: 'haut',
      categoryLabel: 'Haut',
      muscles: 'Pectoraux • Triceps',
      mode: 'reps',
      baseValue: 10,
      unit: '×',
      whyFor30s: 'Tonifie torse, épaules et bras.',
      coachingCues: [
        'Corps gainé en ligne droite.',
        'Poitrine vers le sol, coudes à 45°.',
        'Poussez en expirant.'
      ],
      progressions: {
        1: 'Sur les genoux ou surélevé',
        2: 'Classiques au sol',
        3: 'Descente lente 3s'
      }
    },
    {
      id: 'scapular-superman',
      name: 'Superman Nageur',
      category: 'haut',
      categoryLabel: 'Haut',
      muscles: 'Dos • Lombaires',
      mode: 'reps',
      baseValue: 14,
      unit: '×',
      whyFor30s: 'Renforce toute la chaîne postérieure.',
      coachingCues: [
        'À plat ventre, décollez buste et jambes.',
        'Regard vers le tapis (nuque longue).',
        'Battements alternés bras/jambes.'
      ],
      progressions: {
        1: 'Avec pause au sol',
        2: 'Battements continus',
        3: 'Maintien haut tonique'
      }
    },
    {
      id: 'pike-shoulder-press',
      name: 'Touches d’Épaules',
      category: 'haut',
      categoryLabel: 'Haut',
      muscles: 'Épaules • Gainage',
      mode: 'reps',
      baseValue: 14,
      unit: '×',
      whyFor30s: 'Stabilise les épaules et la sangle profonde.',
      coachingCues: [
        'Planche haute, pieds écartés.',
        'Touchez l’épaule opposée en alternant.',
        'Bassin fixe sans dandiner.'
      ],
      progressions: {
        1: 'Sur les genoux',
        2: 'Planche haute fluide',
        3: 'Pause 2s par touche'
      }
    },
    {
      id: 'plank-core',
      name: 'Gainage Rotation',
      category: 'core',
      categoryLabel: 'Abdos',
      muscles: 'Abdos • Obliques',
      mode: 'timer',
      baseValue: 35,
      unit: 's',
      whyFor30s: 'Gaine la taille et protège les lombaires.',
      coachingCues: [
        'Sur les avant-bras, corps aligné.',
        'Ouvrez un bras vers le plafond en alternant.',
        'Ventre rentré, souffle régulier.'
      ],
      progressions: {
        1: 'Planche fixe sans rotation',
        2: 'Rotations alternées fluides',
        3: 'Pause 2s bras ouvert'
      }
    },
    {
      id: 'bird-dog',
      name: 'Dead Bug',
      category: 'core',
      categoryLabel: 'Abdos',
      muscles: 'Transverse • Abdos',
      mode: 'reps',
      baseValue: 12,
      unit: '×',
      whyFor30s: 'Renforce les abdos profonds dos plaqué au sol.',
      coachingCues: [
        'Sur le dos, lombaires collées au sol.',
        'Tendez bras et jambe opposés sans cambrer.',
        'Revenez et alternez.'
      ],
      progressions: {
        1: 'Jambes seules pliées',
        2: 'Bras + jambe opposés',
        3: 'Descente lente 3s'
      }
    },
    {
      id: 'step-jacks',
      name: 'Jumping Jacks',
      category: 'cardio',
      categoryLabel: 'Cardio',
      muscles: 'Cardio • Mollets',
      mode: 'timer',
      baseValue: 45,
      unit: 's',
      whyFor30s: 'Active le cœur et brûle des calories.',
      coachingCues: [
        'Écartez pieds et bras simultanément.',
        'Atterrissage souple sur l’avant du pied.',
        'Rythme régulier.'
      ],
      progressions: {
        1: 'Sans saut (un pied après l’autre)',
        2: 'Sauts souples réguliers',
        3: 'Rythme rapide'
      }
    },
    {
      id: 'shadow-knees',
      name: 'Mountain Climbers',
      category: 'cardio',
      categoryLabel: 'Cardio',
      muscles: 'Cardio • Abdos',
      mode: 'timer',
      baseValue: 40,
      unit: 's',
      whyFor30s: 'Cardio intense et gainage abdominal.',
      coachingCues: [
        'Planche haute, mains sous les épaules.',
        'Montez les genoux vers la poitrine en alternant.',
        'Hanches basses et stables.'
      ],
      progressions: {
        1: 'Pas contrôlés sans saut',
        2: 'Rythme fluide continu',
        3: 'Sprint dynamique'
      }
    }
  ];

  const WORKOUT_TEMPLATES = [
    {
      id: 'jour-1-fondations',
      title: 'Full Body & Fondations',
      durationMin: 14,
      caloriesEst: 135,
      tag: 'Full Body',
      exerciseIds: [
        'cat-cow',
        'thoracic-opener',
        'controlled-squat',
        'pushup-progression',
        'glute-bridge',
        'bird-dog',
        'plank-core',
        'hip-flexor-pulse'
      ]
    },
    {
      id: 'jour-2-posture-dos',
      title: 'Dos & Posture',
      durationMin: 11,
      caloriesEst: 90,
      tag: 'Posture',
      exerciseIds: [
        'cat-cow',
        'thoracic-opener',
        'scapular-superman',
        'glute-bridge',
        'bird-dog',
        'hip-flexor-pulse'
      ]
    },
    {
      id: 'jour-3-cardio-abdos',
      title: 'Cardio & Abdos',
      durationMin: 15,
      caloriesEst: 165,
      tag: 'Cardio',
      exerciseIds: [
        'thoracic-opener',
        'step-jacks',
        'controlled-squat',
        'bird-dog',
        'shadow-knees',
        'plank-core',
        'step-jacks',
        'hip-flexor-pulse'
      ]
    },
    {
      id: 'jour-4-haut-carrure',
      title: 'Haut du Corps',
      durationMin: 15,
      caloriesEst: 145,
      tag: 'Haut',
      exerciseIds: [
        'cat-cow',
        'thoracic-opener',
        'pushup-progression',
        'scapular-superman',
        'pike-shoulder-press',
        'pushup-progression',
        'plank-core'
      ]
    },
    {
      id: 'jour-5-jambes-tonus',
      title: 'Jambes & Gainage',
      durationMin: 15,
      caloriesEst: 155,
      tag: 'Jambes',
      exerciseIds: [
        'hip-flexor-pulse',
        'controlled-squat',
        'glute-bridge',
        'reverse-lunge',
        'wall-sit',
        'bird-dog',
        'hip-flexor-pulse'
      ]
    },
    {
      id: 'jour-6-circuit-complet',
      title: 'Circuit Complet',
      durationMin: 16,
      caloriesEst: 175,
      tag: 'Circuit',
      exerciseIds: [
        'cat-cow',
        'step-jacks',
        'controlled-squat',
        'pushup-progression',
        'reverse-lunge',
        'pike-shoulder-press',
        'shadow-knees',
        'plank-core'
      ]
    },
    {
      id: 'jour-7-recuperation',
      title: 'Mobilité & Récupération',
      durationMin: 10,
      caloriesEst: 75,
      tag: 'Mobilité',
      exerciseIds: [
        'cat-cow',
        'thoracic-opener',
        'hip-flexor-pulse',
        'glute-bridge',
        'scapular-superman',
        'bird-dog'
      ]
    }
  ];

  const PROGRAM_WEEKS = [
    {
      weekNumber: 1,
      title: 'Semaine 1',
      days: [
        { day: 1, title: 'J1 • Full Body', templateId: 'jour-1-fondations', xpReward: 120 },
        { day: 2, title: 'J2 • Dos & Posture', templateId: 'jour-2-posture-dos', xpReward: 100 },
        { day: 3, title: 'J3 • Cardio & Abdos', templateId: 'jour-3-cardio-abdos', xpReward: 130 },
        { day: 4, title: 'J4 • Haut du Corps', templateId: 'jour-4-haut-carrure', xpReward: 130 },
        { day: 5, title: 'J5 • Jambes', templateId: 'jour-5-jambes-tonus', xpReward: 135 },
        { day: 6, title: 'J6 • Circuit', templateId: 'jour-6-circuit-complet', xpReward: 145 },
        { day: 7, title: 'J7 • Mobilité', templateId: 'jour-7-recuperation', xpReward: 100 }
      ]
    },
    {
      weekNumber: 2,
      title: 'Semaine 2',
      days: [
        { day: 8, title: 'J8 • Full Body', templateId: 'jour-1-fondations', xpReward: 135 },
        { day: 9, title: 'J9 • Dos & Posture', templateId: 'jour-2-posture-dos', xpReward: 115 },
        { day: 10, title: 'J10 • Cardio & Abdos', templateId: 'jour-3-cardio-abdos', xpReward: 145 },
        { day: 11, title: 'J11 • Haut du Corps', templateId: 'jour-4-haut-carrure', xpReward: 145 },
        { day: 12, title: 'J12 • Jambes', templateId: 'jour-5-jambes-tonus', xpReward: 150 },
        { day: 13, title: 'J13 • Circuit', templateId: 'jour-6-circuit-complet', xpReward: 160 },
        { day: 14, title: 'J14 • Mobilité', templateId: 'jour-7-recuperation', xpReward: 110 }
      ]
    },
    {
      weekNumber: 3,
      title: 'Semaine 3',
      days: [
        { day: 15, title: 'J15 • Full Body', templateId: 'jour-1-fondations', xpReward: 155 },
        { day: 16, title: 'J16 • Dos & Posture', templateId: 'jour-2-posture-dos', xpReward: 125 },
        { day: 17, title: 'J17 • Cardio & Abdos', templateId: 'jour-3-cardio-abdos', xpReward: 165 },
        { day: 18, title: 'J18 • Haut du Corps', templateId: 'jour-4-haut-carrure', xpReward: 165 },
        { day: 19, title: 'J19 • Jambes', templateId: 'jour-5-jambes-tonus', xpReward: 170 },
        { day: 20, title: 'J20 • Circuit', templateId: 'jour-6-circuit-complet', xpReward: 180 },
        { day: 21, title: 'J21 • Mobilité', templateId: 'jour-7-recuperation', xpReward: 120 }
      ]
    },
    {
      weekNumber: 4,
      title: 'Semaine 4',
      days: [
        { day: 22, title: 'J22 • Full Body', templateId: 'jour-1-fondations', xpReward: 180 },
        { day: 23, title: 'J23 • Dos & Posture', templateId: 'jour-2-posture-dos', xpReward: 140 },
        { day: 24, title: 'J24 • Cardio & Abdos', templateId: 'jour-3-cardio-abdos', xpReward: 190 },
        { day: 25, title: 'J25 • Haut du Corps', templateId: 'jour-4-haut-carrure', xpReward: 195 },
        { day: 26, title: 'J26 • Jambes', templateId: 'jour-5-jambes-tonus', xpReward: 200 },
        { day: 27, title: 'J27 • Mobilité', templateId: 'jour-7-recuperation', xpReward: 140 },
        { day: 28, title: 'J28 • Finale', templateId: 'jour-6-circuit-complet', xpReward: 250 }
      ]
    }
  ];

  const DAILY_QUESTS = [];
  const BADGES = [];

  return {
    ICONS,
    CATEGORY_ICONS,
    EXERCISES,
    WORKOUT_TEMPLATES,
    PROGRAM_WEEKS,
    DAILY_QUESTS,
    BADGES,
    getExerciseIllustration,
    getExerciseById(id) {
      return EXERCISES.find((ex) => ex.id === id) || EXERCISES[0];
    },
    getTemplateById(id) {
      return WORKOUT_TEMPLATES.find((tpl) => tpl.id === id) || WORKOUT_TEMPLATES[0];
    }
  };
})();
