# AGENTS.md

Sitio de **ParafinaGel**, negocio familiar de velas que vende **insumos y materias primas** (ceras, mechas, aromas, colorantes, moldes, recipientes y kits), no velas terminadas. El juego enseña a diseñar una vela y termina en una **receta con lista de insumos**.

## Estado actual

- **Astro 7 + Svelte 5**, salida 100 % estática.
- El escenario interactivo del juego usa **WebGL con PixiJS 8**; la UI de paneles sigue en Svelte/DOM.
- La versión 2.2 incluye pedido progresivo, cuatro tipos de vela, diseñador, retos manuales, simulación de líquido viscoso, sistema de motion, modo libre y fallback sin WebGL.
- El catálogo tiene 16 productos oficiales en `src/content/productos/*.md`, con precios de venta en COP y venta por kg, pote o unidad. Faltan fotos y los insumos que aún no están en la lista. `borrador: true` sigue disponible para placeholders futuros.
- Los retratos se generan por capas en `src/lib/game/portrait.ts` (pelo trasero, cara y flequillo) para evitar desalineaciones.
- Hay tests del motor (`npm test`), typecheck de Astro/Svelte y build.

## Comandos

- `npm install`
- `npm run dev` → `http://localhost:4321`
- `npm run build` → `npm run check` + build estático en `dist/`
- `npm run check` → `astro check` + `svelte-check`
- `npm test` → Vitest del motor del juego
- `npm run qa:game` → build + E2E, capturas, axe, overflow, bundle y FPS en `qa/`
- `QA_QUICK=1 npm run qa:game` → humo visual del juego
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
  - `DesignPanel`, `DesignStructure`: diseñador y estructura de capas.
  - `MaterialShelf`, `AccessibleMaterialPicker`: estantería física y selector accesible de materiales.
  - `MeltPanel`, `MixPanel`, `PourPanel`, `WickPanel`, `CoolPanel`, `FinishPanel`, `ScorePanel`, `ShoppingList`: paneles y receta.
  - `CandlePreview`/`MoldPreview`: vista SVG de respaldo sin WebGL.
- `src/lib/game/`:
  - `types.ts`: diseño, brief, fabricación, scoring y receta.
  - `data.ts`: clientes, briefs, ceras oficiales, colores, aromas, recipientes, moldes, pabilos, etiquetas, montajes y catálogo de insumos.
  - `design.ts`: `CandleDesign`, capas, validación y resumen.
  - `craft.ts`: unidades de vertido, precisión de mecha/etiqueta/corte y burbujas.
  - `liquid.ts`: simulación de superficie, salpicaduras, mezcla y burbujas.
  - `motion.ts`: tokens de duración/easing y `MotionController` para tweens.
  - `motion.svelte.ts`: estado de movimiento reducido, pausa y override por query.
  - `scoring.ts`: diseño (60) + taller (40), incluyendo mezcla y derrame.
  - `supplies.ts`: receta, cantidades y mensaje de WhatsApp.
  - `portrait.ts`: SVG por capas de los retratos.
  - `game-state.svelte.ts`: orquestación con runes.
  - `render/`: `stage-renderer.ts`, `scene.ts`, `candle-rig.ts`, `liquid-rig.ts`, `palette.ts`, `motion.ts` y `scenes/` (design, melt, mix, pour, wick, cool, finish).
  - `game.test.ts` y `motion.test.ts`: tests del motor, líquido y motion.
- `src/styles/game.css`: estilos compartidos de la UI del juego.
- `src/content.config.ts`: schema Zod de productos con loader `glob`.
- `src/lib/products.ts`: consultas, orden por categoría, precios, borradores y relacionados.
- `src/config/site.ts`: WhatsApp, correo, Instagram y ciudad centralizados (placeholders `TODO`).
- `scripts/qa-game.mjs` y `scripts/qa/`: harness de QA con Puppeteer Core y axe.
- `qa/`: reportes, JSON y capturas del QA; ignorada por git.
- `docs/proceso-de-fabricacion.md`: notas del proceso real, correspondencia con estaciones y datos pendientes.
- `docs/datos-validacion.md`: inventario de datos oficiales, notas y placeholders, con códigos para aprobar en #87.
- `docs/roadmap.md`: ruta directa de construcción; la fuente operativa son los hitos `Fase 0`–`Fase 6`, el issue #124 y el [tablero](https://github.com/users/MiguelCock/projects/6).

