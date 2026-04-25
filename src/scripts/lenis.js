import Lenis from 'lenis'

// 初始化 Lenis 实例
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 0.8,
  smoothTouch: false,
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// 当页面切换（如 Astro 视图过渡）时，将滚动位置重置到顶部
document.addEventListener('astro:after-swap', () => {
  lenis.scrollTo(0, { immediate: true })
})