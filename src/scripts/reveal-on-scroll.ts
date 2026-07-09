// 滚动出现缓入动画：元素进入视口时从下方淡入上移
// 用法：
//   data-reveal              普通淡入上移
//   data-reveal="scale"      从 0.5 缩放到 1（友链卡片用）
//   data-reveal-delay="100"  延迟 100ms（同视口内依次出现）
// 排除：prefers-reduced-motion 用户的动画会被禁用
// 动态内容支持：MutationObserver 监听新增的 [data-reveal] 元素（如搜索结果）

function initReveal() {
	const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
	if (prefersReduced) return;

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				const el = entry.target as HTMLElement;
				const delay = Number.parseInt(el.dataset.revealDelay || "0", 10);
				if (delay > 0) {
					el.style.transitionDelay = `${delay}ms`;
				}
				el.dataset.revealed = "true";
				observer.unobserve(el);
			}
		},
		{ rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
	);

	// 观察所有已有 + 新增的 [data-reveal] 元素
	const observeRevealEls = (root: Element | Document = document) => {
		root
			.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed='true'])")
			.forEach((el) => {
				observer.observe(el);
			});
	};

	observeRevealEls();

	// MutationObserver：监听动态插入的 [data-reveal] 元素（如 Pagefind 搜索结果）
	// 同时监听已有元素上 data-reveal 属性的添加（Pagefind 结果是先插入 DOM 再被
	// Search.astro 的 MutationObserver 添加 data-reveal 属性）
	const mo = new MutationObserver((mutations) => {
		for (const m of mutations) {
			// 情况 1：新插入的元素带 data-reveal
			for (const node of Array.from(m.addedNodes)) {
				if (node.nodeType !== Node.ELEMENT_NODE) continue;
				const el = node as Element;
				if (el.hasAttribute?.("data-reveal")) {
					observer.observe(el);
				}
				observeRevealEls(el);
			}
			// 情况 2：已有元素添加了 data-reveal 属性
			if (
				m.type === "attributes" &&
				m.attributeName === "data-reveal" &&
				m.target instanceof HTMLElement &&
				m.target.hasAttribute("data-reveal") &&
				!m.target.dataset.revealed
			) {
				observer.observe(m.target);
			}
		}
	});
	mo.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["data-reveal"],
	});

	// 页面切换前断开观察器
	document.addEventListener(
		"astro:before-swap",
		() => {
			observer.disconnect();
			mo.disconnect();
		},
		{ once: true },
	);
}

document.addEventListener("astro:page-load", initReveal);
if (document.readyState !== "loading") initReveal();
