/**
 * Se rediseña el motor de entrenamiento con una fase explícita de "Observación y Colocación" (stepState: 'ready')
 * y una cuenta atrás de preparación de 3 segundos ('countdown') antes de cada cronómetro, evitando que el
 * ejercicio comience de golpe sin que el usuario haya visto el movimiento.
 */
window.WorkoutEngine = (function createWorkoutEngine() {
  let activeSession = null;
  let intervalId = null;
  let onStateChangeCallback = null;

  function clearTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function computeScaledTarget(exercise, fitnessLevel, intensityMultiplier, programDay) {
    const levelFactor = fitnessLevel === 1 ? 0.85 : fitnessLevel === 2 ? 1.0 : 1.25;
    const weekIndex = Math.max(0, Math.min(3, Math.ceil((programDay || 1) / 7) - 1));
    // Se incrementa progresivamente el volumen cada semana (+8% por semana) dentro del plan de 28 días
    const weekProgressionFactor = 1 + weekIndex * 0.08;
    const rawValue =
      exercise.baseValue * levelFactor * weekProgressionFactor * (intensityMultiplier || 1.0);

    if (exercise.mode === 'timer') {
      return Math.max(20, Math.round(rawValue / 5) * 5);
    }
    return Math.max(6, Math.round(rawValue));
  }

  function buildSteps(template, state, programDay) {
    const steps = [];
    const totalExercises = template.exerciseIds.length;

    template.exerciseIds.forEach((exerciseId, index) => {
      const exercise = window.AppData.getExerciseById(exerciseId);
      const targetValue = computeScaledTarget(
        exercise,
        state.fitnessLevel,
        state.intensityMultiplier,
        programDay
      );

      steps.push({
        stepType: 'work',
        // Se inicia cada ejercicio en estado 'ready' para que el reloj NO corra hasta que el usuario esté listo
        phase: 'ready', // 'ready' | 'countdown' | 'active' | 'paused'
        prepSeconds: 3,
        exerciseIndex: index + 1,
        totalExercises,
        exercise,
        selectedVariantLevel: state.fitnessLevel,
        targetValue,
        remainingSeconds: exercise.mode === 'timer' ? targetValue : 0,
        elapsedSeconds: 0
      });

      if (index < totalExercises - 1) {
        const nextExercise = window.AppData.getExerciseById(template.exerciseIds[index + 1]);
        steps.push({
          stepType: 'rest',
          phase: 'active',
          exerciseIndex: index + 1,
          totalExercises,
          nextExercise,
          targetValue: 25,
          remainingSeconds: 25
        });
      }
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

      if (currentStep.stepType === 'rest' || currentStep.exercise.mode === 'timer') {
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

    if (activeSession.currentStepIndex < activeSession.steps.length - 1) {
      activeSession.currentStepIndex += 1;
      const nextStep = activeSession.steps[activeSession.currentStepIndex];

      if (nextStep.stepType === 'rest') {
        nextStep.phase = 'active';
        window.AudioFeedback.playRestPhase();
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
      const state = window.AppStorage.getState();
      const template = window.AppData.getTemplateById(templateId);
      const opts = options || {};

      const activeProgramDay = opts.programDay || state.currentProgramDay || 1;

      activeSession = {
        template,
        programDay: activeProgramDay,
        xpReward: opts.xpReward || 120,
        steps: buildSteps(template, state, activeProgramDay),
        currentStepIndex: 0,
        totalElapsedSeconds: 0,
        status: 'running'
      };

      window.AudioFeedback.playStepReady();
      window.AppLogger.info(
        { templateId: template.id, programDay: activeSession.programDay },
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
        currentStep.phase = 'paused';
        clearTimer();
      } else if (currentStep.phase === 'paused') {
        currentStep.phase = 'active';
        runActiveInterval();
      }
      notifyUpdate();
    },
    restartCurrentExerciseTimer() {
      if (!activeSession || activeSession.status === 'completed') return;
      const currentStep = activeSession.steps[activeSession.currentStepIndex];
      if (!currentStep || currentStep.stepType !== 'work') return;

      clearTimer();
      currentStep.remainingSeconds = currentStep.targetValue;
      currentStep.phase = 'ready';
      notifyUpdate();
    },
    completeCurrentStep() {
      if (!activeSession || activeSession.status === 'completed') return;
      advanceStep();
    },
    JumpToExerciseIndex(targetStepIndex) {
      if (!activeSession || activeSession.status === 'completed') return;
      if (targetStepIndex >= 0 && targetStepIndex < activeSession.steps.length) {
        clearTimer();
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
      if (currentStep && (currentStep.stepType === 'rest' || currentStep.exercise.mode === 'timer')) {
        currentStep.remainingSeconds += extraSeconds;
        currentStep.targetValue += extraSeconds;
        notifyUpdate();
      }
    },
    setCurrentStepVariant(variantLevel) {
      if (!activeSession) return;
      const currentStep = activeSession.steps[activeSession.currentStepIndex];
      if (currentStep && currentStep.stepType === 'work') {
        currentStep.selectedVariantLevel = Number(variantLevel);
        notifyUpdate();
      }
    },
    abortWorkout() {
      clearTimer();
      activeSession = null;
    },
    getActiveSession() {
      return activeSession;
    }
  };
})();
