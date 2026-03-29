// @ts-check
import { defineConfig } from 'astro/config';
import { rehypeWritingTransform } from './rehype-writing-transform.mjs';

export default defineConfig({
  output: 'static',
  site: 'https://kidrahahjo.github.io',
  base: '/who-am-i',
  markdown: {
    rehypePlugins: [rehypeWritingTransform],
  },
});
