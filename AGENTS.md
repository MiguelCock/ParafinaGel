# AGENTS.md

Sitio de **ParafinaGel**, negocio familiar de velas que vende **insumos y materias primas** (ceras, mechas, aromas, colorantes, moldes, recipientes y kits), no velas terminadas. El juego enseña a diseñar una vela y termina en una **receta con lista de insumos**.

## Estado actual

- **Astro 7 + Svelte 5**, salida 100 % estática.
- El escenario interactivo del juego usa **WebGL con PixiJS 8**; la UI de paneles sigue en Svelte/DOM.
- La versión 2.1 incluye pedido progresivo, cuatro tipos de vela, diseñador, retos manuales, simulación de líquido viscoso, modo libre y fallback sin WebGL.
- El catálogo es de ejemplo: `src/content/productos/*.md` con `borrador: true`. En producción se excluye salvo `PUBLIC_SHOW_DRAFTS=true`.
- Los retratos se generan por capas en `src/lib/game/portrait.ts` (pelo trasero, cara y flequillo) para evitar desalineaciones.
- Hay tests del motor (`npm test`), typecheck de Astro/Svelte y build.

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
- `src/components/game/`:
  - `GameExperience.svelte`: shell, HUD, progreso, reloj, modo experto y ayuda.
  - `WorkshopStage.svelte`: escenario ilustrado, hotspots y cabecera de estación.
  - `StageCanvas.svelte`: monta PixiJS en cliente, importa el renderer dinámicamente y muestra el fallback sin WebGL.
  - `CounterScene`, `CustomerPortrait`, `BriefTicket`, `BriefSummary`: mostrador y pedido progresivo.
  - `DesignPanel`, `DesignBasics`, `DesignColors`, `ColorDots`: diseñador.
  - `MeltPanel`, `PourPanel`, `WickPanel`, `CoolPanel`, `FinishPanel`, `ScorePanel`, `ShoppingList`: paneles y receta.
  - `CandlePreview`/`MoldPreview`: vista SVG de respaldo sin WebGL.
- `src/lib/game/`:
  - `types.ts`: diseño, brief, fabricación, scoring y receta.
  - `data.ts`: clientes, briefs, ceras, colores, aromas, recipientes, moldes, mechas, etiquetas, montajes y catálogo placeholder de insumos.
  - `design.ts`: `CandleDesign`, capas, validación y resumen.
  - `craft.ts`: unidades de vertido, precisión de mecha/etiqueta/corte y burbujas.
  - `liquid.ts`: simulación de superficie, salpicaduras, mezcla y burbujas.
  - `scoring.ts`: diseño (60) + taller (40), incluyendo mezcla y derrame.
  - `supplies.ts`: receta, cantidades y mensaje de WhatsApp.
  - `portrait.ts`: SVG por capas de los retratos.
  - `game-state.svelte.ts`: orquestación con runes.
  - `render/`: `stage-renderer.ts`, `scene.ts`, `candle-rig.ts`, `palette.ts` y `scenes/` (design, melt, pour, wick, cool, finish).
  - `game.test.ts`: tests del motor y del líquido.
- `src/styles/game.css`: estilos compartidos de la UI del juego.
- `src/content.config.ts`: schema Zod de productos con loader `glob`.
- `src/lib/products.ts`: consultas, orden por categoría, precios, borradores y relacionados.
- `src/config/site.ts`: WhatsApp, correo, Instagram y ciudad centralizados (placeholders `TODO`).

## Juego WebGL

- Flujo guiado: `brief → design → melt → pour → wick → cool → finish → score`, 4 pedidos y resumen del día.
- **WebGL con PixiJS 8** para el escenario y los retos. No uses Three.js/Threlte: la decisión es 2D WebGL.
- `StageCanvas` importa Pixi dinámicamente solo en cliente; el resto del sitio no carga el motor.
- **Escenario virtual 1000×640** escalado a la caja disponible, con coordenadas compartidas para evitar desalineaciones.
- **Pedido progresivo**: el cliente revela líneas y “Crear nota” fija el brief.
- **Cuatro tipos**: clásica, capas (2–4), figura (molde con partes) y gel (transparente con montajes).
- **Diseño**: cera, tamaño, recipiente o molde, capas/colores, aroma, mecha y etiqueta. Los materiales se eligen con botones; las validaciones aparecen en el panel.
- **Retos manuales**:
  - Cera: mantener la palanca para calentar y arrastrar la cuchara en círculos.
  - Vertido: arrastrar la jarra sobre la boca del frasco y soltar para cerrar la capa.
  - Mecha: arrastrar al centro de la vista superior.
  - Curado: tocar el ventilador; en gel, tocar las burbujas.
  - Acabado: arrastrar la etiqueta y su tirador, cortar la mecha sobre la vela, tocar tapa y empaque.
