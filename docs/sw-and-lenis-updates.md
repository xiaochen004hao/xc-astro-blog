# Service Worker 与 Lenis 更新记录

本文件记录最近对 Service Worker 与 Lenis 平滑滚动的改进，便于部署与调试。

改动概览
- 新增 `public/service-worker.js`：一个轻量的根 SW，负责在新版本可用时支持 `skipWaiting()` 与 `clients.claim()`。
- 新增 `src/scripts/sw-update.js`：页面端检测等待中的 SW，并派发 `sw:updateAvailable` 事件；页面可调用 `window.__sw_update_activate()` 激活新 SW。
- 在 `src/layouts/Base.astro` 中添加了一个非侵入式的「新版本可用」提示条，并调用上述激活函数。
- `src/scripts/lenis.js` 已改为动态导入、支持 `prefers-reduced-motion`，并在页面不可见时暂停 RAF，提供 `window.__lenis_cleanup` 清理接口。
- 修复了 TOC 在小屏幕上与 Lenis 冲突导致的回弹问题（`src/scripts/toc-highlight.ts`），现在只有在大屏或 TOC 可滚动时才调用 `scrollIntoView`。

部署/调试须知
- 本地调试使用 `npm run dev`（不会注册生产 SW）。
- 使用 `npm run build && npm run preview` 可在本地预览生产构建，SW 注册位于 `/service-worker.js`。
- 如果页面被旧 SW 控制且未立即更新：
  - 在页面上点击提示条的「更新」按钮即可激活新 SW 并刷新页面；或
  - 在浏览器 DevTools → Application → Service Workers 手动 Unregister。

安全与审计
- 我已运行 `npm outdated` 与 `npm audit`（通过官方 registry）并生成了依赖安全报告。发现若干 moderate/high 问题（包含 `astro`、`@astrojs/rss`、`workbox-build` 等），建议在可接受风险窗口内分组升级并在 CI 上验证构建。

下一步建议
- 在 CI 中运行安全/依赖更新脚本并验证构建（我已添加初始 GitHub Actions 配置）。
- 如果希望更严格：使用 Playwright 添加 E2E 用例验证移动端滚动与 TOC 行为。
