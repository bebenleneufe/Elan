/**
 * Se sirven los archivos de la aplicación con estrategia Network-First (red primero, caché como
 * respaldo sin conexión) para que cualquier despliegue en GitHub Pages aparezca inmediatamente
 * en el móvil sin quedar atrapado en una versión antigua de la caché.
 */
const SHELL_CACHE = 'elan30-shell-v7';
const FONT_CACHE = 'elan30-fonts-v1';
const KNOWN_CACHES = new Set([SHELL_CACHE, FONT_CACHE]);

const SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
  './assets/fonts/antonio-latin.woff2',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png',
  './icons/icon.svg',
  './js/logger.js',
  './js/audio.js',
  './js/data.js',
  './js/storage.js',
  './js/workout-engine.js',
  './js/app.js',
  './assets/photos/90-90-hamstring/0.jpg',
  './assets/photos/90-90-hamstring/1.jpg',
  './assets/photos/arm-circles/0.jpg',
  './assets/photos/arm-circles/1.jpg',
  './assets/photos/bodyweight-squat/0.jpg',
  './assets/photos/bodyweight-squat/1.jpg',
  './assets/photos/bodyweight-walking-lunge/0.jpg',
  './assets/photos/bodyweight-walking-lunge/1.jpg',
  './assets/photos/butt-lift-bridge/0.jpg',
  './assets/photos/butt-lift-bridge/1.jpg',
  './assets/photos/cat-stretch/0.jpg',
  './assets/photos/cat-stretch/1.jpg',
  './assets/photos/childs-pose/0.jpg',
  './assets/photos/childs-pose/1.jpg',
  './assets/photos/crossover-reverse-lunge/0.jpg',
  './assets/photos/crossover-reverse-lunge/1.jpg',
  './assets/photos/dead-bug/0.jpg',
  './assets/photos/dead-bug/1.jpg',
  './assets/photos/freehand-jump-squat/0.jpg',
  './assets/photos/freehand-jump-squat/1.jpg',
  './assets/photos/inchworm/0.jpg',
  './assets/photos/inchworm/1.jpg',
  './assets/photos/incline-push-up/0.jpg',
  './assets/photos/incline-push-up/1.jpg',
  './assets/photos/kneeling-hip-flexor/0.jpg',
  './assets/photos/kneeling-hip-flexor/1.jpg',
  './assets/photos/mountain-climbers/0.jpg',
  './assets/photos/mountain-climbers/1.jpg',
  './assets/photos/pelvic-tilt-into-bridge/0.jpg',
  './assets/photos/pelvic-tilt-into-bridge/1.jpg',
  './assets/photos/plank/0.jpg',
  './assets/photos/plank/1.jpg',
  './assets/photos/push-up-to-side-plank/0.jpg',
  './assets/photos/push-up-to-side-plank/1.jpg',
  './assets/photos/push-ups-with-feet-elevated/0.jpg',
  './assets/photos/push-ups-with-feet-elevated/1.jpg',
  './assets/photos/pushups/0.jpg',
  './assets/photos/pushups/1.jpg',
  './assets/photos/side-bridge/0.jpg',
  './assets/photos/side-bridge/1.jpg',
  './assets/photos/single-leg-glute-bridge/0.jpg',
  './assets/photos/single-leg-glute-bridge/1.jpg',
  './assets/photos/spinal-stretch/0.jpg',
  './assets/photos/spinal-stretch/1.jpg',
  './assets/photos/split-squats/0.jpg',
  './assets/photos/split-squats/1.jpg',
  './assets/photos/standing-hip-circles/0.jpg',
  './assets/photos/standing-hip-circles/1.jpg',
  './assets/photos/star-jump/0.jpg',
  './assets/photos/star-jump/1.jpg',
  './assets/photos/superman/0.jpg',
  './assets/photos/superman/1.jpg',
  './assets/photos/worlds-greatest-stretch/0.jpg',
  './assets/photos/worlds-greatest-stretch/1.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(precacheShell());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(removeOutdatedCaches());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  if (
    requestUrl.hostname === 'fonts.googleapis.com' ||
    requestUrl.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(serveFromCacheFirst(request, FONT_CACHE));
  } else if (requestUrl.origin === self.location.origin) {
    event.respondWith(serveFromNetworkFirst(request));
  }
});

async function precacheShell() {
  try {
    const cache = await caches.open(SHELL_CACHE);
    await cache.addAll(SHELL_FILES);
    await self.skipWaiting();
  } catch (error) {
    console.warn('Préchargement hors ligne incomplet.', error);
  }
}

async function removeOutdatedCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => !KNOWN_CACHES.has(name))
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
  } catch (error) {
    console.warn('Nettoyage des anciens caches impossible.', error);
  }
}

async function serveFromNetworkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const networkResponse = await fetch(request, { cache: 'no-store' });
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request, { ignoreSearch: true });
    if (cachedResponse !== undefined) {
      return cachedResponse;
    }
    throw error;
  }
}

async function serveFromCacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  if (cachedResponse !== undefined) {
    return cachedResponse;
  }
  const networkResponse = await fetch(request);
  if (networkResponse.ok || networkResponse.type === 'opaque') {
    await cache.put(request, networkResponse.clone());
  }
  return networkResponse;
}
