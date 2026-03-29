import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().optional(),
    contact_intro: z.string().optional(),
    headline: z.string().optional(),
    intro: z.string().optional(),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('decision'),
      title: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()),
      outcome: z.string(),
      outcome_status: z.enum(['positive', 'neutral', 'warning']),
      reading_time: z.string(),
    }),
    z.object({
      type: z.literal('wip'),
      title: z.string(),
      started: z.coerce.date(),
      last_updated: z.coerce.date(),
      summary: z.string(),
    }),
  ]),
});

export const collections = { writing, pages };
