try {
    function initBackToTop() {
        const btn = document.getElementById("to-top-btn") as HTMLButtonElement | null;
        const target = document.getElementById("blog-hero") as HTMLDivElement | null;
        if (!btn || !target) return;

        btn.addEventListener("click", () => {
            const lenis = (window as unknown as Record<string, unknown>).__lenis as {
                scrollTo: (target: number | string, options?: { offset?: number }) => void;
            } | null;

            if (lenis?.scrollTo) {
                lenis.scrollTo(0);
            } else {
                window.scrollTo({ behavior: "smooth", top: 0 });
            }
        });

        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                btn.dataset.show = (!entry.isIntersecting).toString();
            }
        });
        observer.observe(target);

        document.addEventListener("astro:before-swap", () => {
            try { observer.disconnect(); } catch { /* ignore */ }
        });
    }

    document.addEventListener("astro:page-load", initBackToTop);
} catch { }
