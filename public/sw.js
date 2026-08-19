const CACHE_NAME = 'hunchotv-shell-v2';
const DYNAMIC_CACHE = 'hunchotv-dynamic-v2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/placeholder-poster.png',
  '/manifest.json'
];

// Install Event - Precache static app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Stale-While-Revalidate strategy for TMDB images & API GETs
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // DO NOT CACHE: Video streams, HLS segments, or Supabase authenticated requests
  if (
    url.pathname.endsWith('.m3u8') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.mp4') ||
    url.hostname.includes('supabase.co') ||
    url.pathname.includes('/stream') ||
    url.pathname.includes('/download-resolver')
  ) {
    return;
  }

  // Intercept TMDB Posters, Images & TMDB API Requests
  if (
    url.hostname.includes('image.tmdb.org') ||
    url.hostname.includes('api.themoviedb.org') ||
    url.hostname.includes('wsrv.nl') ||
    url.pathname.startsWith('/api/') ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((err) => {
            console.warn('[SW] Offline fetch fallback:', err);
            return cachedResponse;
          });

          return cachedResponse || fetchPromise;
        });
      })
    );
  }
});
