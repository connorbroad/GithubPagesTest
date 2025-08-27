import { defineConfig } from 'astro/config';

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: 'https://connorbroad.github.io',
  base: '/github-pages-test',
  integrations: [svelte()],
  server: { port: 4200 }
});