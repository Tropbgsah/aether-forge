// sw.js
// Version mise à jour pour inclure Chart.js et les fichiers de ton dépôt GitHub

const CACHE_NAME = 'aether-forge-cache-v2'; // J'ai augmenté la version à 'v2' pour forcer la mise à jour
// Liste des fichiers essentiels pour que le site fonctionne hors ligne
const URLS_TO_CACHE = [
  '/', 
  '/index.html',
  '/manifest.json',
  '/sw.js',
  '/af.png', // Ton icône
  // *** NOUVEAU : Inclure la librairie externe Chart.js ***
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js' 
  // AJOUTE ICI TES AUTRES FICHIERS (CSS, JS personnels)
];

// --- 1. ÉVÉNEMENT D'INSTALLATION (Mise en cache) ---
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install. Pré-caching des ressources...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Le cache.addAll() échoue si un seul fichier n'est pas trouvé
        // Assure-toi que tous les chemins sont corrects !
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
  event.waitUntil(clients.claim());
});

// --- 3. ÉVÉNEMENT DE RÉCUPÉRATION (Servir depuis le cache en premier) ---
self.addEventListener('fetch', (event) => {
  // Cette condition assure que nous mettons en cache les fichiers de la même origine
  // ET les fichiers externes spécifiés (comme Chart.js)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la ressource est dans le cache, on la sert immédiatement
        if (response) {
          return response;
        }
        
        // Si elle n'est pas dans le cache, on va sur le réseau pour la chercher
        return fetch(event.request).catch(() => {
            // Optionnel : Gérer une page de fallback pour les requêtes non trouvées (si tu as une page hors ligne dédiée)
            console.log("Requête réseau échouée et non trouvée dans le cache.");
        });
      })
  );
});
