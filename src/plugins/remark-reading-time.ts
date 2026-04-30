import type { Root } from "mdast";
import type { Plugin } from "unified";
import { toString as mdastToString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

export const remarkReadingTime: Plugin<[], Root> = () => (tree, vfile) => {
	const textOnPage = mdastToString(tree);
	const readingTime = getReadingTime(textOnPage);
	vfile.data.astro.frontmatter.readingTime = readingTime.text;
};
