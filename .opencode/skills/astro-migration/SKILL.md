---
name: Astro migration
description: Trabajar en el sitio Astro 7 + Svelte 5 + Threlte/Three.js de ParafinaGel: estructura, rutas, content collections, islas, juego 3D y verificación. Úsalo al modificar la arquitectura, agregar páginas o completar la migración pendiente desde Go.
---

# Astro + Svelte en ParafinaGel

La migración desde Go ya está hecha: `src/` es la app real. El prototipo Go (`cmd/`, `internal/`, `go.mod`) sigue en el repo solo como referencia y no se usa.

## Stack

- Astro 7 + Svelte 5, salida estática.
- Juego 3D con Threlte 8 + Three.js 0.187.
- Node.js >= 22.23.4.
- Contenido con content collections (`src/content.config.ts`, loader `glob`).
- CSS plano con tokens en `src/styles/global.css`.
- Fuentes autohospedadas con Fontsource.
- Tests del motor con Vitest; typecheck con `astro check` + `svelte-check`.

## Estructura

```text
src/
  pages/           index, productos/index, productos/[slug], nosotros, juego, contacto, 404
  layouts/         BaseLayout.astro
  components/      Nav, Footer, Button, ProductCard, ProductImage, PageHero, HomeHero...
  components/game3d/  GameExperience, Game3D, GameScene, estaciones y paneles
  components/game/    CandleGame (respaldo 2D)
  content/         productos/*.md
  lib/game3d/      motor: game-state.svelte.ts, data, orders, palette, motion
  lib/             products.ts, whatsapp.ts, format.ts
  styles/          global.css, game.css
public/            favicon.svg, robots.txt
```

## Rutas

- `/`, `/productos/`, `/productos/[slug]/`, `/nosotros/`, `/juego/`, `/contacto/`.
- `/about` redirige a `/nosotros` en `astro.config.mjs`.
- 404 en `src/pages/404.astro`.

## Reglas

- **Estático por defecto**. Svelte solo para el juego: 3D con `client:only` y respaldo 2D. No agregues JS global.
- Usa los helpers de `src/lib/products.ts` (`getProductos`, `getDestacados`, `getRelacionados`, `getPrecio`) en vez de consultar la colección a mano.
- `productos/[slug].astro` usa `getStaticPaths` + `getCollection`; no hardcodees productos.
- `borrador: true` excluye placeholders del build de producción. `PUBLIC_SHOW_DRAFTS=true` los incluye para previsualizar.
- SEO en `BaseLayout`; JSON-LD de producto con `<Fragment slot="head">`.
- Imágenes reales con `astro:assets` (`<Image />`); hoy `ProductImage.astro` genera placeholders SVG.
- No agregues Tailwind ni librería de UI. No agregues dependencias pesadas sin justificarlo.
- El juego 3D tiene reglas propias en el skill `candle-game` (cámara fija, Threlte, rendimiento y gotchas). Respétalas.
- `npm run build` incluye `npm run check` (Astro + Svelte). `npm test` corre Vitest.
- No ejecutes `npm audit fix --force` (rompe versiones por tooling/picomatch).

## Pendiente

- Retirar el prototipo Go cuando el dueño apruebe la versión nueva.
- Reemplazar datos de contacto, catálogo, textos e imágenes de ejemplo.
- Fase 2 del juego: “Crear mi vela”, puntaje/persistencia, audio y arte 3D final.
- Definir dominio real en `astro.config.mjs`.

Detalle de rutas y equivalencias con Go: `references/mapping.md`.
