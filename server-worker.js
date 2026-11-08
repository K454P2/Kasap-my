
/* KASAP MARKETPLACE SERVICE WORKER */

const CACHE_NAME = "kasap-marketplace-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(APP_FILES)
    )
  );

  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith("kasap-marketplace-") &&
                         key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  // Jangan cache API dan pembayaran
  if (
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("doku.com")
  ) {
    return;
  }

  // Hanya cache file dari website Kasap
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      })
      .catch(() =>
        caches.match(request).then(cached => {
          return cached || caches.match("./index.html");
        })
      )
  );
});
