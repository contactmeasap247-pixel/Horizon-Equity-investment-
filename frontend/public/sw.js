// ============================================
// HORIZON EQUITY - PROGRESSIVE WEB APP SERVICE WORKER
// Strict Financial Security: Never caches sensitive private financial API data
// ============================================

const CACHE_NAME = "horizon-equity-v1.0.0";

// Static assets eligible for offline caching
const PRECACHE_ASSETS = [
  "/",
  "/favicon.ico",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon.svg",
];

// Install Event: Pre-cache static shell
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Pre-cache warning:", err);
      });
    })
  );
});

// Activate Event: Clean up outdated legacy caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Intelligent routing with STRICT financial data security
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. STRICT FINANCIAL EXCLUSION:
  // API endpoints (/api/*), auth tokens, wallet balances, transactions, investments,
  // and deposits MUST NEVER be stored in CacheStorage. Always fetch live from network!
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/wallets") ||
    url.pathname.includes("/investments") ||
    url.pathname.includes("/transactions") ||
    url.pathname.includes("/admin") ||
    req.method !== "GET"
  ) {
    event.respondWith(fetch(req));
    return;
  }

  // 2. Static Next.js Bundles and Icons: Stale-While-Revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2|woff|css|js)$/)
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(req).then((cachedResponse) => {
          const fetchPromise = fetch(req)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(req, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 3. Navigation Requests: Network-First with Cache Fallback
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            return cached || caches.match("/");
          });
        })
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

