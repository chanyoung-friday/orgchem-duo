const CACHE = "orgchem-v3";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const isSync = e.request.url.indexOf("sync.json") >= 0;
  e.respondWith(
    fetch(e.request).then(r => {
      if (!isSync) {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      }
      return r;
    }).catch(() =>
      isSync
        ? new Response("[]", { headers: { "Content-Type": "application/json" } })
        : caches.match(e.request).then(m => m || caches.match("./index.html"))
    )
  );
});
