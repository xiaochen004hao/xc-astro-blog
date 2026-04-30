const fs = require("node:fs");
const path = require("node:path");

const DIST = "dist";
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
const buildTimestamp = Date.now().toString(36);

let swContent = fs.readFileSync(SW_SRC, "utf-8");

swContent = swContent.replace(
	/const CACHE_VERSION = "[^"]*"/,
	`const CACHE_VERSION = "v3.0.0-${buildTimestamp}"`,
);
swContent = swContent.replace("__PAGEFIND_FILES__", fileListJson);

fs.writeFileSync(SW_SRC, swContent);
console.log(`[inject-pagefind] Injected ${pagefindFiles.length} pagefind files, cache v3.0.0-${buildTimestamp}`);
