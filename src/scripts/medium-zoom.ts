import PhotoSwipe from "photoswipe";
import type PhotoSwipeLightbox from "photoswipe";
import "photoswipe/style.css";

interface LenisInstance {
    stop: () => void;
    start: () => void;
}

interface PhotoSwipeItem {
    src: string;
    width: number;
    height: number;
    alt?: string;
    title?: string;
}

interface PhotoSwipeOptions {
    dataSource: PhotoSwipeItem[];
    index: number;
    bgOpacity?: number;
    showHideAnimationType?: "zoom" | "none" | "fade";
    zoomAnimationDuration?: number;
    preloaderDelay?: number;
    paddingFn?: () => { top: number; bottom: number; left: number; right: number };
    closeOnVerticalDrag?: boolean;
    wheelToZoom?: boolean;
}

let photoswipeInstance: PhotoSwipeLightbox | null = null;

function getLenis(): LenisInstance | null {
    const lenis = (window as unknown as Record<string, unknown>).__lenis;
    if (typeof lenis === "object" && lenis !== null && "stop" in lenis && "start" in lenis) {
        return lenis as LenisInstance;
    }
    return null;
}

function initPhotoSwipe() {
    const images = document.querySelectorAll<HTMLImageElement>(
        "article img:not([data-no-zoom], .expressive-code img, .admonition img, .github-card img, .no-zoom img, #waline img)",
    );

    if (!images.length) return;

    images.forEach((img) => {
        img.addEventListener("click", (e) => {
            e.preventDefault();

            try {
                const index = Array.from(images).indexOf(img);
                const items: PhotoSwipeItem[] = Array.from(images).map((image) => ({
                    src: image.src,
                    width: image.naturalWidth || image.width,
                    height: image.naturalHeight || image.height,
                    alt: image.alt || "",
                    title: image.getAttribute("title") || "",
                }));

                const options: PhotoSwipeOptions = {
                    dataSource: items,
                    index: index,
                    bgOpacity: 0.9,
                    showHideAnimationType: "zoom",
                    zoomAnimationDuration: 300,
                    preloaderDelay: 0,
                    paddingFn: () => ({ top: 20, bottom: 20, left: 20, right: 20 }),
                    closeOnVerticalDrag: true,
                    wheelToZoom: true,
                };

                photoswipeInstance = new PhotoSwipe(options);

                photoswipeInstance.on("beforeOpen", () => {
                    const lenis = getLenis();
                    lenis?.stop?.();
                    document.body.classList.add("pswp-active");
                });

                photoswipeInstance.on("close", () => {
                    const lenis = getLenis();
                    lenis?.start?.();
                    document.body.classList.remove("pswp-active");
                    photoswipeInstance = null;
                });

                photoswipeInstance.init();
            } catch (error) {
                console.error("[PhotoSwipe] 初始化失败:", error);
                document.body.classList.remove("pswp-active");
                photoswipeInstance = null;

                const lenis = getLenis();
                lenis?.start?.();
            }
        });
    });
}

document.addEventListener("astro:before-swap", () => {
    if (photoswipeInstance) {
        try {
            photoswipeInstance.destroy();
        } catch (error) {
            console.error("[PhotoSwipe] 销毁失败:", error);
        } finally {
            photoswipeInstance = null;
        }
    }
});

document.addEventListener("astro:page-load", () => {
    requestAnimationFrame(() => {
        requestAnimationFrame(initPhotoSwipe);
    });
});
