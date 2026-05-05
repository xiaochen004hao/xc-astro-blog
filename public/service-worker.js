const CACHE_VERSION = "v4.0.0-2026-05-06"
const CACHE_NAME = `xcblog-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
    "/manifest.webmanifest",
    "/icon.svg",
    "/icon-light.svg",
    "/icon-dark.svg",
    "/favicon.ico",
    "https://cdn.jsdelivr.net/npm/lxgw-wenkai-lite-webfont@1.0.0/lxgwwenkailite-regular.css",
    "https://cdn.jsdelivr.net/npm/lxgw-wenkai-lite-webfont@1.0.0/lxgwwenkailite-bold.css",
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
		*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
		body{font-family:system-ui,-apple-system,sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fafafa;color:#2c2c2c}
		@media(prefers-color-scheme:dark){body{background:#18181b;color:#e4e4e7}}
		main{text-align:center;padding:2rem;max-width:30rem}
		.status{font-size:5rem;font-weight:200;line-height:1;margin-bottom:.75rem;color:#a1a1aa}
		@media(prefers-color-scheme:dark){.status{color:#52525b}}
		h1{font-size:1.25rem;font-weight:500;margin-bottom:.75rem;letter-spacing:.02em}
		p{font-size:.875rem;color:#71717a;line-height:1.7}
		@media(prefers-color-scheme:dark){p{color:#a1a1aa}}
		button{display:inline-block;margin-top:1.5rem;padding:.6rem 1.5rem;border:1px solid #d4d4d8;background:transparent;color:#52525b;font-size:.875rem;cursor:pointer;transition:background .15s}
		@media(prefers-color-scheme:dark){button{border-color:#3f3f46;color:#a1a1aa}}
		button:hover{background:rgba(0,0,0,.03)}
		@media(prefers-color-scheme:dark){button:hover{background:rgba(255,255,255,.03)}}
	</style>
</head>
<body>
	<main>
		<div class="status">503</div>
		<h1>离线模式</h1>
		<p>当前没有网络连接，请检查网络后重试。</p>
		<button onclick="location.reload()">重新加载</button>
	</main>
</body>
</html>
`;

self.addEventListener("install", (event) => {
    event.waitUntil(precacheAll());
});

async function precacheAll() {
    const cache = await caches.open(CACHE_NAME);
    const urls = [...PRECACHE_ASSETS, ...PAGEFIND_CORE];
    const results = await Promise.allSettled(
        urls.map((url) =>
            fetch(url, { credentials: "same-origin" })
                .then((res) => {
                    if (res.ok) return cache.put(url, res);
                    throw new Error(`HTTP ${res.status}`);
                })
                .catch((err) => {
                    console.warn(`[SW] precache failed: ${url}`, err.message);
                }),
        ),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    console.log(`[SW] precached ${succeeded}/${urls.length} assets`);
}

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
            );
        })(),
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== "GET") return;
    if (!url.protocol.startsWith("http")) return;

    if (isHtmlPage(request)) {
        event.respondWith(handleHtmlRequest(request));
    } else {
        event.respondWith(handleStaticRequest(request));
    }
});

function isHtmlPage(request) {
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return false;

    const acceptHeader = request.headers.get("Accept") || "";
    if (acceptHeader.includes("text/html")) return true;
    if (request.mode === "navigate") return true;
    if (request.destination === "document") return true;

    return false;
}

async function handleHtmlRequest(request) {
    const cachedResponse = await caches.match(request);
    const cache = await caches.open(CACHE_NAME);

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const clonedResponse = networkResponse.clone();
            cache.put(request, clonedResponse).catch(() => {});
        }

        return networkResponse;
    } catch (error) {
        if (cachedResponse) {
            console.log(`[SW] serving from cache: ${request.url}`);
            return cachedResponse;
        }

        console.log(`[SW] offline, no cache for: ${request.url}, showing offline page`);
        return getOfflinePage();
    }
}

async function handleStaticRequest(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone()).catch(() => {});
        }
        return networkResponse;
    } catch {
        return new Response("", { status: 408, statusText: "Request Timeout" });
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
