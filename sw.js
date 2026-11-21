// Actualizado a v1.3
const CACHE_NAME = 'dale-play-v1.3';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './songs.js',
  './manifest.json',

  // Iconos PWA en la raíz (junto a index.html)
  './icon-192.png',
  './apple-touch-icon.png',

  // Imágenes en carpeta assets
  './assets/fondo.jpg',
  './assets/splash-portada.jpg',
  './assets/dale-play.png',
  './assets/ludyco.png',
  './assets/icono-cara-a.png',
  './assets/icono-animados.png'
];

// 1. Instalación
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activación y purga de cachés anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Eliminando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch (estrategia Cache-First con Network Fallback, excluyendo YouTube y EmailJS)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.origin.includes('youtube.com') || 
      url.origin.includes('googlevideo.com') || 
      url.origin.includes('emailjs.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
