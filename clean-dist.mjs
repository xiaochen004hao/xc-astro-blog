import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");

if (!fs.existsSync(distPath)) {
	console.log("dist 目录不存在，无需清理");
	process.exit(0);
}

try {
	console.log("正在删除 dist 目录...");
	fs.rmSync(distPath, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
	console.log("dist 目录已成功删除");
} catch (error) {
	console.warn("删除 dist 目录时出错:", error);
	process.exit(1);
}
