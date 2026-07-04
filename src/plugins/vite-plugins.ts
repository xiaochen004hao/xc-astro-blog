import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

/**
 * Vite plugin: import .ttf/.woff fonts as raw Buffer
 */
export function rawFonts(ext: string[]): Plugin {
	return {
		name: "vite-plugin-raw-fonts",
		transform(_code, id) {
			if (ext.some((e) => id.endsWith(e))) {
				try {
					const buffer = fs.readFileSync(id);
					return {
						code: `export default ${JSON.stringify(buffer)}`,
						map: null,
					};
				} catch {
					return null;
				}
			}
			return null;
		},
	};
}

/**
 * Vite plugin: bump service worker cache version on build
 */
export function swVersionBust(): Plugin & { closeBundle: NonNullable<Plugin["closeBundle"]> } {
	return {
		name: "sw-version-bust",
		closeBundle() {
			try {
				const swPath = path.resolve(process.cwd(), "public", "service-worker.js");
				if (!fs.existsSync(swPath)) return;
				let code = fs.readFileSync(swPath, "utf-8");
				const ts = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
				code = code.replace(
					/const CACHE_VERSION = ".*?";/,
					`const CACHE_VERSION = "v4.0.0-${ts}";`,
				);
				fs.writeFileSync(swPath, code, "utf-8");
			} catch (e) {
				console.warn("[sw-version-bust] Failed:", (e as Error).message);
			}
		},
	};
}
