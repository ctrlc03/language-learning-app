// Bump this to invalidate old caches on deploy.
const VERSION = 'v2';
const STATIC_CACHE = `kotoba-static-${VERSION}`;
const PAGES_CACHE = `kotoba-pages-${VERSION}`;
const OFFLINE_URL = '/offline';

// Must-have for offline shell.
const CRITICAL_URLS = [OFFLINE_URL, '/manifest.webmanifest'];

// Main app routes — warmed on install so first home-screen launch works even offline.
const WARM_URLS = [
  '/',
  '/dashboard',
  '/vocabulary',
  '/flashcards',
  '/listening',
  '/exercises',
  '/settings',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE);
      // Critical: if any of these fail, install fails and we retry.
      await staticCache.addAll(CRITICAL_URLS);

      // Warm: best-effort. A flaky route shouldn't block install.
      const pagesCache = await caches.open(PAGES_CACHE);
      await Promise.allSettled(
        WARM_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { credentials: 'same-origin' });
            if (res.ok) await pagesCache.put(url, res);
          } catch {}
        }),
      );
    })(),
  );
  self.skipWaiting();
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, PAGES_CACHE].includes(k))
          .map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache AI / API calls — they need the network.
  if (url.pathname.startsWith('/api/')) return;

  // Navigation requests: network-first, fall back to cached page, then offline page.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (fresh.ok) {
            const cache = await caches.open(PAGES_CACHE);
            cache.put(request, fresh.clone());
          }
          return fresh;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          return offline ?? Response.error();
        }
      })(),
    );
    return;
  }

  // Static assets (JS, CSS, fonts, images, _next): stale-while-revalidate.
  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached ?? network;
    })(),
  );
});
