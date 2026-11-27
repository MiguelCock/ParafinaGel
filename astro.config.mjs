import { defineConfig } from "astro/config";
import svelte from "@astrojs/svelte";

// TODO: reemplazar por el dominio real antes de publicar.
const SITE_URL = "https://parafinagel.example";

if (SITE_URL.includes(".example")) {
  console.warn(
    "[ParafinaGel] Dominio placeholder: reemplaza SITE_URL antes de publicar.",
  );
}

/**
 * The fluid lab is an internal prototype. Keep it out of the public build by
 * default; it is injected in `astro dev` and in builds that ask for it.
 */
function fluidLab() {
  return {
    name: "parafina-fluid-lab",
    hooks: {
      "astro:config:setup": ({ command, injectRoute }) => {
        if (command === "dev" || process.env.ENABLE_FLUID_LAB === "true") {
          injectRoute({
            pattern: "/lab/fluido",
            entrypoint: "./src/lab/FluidLabPage.astro",
          });
        }
      },
    },
  };
}

export default defineConfig({
  site: SITE_URL,
  integrations: [svelte(), fluidLab()],
  redirects: {
    "/about": "/nosotros",
  },
});
