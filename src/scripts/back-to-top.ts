try {
	let observer: IntersectionObserver | null = null;
	let boundBtn: HTMLButtonElement | null = null;

	function onBtnClick() {
		const lenis = (window as unknown as Record<string, unknown>).__lenis as {
			scrollTo: (target: number | string, options?: { offset?: number }) => void;
		} | null;

		if (lenis?.scrollTo) {
			lenis.scrollTo(0);
		} else {
			window.scrollTo({ behavior: "smooth", top: 0 });
		}
	}

	function initBackToTop() {
		const btn = document.getElementById("to-top-btn") as HTMLButtonElement | null;
		const target = document.getElementById("blog-hero") as HTMLDivElement | null;
		if (!btn || !target) return;

		// 清理上一次页面的 observer 和监听器
		if (observer) {
			try {
				observer.disconnect();
			} catch {
				/* ignore */
			}
			observer = null;
		}
		if (boundBtn) {
			boundBtn.removeEventListener("click", onBtnClick);
			boundBtn = null;
		}

		btn.addEventListener("click", onBtnClick);
		boundBtn = btn;

		observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				btn.dataset.show = (!entry.isIntersecting).toString();
			}
		});
		observer.observe(target);
	}

	document.addEventListener("astro:page-load", initBackToTop);
	document.addEventListener("astro:before-swap", () => {
		try {
			observer?.disconnect();
			observer = null;
			if (boundBtn) {
				boundBtn.removeEventListener("click", onBtnClick);
				boundBtn = null;
			}
		} catch {
			/* ignore */
		}
	});
} catch {}
