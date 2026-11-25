import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.CONCEPT_ORIGIN ?? 'https://jlsp124.github.io',
  base: process.env.CONCEPT_BASE ?? '/hewberry-website-concept',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
