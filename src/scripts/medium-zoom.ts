import mediumZoom from "medium-zoom";

function initMediumZoom() {
    const images = document.querySelectorAll<HTMLImageElement>(
        "article img:not([data-no-zoom], .expressive-code img, .admonition img, .github-card img, .no-zoom img)",
    );

    if (!images.length) return;

    const zoom = mediumZoom(images, {
        margin: 24,
        background: "oklch(from var(--color-global-bg) l c h / 0.92)",
        scrollOffset: 0,
    });

    document.addEventListener(
        "astro:before-swap",
        () => {
            try { zoom.detach(); } catch { /* ignore */ }
        },
        { once: true },
    );
}

document.addEventListener("astro:page-load", initMediumZoom);
