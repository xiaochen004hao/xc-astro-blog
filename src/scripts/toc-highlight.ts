// src/scripts/toc-highlight.ts

function initTOC() {
	// 获取所有目录链接和文章标题
	const tocLinks = document.querySelectorAll<HTMLAnchorElement>(".toc-link");
	const headings = Array.from(document.querySelectorAll<HTMLElement>("article h2, article h3, article h4, article h5, article h6"))
		.filter((h) => h.id); // 只处理有 ID 的标题

	if (!tocLinks.length || !headings.length) return;

	// 触发偏移量：当标题距离视口顶部 50px 时切换高亮
	const OFFSET = 50;

	// 当前激活的标题ID
	let currentActiveId: string | null = null;

	// 更新活动链接的函数
	function updateActiveLink(id: string | null) {
		if (!id || id === currentActiveId) return;
		currentActiveId = id;

		tocLinks.forEach((link) => {
			const href = link.getAttribute("href")?.slice(1);
			if (href === id) {
				link.classList.add("active-toc-item");
				link.scrollIntoView({ behavior: "smooth", block: "nearest" });
			} else {
				link.classList.remove("active-toc-item");
			}
		});
	}

	// 更新当前激活的标题
	function updateActiveHeading() {
		const scrollY = window.scrollY;
		let activeId = "";

		// 寻找最后一个"已经滚过触发线"的标题
		for (let i = 0; i < headings.length; i++) {
			const heading = headings[i];
			if (heading && scrollY + OFFSET >= heading.offsetTop) {
				activeId = heading.id;
			} else {
				break;
			}
		}

		updateActiveLink(activeId);
	}

	// 监听滚动
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

	// 初始化执行一次
	updateActiveHeading();

	// 处理点击目录链接的情况
	tocLinks.forEach(link => {
		link.addEventListener('click', () => {
			const href = link.getAttribute("href")?.slice(1);
			if (href) {
				updateActiveLink(href);
			}
		});
	});
}

// 支持 Astro 的视图过渡 (View Transitions)
document.addEventListener("astro:page-load", initTOC);
// 兼容标准加载
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initTOC);
} else {
	initTOC();
}
