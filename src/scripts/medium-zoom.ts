import mediumZoom from "medium-zoom";

let currentZoom: ReturnType<typeof mediumZoom> | null = null;

function injectZoomStyles() {
    const id = "medium-zoom-injected";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent =
        ".medium-zoom-overlay{position:fixed;top:0;right:0;bottom:0;left:0;opacity:0;transition:opacity .3s;will-change:opacity}.medium-zoom--opened .medium-zoom-overlay{cursor:pointer;cursor:zoom-out;opacity:1}.medium-zoom-image{cursor:pointer;cursor:zoom-in;transition:transform .3s cubic-bezier(.2,0,.2,1)!important}.medium-zoom-image--hidden{visibility:hidden}.medium-zoom-image--opened{position:relative;cursor:pointer;cursor:zoom-out;will-change:transform}";
    document.head.appendChild(style);
}

function initMediumZoom() {
    injectZoomStyles();

    if (currentZoom) {
        try { currentZoom.detach(); } catch { /* ignore */ }
        currentZoom = null;
    }

    const images = document.querySelectorAll<HTMLImageElement>(
        "article img:not([data-no-zoom], .expressive-code img, .admonition img, .github-card img, .no-zoom img)",
    );

    if (!images.length) return;

    currentZoom = mediumZoom(images, {
        margin: 24,
        background: "oklch(from var(--color-global-bg) l c h / 0.92)",
        scrollOffset: 0,
    });

    currentZoom.on("open", () => { (window as any).__lenis?.stop?.(); });
    currentZoom.on("closed", () => { (window as any).__lenis?.start?.(); });
}

document.addEventListener("astro:before-swap", () => {
    if (currentZoom) {
        try { currentZoom.detach(); } catch { /* ignore */ }
        currentZoom = null;
    }
});

document.addEventListener("astro:page-load", () => {
    requestAnimationFrame(() => {
        requestAnimationFrame(initMediumZoom);
    });
});
