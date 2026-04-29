// Minimal service worker to ensure new versions can activate quickly.
// This worker intentionally does not implement complex caching strategies;
// it's only responsible for accepting skipWaiting messages and claiming clients.

self.addEventListener("install", (event) => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	self.clients.claim();
});

self.addEventListener("message", (event) => {
	try {
		const data = event.data;
		if (!data) return;
		if (data.type === "SKIP_WAITING") {
			self.skipWaiting();
		}
	} catch (e) {
		// ignore
	}
});

// Optional: passthrough fetch (do nothing special)
self.addEventListener("fetch", (event) => {
	// Let the network handle requests by default.
});
