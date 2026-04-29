// SW 更新检测与用户提示支持
// 当检测到等待中的新 SW 时，派发 `sw:updateAvailable` 事件。
// 页面可以监听该事件并提示用户是否更新。只有在用户确认时才会调用 skipWaiting 并刷新页面。
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
	(async () => {
		try {
			// 尝试注册项目根目录下的 service-worker
			try {
				await navigator.serviceWorker.register("/service-worker.js");
			} catch (e) {
				// 可能已由其它注册控制，忽略错误
			}

			const reg = await navigator.serviceWorker.getRegistration();
			if (!reg) return;

			const notifyUpdateAvailable = (worker) => {
				try {
					// 设定全局标志，避免在页面还未安装监听器时错过通知
					window.__sw_update_available = true;
					window.__sw_update_detail = { hasWaiting: !!worker };
					const ev = new CustomEvent("sw:updateAvailable", { detail: { hasWaiting: !!worker } });
					window.dispatchEvent(ev);
				} catch (e) {
					// ignore
				}
			};

			// 如果已经有 waiting worker，通知页面
			if (reg.waiting) notifyUpdateAvailable(reg.waiting);

			// 监听安装过程以检测新 worker
			reg.addEventListener("updatefound", () => {
				const newWorker = reg.installing;
				newWorker?.addEventListener("statechange", () => {
					if (newWorker.state === "installed" && reg.waiting) notifyUpdateAvailable(reg.waiting);
				});
			});

			// 暴露激活函数，页面在用户确认时调用
			window.__sw_update_activate = async () => {
				try {
					const registration = await navigator.serviceWorker.getRegistration();
					if (!registration?.waiting) return;
					registration.waiting.postMessage({ type: "SKIP_WAITING" });
				} catch (e) {
					// ignore
				}
			};

			// 当控制器改变（新 SW 接管）时刷新页面一次
			navigator.serviceWorker.addEventListener("controllerchange", () => {
				if (window.__sw_reloading) return;
				window.__sw_reloading = true;
				window.location.reload();
			});
		} catch (err) {
			console.info("sw-update: registration check failed", err);
		}
	})();
}

/*
Notes:
- This script requests the waiting SW to skip waiting by posting {type:'SKIP_WAITING'}.
- The generated SW must handle this message and call `self.skipWaiting()` when received.
- If the SW does not implement a message handler, you should add one to the SW build (or enable skipWaiting/clientsClaim in generator).
*/
