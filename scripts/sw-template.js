const CACHE_VERSION = "__CACHE_VERSION__";
const OFFLINE_PAGE = "/service-worker-offline.html";
// pagefind 文件列表由 scripts/inject-pagefind.mjs 注入到下方占位符
const PAGEFIND_FILES = __PAGEFIND_FILES__;
// Vditor 编辑器资源文件列表（构建时扫描 dist/vditor/dist/ 注入）
const VDITOR_FILES = __VDITOR_FILES__;
// 核心静态资源：favicon、主题图标、manifest、表情包元数据、鼠标光标
// 主题切换时 favicon 会在 icon-light.svg / icon-dark.svg 间切换，两者都要缓存
// 光标文件离线页和主站都要用，必须预缓存
const STATIC_ASSETS = [
	"/favicon.ico",
	"/icon.svg",
	"/icon-light.svg",
	"/icon-dark.svg",
	"/manifest.webmanifest",
	"/emojis/bmoji/info.json",
	"/emojis/bilibili/info.json",
	"/w11-cursor-concept-free/arrow.cur",
	"/w11-cursor-concept-free/hand.cur",
	"/w11-cursor-concept-free/ibeam.cur",
	"/w11-cursor-concept-free/no.cur",
	"/w11-cursor-concept-free/help.cur",
	"/w11-cursor-concept-free/sizeall.cur",
	"/w11-cursor-concept-free/crosshair.cur",
	"/w11-cursor-concept-free/sizens.cur",
	"/w11-cursor-concept-free/sizewe.cur",
	"/w11-cursor-concept-free/sizenesw.cur",
	"/w11-cursor-concept-free/sizenwse.cur",
	"/w11-cursor-concept-free/person.cur",
	"/w11-cursor-concept-free/uparrow.cur",
	"/w11-cursor-concept-free/wait.ani",
];
const PRECACHE = [OFFLINE_PAGE, "/", ...STATIC_ASSETS, ...PAGEFIND_FILES, ...VDITOR_FILES];

self.addEventListener("install", (evt) => {
	console.log("[sw] install", CACHE_VERSION);
	evt.waitUntil(
		caches
			.open(CACHE_VERSION)
			.then((cache) => {
				return Promise.allSettled(
					PRECACHE.map((path) =>
						cache
							.add(new Request(path, { mode: "no-cors" }))
							.then(() => console.log("[sw] precached", path))
							.catch((err) => console.warn("[sw] failed to precache", path, err)),
					),
				);
			})
			.then(() => self.skipWaiting()),
	);
});

self.addEventListener("activate", (evt) => {
	console.log("[sw] activate", CACHE_VERSION);
	evt.waitUntil(
		caches
			.keys()
			.then((cacheNames) =>
				Promise.all(
					cacheNames
						.filter((name) => name !== CACHE_VERSION)
						.map((name) => {
							console.log("[sw] deleting old cache", name);
							return caches.delete(name);
						}),
				),
			)
			.then(() => self.clients.claim()),
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
	return fetch(request)
		.then((response) => {
			if (response.ok || response.type === "basic") {
				const clone = response.clone();
				caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
			}
			return response;
		})
		.catch(() => {
			return caches.match(request).then((cached) => {
				if (cached) return cached;
				return caches.match(OFFLINE_PAGE).then((offline) => offline || defaultOfflineResponse());
			});
		});
}

function staleWhileRevalidate(request) {
	return caches.match(request).then((cached) => {
		const fetchPromise = fetch(request)
			.then((networkResponse) => {
				if (networkResponse.ok || networkResponse.type === "basic") {
					const clone = networkResponse.clone();
					caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
				}
				return networkResponse;
			})
			.catch(() => cached || Response.error());
		if (cached) {
			return cached;
		}
		return fetchPromise;
	});
}

function networkFirst(request) {
	return fetch(request)
		.then((response) => {
			if (response.ok || response.type === "basic") {
				const clone = response.clone();
				caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
			}
			return response;
		})
		.catch(() => caches.match(request));
}

function defaultOfflineResponse() {
	return new Response(
		"<!DOCTYPE html><html lang='zh-CN'><meta charset='utf-8'><title>离线</title><body><h1>离线</h1></body></html>",
		{ headers: { "Content-Type": "text/html; charset=utf-8" } },
	);
}
