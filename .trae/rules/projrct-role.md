# Astro Cactus 开发规范 (精简版)

## 1. 技术栈约束
- 框架: Astro 4/5 + Content Collections
- 样式: Tailwind CSS (严禁引入 Bootstrap 等其他框架)
- 代码高亮: 锁定 Expressive Code (禁止替换为 Shiki)
- 组件: 仅使用原生 HTML + Tailwind 类名

## 2. 目录红线 (禁止随意改动结构!)
- `src/site.config.ts`: 全局网站信息配置。
- `src/content.config.ts`: 文章/笔记的 Schema 定义 (严禁修改已有字段类型)。
- `src/layouts/`: 页面骨架 (`Base.astro`, `BlogPost.astro`)。
- `src/styles/global.css`: 全局样式与 Tailwind 指令入口。

## 3. 编码铁律
- CSS 变量优先: 修改配色必须通过 `global.css` 的 CSS 变量或 Tailwind 配置，绝对禁止在 HTML 中写死颜色值 (如 #fff)。
- 图片优化: 本地图片必须使用 Astro 内置的 `<Image />` 组件。
- 无副作用原则: 修改组件时不得改变原有外层 HTML 结构 (DOM Tree)；新增 JS 交互必须放在 `<body>` 底部或使用 `is:inline`，严禁阻碍首屏渲染 (FCP)。

## 4. 常见需求处理链路 (严格执行!)
- 增改文章字段: 先改 `content.config.ts` 定义 Schema -> 再改 `layouts` 接收 Props -> 最后写前端样式。
- 全局样式调整: 优先改 `global.css` 中的 CSS 变量或基础标签样式。
- 新建页面: 必须引入 `Base.astro` 布局并传递 title 和 description 等 SEO 属性。

## 5. 输出要求
- 给出的代码必须是可直接运行的完整片段。
- 解释代码时需说明是否会打包额外的 JS 到客户端。
- 若有破坏性变更，必须提前用 ⚠️ 警告标识指出并提供回滚方案。