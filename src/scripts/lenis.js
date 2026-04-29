// 在浏览器环境中动态初始化 Lenis，添加可访问性与性能保护
if (typeof window !== "undefined") {
	(async () => {
		try {
			// 如果已有实例，先清理
			if (window.lenis && typeof window.lenis.destroy === "function") {
				try {
					window.lenis.destroy();
				} catch (e) {
					/* ignore */
				}
			}

			const { default: Lenis } = await import("lenis");

			// 尊重“减少动画”首选项
			const prefersReduced =
				window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			if (prefersReduced) {
				console.info("prefers-reduced-motion: Lenis disabled");
				return;
			}

			const lenis = new Lenis({
				duration: 1.2,
				easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
				smoothWheel: true,
				wheelMultiplier: 0.8,
				smoothTouch: false,
				autoRaf: false, // 使用手动 RAF 控制，便于在页面不可见时暂停
			});

			// 暴露实例以便调试或其他脚本使用
			window.lenis = lenis;

			let rafId = null;
			const loop = (time) => {
				try {
					lenis.raf(time);
				} catch (e) {
					/* ignore */
				}
				rafId = requestAnimationFrame(loop);
			};

			rafId = requestAnimationFrame(loop);

			// 可见性变化时暂停/恢复 RAF，节省 CPU
			const onVisibility = () => {
				if (document.hidden) {
					if (rafId) {
						cancelAnimationFrame(rafId);
						rafId = null;
					}
				} else if (!rafId) {
					rafId = requestAnimationFrame(loop);
				}
			};
			document.addEventListener("visibilitychange", onVisibility, { passive: true });

			// resize 处理
			const onResize = () => {
				try {
					lenis.resize();
				} catch (e) {
					/* ignore */
				}
			};
			window.addEventListener("resize", onResize, { passive: true });

			// Astro 视图过渡完成时重置滚动并更新尺寸
			document.addEventListener("astro:after-swap", () => {
				try {
					if (typeof lenis.scrollTo === "function") lenis.scrollTo(0, { immediate: true });
					if (typeof lenis.resize === "function") lenis.resize();
				} catch (e) {
					/* ignore */
				}
			});

			// 提供清理函数（便于热重载或手动销毁）
			window.__lenis_cleanup = () => {
				document.removeEventListener("visibilitychange", onVisibility);
				window.removeEventListener("resize", onResize);
				document.removeEventListener("astro:after-swap", () => {});
				if (rafId) cancelAnimationFrame(rafId);
				if (lenis && typeof lenis.destroy === "function") {
					try {
						lenis.destroy();
					} catch (e) {
						/* ignore */
					}
				}
				try {
					delete window.lenis;
				} catch (e) {
					/* ignore */
				}
				try {
					delete window.__lenis_cleanup;
				} catch (e) {
					/* ignore */
				}
			};
		} catch (err) {
			console.error("Failed to initialize Lenis:", err);
		}
	})();
}
