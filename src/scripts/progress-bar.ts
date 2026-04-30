function initProgressBar() {
    const bar = document.getElementById("reading-progress");
    if (!bar) return;

    const article = document.querySelector("article");
    if (!article) {
        bar.style.opacity = "0";
        return;
    }

    let rafId: number | null = null;

    const update = () => {
        rafId = null;
        const scrollTop = window.scrollY;
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const viewportHeight = window.innerHeight;
        const totalScroll = articleHeight - viewportHeight;

        if (totalScroll <= 0) {
            bar.style.width = "0%";
            return;
        }

        const scrolled = scrollTop - articleTop;
        const progress = Math.min(100, Math.max(0, (scrolled / totalScroll) * 100));
        bar.style.width = `${progress}%`;
    };

    const onScroll = () => {
        if (!rafId) rafId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    document.addEventListener(
        "astro:before-swap",
        () => {
            try {
                window.removeEventListener("scroll", onScroll);
                if (rafId) cancelAnimationFrame(rafId);
            } catch { /* ignore */ }
        },
        { once: true },
    );
}

document.addEventListener("astro:page-load", initProgressBar);
