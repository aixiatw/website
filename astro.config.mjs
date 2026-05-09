// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// TinaCMS is temporarily disabled - using Decap CMS instead
// import tina from '@tinacms/astro';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  },
  // integrations: [tina()],
});