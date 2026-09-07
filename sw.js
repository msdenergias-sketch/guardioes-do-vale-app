// Service worker simples: garante que o app abra rápido (e no modo instalado)
// mesmo com internet fraca. Não guarda dados sensíveis do Drive.
const CACHE_NAME = "trilha-desbravador-v1";
const CORE_ASSETS = ["./index.html", "./manifest.json", "./icon.png"];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){ return cache.addAll(CORE_ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.filter(function(n){ return n !== CACHE_NAME; }).map(function(n){ return caches.delete(n); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(event){
  if(event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      const fetchPromise = fetch(event.request).then(function(networkResp){
        if(networkResp && networkResp.ok){
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, networkResp.clone()); });
        }
        return networkResp;
      }).catch(function(){ return cached; });
      return cached || fetchPromise;
    })
  );
});
