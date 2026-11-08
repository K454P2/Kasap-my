
/* KASAP MARKETPLACE SERVICE WORKER */

const CACHE_NAME = "kasap-marketplace-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js"
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(APP_FILES)
    )
  );

  self.skipWaiting();
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Jangan cache API Supabase atau pembayaran
  if (
    url.hostname.includes("supabase.co") ||
    url.hostname.includes("doku.com")
  ) {
    return;
  }

  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, copy);
          });
        }

        return response;
      })
      .catch(() =>
        caches.match(request).then(cached =>
          cached || caches.match("./index.html")
                                   if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./server-worker.js")
      .then(() => console.log("Kasap offline siap"))
      .catch(error => console.error(error));
  });
}
        )
      )
  );
});
