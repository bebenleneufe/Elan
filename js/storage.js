/**
 * Se aísla la persistencia en LocalStorage dentro de este repositorio de estado para
 * desacoplar la interfaz gráfica del almacenamiento y tolerar fallos de cuota o privacidad.
 */
window.AppStorage = (function createAppStorage() {
  const STORAGE_KEY = 'elancorps_30plus_state_v1';
  const HISTORY_LIMIT = 300;

  function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getTodayDateString() {
    return toDateString(new Date());
  }

  function getDefaultState() {
    return {
      fitnessLevel: 1, // 1: Reprise douce, 2: Intermédiaire, 3: Confirmé
      intensityMultiplier: 1.0,
      programSessionIndex: 0, // Sesiones del programa completadas (define ciclo, semana y sesión)
      cycleHardCount: 0, // Sesiones juzgadas "intensas" en el ciclo en curso
      totalWorkouts: 0,
      totalWalks: 0,
      walkSpeedOffset: 0, // Ajuste personal de las velocidades de marcha (km/h)
      totalMinutes: 0,
      lastActiveDate: null,
      workoutHistory: [],
      theme: 'light',
      soundMuted: false
    };
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = getDefaultState();
        saveState(initial);
        return initial;
      }
      const state = Object.assign({}, getDefaultState(), JSON.parse(raw));
      if (repairForgottenWalks(state)) saveState(state);
      return state;
    } catch (error) {
      window.AppLogger.error({ error: String(error) }, 'Failed to load state from localStorage');
      return getDefaultState();
    }
  }

  /**
   * Una marcha olvidada abierta (sin pulsar «Terminer») se guardaba con la fecha del día en que
   * se cerró y una duración de varias horas. Se devuelve al día en que empezó, limitada a 30 min.
   */
  const MAX_WALK_MIN = 180;
  const FORGOTTEN_WALK_MIN = 30;

  function repairForgottenWalks(state) {
    let changed = false;
    state.workoutHistory.forEach((h) => {
      if (h.templateId !== 'marche' || !(h.durationMin > MAX_WALK_MIN) || !h.timestamp) return;
      const startMs = Date.parse(h.timestamp) - h.durationMin * 60000;
      if (Number.isNaN(startMs)) return;
      state.totalMinutes = Math.max(0, state.totalMinutes - (h.durationMin - FORGOTTEN_WALK_MIN));
      h.date = toDateString(new Date(startMs));
      h.durationMin = FORGOTTEN_WALK_MIN;
      h.repaired = true;
      changed = true;
    });
    if (changed) {
      state.workoutHistory.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      window.AppLogger.info({}, 'Forgotten walk entries repaired');
    }
    return changed;
  }

  function saveState(newState) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      window.AppLogger.error({ error: String(error) }, 'Failed to save state to localStorage');
    }
  }

  function getMondayOf(date) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
  }

  /**
   * Se cuenta la racha en semanas (no en días): con 3 sesiones semanales, los días de descanso
   * forman parte del programa y no deben romper la serie. La semana en curso sin sesión aún
   * no la rompe.
   */
  function getWeeklyStreak(state) {
    const activeWeeks = new Set(
      state.workoutHistory.map((h) => toDateString(getMondayOf(new Date(`${h.date}T00:00:00`))))
    );
    const cursor = getMondayOf(new Date());
    if (!activeWeeks.has(toDateString(cursor))) {
      cursor.setDate(cursor.getDate() - 7);
    }
    let streak = 0;
    while (activeWeeks.has(toDateString(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 7);
    }
    return streak;
  }

  function isStrengthEntry(h) {
    return h.counted !== false && h.templateId !== 'marche' && h.templateId !== 'mobilite';
  }

  function isWalkEntry(h) {
    return h.templateId === 'marche';
  }

  /**
   * Se alterna día de sesión y día de marcha según lo hecho la víspera, sin depender del calendario:
   * - sesión hecha ayer → hoy marcha; marcha (o nada) ayer → hoy sesión;
   * - tras 6 días activos seguidos → hoy descanso;
   * - si hoy ya se hizo algo, se indica qué toca mañana.
   */
  function getDayPlan(state) {
    const today = getTodayDateString();
    const history = state.workoutHistory;
    const todays = history.filter((h) => h.date === today);

    if (todays.some(isStrengthEntry)) return { kind: 'done', did: 'strength', next: 'walk' };
    if (todays.some(isWalkEntry)) return { kind: 'done', did: 'walk', next: 'strength' };

    const activeDates = new Set(history.map((h) => h.date));
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - 1);
    const yesterday = toDateString(cursor);
    let activeStreak = 0;
    while (activeDates.has(toDateString(cursor))) {
      activeStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    if (activeStreak >= 6) return { kind: 'rest', next: 'strength' };

    // Una sesión ayer manda, aunque también se haya caminado ese día: los músculos necesitan ~48 h
    if (history.some((h) => h.date === yesterday && isStrengthEntry(h))) {
      return { kind: 'walk', next: 'strength' };
    }
    return { kind: 'strength', next: 'walk' };
  }

  function getWeekActivity(state) {
    const monday = getMondayOf(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = toDateString(d);
      const entries = state.workoutHistory.filter((h) => h.date === iso);
      return {
        date: iso,
        isToday: iso === getTodayDateString(),
        strength: entries.some(isStrengthEntry),
        walk: entries.some(isWalkEntry),
        any: entries.length > 0
      };
    });
  }

  function countSessionsThisWeek(state) {
    const monday = toDateString(getMondayOf(new Date()));
    return state.workoutHistory.filter((h) => h.counted !== false && h.date >= monday).length;
  }

  return {
    getTodayDateString,
    toDateString,
    getWeeklyStreak,
    countSessionsThisWeek,
    getDayPlan,
    getWeekActivity,
    getState() {
      return loadState();
    },
    updatePreferences(updates) {
      const state = loadState();
      Object.assign(state, updates);
      saveState(state);
      window.AppLogger.info({ fitnessLevel: state.fitnessLevel, theme: state.theme }, 'User preferences updated');
      return state;
    },
    /**
     * Se registra la sesión, se avanza en el programa y se adapta el volumen según el esfuerzo
     * percibido. Al cerrar un ciclo sin sesiones "intensas", se sube automáticamente de nivel.
     */
    recordCompletedWorkout(summary) {
      const state = loadState();
      let levelUp = false;
      let cycleCompleted = false;

      state.totalWorkouts += 1;
      state.totalMinutes += summary.durationMin;
      state.lastActiveDate = getTodayDateString();

      if (summary.counted) {
        const position = window.AppData.getProgramPosition(state.programSessionIndex);
        state.programSessionIndex += 1;

        if (summary.rpe === 'easy') {
          state.intensityMultiplier = Math.min(1.4, Number((state.intensityMultiplier + 0.08).toFixed(2)));
        } else if (summary.rpe === 'hard') {
          state.intensityMultiplier = Math.max(0.75, Number((state.intensityMultiplier - 0.08).toFixed(2)));
          state.cycleHardCount += 1;
        }

        if (position.isLastOfCycle) {
          cycleCompleted = true;
          if (state.cycleHardCount === 0 && state.fitnessLevel < 3) {
            state.fitnessLevel += 1;
            // Nuevo nivel = variantes más difíciles: se reinicia el ajuste fino de volumen
            state.intensityMultiplier = 1.0;
            levelUp = true;
          }
          state.cycleHardCount = 0;
        }
      }

      state.workoutHistory.unshift({
        id: `wk-${Date.now()}`,
        date: getTodayDateString(),
        timestamp: new Date().toISOString(),
        templateId: summary.templateId,
        title: summary.title,
        durationMin: summary.durationMin,
        counted: Boolean(summary.counted),
        rpe: summary.rpe || 'optimal'
      });
      state.workoutHistory = state.workoutHistory.slice(0, HISTORY_LIMIT);

      saveState(state);
      window.AppLogger.info(
        { templateId: summary.templateId, rpe: summary.rpe, sessionIndex: state.programSessionIndex },
        'Workout session recorded'
      );

      return { state, levelUp, cycleCompleted };
    },
    recordWalk(minutes, extra) {
      const state = loadState();
      const more = extra || {};
      const durationMin = Math.max(1, Math.round(minutes));
      state.totalWalks = (state.totalWalks || 0) + 1;
      state.totalMinutes += durationMin;
      state.lastActiveDate = getTodayDateString();
      state.workoutHistory.unshift({
        id: `wk-${Date.now()}`,
        date: more.date || getTodayDateString(),
        timestamp: new Date().toISOString(),
        templateId: 'marche',
        title: 'Marche',
        durationMin,
        distanceM: more.distanceM || undefined,
        steps: more.steps || undefined,
        counted: false,
        rpe: 'optimal'
      });
      state.workoutHistory.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      state.workoutHistory = state.workoutHistory.slice(0, HISTORY_LIMIT);
      saveState(state);
      window.AppLogger.info({ durationMin, distanceM: more.distanceM }, 'Walk recorded');
      return state;
    },
    resetProgress() {
      const fresh = getDefaultState();
      saveState(fresh);
      window.AppLogger.info({ id: 'reset' }, 'User progress reset to defaults');
      return fresh;
    }
  };
})();
