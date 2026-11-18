# AGENTS.md

Sitio de **ParafinaGel**, negocio familiar de velas que vende **insumos y materias primas** (ceras, mechas, aromas, colorantes, moldes, recipientes y kits), no velas terminadas. El juego enseña a diseñar una vela y termina en una **receta con lista de insumos**.

## Estado actual

- **Astro 7 + Svelte 5**, salida 100 % estática. El juego es 2D (DOM/SVG/CSS), sin WebGL ni canvas.
- La versión 2.0 del juego incluye pedido progresivo, cuatro tipos de vela (clásica, capas, figura y gel), diseñador, mini-juegos y modo libre.
- El prototipo Go (`cmd/`, `internal/`, `go.mod`) sigue en el repo pero **no se usa**. No lo extiendas; se retirará cuando la versión Astro esté aprobada.
- El catálogo es de ejemplo: `src/content/productos/*.md` con `borrador: true`. En producción se excluye salvo `PUBLIC_SHOW_DRAFTS=true`.
- El arte del juego es SVG/CSS propio (placeholders editoriales); se puede reemplazar por ilustraciones/retratos AI o arte final sin tocar el motor.
- Hay tests unitarios del motor del juego (`npm test`), typecheck de Astro/Svelte y build.

## Comandos

- `npm install`
- `npm run dev` → `http://localhost:4321`
- `npm run build` → `npm run check` + build estático en `dist/`
- `npm run check` → `astro check` + `svelte-check`
- `npm test` → Vitest del motor del juego
- `npm run preview` → sirve `dist/`
- `npm run format` / `npm run format:check`
- `PUBLIC_SHOW_DRAFTS=true npm run build` → incluye placeholders en el build.

## Arquitectura

- `src/pages/`: rutas por archivo (`index`, `productos/index`, `productos/[slug]`, `nosotros`, `juego`, `contacto`, `404`). `/about` redirige a `/nosotros`.
- `src/layouts/BaseLayout.astro`: SEO, fuentes Fontsource, Nav, Footer y skip link.
- `src/components/`: UI en Astro.
- `src/components/game/`: juego 2D. `GameExperience` es el shell con HUD, progreso, reloj y modo experto; `WorkshopStage` es el escenario ilustrado; `*Scene` son las escenas de estación; `*Panel` son los controles; `CandlePreview`/`MoldPreview` son la vista previa; `BriefTicket`/`BriefSummary` son la nota progresiva.
- `src/lib/game/`: motor puro:
  - `types.ts`: tipos de diseño, pedido, fabricación, scoring y receta.
  - `data.ts`: clientes, briefs, ceras, colores, aromas, recipientes, moldes con partes, mechas, etiquetas, montajes y catálogo placeholder de insumos.
  - `design.ts`: `CandleDesign`, capas, validación y resumen.
  - `craft.ts`: unidades de vertido, tiempos, precisión de mecha/etiqueta/corte y burbujas.
  - `scoring.ts`: puntaje de diseño (60) + taller (40), estrellas y puntos.
  - `supplies.ts`: receta, cantidades y mensaje de WhatsApp.
  - `game-state.svelte.ts`: orquestación con runes.
  - `game.test.ts`: tests del motor.
- `src/styles/game.css`: estilos compartidos de la UI del juego, importados solo por `GameExperience`.
- `src/content.config.ts`: schema Zod de productos con loader `glob`.
- `src/lib/products.ts`: consultas, orden por categoría, precios, borradores y relacionados.
- `src/config/site.ts`: WhatsApp, correo, Instagram y ciudad centralizados (placeholders `TODO`).

## Juego 2D

