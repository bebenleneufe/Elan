/**
 * Control del tapiz KingSmith WalkingPad Z1 por Web Bluetooth (Chrome / Edge en Android).
 *
 * Protocolo según github.com/slandau3/z1-walkingpad-mcp (MIT), docs/protocol.md:
 * el Z1 habla FTMS estándar (0x1826) pero lo ignora todo hasta recibir una trama de
 * desbloqueo en el servicio «supplement» de KingSmith, derivada del nombre BLE.
 *
 * Reglas de seguridad de esta app: la cinta nunca arranca sin un toque explícito,
 * la velocidad queda dentro del rango que anuncia el propio tapiz, y la parada
 * física / mando a distancia del tapiz siguen siendo prioritarios.
 */
window.Treadmill = (function createTreadmill() {
  const NAME_PREFIX = 'KS-HD-Z1';
  const FTMS_SERVICE = 0x1826;
  const CHAR_SPEED_RANGE = 0x2ad4;
  const CHAR_TREADMILL_DATA = 0x2acd;
  const CHAR_MACHINE_STATUS = 0x2ada;
  const CHAR_CONTROL_POINT = 0x2ad9;
  const SUPPLEMENT_SERVICE = '24e2521c-f63b-48ed-85be-c5330a00fdf7';
  const CHAR_SUPPLEMENT_NOTIFY = '24e2521c-f63b-48ed-85be-c5330b00fdf7';
  const CHAR_SUPPLEMENT_WRITE = '24e2521c-f63b-48ed-85be-c5330d00fdf7';

  const MIN_WRITE_INTERVAL_MS = 420; // el firmware descarta escrituras más seguidas
  const UNLOCK_TIMEOUT_MS = 10000;
  const CONTROL_TIMEOUT_MS = 3000;
  const LOG_LIMIT = 200;

  const CP_RESULTS = { 1: 'ok', 2: 'non supporté', 3: 'paramètre invalide', 4: 'échec', 5: 'contrôle refusé' };

  const state = {
    phase: 'idle', // idle | connecting | ready | error
    deviceName: null,
    running: false,
    speedKmh: 0,
    targetKmh: null,
    distanceM: 0,
    steps: 0,
    elapsedS: 0,
    hasTelemetry: false,
    minKmh: 1.6,
    maxKmh: 6.4,
    error: null
  };

  let device = null;
  let chars = {};
  let listeners = [];
  let logLines = [];
  let lastWriteAt = 0;
  let writeChain = Promise.resolve();
  let vendorWaiters = [];
  let cpWaiters = [];

  /* ------------------------------------------------------------------ */

  function hex(bytes) {
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(' ');
  }

  function log(message) {
    const t = new Date();
    const stamp = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}:${String(t.getSeconds()).padStart(2, '0')}`;
    logLines.push(`${stamp} ${message}`);
    if (logLines.length > LOG_LIMIT) logLines = logLines.slice(-LOG_LIMIT);
  }

  function emit(kind) {
    listeners.forEach((fn) => {
      try {
        fn(kind, state);
      } catch (error) {
        console.error(error);
      }
    });
  }

  function setPhase(phase, error) {
    state.phase = phase;
    state.error = error || null;
    emit('phase');
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Todas las escrituras pasan por una única cola espaciada
  function queueWrite(task) {
    const run = async () => {
      const gap = MIN_WRITE_INTERVAL_MS - (Date.now() - lastWriteAt);
      if (gap > 0) await wait(gap);
      try {
        return await task();
      } finally {
        lastWriteAt = Date.now();
      }
    };
    const next = writeChain.then(run, run);
    writeChain = next.catch(() => {});
    return next;
  }

  /* --------------------------- Tramas -------------------------------- */

  function vendorFrame(cmd0, cmd1, data) {
    const body = [cmd0, cmd1, data.length, ...data];
    const sum = body.reduce((acc, b) => (acc + b) & 0xff, 0);
    return new Uint8Array([...body, sum]);
  }

  function parseVendorFrame(bytes) {
    if (bytes.length < 4) return null;
    const len = bytes[2];
    if (bytes.length < 3 + len + 1) return null;
    let sum = 0;
    for (let i = 0; i < 3 + len; i += 1) sum = (sum + bytes[i]) & 0xff;
    if (sum !== bytes[3 + len]) return null;
    return { cmd0: bytes[0], cmd1: bytes[1], data: bytes.slice(3, 3 + len) };
  }

  // 71 00 05 01 <LE32(últimos 4 caracteres del nombre) + 1> CC
  function unlockFrame(name) {
    const tail = Array.from(new TextEncoder().encode(name)).slice(-4);
    const code = ((tail[0] | (tail[1] << 8) | (tail[2] << 16) | (tail[3] << 24)) + 1) >>> 0;
    return vendorFrame(0x71, 0x00, [0x01, code & 0xff, (code >>> 8) & 0xff, (code >>> 16) & 0xff, (code >>> 24) & 0xff]);
  }

  function sysInfoFrame() {
    const t = Math.floor(Date.now() / 1000) >>> 0;
    return vendorFrame(0x71, 0x01, [t & 0xff, (t >>> 8) & 0xff, (t >>> 16) & 0xff, (t >>> 24) & 0xff, 0, 0, 0, 0]);
  }

  function parseTreadmillData(view) {
    const out = {};
    if (view.byteLength < 2) return out;
    const flags = view.getUint16(0, true);
    let off = 2;
    const take = (n) => {
      const start = off;
      off += n;
      return off <= view.byteLength ? start : -1;
    };
    let p;
    if ((flags & 0x01) === 0 && (p = take(2)) >= 0) out.speedKmh = view.getUint16(p, true) / 100;
    if (flags & 0x02) take(2); // velocidad media
    if (flags & 0x04 && (p = take(3)) >= 0) {
      out.distanceM = view.getUint8(p) | (view.getUint8(p + 1) << 8) | (view.getUint8(p + 2) << 16);
    }
    if (flags & 0x08) take(4); // inclinación + rampa
    if (flags & 0x10) take(4); // desnivel positivo / negativo
    if (flags & 0x20) take(1); // ritmo instantáneo
    if (flags & 0x40) take(1); // ritmo medio
    if (flags & 0x80) take(5); // energía
    if (flags & 0x100) take(1); // pulso
    if (flags & 0x200) take(1); // MET
    if (flags & 0x400 && (p = take(2)) >= 0) out.elapsedS = view.getUint16(p, true);
    if (flags & 0x800) take(2); // tiempo restante
    if (flags & 0x1000) take(4); // fuerza + potencia
    if (flags & 0x2000 && (p = take(2)) >= 0) out.steps = view.getUint16(p, true); // extensión KingSmith
    return out;
  }

  /* ------------------------- Notificaciones -------------------------- */

  function onSupplementNotify(event) {
    const bytes = new Uint8Array(event.target.value.buffer.slice(0));
    log(`← vendor ${hex(bytes)}`);
    const frame = parseVendorFrame(bytes);
    if (!frame) return;
    vendorWaiters = vendorWaiters.filter((w) => {
      if (w.match(frame)) {
        w.resolve(frame);
        return false;
      }
      return true;
    });
  }

  function onControlPointIndicate(event) {
    const bytes = new Uint8Array(event.target.value.buffer.slice(0));
    log(`← contrôle ${hex(bytes)}`);
    if (bytes[0] !== 0x80) return;
    cpWaiters = cpWaiters.filter((w) => {
      if (w.op === bytes[1]) {
        w.resolve(bytes[2]);
        return false;
      }
      return true;
    });
  }

  function onTreadmillData(event) {
    const parsed = parseTreadmillData(event.target.value);
    if (!state.hasTelemetry) log(`← données ${hex(new Uint8Array(event.target.value.buffer.slice(0)))}`);
    state.hasTelemetry = true;
    if (parsed.speedKmh !== undefined) {
      state.speedKmh = parsed.speedKmh;
      state.running = parsed.speedKmh > 0;
    }
    if (parsed.distanceM !== undefined) state.distanceM = parsed.distanceM;
    if (parsed.steps !== undefined) state.steps = parsed.steps;
    if (parsed.elapsedS !== undefined) state.elapsedS = parsed.elapsedS;
    emit('telemetry');
  }

  function onMachineStatus(event) {
    const bytes = new Uint8Array(event.target.value.buffer.slice(0));
    log(`← statut ${hex(bytes)}`);
    const code = bytes[0];
    if (code === 0x04) state.running = true;
    if (code === 0x02 || code === 0x01) {
      state.running = false;
      state.speedKmh = 0;
    }
    if (code === 0x01) log('Arrêt par la clé de sécurité du tapis');
    emit('status');
  }

  function onDisconnected() {
    log('Déconnecté');
    chars = {};
    state.running = false;
    state.speedKmh = 0;
    vendorWaiters.forEach((w) => w.reject(new Error('déconnecté')));
    cpWaiters.forEach((w) => w.reject(new Error('déconnecté')));
    vendorWaiters = [];
    cpWaiters = [];
    if (state.phase !== 'error') setPhase('idle');
  }

  /* ---------------------------- Envíos ------------------------------- */

  function awaitVendor(match, timeoutMs) {
    return new Promise((resolve, reject) => {
      const waiter = { match, resolve, reject };
      vendorWaiters.push(waiter);
      setTimeout(() => {
        if (vendorWaiters.includes(waiter)) {
          vendorWaiters = vendorWaiters.filter((w) => w !== waiter);
          reject(new Error('le tapis ne répond pas'));
        }
      }, timeoutMs);
    });
  }

  async function sendVendor(frame, match, timeoutMs) {
    const reply = match ? awaitVendor(match, timeoutMs || CONTROL_TIMEOUT_MS) : null;
    await queueWrite(async () => {
      log(`→ vendor ${hex(frame)}`);
      await chars.supplementWrite.writeValueWithoutResponse(frame);
    });
    return reply;
  }

  async function sendControl(bytes, retried) {
    if (!chars.controlPoint) throw new Error('tapis non connecté');
    const op = bytes[0];
    const result = new Promise((resolve, reject) => {
      const waiter = { op, resolve, reject };
      cpWaiters.push(waiter);
      setTimeout(() => {
        if (cpWaiters.includes(waiter)) {
          cpWaiters = cpWaiters.filter((w) => w !== waiter);
          reject(new Error('pas de réponse du tapis'));
        }
      }, CONTROL_TIMEOUT_MS);
    });
    await queueWrite(async () => {
      log(`→ contrôle ${hex(bytes)}`);
      await chars.controlPoint.writeValueWithResponse(new Uint8Array(bytes));
    });
    const code = await result;
    if (code === 5 && !retried && op !== 0x00) {
      await sendControl([0x00], true);
      return sendControl(bytes, true);
    }
    if (code !== 1) throw new Error(`commande refusée (${CP_RESULTS[code] || code})`);
    return code;
  }

  /* ----------------------------- API --------------------------------- */

  async function connect() {
    if (!isSupported()) throw new Error('Bluetooth indisponible dans ce navigateur');
    if (state.phase === 'connecting' || state.phase === 'ready') return;
    setPhase('connecting');
    try {
      device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: NAME_PREFIX }],
        optionalServices: [FTMS_SERVICE, SUPPLEMENT_SERVICE]
      });
      state.deviceName = device.name || '';
      log(`Appareil choisi : ${state.deviceName}`);
      device.removeEventListener('gattserverdisconnected', onDisconnected);
      device.addEventListener('gattserverdisconnected', onDisconnected);

      const server = await device.gatt.connect();
      log('Connecté au GATT');
      const ftms = await server.getPrimaryService(FTMS_SERVICE);
      const supplement = await server.getPrimaryService(SUPPLEMENT_SERVICE);
      chars = {
        speedRange: await ftms.getCharacteristic(CHAR_SPEED_RANGE).catch(() => null),
        treadmillData: await ftms.getCharacteristic(CHAR_TREADMILL_DATA),
        machineStatus: await ftms.getCharacteristic(CHAR_MACHINE_STATUS).catch(() => null),
        controlPoint: await ftms.getCharacteristic(CHAR_CONTROL_POINT),
        supplementNotify: await supplement.getCharacteristic(CHAR_SUPPLEMENT_NOTIFY),
        supplementWrite: await supplement.getCharacteristic(CHAR_SUPPLEMENT_WRITE)
      };

      // 1. Notificaciones del canal supplement ANTES de escribir nada
      chars.supplementNotify.addEventListener('characteristicvaluechanged', onSupplementNotify);
      await chars.supplementNotify.startNotifications();
      chars.treadmillData.addEventListener('characteristicvaluechanged', onTreadmillData);
      await chars.treadmillData.startNotifications();
      if (chars.machineStatus) {
        chars.machineStatus.addEventListener('characteristicvaluechanged', onMachineStatus);
        await chars.machineStatus.startNotifications().catch(() => {});
      }

      // 2. Desbloqueo: respuesta esperada 71 80
      if (state.deviceName.length < 4) throw new Error('nom Bluetooth inattendu');
      await sendVendor(unlockFrame(state.deviceName), (f) => f.cmd0 === 0x71 && f.cmd1 === 0x80, UNLOCK_TIMEOUT_MS);
      log('Déverrouillé');

      // 3. Inicialización opcional (el tapiz funciona aunque falle)
      await sendVendor(sysInfoFrame(), (f) => f.cmd0 === 0x71 && f.cmd1 === 0x81).catch(() => log('SYS_INFO sans réponse'));

      if (chars.speedRange) {
        const range = await chars.speedRange.readValue().catch(() => null);
        if (range && range.byteLength >= 4) {
          state.minKmh = range.getUint16(0, true) / 100;
          state.maxKmh = range.getUint16(2, true) / 100;
          log(`Vitesse ${state.minKmh}–${state.maxKmh} km/h`);
        }
      }

      chars.controlPoint.addEventListener('characteristicvaluechanged', onControlPointIndicate);
      await chars.controlPoint.startNotifications();
      await sendControl([0x00]);
      log('Contrôle obtenu');
      setPhase('ready');
    } catch (error) {
      const message = error && error.name === 'NotFoundError' ? 'Aucun tapis choisi' : String((error && error.message) || error);
      log(`Erreur : ${message}`);
      if (device && device.gatt && device.gatt.connected) device.gatt.disconnect();
      setPhase(error && error.name === 'NotFoundError' ? 'idle' : 'error', message);
      throw error;
    }
  }

  function disconnect() {
    if (device && device.gatt && device.gatt.connected) device.gatt.disconnect();
    setPhase('idle');
  }

  function clampSpeed(kmh) {
    const rounded = Math.round(kmh * 10) / 10;
    return Math.min(state.maxKmh, Math.max(state.minKmh, rounded));
  }

  async function start() {
    await sendControl([0x07]);
    // El tapiz arranca a su velocidad mínima; se acelera después con setSpeed
    state.targetKmh = null;
    state.running = true;
    emit('status');
  }

  // Pausa (08 02): conserva los contadores del tapiz. stop() (08 01) cierra la sesión del tapiz.
  async function pause() {
    await sendControl([0x08, 0x02]);
    state.running = false;
    emit('status');
  }

  async function stop() {
    await sendControl([0x08, 0x01]);
    state.running = false;
    emit('status');
  }

  async function setSpeed(kmh) {
    const target = clampSpeed(kmh);
    const value = Math.round(target * 100);
    await sendControl([0x02, value & 0xff, (value >> 8) & 0xff]);
    state.targetKmh = target;
    emit('status');
    return target;
  }

  function isSupported() {
    return typeof navigator !== 'undefined' && Boolean(navigator.bluetooth);
  }

  return {
    isSupported,
    connect,
    disconnect,
    start,
    pause,
    stop,
    setSpeed,
    getState() {
      return state;
    },
    getLog() {
      return logLines.slice();
    },
    subscribe(fn) {
      listeners.push(fn);
      return () => {
        listeners = listeners.filter((l) => l !== fn);
      };
    },
    // Expuesto para pruebas sin tapiz
    _test: { unlockFrame, parseTreadmillData, vendorFrame, parseVendorFrame, hex }
  };
})();
