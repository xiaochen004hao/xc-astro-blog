import type { AstroExpressiveCodeOptions } from "astro-expressive-code";
import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
    // ! 请记得将下面的网站属性替换为您自己的域名，该域名在 astro.config.ts 中使用
    url: "https://blog.xc4h.qzz.io/",
    /*
        - 用于构建在 src/components/BaseHead.astro L:11 中找到的 meta title 属性
        - 在 astro.config.ts L:42 中找到的 webmanifest 名称
        - 在 src/components/layout/Header.astro L:35 中找到的链接值
        - 在 src/components/layout/Footer.astro L:12 中找到的页脚
    */
    title: "Xiaochen004hao 的 博客",
    // 用作 meta 属性(src/components/BaseHead.astro L:31 + L:49)和生成的 satori png(src/pages/og-image/[slug].png.ts)
    author: "xiaochen004hao",
    // 用作默认的描述 meta 属性和 webmanifest 描述
    description: "xiaochen004hao's blog",
    // HTML lang 属性，位于 src/layouts/Base.astro L:18 和 astro.config.ts L:48
    lang: "zh-CN",
    // Meta 属性，位于 src/components/BaseHead.astro L:42
    ogLocale: "zh_CN",
    // Date.prototype.toLocaleDateString() 参数，位于 src/utils/date.ts
    date: {
        locale: "zh-CN",
        options: {
            day: "numeric" as const,
            month: "short" as const,
            year: "numeric" as const,
        },
    },
};

// 用于在页眉和页脚中生成链接
export const menuLinks: { path: string; title: string }[] = [
    {
        path: "/",
        title: "首页",
    },
    {
        path: "/about/",
        title: "关于",
    },
    {
        path: "/posts/",
        title: "博客",
    },
    {
        path: "/notes/",
        title: "笔记",
    },
    {
        path: "/friends/",
        title: "友人",
    },
];

// https://expressive-code.com/reference/configuration/
export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
    styleOverrides: {
        borderRadius: "4px",
        codeFontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        codeFontSize: "0.875rem",
        codeLineHeight: "1.7142857rem",
        codePaddingInline: "1rem",
        frames: {
            frameBoxShadowCssValue: "none",
        },
        uiLineHeight: "inherit",
    },
    themeCssSelector(theme, { styleVariants }) {
        // 如果有一个暗色主题和一个亮色主题可用
        // 生成与 cactus-theme 暗色模式切换兼容的主题 CSS 选择器
        if (styleVariants.length >= 2) {
            const baseTheme = styleVariants[0]?.theme;
            const altTheme = styleVariants.find((v) => v.theme.type !== baseTheme?.type)?.theme;
            if (theme === baseTheme || theme === altTheme) return `[data-theme='${theme.type}']`;
        }
        // 返回默认选择器
        return `[data-theme="${theme.name}"]`;
    },
    // 一个暗色主题，一个亮色主题 => https://expressive-code.com/guides/themes/#available-themes
    themes: ["github-dark", "github-light"],
    useThemedScrollbars: false,
};