## Juego WebGL

- Flujo guiado: `brief → design → wick (preparación) → melt → mix → pour → cool → finish → score`, 4 pedidos y resumen del día.
- **WebGL con PixiJS 8** para el escenario y los retos. No uses Three.js/Threlte: la decisión es 2D WebGL.
- `StageCanvas` importa Pixi dinámicamente solo en cliente; el resto del sitio no carga el motor.
- **Escenario virtual 1000×640** escalado a la caja disponible, con coordenadas compartidas para evitar desalineaciones.
- **Pedido progresivo**: el cliente revela líneas y “Crear nota” fija el brief.
- **Cuatro tipos**: clásica, capas (2–4), figura (molde con partes) y gel (transparente con montajes).
- **Diseño**: cera, tamaño, recipiente o molde, capas/colores, aroma, pabilo y etiqueta. Los materiales se eligen como objetos en la estantería física; el selector accesible es la alternativa de teclado/lector. Las validaciones aparecen en el panel.
- **Retos manuales**:
  - Preparación: colocar el porta pabilo, ajustar la mecha al centro y usar el sostenedor antes de verter.
  - Cera: cortar la parafina en bloque (2–4 cortes) antes de calentar; agregar ácido esteárico solo a las parafinas en bloque; mantener la palanca para calentar y arrastrar la cuchara en círculos.
  - Mezcla: un fogón por capa o parte; calentar cada fogón con su palanca, dosificar color gota a gota, aroma manual y un aroma por fogón; revolver cada lote.
  - Vertido: arrastrar la jarra sobre la boca del frasco y soltar para cerrar la capa.
  - Curado: retirar el sostenedor, tocar el ventilador; en gel, tocar las burbujas.
  - Acabado: arrastrar la etiqueta y su tirador, cortar la mecha sobre la vela, tocar tapa y empaque.
- **Sin sliders ni botones para los retos**. El teclado es la alternativa accesible: flechas, Espacio, Enter, Mayús + flechas, 1–4 para fogones y 1–4 en acabado.
- **Simulación de líquido viscoso**: superficie con menisco y brillo, chorro, película entre capas, salpicaduras, derrame, mezcla de color al revolver y gel con refracción simulada y burbujas. `liquid.ts` es el solver puro; `render/liquid-rig.ts` dibuja la superficie y las gotas. Afecta el puntaje (`mix` y `spill`).
- **Puntaje**: diseño 60 + taller 40 (temperatura, vertido, mezcla, derrame, mecha, etiqueta, corte y gel). Estrellas y puntos; sin precio ni propina.
- **Cierre comercial**: receta con cantidades y CTA de WhatsApp. El catálogo público ya tiene precios oficiales de 16 insumos; faltan envases, aromas, colorantes, moldes y etiquetas.
- **Modo libre**: sin brief ni reloj; se puede ver la receta o probar el taller.
- **Modo experto**: oculta pistas numéricas del diseño y del acabado.
- **Fallback**: si no hay WebGL, se muestra el diseño en SVG y se ofrece “Ver receta sin taller”.
- **Motion tokens**: usa duraciones/easings de `motion.ts`; no inventes tiempos por escena. `MotionState` centraliza `prefers-reduced-motion`, pausa y el override `?motion=off` / `?motion=full`.
- **Pausa decorativa**: ayuda abierta, pestaña oculta o escena fuera de vista pausan tweens/animaciones, no la lógica del juego.
- **Presupuesto**: usa `motionBudget` (partículas, tweens concurrentes, stagger y frame budget); no agregues librerías de animación.
- `prefers-reduced-motion` reduce ondas, vapor, ventilador y llama.
- El tick del juego usa `requestAnimationFrame` con delta limitado; Pixi renderiza con su propio ticker. `visibilitychange` pausa el estado.

## QA del juego

