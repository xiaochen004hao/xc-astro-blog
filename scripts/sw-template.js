const CACHE_VERSION = "__CACHE_VERSION__";
const OFFLINE_PAGE = "/service-worker-offline.html";
const PRECACHE = [OFFLINE_PAGE, "/"];

self.addEventListener("install", (evt) => {
    console.log("[sw] install", CACHE_VERSION);
    evt.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            return Promise.allSettled(
                PRECACHE.map((path) =>
                    cache.add(new Request(path, { mode: "no-cors" }))
                        .then(() => console.log("[sw] precached", path))
                        .catch((err) => console.warn("[sw] failed to precache", path, err))
                )
            );
        })
        .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (evt) => {
    console.log("[sw] activate", CACHE_VERSION);
    evt.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.filter((name) => name !== CACHE_VERSION).map((name) => {
                    console.log("[sw] deleting old cache", name);
                    return caches.delete(name);
                })
            )
        )
        .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (evt) => {
    const request = evt.request;
    const url = new URL(request.url);
    if (request.method !== "GET") return;
    if (url.origin !== location.origin) return;
    if (request.mode === "navigate") {
        evt.respondWith(handleNavigation(request));
        return;
    }
    if (["style", "script", "image", "font", "fetch"].includes(request.destination)) {
        evt.respondWith(staleWhileRevalidate(request));
        return;
    }
    evt.respondWith(networkFirst(request));
});

function handleNavigation(request) {
    return fetch(request).then((response) => {
        if (response.ok || response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        }
        return response;
    }).catch(() => {
        return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match(OFFLINE_PAGE).then((offline) => offline || defaultOfflineResponse());
        });
    });
}

function staleWhileRevalidate(request) {
    return caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse.ok || networkResponse.type === "basic") {
                const clone = networkResponse.clone();
                caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
            }
            return networkResponse;
        }).catch(() => {});
        if (cached) {
            console.log("[sw] stale: serving cache", request.url);
            return cached;
        }
        return fetchPromise;
    });
}

function networkFirst(request) {
    return fetch(request).then((response) => {
        if (response.ok || response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
        }
        return response;
    }).catch(() => caches.match(request));
}

function defaultOfflineResponse() {
    return new Response(
        "<!DOCTYPE html><html lang='zh-CN'><meta charset='utf-8'><title>离线</title><body><h1>离线</h1></body></html>",
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
}
