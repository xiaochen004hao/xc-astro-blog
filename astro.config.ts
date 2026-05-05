import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import webmanifest from "astro-webmanifest";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import rehypeExternalLinks from "rehype-external-links";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkDirective from "remark-directive";
import { remarkAdmonitions } from "./src/plugins/remark-admonitions";
import { remarkGithubCard } from "./src/plugins/remark-github-card";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";
import { rawFonts, swVersionBust } from "./src/plugins/vite-plugins";
import { expressiveCodeOptions, siteConfig } from "./src/site.config";

// https://astro.build/config
export default defineConfig({
    site: siteConfig.url,
    prefetch: {
        defaultStrategy: "viewport",
        prefetchAll: false,
    },
    server: {
        host: true,
        port: 3000,
    },
    image: {
        domains: ["webmention.io"],
    },
    integrations: [
        expressiveCode(expressiveCodeOptions),
        icon(),
        sitemap(),
        mdx(),
        robotsTxt(),
        webmanifest({
            name: siteConfig.title,
            short_name: "XCBlog",
            description: siteConfig.description,
            lang: siteConfig.lang,
            icon: "public/icon.svg",
            start_url: "/",
            background_color: "#1d1f21",
            theme_color: "#25eaea",
            display: "standalone",
            config: {
                insertFaviconLinks: false,
                insertThemeColorMeta: false,
                insertManifestLink: true,
            },
        }),
    ],
    markdown: {
        rehypePlugins: [
            rehypeSlug,
            [rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["not-prose"] } }],
            [
                rehypeExternalLinks,
                {
                    rel: ["noreferrer", "noopener"],
                    target: "_blank",
                },
            ],
            rehypeUnwrapImages,
        ],
        remarkPlugins: [remarkReadingTime, remarkDirective, remarkGithubCard, remarkAdmonitions],
        remarkRehype: {
            footnoteLabelProperties: {
                className: [""],
            },
        },
    },
    vite: {
        optimizeDeps: {
            exclude: ["@resvg/resvg-js"],
            include: ["lenis"],
        },
        plugins: [tailwind(), rawFonts([".ttf", ".woff"]), swVersionBust()],
        ssr: {
            noExternal: ["lenis"],
        },
        build: {
			rollupOptions: {
				onwarn(warning, warn) {
					if (warning.id?.includes("node_modules")) return;
					warn(warning);
				},
			},
		},
    },
    env: {
        schema: {
            WEBMENTION_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
            WEBMENTION_URL: envField.string({ context: "client", access: "public", optional: true }),
            WEBMENTION_PINGBACK: envField.string({ context: "client", access: "public", optional: true }),
        },
    },
});