- `npm run qa:game`: build, servidor estático de `dist/`, navegador y matriz completa.
- `scripts/qa-game.mjs` orquesta; `scripts/qa/` separa entorno, navegador, flujos, checks y reporte.
- Cubre los 4 pedidos, puntero y teclado, sandbox, fallback, 390/1280, claro/oscuro, axe, overflow, consola, bundle y FPS.
- Los fallos de axe, overflow, consola, receta o flujo son duros; el FPS bajo SwiftShader es un aviso.
- Salidas en `qa/report.md`, `qa/report.json` y `qa/screens/`; `qa/` está ignorada.
- Variables: `BROWSER_PATH`, `QA_QUICK=1`, `QA_SKIP_BUILD=1`, `QA_BASE_URL`, `QA_OUT_DIR`, `QA_PORT`, `QA_HEADLESS=0`.
- No hay comparación visual contra línea base todavía; las capturas usan nombres estables para una historia posterior.
- El QA no corre en CI ni dentro de `npm run build`.

## Reglas generales

- **Repositorio público**: no agregues datos reales de contacto, precios, clientes, secretos ni archivos `.env`. Usa placeholders marcados con `TODO`.
- **Licencia propietaria**: el código, el arte y la marca están bajo `LICENSE`; no cambies el uso, la marca ni el texto sin decisión del dueño.
- **Estático por defecto**. Svelte solo para el juego; no agregues JS global.
- Productos como content collection; no hardcodees productos en componentes.
- `borrador: true` protege los placeholders: el build de producción los excluye. No quites esa protección sin reemplazar los datos.
- Precios en **COP enteros**; si faltan, la UI muestra "Precio por confirmar". No inventes precios.
- Archivos pequeños, una responsabilidad por archivo (SOLID/KISS). Código, nombres y comentarios en inglés; copy visible en español.
- Usa los tokens de `global.css` para la UI. Para Pixi usa `src/lib/game/render/palette.ts` (WebGL no lee variables CSS) y mantén la paleta alineada.
- Usa los tokens de `src/lib/game/motion.ts` para animaciones. No agregues duraciones mágicas ni librerías de motion.
- Toda animación nueva debe respetar `motion.reduced` y tener una versión estática o de baja intensidad.
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
- Catálogo: 16 productos oficiales cargados desde la lista de precios. Faltan envases, aromas, colorantes, moldes, etiquetas, fotos y descripciones ampliadas.
- Briefs, cantidades de receta y disponibilidad: validar con el negocio.
- Juego: temperaturas, tiempos, rangos de mecha, medidas de corte, gotas de colorante y dosis de aroma son placeholders; no mostrarlos como datos reales.
- Proceso: porcentaje de ácido esteárico, base del 8–10 % de aroma, temperatura de mezcla, tabla de pabilos por diámetro y medidas de lata/cerámica están pendientes de validar.
- Ceras y pabilos: los precios y referencias son oficiales; las capacidades/diámetros de envases siguen siendo de ejemplo.
- Fotos: los placeholders SVG se reemplazan por imágenes en `src/assets/productos/...`.
- Arte: retratos en `portrait.ts` y escenas Pixi se pueden reemplazar por arte final manteniendo anclas y `data-testid`.

## Notas

- PixiJS agrega ~180–230 KB gzip al chunk del juego, cargado solo en `/juego` y de forma diferida. Mantén el presupuesto.
- `?motion=off` fuerza el modo reducido y `?motion=full` lo desactiva para QA visual.
- `npm run qa:game` tarda ~10 min en la matriz completa y ~3 min en modo rápido; `qa/` está ignorada.
- `package-lock.json` se versiona; `node_modules/`, `dist/` y `qa/` están ignorados.
- `README.md` tiene la guía para humanos y el checklist previo a publicar.

## Skills del repo

En `.opencode/skills/` (cárgalos con la herramienta `skill`):

- `frontend-visual`: diseño, pulido visual y checklist antes de entregar una página.
- `product-catalog`: schema, precios, placeholders y copy del catálogo.
- `candle-game`: diseño, arquitectura WebGL/PixiJS, retos manuales y líquidos.
