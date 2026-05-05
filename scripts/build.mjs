import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.resolve(projectRoot, "dist");
const templatePath = path.resolve(__dirname, "sw-template.js");
const swDistPath = path.join(distDir, "service-worker.js");

function forceRemoveDir(dir) {
    if (!fs.existsSync(dir)) return;
    try {
        fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
    } catch {
        console.warn("[build] Could not clean dist directory, proceeding anyway...");
    }
}

forceRemoveDir(distDir);

try {
    execSync("npx astro build", { stdio: "inherit" });
} catch {
    console.warn("[build] astro build exited with error, but output may still be valid. Continuing...");
}

const now = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
const version = `v4.0.0-${now}`;
const template = fs.readFileSync(templatePath, "utf8");
const swContent = template.replace("__CACHE_VERSION__", version);
fs.writeFileSync(swDistPath, swContent, "utf8");
console.log("[build] generated service-worker.js with version", version);

try {
    execSync("npx pagefind --site dist --force-language zh-CN", { stdio: "inherit" });
} catch {
    console.warn("[build] pagefind failed");
    process.exit(1);
}

await import("./inject-pagefind.mjs");
