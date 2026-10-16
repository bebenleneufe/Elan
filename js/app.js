/**
 * Se simplifica la experiencia a un único programa lineal de 28 días: el usuario abre la app,
 * ve directamente el Día X que le toca hoy con su lista exacta de ejercicios en GIF y lo lanza
 * con un solo botón, sin menús redundantes ni múltiples programas paralelos.
 */
window.AppController = (function createAppController() {
  let currentView = 'dashboard';
  let selectedDayNumber = null;
  let currentExerciseFilter = 'all';

  function getLevelInfo(xp) {
    const level = Math.floor(xp / 250) + 1;
    const currentLevelXp = xp % 250;
    const progressPct = Math.min(100, Math.round((currentLevelXp / 250) * 100));
    const titles = [
      'Déclic Initial',
      'Corps en Éveil',
      'Posture Solide',
      'Régularité Forgée',
      'Dynamisme 30+',
      'Athlète du Quotidien',
      'Maître Poids du Corps'
    ];
    const title = titles[Math.min(titles.length - 1, level - 1)];
    return { level, title, currentLevelXp, nextLevelXp: 250, progressPct };
  }

  function findProgramDayInfo(dayNumber) {
    const weeks = window.AppData.PROGRAM_WEEKS;
    for (let w = 0; w < weeks.length; w += 1) {
      const found = weeks[w].days.find((d) => d.day === dayNumber);
      if (found) {
        return { week: weeks[w], dayObj: found };
      }
    }
    return { week: weeks[0], dayObj: weeks[0].days[0] };
  }

  function computePreviewValue(exercise, fitnessLevel, intensityMultiplier, programDay) {
    const levelFactor = fitnessLevel === 1 ? 0.85 : fitnessLevel === 2 ? 1.0 : 1.25;
    const weekIndex = Math.max(0, Math.min(3, Math.ceil((programDay || 1) / 7) - 1));
    const weekProgressionFactor = 1 + weekIndex * 0.08;
    const rawVal =
      exercise.baseValue * levelFactor * weekProgressionFactor * (intensityMultiplier || 1);

    return exercise.mode === 'timer'
      ? Math.max(20, Math.round(rawVal / 5) * 5)
      : Math.max(6, Math.round(rawVal));
  }

  function buildWeekStripHtml(state) {
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7;
    const activeDates = new Set(state.workoutHistory.map((h) => h.date));

    return dayNames
      .map((label, idx) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (currentDayOfWeek - idx));
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayNum = String(d.getDate()).padStart(2, '0');
        const iso = `${y}-${m}-${dayNum}`;

        const isToday = idx === currentDayOfWeek;
        const isDone = activeDates.has(iso);

        return `
          <div class="week-day-pill ${isToday ? 'is-today' : ''} ${isDone ? 'is-done' : ''}">
            <span class="week-day-name">${label}</span>
            <span class="week-day-circle">
              ${isDone ? window.AppData.ICONS.check : d.getDate()}
            </span>
          </div>
        `;
      })
      .join('');
  }

  function applyThemeAndAudioState(state) {
    document.documentElement.setAttribute('data-theme', state.theme || 'light');
    window.AudioFeedback.setMuted(Boolean(state.soundMuted));

    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML =
        state.theme === 'dark' ? window.AppData.ICONS.sun : window.AppData.ICONS.moon;
    }

    const soundBtn = document.getElementById('btn-sound-toggle');
    if (soundBtn) {
      soundBtn.innerHTML = state.soundMuted
        ? window.AppData.ICONS.volumeX
        : window.AppData.ICONS.volume2;
    }

    const streakEl = document.getElementById('header-streak-val');
    if (streakEl) {
      streakEl.textContent = `${state.streak} ${state.streak > 1 ? 'jours' : 'jour'}`;
    }
  }

  /**
   * Se muestra el único programa de 28 días directamente en la pantalla principal:
   * selector rápido de los días del programa arriba, sesión del Día X a la izquierda,
   * lista cronológica de ejercicios con GIFs a la derecha y progreso debajo.
   */
  function renderDashboardView(state) {
    const container = document.getElementById('view-dashboard');
    if (!container) return;

    const activeDayNum = selectedDayNumber || state.currentProgramDay || 1;
    const { week, dayObj } = findProgramDayInfo(activeDayNum);
    const template = window.AppData.getTemplateById(dayObj.templateId);
    const isDayCompleted = state.completedProgramDays.includes(dayObj.day);
    const isCurrentRecommendedDay = dayObj.day === state.currentProgramDay;
    const levelInfo = getLevelInfo(state.xp);
    const programPct = Math.round((state.completedProgramDays.length / 28) * 100);

    // Pestañas de las 4 semanas para navegar dentro de los 28 días si se desea
    const weekSelectorHtml = window.AppData.PROGRAM_WEEKS.map((w) => {
      const isSelectedWeek = w.weekNumber === week.weekNumber;
      return `
        <button
          type="button"
          class="prog-week-pill ${isSelectedWeek ? 'is-active' : ''}"
          data-action="select-program-day"
          data-day="${w.days[0].day}"
        >
          Semaine ${w.weekNumber}
        </button>
      `;
    }).join('');

    // Los 7 días de la semana seleccionada
    const weekDaysStepperHtml = week.days
      .map((d) => {
        const done = state.completedProgramDays.includes(d.day);
        const isSelected = d.day === dayObj.day;
        const isNextToDo = d.day === state.currentProgramDay;

        return `
          <button
            type="button"
            class="prog-day-step ${isSelected ? 'is-selected' : ''} ${done ? 'is-done' : ''} ${isNextToDo ? 'is-next' : ''}"
            data-action="select-program-day"
            data-day="${d.day}"
            title="${d.title}"
          >
            <span class="step-j-label">J${d.day}</span>
            <span class="step-j-dot">${done ? window.AppData.ICONS.check : d.day}</span>
          </button>
        `;
      })
      .join('');

    const exercisesVisualCardsHtml = template.exerciseIds
      .map((exId, index) => {
        const ex = window.AppData.getExerciseById(exId);
        const scaledVal = computePreviewValue(
          ex,
          state.fitnessLevel,
          state.intensityMultiplier,
          dayObj.day
        );

        return `
          <div class="circuit-row" data-action="open-exercise-modal" data-exercise-id="${ex.id}" role="button" tabindex="0">
            <div class="circuit-step-num">${index + 1}</div>
            <div class="circuit-gif-thumb">
              <img src="assets/gifs/${ex.id}.gif" alt="${ex.name}" loading="lazy" />
            </div>
            <div class="circuit-info">
              <strong>${ex.name}</strong>
              <span>${ex.categoryLabel} • ${ex.muscles.split(',')[0]}</span>
            </div>
            <div class="circuit-badge">
              <span>${scaledVal} ${ex.unit}</span>
            </div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="bento-dashboard">
        <!-- Bloque superior principal: El Día X del programa + Línea temporal de GIFs -->
        <section class="bento-hero-split">
          <div class="hero-dark-panel">
            <!-- Navegador lineal integrado de los 28 días del programa -->
            <div class="program-roadmap-bar">
              <div class="roadmap-weeks-row">
                <div class="roadmap-weeks-tabs" role="tablist" aria-label="Semaines du programme">
                  ${weekSelectorHtml}
                </div>
                ${
                  !isCurrentRecommendedDay
                    ? `<button type="button" class="btn-back-current" data-action="select-program-day" data-day="${state.currentProgramDay}">
                         Revenir au Jour ${state.currentProgramDay} →
                       </button>`
                    : `<span class="roadmap-week-tag">Volume +${(week.weekNumber - 1) * 8}%</span>`
                }
              </div>

              <div class="roadmap-days-row" role="group" aria-label="Jours de la semaine ${week.weekNumber}">
                ${weekDaysStepperHtml}
              </div>
            </div>

            <div class="hero-body-content">
              <div class="hero-eyebrow-row">
                <span class="hero-eyebrow-pill">JOUR ${dayObj.day} SUR 28 • ${template.tag.toUpperCase()}</span>
                ${
                  isDayCompleted
                    ? `<span class="hero-done-pill">${window.AppData.ICONS.check} Jour validé</span>`
                    : isCurrentRecommendedDay
                    ? `<span class="hero-next-pill">À faire aujourd’hui</span>`
                    : ''
                }
              </div>

              <h1 class="hero-display-title">${template.title}</h1>
              <p class="hero-display-desc">${template.subtitle}</p>

              <div class="hero-glass-stats">
                <div class="glass-stat">
                  <span class="glass-stat-icon">${window.AppData.ICONS.clock}</span>
                  <div>
                    <strong>${template.durationMin} min</strong>
                    <span>Sans précipitation</span>
                  </div>
                </div>
                <div class="glass-stat">
                  <span class="glass-stat-icon">${window.AppData.ICONS.dumbbell}</span>
                  <div>
                    <strong>${template.exerciseIds.length} mouvements</strong>
                    <span>Zéro matériel</span>
                  </div>
                </div>
                <div class="glass-stat">
                  <span class="glass-stat-icon">${window.AppData.ICONS.flame}</span>
                  <div>
                    <strong>~${template.caloriesEst} kcal</strong>
                    <span>+${dayObj.xpReward} XP</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="hero-footer-actions">
              <div class="hero-level-bar">
                <span class="hero-level-label">Niveau d’adaptation :</span>
                <div class="hero-level-segmented">
                  <button type="button" class="seg-btn ${state.fitnessLevel === 1 ? 'is-active' : ''}" data-action="set-level" data-level="1">
                    Débutant
                  </button>
                  <button type="button" class="seg-btn ${state.fitnessLevel === 2 ? 'is-active' : ''}" data-action="set-level" data-level="2">
                    Intermédiaire
                  </button>
                  <button type="button" class="seg-btn ${state.fitnessLevel === 3 ? 'is-active' : ''}" data-action="set-level" data-level="3">
                    Avancé
                  </button>
                </div>
              </div>

              <button
                type="button"
                class="btn-hero-launch"
                data-action="start-workout"
                data-template-id="${template.id}"
                data-program-day="${dayObj.day}"
                data-xp-reward="${dayObj.xpReward}"
              >
                <span class="launch-play-circle">${window.AppData.ICONS.play}</span>
                <span class="launch-texts">
                  <strong>${isDayCompleted ? `Refaire le Jour ${dayObj.day}` : `Lancer le Jour ${dayObj.day} maintenant`}</strong>
                  <small>Chaque exercice démarre en pause d’observation avec son GIF</small>
                </span>
              </button>
            </div>
          </div>

          <div class="hero-circuit-panel">
            <div class="circuit-panel-header">
              <div>
                <h2>Séance du Jour ${dayObj.day}</h2>
                <p>Cliquez sur un exercice pour voir les détails de posture</p>
              </div>
              <span class="circuit-count-badge">${template.exerciseIds.length} exercices</span>
            </div>

            <div class="circuit-timeline-list">
              ${exercisesVisualCardsHtml}
            </div>
          </div>
        </section>

        <!-- Bloque inferior panorámico: Avance de los 28 días y constancia semanal -->
        <article class="bento-card bento-wide-progress">
          <div class="bento-card-header">
            <div>
              <span class="bento-kicker">SUIVI DU PROGRAMME 28 JOURS</span>
              <h2 class="bento-title">${week.title}</h2>
            </div>
            <span class="level-pill-badge">Niv. ${levelInfo.level} • ${levelInfo.title}</span>
          </div>

          <div class="bento-wide-body">
            <div class="week-strip-grid">
              ${buildWeekStripHtml(state)}
            </div>

            <div class="bento-wide-metrics">
              <div class="bento-mini-kpis">
                <div class="mini-kpi">
                  <strong>${state.completedProgramDays.length} / 28</strong>
                  <span>Jours validés</span>
                </div>
                <div class="mini-kpi">
                  <strong>${state.streak} j</strong>
                  <span>Série en cours</span>
                </div>
                <div class="mini-kpi">
                  <strong>${state.totalWorkouts}</strong>
                  <span>Séances finies</span>
                </div>
                <div class="mini-kpi">
                  <strong>${state.totalMinutes} min</strong>
                  <span>Cumulées</span>
                </div>
              </div>

              <div class="xp-bar-container">
                <div class="xp-bar-labels">
                  <span>Avancement total du Programme 28 Jours</span>
                  <strong>${state.completedProgramDays.length} sur 28 jours (${programPct}%)</strong>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" style="--progress-pct: ${programPct}%"></div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    `;
  }

  function renderExercisesView() {
    const container = document.getElementById('view-exercises');
    if (!container) return;

    const categories = [
      { id: 'all', label: 'Tous (14)' },
      { id: 'mobilite', label: 'Dos & Mobilité (3)' },
      { id: 'bas', label: 'Jambes & Fessiers (4)' },
      { id: 'haut', label: 'Haut du Corps (3)' },
      { id: 'core', label: 'Abdos & Gainage (2)' },
      { id: 'cardio', label: 'Cardio (2)' }
    ];

    const filterBtnsHtml = categories
      .map(
        (cat) => `
        <button
          type="button"
          class="filter-tab ${currentExerciseFilter === cat.id ? 'is-active' : ''}"
          data-action="filter-exercises"
          data-category="${cat.id}"
        >
          ${cat.label}
        </button>
      `
      )
      .join('');

    const filteredExercises =
      currentExerciseFilter === 'all'
        ? window.AppData.EXERCISES
        : window.AppData.EXERCISES.filter((ex) => ex.category === currentExerciseFilter);

    const cardsHtml = filteredExercises
      .map((ex) => {
        return `
        <article class="exercise-card" data-action="open-exercise-modal" data-exercise-id="${ex.id}" role="button" tabindex="0">
          <div class="exercise-visual-box">
            ${window.AppData.getExerciseIllustration(ex.id)}
            <span class="exercise-cat-tag">${ex.categoryLabel}</span>
          </div>
          <div class="exercise-card-body">
            <h3 class="exercise-card-title">${ex.name}</h3>
            <p class="exercise-muscles">${ex.muscles}</p>
            <p class="exercise-why-short">${ex.whyFor30s}</p>
            <div class="exercise-card-footer">
              <span class="exercise-target-pill">${ex.baseValue} ${ex.unit}</span>
              <span class="exercise-link-text">Détails &amp; 3 niveaux →</span>
            </div>
          </div>
        </article>
      `;
      })
      .join('');

    container.innerHTML = `
      <div class="catalogue-container">
        <div class="clean-page-header">
          <div>
            <span class="bento-kicker">BIBLIOTHÈQUE BIOMÉCANIQUE</span>
            <h1 class="page-title">Les 14 Mouvements du Programme</h1>
            <p class="section-subtitle">Chaque exercice est démontré en GIF animé avec les muscles ciblés en rouge.</p>
          </div>
        </div>

        <div class="filter-tabs-bar" role="tablist">
          ${filterBtnsHtml}
        </div>

        <div class="exercises-grid">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  function renderWorkoutOverlay(session) {
    const overlay = document.getElementById('workout-player-overlay');
    if (!overlay) return;

    if (!session) {
      overlay.classList.add('is-hidden');
      overlay.setAttribute('aria-hidden', 'true');
      return;
    }

    overlay.classList.remove('is-hidden');
    overlay.setAttribute('aria-hidden', 'false');

    if (session.status === 'completed') {
      const actualMin =
        Math.max(1, Math.round(session.totalElapsedSeconds / 60)) ||
        session.template.durationMin;
      overlay.innerHTML = `
        <div class="player-modal player-victory">
          <div class="victory-icon-badge">${window.AppData.ICONS.trophy}</div>
          <h2 class="victory-title">Jour ${session.programDay || ''} terminé, bravo !</h2>
          <p class="victory-subtitle">${actualMin} min d’activité • ~${session.template.caloriesEst} kcal brûlées • +${session.xpReward} XP</p>

          <div class="rpe-feedback-box">
            <h3 class="rpe-title">Comment avez-vous trouvé ce Jour ${session.programDay || ''} ?</h3>
            <p class="rpe-desc">Votre ressenti adapte automatiquement le volume du prochain jour :</p>
            <div class="rpe-buttons">
              <button type="button" class="btn btn-secondary" data-action="finish-workout" data-rpe="easy">
                Facile (+8% au prochain jour)
              </button>
              <button type="button" class="btn btn-primary" data-action="finish-workout" data-rpe="optimal">
                ${window.AppData.ICONS.check}
                <span>Idéal • Valider et passer au jour suivant</span>
              </button>
              <button type="button" class="btn btn-secondary" data-action="finish-workout" data-rpe="hard">
                Intense (-8% au prochain jour)
              </button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const currentStep = session.steps[session.currentStepIndex];
    const sessionPct = Math.round(((session.currentStepIndex + 1) / session.steps.length) * 100);

    const workStepsHtml = session.steps
      .map((s, idx) => {
        if (s.stepType !== 'work') return '';
        const isCurrent = s.exerciseIndex === currentStep.exerciseIndex && currentStep.stepType === 'work';
        const isPast = idx < session.currentStepIndex;
        return `
          <button
            type="button"
            class="step-dot-btn ${isCurrent ? 'is-current' : ''} ${isPast ? 'is-past' : ''}"
            data-action="jump-step"
            data-step-index="${idx}"
            title="Aller à l'exercice ${s.exerciseIndex} : ${s.exercise.name}"
          >
            ${s.exerciseIndex}
          </button>
        `;
      })
      .join('');

    if (currentStep.stepType === 'rest') {
      const nextEx = currentStep.nextExercise;
      overlay.innerHTML = `
        <div class="player-modal player-studio">
          <div class="player-session-progress" aria-hidden="true">
            <div class="player-session-fill" style="--progress-pct: ${sessionPct}%"></div>
          </div>

          <div class="player-topbar">
            <div class="player-top-left">
              <span class="player-step-counter">JOUR ${session.programDay} • RÉCUPÉRATION</span>
              <div class="step-dots-bar">${workStepsHtml}</div>
            </div>
            <button type="button" class="btn btn-ghost btn-sm" data-action="abort-workout">
              ${window.AppData.ICONS.close}
              <span>Quitter</span>
            </button>
          </div>

          <div class="rest-split-grid">
            <div class="rest-timer-panel">
              <span class="rest-badge">Soufflez profondément &amp; relâchez les épaules</span>
              <div class="timer-display-giant">${currentStep.remainingSeconds}<span>s</span></div>
              <p class="counter-sublabel">L’exercice suivant s’ouvrira en pause pour vous laisser le temps de vous placer.</p>
              <div class="rest-controls">
                <button type="button" class="btn btn-secondary" data-action="add-rest-time">
                  +15 sec de repos
                </button>
                <button type="button" class="btn btn-primary" data-action="skip-step">
                  Voir l’exercice suivant →
                </button>
              </div>
            </div>

            <div class="rest-next-card">
              <span class="next-label">PROCHAIN MOUVEMENT (${currentStep.exerciseIndex + 1}/${currentStep.totalExercises}) :</span>
              <h3>${nextEx.name}</h3>
              <div class="rest-next-gif">
                <img src="assets/gifs/${nextEx.id}.gif" alt="${nextEx.name}" />
              </div>
              <p>${nextEx.coachingCues[0]}</p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const ex = currentStep.exercise;
    const isTimer = ex.mode === 'timer';
    const variantText = ex.progressions[currentStep.selectedVariantLevel] || ex.progressions[1];
    const cuesHtml = ex.coachingCues
      .map((c, i) => `<li><span class="cue-num">${i + 1}</span><span>${c}</span></li>`)
      .join('');
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercice poids du corps tutoriel')}`;

    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const ratio = isTimer
      ? Math.max(0, currentStep.remainingSeconds / Math.max(1, currentStep.targetValue))
      : 1;
    const dashOffset = circumference * (1 - ratio);

    let rightControlPanelHtml = '';

    if (currentStep.phase === 'countdown') {
      rightControlPanelHtml = `
        <div class="studio-action-panel is-prep-countdown">
          <span class="phase-status-pill pill-countdown">Mettez-vous en position !</span>
          <div class="action-ring-row">
            <div class="ring-timer-wrap">
              <div class="countdown-big-number">${currentStep.prepSeconds}</div>
              <span class="ring-unit-label">Départ imminent…</span>
            </div>
            <p class="phase-helper-text">Placez-vous tranquillement, le chronomètre démarre dans ${currentStep.prepSeconds}s.</p>
          </div>
        </div>
      `;
    } else if (isTimer && currentStep.phase === 'ready') {
      rightControlPanelHtml = `
        <div class="studio-action-panel is-ready-phase">
          <span class="phase-status-pill pill-ready">Étape 1 : Observation &amp; Mise en place</span>
          <div class="action-ring-row">
            <div class="ring-timer-wrap">
              <svg class="timer-ring-svg" viewBox="0 0 190 190">
                <circle class="ring-bg" cx="95" cy="95" r="${radius}" />
                <circle class="ring-fg" cx="95" cy="95" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="0" />
              </svg>
              <div class="ring-center-content">
                <div class="timer-display-giant">${currentStep.targetValue}<span>s</span></div>
                <span class="ring-unit-label">En attente</span>
              </div>
            </div>

            <p class="phase-helper-text">
              Regardez le GIF animé et placez-vous. Le décompte ne démarre que lorsque vous appuyez ci-dessous :
            </p>
          </div>

          <div class="action-cta-dock">
            <button type="button" class="btn-start-giant" data-action="begin-exercise-timer">
              ${window.AppData.ICONS.play}
              <span>Je suis en position • Lancer (${currentStep.targetValue}s)</span>
            </button>

            <button type="button" class="btn btn-ghost btn-sm" data-action="skip-step">
              Passer directement cet exercice →
            </button>
          </div>
        </div>
      `;
    } else if (isTimer) {
      rightControlPanelHtml = `
        <div class="studio-action-panel is-active-phase">
          <span class="phase-status-pill ${currentStep.phase === 'paused' ? 'pill-ready' : 'pill-active'}">
            ${currentStep.phase === 'paused' ? 'Chronomètre en pause' : 'Étape 2 : En action • Respirez'}
          </span>

          <div class="action-ring-row">
            <div class="ring-timer-wrap">
              <svg class="timer-ring-svg" viewBox="0 0 190 190">
                <circle class="ring-bg" cx="95" cy="95" r="${radius}" />
                <circle class="ring-fg" cx="95" cy="95" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" />
              </svg>
              <div class="ring-center-content">
                <div class="timer-display-giant">${currentStep.remainingSeconds}<span>s</span></div>
                <span class="ring-unit-label">restantes</span>
              </div>
            </div>

            <div class="live-timer-buttons">
              <button type="button" class="btn btn-secondary" data-action="toggle-pause">
                ${currentStep.phase === 'paused' ? window.AppData.ICONS.play : window.AppData.ICONS.pause}
                <span>${currentStep.phase === 'paused' ? 'Reprendre' : 'Pause'}</span>
              </button>
              <button type="button" class="btn btn-secondary" data-action="add-rest-time">
                +15s
              </button>
              <button type="button" class="btn btn-ghost" data-action="restart-exercise-timer" title="Remettre le chrono à zéro">
                ${window.AppData.ICONS.rotateCcw}
              </button>
            </div>
          </div>

          <div class="action-cta-dock">
            <button type="button" class="btn-start-giant" data-action="skip-step">
              ${window.AppData.ICONS.check}
              <span>Terminer cet exercice • Suivant →</span>
            </button>
          </div>
        </div>
      `;
    } else {
      rightControlPanelHtml = `
        <div class="studio-action-panel is-reps-phase">
          <span class="phase-status-pill pill-ready">À votre rythme • Sans chronomètre</span>

          <div class="action-ring-row">
            <div class="ring-timer-wrap">
              <svg class="timer-ring-svg" viewBox="0 0 190 190">
                <circle class="ring-bg" cx="95" cy="95" r="${radius}" />
                <circle class="ring-fg" cx="95" cy="95" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="0" />
              </svg>
              <div class="ring-center-content">
                <div class="timer-display-giant">${currentStep.targetValue}</div>
                <span class="ring-unit-label">${ex.unit}</span>
              </div>
            </div>

            <p class="phase-helper-text">
              Observez le GIF, mettez-vous en place et réalisez vos <strong>${currentStep.targetValue} ${ex.unit}</strong> proprement à votre rythme.
            </p>
          </div>

          <div class="action-cta-dock">
            <button type="button" class="btn-start-giant" data-action="skip-step">
              ${window.AppData.ICONS.check}
              <span>J’ai terminé mes ${currentStep.targetValue} ${ex.unit} • Suivant →</span>
            </button>
          </div>
        </div>
      `;
    }

    overlay.innerHTML = `
      <div class="player-modal player-studio">
        <div class="player-session-progress" aria-hidden="true">
          <div class="player-session-fill" style="--progress-pct: ${sessionPct}%"></div>
        </div>

        <div class="player-topbar">
          <div class="player-top-left">
            <span class="player-step-counter">JOUR ${session.programDay} • EXO ${currentStep.exerciseIndex}/${currentStep.totalExercises}</span>
            <div class="step-dots-bar" aria-label="Navigation entre les exercices">
              ${workStepsHtml}
            </div>
          </div>
          <div class="player-top-actions">
            ${
              currentStep.exerciseIndex > 1
                ? `<button type="button" class="btn btn-ghost btn-sm" data-action="prev-step">← Préc.</button>`
                : ''
            }
            <button type="button" class="btn btn-ghost btn-sm" data-action="abort-workout">
              ${window.AppData.ICONS.close}
              <span>Quitter</span>
            </button>
          </div>
        </div>

        <div class="studio-main-grid">
          <div class="studio-visual-column">
            <div class="studio-title-block">
              <span class="mode-badge">${ex.categoryLabel} • ${ex.muscles}</span>
              <h2 class="player-ex-title">${ex.name}</h2>
            </div>

            <div class="player-gif-stage">
              <img class="player-gif-main" src="assets/gifs/${ex.id}.gif" alt="Animation ${ex.name}" />
              <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="gif-yt-pill">
                ${window.AppData.ICONS.play}
                <span>Tutoriel YouTube</span>
              </a>
            </div>

            <div class="studio-variant-box">
              <div class="variant-pills-row">
                <button type="button" class="level-chip ${currentStep.selectedVariantLevel === 1 ? 'is-active' : ''}" data-action="set-step-variant" data-variant="1">Débutant</button>
                <button type="button" class="level-chip ${currentStep.selectedVariantLevel === 2 ? 'is-active' : ''}" data-action="set-step-variant" data-variant="2">Intermédiaire</button>
                <button type="button" class="level-chip ${currentStep.selectedVariantLevel === 3 ? 'is-active' : ''}" data-action="set-step-variant" data-variant="3">Avancé</button>
              </div>
              <p class="variant-selected-text">${variantText}</p>
            </div>

            <ul class="studio-cues-list">
              ${cuesHtml}
            </ul>
          </div>

          ${rightControlPanelHtml}
        </div>
      </div>
    `;
  }

  function openExerciseDetailModal(exerciseId) {
    const modal = document.getElementById('exercise-detail-modal');
    if (!modal) return;
    const ex = window.AppData.getExerciseById(exerciseId);
    const cuesHtml = ex.coachingCues
      .map((c, i) => `<li><span class="cue-num">${i + 1}</span><span>${c}</span></li>`)
      .join('');
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercice musculation sans matériel')}`;

    modal.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-ex-title">
        <div class="sheet-drag-handle" aria-hidden="true"></div>
        <div class="modal-header">
          <div>
            <span class="mode-badge">${ex.categoryLabel} • ${ex.muscles}</span>
            <h2 id="modal-ex-title" class="modal-title">${ex.name}</h2>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" data-action="close-exercise-modal" aria-label="Fermer">
            ${window.AppData.ICONS.close}
          </button>
        </div>
        <div class="modal-body">
          <div class="player-gif-stage">
            <img class="player-gif-main" src="assets/gifs/${ex.id}.gif" alt="Animation ${ex.name}" />
          </div>
          <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-full">
            ${window.AppData.ICONS.play}
            <span>Regarder le tutoriel vidéo (YouTube)</span>
          </a>
          <p class="modal-why"><strong>Pourquoi cet exercice à 30 ans :</strong> ${ex.whyFor30s}</p>
          <h4>Posture &amp; exécution étape par étape :</h4>
          <ul class="studio-cues-list">
            ${cuesHtml}
          </ul>
          <h4>Les 3 niveaux d’adaptation :</h4>
          <div class="modal-progressions">
            <div class="prog-item"><strong>Débutant :</strong> ${ex.progressions[1]}</div>
            <div class="prog-item"><strong>Intermédiaire :</strong> ${ex.progressions[2]}</div>
            <div class="prog-item"><strong>Avancé :</strong> ${ex.progressions[3]}</div>
          </div>
        </div>
      </div>
    `;
    modal.classList.remove('is-hidden');
  }

  function showToast(message) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.innerHTML = `${window.AppData.ICONS.checkCircle} <span>${message}</span>`;
    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3000);
  }

  function renderAll() {
    const state = window.AppStorage.getState();
    applyThemeAndAudioState(state);

    document.querySelectorAll('.nav-btn').forEach((btn) => {
      const target = btn.getAttribute('data-view');
      btn.classList.toggle('is-active', target === currentView);
      btn.setAttribute('aria-current', target === currentView ? 'page' : 'false');
    });

    document.querySelectorAll('.app-view').forEach((section) => {
      section.classList.toggle('is-hidden', section.id !== `view-${currentView}`);
    });

    if (currentView === 'dashboard') renderDashboardView(state);
    if (currentView === 'exercises') renderExercisesView(state);
  }

  function bindEvents() {
    document.addEventListener('click', (event) => {
      // Cerrar modal de detalle al tocar el fondo oscuro en móvil
      if (event.target.id === 'exercise-detail-modal') {
        event.target.classList.add('is-hidden');
        return;
      }

      const navBtn = event.target.closest('[data-view]');
      if (navBtn) {
        window.AudioFeedback.playTap();
        currentView = navBtn.getAttribute('data-view');
        renderAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const actionBtn = event.target.closest('[data-action]');
      if (!actionBtn) return;

      const action = actionBtn.getAttribute('data-action');

      if (action === 'select-program-day') {
        window.AudioFeedback.playTap();
        selectedDayNumber = Number(actionBtn.getAttribute('data-day')) || 1;
        renderDashboardView(window.AppStorage.getState());
      } else if (action === 'set-level') {
        window.AudioFeedback.playTap();
        const fitnessLevel = Number(actionBtn.getAttribute('data-level'));
        window.AppStorage.updatePreferences({ fitnessLevel });
        renderAll();
        showToast('Niveau d’adaptation ajusté');
      } else if (action === 'start-workout') {
        const templateId = actionBtn.getAttribute('data-template-id');
        const programDay = Number(actionBtn.getAttribute('data-program-day')) || 1;
        const xpReward = Number(actionBtn.getAttribute('data-xp-reward')) || 120;
        window.WorkoutEngine.startWorkout(templateId, { programDay, xpReward });
      } else if (action === 'begin-exercise-timer') {
        window.WorkoutEngine.beginCurrentExerciseTimer();
      } else if (action === 'restart-exercise-timer') {
        window.AudioFeedback.playTap();
        window.WorkoutEngine.restartCurrentExerciseTimer();
      } else if (action === 'prev-step') {
        window.AudioFeedback.playTap();
        window.WorkoutEngine.stepPrevExercise();
      } else if (action === 'jump-step') {
        window.AudioFeedback.playTap();
        const stepIdx = Number(actionBtn.getAttribute('data-step-index'));
        window.WorkoutEngine.JumpToExerciseIndex(stepIdx);
      } else if (action === 'set-step-variant') {
        window.AudioFeedback.playTap();
        const variant = Number(actionBtn.getAttribute('data-variant'));
        window.WorkoutEngine.setCurrentStepVariant(variant);
      } else if (action === 'toggle-pause') {
        window.AudioFeedback.playTap();
        window.WorkoutEngine.togglePause();
      } else if (action === 'skip-step') {
        window.WorkoutEngine.completeCurrentStep();
      } else if (action === 'add-rest-time') {
        window.AudioFeedback.playTap();
        window.WorkoutEngine.addRestSeconds(15);
      } else if (action === 'abort-workout') {
        window.WorkoutEngine.abortWorkout();
        renderWorkoutOverlay(null);
      } else if (action === 'finish-workout') {
        const rpe = actionBtn.getAttribute('data-rpe');
        const session = window.WorkoutEngine.getActiveSession();
        if (session) {
          const updatedState = window.AppStorage.recordCompletedWorkout({
            title: session.template.title,
            durationMin: session.template.durationMin,
            caloriesEst: session.template.caloriesEst,
            xpEarned: session.xpReward,
            programDay: session.programDay,
            rpe
          });
          // Se posiciona automáticamente el selector en el siguiente día pendiente del programa
          selectedDayNumber = updatedState.currentProgramDay;
          window.WorkoutEngine.abortWorkout();
          renderWorkoutOverlay(null);
          renderAll();
          showToast(`Jour ${session.programDay} validé ! Cap sur le Jour ${updatedState.currentProgramDay} !`);
        }
      } else if (action === 'filter-exercises') {
        currentExerciseFilter = actionBtn.getAttribute('data-category');
        renderExercisesView(window.AppStorage.getState());
      } else if (action === 'open-exercise-modal') {
        const exId = actionBtn.getAttribute('data-exercise-id');
        openExerciseDetailModal(exId);
      } else if (action === 'close-exercise-modal') {
        const modal = document.getElementById('exercise-detail-modal');
        if (modal) modal.classList.add('is-hidden');
      }
    });

    const themeToggle = document.getElementById('btn-theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const current = window.AppStorage.getState();
        const nextTheme = current.theme === 'dark' ? 'light' : 'dark';
        window.AppStorage.updatePreferences({ theme: nextTheme });
        renderAll();
      });
    }

    const soundToggle = document.getElementById('btn-sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        const current = window.AppStorage.getState();
        const nextMuted = !current.soundMuted;
        window.AppStorage.updatePreferences({ soundMuted: nextMuted });
        renderAll();
      });
    }
  }

  return {
    init() {
      const state = window.AppStorage.getState();
      selectedDayNumber = state.currentProgramDay || 1;
      window.WorkoutEngine.subscribe((session) => {
        renderWorkoutOverlay(session);
      });
      bindEvents();
      renderAll();
    }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  window.AppController.init();
});
