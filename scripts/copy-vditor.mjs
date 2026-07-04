/**
 * 复制 Vditor dist 资源到 public/vditor/dist/
 *
 * 目的：让 Vditor 从本地加载所有资源（i18n、lute、icons、CSS、highlight.js 等），
 *      避免从 CDN 加载时网络抖动导致的 404 或编辑器加载失败。
 *
 * 触发：package.json 的 predev / prebuild 钩子
 *
 * 说明：
 * - 完整复制 dist 目录约 15MB，但浏览器只在需要时按需加载，不影响首屏
 * - 复制是幂等的，已存在则覆盖
 * - public/vditor/ 已在 .gitignore 中排除，不会提交到仓库
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("node_modules/vditor/dist");
const DEST = path.resolve("public/vditor/dist");

if (!fs.existsSync(SRC)) {
	console.error("[copy-vditor] node_modules/vditor/dist 不存在，请先运行 npm install");
	process.exit(1);
}

function copyRecursive(src, dest) {
	const stat = fs.statSync(src);
	if (stat.isDirectory()) {
		fs.mkdirSync(dest, { recursive: true });
		for (const entry of fs.readdirSync(src)) {
			copyRecursive(path.join(src, entry), path.join(dest, entry));
		}
	} else {
		fs.copyFileSync(src, dest);
	}
}

// 清理旧目录（避免遗留已删除的文件）
if (fs.existsSync(path.resolve("public/vditor"))) {
	fs.rmSync(path.resolve("public/vditor"), { recursive: true, force: true });
}

console.log("[copy-vditor] 复制 node_modules/vditor/dist -> public/vditor/dist");
copyRecursive(SRC, DEST);
console.log("[copy-vditor] 完成");
