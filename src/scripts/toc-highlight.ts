function initTOC(): void {
	const tocLinks = document.querySelectorAll<HTMLAnchorElement>(".toc-link");
	const headings = Array.from(
		document.querySelectorAll<HTMLElement>(
			"article h1, article h2, article h3, article h4, article h5, article h6",
		),
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
				const isLargeViewport =
					window.matchMedia && window.matchMedia("(min-width: 1024px)").matches;
				const tocContainer = link.closest("nav");
				const containerScrollable = tocContainer
					? tocContainer.scrollHeight > tocContainer.clientHeight
					: false;
				if (isLargeViewport || containerScrollable) {
					try {
						link.scrollIntoView({ behavior: "smooth", block: "nearest" });
					} catch {
						/* ignore */
					}
				}
			} else {
				parentDir?.classList.remove("active-toc-item");
			}
		});
	}

	let observer: IntersectionObserver | null = null;
	let resizeTimeout: number | undefined;

	function createObserver(): void {
		observer?.disconnect();

		observer = new IntersectionObserver(
			(): void => {
				let bestId: string | null = null;
				let bestDistance = Number.NEGATIVE_INFINITY;
				let bestLevel = Number.POSITIVE_INFINITY;

				for (const heading of headings) {
					const rect = heading.getBoundingClientRect();
					const distance = rect.top - OFFSET;
					const level = Number.parseInt(heading.tagName.substring(1));
					if (
						distance <= 0 &&
						(distance > bestDistance || (distance === bestDistance && level < bestLevel))
					) {
						bestDistance = distance;
						bestLevel = level;
						bestId = heading.id;
					}
				}

				updateActiveLink(bestId);
			},
			{
				rootMargin: "-80px 0px 0px 0px",
				threshold: 0,
			},
		);

		headings.forEach((heading): void => observer?.observe(heading));
	}

	createObserver();

	const onResize = (): void => {
		clearTimeout(resizeTimeout);
		resizeTimeout = window.setTimeout(createObserver, 250);
	};
	window.addEventListener("resize", onResize, { passive: true });

	document.addEventListener(
		"astro:before-swap",
		() => {
			observer?.disconnect();
			observer = null;
			clearTimeout(resizeTimeout);
			window.removeEventListener("resize", onResize);
		},
		{ once: true },
	);
}

document.addEventListener("astro:page-load", initTOC);
