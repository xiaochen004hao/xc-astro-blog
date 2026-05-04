const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const distDir = path.resolve(__dirname, "..", "dist");

function forceRemoveDir(dir) {
    if (!fs.existsSync(dir)) return;
    try {
        fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
    } catch {
        try {
            execSync(`Remove-Item -Recurse -Force "${dir}"`, { shell: "powershell.exe", stdio: "pipe" });
        } catch {
            console.warn("[build] Could not clean dist directory, proceeding anyway...");
        }
    }
}

forceRemoveDir(distDir);

try {
    execSync("npx astro build", { stdio: "inherit" });
} catch (e) {
    console.warn("[build] astro build exited with error, but output may still be valid. Continuing...");
}

if (!fs.existsSync(path.join(distDir, "service-worker.js"))) {
    console.error("[build] service-worker.js not found in dist. Build may have failed.");
    process.exit(1);
}

try {
    execSync("npx pagefind --site dist --force-language zh-CN", { stdio: "inherit" });
} catch (e) {
    console.warn("[build] pagefind failed");
    process.exit(1);
}

require("./inject-pagefind.cjs");
