/**
 * Se centralizan los iconos vectoriales Lucide y los datos de entrenamiento para garantizar
 * consistencia visual sin emojis y permitir reutilización entre vistas.
 */
window.AppData = (function createAppData() {
  /**
   * Se emplean iconos SVG de trazo uniforme estilo Lucide (stroke-width 2, 24x24)
   * para cumplir con la accesibilidad visual y evitar inconsistencias entre sistemas operativos.
   */
  const ICONS = {
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    dumbbell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>',
    skipForward: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
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
    rotateCcw: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>'
  };

  /**
   * Se emplean animaciones GIF anatómicas en bucle almacenadas localmente (assets/gifs/)
   * para mostrar de forma continua la ejecución exacta y los músculos implicados en cada ejercicio.
   */
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
        <span class="demo-live-badge">GIF Animé</span>
      </div>
    `;
  }

  /**
   * Se sincronizan al 100% los nombres, músculos e instrucciones de los 14 ejercicios con
   * el movimiento exacto que muestra cada animación GIF para evitar cualquier contradicción visual.
   */
  const EXERCISES = [
    {
      id: 'cat-cow',
      name: 'Ouverture Dynamique Pectoraux & Dos',
      category: 'mobilite',
      categoryLabel: 'Mobilité & Dos',
      muscles: 'Pectoraux, Haut du dos, Épaules',
      mode: 'timer',
      baseValue: 40,
      unit: 'sec',
      whyFor30s: 'Ouvre la cage thoracique et redresse immédiatement les épaules voûtées par l’ordinateur.',
      coachingCues: [
        'Debout bien droit, pieds largeur d’épaules, tendez les bras devant vous à hauteur de poitrine.',
        'Inspirez en ouvrant grand les bras vers l’arrière tout en resserrant les omoplates.',
        'Ramenez les bras devant vous de façon fluide et contrôlée puis répétez.'
      ],
      progressions: {
        1: 'Amplitude douce à rythme calme en respirant profondément.',
        2: 'Amplitude complète avec maintien d’une seconde poitrine ouverte.',
        3: 'Rythme tonique en contractant volontairement le haut du dos à chaque ouverture.'
      }
    },
    {
      id: 'thoracic-opener',
      name: 'Grande Fente & Rotation Thoracique',
      category: 'mobilite',
      categoryLabel: 'Mobilité & Dos',
      muscles: 'Colonne thoracique, Hanches, Ischio-jambiers',
      mode: 'timer',
      baseValue: 45,
      unit: 'sec',
      whyFor30s: 'Le meilleur mouvement complet ("World’s Greatest Stretch") pour délier hanches et colonne après une journée assise.',
      coachingCues: [
        'Avancez un grand pas en fente et posez les mains au sol de chaque côté du pied avant.',
        'Pivotez le buste en levant le bras du côté de la jambe avant vers le plafond.',
        'Revenez au sol, tendez brièvement la jambe avant puis alternez.'
      ],
      progressions: {
        1: 'Genou arrière posé au sol pour plus de stabilité pendant la rotation.',
        2: 'Jambe arrière tendue avec ouverture complète du bras vers le plafond.',
        3: 'Enchaînement fluide fente + rotation + extension des ischio-jambiers.'
      }
    },
    {
      id: 'hip-flexor-pulse',
      name: 'Étirement Psoas & Fléchisseurs (Fente)',
      category: 'mobilite',
      categoryLabel: 'Mobilité & Dos',
      muscles: 'Psoas, Fléchisseurs de hanche, Cuisses',
      mode: 'timer',
      baseValue: 45,
      unit: 'sec',
      whyFor30s: 'Un psoas raccourci par la chaise tire sur les lombaires : l’étirer libère immédiatement le bas du dos.',
      coachingCues: [
        'Debout, faites un grand pas en avant et fléchissez le genou avant en gardant la jambe arrière tendue.',
        'Posez les mains sur votre cuisse avant pour stabiliser le buste bien droit.',
        'Poussez doucement le bassin vers l’avant et changez de jambe à mi-temps.'
      ],
      progressions: {
        1: 'Fente modérée debout, buste vertical et mains sur la cuisse.',
        2: 'Fente profonde avec jambe arrière bien tendue et fessier engagé.',
        3: 'Maintien bas actif avec micro-impulsions contrôlées du bassin.'
      }
    },
    {
      id: 'controlled-squat',
      name: 'Squat Contrôlé Poids du Corps',
      category: 'bas',
      categoryLabel: 'Bas du Corps',
      muscles: 'Quadriceps, Fessiers, Sangle abdominale',
      mode: 'reps',
      baseValue: 12,
      unit: 'rép',
      whyFor30s: 'Relance le métabolisme hormonal et renforce les cuisses et genoux grâce à une descente maîtrisée.',
      coachingCues: [
        'Pieds largeur d’épaules, tendez les bras devant vous pour équilibrer le buste.',
        'Poussez les hanches vers l’arrière et fléchissez les genoux jusqu’à l’horizontale.',
        'Poussez fort dans les talons pour remonter en gardant le dos droit.'
      ],
      progressions: {
        1: 'Demi-squat contrôlé ou descente jusqu’à effleurer une chaise.',
        2: 'Squat complet parallèle au sol (2 secondes à la descente).',
        3: 'Squat Tempo avec pause de 2 secondes en bas de chaque répétition.'
      }
    },
    {
      id: 'glute-bridge',
      name: 'Pont Fessier au Sol (Glute Bridge)',
      category: 'bas',
      categoryLabel: 'Bas du Corps',
      muscles: 'Fessiers, Ischio-jambiers, Lombaires',
      mode: 'reps',
      baseValue: 14,
      unit: 'rép',
      whyFor30s: 'Réveille les fessiers endormis par la sédentarité et stabilise durablement le bassin.',
      coachingCues: [
        'Allongé sur le dos, genoux fléchis, pieds à plat au sol et bras le long du corps.',
        'Poussez dans les talons pour soulever les hanches jusqu’à aligner genoux, bassin et épaules.',
        'Contractez fort les fessiers 1 à 2 secondes en haut avant de redescendre.'
      ],
      progressions: {
        1: 'Pont fessier classique à deux jambes avec pause de 1 seconde.',
        2: 'Pont fessier avec maintien de 3 secondes en contraction maximale.',
        3: 'Descente lente sans reposer complètement les fessiers au sol entre les répétitions.'
      }
    },
    {
      id: 'reverse-lunge',
      name: 'Fentes Alternées Poids du Corps',
      category: 'bas',
      categoryLabel: 'Bas du Corps',
      muscles: 'Quadriceps, Fessiers, Équilibre',
      mode: 'reps',
      baseValue: 12,
      unit: 'rép (total)',
      whyFor30s: 'Travaille chaque jambe individuellement pour corriger les déséquilibres musculaires et sculpter les cuisses.',
      coachingCues: [
        'Debout mains sur les hanches, faites un pas contrôlé et fléchissez les deux genoux à 90°.',
        'Gardez le buste bien droit et le genou avant aligné au-dessus de la cheville.',
        'Poussez sur la jambe avant pour revenir debout et alternez droite/gauche.'
      ],
      progressions: {
        1: 'Amplitude modérée en gardant un rythme lent et stable.',
        2: 'Fentes alternées complètes (genou arrière proche du sol).',
        3: 'Fentes alternées avec pause de 2 secondes en position basse.'
      }
    },
    {
      id: 'wall-sit',
      name: 'Chaise au Mur Dynamique (Wall Sit)',
      category: 'bas',
      categoryLabel: 'Bas du Corps',
      muscles: 'Quadriceps, Gainage, Fléchisseurs de hanche',
      mode: 'timer',
      baseValue: 35,
      unit: 'sec',
      whyFor30s: 'Renforce puissamment les cuisses et stabilise les genoux tout en engageant les abdos.',
      coachingCues: [
        'Dos plaqué contre un mur, glissez jusqu’à avoir les genoux fléchis à environ 90 degrés.',
        'Maintenez la posture fixe (Débutant) ou décollez alternativement un pied après l’autre comme sur l’animation.',
        'Gardez le bas du dos collé au mur et respirez régulièrement.'
      ],
      progressions: {
        1: 'Chaise statique deux pieds au sol, cuisses légèrement au-dessus de 90°.',
        2: 'Chaise à 90° en décollant alternativement le talon ou le pied.',
        3: 'Marche complète au mur : montées de genoux alternées en restant assis.'
      }
    },
    {
      id: 'pushup-progression',
      name: 'Pompes au Poids du Corps',
      category: 'haut',
      categoryLabel: 'Haut du Corps',
      muscles: 'Pectoraux, Triceps, Épaules, Gainage',
      mode: 'reps',
      baseValue: 10,
      unit: 'rép',
      whyFor30s: 'L’exercice roi sans matériel pour redessiner les pectoraux, les épaules et l’arrière des bras.',
      coachingCues: [
        'En planche haute, mains légèrement plus larges que les épaules et corps gainé en ligne droite.',
        'Fléchissez les coudes pour descendre la poitrine près du sol sans creuser le bas du dos.',
        'Repoussez le sol jusqu’à tendre les bras en soufflant.'
      ],
      progressions: {
        1: 'Pompes sur les genoux ou mains surélevées sur un rebord stable.',
        2: 'Pompes classiques complètes au sol.',
        3: 'Pompes lentes (3 secondes à la descente, montée explosive).'
      }
    },
    {
      id: 'scapular-superman',
      name: 'Superman & Nageur Dorsal au Sol',
      category: 'haut',
      categoryLabel: 'Haut du Corps',
      muscles: 'Chaîne postérieure, Lombaires, Haut du dos, Fessiers',
      mode: 'reps',
      baseValue: 14,
      unit: 'rép',
      whyFor30s: 'Muscle toute la chaîne postérieure (dos et lombaires) directement au sol sans aucun équipement.',
      coachingCues: [
        'Allongé à plat ventre au sol, bras tendus devant vous et jambes tendues.',
        'Décollez légèrement la poitrine, les bras et les jambes en contractant le dos et les fessiers.',
        'Alternez de petits battements bras droit/jambe gauche et bras gauche/jambe droite comme un nageur.'
      ],
      progressions: {
        1: 'Élévations douces en reposant les bras et jambes au sol à chaque répétition.',
        2: 'Battements de nageur continus et contrôlés sans toucher le sol.',
        3: 'Maintien haut prolongé avec battements dynamiques.'
      }
    },
    {
      id: 'pike-shoulder-press',
      name: 'Planche Haute & Touches d’Épaules',
      category: 'haut',
      categoryLabel: 'Haut du Corps',
      muscles: 'Épaules, Pectoraux, Triceps, Gainage anti-rotation',
      mode: 'reps',
      baseValue: 14,
      unit: 'rép (total)',
      whyFor30s: 'Renforce la coiffe des rotateurs, les épaules et la sangle abdominale profonde en simultané.',
      coachingCues: [
        'En position de planche haute sur les mains, écartez légèrement les pieds pour stabiliser le bassin.',
        'Touchez votre épaule gauche avec la main droite, reposez, puis touchez l’épaule droite avec la main gauche.',
        'Empêchez vos hanches de se dandiner de gauche à droite en serrant fort les abdos.'
      ],
      progressions: {
        1: 'En appui sur les genoux ou pieds larges à rythme lent.',
        2: 'En planche haute complète, touches d’épaules fluides.',
        3: 'Maintien de 2 secondes sur un seul bras à chaque touche d’épaule.'
      }
    },
    {
      id: 'plank-core',
      name: 'Gainage Frontal & Rotation Obliques',
      category: 'core',
      categoryLabel: 'Sangle Abdominale',
      muscles: 'Abdominaux profonds, Obliques, Épaules',
      mode: 'timer',
      baseValue: 35,
      unit: 'sec',
      whyFor30s: 'Raffermit la taille (transverse et obliques) et protège la colonne bien mieux que les crunchs classiques.',
      coachingCues: [
        'En appui sur les avant-bras, corps aligné des épaules aux chevilles.',
        'Maintenez le gainage fixe ou ouvrez alternativement un bras vers le plafond en pivotant le buste.',
        'Gardez le ventre rentré et ne bloquez jamais votre respiration.'
      ],
      progressions: {
        1: 'Gainage frontal classique sur les avant-bras sans rotation.',
        2: 'Gainage sur les avant-bras avec rotation alternée du buste et du bras.',
        3: 'Rotation complète avec maintien de 2 secondes sur chaque côté.'
      }
    },
    {
      id: 'bird-dog',
      name: 'Dead Bug (Gainage Lombaire sur le Dos)',
      category: 'core',
      categoryLabel: 'Sangle Abdominale',
      muscles: 'Transverse profond, Grands droits, Psoas',
      mode: 'reps',
      baseValue: 12,
      unit: 'rép (total)',
      whyFor30s: 'L’exercice abdominal numéro 1 des kinés : zéro pression sur la nuque et le bas du dos plaqué au sol.',
      coachingCues: [
        'Allongé sur le dos, bras tendus vers le plafond et genoux relevés à 90 degrés.',
        'Plaquez fermement le bas du dos contre le sol en aspirant le nombril.',
        'Descendez lentement le bras droit derrière la tête et la jambe gauche vers le sol, remontez et alternez.'
      ],
      progressions: {
        1: 'Descendez uniquement une jambe après l’autre en gardant le genou fléchi.',
        2: 'Extension simultanée du bras et de la jambe opposée comme sur l’animation.',
        3: 'Extension lente (3 secondes) avec pause au ras du sol.'
      }
    },
    {
      id: 'step-jacks',
      name: 'Jumping Jacks (Cardio Complet)',
      category: 'cardio',
      categoryLabel: 'Cardio & Métabolisme',
      muscles: 'Système cardiovasculaire, Mollets, Épaules',
      mode: 'timer',
      baseValue: 45,
      unit: 'sec',
      whyFor30s: 'Relance la circulation sanguine, le souffle et la dépense calorique en quelques secondes.',
      coachingCues: [
        'Debout pieds joints et bras le long du corps.',
        'Écartez les pieds en sautant souplement (ou un pied après l’autre sans sauter) tout en levant les bras.',
        'Revenez en position initiale et gardez un rythme dynamique et régulier.'
      ],
      progressions: {
        1: 'Step-Jacks sans saut : écartez un pied après l’autre (zéro impact).',
        2: 'Jumping Jacks souples et réguliers sur la plante des pieds.',
        3: 'Jumping Jacks rapides à haute intensité.'
      }
    },
    {
      id: 'shadow-knees',
      name: 'Mountain Climbers (Cardio & Abdos)',
      category: 'cardio',
      categoryLabel: 'Cardio & Métabolisme',
      muscles: 'Abdominaux, Cardio, Épaules, Fléchisseurs',
      mode: 'timer',
      baseValue: 40,
      unit: 'sec',
      whyFor30s: 'Combine gainage abdominal et cardio intense pour brûler un maximum d’énergie sans courir.',
      coachingCues: [
        'En position de planche haute, mains bien à plat sous les épaules et dos droit.',
        'Ramenez un genou vers la poitrine puis alternez avec l’autre jambe comme si vous grimpiez.',
        'Gardez les hanches basses dans l’alignement des épaules et soufflez en rythme.'
      ],
      progressions: {
        1: 'Montées de genoux lentes et contrôlées en posant le pied sans sauter.',
        2: 'Mountain Climbers fluides et continus.',
        3: 'Rythme rapide et explosif en gardant le buste immobile.'
      }
    }
  ];

  /**
   * Se diseña un único programa estructurado de 7 sesiones distintas por semana (de lunes a domingo)
   * que alterna inteligentemente fuerza, movilidad postural, cardio y recuperación activa
   * para que el usuario solo tenga que seguir el día que toca sin tomar decisiones.
   */
  const WORKOUT_TEMPLATES = [
    {
      id: 'jour-1-fondations',
      title: 'Réveil Musculaire & Fondations',
      subtitle: 'Activation complète du corps : mobilité de la colonne, jambes, buste et gainage',
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
      title: 'Dos Solide & Déverrouillage Bureau',
      subtitle: 'Élimine les raideurs cervicales et lombaires accumulées assis et redresse les épaules',
      durationMin: 11,
      caloriesEst: 90,
      tag: 'Dos & Posture',
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
      title: 'Souffle, Cardio & Sangle Abdominale',
      subtitle: 'Relance le métabolisme et brûle les graisses tout en protégeant le bas du dos',
      durationMin: 15,
      caloriesEst: 165,
      tag: 'Cardio & Abdos',
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
      title: 'Haut du Corps & Carrure Athlétique',
      subtitle: 'Renforcement ciblé des pectoraux, des épaules, du haut du dos et des triceps',
      durationMin: 15,
      caloriesEst: 145,
      tag: 'Haut du Corps',
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
      title: 'Jambes Puissantes & Gainage Profond',
      subtitle: 'Stimule les grands groupes musculaires du bas du corps pour booster l’énergie',
      durationMin: 15,
      caloriesEst: 155,
      tag: 'Bas du Corps',
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
      title: 'Grand Circuit Athlétique 30+',
      subtitle: 'Combinaison dynamique force + cardio pour maximiser la dépense énergétique',
      durationMin: 16,
      caloriesEst: 175,
      tag: 'Circuit Complet',
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
      title: 'Mobilité Régénérante & Souplesse',
      subtitle: 'Séance douce de fin de cycle pour assouplir les hanches, la colonne et récupérer',
      durationMin: 10,
      caloriesEst: 75,
      tag: 'Récupération Active',
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

  /**
   * Se estructura un único plan progresivo de 28 días dividido en 4 semanas.
   * Cada día tiene su sesión asignada sin ambigüedad.
   */
  const PROGRAM_WEEKS = [
    {
      weekNumber: 1,
      title: 'Semaine 1 : Réveil Articulaire & Mise en Route',
      description: 'On réhabitue le corps à bouger chaque jour sans courbatures excessives.',
      days: [
        { day: 1, title: 'Jour 1 • Fondations & Réveil', templateId: 'jour-1-fondations', xpReward: 120 },
        { day: 2, title: 'Jour 2 • Dos & Posture Bureau', templateId: 'jour-2-posture-dos', xpReward: 100 },
        { day: 3, title: 'Jour 3 • Souffle & Abdos', templateId: 'jour-3-cardio-abdos', xpReward: 130 },
        { day: 4, title: 'Jour 4 • Haut du Corps & Épaules', templateId: 'jour-4-haut-carrure', xpReward: 130 },
        { day: 5, title: 'Jour 5 • Jambes & Fessiers', templateId: 'jour-5-jambes-tonus', xpReward: 135 },
        { day: 6, title: 'Jour 6 • Circuit Complet Week-end', templateId: 'jour-6-circuit-complet', xpReward: 145 },
        { day: 7, title: 'Jour 7 • Mobilité & Récupération', templateId: 'jour-7-recuperation', xpReward: 100 }
      ]
    },
    {
      weekNumber: 2,
      title: 'Semaine 2 : Endurance & Maintien Postural',
      description: 'Le souffle s’améliore et le gainage profond commence à protéger durablement le dos.',
      days: [
        { day: 8, title: 'Jour 8 • Full Body Niveau II', templateId: 'jour-1-fondations', xpReward: 135 },
        { day: 9, title: 'Jour 9 • Renforcement Dorsal', templateId: 'jour-2-posture-dos', xpReward: 115 },
        { day: 10, title: 'Jour 10 • Brûle-Graisse & Gainage', templateId: 'jour-3-cardio-abdos', xpReward: 145 },
        { day: 11, title: 'Jour 11 • Pectoraux & Carrure', templateId: 'jour-4-haut-carrure', xpReward: 145 },
        { day: 12, title: 'Jour 12 • Force Bas du Corps', templateId: 'jour-5-jambes-tonus', xpReward: 150 },
        { day: 13, title: 'Jour 13 • Circuit Métabolique II', templateId: 'jour-6-circuit-complet', xpReward: 160 },
        { day: 14, title: 'Jour 14 • Décompression Active', templateId: 'jour-7-recuperation', xpReward: 110 }
      ]
    },
    {
      weekNumber: 3,
      title: 'Semaine 3 : Densité Musculaire & Tonus',
      description: 'On augmente légèrement le temps sous tension pour dessiner la silhouette.',
      days: [
        { day: 15, title: 'Jour 15 • Full Body Athlétique', templateId: 'jour-1-fondations', xpReward: 155 },
        { day: 16, title: 'Jour 16 • Colonne & Omoplates Fortes', templateId: 'jour-2-posture-dos', xpReward: 125 },
        { day: 17, title: 'Jour 17 • Cardio & Sangle Profonde', templateId: 'jour-3-cardio-abdos', xpReward: 165 },
        { day: 18, title: 'Jour 18 • Force Haut du Corps', templateId: 'jour-4-haut-carrure', xpReward: 165 },
        { day: 19, title: 'Jour 19 • Cuisses & Gainage', templateId: 'jour-5-jambes-tonus', xpReward: 170 },
        { day: 20, title: 'Jour 20 • Grand Circuit Intensif', templateId: 'jour-6-circuit-complet', xpReward: 180 },
        { day: 21, title: 'Jour 21 • Souplesse & Psoas', templateId: 'jour-7-recuperation', xpReward: 120 }
      ]
    },
    {
      weekNumber: 4,
      title: 'Semaine 4 : Condition Physique & Autonomie',
      description: 'Dernière ligne droite pour valider vos 28 jours et ancrer votre nouvelle forme.',
      days: [
        { day: 22, title: 'Jour 22 • Full Body Performance', templateId: 'jour-1-fondations', xpReward: 180 },
        { day: 23, title: 'Jour 23 • Posture Blindée', templateId: 'jour-2-posture-dos', xpReward: 140 },
        { day: 24, title: 'Jour 24 • Cardio & Abdos Sculptés', templateId: 'jour-3-cardio-abdos', xpReward: 190 },
        { day: 25, title: 'Jour 25 • Défi Carrure Sans Matériel', templateId: 'jour-4-haut-carrure', xpReward: 195 },
        { day: 26, title: 'Jour 26 • Puissance Jambes & Core', templateId: 'jour-5-jambes-tonus', xpReward: 200 },
        { day: 27, title: 'Jour 27 • Mobilité Pré-Finale', templateId: 'jour-7-recuperation', xpReward: 140 },
        { day: 28, title: 'Jour 28 • Finale : Renaissance 30+', templateId: 'jour-6-circuit-complet', xpReward: 250 }
      ]
    }
  ];

  const DAILY_QUESTS = [];

  /**
   * Se crean insignias desbloqueables basadas en constancia y variedad para recompensar
   * el compromiso a corto y medio plazo.
   */
  const BADGES = [
    {
      id: 'first-step',
      title: 'Premier Déclic',
      description: 'Terminer votre toute première séance de remise en forme.',
      icon: 'zap',
      condition: (state) => state.totalWorkouts >= 1
    },
    {
      id: 'streak-3',
      title: 'Série de 3 Jours',
      description: 'Être actif 3 jours consécutifs : l’habitude commence à s’ancrer.',
      icon: 'flame',
      condition: (state) => state.bestStreak >= 3
    },
    {
      id: 'back-protector',
      title: 'Dos Blindé',
      description: 'Cumuler 3 séances ou bilans axés sur la mobilité et la posture.',
      icon: 'shield',
      condition: (state) => state.totalWorkouts >= 3
    },
    {
      id: 'week-warrior',
      title: 'Cap de la Semaine 1',
      description: 'Valider 7 séances du programme progressif 30+.',
      icon: 'trophy',
      condition: (state) => state.completedProgramDays.length >= 7
    },
    {
      id: 'xp-1000',
      title: 'Métabolisme Relancé',
      description: 'Dépasser les 1 000 XP d’activité cumulée.',
      icon: 'award',
      condition: (state) => state.xp >= 1000
    },
    {
      id: 'streak-7',
      title: 'Inarrêtable (7 Jours)',
      description: 'Maintenir une série de 7 jours d’activité consécutifs.',
      icon: 'sparkles',
      condition: (state) => state.bestStreak >= 7
    }
  ];

  return {
    ICONS,
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