- **Sin sliders ni botones para los retos**. El teclado es la alternativa accesible: flechas, Espacio, Enter, Mayús + flechas, 1–4 en acabado.
- **Simulación de líquido viscoso**: superficie ondulada, volumen, película entre capas, salpicaduras, mezcla de color por temperatura y burbujas de gel. Afecta el puntaje (`mix` y `spill`).
- **Puntaje**: diseño 60 + taller 40 (temperatura, vertido, mezcla, derrame, mecha, etiqueta, corte y gel). Estrellas y puntos; sin precio ni propina.
- **Cierre comercial**: receta con cantidades y CTA de WhatsApp. El catálogo público de insumos es placeholder.
- **Modo libre**: sin brief ni reloj; se puede ver la receta o probar el taller.
- **Modo experto**: oculta pistas numéricas del diseño y del acabado.
- **Fallback**: si no hay WebGL, se muestra el diseño en SVG y se ofrece “Ver receta sin taller”.
- `prefers-reduced-motion` reduce ondas, vapor, ventilador y llama.
- El tick del juego usa `requestAnimationFrame` con delta limitado; Pixi renderiza con su propio ticker. `visibilitychange` pausa el estado.

## Reglas generales

- **Estático por defecto**. Svelte solo para el juego; no agregues JS global.
- Productos como content collection; no hardcodees productos en componentes.
- `borrador: true` protege los placeholders: el build de producción los excluye. No quites esa protección sin reemplazar los datos.
- Precios en **COP enteros**; si faltan, la UI muestra "Precio por confirmar". No inventes precios.
- Archivos pequeños, una responsabilidad por archivo (SOLID/KISS). Código, nombres y comentarios en inglés; copy visible en español.
- Usa los tokens de `global.css` para la UI. Para Pixi usa `src/lib/game/render/palette.ts` (WebGL no lee variables CSS) y mantén la paleta alineada.
- **No nombres una variable `state` en un componente que usa `$state`**: Svelte compila `$state` como suscripción a un store y lanza `store_invalid_shape`. Usa `game` o `store`.
- Mantén accesibilidad: axe (WCAG 2.1 AA) pasa en las páginas principales y en `/juego`, en claro y oscuro. Revisa contraste, foco, teclado y `prefers-reduced-motion`.
- Mobile-first: verifica 360 px, 768 px y desktop. No debe haber scroll horizontal.
- El canvas es un `role="application"` focusable; los controles manuales deben tener equivalente de teclado y el panel debe explicar los gestos.

## Flujo para agregar un producto

1. Crear `src/content/productos/<slug>.md` según `src/content.config.ts`.
2. Agregar `precio` o `precioDesde` (entero COP) y, si hay fotos, `imagenes` con `src` + `alt`.
3. Validar con `npm run check`.
4. Revisar card y detalle en dev; si el contenido es real, quitar `borrador: true`.
5. Si el insumo aparece en el juego, actualizar su entrada en `src/lib/game/data.ts` y `supplyCatalog`.

## Datos pendientes

- WhatsApp, correo, Instagram y ciudad: `src/config/site.ts`.
- Dominio: `astro.config.mjs`.
- Catálogo real de insumos y precios: hoy el catálogo sigue siendo de velas de ejemplo; migrar a ceras, mechas, aromas, colorantes, moldes, recipientes y kits.
- Briefs, cantidades de receta y disponibilidad: validar con el negocio.
- Juego: temperaturas, tiempos, rangos de mecha y medidas de corte son placeholders; no mostrarlos como datos reales.
- Fotos: los placeholders SVG se reemplazan por imágenes en `src/assets/productos/...`.
- Arte: retratos en `portrait.ts` y escenas Pixi se pueden reemplazar por arte final manteniendo anclas y `data-testid`.

## Notas

- PixiJS agrega ~180–230 KB gzip al chunk del juego, cargado solo en `/juego` y de forma diferida. Mantén el presupuesto.
- `package-lock.json` se versiona; `node_modules/` y `dist/` están ignorados.
- `README.md` tiene la guía para humanos y el checklist previo a publicar.

## Skills del repo

En `.opencode/skills/` (cárgalos con la herramienta `skill`):

- `frontend-visual`: diseño, pulido visual y checklist antes de entregar una página.
- `product-catalog`: schema, precios, placeholders y copy del catálogo.
- `candle-game`: diseño, arquitectura WebGL/PixiJS, retos manuales y líquidos.
