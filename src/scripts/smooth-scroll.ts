import Lenis from "lenis";

(function () {
    let lenisInstance: Lenis | null = null;

    function initLenis() {
        if (typeof window === "undefined") return;

        if (lenisInstance) {
            try { lenisInstance.destroy(); } catch { /* ignore */ }
            lenisInstance = null;
        }

        const prefersReduced =
            window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
            try { lenisInstance.destroy(); } catch { /* ignore */ }
            lenisInstance = null;
            (window as unknown as Record<string, unknown>).__lenis = null;
        }
    }

    initLenis();

    document.addEventListener("astro:page-load", initLenis);
    document.addEventListener("astro:before-swap", () => { try { cleanup(); } catch { /* ignore */ } });
})();
