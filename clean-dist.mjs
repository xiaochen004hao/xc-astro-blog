import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "dist");

try {
	if (fs.existsSync(distPath)) {
		console.log("正在删除 dist 目录...");
		fs.rmSync(distPath, { recursive: true, force: true });
		console.log("dist 目录已成功删除");
	} else {
		console.log("dist 目录不存在");
	}
} catch (error) {
	console.warn("删除 dist 目录时出错，跳过清理:", error);
}
