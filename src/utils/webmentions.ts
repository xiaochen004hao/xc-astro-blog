import { WEBMENTION_API_KEY } from "astro:env/server";
import * as fs from "node:fs";
import type { WebmentionsCache, WebmentionsChildren, WebmentionsFeed } from "@/types";

const DOMAIN = import.meta.env.SITE;
const CACHE_DIR = ".data";
const filePath = `${CACHE_DIR}/webmentions.json`;
const validWebmentionTypes = ["like-of", "mention-of", "in-reply-to"];

let hostName = "";
try {
	hostName = new URL(DOMAIN.startsWith("http") ? DOMAIN : `https://${DOMAIN}`).hostname;
} catch {
	console.warn(`Invalid SITE domain: ${DOMAIN}`);
}

async function fetchWebmentions(timeFrom: string | null, perPage = 1000) {
	if (!DOMAIN || !hostName) {
		console.warn("No domain specified. Please set in astro.config.ts");
		return null;
	}

	if (!WEBMENTION_API_KEY) {
		console.warn("No webmention api token specified in .env");
		return null;
	}

	let url = `https://webmention.io/api/mentions.jf2?domain=${hostName}&token=${WEBMENTION_API_KEY}&sort-dir=up&per-page=${perPage}`;

	if (timeFrom) url += `&since=${timeFrom}`;

	const res = await fetch(url);

	if (res.ok) {
		const data = (await res.json()) as WebmentionsFeed;
		return data;
	}

	return null;
}

function mergeWebmentions(a: WebmentionsCache, b: WebmentionsFeed): WebmentionsChildren[] {
	return Array.from(
		[...a.children, ...b.children]
			.reduce((map, obj) => map.set(obj["wm-id"], obj), new Map())
			.values(),
	);
}

export function filterWebmentions(webmentions: WebmentionsChildren[]) {
	return webmentions.filter((webmention) => {
		if (!validWebmentionTypes.includes(webmention["wm-property"])) return false;

		if (webmention["wm-property"] === "mention-of" || webmention["wm-property"] === "in-reply-to") {
			return webmention.content && webmention.content.text !== "";
		}

		return true;
	});
}

async function writeToCache(data: WebmentionsCache) {
	const fileContent = JSON.stringify(data, null, 2);

	try {
		if (!fs.existsSync(CACHE_DIR)) {
			fs.mkdirSync(CACHE_DIR, { recursive: true });
		}
		await fs.promises.writeFile(filePath, fileContent);
		console.log(`Webmentions saved to ${filePath}`);
	} catch (err) {
		console.error("Failed to write webmentions cache:", err);
	}
}

async function getFromCache(): Promise<WebmentionsCache> {
	try {
		const data = await fs.promises.readFile(filePath, "utf-8");
		return JSON.parse(data);
	} catch {
		return { lastFetched: null, children: [] };
	}
}

async function getAndCacheWebmentions() {
	const cache = await getFromCache();
	const mentions = await fetchWebmentions(cache.lastFetched);

	if (mentions) {
		mentions.children = filterWebmentions(mentions.children);
		const webmentions: WebmentionsCache = {
			lastFetched: new Date().toISOString(),
			children: mergeWebmentions(cache, mentions),
		};

		await writeToCache(webmentions);
		return webmentions;
	}

	return cache;
}

let webMentionsPromise: Promise<WebmentionsCache> | null = null;

export async function getWebmentionsForUrl(url: string) {
	if (!webMentionsPromise) {
		webMentionsPromise = getAndCacheWebmentions().catch((err) => {
			console.error("Failed to fetch webmentions:", err);
			webMentionsPromise = null;
			return { lastFetched: null, children: [] } as WebmentionsCache;
		});
	}

	const webMentions = await webMentionsPromise;

	const normalizedUrl = url.replace(/\/$/, "");
	return webMentions.children.filter((entry) => {
		try {
			return entry["wm-target"]?.replace(/\/$/, "") === normalizedUrl;
		} catch {
			return false;
		}
	});
}
