// Incrementamos la versión a v2 para forzar al celular a desechar la caché vieja
const CACHE_NAME = 'dale-play-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './songs.js',
  './manifest.json',
  './assets/apple-touch-icon.png',
  './assets/fondo.jpg',
  './assets/splash-portada.jpg',
  './assets/dale-play.png',
  './assets/ludyco.png',
  './assets/icono-cara-a.png',
  './assets/icono-animados.png'
];

// Instalación: descarga y cachea los archivos asegurando songs.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Aviso: algún recurso opcional no se pudo cachear:', err);
      });
    })
  );
  self.skipWaiting(); // Toma el control inmediatamente
});

// Activación: ELIMINA cualquier caché vieja (como dale-play-v1) que tenga errores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('Borrando caché antigua:', key);
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// Peticiones: busca primero en red o en caché de forma segura
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        // En caso de estar sin conexión
      });
    })
  );
});
