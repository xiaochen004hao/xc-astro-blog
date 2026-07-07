/**
 * 复制 Vditor dist 资源到 public/vditor/dist/
 * 下载微博表情包到 public/emojis/weibo/
 *
 * 目的：让 Vditor 从本地加载所有资源（i18n、lute、icons、CSS、highlight.js 等），
 *      避免从 CDN 加载时网络抖动导致的 404 或编辑器加载失败。
 *      微博表情包同样下载到本地，避免工具栏 emoji 面板加载失败。
 *
 * 触发：package.json 的 predev / prebuild 钩子
 *
 * 说明：
 * - 完整复制 dist 目录约 15MB，但浏览器只在需要时按需加载，不影响首屏
 * - 微博表情包 88 个 PNG 文件，约 1MB
 * - 复制是幂等的，已存在则覆盖
 * - public/vditor/ 和 public/emojis/ 已在 .gitignore 中排除，不会提交到仓库
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("node_modules/vditor/dist");
const DEST = path.resolve("public/vditor/dist");
const EMOJI_DEST = path.resolve("public/emojis/weibo");
const EMOJI_SRC_URL = "https://unpkg.com/@waline/emojis@latest/weibo";

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

async function downloadWeiboEmojis() {
	// 清理旧目录
	if (fs.existsSync(path.resolve("public/emojis"))) {
		fs.rmSync(path.resolve("public/emojis"), { recursive: true, force: true });
	}
	fs.mkdirSync(EMOJI_DEST, { recursive: true });

	try {
		// 下载 info.json
		const res = await fetch(`${EMOJI_SRC_URL}/info.json`);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		const ext = data.type || "png";
		const items = Array.isArray(data.items) ? data.items : [];

		// 写入 info.json
		fs.writeFileSync(path.join(EMOJI_DEST, "info.json"), JSON.stringify(data, null, 2));
		console.log(`[copy-vditor] info.json 已下载，共 ${items.length} 个表情`);

		// 并行下载所有表情（限制并发 10）
		// 注意：unpkg 上实际文件名带 weibo_ 前缀（如 weibo_smile.png）
		// 但 info.json 的 items 是不带前缀的名字（如 smile）
		// 下载时使用 prefix + name 作为文件名，与 info.json 的 prefix 字段一致
		const prefix = data.prefix || "";
		const CONCURRENCY = 10;
		let success = 0;
		let failed = 0;

		for (let i = 0; i < items.length; i += CONCURRENCY) {
			const batch = items.slice(i, i + CONCURRENCY);
			const results = await Promise.allSettled(
				batch.map(async (name) => {
					// CDN 上文件名格式：weibo_smile.png（带 prefix）
					const fileName = `${prefix}${name}.${ext}`;
					const r = await fetch(`${EMOJI_SRC_URL}/${fileName}`);
					if (!r.ok) throw new Error(`HTTP ${r.status} for ${fileName}`);
					const buf = Buffer.from(await r.arrayBuffer());
					fs.writeFileSync(path.join(EMOJI_DEST, fileName), buf);
				}),
			);
			for (const r of results) {
				if (r.status === "fulfilled") success++;
				else {
					failed++;
					console.warn(`[copy-vditor] 下载失败: ${r.reason?.message || r.reason}`);
				}
			}
			console.log(`[copy-vditor] 进度: ${success}/${items.length}`);
		}

		console.log(`[copy-vditor] 微博表情包下载完成: ${success} 成功, ${failed} 失败`);
	} catch (e) {
		console.warn(`[copy-vditor] 微博表情包下载失败: ${e.message}`);
		console.warn("[copy-vditor] 将使用 CDN fallback");
	}
}

// 清理旧 vditor 目录（避免遗留已删除的文件）
if (fs.existsSync(path.resolve("public/vditor"))) {
	fs.rmSync(path.resolve("public/vditor"), { recursive: true, force: true });
}

console.log("[copy-vditor] 复制 node_modules/vditor/dist -> public/vditor/dist");
copyRecursive(SRC, DEST);
console.log("[copy-vditor] Vditor 资源复制完成");

// 下载微博表情包（异步，不阻塞主流程）
await downloadWeiboEmojis();

console.log("[copy-vditor] 全部完成");
