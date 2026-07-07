try {
	let rafId: number | null = null;
	let onScroll: (() => void) | null = null;

	function initProgressBar() {
		const bar = document.getElementById("reading-progress");
		if (!bar) return;

		const article = document.querySelector("article");
		if (!article) {
			bar.style.opacity = "0";
			return;
		}

		// 清理上一次页面的状态
		if (onScroll) {
			window.removeEventListener("scroll", onScroll);
			onScroll = null;
		}
		if (rafId) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}

		const update = () => {
			rafId = null;
			const scrollTop = window.scrollY;
			const articleTop = (article as HTMLElement).offsetTop;
			const articleHeight = (article as HTMLElement).offsetHeight;
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

		onScroll = () => {
			if (!rafId) rafId = requestAnimationFrame(update);
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		update();
	}

	document.addEventListener("astro:page-load", initProgressBar);
	document.addEventListener("astro:before-swap", () => {
		try {
			if (onScroll) {
				window.removeEventListener("scroll", onScroll);
				onScroll = null;
			}
			if (rafId) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		} catch {
			/* ignore */
		}
	});
} catch {}
