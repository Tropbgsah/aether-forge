// sw.js
const CACHE_NAME = 'mon-site-cache-v1'; // CHANGE CETTE VERSION A CHAQUE MISE A JOUR !
// Liste des fichiers essentiels pour que le site fonctionne hors ligne
const URLS_TO_CACHE = [
  '/', // Ta page d'accueil (index.html)
  '/index.html',
  '/styles/main.css', // Exemple de fichier CSS
  '/js/main.js',     // Exemple de fichier JavaScript
  '/images/icons/icon-192x192.png', // Tes icônes
  '/manifest.json'
  // AJOUTE ICI TOUS LES FICHIERS CRUCIAUX DE TON SITE
];

// --- 1. ÉVÉNEMENT D'INSTALLATION (Mise en cache) ---
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install. Démarrage du pré-caching...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Cache ouvert, ajout des ressources.');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch((error) => {
        console.error('Échec du pré-caching:', error);
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
            console.log('[Service Worker] Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Prend le contrôle immédiatement
  event.waitUntil(clients.claim());
});

// --- 3. ÉVÉNEMENT DE RÉCUPÉRATION (Servir depuis le cache en premier) ---
self.addEventListener('fetch', (event) => {
  // N'intercepte pas les requêtes non-HTTP (comme chrome-extension://)
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Si la ressource est dans le cache, on la sert !
          if (response) {
            return response;
          }
          // Sinon, on va sur le réseau pour la chercher
          return fetch(event.request);
        })
    );
  }
});