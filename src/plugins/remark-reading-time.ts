import type { Root } from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";
import getReadingTime from "reading-time";
import type { Plugin } from "unified";

export const remarkReadingTime: Plugin<[], Root> = () => (tree, vfile) => {
	const textOnPage = mdastToString(tree);
	const readingTime = getReadingTime(textOnPage);
	if (vfile.data.astro?.frontmatter) {
		vfile.data.astro.frontmatter.readingTime = readingTime.text;
	}
};
