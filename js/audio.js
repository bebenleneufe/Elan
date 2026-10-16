/**
 * Se diseña un motor de síntesis acústica multicapa inspirado en apps de fitness premium
 * (filtros paso bajo cálidos, envolventes ADSR sin clics digitales, armónicos de marimba/campana
 * y compresión suave) para guiar al usuario por oído durante toda la sesión sin archivos externos.
 */
window.AudioFeedback = (function createAudioFeedback() {
  let audioCtx = null;
  let masterBus = null;
  let isMuted = false;

  /**
   * Se inicializa el contexto y un compresor maestro tras el primer gesto del usuario
   * para obtener un sonido cálido, equilibrado y libre de saturación en altavoces móviles.
   */
  function ensureContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();

      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-14, audioCtx.currentTime);
      compressor.knee.setValueAtTime(18, audioCtx.currentTime);
      compressor.ratio.setValueAtTime(4, audioCtx.currentTime);
      compressor.attack.setValueAtTime(0.005, audioCtx.currentTime);
      compressor.release.setValueAtTime(0.15, audioCtx.currentTime);

      compressor.connect(audioCtx.destination);
      masterBus = compressor;
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch((error) => {
        window.AppLogger.error({ error: String(error) }, 'AudioContext resume failed');
      });
    }
  }

  /**
   * Se sintetiza una nota orgánica combinando fundamental + armónico suave filtrados
   * con una envolvente de ataque progresivo (8 ms) para eliminar chasquidos.
   */
  function playHarmonicNote(options) {
    if (isMuted) return;
    try {
      ensureContext();
      if (!audioCtx || !masterBus) return;

      const {
        freq = 440,
        endFreq = null,
        duration = 0.25,
        delay = 0,
        volume = 0.18,
        type = 'sine',
        harmonicRatio = 2,
        harmonicGain = 0.22,
        filterCutoff = 2600
      } = options;

      const startTime = audioCtx.currentTime + delay;
      const stopTime = startTime + duration;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterCutoff, startTime);
      filter.frequency.exponentialRampToValueAtTime(Math.max(300, filterCutoff * 0.35), stopTime);

      const env = audioCtx.createGain();
      env.gain.setValueAtTime(0.0001, startTime);
      env.gain.linearRampToValueAtTime(volume, startTime + 0.008);
      env.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      const oscMain = audioCtx.createOscillator();
      oscMain.type = type;
      oscMain.frequency.setValueAtTime(freq, startTime);
      if (endFreq) {
        oscMain.frequency.exponentialRampToValueAtTime(endFreq, stopTime);
      }

      oscMain.connect(filter);

      if (harmonicGain > 0) {
        const oscHarm = audioCtx.createOscillator();
        const harmGainNode = audioCtx.createGain();
        oscHarm.type = 'triangle';
        oscHarm.frequency.setValueAtTime(freq * harmonicRatio, startTime);
        if (endFreq) {
          oscHarm.frequency.exponentialRampToValueAtTime(endFreq * harmonicRatio, stopTime);
        }
        harmGainNode.gain.setValueAtTime(harmonicGain, startTime);
        oscHarm.connect(harmGainNode);
        harmGainNode.connect(filter);
        oscHarm.start(startTime);
        oscHarm.stop(stopTime);
      }

      filter.connect(env);
      env.connect(masterBus);

      oscMain.start(startTime);
      oscMain.stop(stopTime);
    } catch (error) {
      window.AppLogger.error({ error: String(error) }, 'Harmonic note playback failed');
    }
  }

  return {
    setMuted(mutedState) {
      isMuted = Boolean(mutedState);
      window.AppLogger.info({ isMuted }, 'Audio mute state updated');
    },
    getMuted() {
      return isMuted;
    },

    // Toque táctil sutil de madera/cristal al pulsar controles importantes
    playTap() {
      playHarmonicNote({
        freq: 980,
        endFreq: 420,
        duration: 0.045,
        volume: 0.08,
        type: 'sine',
        harmonicGain: 0,
        filterCutoff: 1800
      });
    },

    // Campana suave de bienvenida cuando se presenta un nuevo ejercicio en modo observación
    playStepReady() {
      playHarmonicNote({
        freq: 587.33, // D5
        duration: 0.22,
        delay: 0,
        volume: 0.11,
        type: 'sine',
        harmonicRatio: 2,
        harmonicGain: 0.15,
        filterCutoff: 2200
      });
      playHarmonicNote({
        freq: 880, // A5
        duration: 0.35,
        delay: 0.07,
        volume: 0.13,
        type: 'sine',
        harmonicRatio: 2,
        harmonicGain: 0.12,
        filterCutoff: 2600
      });
    },

    //Pulso percusivo tipo marimba para la cuenta atrás 3, 2, 1
    playCountdownTick(secondsLeft) {
      const isLastTick = secondsLeft === 1;
      playHarmonicNote({
        freq: isLastTick ? 880 : 783.99, // G5 -> A5 en el último segundo
        endFreq: isLastTick ? 860 : 760,
        duration: 0.13,
        volume: isLastTick ? 0.2 : 0.16,
        type: 'triangle',
        harmonicRatio: 3,
        harmonicGain: 0.18,
        filterCutoff: 2400
      });
    },

    // Acorde ascendente cálido y enérgico ("¡GO!") al arrancar el cronómetro de acción
    playStartPhase() {
      // Golpe grave cálido de impulso
      playHarmonicNote({
        freq: 146.83, // D3
        endFreq: 98,
        duration: 0.18,
        delay: 0,
        volume: 0.22,
        type: 'sine',
        harmonicGain: 0.1,
        filterCutoff: 600
      });
      // Arpegio rápido de D Mayor (D5 - F#5 - A5 - D6)
      const goNotes = [587.33, 739.99, 880.0, 1174.66];
      goNotes.forEach((freq, idx) => {
        playHarmonicNote({
          freq,
          duration: idx === goNotes.length - 1 ? 0.45 : 0.22,
          delay: idx * 0.045,
          volume: idx === goNotes.length - 1 ? 0.2 : 0.14,
          type: 'sine',
          harmonicRatio: 2,
          harmonicGain: 0.2,
          filterCutoff: 3400
        });
      });
    },

    // Señal discreta a mitad de un ejercicio largo para informar sin obligar a mirar la pantalla
    playHalfwayPulse() {
      playHarmonicNote({
        freq: 659.25, // E5
        duration: 0.11,
        delay: 0,
        volume: 0.1,
        type: 'sine',
        harmonicGain: 0.1,
        filterCutoff: 1900
      });
      playHarmonicNote({
        freq: 783.99, // G5
        duration: 0.16,
        delay: 0.09,
        volume: 0.12,
        type: 'sine',
        harmonicGain: 0.1,
        filterCutoff: 2100
      });
    },

    // Campana zen descendente al terminar el esfuerzo y entrar en descanso
    playRestPhase() {
      const restNotes = [880.0, 659.25, 523.25]; // A5 -> E5 -> C5
      restNotes.forEach((freq, idx) => {
        playHarmonicNote({
          freq,
          duration: idx === 2 ? 0.55 : 0.28,
          delay: idx * 0.09,
          volume: 0.14,
          type: 'sine',
          harmonicRatio: 1.5,
          harmonicGain: 0.12,
          filterCutoff: 1800
        });
      });
    },

    // Fanfarria armónica cálida (Acorde Mayor 9ª) al completar la sesión del día
    playVictory() {
      // Base armónica cálida
      playHarmonicNote({
        freq: 261.63, // C4
        duration: 1.1,
        delay: 0,
        volume: 0.16,
        type: 'triangle',
        harmonicRatio: 2,
        harmonicGain: 0.15,
        filterCutoff: 1200
      });

      // Arpegio luminoso C5 - E5 - G5 - B5 - D6 - C6
      const melody = [
        { f: 523.25, d: 0.0, len: 0.28 },
        { f: 659.25, d: 0.09, len: 0.28 },
        { f: 783.99, d: 0.18, len: 0.28 },
        { f: 987.77, d: 0.27, len: 0.32 },
        { f: 1174.66, d: 0.38, len: 0.75 }
      ];
      melody.forEach((n) => {
        playHarmonicNote({
          freq: n.f,
          duration: n.len,
          delay: n.d,
          volume: 0.18,
          type: 'sine',
          harmonicRatio: 2,
          harmonicGain: 0.22,
          filterCutoff: 3800
        });
      });
    },

    playBadgeUnlock() {
      playHarmonicNote({ freq: 783.99, duration: 0.18, delay: 0, volume: 0.15 });
      playHarmonicNote({ freq: 1174.66, duration: 0.42, delay: 0.1, volume: 0.18 });
    }
  };
})();