- Escenario ilustrado con cámara fija: overview del taller + escenas de mostrador, diseño, cera, vertido, mecha, curado y acabado.
- Flujo guiado: `brief → design → melt → pour → wick → cool → finish → score`, 4 pedidos y resumen del día.
- **Pedido progresivo**: `BriefTicket` revela el diálogo línea por línea; “Crear nota” fija los requisitos. El brief no se muestra completo desde el inicio.
- **Cuatro tipos**: `clasico` (una capa), `capas` (2–4 capas), `figura` (molde con partes de colores) y `gel` (transparente con montajes).
- **Diseño**: cera, tamaño, recipiente o molde, capas/colores, partes de figura, montajes de gel, aroma, mecha y etiqueta. Validación estructural con errores y advertencias.
- **Timing lento**: calentamiento ~9 °C/s, vertido ~26 %/s y curado de 7–9 s. Sin fail state; solo baja el puntaje.
- **Mini-juegos**: centrar la mecha con flechas, alinear etiqueta (x/y/giro), cortar mecha a una medida objetivo y quitar burbujas de gel.
- **Cierre comercial**: la vela no tiene precio ni propina. El resultado muestra puntos, estrellas, receta e insumos, con CTA a WhatsApp.
- **Modo libre**: sandbox sin pedido ni reloj, con todos los materiales; permite ver la receta o probar el taller.
- **Modo experto**: oculta las pistas numéricas del diseño y del acabado.
- `GameExperience` usa `client:visible`; el juego no debe cargar en el resto del sitio.
- El reloj es `requestAnimationFrame` con delta limitado; `visibilitychange` pausa los timers.
- El arte dinámico (jarra, olla, jarra de vertido, ventilador, vapor, velas, moldes, iconos) es SVG/CSS; no agregues canvas/WebGL.
- `CustomerPortrait` soporta `customer.portrait` opcional para futuros retratos; si no existe, dibuja un retrato SVG.
- Acciones críticas en botones HTML; los hotspots del escenario son un extra. Respeta `prefers-reduced-motion`.
- Datos del juego: briefs y materiales en `src/lib/game/data.ts`. Los slugs de producto ya no se usan en el juego; la lista de insumos es placeholder.
- No agregues Three.js/Threlte: la decisión es 2D. El bundle del juego debe mantenerse ligero.

## Reglas generales

- **Estático por defecto**. Svelte solo para el juego; no agregues JS global.
- Productos como content collection; no hardcodees productos en componentes.
- `borrador: true` protege los placeholders: el build de producción los excluye. No quites esa protección sin reemplazar los datos.
- Precios en **COP enteros**; si faltan, la UI muestra "Precio por confirmar". No inventes precios.
- Archivos pequeños, una responsabilidad por archivo (SOLID/KISS). Código, nombres y comentarios en inglés; copy visible en español.
- Usa los tokens de `global.css`; no hardcodees colores. `--color-accent-strong` es para texto sobre `--color-accent-soft`; `--color-on-whatsapp` para el texto del botón de WhatsApp.
- **No nombres una variable `state` en un componente que usa `$state`**: Svelte compila `$state` como suscripción a un store y lanza `store_invalid_shape`. Usa `game` o `store`.
- Mantén accesibilidad: axe (WCAG 2.1 AA) pasa en las páginas principales y en `/juego`, en claro y oscuro. Revisa contraste, foco, teclado y `prefers-reduced-motion`.
- Mobile-first: verifica 360 px, 768 px y desktop. No debe haber scroll horizontal.

## Flujo para agregar un producto

1. Crear `src/content/productos/<slug>.md` según `src/content.config.ts`.
2. Agregar `precio` o `precioDesde` (entero COP) y, si hay fotos, `imagenes` con `src` + `alt`.
3. Validar con `npm run check`.
4. Revisar card y detalle en dev; si el contenido es real, quitar `borrador: true`.
5. Si el insumo aparece en el juego, actualizar su entrada en `src/lib/game/data.ts` y en `supplyCatalog`.

## Datos pendientes

- WhatsApp, correo, Instagram y ciudad: `src/config/site.ts`.
- Dominio: `astro.config.mjs`.
- Catálogo real de insumos y precios: hoy el catálogo sigue siendo de velas de ejemplo; migrar a ceras, mechas, aromas, colorantes, moldes, recipientes y kits.
- Briefs, cantidades de receta y disponibilidad de materiales: validar con el negocio.
- Juego: temperaturas, tiempos, rangos de mecha y medidas de corte son placeholders; no mostrarlos como datos reales.
- Fotos: los placeholders SVG se reemplazan por imágenes en `src/assets/productos/...`.
- Arte del juego: los SVG/CSS actuales se pueden reemplazar por retratos/escenas AI o arte final; mantén el mismo layout y los `data-testid`.

## Notas

- `npm audit` reporta 16 vulnerabilidades altas en dependencias de build (`picomatch` y tooling). No ejecutes `npm audit fix --force`: puede romper Astro/Svelte. No afecta el sitio estático.
- `package-lock.json` se versiona; `node_modules/` y `dist/` están ignorados.
- `README.md` tiene la guía para humanos y el checklist previo a publicar.

## Skills del repo

En `.opencode/skills/` (cárgalos con la herramienta `skill`):

- `frontend-visual`: diseño, pulido visual y checklist antes de entregar una página.
- `astro-migration`: estado y reglas del código Astro/Svelte actual.
- `product-catalog`: schema, precios, placeholders y copy del catálogo.
- `candle-game`: diseño, arquitectura y límites del juego 2D.
