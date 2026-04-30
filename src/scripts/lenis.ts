import Lenis from "lenis";

declare global {
	interface Window {
		lenis?: Lenis;
	}
}

function initLenis() {
	if (typeof window === "undefined") return;

	if (window.lenis && typeof window.lenis.destroy === "function") {
		try {
			window.lenis.destroy();
		} catch {
			/* ignore */
		}
		delete window.lenis;
	}

	const prefersReduced =
		window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (prefersReduced) return;

	const lenis = new Lenis({
		duration: 1.2,
		easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
		smoothWheel: true,
		wheelMultiplier: 0.8,
		smoothTouch: false,
		autoRaf: false,
	});

	window.lenis = lenis;

	let rafId: number | null = null;
	const loop = (time: number) => {
		try {
			lenis.raf(time);
		} catch {
			/* ignore */
		}
		rafId = requestAnimationFrame(loop);
	};

	rafId = requestAnimationFrame(loop);

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

	const onResize = () => {
		try {
			lenis.resize();
		} catch {
			/* ignore */
		}
	};
	window.addEventListener("resize", onResize, { passive: true });

	const cleanup = () => {
		document.removeEventListener("visibilitychange", onVisibility);
		window.removeEventListener("resize", onResize);
		if (rafId) cancelAnimationFrame(rafId);
		try {
			lenis.destroy();
		} catch {
			/* ignore */
		}
		delete window.lenis;
	};

	document.addEventListener("astro:before-swap", cleanup, { once: true });
}

initLenis();
document.addEventListener("astro:page-load", initLenis);

export {};
