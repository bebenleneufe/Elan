/**
 * Se aísla la persistencia en LocalStorage dentro de este repositorio de estado para
 * desacoplar la interfaz gráfica del almacenamiento y tolerar fallos de cuota o privacidad.
 */
window.AppStorage = (function createAppStorage() {
  const STORAGE_KEY = 'elancorps_30plus_state_v1';

  function getTodayDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getDefaultState() {
    return {
      userName: 'Alex',
      age: 30,
      fitnessLevel: 1, // 1: Reprise Douce, 2: Tonique, 3: Athlétique
      intensityMultiplier: 1.0,
      xp: 150,
      streak: 1,
      bestStreak: 1,
      lastActiveDate: getTodayDateString(),
      totalWorkouts: 0,
      totalMinutes: 0,
      totalCalories: 0,
      currentProgramDay: 1,
      completedProgramDays: [],
      completedQuestsByDate: {},
      dailyCheckinByDate: {},
      workoutHistory: [],
      unlockedBadges: [],
      theme: 'light',
      soundMuted: false
    };
  }

  /**
   * Se calcula la diferencia de días calendario entre la última actividad y hoy
   * para mantener o reiniciar la racha diaria de forma justa.
   */
  function reconcileStreak(state) {
    const today = getTodayDateString();
    if (!state.lastActiveDate) {
      state.lastActiveDate = today;
      return state;
    }

    if (state.lastActiveDate === today) {
      return state;
    }

    const lastDate = new Date(`${state.lastActiveDate}T00:00:00`);
    const currentDate = new Date(`${today}T00:00:00`);
    const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      // Se reinicia a 0 si se saltó más de un día completo sin registrar actividad
      state.streak = 0;
    }
    return state;
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = getDefaultState();
        saveState(initial);
        return initial;
      }
      const parsed = JSON.parse(raw);
      const merged = Object.assign({}, getDefaultState(), parsed);
      return reconcileStreak(merged);
    } catch (error) {
      window.AppLogger.error({ error: String(error) }, 'Failed to load state from localStorage');
      return getDefaultState();
    }
  }

  function saveState(newState) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      window.AppLogger.error({ error: String(error) }, 'Failed to save state to localStorage');
    }
  }

  /**
   * Se actualiza la racha cuando el usuario completa una sesión o un hábito diario,
   * premiando la constancia cotidiana.
   */
  function markActiveToday(state) {
    const today = getTodayDateString();
    if (state.lastActiveDate !== today) {
      const lastDate = new Date(`${state.lastActiveDate}T00:00:00`);
      const currentDate = new Date(`${today}T00:00:00`);
      const diffDays = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        state.streak += 1;
      } else {
        state.streak = Math.max(1, state.streak);
      }
      state.lastActiveDate = today;
    } else if (state.streak === 0) {
      state.streak = 1;
    }

    if (state.streak > state.bestStreak) {
      state.bestStreak = state.streak;
    }
  }

  /**
   * Se verifica el desbloqueo de insignias tras cada logro para ofrecer retroalimentación inmediata.
   */
  function evaluateBadges(state) {
    const newlyUnlocked = [];
    window.AppData.BADGES.forEach((badge) => {
      if (!state.unlockedBadges.includes(badge.id) && badge.condition(state)) {
        state.unlockedBadges.push(badge.id);
        newlyUnlocked.push(badge);
      }
    });
    return newlyUnlocked;
  }

  return {
    getTodayDateString,
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
    recordDailyCheckin(feelingId) {
      const state = loadState();
      const today = getTodayDateString();
      state.dailyCheckinByDate[today] = feelingId;
      saveState(state);
      window.AppLogger.info({ feelingId }, 'Daily check-in recorded');
      return state;
    },
    toggleDailyQuest(questId, xpReward) {
      const state = loadState();
      const today = getTodayDateString();
      if (!state.completedQuestsByDate[today]) {
        state.completedQuestsByDate[today] = [];
      }

      const list = state.completedQuestsByDate[today];
      const idx = list.indexOf(questId);
      let completed = false;

      if (idx === -1) {
        list.push(questId);
        state.xp += xpReward;
        markActiveToday(state);
        completed = true;
      } else {
        list.splice(idx, 1);
        state.xp = Math.max(0, state.xp - xpReward);
      }

      const newBadges = evaluateBadges(state);
      saveState(state);
      window.AppLogger.info({ questId, completed }, 'Daily quest toggled');
      return { state, completed, newBadges };
    },
    recordCompletedWorkout(workoutSummary) {
      const state = loadState();
      const today = getTodayDateString();

      state.totalWorkouts += 1;
      state.totalMinutes += workoutSummary.durationMin;
      state.totalCalories += workoutSummary.caloriesEst;
      state.xp += workoutSummary.xpEarned;

      markActiveToday(state);

      if (workoutSummary.programDay) {
        if (!state.completedProgramDays.includes(workoutSummary.programDay)) {
          state.completedProgramDays.push(workoutSummary.programDay);
        }
        if (workoutSummary.programDay >= state.currentProgramDay && state.currentProgramDay < 28) {
          state.currentProgramDay = workoutSummary.programDay + 1;
        }
      }

      /**
       * Se ajusta automáticamente el multiplicador de volumen según la percepción del esfuerzo (RPE)
       * para evitar lesiones por sobrecarga o aburrimiento por sesiones demasiado fáciles.
       */
      if (workoutSummary.rpe === 'easy') {
        state.intensityMultiplier = Math.min(1.4, Number((state.intensityMultiplier + 0.08).toFixed(2)));
      } else if (workoutSummary.rpe === 'hard') {
        state.intensityMultiplier = Math.max(0.75, Number((state.intensityMultiplier - 0.08).toFixed(2)));
      }

      state.workoutHistory.unshift({
        id: `wk-${Date.now()}`,
        date: today,
        timestamp: new Date().toISOString(),
        title: workoutSummary.title,
        durationMin: workoutSummary.durationMin,
        caloriesEst: workoutSummary.caloriesEst,
        xpEarned: workoutSummary.xpEarned,
        rpe: workoutSummary.rpe || 'optimal'
      });

      // Se conservan las últimas 50 sesiones para mantener el almacenamiento ligero
      state.workoutHistory = state.workoutHistory.slice(0, 50);

      const newBadges = evaluateBadges(state);
      saveState(state);
      window.AppLogger.info(
        { id: workoutSummary.title, rpe: workoutSummary.rpe, totalWorkouts: state.totalWorkouts },
        'Workout session recorded'
      );

      return { state, newBadges };
    },
    resetProgress() {
      const fresh = getDefaultState();
      saveState(fresh);
      window.AppLogger.info({ id: 'reset' }, 'User progress reset to defaults');
      return fresh;
    }
  };
})();
