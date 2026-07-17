import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articlesCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    summary: z.string(),
    pubDate: z.date().or(z.string().transform(str => new Date(str))),
    read_time: z.number().optional().default(5),
    slug: z.string().optional(),
  }),
});

export const collections = {
  'articles': articlesCollection,
};
