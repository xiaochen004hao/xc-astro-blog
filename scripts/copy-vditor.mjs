/**
 * 复制 Vditor dist 资源到 public/vditor/dist/
 * 下载微博 + B站表情包到 public/emojis/{weibo,bilibili}/
 *
 * 目的：让 Vditor 从本地加载所有资源（i18n、lute、icons、CSS、highlight.js 等），
 *      避免从 CDN 加载时网络抖动导致的 404 或编辑器加载失败。
 *      表情包同样下载到本地，避免工具栏 emoji 面板加载失败。
 *
 * 触发：package.json 的 predev / prebuild 钩子
 *
 * 说明：
 * - 完整复制 dist 目录约 15MB，但浏览器只在需要时按需加载，不影响首屏
 * - 微博表情包 89 个 PNG，B站表情包 52 个 PNG
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
 * 下载一个表情包到本地
 * @param {string} packName - 表情包目录名（如 weibo, bilibili）
 */
async function downloadEmojiPack(packName) {
	const packDest = path.join(EMOJIS_BASE, packName);
	const packSrcUrl = `${EMOJI_SRC_BASE}/${packName}`;

	fs.mkdirSync(packDest, { recursive: true });

	try {
		// 下载 info.json
		const res = await fetch(`${packSrcUrl}/info.json`);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		const ext = data.type || "png";
		const items = Array.isArray(data.items) ? data.items : [];
		const prefix = data.prefix || "";

		// 写入 info.json
		fs.writeFileSync(path.join(packDest, "info.json"), JSON.stringify(data, null, 2));
		console.log(`[copy-vditor] ${packName} info.json 已下载，共 ${items.length} 个表情`);

		// 并行下载所有表情（限制并发 10）
		// 文件名格式：{prefix}{name}.{ext}（如 weibo_smile.png, bb_doge.png）
		const CONCURRENCY = 10;
		let success = 0;
		let failed = 0;

		for (let i = 0; i < items.length; i += CONCURRENCY) {
			const batch = items.slice(i, i + CONCURRENCY);
			const results = await Promise.allSettled(
				batch.map(async (name) => {
					const fileName = `${prefix}${name}.${ext}`;
					const r = await fetch(`${packSrcUrl}/${fileName}`);
					if (!r.ok) throw new Error(`HTTP ${r.status} for ${fileName}`);
					const buf = Buffer.from(await r.arrayBuffer());
					fs.writeFileSync(path.join(packDest, fileName), buf);
				}),
			);
			for (const r of results) {
				if (r.status === "fulfilled") success++;
				else {
					failed++;
					console.warn(`[copy-vditor] ${packName} 下载失败: ${r.reason?.message || r.reason}`);
				}
			}
			console.log(`[copy-vditor] ${packName} 进度: ${success}/${items.length}`);
		}

		console.log(`[copy-vditor] ${packName} 完成: ${success} 成功, ${failed} 失败`);
	} catch (e) {
		console.warn(`[copy-vditor] ${packName} 下载失败: ${e.message}`);
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

// 下载表情包
await downloadEmojiPack("bmoji");
await downloadEmojiPack("bilibili");

console.log("[copy-vditor] 全部完成");
