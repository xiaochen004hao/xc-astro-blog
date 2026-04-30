const CACHE_VERSION = "v2.0.0";
const CACHE_NAME = `xcblog-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
    "/manifest.webmanifest",
    "/icon.svg",
    "/icon-light.svg",
    "/icon-dark.svg",
    "/favicon.ico",
    "https://cdn.jsdelivr.net/npm/lxgw-wenkai-lite-webfont@1.0.0/style.css",
];

const PAGEFIND_CORE = __PAGEFIND_FILES__;

const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>离线 - XCBlog</title>
	<style>
		body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: oklch(0.18 0 0); color: oklch(83.54% 0 264); }
		.container { text-align: center; padding: 2rem; }
		h1 { font-size: 2rem; margin-bottom: 0.5rem; color: oklch(85.06% 0.141 194.84); }
		p { color: oklch(70.7% 0.022 261.325); }
		button { margin-top: 1rem; padding: 0.5rem 1.5rem; border: 1px solid oklch(85.06% 0.141 194.84); background: transparent; color: oklch(85.06% 0.141 194.84); border-radius: 4px; cursor: pointer; }
		button:hover { background: oklch(85.06% 0.141 194.84 / 0.1); }
	</style>
</head>
<body>
	<div class="container">
		<h1>📡</h1>
		<h1>离线模式</h1>
		<p>当前没有网络连接，请检查网络后重试。</p>
		<p><button onclick="location.reload()">重新加载</button></p>
	</div>
</body>
</html>
`;

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            await Promise.allSettled(
                [...PRECACHE_ASSETS, ...PAGEFIND_CORE].map((url) =>
                    cache.add(url).catch(() => { }),
                ),
            );
        })(),
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
            );
            await self.clients.claim();
        })(),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== "GET") return;
    if (!url.protocol.startsWith("http")) return;

    if (isHtmlPage(request)) {
        event.respondWith(staleWhileRevalidate(request));
    } else {
        event.respondWith(cacheFirst(request));
    }
});

function isHtmlPage(request) {
    const acceptHeader = request.headers.get("Accept") || "";
    return (
        acceptHeader.includes("text/html") ||
        request.mode === "navigate" ||
        request.destination === "document"
    );
}

async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch {
        if (request.mode === "navigate") {
            const indexResponse = await caches.match("/");
            if (indexResponse) return indexResponse;
            return getOfflinePage();
        }
        return new Response("", { status: 503, statusText: "Offline" });
    }
}

async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        fetch(request)
            .then((networkResponse) => {
                if (networkResponse.ok) {
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
                }
            })
            .catch(() => { });
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch {
        if (request.mode === "navigate") {
            const indexResponse = await caches.match("/");
            if (indexResponse) return indexResponse;
            return getOfflinePage();
        }
        return new Response("", { status: 503, statusText: "Offline" });
    }
}

function getOfflinePage() {
    return new Response(OFFLINE_PAGE, {
        status: 503,
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
}

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
