// @ts-check
import { defineConfig } from 'astro/config';
import { rehypeWritingTransform } from './rehype-writing-transform.mjs';
import config from './src/config.ts';

export default defineConfig({
  output: 'static',
  site: config.site.url,
  base: config.site.base,
  markdown: {
    rehypePlugins: [rehypeWritingTransform],
  },
});
