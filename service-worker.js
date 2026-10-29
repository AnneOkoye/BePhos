// BePhos service worker — app shell caching for fast loads and basic offline access.
// v2 (Oct 2026): v1 listed /icon.svg and /manifest.json, which didn't exist, so cache.addAll()
// failed and the worker never installed. Every file below now exists in the repo.
const CACHE_NAME = 'bephos-cache-v6';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/bephos-client.js',
  '/bephos-marks.js',
  '/marks-emblems.js',
  '/marks-colour.js',
  '/manifest.json',
  '/icon-192.png',
  '/bephos-mark.png',
  '/vendor/supabase-js-2.117.3.js',
  '/fonts/figtree-latin.woff2',
  '/fonts/bricolage-latin.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Navigation requests (the app shell itself): network-first, so updates are
  // picked up when online, with a cached fallback when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Everything else same-origin (JS, icons, manifest): cache-first, falling
  // back to network, then updating the cache in the background.
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
  // Cross-origin requests (the Supabase API) are left
  // to the network as-is — they're either dynamic data or already CDN-cached.
});
