/**
 * Se prioriza la iconografía vectorial y los indicadores visuales directos por encima del texto
 * extenso para que toda la interfaz se lea de un vistazo en móvil.
 */
window.AppController = (function createAppController() {
  let currentView = 'dashboard';
  let selectedDayNumber = null;
  let currentExerciseFilter = 'all';
  let lastOverlayKey = null;

  const RING_RADIUS = 80;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

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
    const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
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
      streakEl.textContent = String(state.streak);
    }
  }

  function renderDashboardView(state) {
    const container = document.getElementById('view-dashboard');
    if (!container) return;

    const ICONS = window.AppData.ICONS;
    const CAT_ICONS = window.AppData.CATEGORY_ICONS;
    const activeDayNum = selectedDayNumber || state.currentProgramDay || 1;
    const { week, dayObj } = findProgramDayInfo(activeDayNum);
    const template = window.AppData.getTemplateById(dayObj.templateId);
    const isDayCompleted = state.completedProgramDays.includes(dayObj.day);
    const isCurrentRecommendedDay = dayObj.day === state.currentProgramDay;
    const programPct = Math.round((state.completedProgramDays.length / 28) * 100);

    const weekSelectorHtml = window.AppData.PROGRAM_WEEKS.map((w) => {
      const isSelectedWeek = w.weekNumber === week.weekNumber;
      return `
        <button
          type="button"
          class="prog-week-pill ${isSelectedWeek ? 'is-active' : ''}"
          data-action="select-program-day"
          data-day="${w.days[0].day}"
        >
          S${w.weekNumber}
        </button>
      `;
    }).join('');

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
            <span class="step-j-dot">${done ? ICONS.check : d.day}</span>
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
        const modeIcon = ex.mode === 'timer' ? ICONS.clock : ICONS.repeat;
        const catIcon = CAT_ICONS[ex.category] || ICONS.activity;

        return `
          <div class="circuit-row" data-action="open-exercise-modal" data-exercise-id="${ex.id}" role="button" tabindex="0">
            <div class="circuit-step-num">${index + 1}</div>
            <div class="circuit-gif-thumb">
              <img src="assets/gifs/${ex.id}.gif" alt="${ex.name}" loading="lazy" />
            </div>
            <div class="circuit-info">
              <strong>${ex.name}</strong>
              <span class="circuit-meta-icon">${catIcon} ${ex.muscles}</span>
            </div>
            <div class="circuit-badge">
              ${modeIcon}
              <span>${scaledVal}${ex.unit}</span>
            </div>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="bento-dashboard">
        <section class="bento-hero-split">
          <div class="hero-dark-panel">
            <div class="program-roadmap-bar">
              <div class="roadmap-weeks-row">
                <div class="roadmap-weeks-tabs" role="tablist" aria-label="Semaines">
                  ${weekSelectorHtml}
                </div>
                ${
                  !isCurrentRecommendedDay
                    ? `<button type="button" class="btn-back-current" data-action="select-program-day" data-day="${state.currentProgramDay}">
                         ${ICONS.rotateCcw}
                         <span>J${state.currentProgramDay}</span>
                       </button>`
                    : `<span class="roadmap-week-tag">${ICONS.trendingUp} +${(week.weekNumber - 1) * 8}%</span>`
                }
              </div>

              <div class="roadmap-days-row" role="group" aria-label="Jours">
                ${weekDaysStepperHtml}
              </div>
            </div>

            <div class="hero-body-content">
              <div class="hero-eyebrow-row">
                <span class="hero-eyebrow-pill">J${dayObj.day}/28 • ${template.tag}</span>
                ${
                  isDayCompleted
                    ? `<span class="hero-done-pill" title="Validé">${ICONS.check}</span>`
                    : isCurrentRecommendedDay
                    ? `<span class="hero-next-pill">${ICONS.zap} Aujourd’hui</span>`
                    : ''
                }
              </div>

              <h1 class="hero-display-title">${template.title}</h1>

              <div class="hero-glass-stats">
                <div class="glass-stat" title="Durée">
                  <span class="glass-stat-icon">${ICONS.clock}</span>
                  <strong>${template.durationMin} min</strong>
                </div>
                <div class="glass-stat" title="Exercices">
                  <span class="glass-stat-icon">${ICONS.dumbbell}</span>
                  <strong>${template.exerciseIds.length} exos</strong>
                </div>
                <div class="glass-stat" title="Calories">
                  <span class="glass-stat-icon">${ICONS.flame}</span>
                  <strong>${template.caloriesEst} kcal</strong>
                </div>
              </div>
            </div>

            <div class="hero-footer-actions">
              <div class="hero-level-bar">
                <span class="hero-level-icon" title="Intensité">${ICONS.sliders}</span>
                <div class="hero-level-segmented">
                  <button type="button" class="seg-btn ${state.fitnessLevel === 1 ? 'is-active' : ''}" data-action="set-level" data-level="1">
                    Niv. 1
                  </button>
                  <button type="button" class="seg-btn ${state.fitnessLevel === 2 ? 'is-active' : ''}" data-action="set-level" data-level="2">
                    Niv. 2
                  </button>
                  <button type="button" class="seg-btn ${state.fitnessLevel === 3 ? 'is-active' : ''}" data-action="set-level" data-level="3">
                    Niv. 3
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
                <span class="launch-play-circle">${ICONS.play}</span>
                <span class="launch-texts">
                  <strong>${isDayCompleted ? `Refaire • J${dayObj.day}` : `Démarrer • J${dayObj.day}`}</strong>
                </span>
              </button>
            </div>
          </div>

          <div class="hero-circuit-panel">
            <div class="circuit-panel-header">
              <div class="circuit-header-title">
                ${ICONS.dumbbell}
                <h2>Jour ${dayObj.day}</h2>
              </div>
              <span class="circuit-count-badge">${template.exerciseIds.length}</span>
            </div>

            <div class="circuit-timeline-list">
              ${exercisesVisualCardsHtml}
            </div>
          </div>
        </section>

        <article class="bento-card bento-wide-progress">
          <div class="bento-wide-body">
            <div class="week-strip-grid">
              ${buildWeekStripHtml(state)}
            </div>

            <div class="bento-wide-metrics">
              <div class="bento-mini-kpis">
                <div class="mini-kpi" title="Jours validés">
                  <span class="kpi-icon">${ICONS.checkCircle}</span>
                  <strong>${state.completedProgramDays.length}/28</strong>
                </div>
                <div class="mini-kpi" title="Série active">
                  <span class="kpi-icon">${ICONS.flame}</span>
                  <strong>${state.streak}j</strong>
                </div>
                <div class="mini-kpi" title="Séances terminées">
                  <span class="kpi-icon">${ICONS.trophy}</span>
                  <strong>${state.totalWorkouts}</strong>
                </div>
                <div class="mini-kpi" title="Minutes cumulées">
                  <span class="kpi-icon">${ICONS.clock}</span>
                  <strong>${state.totalMinutes}m</strong>
                </div>
              </div>

              <div class="xp-bar-container">
                <div class="xp-bar-labels">
                  <span class="xp-label-icon">${ICONS.award} 28 Jours</span>
                  <strong>${programPct}%</strong>
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

    const ICONS = window.AppData.ICONS;
    const CAT_ICONS = window.AppData.CATEGORY_ICONS;

    const categories = [
      { id: 'all', label: '14', icon: ICONS.grid },
      { id: 'mobilite', label: 'Mobilité', icon: ICONS.wind },
      { id: 'bas', label: 'Jambes', icon: ICONS.zap },
      { id: 'haut', label: 'Haut', icon: ICONS.dumbbell },
      { id: 'core', label: 'Abdos', icon: ICONS.shield },
      { id: 'cardio', label: 'Cardio', icon: ICONS.flame }
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
          ${cat.icon}
          <span>${cat.label}</span>
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
        const modeIcon = ex.mode === 'timer' ? ICONS.clock : ICONS.repeat;
        const catIcon = CAT_ICONS[ex.category] || ICONS.activity;
        return `
        <article class="exercise-card" data-action="open-exercise-modal" data-exercise-id="${ex.id}" role="button" tabindex="0">
          <div class="exercise-visual-box">
            ${window.AppData.getExerciseIllustration(ex.id)}
            <span class="exercise-cat-tag">${catIcon} ${ex.categoryLabel}</span>
            <span class="exercise-target-floating">${modeIcon} ${ex.baseValue}${ex.unit}</span>
          </div>
          <div class="exercise-card-body">
            <h3 class="exercise-card-title">${ex.name}</h3>
            <p class="exercise-muscles">${ex.muscles}</p>
          </div>
        </article>
      `;
      })
      .join('');

    container.innerHTML = `
      <div class="catalogue-container">
        <div class="filter-tabs-bar" role="tablist">
          ${filterBtnsHtml}
        </div>

        <div class="exercises-grid">
          ${cardsHtml}
        </div>
      </div>
    `;
  }

  function computeRingOffset(step) {
    const ratio = Math.max(0, step.remainingSeconds / Math.max(1, step.targetValue));
    return RING_CIRCUMFERENCE * (1 - ratio);
  }

  /**
   * Se identifica la estructura visible del reproductor: mientras no cambie, cada tic del
   * cronómetro solo actualiza los números y el anillo en lugar de reconstruir todo el DOM
   * (evita reiniciar los GIF y perder toques en botones que desaparecen bajo el dedo).
   */
  function getOverlayKey(session) {
    const step = session.steps[session.currentStepIndex];
    return [
      session.status,
      session.currentStepIndex,
      step.phase,
      step.selectedVariantLevel,
      step.targetValue
    ].join('|');
  }

  function patchLiveTimer(overlay, session) {
    const step = session.steps[session.currentStepIndex];
    const remainingEl = overlay.querySelector('[data-live="remaining"]');
    if (remainingEl && remainingEl.firstChild) {
      remainingEl.firstChild.nodeValue = String(step.remainingSeconds);
    }
    const prepEl = overlay.querySelector('[data-live="prep"]');
    if (prepEl) prepEl.textContent = String(step.prepSeconds);
    const ringEl = overlay.querySelector('[data-live="ring"]');
    if (ringEl) ringEl.setAttribute('stroke-dashoffset', String(computeRingOffset(step)));
  }

  function renderWorkoutOverlay(session) {
    const overlay = document.getElementById('workout-player-overlay');
    if (!overlay) return;

    if (!session) {
      lastOverlayKey = null;
      overlay.classList.add('is-hidden');
      overlay.setAttribute('aria-hidden', 'true');
      return;
    }

    const ICONS = window.AppData.ICONS;
    const CAT_ICONS = window.AppData.CATEGORY_ICONS;

    const overlayKey = getOverlayKey(session);
    if (overlayKey === lastOverlayKey) {
      patchLiveTimer(overlay, session);
      return;
    }
    lastOverlayKey = overlayKey;

    overlay.classList.remove('is-hidden');
    overlay.setAttribute('aria-hidden', 'false');

    if (session.status === 'completed') {
      const actualMin = window.WorkoutEngine.getActiveMinutes(session);
      overlay.innerHTML = `
        <div class="player-modal player-victory">
          <div class="victory-icon-badge">${ICONS.trophy}</div>
          <h2 class="victory-title">J${session.programDay || ''} validé</h2>

          <div class="victory-kpi-pills">
            <span class="v-pill">${ICONS.clock} ${actualMin}m</span>
            <span class="v-pill">${ICONS.flame} ${session.template.caloriesEst} kcal</span>
            <span class="v-pill">${ICONS.zap} +${session.xpReward}</span>
          </div>

          <div class="rpe-feedback-box">
            <div class="rpe-buttons">
              <button type="button" class="btn btn-secondary" data-action="finish-workout" data-rpe="easy">
                ${ICONS.trendingUp}
                <span>Facile (+8%)</span>
              </button>
              <button type="button" class="btn btn-primary" data-action="finish-workout" data-rpe="optimal">
                ${ICONS.check}
                <span>Parfait</span>
              </button>
              <button type="button" class="btn btn-secondary" data-action="finish-workout" data-rpe="hard">
                ${ICONS.trendingDown}
                <span>Intense (-8%)</span>
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
            title="${s.exercise.name}"
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
              <span class="player-step-counter">${ICONS.wind} J${session.programDay}</span>
              <div class="step-dots-bar">${workStepsHtml}</div>
            </div>
            <button type="button" class="icon-btn" data-action="abort-workout" aria-label="Quitter">
              ${ICONS.close}
            </button>
          </div>

          <div class="rest-split-grid">
            <div class="rest-timer-panel">
              <span class="rest-badge">${ICONS.wind} Repos</span>
              <div class="timer-display-giant" data-live="remaining">${currentStep.remainingSeconds}<span>s</span></div>
              <div class="rest-controls">
                <button type="button" class="btn btn-secondary" data-action="add-rest-time">
                  +15s
                </button>
                <button type="button" class="btn btn-primary" data-action="skip-step">
                  ${ICONS.skipForward}
                  <span>Suivant</span>
                </button>
              </div>
            </div>

            <div class="rest-next-card">
              <span class="next-label">${ICONS.chevronRight} ${currentStep.exerciseIndex + 1}/${currentStep.totalExercises}</span>
              <h3>${nextEx.name}</h3>
              <div class="rest-next-gif">
                <img src="assets/gifs/${nextEx.id}.gif" alt="${nextEx.name}" />
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const ex = currentStep.exercise;
    const isTimer = ex.mode === 'timer';
    const catIcon = CAT_ICONS[ex.category] || ICONS.activity;
    const variantText = ex.progressions[currentStep.selectedVariantLevel] || ex.progressions[1];
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercice poids du corps')}`;

    const radius = RING_RADIUS;
    const circumference = RING_CIRCUMFERENCE;
    const dashOffset = isTimer ? computeRingOffset(currentStep) : 0;

    let rightControlPanelHtml = '';

    if (currentStep.phase === 'countdown') {
      rightControlPanelHtml = `
        <div class="studio-action-panel is-prep-countdown">
          <div class="action-ring-row">
            <div class="ring-timer-wrap">
              <div class="countdown-big-number" data-live="prep">${currentStep.prepSeconds}</div>
            </div>
          </div>
        </div>
      `;
    } else if (isTimer && currentStep.phase === 'ready') {
      rightControlPanelHtml = `
        <div class="studio-action-panel is-ready-phase">
          <div class="action-ring-row">
            <div class="ring-timer-wrap">
              <svg class="timer-ring-svg" viewBox="0 0 190 190">
                <circle class="ring-bg" cx="95" cy="95" r="${radius}" />
                <circle class="ring-fg" cx="95" cy="95" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="0" />
              </svg>
              <div class="ring-center-content">
                <div class="timer-display-giant">${currentStep.targetValue}<span>s</span></div>
              </div>
            </div>

            <div class="ready-side-actions">
              <span class="phase-status-pill pill-ready">${ICONS.eye} Prêt ?</span>
              <button type="button" class="btn btn-ghost btn-sm" data-action="skip-step" title="Passer">
                ${ICONS.skipForward}
                <span>Passer</span>
              </button>
            </div>
          </div>

          <div class="action-cta-dock">
            <button type="button" class="btn-start-giant" data-action="begin-exercise-timer">
              ${ICONS.play}
              <span>Go • ${currentStep.targetValue}s</span>
            </button>
          </div>
        </div>
      `;
    } else if (isTimer) {
      rightControlPanelHtml = `
        <div class="studio-action-panel is-active-phase">
          <div class="action-ring-row">
            <div class="ring-timer-wrap">
              <svg class="timer-ring-svg" viewBox="0 0 190 190">
                <circle class="ring-bg" cx="95" cy="95" r="${radius}" />
                <circle class="ring-fg" data-live="ring" cx="95" cy="95" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" />
              </svg>
              <div class="ring-center-content">
                <div class="timer-display-giant" data-live="remaining">${currentStep.remainingSeconds}<span>s</span></div>
              </div>
            </div>

            <div class="live-timer-buttons">
              <button type="button" class="btn btn-secondary btn-icon-only" data-action="toggle-pause" aria-label="Pause">
                ${currentStep.phase === 'paused' ? ICONS.play : ICONS.pause}
              </button>
              <button type="button" class="btn btn-secondary" data-action="add-rest-time">
                +15s
              </button>
              <button type="button" class="btn btn-ghost btn-icon-only" data-action="restart-exercise-timer" aria-label="Recommencer">
                ${ICONS.rotateCcw}
              </button>
            </div>
          </div>

          <div class="action-cta-dock">
            <button type="button" class="btn-start-giant" data-action="skip-step">
              ${ICONS.check}
              <span>Suivant</span>
            </button>
          </div>
        </div>
      `;
    } else {
      rightControlPanelHtml = `
        <div class="studio-action-panel is-reps-phase">
          <div class="action-ring-row">
            <div class="ring-timer-wrap">
              <svg class="timer-ring-svg" viewBox="0 0 190 190">
                <circle class="ring-bg" cx="95" cy="95" r="${radius}" />
                <circle class="ring-fg" cx="95" cy="95" r="${radius}" stroke-dasharray="${circumference}" stroke-dashoffset="0" />
              </svg>
              <div class="ring-center-content">
                <div class="timer-display-giant">${currentStep.targetValue}<span>×</span></div>
              </div>
            </div>

            <div class="ready-side-actions">
              <span class="phase-status-pill pill-ready">${ICONS.repeat} ${currentStep.targetValue} rép.</span>
            </div>
          </div>

          <div class="action-cta-dock">
            <button type="button" class="btn-start-giant" data-action="skip-step">
              ${ICONS.check}
              <span>Valider • ${currentStep.targetValue}×</span>
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
            <span class="player-step-counter">J${session.programDay} • ${currentStep.exerciseIndex}/${currentStep.totalExercises}</span>
            <div class="step-dots-bar" aria-label="Exercices">
              ${workStepsHtml}
            </div>
          </div>
          <div class="player-top-actions">
            ${
              currentStep.exerciseIndex > 1
                ? `<button type="button" class="icon-btn" data-action="prev-step" aria-label="Précédent">${ICONS.chevronLeft}</button>`
                : ''
            }
            <button type="button" class="icon-btn" data-action="open-exercise-modal" data-exercise-id="${ex.id}" aria-label="Infos posture">
              ${ICONS.info}
            </button>
            <button type="button" class="icon-btn" data-action="abort-workout" aria-label="Quitter">
              ${ICONS.close}
            </button>
          </div>
        </div>

        <div class="studio-main-grid">
          <div class="studio-visual-column">
            <div class="studio-title-block">
              <span class="mode-badge">${catIcon} ${ex.muscles}</span>
              <h2 class="player-ex-title">${ex.name}</h2>
            </div>

            <div class="player-gif-stage">
              <img class="player-gif-main" src="assets/gifs/${ex.id}.gif" alt="${ex.name}" />
              <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="gif-yt-pill" title="Vidéo YouTube" aria-label="Vidéo YouTube">
                ${ICONS.play}
              </a>
            </div>

            <div class="studio-variant-box">
              <div class="variant-pills-row">
                <button type="button" class="level-chip ${currentStep.selectedVariantLevel === 1 ? 'is-active' : ''}" data-action="set-step-variant" data-variant="1">Niv. 1</button>
                <button type="button" class="level-chip ${currentStep.selectedVariantLevel === 2 ? 'is-active' : ''}" data-action="set-step-variant" data-variant="2">Niv. 2</button>
                <button type="button" class="level-chip ${currentStep.selectedVariantLevel === 3 ? 'is-active' : ''}" data-action="set-step-variant" data-variant="3">Niv. 3</button>
              </div>
              <p class="variant-selected-text">${variantText}</p>
            </div>
          </div>

          ${rightControlPanelHtml}
        </div>
      </div>
    `;
  }

  function openExerciseDetailModal(exerciseId) {
    const modal = document.getElementById('exercise-detail-modal');
    if (!modal) return;
    const ICONS = window.AppData.ICONS;
    const CAT_ICONS = window.AppData.CATEGORY_ICONS;
    const ex = window.AppData.getExerciseById(exerciseId);
    const catIcon = CAT_ICONS[ex.category] || ICONS.activity;
    const cuesHtml = ex.coachingCues
      .map((c, i) => `<li><span class="cue-num">${i + 1}</span><span>${c}</span></li>`)
      .join('');
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercice poids du corps')}`;

    modal.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-ex-title">
        <div class="sheet-drag-handle" aria-hidden="true"></div>
        <div class="modal-header">
          <div>
            <span class="mode-badge">${catIcon} ${ex.muscles}</span>
            <h2 id="modal-ex-title" class="modal-title">${ex.name}</h2>
          </div>
          <button type="button" class="icon-btn" data-action="close-exercise-modal" aria-label="Fermer">
            ${ICONS.close}
          </button>
        </div>
        <div class="modal-body">
          <div class="player-gif-stage">
            <img class="player-gif-main" src="assets/gifs/${ex.id}.gif" alt="${ex.name}" />
            <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="gif-yt-pill" title="YouTube">
              ${ICONS.play}
            </a>
          </div>
          <ul class="studio-cues-list">
            ${cuesHtml}
          </ul>
          <div class="modal-progressions">
            <div class="prog-item"><strong>Niv. 1</strong> <span>${ex.progressions[1]}</span></div>
            <div class="prog-item"><strong>Niv. 2</strong> <span>${ex.progressions[2]}</span></div>
            <div class="prog-item"><strong>Niv. 3</strong> <span>${ex.progressions[3]}</span></div>
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
    }, 2200);
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
        showToast(`Niv. ${fitnessLevel}`);
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
        const session = window.WorkoutEngine.getActiveSession();
        const hasProgress =
          session &&
          (session.currentStepIndex > 0 || session.steps[0].phase !== 'ready');
        if (hasProgress && !window.confirm('Quitter la séance ? Elle ne sera pas validée.')) {
          return;
        }
        window.WorkoutEngine.abortWorkout();
        renderWorkoutOverlay(null);
      } else if (action === 'finish-workout') {
        const rpe = actionBtn.getAttribute('data-rpe');
        const session = window.WorkoutEngine.getActiveSession();
        if (session) {
          const { state: updatedState } = window.AppStorage.recordCompletedWorkout({
            title: session.template.title,
            durationMin: window.WorkoutEngine.getActiveMinutes(session),
            caloriesEst: session.template.caloriesEst,
            xpEarned: session.xpReward,
            programDay: session.programDay,
            rpe
          });
          selectedDayNumber = updatedState.currentProgramDay;
          window.WorkoutEngine.abortWorkout();
          renderWorkoutOverlay(null);
          renderAll();
          showToast(
            updatedState.currentProgramDay > session.programDay
              ? `J${session.programDay} validé → J${updatedState.currentProgramDay}`
              : `J${session.programDay} validé`
          );
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

    // Se pide confirmación al cerrar o recargar la pestaña con una sesión en curso
    window.addEventListener('beforeunload', (event) => {
      const session = window.WorkoutEngine.getActiveSession();
      if (session && session.status === 'running') {
        event.preventDefault();
        event.returnValue = '';
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
