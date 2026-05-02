import Lenis from "lenis";

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

    const prefersReduced =
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.8,
        syncTouch: false,
        autoRaf: false,
        prevent: (node: Element) => {
            if (!node) return false;
            return (
                node.hasAttribute("data-lenis-prevent") ||
                node.closest("[data-lenis-prevent]") !== null
            );
        },
    });

    (window as any).__lenis = lenisInstance;

    let rafId: number | null = null;
    const loop = (time: number) => {
        if (!lenisInstance) return;
        try {
            lenisInstance.raf(time);
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
        if (!lenisInstance) return;
        try {
            lenisInstance.resize();
        } catch {
            /* ignore */
        }
    };
    window.addEventListener("resize", onResize, { passive: true });

    const cleanup = () => {
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("resize", onResize);
        if (rafId) cancelAnimationFrame(rafId);
        if (lenisInstance) {
            try { lenisInstance.destroy(); } catch { /* ignore */ }
            lenisInstance = null;
            (window as any).__lenis = null;
        }
    };

    document.addEventListener("astro:before-swap", () => {
        try { cleanup(); } catch { /* ignore */ }
    });
}

initLenis();
document.addEventListener("astro:page-load", initLenis);

export { };
