// sw.js
const CACHE_NAME = 'mon-site-pwa-v1'; 
// Liste des fichiers essentiels basés sur ton dépôt GitHub
const URLS_TO_CACHE = [
  '/', 
  '/index.html',
  '/manifest.json',
  '/sw.js',
  '/af.png' // Ton icône
  // AJOUTE ICI TES AUTRES FICHIERS (CSS, JS, images...)
];

// --- 1. ÉVÉNEMENT D'INSTALLATION (Mise en cache) ---
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install. Pré-caching des ressources...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// --- 2. ÉVÉNEMENT D'ACTIVATION (Nettoyage des anciens caches) ---
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate. Nettoyage des anciens caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression de l\'ancien cache:', cacheNameName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(clients.claim());
});

// --- 3. ÉVÉNEMENT DE RÉCUPÉRATION (Servir depuis le cache en premier) ---
self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Si la ressource est dans le cache, on la sert
          if (response) {
            return response;
          }
          // Sinon, on va sur le réseau
          return fetch(event.request);
        })
    );
  }
});
