declare module "@pagefind/default-ui" {
	declare class PagefindUI {
		constructor(arg: unknown);
	}
}

declare module "@waline/client" {
	export function init(options: Record<string, unknown>): { destroy?: () => void };
}

declare module "@waline/client/style" {}

interface ThemeAPI {
	get: () => string;
	getResolved: () => "light" | "dark";
	set: (value: string) => string;
}

interface Window {
	__swReady?: boolean;
	__searchCrashed?: boolean;
	__searchCrashReady?: boolean;
	__lenis?: unknown;
	__theme?: ThemeAPI;
}
