import { defineCollection } from "astro:content";
import { z } from "zod";
import { glob } from "astro/loaders";

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

const tag = defineCollection({
    schema: z.object({
        title: titleSchema,
        description: z.string().optional(),
    }),
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/tag" }),
});

export const collections = { post, note, tag };
