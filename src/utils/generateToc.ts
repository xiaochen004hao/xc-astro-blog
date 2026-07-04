// Heavy inspiration from starlight: https://github.com/withastro/starlight/blob/main/packages/starlight/utils/generateToC.ts
import type { MarkdownHeading } from "astro";

export interface TocItem extends MarkdownHeading {
	children: TocItem[];
}

interface TocOpts {
	maxHeadingLevel?: number | undefined;
	minHeadingLevel?: number | undefined;
}

/** Inject a ToC entry as deep in the tree as its `depth` property requires. */
function injectChild(items: TocItem[], item: TocItem): void {
	const lastItem = items.at(-1);
	if (!lastItem) {
		items.push(item);
	} else if (lastItem.depth < item.depth) {
		injectChild(lastItem.children, item);
	} else {
		items.push(item);
	}
}

export function generateToc(
	headings: ReadonlyArray<MarkdownHeading>,
	{ maxHeadingLevel = 6, minHeadingLevel = 1 }: TocOpts = {},
) {
	const bodyHeadings = headings.filter(
		({ depth }) => depth >= minHeadingLevel && depth <= maxHeadingLevel,
	);
	const toc: Array<TocItem> = [];

	for (const heading of bodyHeadings) injectChild(toc, { ...heading, children: [] });

	return toc;
}
