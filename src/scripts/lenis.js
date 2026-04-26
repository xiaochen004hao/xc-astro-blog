import Lenis from 'lenis';

// 初始化 Lenis 实例
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.8,
  smoothTouch: false,
});

// 暴露实例到全局
if (typeof window !== 'undefined') {
  window.lenis = lenis;
}

// 平滑滚动动画循环
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Astro 视图过渡时重置滚动位置
document.addEventListener('astro:after-swap', () => {
  lenis.scrollTo(0, { immediate: true });
});