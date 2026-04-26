// src/scripts/toc-highlight.ts

function initTOC(): void {
	const tocLinks = document.querySelectorAll<HTMLAnchorElement>(".toc-link");
	const headings = Array.from(
		document.querySelectorAll<HTMLElement>("article h1, article h2, article h3, article h4, article h5, article h6")
	).filter((h) => h.id);

	if (!tocLinks.length || !headings.length) return;

	let currentActiveId: string | null = null;
	const OFFSET = 60;

	function updateActiveLink(id: string | null): void {
		if (!id || id === currentActiveId) return;
		currentActiveId = id;

		tocLinks.forEach((link): void => {
			const href = link.getAttribute("href")?.slice(1);
			const parentDir = link.parentElement;
			if (href === id) {
				parentDir?.classList.add("active-toc-item");
				link.scrollIntoView({ behavior: "smooth", block: "nearest" });
			} else {
				parentDir?.classList.remove("active-toc-item");
			}
		});
	}

	function createObserver(): void {
		observer?.disconnect();
		
		observer = new IntersectionObserver((): void => {
			let bestId: string | null = null;
			let bestDistance = -Infinity;
			let bestLevel = Infinity;

			for (const heading of headings) {
				const rect = heading.getBoundingClientRect();
				const distance = rect.top - OFFSET;
				const level = parseInt(heading.tagName.substring(1));
				if (distance <= 0 && 
					(distance > bestDistance || (distance === bestDistance && level < bestLevel))) {
					bestDistance = distance;
					bestLevel = level;
					bestId = heading.id;
				}
			}

			updateActiveLink(bestId);
		}, {
			rootMargin: '-80px 0px 0px 0px',
			threshold: 0
		});

		headings.forEach((heading): void => observer?.observe(heading));
	}

	let observer: IntersectionObserver | null = null;
	createObserver();

	// 窗口大小变化时重新创建 observer
	let resizeTimeout: number;
	window.addEventListener("resize", (): void => {
		clearTimeout(resizeTimeout);
		resizeTimeout = window.setTimeout(createObserver, 250);
	});
}

// Astro 事件监听
document.addEventListener("astro:page-load", initTOC);
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initTOC);
} else {
	initTOC();
}
