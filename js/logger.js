/**
 * Se encapsula el registro de eventos en un módulo dedicado para mantener mensajes
 * de baja cardinalidad y facilitar el diagnóstico sin acoplar la lógica de negocio a la consola.
 */
window.AppLogger = (function createLogger() {
  function formatLog(level, context, message) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      context: context || {}
    };
  }

  return {
    info(context, message) {
      const payload = formatLog('INFO', context, message);
      console.info(`[INFO] ${payload.message}`, payload.context);
    },
    warn(context, message) {
      const payload = formatLog('WARN', context, message);
      console.warn(`[WARN] ${payload.message}`, payload.context);
    },
    error(context, message) {
      const payload = formatLog('ERROR', context, message);
      console.error(`[ERROR] ${payload.message}`, payload.context);
    }
  };
})();
