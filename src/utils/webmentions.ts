import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { WebmentionsCache, WebmentionsChildren } from "@/types";

const PROJECT_ROOT = process.cwd();
const CACHE_DIR = path.resolve(PROJECT_ROOT, "src", "data", "webmentions");
const API = "https://webmention.io/api/mentions.jf2";

function getCachePath(target: string): string {
    const key = Buffer.from(target).toString("base64url");
    return path.join(CACHE_DIR, `${key}.json`);
}

function deduplicate(children: WebmentionsChildren[]): WebmentionsChildren[] {
    const seen = new Set<string>();
    return children.filter((child) => {
        const id = child["wm-id"];
        if (!id || seen.has(String(id))) return false;
        seen.add(String(id));
        return true;
    });
}

async function fetchWebmentions(token: string, target: string): Promise<WebmentionsChildren[]> {
    const params = new URLSearchParams({ token, target, sort: "published" });
    const response = await fetch(`${API}?${params}`);
    const feed = await response.json();
    const children: WebmentionsChildren[] = feed.children || [];
    const filtered = children.filter((child) => {
        const wm = child["wm-property"];
        return wm === "like-of" || wm === "mention-of" || wm === "in-reply-to" || wm === "repost-of";
    });
    return deduplicate(filtered);
}

export async function getWebmentionsForUrl(
    target: string,
    apiUrl: string,
): Promise<WebmentionsChildren[]> {
    const token = new URL(apiUrl).searchParams.get("token");
    if (!token) return [];

    const cachePath = getCachePath(target);

    try {
        const raw = fs.readFileSync(cachePath, "utf8");
        const cache = JSON.parse(raw) as WebmentionsCache;
        if (cache.lastFetched) {
            const age = Date.now() - new Date(cache.lastFetched).getTime();
            if (age < 3600000) return cache.children;
        }
    } catch { }

    try {
        const filtered = await fetchWebmentions(token, target);
        const cache: WebmentionsCache = {
            children: filtered,
            lastFetched: new Date().toISOString(),
        };
        fs.mkdirSync(CACHE_DIR, { recursive: true });
        fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf8");
        return filtered;
    } catch (err) {
        console.warn("[webmentions] fetch failed:", (err as Error).message);
        return [];
    }
}

export function groupWebmentions(children: WebmentionsChildren[]) {
    const likes: WebmentionsChildren[] = [];
    const mentions: WebmentionsChildren[] = [];
    const replies: WebmentionsChildren[] = [];

    for (const child of children) {
        const wm = child["wm-property"];
        if (wm === "like-of") likes.push(child);
        else if (wm === "repost-of" || wm === "mention-of") mentions.push(child);
        else if (wm === "in-reply-to") replies.push(child);
    }

    return { likes, mentions, replies };
}

const SITE_CONFIG_FILE = path.resolve(PROJECT_ROOT, "src", "site.config.ts");

export async function getAndCacheWebmentions(apiUrl: string): Promise<void> {
    const token = new URL(apiUrl).searchParams.get("token");
    if (!token) {
        console.warn("[webmentions] no token found in apiUrl");
        return;
    }

    const baseUrl = getBaseUrl();
    if (!baseUrl) {
        console.warn("[webmentions] could not determine base URL from site.config.ts");
        return;
    }

    const postSlugs = getPostSlugs();
    const targets = postSlugs.map((slug) => `${baseUrl}/posts/${slug}`);

    console.log(`[webmentions] fetching for ${targets.length} posts...`);

    let success = 0;
    for (const target of targets) {
        const cachePath = getCachePath(target);
        try {
            const filtered = await fetchWebmentions(token, target);
            const cache: WebmentionsCache = {
                children: filtered,
                lastFetched: new Date().toISOString(),
            };
            fs.mkdirSync(CACHE_DIR, { recursive: true });
            fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), "utf8");
            success++;
            if (filtered.length > 0) {
                console.log(`[webmentions] ${target} -> ${filtered.length} new`);
            }
        } catch (err) {
            console.warn(`[webmentions] failed: ${target}`, (err as Error).message);
        }
        await new Promise((r) => setTimeout(r, 500));
    }

    console.log(`[webmentions] done: ${success}/${targets.length} posts updated`);
}

function getBaseUrl(): string | null {
    try {
        const raw = fs.readFileSync(SITE_CONFIG_FILE, "utf8");
        const match = raw.match(/url:\s*"(https?:\/\/[^"]+)"/);
        return match ? match[1].replace(/\/$/, "") : null;
    } catch {
        return null;
    }
}

function getPostSlugs(): string[] {
    const contentDir = path.resolve(PROJECT_ROOT, "src", "content", "post");
    if (!fs.existsSync(contentDir)) return [];
    const slugs: string[] = [];

    function walk(dir: string, prefix = "") {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const slug = prefix ? `${prefix}/${entry.name}` : entry.name;
                const md = path.join(full, "index.md");
                const mdx = path.join(full, "index.mdx");
                if (fs.existsSync(md) || fs.existsSync(mdx)) {
                    slugs.push(slug);
                }
                walk(full, slug);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (ext !== ".md" && ext !== ".mdx") continue;
                if (entry.name === "index.md" || entry.name === "index.mdx") continue;
                const slug = prefix
                    ? `${prefix}/${path.basename(entry.name, ext)}`
                    : path.basename(entry.name, ext);
                slugs.push(slug);
            }
        }
    }

    walk(contentDir);
    return slugs;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const apiUrl = process.env.WEBMENTION_URL || "";
    if (!apiUrl) {
        console.error("WEBMENTION_URL not set");
        process.exit(1);
    }
    getAndCacheWebmentions(apiUrl);
}