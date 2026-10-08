import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
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
  'publications': defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/publications' }),
    schema: z.object({
      title: z.object({ en: z.string().min(1), zh: z.string().min(1) }),
      abstract: z.object({ en: z.string().min(1), zh: z.string().min(1) }),
      authors: z.array(z.string().min(1)).min(1),
      date: z.coerce.date(),
      venue: z.string().min(1),
      status: z.enum(['preprint', 'published']),
      doi: z.string().regex(/^10\.\d{4,9}\/\S+$/).optional(),
      paperUrl: z.string().url().optional(),
      codeUrl: z.string().url().optional(),
      bibtex: z.string().optional(),
      draft: z.boolean().default(true),
    }),
  }),
};
