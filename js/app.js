/**
 * Se prioriza la iconografía vectorial y los indicadores visuales directos por encima del texto
 * extenso para que toda la interfaz se lea de un vistazo en móvil.
 */
window.AppController = (function createAppController() {
  let currentView = 'dashboard';
  let currentExerciseFilter = 'all';
  let lastOverlayKey = null;

  const RING_RADIUS = 80;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

  const SECTION_LABELS = {
    warmup: 'Échauffement',
    cooldown: 'Retour au calme'
  };

  function sectionLabel(step) {
    if (step.section === 'main') return `Tour ${step.round}/${step.totalRounds}`;
    return SECTION_LABELS[step.section] || '';
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
      streakEl.textContent = String(window.AppStorage.getWeeklyStreak(state));
    }
  }

  function buildExerciseRowHtml(exerciseId, state, position, index) {
    const D = window.AppData;
    const ex = D.getExerciseById(exerciseId);
    const lv = D.getExerciseLevel(ex, state.fitnessLevel);
    const target = D.computeTarget(ex, lv.level, position.volumeFactor, state.intensityMultiplier);
    const modeIcon = lv.mode === 'timer' ? D.ICONS.clock : D.ICONS.repeat;

    return `
      <div class="circuit-row" data-action="open-exercise-modal" data-exercise-id="${ex.id}" role="button" tabindex="0">
        <div class="circuit-step-num">${index}</div>
        <div class="circuit-gif-thumb">
          <img src="assets/photos/${lv.photo}/1.jpg" alt="" loading="lazy" decoding="async" />
        </div>
        <div class="circuit-info">
          <strong>${ex.name}</strong>
          <span class="circuit-meta-icon">${lv.label}</span>
        </div>
        <div class="circuit-badge">
          ${modeIcon}
          <span>${D.formatTarget(target, lv)}</span>
        </div>
      </div>
    `;
  }

  function renderDashboardView(state) {
    const container = document.getElementById('view-dashboard');
    if (!container) return;

    const D = window.AppData;
    const ICONS = D.ICONS;
    const position = D.getProgramPosition(state.programSessionIndex);
    const template = D.getTemplateById(position.templateId);
    const mobility = D.getTemplateById('mobilite');
    const durationMin = D.estimateDurationMin(template, position, state.fitnessLevel, state.intensityMultiplier);
    const mobilityMin = D.estimateDurationMin(mobility, position, 1, 1);
    const cyclePct = Math.round((position.sessionInCycle / position.sessionsPerCycle) * 100);
    const weekStreak = window.AppStorage.getWeeklyStreak(state);
    const doneThisWeek = window.AppStorage.countSessionsThisWeek(state);

    const weekPillsHtml = Array.from({ length: position.weeksPerCycle }, (_, w) => {
      const status = w < position.weekIndex ? 'is-done' : w === position.weekIndex ? 'is-active' : '';
      return `<span class="prog-week-pill ${status}">S${w + 1}${w === position.weeksPerCycle - 1 ? ' · léger' : ''}</span>`;
    }).join('');

    const sessionStepsHtml = D.SESSION_ROTATION.map((id) => D.getTemplateById(id).letter)
      .map((letter, i) => {
        const done = i < position.sessionInWeek;
        const isNext = i === position.sessionInWeek;
        return `
          <div class="prog-day-step ${done ? 'is-done' : ''} ${isNext ? 'is-selected is-next' : ''}">
            <span class="step-j-label">Séance</span>
            <span class="step-j-dot">${done ? ICONS.check : letter}</span>
          </div>
        `;
      })
      .join('');

    let rowIndex = 0;
    const listSection = (title, ids, extra) =>
      ids.length
        ? `
          <div class="circuit-section-title">${title}${extra ? ` <span>${extra}</span>` : ''}</div>
          ${ids.map((id) => buildExerciseRowHtml(id, state, position, (rowIndex += 1))).join('')}
        `
        : '';

    container.innerHTML = `
      <div class="bento-dashboard">
        <section class="bento-hero-split">
          <div class="hero-dark-panel">
            <div class="program-roadmap-bar">
              <div class="roadmap-weeks-row">
                <span class="roadmap-week-tag">Cycle ${position.cycleIndex + 1} · ${position.cycleName}</span>
              </div>
              <div class="roadmap-weeks-tabs" aria-label="Semaines du cycle">${weekPillsHtml}</div>
              <div class="roadmap-days-row" aria-label="Séances de la semaine">${sessionStepsHtml}</div>
            </div>

            <div class="hero-body-content">
              <div class="hero-eyebrow-row">
                <span class="hero-eyebrow-pill">Séance ${template.letter} · Semaine ${position.weekIndex + 1}</span>
                ${position.isDeload ? `<span class="hero-next-pill">${ICONS.wind} Semaine légère</span>` : ''}
              </div>

              <h1 class="hero-display-title">${template.title}</h1>
              ${template.focus ? `<p class="hero-focus">${template.focus}</p>` : ''}

              <div class="hero-glass-stats">
                <div class="glass-stat" title="Durée estimée">
                  <span class="glass-stat-icon">${ICONS.clock}</span>
                  <strong>~${durationMin} min</strong>
                </div>
                <div class="glass-stat" title="Tours du bloc principal">
                  <span class="glass-stat-icon">${ICONS.repeat}</span>
                  <strong>${position.rounds} tours</strong>
                </div>
                <div class="glass-stat" title="Exercices du bloc principal">
                  <span class="glass-stat-icon">${ICONS.dumbbell}</span>
                  <strong>${template.main.length} exos</strong>
                </div>
              </div>
            </div>

            <div class="hero-footer-actions">
              <div class="hero-level-bar">
                <span class="hero-level-icon" title="Niveau des variantes">${ICONS.sliders}</span>
                <div class="hero-level-segmented">
                  ${[1, 2, 3]
                    .map(
                      (l) => `
                    <button type="button" class="seg-btn ${state.fitnessLevel === l ? 'is-active' : ''}" data-action="set-level" data-level="${l}">
                      Niv. ${l}
                    </button>`
                    )
                    .join('')}
                </div>
              </div>

              <button type="button" class="btn-hero-launch" data-action="start-workout" data-template-id="${template.id}">
                <span class="launch-play-circle">${ICONS.play}</span>
                <span class="launch-texts">
                  <strong>Démarrer la séance ${template.letter}</strong>
                </span>
              </button>
            </div>
          </div>

          <div class="hero-circuit-panel">
            <div class="circuit-panel-header">
              <div class="circuit-header-title">
                ${ICONS.dumbbell}
                <h2>Au programme</h2>
              </div>
            </div>

            <div class="circuit-timeline-list">
              ${listSection('Échauffement', template.warmup)}
              ${listSection('Bloc principal', template.main, `× ${position.rounds} tours`)}
              ${listSection('Retour au calme', template.cooldown)}
            </div>
          </div>
        </section>

        <button type="button" class="bento-card mobility-card" data-action="start-workout" data-template-id="mobilite">
          <span class="mobility-icon">${ICONS.wind}</span>
          <span class="mobility-texts">
            <strong>Mobilité · ~${mobilityMin} min</strong>
            <span>Facultatif, pour les jours sans séance</span>
          </span>
          ${ICONS.chevronRight}
        </button>

        <article class="bento-card bento-wide-progress">
          <div class="bento-wide-body">
            <div class="week-strip-grid">
              ${buildWeekStripHtml(state)}
            </div>

            <div class="bento-wide-metrics">
              <div class="bento-mini-kpis">
                <div class="mini-kpi" title="Séances cette semaine">
                  <span class="kpi-icon">${ICONS.checkCircle}</span>
                  <strong>${Math.min(doneThisWeek, position.sessionsPerWeek)}/${position.sessionsPerWeek}</strong>
                </div>
                <div class="mini-kpi" title="Semaines actives d’affilée">
                  <span class="kpi-icon">${ICONS.flame}</span>
                  <strong>${weekStreak} sem.</strong>
                </div>
                <div class="mini-kpi" title="Séances terminées">
                  <span class="kpi-icon">${ICONS.trophy}</span>
                  <strong>${state.totalWorkouts}</strong>
                </div>
                <div class="mini-kpi" title="Minutes cumulées">
                  <span class="kpi-icon">${ICONS.clock}</span>
                  <strong>${state.totalMinutes} min</strong>
                </div>
              </div>

              <div class="xp-bar-container">
                <div class="xp-bar-labels">
                  <span class="xp-label-icon">${ICONS.award} Cycle ${position.cycleIndex + 1} · ${position.cycleName}</span>
                  <strong>${position.sessionInCycle}/${position.sessionsPerCycle}</strong>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" style="--progress-pct: ${cyclePct}%"></div>
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

    const D = window.AppData;
    const ICONS = D.ICONS;
    const categories = [{ id: 'all', label: 'Tous', icon: ICONS.grid }].concat(
      Object.keys(D.CATEGORY_LABELS).map((id) => ({
        id,
        label: D.CATEGORY_LABELS[id],
        icon: D.CATEGORY_ICONS[id]
      }))
    );

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
        ? D.EXERCISES
        : D.EXERCISES.filter((ex) => ex.category === currentExerciseFilter);

    const cardsHtml = filteredExercises
      .map((ex) => {
        const lv = D.getExerciseLevel(ex, 1);
        const levelCount = Object.keys(ex.levels).length;
        return `
        <article class="exercise-card" data-action="open-exercise-modal" data-exercise-id="${ex.id}" role="button" tabindex="0">
          <div class="exercise-visual-box">
            <img class="exercise-card-photo" src="assets/photos/${lv.photo}/1.jpg" alt="" loading="lazy" decoding="async" />
            <span class="exercise-cat-tag">${D.CATEGORY_ICONS[ex.category]} ${D.CATEGORY_LABELS[ex.category]}</span>
            ${levelCount > 1 ? `<span class="exercise-target-floating">${ICONS.sliders} ${levelCount} niveaux</span>` : ''}
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
   * (evita reiniciar las animaciones y perder toques en botones que desaparecen bajo el dedo).
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

  function renderVictory(overlay, session) {
    const ICONS = window.AppData.ICONS;
    const actualMin = window.WorkoutEngine.getActiveMinutes(session);
    const isProgram = session.counted;

    overlay.innerHTML = `
      <div class="player-modal player-victory">
        <div class="victory-icon-badge">${ICONS.check}</div>
        <h2 class="victory-title">${isProgram ? `Séance ${session.template.letter} terminée` : 'Mobilité terminée'}</h2>

        <div class="victory-kpi-pills">
          <span class="v-pill">${ICONS.clock} ${actualMin} min</span>
          ${isProgram ? `<span class="v-pill">${ICONS.repeat} ${session.position.rounds} tours</span>` : ''}
        </div>

        ${
          isProgram
            ? `
          <div class="rpe-feedback-box">
            <p class="rpe-question">Comment c’était ?</p>
            <div class="rpe-buttons">
              <button type="button" class="btn btn-secondary" data-action="finish-workout" data-rpe="easy">
                ${ICONS.trendingUp}
                <span>Trop facile</span>
              </button>
              <button type="button" class="btn btn-primary" data-action="finish-workout" data-rpe="optimal">
                ${ICONS.check}
                <span>Juste bien</span>
              </button>
              <button type="button" class="btn btn-secondary" data-action="finish-workout" data-rpe="hard">
                ${ICONS.trendingDown}
                <span>Trop dur</span>
              </button>
            </div>
          </div>`
            : `
          <div class="rpe-feedback-box">
            <button type="button" class="btn btn-primary" data-action="finish-workout" data-rpe="optimal">
              ${ICONS.check}
              <span>Terminer</span>
            </button>
          </div>`
        }
      </div>
    `;
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

    const overlayKey = getOverlayKey(session);
    if (overlayKey === lastOverlayKey) {
      patchLiveTimer(overlay, session);
      return;
    }
    lastOverlayKey = overlayKey;

    const D = window.AppData;
    const ICONS = D.ICONS;

    overlay.classList.remove('is-hidden');
    overlay.setAttribute('aria-hidden', 'false');

    if (session.status === 'completed') {
      renderVictory(overlay, session);
      return;
    }

    const currentStep = session.steps[session.currentStepIndex];
    const sessionPct = Math.round(((session.currentStepIndex + 1) / session.steps.length) * 100);
    const counterHtml = `${sectionLabel(currentStep)} · ${currentStep.exerciseIndex}/${currentStep.totalExercises}`;

    if (currentStep.stepType === 'rest') {
      const nextEx = currentStep.nextExercise;
      const nextLv = currentStep.nextLevel;
      const nextTarget = D.computeTarget(nextEx, nextLv.level, session.ctx.volumeFactor, session.ctx.intensityMultiplier);
      overlay.innerHTML = `
        <div class="player-modal player-studio">
          <div class="player-session-progress" aria-hidden="true">
            <div class="player-session-fill" style="--progress-pct: ${sessionPct}%"></div>
          </div>

          <div class="player-topbar">
            <div class="player-top-left">
              <span class="player-step-counter">${counterHtml}</span>
            </div>
            <button type="button" class="icon-btn" data-action="abort-workout" aria-label="Quitter">
              ${ICONS.close}
            </button>
          </div>

          <div class="rest-split-grid">
            <div class="rest-timer-panel">
              <span class="rest-badge">${ICONS.wind} ${currentStep.label}</span>
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
              <span class="next-label">${ICONS.chevronRight} Ensuite · ${D.formatTarget(nextTarget, nextLv)}</span>
              <h3>${nextEx.name}</h3>
              <p class="rest-next-variant">${nextLv.label}</p>
              <div class="rest-next-gif">
                ${D.getExerciseMedia(nextLv.photo, nextEx.name, 'is-animated')}
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const ex = currentStep.exercise;
    const lv = currentStep.levelInfo;
    const isTimer = currentStep.mode === 'timer';
    const levelKeys = Object.keys(ex.levels).map(Number);
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${lv.label} ${ex.name} exercice`)}`;
    const perSideHtml = lv.perSide ? '<div class="ring-unit-label">par côté</div>' : '';

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
          <div class="action-cta-dock">
            <button type="button" class="btn btn-secondary" data-action="toggle-pause">
              ${ICONS.pause}
              <span>Pause</span>
            </button>
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
              <button type="button" class="btn btn-ghost btn-sm" data-action="skip-step" title="Passer">
                ${ICONS.skipForward}
                <span>Passer</span>
              </button>
            </div>
          </div>

          <div class="action-cta-dock">
            <button type="button" class="btn-start-giant" data-action="begin-exercise-timer">
              ${ICONS.play}
              <span>Go · ${currentStep.targetValue} s</span>
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
              <button type="button" class="btn btn-secondary btn-icon-only" data-action="toggle-pause" aria-label="${currentStep.phase === 'paused' ? 'Reprendre' : 'Pause'}">
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
                ${perSideHtml}
              </div>
            </div>
          </div>

          <div class="action-cta-dock">
            <button type="button" class="btn-start-giant" data-action="skip-step">
              ${ICONS.check}
              <span>C’est fait</span>
            </button>
          </div>
        </div>
      `;
    }

    const variantHtml =
      levelKeys.length > 1
        ? `
        <div class="studio-variant-box">
          <div class="variant-pills-row">
            ${levelKeys
              .map(
                (l) => `<button type="button" class="level-chip ${currentStep.selectedVariantLevel === l ? 'is-active' : ''}" data-action="set-step-variant" data-variant="${l}">Niv. ${l}</button>`
              )
              .join('')}
          </div>
          <p class="variant-selected-text">${lv.label}</p>
        </div>`
        : '';

    overlay.innerHTML = `
      <div class="player-modal player-studio">
        <div class="player-session-progress" aria-hidden="true">
          <div class="player-session-fill" style="--progress-pct: ${sessionPct}%"></div>
        </div>

        <div class="player-topbar">
          <div class="player-top-left">
            <span class="player-step-counter">${counterHtml}</span>
          </div>
          <div class="player-top-actions">
            ${
              session.currentStepIndex > 0
                ? `<button type="button" class="icon-btn" data-action="prev-step" aria-label="Précédent">${ICONS.chevronLeft}</button>`
                : ''
            }
            <button type="button" class="icon-btn" data-action="open-exercise-modal" data-exercise-id="${ex.id}" aria-label="Consignes">
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
              <span class="mode-badge">${D.CATEGORY_ICONS[ex.category]} ${ex.muscles}</span>
              <h2 class="player-ex-title">${ex.name}</h2>
            </div>

            <div class="player-gif-stage">
              ${D.getExerciseMedia(lv.photo, `${ex.name} : ${lv.label}`, 'is-animated')}
              <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="gif-yt-pill" title="Vidéo YouTube" aria-label="Vidéo YouTube">
                ${ICONS.play}
              </a>
            </div>

            ${variantHtml}
          </div>

          ${rightControlPanelHtml}
        </div>
      </div>
    `;
  }

  function openExerciseDetailModal(exerciseId) {
    const modal = document.getElementById('exercise-detail-modal');
    if (!modal) return;
    const D = window.AppData;
    const ICONS = D.ICONS;
    const state = window.AppStorage.getState();
    const ex = D.getExerciseById(exerciseId);
    const lv = D.getExerciseLevel(ex, state.fitnessLevel);
    const cuesHtml = ex.cues
      .map((c, i) => `<li><span class="cue-num">${i + 1}</span><span>${c}</span></li>`)
      .join('');
    const levelKeys = Object.keys(ex.levels).map(Number);
    const levelsHtml =
      levelKeys.length > 1
        ? `<div class="modal-progressions">
            ${levelKeys
              .map((l) => `<div class="prog-item ${l === lv.level ? 'is-current' : ''}"><strong>Niv. ${l}</strong> <span>${ex.levels[l].label}</span></div>`)
              .join('')}
          </div>`
        : '';
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${lv.label} ${ex.name} exercice`)}`;

    modal.innerHTML = `
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-ex-title">
        <div class="sheet-drag-handle" aria-hidden="true"></div>
        <div class="modal-header">
          <div>
            <span class="mode-badge">${D.CATEGORY_ICONS[ex.category]} ${ex.muscles}</span>
            <h2 id="modal-ex-title" class="modal-title">${ex.name}</h2>
          </div>
          <button type="button" class="icon-btn" data-action="close-exercise-modal" aria-label="Fermer">
            ${ICONS.close}
          </button>
        </div>
        <div class="modal-body">
          <div class="player-gif-stage">
            ${D.getExerciseMedia(lv.photo, `${ex.name} : ${lv.label}`, 'is-animated')}
            <a href="${ytUrl}" target="_blank" rel="noopener noreferrer" class="gif-yt-pill" title="YouTube">
              ${ICONS.play}
            </a>
          </div>
          <ul class="studio-cues-list">
            ${cuesHtml}
          </ul>
          ${levelsHtml}
        </div>
      </div>
    `;
    modal.classList.remove('is-hidden');
  }

  function closeExerciseModal() {
    const modal = document.getElementById('exercise-detail-modal');
    if (modal) modal.classList.add('is-hidden');
  }

  function showToast(message) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.innerHTML = `${window.AppData.ICONS.checkCircle} <span>${message}</span>`;
    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2600);
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

  function finishWorkout(rpe) {
    const session = window.WorkoutEngine.getActiveSession();
    if (!session) return;
    const { state, levelUp, cycleCompleted } = window.AppStorage.recordCompletedWorkout({
      templateId: session.template.id,
      title: session.template.title,
      durationMin: window.WorkoutEngine.getActiveMinutes(session),
      counted: session.counted,
      rpe
    });
    window.WorkoutEngine.abortWorkout();
    renderWorkoutOverlay(null);
    renderAll();

    if (levelUp) {
      showToast(`Cycle bouclé · passage au niveau ${state.fitnessLevel}`);
    } else if (cycleCompleted) {
      showToast('Cycle bouclé · on continue');
    } else if (session.counted) {
      const next = window.AppData.getProgramPosition(state.programSessionIndex);
      showToast(`Séance validée · prochaine : ${window.AppData.getTemplateById(next.templateId).letter}`);
    } else {
      showToast('Mobilité faite');
    }
  }

  function bindEvents() {
    document.addEventListener('click', (event) => {
      if (event.target.id === 'exercise-detail-modal') {
        closeExerciseModal();
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

      if (action === 'set-level') {
        window.AudioFeedback.playTap();
        const fitnessLevel = Number(actionBtn.getAttribute('data-level'));
        window.AppStorage.updatePreferences({ fitnessLevel });
        renderAll();
        showToast(`Niveau ${fitnessLevel}`);
      } else if (action === 'start-workout') {
        window.WorkoutEngine.startWorkout(actionBtn.getAttribute('data-template-id'));
      } else if (action === 'begin-exercise-timer') {
        window.WorkoutEngine.beginCurrentExerciseTimer();
      } else if (action === 'restart-exercise-timer') {
        window.AudioFeedback.playTap();
        window.WorkoutEngine.restartCurrentExerciseTimer();
      } else if (action === 'prev-step') {
        window.AudioFeedback.playTap();
        window.WorkoutEngine.stepPrevExercise();
      } else if (action === 'set-step-variant') {
        window.AudioFeedback.playTap();
        window.WorkoutEngine.setCurrentStepVariant(Number(actionBtn.getAttribute('data-variant')));
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
        finishWorkout(actionBtn.getAttribute('data-rpe'));
      } else if (action === 'filter-exercises') {
        currentExerciseFilter = actionBtn.getAttribute('data-category');
        renderExercisesView(window.AppStorage.getState());
      } else if (action === 'open-exercise-modal') {
        openExerciseDetailModal(actionBtn.getAttribute('data-exercise-id'));
      } else if (action === 'close-exercise-modal') {
        closeExerciseModal();
      }
    });

    // Se hacen accionables con teclado las tarjetas con role="button" y se cierra la ficha con Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeExerciseModal();
        return;
      }
      const card = event.target.closest && event.target.closest('[role="button"][data-action]');
      if (card && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        card.click();
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
