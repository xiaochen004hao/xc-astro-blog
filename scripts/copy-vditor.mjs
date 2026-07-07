/**
 * 复制 Vditor dist 资源到 public/vditor/dist/
 * 下载表情包 info.json 到 public/emojis/{bmoji,bilibili}/（图片走 CDN）
 *
 * 目的：让 Vditor 从本地加载所有核心资源（i18n、lute、icons、CSS 等），
 *      避免从 CDN 加载时网络抖动导致的 404 或编辑器加载失败。
 *      表情包只下载 info.json（描述文件），图片本身仍走 CDN，避免占用仓库体积。
 *
 * 触发：package.json 的 predev / prebuild 钩子
 *
 * 说明：
 * - Vditor dist 约 15MB，浏览器按需加载，不影响首屏
 * - 表情包 info.json 仅几 KB，图片走 CDN（按需加载）
 * - 复制是幂等的，已存在则覆盖
 * - public/vditor/ 和 public/emojis/ 已在 .gitignore 中排除，不会提交到仓库
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("node_modules/vditor/dist");
const DEST = path.resolve("public/vditor/dist");
const EMOJIS_BASE = path.resolve("public/emojis");
const EMOJI_SRC_BASE = "https://unpkg.com/@waline/emojis@latest";

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

/**
 * 下载一个表情包的 info.json（图片本身走 CDN，不下载）
 * @param {string} packName - 表情包目录名（如 bmoji, bilibili）
 */
async function downloadEmojiPackInfo(packName) {
	const packDest = path.join(EMOJIS_BASE, packName);
	const packSrcUrl = `${EMOJI_SRC_BASE}/${packName}`;

	fs.mkdirSync(packDest, { recursive: true });

	try {
		const res = await fetch(`${packSrcUrl}/info.json`);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		const items = Array.isArray(data.items) ? data.items : [];
		fs.writeFileSync(path.join(packDest, "info.json"), JSON.stringify(data, null, 2));
		console.log(`[copy-vditor] ${packName} info.json 已下载，共 ${items.length} 个表情`);
	} catch (e) {
		console.warn(`[copy-vditor] ${packName} info.json 下载失败: ${e.message}`);
	}
}

// 清理旧目录
if (fs.existsSync(path.resolve("public/vditor"))) {
	fs.rmSync(path.resolve("public/vditor"), { recursive: true, force: true });
}
if (fs.existsSync(EMOJIS_BASE)) {
	fs.rmSync(EMOJIS_BASE, { recursive: true, force: true });
}

console.log("[copy-vditor] 复制 node_modules/vditor/dist -> public/vditor/dist");
copyRecursive(SRC, DEST);
console.log("[copy-vditor] Vditor 资源复制完成");

// 只下载 info.json，图片走 CDN
await downloadEmojiPackInfo("bmoji");
await downloadEmojiPackInfo("bilibili");

console.log("[copy-vditor] 全部完成");
