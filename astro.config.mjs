// @ts-check
import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

// TODO: reemplazar por el dominio real antes de publicar.
const SITE_URL = "https://parafinagel.example";

if (SITE_URL.includes(".example")) {
  console.warn(
    "[ParafinaGel] Dominio placeholder: reemplaza SITE_URL antes de publicar.",
  );
}

export default defineConfig({
  site: SITE_URL,
  integrations: [svelte()],
  redirects: {
    "/about": "/nosotros",
  },
});
