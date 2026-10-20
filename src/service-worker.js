import { build, version } from "$service-worker";
const cache_name = `referise-assets-${version}`;
const assets = [
  ...build,
  "/offline.html",
  "/app-icon-192.png",
  "/app-icon-512.png",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cache_name).then((cache) => cache.addAll(assets)),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("referise-assets-") && key !== cache_name,
            )
            .map((key) => caches.delete(key)),
        ),
      ),
  );
});
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    new URL(event.request.url).origin !== self.location.origin
  )
    return;
  const path = new URL(event.request.url).pathname;
  if (assets.includes(path)) {
    event.respondWith(
      caches
        .open(cache_name)
        .then(
          async (cache) =>
            (await cache.match(event.request)) || fetch(event.request),
        ),
    );
  } else if (event.request.mode === "navigate") {
    // Account pages and API responses must never enter the offline cache.
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html")),
    );
  }
});
