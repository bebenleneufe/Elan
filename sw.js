/**
 * Se sirven los archivos de la aplicación con estrategia Network-First (red primero, caché como
 * respaldo sin conexión) para que cualquier despliegue en GitHub Pages aparezca inmediatamente
 * en el móvil sin quedar atrapado en una versión antigua de la caché.
 */
const SHELL_CACHE = 'elan30-shell-v4';
const FONT_CACHE = 'elan30-fonts-v1';
const KNOWN_CACHES = new Set([SHELL_CACHE, FONT_CACHE]);

const SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
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
  './assets/gifs/cat-cow.gif',
  './assets/gifs/thoracic-opener.gif',
  './assets/gifs/hip-flexor-pulse.gif',
  './assets/gifs/controlled-squat.gif',
  './assets/gifs/glute-bridge.gif',
  './assets/gifs/reverse-lunge.gif',
  './assets/gifs/wall-sit.gif',
  './assets/gifs/pushup-progression.gif',
  './assets/gifs/scapular-superman.gif',
  './assets/gifs/pike-shoulder-press.gif',
  './assets/gifs/plank-core.gif',
  './assets/gifs/bird-dog.gif',
  './assets/gifs/step-jacks.gif',
  './assets/gifs/shadow-knees.gif'
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
