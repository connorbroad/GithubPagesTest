import { defineConfig } from 'astro/config';

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  base: '/GithubPagesTest/',
  integrations: [svelte()],
  server: { port: 4200 }
});