// sw.js - Dale Play PWA
const CACHE_NAME = 'daleplay-cache-v2.6';

// Archivos estáticos base
const STATIC_ASSETS = [
  './',
  'index.html',
  'songs.js',
  'manifest.json',
  'assets/apple-touch-icon.png',
  'assets/fondo.jpg',
  'assets/splash-portada.jpg',
  'assets/dale-play.png',
  'assets/ludyco.png',
  'assets/icono-cara-a.png',
  'assets/icono-animados.png',
  'assets/apple-touch-icon.png',
  'assets/icon-192.png'
];

// Instalación: forzar activación inmediata
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Activación: borra cualquier caché antigua automáticamente
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Red primero (Network First) para HTML y JS, Caché como respaldo
self.addEventListener('fetch', (event) => {
  // Ignorar peticiones a YouTube o librerías externas
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Si hay internet, devuelve lo nuevo y actualiza la copia en caché
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Si no hay internet, recurre a lo guardado
        return caches.match(event.request);
      })
  );
});
