import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const titleSchema = z.string().max(60);

const post = defineCollection({
	schema: ({ image }) =>
		z.object({
			title: titleSchema,
			description: z.string().min(10),
			publishDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			pinned: z.boolean().default(false),
			tags: z.array(z.string()).default([]),
			draft: z.boolean().default(false),
			aiSummary: z.string().optional(),
			aiModel: z.string().optional(),
			ogImage: z.string().optional(),
			coverImage: z
				.object({
					src: image(),
					alt: z.string(),
				})
				.optional(),
		}),
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/post" }),
});

const note = defineCollection({
	schema: z.object({
		title: titleSchema,
		description: z.string().optional(),
		publishDate: z.coerce.date(),
		draft: z.boolean().default(false),
	}),
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/note" }),
});

// 可选的标签元数据集合：在 src/content/tag/<tagname>.md 定义标签的标题和描述
// 不定义则使用默认标题（关于 <tag> 的文章）和描述
const tag = defineCollection({
	schema: z.object({
		title: titleSchema,
		description: z.string().optional(),
	}),
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/tag" }),
});

export const collections = { post, note, tag };
