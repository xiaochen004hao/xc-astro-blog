import type { Root } from "mdast";
import { toString as mdastToString } from "mdast-util-to-string";
import getReadingTime from "reading-time";
import type { Plugin } from "unified";

export const remarkReadingTime: Plugin<[], Root> = () => (tree, vfile) => {
	const textOnPage = mdastToString(tree);
	const stats = getReadingTime(textOnPage, { wordsPerMinute: 300 });
	if (vfile.data.astro?.frontmatter) {
		// 输出中文格式的阅读时间和字数
		// words 是 reading-time 估算的"词数"（中文按字符数算）
		const minutes = Math.max(1, Math.round(stats.minutes));
		vfile.data.astro.frontmatter.readingTime = `${minutes} 分钟阅读`;
		vfile.data.astro.frontmatter.wordCount = stats.words;
	}
};
