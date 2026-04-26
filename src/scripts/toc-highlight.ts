// src/scripts/toc-highlight.ts

function initTOC() {
	const tocLinks = document.querySelectorAll<HTMLAnchorElement>(".toc-link");
	const headings = Array.from(document.querySelectorAll<HTMLElement>("article h1, article h2, article h3, article h4, article h5, article h6"))
		.filter((h) => h.id);

	if (!tocLinks.length || !headings.length) return;

	const OFFSET = 50;
	let currentActiveId: string | null = null;

	function updateActiveLink(id: string | null) {
		if (!id || id === currentActiveId) return;
		currentActiveId = id;

		tocLinks.forEach((link) => {
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

	function updateActiveHeading() {
		const scrollY = window.scrollY;
		let activeId = "";

		for (const heading of headings) {
			if (scrollY + OFFSET >= heading.offsetTop) {
				activeId = heading.id;
			} else {
				break;
			}
		}

		updateActiveLink(activeId);
	}

	let ticking = false;
	window.addEventListener("scroll", () => {
		if (!ticking) {
			window.requestAnimationFrame(() => {
				updateActiveHeading();
				ticking = false;
			});
			ticking = true;
		}
	}, { passive: true });

	updateActiveHeading();
}

// 支持 Astro 的视图过渡 (View Transitions)
document.addEventListener("astro:page-load", initTOC);
// 兼容标准加载
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initTOC);
} else {
	initTOC();
}
