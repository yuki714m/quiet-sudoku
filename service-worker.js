const CACHE_NAME = "quiet-sudoku-pwa-v7";
const APP_SHELL = [
  "./",
  "./index.html",
  "./src/style.css",
  "./src/puzzles.js",
  "./src/hints.js",
  "./src/app.js",
  "./manifest.webmanifest",
  "./assets/icons/quiet-sudoku-icon.svg",
  "./assets/icons/quiet-sudoku-192.png",
  "./assets/icons/quiet-sudoku-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => {
        if (key.startsWith("quiet-sudoku-pwa-") && key !== CACHE_NAME) {
          return caches.delete(key);
        }
        return Promise.resolve();
      })))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => response)
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
