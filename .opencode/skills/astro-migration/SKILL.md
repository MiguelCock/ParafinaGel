---
name: Astro migration
description: Trabajar en el sitio Astro 7 + Svelte 5 de ParafinaGel: estructura, rutas, content collections, islas, juego 2D y verificación. Úsalo al modificar la arquitectura, agregar páginas o completar la migración pendiente desde Go.
---

# Astro + Svelte en ParafinaGel

La migración desde Go ya está hecha: `src/` es la app real. El prototipo Go (`cmd/`, `internal/`, `go.mod`) sigue en el repo solo como referencia y no se usa.

## Stack

- Astro 7 + Svelte 5, salida estática.
- Juego 2D con DOM/SVG/CSS; sin Three.js, Threlte ni canvas.
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
  components/game/ GameExperience, WorkshopStage, escenas, paneles y SVG del juego
  content/         productos/*.md
  lib/game/        motor: game-state.svelte.ts, data, orders, types
  lib/             products.ts, whatsapp.ts, format.ts
  styles/          global.css, game.css
public/            favicon.svg, robots.txt
```

## Rutas

- `/`, `/productos/`, `/productos/[slug]/`, `/nosotros/`, `/juego/`, `/contacto/`.
- `/about` redirige a `/nosotros` en `astro.config.mjs`.
- 404 en `src/pages/404.astro`.

## Reglas

- **Estático por defecto**. Svelte solo para el juego; usa `client:visible`. No agregues JS global.
- Usa los helpers de `src/lib/products.ts` (`getProductos`, `getDestacados`, `getRelacionados`, `getPrecio`) en vez de consultar la colección a mano.
- `productos/[slug].astro` usa `getStaticPaths` + `getCollection`; no hardcodees productos.
- `borrador: true` excluye placeholders del build de producción. `PUBLIC_SHOW_DRAFTS=true` los incluye para previsualizar.
- SEO en `BaseLayout`; JSON-LD de producto con `<Fragment slot="head">`.
- Imágenes reales con `astro:assets` (`<Image />`); hoy `ProductImage.astro` genera placeholders SVG.
- No agregues Tailwind ni librería de UI. No agregues dependencias pesadas sin justificarlo.
- El juego tiene reglas propias en el skill `candle-game` (escenario, SVG/CSS, responsive y accesibilidad). Respétalas.
- `npm run build` incluye `npm run check` (Astro + Svelte). `npm test` corre Vitest.
- No ejecutes `npm audit fix --force` (rompe versiones por tooling/picomatch).

## Pendiente

- Retirar el prototipo Go cuando el dueño apruebe la versión nueva.
- Reemplazar datos de contacto, catálogo, textos e imágenes de ejemplo.
- Fase 2 del juego: “Crear mi vela”, puntaje/persistencia, audio y arte final.
- Definir dominio real en `astro.config.mjs`.

Detalle de rutas y equivalencias con Go: `references/mapping.md`.
