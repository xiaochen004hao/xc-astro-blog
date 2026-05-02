try {
    function initBackToTop() {
        const btn = document.getElementById("to-top-btn") as HTMLButtonElement | null;
        const target = document.getElementById("blog-hero") as HTMLDivElement | null;
        if (!btn || !target) return;

        btn.addEventListener("click", () => {
            document.documentElement.scrollTo({ behavior: "smooth", top: 0 });
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
