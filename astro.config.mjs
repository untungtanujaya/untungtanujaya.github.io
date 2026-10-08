import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://untungtanujaya.com',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [react(), sitemap({ filter: page => /\/(en|zh)\//.test(new URL(page).pathname) })],
  markdown: { shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false } },
  vite: { plugins: [tailwindcss()] },
});
