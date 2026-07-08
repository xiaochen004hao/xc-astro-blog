import Lenis from "lenis";

(() => {
	let lenisInstance: Lenis | null = null;

	function initLenis() {
		if (typeof window === "undefined") return;

		if (lenisInstance) {
			try {
				lenisInstance.destroy();
			} catch {
				/* ignore */
			}
			lenisInstance = null;
		}

		const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
		if (prefersReduced) return;

		lenisInstance = new Lenis({
			autoRaf: true,
			allowNestedScroll: true,
			lerp: 0.1,
			wheelMultiplier: 0.8,
			smoothWheel: true,
			gestureOrientation: "both",
		});

		(window as unknown as Record<string, unknown>).__lenis = lenisInstance;
	}

	function cleanup() {
		if (lenisInstance) {
			try {
				lenisInstance.destroy();
			} catch {
				/* ignore */
			}
			lenisInstance = null;
			(window as unknown as Record<string, unknown>).__lenis = null;
		}
	}

	// 浏览器恢复历史滚动位置时，html.scroll-smooth (CSS scroll-behavior:smooth)
	// 和 Lenis 都会让滚动产生缓动动画。
	// 接管滚动位置恢复：禁用浏览器自动恢复，在页面加载时直接跳转（无动画）。
	if ("scrollRestoration" in history) {
		history.scrollRestoration = "manual";
	}

	function restoreScroll() {
		// 从 sessionStorage 读取本页路径对应的滚动位置
		const path = window.location.pathname;
		const saved = sessionStorage.getItem(`scroll:${path}`);
		if (!saved) return;
		const y = Number.parseInt(saved, 10);
		if (!(y > 0)) return;

		const html = document.documentElement;

		// 1. 用 inline style 覆盖 scroll-smooth（比 toggle class 更可靠）
		html.style.scrollBehavior = "auto";

		// 2. 如果 Lenis 已激活（首次加载场景），用其 immediate 模式跳转
		const win = window as unknown as {
			__lenis?: {
				scrollTo: (
					target: number | HTMLElement | string,
					opts?: { immediate?: boolean; offset?: number },
				) => void;
			};
		};
		if (win.__lenis?.scrollTo) {
			win.__lenis.scrollTo(y, { immediate: true });
		} else {
			window.scrollTo(0, y);
		}

		// 3. 下一帧恢复 inline style（让 scroll-smooth class 重新生效）
		requestAnimationFrame(() => {
			html.style.scrollBehavior = "";
		});
	}

	// 保存滚动位置（在页面切换前）
	function saveScroll() {
		const path = window.location.pathname;
		sessionStorage.setItem(`scroll:${path}`, String(window.scrollY));
	}

	initLenis();

	document.addEventListener("astro:page-load", () => {
		restoreScroll();
		initLenis();
	});
	document.addEventListener("astro:before-swap", () => {
		saveScroll();
		try {
			cleanup();
		} catch {
			/* ignore */
		}
	});
	// 页面卸载前也保存一次（刷新场景）
	window.addEventListener("pagehide", saveScroll);
})();
