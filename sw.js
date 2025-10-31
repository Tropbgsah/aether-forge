// sw.js
// Version du cache augmentée pour forcer le Service Worker à se mettre à jour
const CACHE_NAME = 'aether-forge-cache-v3'; 

// Liste des fichiers à mettre en cache. TOUS les chemins internes DOIVENT inclure /aether-forge/.
const URLS_TO_CACHE = [
  '/aether-forge/', // Représente la page d'accueil du sous-dossier
  '/aether-forge/index.html',
  '/aether-forge/manifest.json',
  '/aether-forge/sw.js',
  '/aether-forge/af.png', // Ton icône
  // URL externe non modifiée
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js' 
];

// --- 1. ÉVÉNEMENT D'INSTALLATION (Mise en cache) ---
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install. Pré-caching des ressources...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Tente d'ajouter tous les fichiers au cache
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch((error) => {
        // En cas d'échec (souvent dû à une URL non trouvée), l'erreur est ici
        console.error('Échec du pré-caching, vérifiez les chemins URLS_TO_CACHE :', error);
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
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la ressource est dans le cache, on la sert
        if (response) {
          return response;
        }
        
        // Sinon, on va sur le réseau pour la chercher
        return fetch(event.request).catch(() => {
            // Logique de fallback si la requête échoue et n'est pas dans le cache
        });
      })
  );
});
