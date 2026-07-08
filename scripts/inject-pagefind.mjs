import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, "..", "dist");
const SW_SRC = path.join(DIST, "service-worker.js");
const PAGEFIND_DIR = path.join(DIST, "pagefind");

if (!fs.existsSync(SW_SRC)) {
	console.warn("[inject-pagefind] service-worker.js not found in dist, skipping");
	process.exit(0);
}

if (!fs.existsSync(PAGEFIND_DIR)) {
	console.warn("[inject-pagefind] pagefind directory not found in dist, skipping");
	process.exit(0);
}

function walkDir(dir, base = "") {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		const relPath = base ? `${base}/${entry.name}` : entry.name;
		if (entry.isDirectory()) {
			files.push(...walkDir(fullPath, relPath));
		} else {
			files.push(`/pagefind/${relPath}`);
		}
	}
	return files;
}

const pagefindFiles = walkDir(PAGEFIND_DIR);
const fileListJson = JSON.stringify(pagefindFiles, null, "\t");

// 扫描 Vditor 资源目录，注入核心必需文件路径，确保编辑器离线可用
// 只 precache 编辑器加载和渲染 Markdown 的核心文件（约 12 个），
// 其余可选渲染器（katex/mermaid/echarts/graphviz/mathjax 等）保持按需加载，
// 由 SW 的 staleWhileRevalidate 策略在首次使用时自动缓存。
const VDITOR_CORE_FILES = [
	"/vditor/dist/index.js",
	"/vditor/dist/index.css",
	"/vditor/dist/index.min.js",
	"/vditor/dist/method.js",
	"/vditor/dist/method.min.js",
	"/vditor/dist/images/logo.png",
	"/vditor/dist/images/img-loading.svg",
	"/vditor/dist/js/icons/ant.js",
	"/vditor/dist/js/icons/material.js",
	"/vditor/dist/js/i18n/zh_CN.js",
	"/vditor/dist/js/lute/lute.min.js",
	"/vditor/dist/js/highlight.js/highlight.min.js",
	"/vditor/dist/js/highlight.js/styles/github.min.css",
	"/vditor/dist/js/highlight.js/styles/github-dark.min.css",
];
const vditorFiles = VDITOR_CORE_FILES.filter((file) =>
	fs.existsSync(path.join(DIST, file.slice(1))),
);
const vditorListJson = JSON.stringify(vditorFiles, null, "\t");

const buildTimestamp = Date.now().toString(36);

let swContent = fs.readFileSync(SW_SRC, "utf-8");

swContent = swContent.replace(
	/const CACHE_VERSION = "[^"]*"/,
	`const CACHE_VERSION = "v4.0.0-${buildTimestamp}"`,
);
// 用正则全局替换占位符，避免注释中误用同名标识符时只替换第一个
swContent = swContent.replace(/__PAGEFIND_FILES__/g, fileListJson);
swContent = swContent.replace(/__VDITOR_FILES__/g, vditorListJson);

fs.writeFileSync(SW_SRC, swContent);
console.log(
	`[inject-pagefind] Injected ${pagefindFiles.length} pagefind files, ${vditorFiles.length} vditor files, cache v4.0.0-${buildTimestamp}`,
);
