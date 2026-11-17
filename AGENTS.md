# AGENTS.md

Sitio de **ParafinaGel**, negocio familiar de velas: catálogo, contacto para comprar y, más adelante, pago en línea y un mini-juego para probar productos y aprender a hacer velas.

## Estado actual

- **Astro 7 + islas Svelte 5**, salida 100 % estática. La app real vive en `src/`.
- El prototipo Go (`cmd/`, `internal/`, `go.mod`) sigue en el repo pero **no se usa**. No lo extiendas; se retirará cuando la versión Astro esté aprobada.
- El catálogo es de ejemplo: `src/content/productos/*.md` con `borrador: true`. En producción se excluye salvo `PUBLIC_SHOW_DRAFTS=true`.
- No hay tests. Verificación: `npm run check`, `npm run build` y revisión visual.

## Comandos

- `npm install`
- `npm run dev` → `http://localhost:4321`
- `npm run build` → `astro check` + build estático en `dist/`
- `npm run preview` → sirve `dist/`
- `npm run check` → tipos y contenido
- `npm run format` / `npm run format:check`
- `PUBLIC_SHOW_DRAFTS=true npm run build` → incluye placeholders en el build.

## Arquitectura

- `src/pages/`: rutas por archivo (`index`, `productos/index`, `productos/[slug]`, `nosotros`, `juego`, `contacto`, `404`). `/about` redirige a `/nosotros` en `astro.config.mjs`.
- `src/layouts/BaseLayout.astro`: SEO, fuentes Fontsource, Nav, Footer y skip link.
- `src/components/`: componentes Astro de UI. `src/components/game/` es la isla Svelte.
- `src/content.config.ts`: schema Zod de productos con loader `glob`.
- `src/lib/products.ts`: consultas, orden por categoría, precios, borradores y relacionados.
- `src/lib/whatsapp.ts` y `src/lib/format.ts`: link de WhatsApp y formato COP.
- `src/config/site.ts`: WhatsApp, correo, Instagram y ciudad centralizados (placeholders `TODO`).
- `src/styles/global.css`: tokens, base, botones y utilidades. Sin Tailwind ni librería de UI.
- `src/lib/game/` + `src/components/game/`: estado, pasos y visuales del juego.

## Reglas

- **Estático por defecto**. Svelte solo para islas interactivas; hoy solo el juego (`client:visible`). No agregues JS global.
- Productos como content collection; no hardcodees productos en componentes.
- `borrador: true` protege los placeholders: el build de producción los excluye. No quites esa protección sin reemplazar los datos.
- Precios en **COP enteros**; si faltan, la UI muestra "Precio por confirmar". No inventes precios.
- Archivos pequeños, una responsabilidad por archivo (SOLID/KISS). Código, nombres y comentarios en inglés; copy visible en español.
- Usa los tokens de `global.css`; no hardcodees colores. `--color-accent-strong` es para texto sobre `--color-accent-soft`; `--color-on-whatsapp` para el texto del botón de WhatsApp.
- Mantén la accesibilidad: axe (WCAG 2.1 AA) pasa hoy en las páginas principales, en claro y oscuro. Revisa contraste, foco, teclado y `prefers-reduced-motion` en cada cambio visual.
- Mobile-first: verifica 360 px, 768 px y desktop. No debe haber scroll horizontal.

## Flujo para agregar un producto

1. Crear `src/content/productos/<slug>.md` según `src/content.config.ts`.
2. Agregar `precio` o `precioDesde` (entero COP) y, si hay fotos, `imagenes` con `src` + `alt`.
3. Validar con `npm run check`.
4. Revisar card y detalle en dev; si el contenido es real, quitar `borrador: true`.

## Datos pendientes

- WhatsApp, correo, Instagram y ciudad: `src/config/site.ts`.
- Dominio: `astro.config.mjs`.
- Historia y copy de Nosotros/Contacto/Home: textos de ejemplo.
- Juego: temperaturas, tiempos y materiales deben validarse con el negocio; hoy no se muestran cifras reales.
- Fotos: los placeholders SVG se reemplazan por imágenes en `src/assets/productos/...`.

## Notas

- `npm audit` reporta 14 vulnerabilidades altas por `picomatch` en dependencias de build. No ejecutes `npm audit fix --force`: puede romper Astro/Svelte. No afecta el sitio estático.
- `package-lock.json` se versiona; `node_modules/` y `dist/` están ignorados.
- `README.md` tiene la guía para humanos y el checklist previo a publicar.

## Skills del repo

En `.opencode/skills/` (cárgalos con la herramienta `skill`):

- `frontend-visual`: diseño, pulido visual y checklist antes de entregar una página.
- `astro-migration`: estado y reglas del código Astro/Svelte actual.
- `product-catalog`: schema, precios, placeholders y copy del catálogo.
- `candle-game`: diseño y límites técnicos del mini-juego.
