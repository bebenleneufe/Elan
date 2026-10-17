/**
 * Flujo a pantalla completa: cada momento (la sesión del día, un ejercicio, un descanso)
 * ocupa toda la pantalla y el siguiente está a un gesto vertical.
 */
window.AppController = (function createAppController() {
  let currentView = 'dashboard';
  let currentExerciseFilter = 'all';
  let lastOverlayKey = null;
  let lastStepIndex = -1;
  let feedObserver = null;

  const SECTION_LABELS = {
    warmup: 'Échauffement',
    cooldown: 'Retour au calme'
  };

  function D() {
    return window.AppData;
  }

  function sectionLabel(step) {
    if (step.section === 'main') return `Tour ${step.round}/${step.totalRounds}`;
    return SECTION_LABELS[step.section] || '';
  }

  /**
   * La foto conserva su encuadre 3:2 y se apoya justo encima del texto, que la solapa bajo el velo;
   * una copia desenfocada llena el resto de la pantalla.
   */
  function mediaHtml(photo, alt, opts) {
    const o = opts || {};
    return `
      <div class="media">
        <img class="media-backdrop" src="assets/photos/${photo}/1.jpg" alt="" aria-hidden="true" decoding="async" />
      </div>
      <div class="scrim"></div>
      ${
        o.stacked
          ? `<div class="media-frame is-stacked">
              <img src="assets/photos/${photo}/0.jpg" alt="${alt} (début)" decoding="async" />
              <img src="assets/photos/${photo}/1.jpg" alt="${alt} (fin)" decoding="async" />
            </div>`
          : `<div class="media-frame ${o.dim ? 'is-dim' : ''}">${D().getExerciseMedia(photo, alt, o.animated ? 'is-animated' : '')}</div>`
      }
    `;
  }

  function applyAudioState(state) {
    window.AudioFeedback.setMuted(Boolean(state.soundMuted));
  }

  function soundRailButton(state) {
    const ICONS = D().ICONS;
    return `
      <button type="button" class="rail-btn" data-action="toggle-sound" aria-pressed="${state.soundMuted ? 'true' : 'false'}" aria-label="${state.soundMuted ? 'Activer le son' : 'Couper le son'}">
        ${state.soundMuted ? ICONS.volumeX : ICONS.volume2}
        <span>${state.soundMuted ? 'Muet' : 'Son'}</span>
      </button>
    `;
  }

  function formatShortDate(iso) {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
  }

  /* ---------------------------------------------------------------------
     Accueil
     --------------------------------------------------------------------- */
  function renderDashboardView(state) {
    const container = document.getElementById('view-dashboard');
    if (!container) return;

    const data = D();
    const ICONS = data.ICONS;
    const position = data.getProgramPosition(state.programSessionIndex);
    const template = data.getTemplateById(position.templateId);
    const mobility = data.getTemplateById('mobilite');
    const level = state.fitnessLevel;
    const durationMin = data.estimateDurationMin(template, position, level, state.intensityMultiplier);
    const mobilityMin = data.estimateDurationMin(mobility, position, 1, 1);
    const weekStreak = window.AppStorage.getWeeklyStreak(state);
    const leadEx = data.getExerciseById(template.main[0]);
    const leadLv = data.getExerciseLevel(leadEx, level);

    const plan = window.AppStorage.getDayPlan(state);
    const dayLetters = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const weekDays = window.AppStorage.getWeekActivity(state);
    const daySegments = weekDays
      .map((day, i) => {
        const cls = day.strength ? 'is-done' : day.any ? 'is-light' : day.isToday ? 'is-current' : '';
        const what = day.strength ? 'séance' : day.walk ? 'marche' : day.any ? 'mobilité' : 'rien';
        return `<span class="day-seg ${cls} ${day.isToday ? 'is-today' : ''}" title="${dayLetters[i]} : ${what}"><span class="seg"></span><span class="day-letter">${dayLetters[i]}</span></span>`;
      })
      .join('');
    const feedTop = (rightLabel) => `
      <div class="feed-top">
        <div class="segments day-segments" aria-label="Cette semaine">${daySegments}</div>
        <p class="caps">
          <span>${position.cycleName} · semaine ${position.weekIndex + 1}/${position.weeksPerCycle}</span>
          <span>${rightLabel}</span>
        </p>
      </div>
    `;
    const nextLabel = plan.next === 'walk' ? 'Demain : marche' : `Demain : séance ${template.letter}`;

    const listItem = (title, ids, photoId) => {
      if (!ids.length) return '';
      const first = data.getExerciseById(ids[0]);
      const rows = ids
        .map((id) => {
          const ex = data.getExerciseById(id);
          const lv = data.getExerciseLevel(ex, level);
          return `<li><span>${ex.name}</span><span>${data.formatTarget(data.computeTarget(ex, lv.level, position.volumeFactor, state.intensityMultiplier), lv)}</span></li>`;
        })
        .join('');
      return `
        <article class="feed-item">
          ${mediaHtml(data.getExerciseLevel(first, 1).photo, first.name, { animated: true })}
          <div class="feed-content">
            <div class="feed-text">
              <h2 class="display display-l">${title}</h2>
            </div>
            <ul class="name-list">${rows}</ul>
          </div>
        </article>
      `;
    };

    const mainItems = template.main
      .map((id) => {
        const ex = data.getExerciseById(id);
        const lv = data.getExerciseLevel(ex, level);
        const target = data.computeTarget(ex, lv.level, position.volumeFactor, state.intensityMultiplier);
        return `
          <article class="feed-item has-stack">
            ${mediaHtml(lv.photo, `${ex.name} : ${lv.label}`, { stacked: true })}
            <div class="rail">
              <button type="button" class="rail-btn" data-action="open-exercise-modal" data-exercise-id="${ex.id}" aria-label="Consignes : ${ex.name}">
                ${ICONS.info}
                <span>Infos</span>
              </button>
            </div>
            <div class="feed-content">
              <div class="feed-text">
                <h2 class="display display-l">${ex.name}</h2>
                <p class="caps">${lv.label}</p>
                <p class="target-line">${data.formatTarget(target, lv)} · ${position.rounds} tours</p>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    const ticks = Array.from({ length: position.sessionsPerCycle }, (_, i) => {
      const cls = i < position.sessionInCycle ? 'is-done' : i === position.sessionInCycle ? 'is-current' : '';
      return `<span class="${cls}"></span>`;
    }).join('');

    const history = state.workoutHistory.slice(0, 6);
    const historyHtml = history.length
      ? `<ul class="history">
          ${history
            .map((h) => {
              const tpl = data.WORKOUT_TEMPLATES.find((t) => t.id === h.templateId);
              const name = tpl
                ? tpl.optional ? tpl.title : `${tpl.letter} · ${tpl.title}`
                : h.distanceM ? `${h.title} · ${formatKm(h.distanceM)}` : h.title;
              return `<li><time datetime="${h.date}">${formatShortDate(h.date)}</time><span>${name}</span><span class="h-dur">${h.durationMin} min</span></li>`;
            })
            .join('')}
        </ul>`
      : '<p class="empty-note">Ta première séance ou marche s’affichera ici.</p>';

    const savedScroll = container.scrollTop;

    const isSessionDay = plan.kind === 'strength';
    const sessionStatus = isSessionDay
      ? position.isDeload ? 'Semaine légère' : `Séance ${template.letter}`
      : plan.kind === 'done' && plan.did === 'strength' ? 'Prochaine séance' : `Séance ${template.letter} · plus tard`;

    let dayItem = '';
    if (plan.kind === 'walk') {
      dayItem = `
        <article class="feed-item is-plain is-day" id="feed-today">
          ${feedTop('Jour de marche')}
          <div class="feed-content">
            <div class="feed-text">
              <div class="count"><span class="count-num">${data.WALK_TARGET_MIN}</span><span class="count-unit">min</span></div>
              <h1 class="display display-xl">Marche</h1>
              <p class="lede">D’un bon pas : tu peux parler, pas chanter. Ça entretient le cœur et aide les muscles à récupérer.</p>
            </div>
            <button type="button" class="btn btn-primary btn-block" data-action="walk-start">
              ${ICONS.play}
              <span>Lancer la marche</span>
            </button>
            <button type="button" class="btn btn-outline btn-block" data-action="walk-log">Déjà faite</button>
            <p class="feed-hint caps">${ICONS.chevronDown} La séance de demain</p>
          </div>
        </article>
      `;
    } else if (plan.kind === 'rest') {
      dayItem = `
        <article class="feed-item is-plain is-day" id="feed-today">
          ${feedTop('Jour de repos')}
          <div class="feed-content">
            <div class="feed-text">
              <h1 class="display display-xl">Repos</h1>
              <p class="lede">Six jours actifs d’affilée : une journée off fait partie du programme, c’est là que le corps progresse.</p>
            </div>
            <button type="button" class="btn btn-outline btn-block" data-action="start-workout" data-template-id="mobilite">
              Mobilité douce · ≈ ${mobilityMin} min
            </button>
            <p class="feed-hint caps">${ICONS.chevronDown} La séance reste dispo</p>
          </div>
        </article>
      `;
    } else if (plan.kind === 'done') {
      dayItem = `
        <article class="feed-item is-plain is-day" id="feed-today">
          ${feedTop(nextLabel)}
          <div class="feed-content">
            <div class="feed-text">
              <h1 class="display display-xl">C’est fait</h1>
              <p class="lede">${plan.did === 'strength' ? 'Séance validée aujourd’hui.' : 'Marche faite aujourd’hui.'} ${plan.next === 'walk' ? 'Demain : 30 min de marche.' : `Demain : séance ${template.letter}, ${template.title.toLowerCase()}.`}</p>
            </div>
            ${
              plan.did === 'strength'
                ? `<button type="button" class="btn btn-outline btn-block" data-action="start-workout" data-template-id="mobilite">Mobilité · ≈ ${mobilityMin} min</button>`
                : ''
            }
            <p class="feed-hint caps">${ICONS.chevronDown} Le programme</p>
          </div>
        </article>
      `;
    }

    container.innerHTML = `
      ${dayItem}
      <article class="feed-item" ${isSessionDay ? 'id="feed-today"' : ''}>
        ${mediaHtml(leadLv.photo, `${leadEx.name} : ${leadLv.label}`)}
        ${isSessionDay ? feedTop(sessionStatus) : `<div class="feed-top"><p class="caps"><span>${sessionStatus}</span></p></div>`}

        <div class="rail">
          <button type="button" class="rail-btn" data-action="cycle-level" aria-label="Changer de niveau (actuel : ${level})">
            ${ICONS.sliders}
            <span>Niv. ${level}</span>
          </button>
          ${soundRailButton(state)}
          <button type="button" class="rail-btn" data-action="scroll-to-progress" aria-label="Voir la progression">
            ${ICONS.list}
            <span>Suivi</span>
          </button>
        </div>

        <div class="feed-content">
          <div class="feed-text">
            <h1 class="display display-xl">${template.title}</h1>
            <p class="lede">${template.focus}</p>
            <div class="meta-line">
              <span class="caps">≈ ${durationMin} min</span>
              <span class="caps">${position.rounds} tours</span>
              <span class="caps">${template.main.length} exercices</span>
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-block" data-action="start-workout" data-template-id="${template.id}">
            ${ICONS.play}
            <span>Commencer</span>
          </button>
          <p class="feed-hint caps">${ICONS.chevronDown} Le détail</p>
        </div>
      </article>

      ${listItem('Échauffement', template.warmup)}
      ${mainItems}
      ${listItem('Retour au calme', template.cooldown)}

      <article class="feed-item">
        ${mediaHtml('cat-stretch', 'Dos rond, dos creux')}
        <div class="feed-content">
          <div class="feed-text">
            <h2 class="display display-l">Mobilité</h2>
            <p class="lede">Facultatif, pour les jours sans séance.</p>
            <div class="meta-line">
              <span class="caps">≈ ${mobilityMin} min</span>
              <span class="caps">${mobility.main.length} mouvements</span>
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-block" data-action="start-workout" data-template-id="mobilite">
            Lancer la mobilité
          </button>
        </div>
      </article>

      <article class="feed-item is-plain" id="feed-progress">
        <div class="plain-content">
          <h2 class="display display-l">Progression</h2>
          <div class="cycle-ticks" aria-label="${position.sessionInCycle} séances sur ${position.sessionsPerCycle} dans ce cycle">${ticks}</div>
          <div>
            <p class="statement">Cycle ${position.cycleIndex + 1} · <em>${position.cycleName}</em></p>
            <p class="statement">Semaine ${position.weekIndex + 1} sur ${position.weeksPerCycle}</p>
            <p class="statement"><em>${weekStreak}</em> semaine${weekStreak > 1 ? 's' : ''} d’affilée</p>
            <p class="statement">${state.totalWorkouts} séance${state.totalWorkouts > 1 ? 's' : ''} · ${state.totalWalks || 0} marche${(state.totalWalks || 0) > 1 ? 's' : ''}</p>
            <p class="statement">${state.totalMinutes} min au total</p>
          </div>
          <div>
            <p class="caps">Derniers jours</p>
            ${historyHtml}
          </div>
          <p class="fine-print">Un cycle bouclé sans séance « trop dure » te fait passer au niveau suivant.</p>
        </div>
      </article>
    `;

    container.scrollTop = savedScroll;
    observeFeedMedia(container);
  }

  /**
   * Solo se anima la foto del elemento visible, para no gastar batería en los demás.
   */
  function observeFeedMedia(container) {
    if (feedObserver) feedObserver.disconnect();
    if (!('IntersectionObserver' in window)) return;
    feedObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const flip = entry.target.querySelector('.photo-flip');
          if (flip) flip.classList.toggle('is-animated', entry.isIntersecting);
        });
      },
      { root: container, threshold: 0.6 }
    );
    container.querySelectorAll('.feed-item').forEach((item) => feedObserver.observe(item));
  }

  /* ---------------------------------------------------------------------
     Exercices
     --------------------------------------------------------------------- */
  function renderExercisesView() {
    const container = document.getElementById('view-exercises');
    if (!container) return;

    const data = D();
    const categories = [{ id: 'all', label: 'Tous' }].concat(
      Object.keys(data.CATEGORY_LABELS).map((id) => ({ id, label: data.CATEGORY_LABELS[id] }))
    );

    const chips = categories
      .map(
        (cat) => `
        <button type="button" class="filter-chip ${currentExerciseFilter === cat.id ? 'is-active' : ''}" data-action="filter-exercises" data-category="${cat.id}" aria-pressed="${currentExerciseFilter === cat.id}">
          ${cat.label}
        </button>`
      )
      .join('');

    const list =
      currentExerciseFilter === 'all'
        ? data.EXERCISES
        : data.EXERCISES.filter((ex) => ex.category === currentExerciseFilter);

    const tiles = list
      .map((ex) => {
        const lv = data.getExerciseLevel(ex, 1);
        const levelCount = Object.keys(ex.levels).length;
        return `
          <button type="button" class="tile" data-action="open-exercise-modal" data-exercise-id="${ex.id}">
            <img src="assets/photos/${lv.photo}/1.jpg" alt="" decoding="async"${ex.focus ? ` style="object-position: ${ex.focus}"` : ''} />
            <span class="tile-text">
              <span class="tile-name">${ex.name}</span>
              <span class="caps">${data.CATEGORY_LABELS[ex.category]}${levelCount > 1 ? ` · ${levelCount} niveaux` : ''}</span>
            </span>
          </button>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="library-head">
        <h1 class="display display-l">Exercices</h1>
        <div class="filter-row" role="group" aria-label="Filtrer par catégorie">${chips}</div>
      </div>
      <div class="tile-grid">${tiles}</div>
    `;
  }

  /* ---------------------------------------------------------------------
     Fiche d’exercice
     --------------------------------------------------------------------- */
  function openExerciseDetailModal(exerciseId) {
    const sheet = document.getElementById('exercise-detail-modal');
    if (!sheet) return;
    const data = D();
    const ICONS = data.ICONS;
    const state = window.AppStorage.getState();
    const ex = data.getExerciseById(exerciseId);
    const session = window.WorkoutEngine.getActiveSession();
    const sessionStep = session && session.steps[session.currentStepIndex];
    const activeLevel =
      sessionStep && sessionStep.exercise && sessionStep.exercise.id === ex.id
        ? sessionStep.selectedVariantLevel
        : state.fitnessLevel;
    const lv = data.getExerciseLevel(ex, activeLevel);
    const levelKeys = Object.keys(ex.levels).map(Number);
    const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${lv.label} ${ex.name} exercice`)}`;

    sheet.innerHTML = `
      <div role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div class="sheet-media">
          ${data.getExerciseMedia(lv.photo, `${ex.name} : ${lv.label}`, 'is-animated')}
          <button type="button" class="icon-btn sheet-close" data-action="close-exercise-modal" aria-label="Fermer">
            ${ICONS.close}
          </button>
        </div>
        <div class="sheet-body">
          <div class="sheet-title">
            <h2 id="sheet-title" class="display display-l">${ex.name}</h2>
            <p class="caps">${ex.muscles}</p>
          </div>
          <ol class="cue-list">
            ${ex.cues.map((c) => `<li>${c}</li>`).join('')}
          </ol>
          ${
            levelKeys.length > 1
              ? `<ul class="level-list">
                  ${levelKeys
                    .map((l) => `<li class="${l === lv.level ? 'is-current' : ''}"><span class="caps">Niv. ${l}</span><span>${ex.levels[l].label}</span></li>`)
                    .join('')}
                </ul>`
              : ''
          }
          <a class="btn btn-outline btn-block" href="${ytUrl}" target="_blank" rel="noopener noreferrer">
            ${ICONS.externalLink}
            <span>Voir une vidéo</span>
          </a>
        </div>
      </div>
    `;
    sheet.classList.remove('is-hidden');
    sheet.setAttribute('aria-hidden', 'false');
    sheet.scrollTop = 0;
    const closeBtn = sheet.querySelector('.sheet-close');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function closeExerciseModal() {
    const sheet = document.getElementById('exercise-detail-modal');
    if (!sheet || sheet.classList.contains('is-hidden')) return false;
    sheet.classList.add('is-hidden');
    sheet.setAttribute('aria-hidden', 'true');
    sheet.innerHTML = '';
    return true;
  }

  /* ---------------------------------------------------------------------
     Lecteur de séance
     --------------------------------------------------------------------- */
  function getOverlayKey(session) {
    const step = session.steps[session.currentStepIndex];
    return [
      session.status,
      session.currentStepIndex,
      step.phase,
      step.selectedVariantLevel,
      step.targetValue,
      window.AppStorage.getState().soundMuted
    ].join('|');
  }

  function stepRatio(step) {
    return Math.max(0, step.remainingSeconds / Math.max(1, step.targetValue));
  }

  /**
   * Cada segundo solo cambian el número y la barra: no se reconstruye el DOM.
   */
  function patchLiveTimer(overlay, session) {
    const step = session.steps[session.currentStepIndex];
    const remainingEl = overlay.querySelector('[data-live="remaining"]');
    if (remainingEl) remainingEl.textContent = String(step.remainingSeconds);
    const prepEl = overlay.querySelector('[data-live="prep"]');
    if (prepEl) prepEl.textContent = String(step.prepSeconds);
    const ratioEl = overlay.querySelector('[data-live="ratio"]');
    if (ratioEl) ratioEl.style.setProperty('--ratio', String(stepRatio(step)));
  }

  function renderVictory(session) {
    const ICONS = D().ICONS;
    const actualMin = window.WorkoutEngine.getActiveMinutes(session);

    if (!session.counted) {
      return `
        <div class="victory">
          <div class="victory-title">
            <h2 class="display display-xl">Mobilité <span>faite</span></h2>
            <p class="caps">${actualMin} min</p>
          </div>
          <button type="button" class="btn btn-primary btn-block" data-action="finish-workout" data-rpe="optimal">
            ${ICONS.check}
            <span>Terminer</span>
          </button>
        </div>
      `;
    }

    return `
      <div class="victory">
        <div class="victory-title">
          <h2 class="display display-xl">Séance ${session.template.letter} <span>terminée</span></h2>
          <p class="caps">${actualMin} min · ${session.position.rounds} tours</p>
        </div>
        <div class="rpe">
          <p class="caps">Comment c’était ?</p>
          <button type="button" class="btn btn-outline btn-block" data-action="finish-workout" data-rpe="easy">Trop facile</button>
          <button type="button" class="btn btn-primary btn-block" data-action="finish-workout" data-rpe="optimal">Juste bien</button>
          <button type="button" class="btn btn-outline btn-block" data-action="finish-workout" data-rpe="hard">Trop dur</button>
          <p class="fine-print">Ta réponse ajuste le volume des prochaines séances.</p>
        </div>
      </div>
    `;
  }

  function playerTopHtml(session, step) {
    const ICONS = D().ICONS;
    const workSteps = session.steps.filter((s) => s.stepType === 'work');
    const doneCount = session.steps
      .slice(0, session.currentStepIndex)
      .filter((s) => s.stepType === 'work').length;
    const currentIsWork = step.stepType === 'work';
    const segs = workSteps
      .map((s, i) => {
        const cls = i < doneCount ? 'is-done' : i === doneCount && currentIsWork ? 'is-current' : '';
        return `<span class="seg ${cls}"></span>`;
      })
      .join('');

    return `
      <div class="player-top">
        <div class="segments" aria-hidden="true">${segs}</div>
        <div class="player-top-row">
          <span class="caps">${sectionLabel(step)} · ${step.exerciseIndex}/${step.totalExercises}</span>
          <button type="button" class="icon-btn" data-action="abort-workout" aria-label="Quitter la séance">${ICONS.close}</button>
        </div>
      </div>
    `;
  }

  function renderRestStage(session, step, state) {
    const data = D();
    const ICONS = data.ICONS;
    const nextEx = step.nextExercise;
    const nextLv = step.nextLevel;
    const nextTarget = data.computeTarget(nextEx, nextLv.level, session.ctx.volumeFactor, session.ctx.intensityMultiplier);

    return `
      ${mediaHtml(nextLv.photo, `${nextEx.name} : ${nextLv.label}`, { dim: true, animated: true })}
      ${playerTopHtml(session, step)}
      <div class="player-bottom is-rest">
        <div class="player-text">
          <div class="count">
            <span class="count-num" data-live="remaining">${step.remainingSeconds}</span>
            <span class="count-unit">s</span>
          </div>
        </div>
        <div class="count-track"><div class="count-fill" data-live="ratio" style="--ratio: ${stepRatio(step)}"></div></div>
        <div class="next-up">
          <h2 class="display display-m">${nextEx.name}</h2>
          <p class="caps">${nextLv.label} · ${data.formatTarget(nextTarget, nextLv)}</p>
          <ol class="rest-cues">
            ${nextEx.cues.map((c) => `<li>${c}</li>`).join('')}
          </ol>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-outline" data-action="add-rest-time">+15 s</button>
          <button type="button" class="btn btn-primary" data-action="skip-step">
            ${ICONS.skipForward}
            <span>Passer</span>
          </button>
        </div>
      </div>
    `;
  }

  function renderWorkStage(session, step, state) {
    const data = D();
    const ICONS = data.ICONS;
    const ex = step.exercise;
    const lv = step.levelInfo;
    const isTimer = step.mode === 'timer';
    const hasLevels = Object.keys(ex.levels).length > 1;
    const running = isTimer && (step.phase === 'active' || step.phase === 'paused');

    let countHtml = '';
    let actionHtml = '';

    if (step.phase === 'countdown') {
      countHtml = `
        <div class="count">
          <span class="count-num" data-live="prep">${step.prepSeconds}</span>
        </div>
        <p class="caps count-note">En place</p>
      `;
      actionHtml = `
        <button type="button" class="btn btn-outline btn-block" data-action="toggle-pause">
          ${ICONS.pause}
          <span>Pause</span>
        </button>
      `;
    } else if (isTimer && step.phase === 'ready') {
      countHtml = `
        <div class="count">
          <span class="count-num">${step.targetValue}</span>
          <span class="count-unit">s</span>
        </div>
      `;
      actionHtml = `
        <div class="btn-row">
          <button type="button" class="btn btn-outline" data-action="skip-step">Passer</button>
          <button type="button" class="btn btn-primary" data-action="begin-exercise-timer">
            ${ICONS.play}
            <span>Go</span>
          </button>
        </div>
      `;
    } else if (running) {
      countHtml = `
        <div class="count">
          <span class="count-num" data-live="remaining">${step.remainingSeconds}</span>
          <span class="count-unit">s</span>
        </div>
        <div class="count-track"><div class="count-fill" data-live="ratio" style="--ratio: ${stepRatio(step)}"></div></div>
      `;
      actionHtml = `
        <button type="button" class="btn btn-primary btn-block" data-action="skip-step">
          ${ICONS.check}
          <span>Suivant</span>
        </button>
      `;
    } else {
      countHtml = `
        <div class="count">
          <span class="count-num">${step.targetValue}</span>
          <span class="count-unit">rép.</span>
        </div>
        ${lv.perSide ? '<p class="caps count-note">Par côté</p>' : ''}
      `;
      actionHtml = `
        <button type="button" class="btn btn-primary btn-block" data-action="skip-step">
          ${ICONS.check}
          <span>C’est fait</span>
        </button>
      `;
    }

    const railButtons = [
      running
        ? `<button type="button" class="rail-btn" data-action="toggle-pause" aria-pressed="${step.phase === 'paused'}" aria-label="${step.phase === 'paused' ? 'Reprendre' : 'Pause'}">
            ${step.phase === 'paused' ? ICONS.play : ICONS.pause}
            <span>${step.phase === 'paused' ? 'Reprendre' : 'Pause'}</span>
          </button>
          <button type="button" class="rail-btn" data-action="add-rest-time" aria-label="Ajouter 15 secondes">
            ${ICONS.plus}
            <span>15 s</span>
          </button>`
        : '',
      hasLevels
        ? `<button type="button" class="rail-btn" data-action="cycle-step-variant" aria-label="Changer de variante (niveau ${step.selectedVariantLevel})">
            ${ICONS.sliders}
            <span>Niv. ${step.selectedVariantLevel}</span>
          </button>`
        : '',
      `<button type="button" class="rail-btn" data-action="open-exercise-modal" data-exercise-id="${ex.id}" aria-label="Consignes">
        ${ICONS.info}
        <span>Infos</span>
      </button>`,
      soundRailButton(state)
    ].join('');

    return `
      ${mediaHtml(lv.photo, `${ex.name} : ${lv.label}`, { animated: true })}
      ${playerTopHtml(session, step)}
      <div class="rail">${railButtons}</div>
      <div class="player-bottom">
        <div class="player-text">
          <h2 class="display display-m">${ex.name}</h2>
          <p class="caps">${lv.label}</p>
        </div>
        ${countHtml}
        ${actionHtml}
      </div>
    `;
  }

  function renderWorkoutOverlay(session) {
    const overlay = document.getElementById('workout-player-overlay');
    if (!overlay) return;

    if (!session) {
      lastOverlayKey = null;
      lastStepIndex = -1;
      overlay.classList.add('is-hidden');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = '';
      return;
    }

    const overlayKey = getOverlayKey(session);
    if (overlayKey === lastOverlayKey) {
      patchLiveTimer(overlay, session);
      return;
    }
    lastOverlayKey = overlayKey;

    overlay.classList.remove('is-hidden');
    overlay.setAttribute('aria-hidden', 'false');

    if (session.status === 'completed') {
      overlay.innerHTML = renderVictory(session);
      lastStepIndex = -1;
      return;
    }

    const state = window.AppStorage.getState();
    const step = session.steps[session.currentStepIndex];
    let anim = '';
    if (lastStepIndex !== -1 && session.currentStepIndex !== lastStepIndex) {
      anim = session.currentStepIndex > lastStepIndex ? 'snap-in-up' : 'snap-in-down';
    } else if (lastStepIndex === -1) {
      anim = 'snap-in-up';
    }
    lastStepIndex = session.currentStepIndex;

    const body = step.stepType === 'rest' ? renderRestStage(session, step, state) : renderWorkStage(session, step, state);
    overlay.innerHTML = `<div class="stage ${anim}">${body}</div>`;
  }

  /* ---------------------------------------------------------------------
     Divers
     --------------------------------------------------------------------- */
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById('app-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function renderAll() {
    const state = window.AppStorage.getState();
    applyAudioState(state);

    document.querySelectorAll('.tab-btn[data-view]').forEach((btn) => {
      const target = btn.getAttribute('data-view');
      btn.classList.toggle('is-active', target === currentView);
      if (target === currentView) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });

    document.querySelectorAll('.app-view').forEach((section) => {
      section.classList.toggle('is-hidden', section.id !== `view-${currentView}`);
    });

    if (currentView === 'dashboard') renderDashboardView(state);
    if (currentView === 'exercises') renderExercisesView(state);
  }

  function finishWorkout(rpe, fromHistory) {
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
    if (!fromHistory) popLayer('player');
    const home = document.getElementById('view-dashboard');
    if (home) home.scrollTop = 0;
    renderAll();

    if (levelUp) {
      showToast(`Cycle bouclé · niveau ${state.fitnessLevel}`);
    } else if (cycleCompleted) {
      showToast('Cycle bouclé');
    } else if (session.counted) {
      const next = window.AppData.getProgramPosition(state.programSessionIndex);
      showToast(`Validée · prochaine : séance ${window.AppData.getTemplateById(next.templateId).letter}`);
    } else {
      showToast('Mobilité faite');
    }
  }

  function abortWithConfirm() {
    const session = window.WorkoutEngine.getActiveSession();
    const hasProgress =
      session && (session.currentStepIndex > 0 || session.steps[0].phase !== 'ready');
    if (hasProgress && !window.confirm('Quitter la séance ? Elle ne sera pas validée.')) {
      return false;
    }
    window.WorkoutEngine.abortWorkout();
    renderWorkoutOverlay(null);
    return true;
  }

  /* ---------------------------------------------------------------------
     Marche : chrono basé sur l’heure réelle, sauvegardé pour survivre à
     l’écran verrouillé et au rechargement de la page.
     --------------------------------------------------------------------- */
  const WALK_KEY = 'elan_walk_v1';
  let walkTimer = null;

  function loadWalk() {
    try {
      return JSON.parse(window.localStorage.getItem(WALK_KEY)) || null;
    } catch (error) {
      return null;
    }
  }

  function saveWalk(walk) {
    try {
      if (walk) window.localStorage.setItem(WALK_KEY, JSON.stringify(walk));
      else window.localStorage.removeItem(WALK_KEY);
    } catch (error) {
      window.AppLogger.error({ error: String(error) }, 'Failed to persist walk');
    }
  }

  function walkElapsedMs(walk) {
    const end = walk.pausedAt || Date.now();
    return Math.max(0, end - walk.startedAt - walk.pausedMs);
  }

  function formatClock(ms) {
    const total = Math.floor(ms / 1000);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }

  function isWalkOpen() {
    const layer = document.getElementById('walk-layer');
    return Boolean(layer && !layer.classList.contains('is-hidden'));
  }

  function tickWalk() {
    const walk = loadWalk();
    const layer = document.getElementById('walk-layer');
    if (!walk || !layer) return;
    const targetMs = D().WALK_TARGET_MIN * 60000;
    const ms = walkElapsedMs(walk);
    const clock = layer.querySelector('[data-walk="clock"]');
    const ratio = layer.querySelector('[data-walk="ratio"]');
    const status = layer.querySelector('[data-walk="status"]');
    if (clock) clock.textContent = formatClock(ms);
    if (ratio) ratio.style.setProperty('--ratio', String(Math.min(1, ms / targetMs)));
    if (status) {
      if (walk.pausedAt) status.textContent = 'En pause';
      else if (ms >= targetMs) status.textContent = 'Objectif atteint · continue si tu veux';
      else status.textContent = `Encore ${Math.ceil((targetMs - ms) / 60000)} min`;
    }
    if (!walk.notified && ms >= targetMs) {
      walk.notified = true;
      saveWalk(walk);
      window.AudioFeedback.playVictory();
      showToast(`${D().WALK_TARGET_MIN} min, bravo`);
    }
  }

  function renderWalkLayer() {
    const layer = document.getElementById('walk-layer');
    if (!layer) return;
    const walk = loadWalk();
    clearInterval(walkTimer);
    walkTimer = null;

    if (!walk) {
      layer.classList.add('is-hidden');
      layer.setAttribute('aria-hidden', 'true');
      layer.innerHTML = '';
      return;
    }

    const ICONS = D().ICONS;
    layer.classList.remove('is-hidden');
    layer.setAttribute('aria-hidden', 'false');
    layer.innerHTML = `
      <div class="stage">
        <div class="player-top">
          <div class="player-top-row">
            <span class="caps">Marche · objectif ${D().WALK_TARGET_MIN} min</span>
            <button type="button" class="icon-btn" data-action="walk-close" aria-label="Terminer la marche">${ICONS.close}</button>
          </div>
        </div>
        <div class="player-bottom walk-bottom">
          ${treadmillPanelHtml()}
          <p class="caps" data-walk="status"></p>
          <div class="count"><span class="count-num" data-walk="clock">0:00</span></div>
          <div class="count-track"><div class="count-fill" data-walk="ratio"></div></div>
          <p class="fine-print">Tu peux verrouiller le téléphone : le chrono continue.</p>
          <div class="btn-row">
            <button type="button" class="btn btn-outline" data-action="walk-toggle">${walk.pausedAt ? 'Reprendre' : 'Pause'}</button>
            <button type="button" class="btn btn-primary" data-action="walk-finish">
              ${ICONS.check}
              <span>Terminer</span>
            </button>
          </div>
        </div>
      </div>
    `;
    tickWalk();
    walkTimer = setInterval(tickWalk, 1000);
  }

  function startWalk() {
    if (!loadWalk()) {
      saveWalk({ startedAt: Date.now(), pausedMs: 0, pausedAt: null, notified: false });
    }
    pushLayer('walk');
    renderWalkLayer();
  }

  function toggleWalkPause() {
    const walk = loadWalk();
    if (!walk) return;
    if (walk.pausedAt) {
      walk.pausedMs += Date.now() - walk.pausedAt;
      walk.pausedAt = null;
    } else {
      walk.pausedAt = Date.now();
    }
    saveWalk(walk);
    renderWalkLayer();
  }

  function logWalk(minutes, extra) {
    window.AppStorage.recordWalk(minutes, extra);
    const home = document.getElementById('view-dashboard');
    if (home) home.scrollTop = 0;
    renderAll();
    showToast(`Marche enregistrée · ${Math.max(1, Math.round(minutes))} min`);
  }

  function finishWalk(fromHistory) {
    const walk = loadWalk();
    if (!walk) return;
    const minutes = walkElapsedMs(walk) / 60000;
    const totals = walkTreadmillTotals(walk);
    const T = window.Treadmill;
    if (T && T.getState().phase === 'ready' && T.getState().running) {
      T.stop().catch(() => {});
    }
    saveWalk(null);
    renderWalkLayer();
    if (!fromHistory) popLayer('walk');
    if (minutes >= 1) logWalk(minutes, totals.distanceM ? totals : null);
    else showToast('Moins d’une minute : non enregistrée');
  }

  // Fermer la marche : on propose de l’enregistrer ; renvoie true si la couche est fermée
  function closeWalkWithConfirm(fromHistory) {
    const walk = loadWalk();
    if (!walk) return true;
    if (walkElapsedMs(walk) >= 60000 && !window.confirm('Terminer la marche et l’enregistrer ?')) {
      return false;
    }
    finishWalk(fromHistory);
    return true;
  }

  /* ---------------------------------------------------------------------
     Tapis WalkingPad (Bluetooth) dans l’écran de marche
     --------------------------------------------------------------------- */
  let showTreadmillLog = false;

  function formatKm(meters) {
    return `${(meters / 1000).toFixed(2).replace('.', ',')} km`;
  }

  function walkTreadmillTotals(walk) {
    const acc = (walk && walk.tm) || { baseDist: 0, baseSteps: 0, lastDist: 0, lastSteps: 0 };
    return { distanceM: acc.baseDist + acc.lastDist, steps: acc.baseSteps + acc.lastSteps };
  }

  // Les compteurs du tapis repartent de zéro à chaque arrêt : on cumule pour la marche en cours
  function accumulateTreadmill(tm) {
    const walk = loadWalk();
    if (!walk || !tm.hasTelemetry) return;
    const acc = walk.tm || { baseDist: 0, baseSteps: 0, lastDist: 0, lastSteps: 0 };
    if (tm.distanceM + 5 < acc.lastDist) acc.baseDist += acc.lastDist;
    if (tm.steps + 5 < acc.lastSteps) acc.baseSteps += acc.lastSteps;
    acc.lastDist = tm.distanceM;
    acc.lastSteps = tm.steps;
    walk.tm = acc;
    saveWalk(walk);
  }

  function treadmillPanelHtml() {
    const T = window.Treadmill;
    if (!T || !T.isSupported()) return '';
    const ICONS = D().ICONS;
    const tm = T.getState();
    const logHtml = showTreadmillLog
      ? `<div class="tm-log">
          <pre>${T.getLog().join('\n') || 'Rien pour l’instant.'}</pre>
          <button type="button" class="btn btn-outline btn-block" data-action="tm-copy-log">Copier le journal</button>
        </div>`
      : '';
    const logLink = `<button type="button" class="tm-log-link" data-action="tm-toggle-log">${showTreadmillLog ? 'Masquer' : 'Journal Bluetooth'}</button>`;

    if (tm.phase === 'connecting') {
      return `<div class="tm-panel"><p class="caps">Connexion au tapis…</p>${logLink}${logHtml}</div>`;
    }

    if (tm.phase !== 'ready') {
      return `
        <div class="tm-panel">
          <button type="button" class="btn btn-outline btn-block" data-action="tm-connect">
            ${ICONS.bluetooth}
            <span>Connecter le tapis</span>
          </button>
          ${tm.error ? `<p class="tm-error">${tm.error}</p>` : ''}
          ${logLink}${logHtml}
        </div>
      `;
    }

    const totals = walkTreadmillTotals(loadWalk());
    return `
      <div class="tm-panel">
        <div class="tm-live">
          <span class="tm-speed"><span data-tm="speed">${tm.speedKmh.toFixed(1).replace('.', ',')}</span> <span class="caps">km/h</span></span>
          <span class="caps" data-tm="meta">${formatKm(totals.distanceM)} · ${totals.steps} pas</span>
        </div>
        <div class="tm-controls">
          <button type="button" class="btn btn-outline tm-step" data-action="tm-slower" aria-label="Moins vite">${ICONS.minus}</button>
          <button type="button" class="btn ${tm.running ? 'btn-outline' : 'btn-primary'} tm-main" data-action="tm-toggle">
            ${tm.running ? 'Arrêter' : 'Démarrer'}
          </button>
          <button type="button" class="btn btn-outline tm-step" data-action="tm-faster" aria-label="Plus vite">${ICONS.plus}</button>
        </div>
        ${logLink}${logHtml}
      </div>
    `;
  }

  function patchTreadmillLive() {
    const layer = document.getElementById('walk-layer');
    if (!layer) return;
    const tm = window.Treadmill.getState();
    const speed = layer.querySelector('[data-tm="speed"]');
    const meta = layer.querySelector('[data-tm="meta"]');
    const totals = walkTreadmillTotals(loadWalk());
    if (speed) speed.textContent = tm.speedKmh.toFixed(1).replace('.', ',');
    if (meta) meta.textContent = `${formatKm(totals.distanceM)} · ${totals.steps} pas`;
  }

  async function treadmillAction(run) {
    try {
      await run();
    } catch (error) {
      showToast(`Tapis : ${(error && error.message) || error}`);
    }
    if (isWalkOpen()) renderWalkLayer();
  }

  function bindTreadmill() {
    if (!window.Treadmill) return;
    window.Treadmill.subscribe((kind, tm) => {
      if (kind === 'telemetry') accumulateTreadmill(tm);
      if (!isWalkOpen()) return;
      if (kind === 'telemetry') patchTreadmillLive();
      else renderWalkLayer();
    });
  }

  function handleTreadmillClick(action) {
    const T = window.Treadmill;
    const tm = T.getState();
    if (action === 'tm-connect') {
      treadmillAction(() => T.connect());
    } else if (action === 'tm-toggle') {
      window.AudioFeedback.playTap();
      // Le tapis démarre à sa vitesse minimale : on accélère ensuite avec +
      treadmillAction(() => (tm.running ? T.pause() : T.start()));
    } else if (action === 'tm-faster' || action === 'tm-slower') {
      window.AudioFeedback.playTap();
      const base = tm.targetKmh || tm.speedKmh || tm.minKmh;
      const next = base + (action === 'tm-faster' ? 0.5 : -0.5);
      treadmillAction(async () => {
        const applied = await T.setSpeed(next);
        showToast(`${applied.toFixed(1).replace('.', ',')} km/h`);
      });
    } else if (action === 'tm-toggle-log') {
      showTreadmillLog = !showTreadmillLog;
      renderWalkLayer();
    } else if (action === 'tm-copy-log') {
      const text = T.getLog().join('\n');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(
          () => showToast('Journal copié'),
          () => showToast('Copie impossible')
        );
      }
    }
  }

  /* ---------------------------------------------------------------------
     Historial : le bouton « retour » d’Android ferme la couche du dessus
     (fiche, séance, onglet Exercices) au lieu de quitter l’application.
     --------------------------------------------------------------------- */
  let exitArmedTimer = null;

  function currentLayer() {
    return (window.history.state && window.history.state.elan) || null;
  }

  function pushLayer(layer) {
    window.history.pushState({ elan: layer }, '');
  }

  // Cierre desde la interfaz: se consume la entrada del historial; popstate no encontrará nada que cerrar
  function popLayer(layer) {
    if (currentLayer() === layer) window.history.back();
  }

  function isSheetOpen() {
    const sheet = document.getElementById('exercise-detail-modal');
    return Boolean(sheet && !sheet.classList.contains('is-hidden'));
  }

  function handlePopState(event) {
    const target = (event.state && event.state.elan) || null;

    if (isSheetOpen() && target !== 'sheet') {
      closeExerciseModal();
      return;
    }

    if (isWalkOpen() && target !== 'walk') {
      if (!closeWalkWithConfirm(true)) pushLayer('walk');
      return;
    }

    const session = window.WorkoutEngine.getActiveSession();
    if (session && target !== 'player' && target !== 'sheet') {
      if (session.status === 'completed') {
        // Volver desde la pantalla final valida la sesión con un esfuerzo «juste bien»
        finishWorkout('optimal', true);
      } else if (!abortWithConfirm()) {
        pushLayer('player');
      }
      return;
    }

    if (currentView !== 'dashboard' && target !== 'exercises') {
      currentView = 'dashboard';
      renderAll();
      return;
    }

    if (target) return;

    // Raíz : d’abord remonter en haut du fil, puis demander un second « retour » pour quitter
    const home = document.getElementById('view-dashboard');
    if (home && home.scrollTop > 10) {
      home.scrollTo({ top: 0, behavior: 'instant' });
      pushLayer('guard');
      return;
    }
    showToast('Appuie encore sur retour pour quitter');
    clearTimeout(exitArmedTimer);
    exitArmedTimer = setTimeout(() => {
      if (!currentLayer()) pushLayer('guard');
    }, 2500);
  }

  function initHistory() {
    if (currentLayer()) window.history.replaceState({ elan: 'guard' }, '');
    else pushLayer('guard');
    window.addEventListener('popstate', handlePopState);
    // Une marche en cours (écran rechargé, app rouverte) reprend là où elle en était
    if (loadWalk()) {
      pushLayer('walk');
      renderWalkLayer();
    }
  }

  function cycleStepVariant() {
    const session = window.WorkoutEngine.getActiveSession();
    if (!session) return;
    const step = session.steps[session.currentStepIndex];
    if (!step || step.stepType !== 'work') return;
    const levels = Object.keys(step.exercise.levels).map(Number);
    const idx = levels.indexOf(step.selectedVariantLevel);
    const next = levels[(idx + 1) % levels.length];
    window.WorkoutEngine.setCurrentStepVariant(next);
    showToast(`Niveau ${next} · ${step.exercise.levels[next].label}`);
  }

  function isPlayerOpen() {
    const session = window.WorkoutEngine.getActiveSession();
    return Boolean(session && session.status !== 'completed');
  }

  /**
   * Gesto vertical en el reproductor: hacia arriba pasa al siguiente momento, hacia abajo vuelve.
   */
  function bindPlayerGestures() {
    const overlay = document.getElementById('workout-player-overlay');
    if (!overlay) return;
    let startY = null;
    let startX = null;

    overlay.addEventListener(
      'touchstart',
      (e) => {
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
      },
      { passive: true }
    );

    overlay.addEventListener('touchend', (e) => {
      if (startY === null || !isPlayerOpen()) return;
      const dy = e.changedTouches[0].clientY - startY;
      const dx = e.changedTouches[0].clientX - startX;
      startY = null;
      if (Math.abs(dy) < 70 || Math.abs(dy) < Math.abs(dx) * 1.5) return;
      if (dy < 0) window.WorkoutEngine.completeCurrentStep();
      else window.WorkoutEngine.stepPrevExercise();
    });
  }

  function bindEvents() {
    document.addEventListener('click', (event) => {
      const navBtn = event.target.closest('[data-view]');
      if (navBtn) {
        window.AudioFeedback.playTap();
        const nextView = navBtn.getAttribute('data-view');
        if (nextView === currentView) return;
        currentView = nextView;
        if (nextView === 'exercises') pushLayer('exercises');
        else popLayer('exercises');
        renderAll();
        return;
      }

      const actionBtn = event.target.closest('[data-action]');
      if (!actionBtn) return;
      const action = actionBtn.getAttribute('data-action');

      if (action === 'cycle-level') {
        window.AudioFeedback.playTap();
        const current = window.AppStorage.getState().fitnessLevel;
        const fitnessLevel = (current % 3) + 1;
        window.AppStorage.updatePreferences({ fitnessLevel });
        renderAll();
        showToast(`Niveau ${fitnessLevel}`);
      } else if (action === 'toggle-sound') {
        const current = window.AppStorage.getState();
        const state = window.AppStorage.updatePreferences({ soundMuted: !current.soundMuted });
        applyAudioState(state);
        if (currentView === 'dashboard') renderDashboardView(state);
        const session = window.WorkoutEngine.getActiveSession();
        if (session) renderWorkoutOverlay(session);
      } else if (action === 'scroll-to-progress') {
        const target = document.getElementById('feed-progress');
        const home = document.getElementById('view-dashboard');
        if (target && home) home.scrollTo({ top: target.offsetTop, behavior: 'instant' });
      } else if (action === 'start-workout') {
        window.WorkoutEngine.startWorkout(actionBtn.getAttribute('data-template-id'));
        pushLayer('player');
      } else if (action.indexOf('tm-') === 0) {
        handleTreadmillClick(action);
      } else if (action === 'walk-start') {
        window.AudioFeedback.playTap();
        startWalk();
      } else if (action === 'walk-log') {
        logWalk(window.AppData.WALK_TARGET_MIN);
      } else if (action === 'walk-toggle') {
        window.AudioFeedback.playTap();
        toggleWalkPause();
      } else if (action === 'walk-finish') {
        finishWalk(false);
      } else if (action === 'walk-close') {
        closeWalkWithConfirm(false);
      } else if (action === 'begin-exercise-timer') {
        window.WorkoutEngine.beginCurrentExerciseTimer();
      } else if (action === 'cycle-step-variant') {
        window.AudioFeedback.playTap();
        cycleStepVariant();
      } else if (action === 'toggle-pause') {
        window.AudioFeedback.playTap();
        window.WorkoutEngine.togglePause();
      } else if (action === 'skip-step') {
        window.WorkoutEngine.completeCurrentStep();
      } else if (action === 'add-rest-time') {
        window.AudioFeedback.playTap();
        window.WorkoutEngine.addRestSeconds(15);
      } else if (action === 'abort-workout') {
        if (abortWithConfirm()) popLayer('player');
      } else if (action === 'finish-workout') {
        finishWorkout(actionBtn.getAttribute('data-rpe'));
      } else if (action === 'filter-exercises') {
        currentExerciseFilter = actionBtn.getAttribute('data-category');
        renderExercisesView(window.AppStorage.getState());
      } else if (action === 'open-exercise-modal') {
        if (!isSheetOpen()) pushLayer('sheet');
        openExerciseDetailModal(actionBtn.getAttribute('data-exercise-id'));
      } else if (action === 'close-exercise-modal') {
        closeExerciseModal();
        popLayer('sheet');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (closeExerciseModal()) {
          popLayer('sheet');
          return;
        }
        if (isWalkOpen()) {
          closeWalkWithConfirm(false);
          return;
        }
        if (isPlayerOpen() && abortWithConfirm()) popLayer('player');
        return;
      }
      const sheetOpen = !document.getElementById('exercise-detail-modal').classList.contains('is-hidden');
      if (!isPlayerOpen() || sheetOpen) return;
      if (event.target.closest && event.target.closest('button, a')) return;
      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        window.WorkoutEngine.completeCurrentStep();
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        window.WorkoutEngine.stepPrevExercise();
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

    bindPlayerGestures();
  }

  return {
    init() {
      window.WorkoutEngine.subscribe((session) => {
        renderWorkoutOverlay(session);
      });
      bindEvents();
      bindTreadmill();
      initHistory();
      renderAll();
    }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  window.AppController.init();
});
