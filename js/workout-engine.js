/**
 * Se rediseña el motor de entrenamiento con una fase explícita de "Observación y Colocación" (stepState: 'ready')
 * y una cuenta atrás de preparación de 3 segundos ('countdown') antes de cada cronómetro, evitando que el
 * ejercicio comience de golpe sin que el usuario haya visto el movimiento.
 */
window.WorkoutEngine = (function createWorkoutEngine() {
  let activeSession = null;
  let intervalId = null;
  let onStateChangeCallback = null;
  let wakeLockSentinel = null;

  /**
   * Se mantiene la pantalla del móvil encendida durante el entrenamiento mediante Wake Lock API
   * para evitar que el teléfono se bloquee en mitad de una plancha o serie cronometrada.
   */
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator && !wakeLockSentinel) {
        wakeLockSentinel = await navigator.wakeLock.request('screen');
        wakeLockSentinel.addEventListener('release', () => {
          wakeLockSentinel = null;
        });
      }
    } catch (_) {
      // Se ignora si el navegador o el modo ahorro de batería bloquea Wake Lock
    }
  }

  function releaseWakeLock() {
    if (wakeLockSentinel) {
      wakeLockSentinel.release().catch(() => {});
      wakeLockSentinel = null;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && activeSession && activeSession.status === 'running') {
      requestWakeLock();
    }
  });

  /**
   * Se acumula el tiempo pasado en pausa al salir de ella para que la duración registrada
   * refleje solo el tiempo real de entrenamiento.
   */
  function settlePause() {
    if (activeSession && activeSession.pauseStartedAt) {
      activeSession.pausedMs += Date.now() - activeSession.pauseStartedAt;
      activeSession.pauseStartedAt = null;
    }
  }

  function getActiveMinutes(session) {
    if (!session) return 0;
    const end = session.completedAt || Date.now();
    const pending = session.pauseStartedAt ? end - session.pauseStartedAt : 0;
    const activeMs = Math.max(0, end - session.startedAt - session.pausedMs - pending);
    return Math.max(1, Math.round(activeMs / 60000));
  }

  function clearTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function makeWorkStep(exercise, level, ctx, meta) {
    const D = window.AppData;
    const lv = D.getExerciseLevel(exercise, level);
    const targetValue = D.computeTarget(exercise, lv.level, ctx.volumeFactor, ctx.intensityMultiplier);
    return Object.assign(
      {
        stepType: 'work',
        // Se inicia cada ejercicio en 'ready' para que el reloj NO corra hasta que el usuario esté listo
        phase: 'ready', // 'ready' | 'countdown' | 'active' | 'paused'
        prepSeconds: 3,
        exercise,
        selectedVariantLevel: lv.level,
        levelInfo: lv,
        mode: lv.mode,
        targetValue,
        remainingSeconds: lv.mode === 'timer' ? targetValue : 0,
        elapsedSeconds: 0
      },
      meta
    );
  }

  /**
   * Se construye la secuencia: calentamiento, bloque principal en N vueltas y vuelta a la calma,
   * con descansos más largos entre vueltas y transiciones cortas en calentamiento y estiramientos.
   */
  function buildSteps(template, ctx) {
    const D = window.AppData;
    const rounds = template.optional ? 1 : ctx.rounds;
    const plan = [];

    template.warmup.forEach((id) => plan.push({ id, section: 'warmup', round: 0 }));
    for (let r = 1; r <= rounds; r += 1) {
      template.main.forEach((id) => plan.push({ id, section: 'main', round: r }));
    }
    template.cooldown.forEach((id) => plan.push({ id, section: 'cooldown', round: 0 }));

    const steps = [];
    plan.forEach((item, index) => {
      const exercise = D.getExerciseById(item.id);
      steps.push(
        makeWorkStep(exercise, ctx.level, ctx, {
          section: item.section,
          round: item.round,
          totalRounds: rounds,
          exerciseIndex: index + 1,
          totalExercises: plan.length
        })
      );

      const next = plan[index + 1];
      if (!next) return;
      const nextExercise = D.getExerciseById(next.id);
      let restSeconds = D.TRANSITION_SECONDS;
      let restLabel = 'Transition';
      if (item.section === 'main' && next.section === 'main') {
        const endOfRound = next.round !== item.round;
        restSeconds = endOfRound ? D.REST_BETWEEN_ROUNDS : D.REST_BETWEEN_EXERCISES;
        restLabel = endOfRound ? `Fin du tour ${item.round}` : 'Repos';
      } else if (item.section === 'main') {
        restSeconds = D.REST_BETWEEN_EXERCISES;
        restLabel = 'Bravo, on s’étire';
      }

      steps.push({
        stepType: 'rest',
        phase: 'active',
        label: restLabel,
        section: next.section,
        round: next.round,
        totalRounds: rounds,
        exerciseIndex: index + 1,
        totalExercises: plan.length,
        nextExercise,
        nextLevel: D.getExerciseLevel(nextExercise, ctx.level),
        targetValue: restSeconds,
        remainingSeconds: restSeconds
      });
    });

    return steps;
  }

  function notifyUpdate() {
    if (typeof onStateChangeCallback === 'function' && activeSession) {
      onStateChangeCallback(activeSession);
    }
  }

  function runActiveInterval() {
    clearTimer();
    if (!activeSession || activeSession.status === 'completed') return;

    const currentStep = activeSession.steps[activeSession.currentStepIndex];
    if (!currentStep) return;

    // Si el paso está en observación ('ready') o en pausa ('paused'), el reloj permanece detenido
    if (currentStep.phase === 'ready' || currentStep.phase === 'paused') {
      return;
    }

    intervalId = setInterval(() => {
      if (!activeSession || activeSession.status === 'completed') return;

      // Fase de preparación 3, 2, 1 antes de iniciar el cronómetro del ejercicio
      if (currentStep.phase === 'countdown') {
        currentStep.prepSeconds -= 1;
        if (currentStep.prepSeconds > 0) {
          window.AudioFeedback.playCountdownTick(currentStep.prepSeconds);
          notifyUpdate();
        } else {
          currentStep.phase = 'active';
          window.AudioFeedback.playStartPhase();
          notifyUpdate();
        }
        return;
      }

      activeSession.totalElapsedSeconds += 1;

      if (currentStep.stepType === 'rest' || currentStep.mode === 'timer') {
        currentStep.remainingSeconds = Math.max(0, currentStep.remainingSeconds - 1);

        if (
          currentStep.stepType === 'work' &&
          currentStep.targetValue >= 20 &&
          currentStep.remainingSeconds === Math.floor(currentStep.targetValue / 2)
        ) {
          window.AudioFeedback.playHalfwayPulse();
        } else if (currentStep.remainingSeconds > 0 && currentStep.remainingSeconds <= 3) {
          window.AudioFeedback.playCountdownTick(currentStep.remainingSeconds);
        }

        if (currentStep.remainingSeconds === 0) {
          advanceStep();
          return;
        }
      } else {
        currentStep.elapsedSeconds += 1;
      }

      notifyUpdate();
    }, 1000);
  }

  function advanceStep() {
    clearTimer();
    if (!activeSession) return;
    settlePause();

    if (activeSession.currentStepIndex < activeSession.steps.length - 1) {
      activeSession.currentStepIndex += 1;
      const nextStep = activeSession.steps[activeSession.currentStepIndex];

      const prevStep = activeSession.steps[activeSession.currentStepIndex - 1];

      if (nextStep.stepType === 'rest') {
        nextStep.phase = 'active';
        window.AudioFeedback.playRestPhase();
        notifyUpdate();
        runActiveInterval();
      } else if (prevStep && prevStep.stepType === 'rest' && nextStep.mode === 'timer') {
        // Tras un descanso el usuario ya vio el ejercicio: el cronómetro arranca solo tras 3-2-1
        nextStep.phase = 'countdown';
        nextStep.prepSeconds = 3;
        window.AudioFeedback.playCountdownTick(3);
        notifyUpdate();
        runActiveInterval();
      } else {
        // Al entrar a un nuevo ejercicio se detiene en 'ready' con una campana suave de bienvenida
        nextStep.phase = 'ready';
        window.AudioFeedback.playStepReady();
        notifyUpdate();
      }
    } else {
      activeSession.status = 'completed';
      activeSession.completedAt = Date.now();
      releaseWakeLock();
      window.AudioFeedback.playVictory();
      window.AppLogger.info({ id: activeSession.template.id }, 'Workout steps finished');
      notifyUpdate();
    }
  }

  return {
    subscribe(callback) {
      onStateChangeCallback = callback;
    },
    startWorkout(templateId, options) {
      clearTimer();
      requestWakeLock();
      const state = window.AppStorage.getState();
      const template = window.AppData.getTemplateById(templateId);
      const opts = options || {};

      const position = window.AppData.getProgramPosition(
        opts.sessionIndex !== undefined ? opts.sessionIndex : state.programSessionIndex
      );
      const ctx = {
        level: state.fitnessLevel,
        rounds: position.rounds,
        volumeFactor: position.volumeFactor,
        intensityMultiplier: state.intensityMultiplier
      };

      activeSession = {
        template,
        position,
        // Solo las sesiones del programa (no la movilidad opcional) hacen avanzar la progresión
        counted: !template.optional,
        ctx,
        steps: buildSteps(template, ctx),
        currentStepIndex: 0,
        totalElapsedSeconds: 0,
        startedAt: Date.now(),
        completedAt: null,
        pausedMs: 0,
        pauseStartedAt: null,
        status: 'running'
      };

      window.AudioFeedback.playStepReady();
      window.AppLogger.info(
        { templateId: template.id, sessionIndex: position.sessionIndex },
        'Workout session opened in observation mode'
      );

      notifyUpdate();
      return activeSession;
    },
    /**
     * Se lanza la cuenta atrás de 3 segundos cuando el usuario pulsa "Je suis en position • Lancer le chrono"
     * para darle tiempo a soltar el ratón o el móvil y colocarse.
     */
    beginCurrentExerciseTimer() {
      if (!activeSession || activeSession.status === 'completed') return;
      const currentStep = activeSession.steps[activeSession.currentStepIndex];
      if (!currentStep || currentStep.stepType !== 'work') return;

      currentStep.phase = 'countdown';
      currentStep.prepSeconds = 3;
      window.AudioFeedback.playCountdownTick(3);
      notifyUpdate();
      runActiveInterval();
    },
    togglePause() {
      if (!activeSession || activeSession.status === 'completed') return;
      const currentStep = activeSession.steps[activeSession.currentStepIndex];
      if (!currentStep) return;

      if (currentStep.phase === 'active' || currentStep.phase === 'countdown') {
        // Se recuerda la fase previa para reanudar la cuenta atrás si se pausó durante ella
        currentStep.phaseBeforePause = currentStep.phase;
        currentStep.phase = 'paused';
        activeSession.pauseStartedAt = Date.now();
        clearTimer();
      } else if (currentStep.phase === 'paused') {
        currentStep.phase = currentStep.phaseBeforePause || 'active';
        settlePause();
        runActiveInterval();
      }
      notifyUpdate();
    },
    restartCurrentExerciseTimer() {
      if (!activeSession || activeSession.status === 'completed') return;
      const currentStep = activeSession.steps[activeSession.currentStepIndex];
      if (!currentStep || currentStep.stepType !== 'work') return;

      clearTimer();
      settlePause();
      currentStep.remainingSeconds = currentStep.targetValue;
      currentStep.phase = 'ready';
      notifyUpdate();
    },
    completeCurrentStep() {
      if (!activeSession || activeSession.status === 'completed') return;
      advanceStep();
    },
    stepPrevExercise() {
      if (!activeSession || activeSession.status === 'completed') return;
      for (let i = activeSession.currentStepIndex - 1; i >= 0; i -= 1) {
        if (activeSession.steps[i].stepType === 'work') {
          this.JumpToExerciseIndex(i);
          return;
        }
      }
    },
    JumpToExerciseIndex(targetStepIndex) {
      if (!activeSession || activeSession.status === 'completed') return;
      if (targetStepIndex >= 0 && targetStepIndex < activeSession.steps.length) {
        clearTimer();
        settlePause();
        activeSession.currentStepIndex = targetStepIndex;
        const step = activeSession.steps[targetStepIndex];
        step.phase = step.stepType === 'rest' ? 'active' : 'ready';
        notifyUpdate();
        if (step.stepType === 'rest') runActiveInterval();
      }
    },
    addRestSeconds(extraSeconds) {
      if (!activeSession) return;
      const currentStep = activeSession.steps[activeSession.currentStepIndex];
      if (currentStep && (currentStep.stepType === 'rest' || currentStep.mode === 'timer')) {
        currentStep.remainingSeconds += extraSeconds;
        currentStep.targetValue += extraSeconds;
        notifyUpdate();
      }
    },
    setCurrentStepVariant(variantLevel) {
      if (!activeSession) return;
      const currentStep = activeSession.steps[activeSession.currentStepIndex];
      if (!currentStep || currentStep.stepType !== 'work') return;
      const level = Number(variantLevel);
      // El nivel elegido se aplica a este ejercicio y a sus siguientes vueltas en la sesión
      activeSession.steps.forEach((step, idx) => {
        if (idx < activeSession.currentStepIndex) return;
        if (step.stepType === 'work' && step.exercise.id === currentStep.exercise.id) {
          const fresh = makeWorkStep(step.exercise, level, activeSession.ctx, {});
          step.selectedVariantLevel = fresh.selectedVariantLevel;
          step.levelInfo = fresh.levelInfo;
          step.mode = fresh.mode;
          step.targetValue = fresh.targetValue;
          step.remainingSeconds = fresh.remainingSeconds;
        } else if (step.stepType === 'rest' && step.nextExercise.id === currentStep.exercise.id) {
          step.nextLevel = window.AppData.getExerciseLevel(step.nextExercise, level);
        }
      });
      clearTimer();
      settlePause();
      currentStep.phase = 'ready';
      notifyUpdate();
    },
    abortWorkout() {
      clearTimer();
      releaseWakeLock();
      activeSession = null;
      // Se avisa de que no hay sesión en curso (p. ej. para aplicar una actualización pendiente)
      window.dispatchEvent(new CustomEvent('elan:workout-idle'));
    },
    getActiveMinutes,
    getActiveSession() {
      return activeSession;
    }
  };
})();
