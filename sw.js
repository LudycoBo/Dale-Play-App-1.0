// Actualiza esta versión cuando publiques cambios significativos
const CACHE_NAME = 'dale-play-v1.3';

const ASSETS_TO_CACHE = [
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

// 1. INSTALACIÓN: Pre-cachea los archivos y toma el control de inmediato
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Aviso: algún recurso no se pudo precachear:', err);
      });
    })
  );
});

// 2. ACTIVACIÓN: Elimina cualquier caché antigua (v1, v2, etc.)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log('Borrando caché antigua:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH INTELIGENTE:
// - HTML y JS van a la red primero (Network-First) para que siempre reciban las actualizaciones.
// - Imágenes van a la caché primero (Cache-First) para máxima velocidad.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Si la petición es para el HTML o songs.js: NETWORK FIRST
  const isCodeAsset = 
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('index.html') ||
    url.pathname.endsWith('songs.js');

  if (isCodeAsset) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Si respondió bien, actualizamos la copia en caché silenciosamente
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          // Si no hay internet, recurrimos a lo que teníamos guardado en caché
          return caches.match(event.request);
        })
    );
    return;
  }

  // Para imágenes y otros recursos estáticos: CACHE FIRST
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      });
    })
  );
});
