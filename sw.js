/**
 * Se implementa un Service Worker con caché local de todos los recursos y GIFs animados
 * para que la aplicación instalada en el móvil cargue al instante y funcione incluso sin cobertura.
 */
const CACHE_NAME = 'elan30-pwa-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './assets/app-icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
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
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          return networkResponse;
        })
      );
    })
  );
});
