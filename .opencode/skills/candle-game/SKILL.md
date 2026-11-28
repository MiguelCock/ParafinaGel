---
name: Candle game
description: Diseñar, implementar o modificar el juego 2D WebGL de ParafinaGel con PixiJS 8: pedido progresivo, diseñador de capas/figuras/gel, fluido celular lateral, retos manuales, receta de insumos, sandbox, responsive y accesibilidad.
---

# Juego 2D WebGL de velas

## Antes de tocar código

1. [`AGENTS.md`](../../../AGENTS.md): reglas, arquitectura, comandos y datos pendientes.
2. [`docs/game-design.md`](../../../docs/game-design.md): GDD canónico, north star, pilares y flujo objetivo. El flujo acordado nace en la [épica #125](https://github.com/MiguelCock/ParafinaGel/issues/125).
3. [`docs/references.md`](../../../docs/references.md): Noita, Sandspiel, Dressmaker y qué tomar de cada una.
4. [`docs/architecture.md`](../../../docs/architecture.md) y [`docs/adr/`](../../../docs/adr/): límites entre simulación, layout, render, estado y UI.
5. `docs/sketches/estaciones.svg`, `docs/sketches/storyboards.svg` y `docs/sketches/notas.md`: wireframes y storyboards por estación.
6. Skills de apoyo: [`game-design`](../game-design/SKILL.md), [`pixi-fluid`](../pixi-fluid/SKILL.md), [`game-playtest`](../game-playtest/SKILL.md) y [`game-production`](../game-production/SKILL.md).

## Norte del producto

El sitio vende **insumos y materias primas**, no velas terminadas. El juego permite descubrir qué vela se puede hacer y qué materiales se necesitan. El cierre es **receta + lista de insumos + WhatsApp**, sin precio ni propina de vela terminada. El criterio completo vive en [`docs/game-design.md`](../../../docs/game-design.md).

## Dónde vive

- Página: `src/pages/juego.astro`.
- Laboratorio interno de fluido: `/lab/fluido` (`src/lab/FluidLabPage.astro` + `src/components/game/FluidLab.svelte`), `noindex` y sin enlaces públicos. Se inyecta en `astro dev` o con `ENABLE_FLUID_LAB=true`; no entra en el build público por defecto.
- Shell: `src/components/game/GameExperience.svelte` (HUD, progreso, reloj, experto, ayuda, `data-motion`).
- Escenario: `WorkshopStage.svelte`, `WorkshopBackdrop.svelte`, `StageCanvas.svelte`.
- Render WebGL: `src/lib/game/render/`:
  - `stage-renderer.ts`: `Application` de PixiJS, escenario virtual 1000×640, input, cambio de escena y ticker de tweens.
  - `scene.ts`: interfaz `StageScene`.
  - `candle-rig.ts`: frasco/moldes, capas, gel, mecha, etiqueta, llama.
  - `fluid-rig.ts`: puente de `fluid.ts` a textura Pixi (canvas + `ImageData` + `Sprite`).
  - `motion.ts`: re-export de `motion` y `tweens` compartidos.
  - `palette.ts`: colores para WebGL (no lee CSS vars).
  - `scenes/design-scene.ts`, `melt-scene.ts`, `mix-scene.ts`, `pour-scene.ts`, `wick-scene.ts`, `cool-scene.ts`, `finish-scene.ts`.
- Pedido: `BriefTicket`, `BriefSummary`, `CounterScene`.
- Diseño: `DesignPanel`, `DesignStructure`, `MaterialShelf`, `AccessibleMaterialPicker`.
- Paneles: `MeltPanel`, `MixPanel`, `PourPanel`, `WickPanel`, `CoolPanel`, `FinishPanel`, `ScorePanel`, `ShoppingList`.
- Fallback: `CandlePreview` y `MoldPreview` (SVG) si no hay WebGL.
- Layout: `src/lib/game/layout.ts` (geometría compartida 1000×640; migración de escenas pendiente).
- Motor: `src/lib/game/` (`types`, `data`, `design`, `craft`, `fluid`, `liquid`, `motion`, `scoring`, `supplies`, `portrait`, `game-state.svelte.ts`, tests).
- Estilos: `src/styles/game.css`.

## Flujo

### Implementado (2.2)

`brief → design → wick (preparación) → melt → mix → pour → cool → finish → score`

1. **Mostrador**: el cliente revela el pedido por líneas. “Crear nota” fija el brief.
2. **Diseño**: tipo, cera, tamaño, recipiente/molde, capas/partes/montajes, aroma, pabilo y etiqueta. Los materiales se eligen como objetos físicos en la estantería; el selector accesible es la alternativa de teclado/lector.
3. **Preparación**: vista lateral; colocar la mecha (puede quedar inclinada), fijar el sostenedor y cortar la mecha.
4. **Cera**: cortar el bloque si hace falta, girar la perilla del fogón y arrastrar la cuchara en círculos.
5. **Mezcla**: calentar cada fogón con su perilla, dosificar color y aroma, y revolver cada lote.
6. **Vertido**: arrastrar la jarra sobre la boca; el líquido cae, se ondula y llena. Soltar cierra la capa.
7. **Curado**: retirar el sostenedor y tocar el ventilador; en gel, tocar las burbujas.
8. **Acabado**: arrastrar etiqueta y tirador, tocar tapa y empaque. El corte de mecha ya ocurrió en Preparación.
9. **Score**: puntos, estrellas, receta e insumos; WhatsApp.

### Objetivo del rediseño (#125)

```text
brief
→ taller / estantería física
→ preparación: mecha lateral + corte
→ cera: olla lateral + fogón con perilla
→ mezcla: varios fogones + color/aroma visibles
→ vertido: jarra lateral inclinada por cercanía al centro
→ curado: repisa larga
→ acabado: moños/stickers + tapa desde vista aérea
→ score / receta
```

La **preparación lateral con corte de mecha** ya está implementada ([#138](https://github.com/MiguelCock/ParafinaGel/issues/138)); el **corte del bloque** sigue en Cera. Quedan pendientes la estantería integrada en el taller, la mezcla lateral, los moños/stickers ([#136](https://github.com/MiguelCock/ParafinaGel/issues/136)) y la tapa aérea ([#137](https://github.com/MiguelCock/ParafinaGel/issues/137)). No documentes lo objetivo como si ya existiera. Si el GDD y el código difieren, el GDD manda para diseño y el código para saber qué está implementado.

## WebGL y PixiJS

- **Solo PixiJS 8**, no Three.js/Threlte ni WebGL crudo.
- `StageCanvas` importa el renderer con `import()` dinámico en `onMount`; nunca en SSR.
- El escenario virtual mide 1000×640 y se escala con letterboxing. Todas las escenas comparten coordenadas.
- El canvas vive dentro de `role="application"` focusable. El teclado es la alternativa accesible; el panel explica los gestos.
- El canvas usa `pointerdown/move/up`; el renderer convierte coordenadas de cliente a virtuales.
- `prefers-reduced-motion` reduce ondas, vapor, ventilador y llama.
- Si `webglAvailable()` falla o `Application.init` lanza, se muestra `CandlePreview` y “Ver receta sin taller”.

## Motion

- `src/lib/game/motion.ts` es la fuente de duraciones, easings, presupuesto (`motionBudget`) y `MotionController`.
- `src/lib/game/motion.svelte.ts` centraliza `reduced`, `paused` y los overrides `?motion=off` / `?motion=full`.
- `src/lib/game/render/motion.ts` exporta `motion` y `tweens` para las escenas.
- `GameExperience` aplica `data-motion` al shell y al modal de ayuda; `game.css` define los tokens CSS.
- `StageRenderer` actualiza `tweens`, los completa en reduced y los limpia al cambiar de escena.
- Los tweens se pausan si la ayuda está abierta o la pestaña está oculta.
- No dupliques `matchMedia("(prefers-reduced-motion...)")`; importa `motion`.
- Toda animación nueva debe tener una versión estática o de baja intensidad.

## Retos manuales

- **Preparación**: vista lateral; arrastrar la mecha, soltarla para `placeWick` y cortarla con la tijera o la regla (`setTrimMm` + `cutWick`). Si queda descentrada se ve inclinada; el sostenedor de madera se retira después del curado. Teclado: flechas + Enter para colocar; ↑/↓ y Enter para cortar.
- **Cera**: arrastrar la perilla hacia arriba/abajo regula `game.setHeatLevel`; el corte del bloque se hace con un trazo horizontal o `C`; al calentar, los trozos caen en la olla y el nivel del fluido sube. Tocar el frasco agrega esteárico o `E`; arrastrar la cuchara acumula ángulo y llama `game.stir()` cada 1.6π. Teclado: `+`/`-` para calor, Espacio para encender/apagar y flechas para revolver.
- **Mezcla**: 1–4 fogones en fila; la perilla de cada uno se arrastra o se ajusta con `+`/`-` y conserva el nivel al soltar (`game.setMixHeat`). `C` deja una gota, `A` mantenida dosifica aroma y las flechas o la cuchara revuelven. Los demás fogones se apagan al cambiar con 1–4.
- **Vertido**: arrastrar la jarra; `game.setPourOffset` alinea. Si `|offset| <= 0.32`, el tick llena la unidad; si no, acumula `spill`. Al soltar, `game.releasePour()` cierra la capa si hay suficiente cera. Teclado: flechas + Espacio.
- **Curado**: clic en el ventilador (`game.fan()`); burbujas de gel (`game.popBubble()`). Teclado: Espacio y B.
- **Acabado**: etiqueta arrastrable con tirador de giro; tapa y empaque clicables. Teclado: 1 etiqueta, 2 tapa, 3 empaque, flechas, Mayús + flechas, Enter. Moños/stickers y tapa aérea son el siguiente paso del rediseño.
- No reintroduzcas sliders/botones para estos retos. Los botones de navegación, selección de materiales, estantería y CTA sí se quedan.

## Fluidos y puntaje

- `fluid.ts` es el autómata celular lateral puro y determinista para cera, gel, color y aroma. `render/fluid-rig.ts` lo convierte en textura Pixi; `MeltScene` usa un grid 48×26. Detalles y errores comunes en [`pixi-fluid`](../pixi-fluid/SKILL.md).
- `liquid.ts` sigue siendo la simulación de superficie heredada (28 puntos, onda amortiguada, salpicaduras y burbujas) para vertido y curado. No agregues mecánicas nuevas allí; migra a `fluid.ts` cuando la escena lo pida.
- El estado del juego acumula `mix` (temperatura alta) y `spill` (jarra fuera de la boca) en `Craft`.
- `scoring.ts` reparte 40 puntos de taller: temperatura 8, vertido 10, mezcla 4, derrame 3, mecha 6, etiqueta 3, corte 2, gel 4.
- `CandleRig` muestra una banda mezclada en la interfaz de capas cuando `mix > 0`.
- `Craft` también guarda `pourOffset`, `gelBubbles`, `gelPopped`, mecha y etiqueta.
- El diseño vale 60 (tipo, cera, forma, aroma, color/montajes, mecha, etiqueta).

## Retratos

- `src/lib/game/portrait.ts` genera el SVG por capas: fondo, pelo trasero, cuerpo, cara, pelo frontal y rasgos.
- El pelo largo va **detrás** de la cara y el flequillo delante: no dibujes todo el pelo después de la cara.
- `CustomerPortrait` usa `{@html portraitSvg(...)}` con ids únicos (`$props.id()`).

## UI y accesibilidad

- Estética papel/editorial: crema, terracota, salvia, ámbar, tinta.
- Desktop: escenario + panel lateral (400 px). Móvil: HUD, canvas ~360 px, ticket, tabs y controles apilados.
- Un CTA principal por paso. Paneles breves: instrucciones + estado + navegación.
- axe (WCAG 2.1 AA) debe pasar en `/juego` claro, oscuro y móvil.
- Sin scroll horizontal en 360/390/768/1280.
- Los controles del canvas deben tener foco visible, `aria-label` y explicación textual en el panel.

## Verificación

- `npm test` cubre briefs, validación, capas, scoring, receta, fluido, líquido y motion. Para el solver: `npm test -- -t "side-view fluid"`.
- `npm run check`, `npm run build`.
- `npm run qa:game` cubre los 4 tipos, puntero y teclado, sandbox, fallback, 390/1280, claro/oscuro, axe, overflow, consola, bundle y FPS.
- `QA_QUICK=1 npm run qa:game` para humo (~3 min); `QA_SKIP_BUILD=1` para reutilizar `dist/`; el QA completo (~10 min) antes de integrar una slice.
- Capturas y reportes en `qa/` (`report.md`, `report.json`, `screens/`); usa `BROWSER_PATH` si el navegador no está en una ruta conocida.
- Probar `?motion=off` y `?motion=full`; verificar que la ayuda/pestaña oculta pausa las animaciones.
- El FPS de Chromium headless con SwiftShader es una referencia, no una medición de GPU real.
- La comparación visual contra línea base queda pendiente (#108); las capturas tienen nombres estables para agregarla después.
- Antes de ampliar el flujo, corre un playtest de 10 minutos con [`game-playtest`](../game-playtest/SKILL.md).

## Roadmap

La ruta operativa es [#124](https://github.com/MiguelCock/ParafinaGel/issues/124), no una lista fija en este skill. Hechos: [#141](https://github.com/MiguelCock/ParafinaGel/issues/141) diseño/referencias, [#143](https://github.com/MiguelCock/ParafinaGel/issues/143) layout/arquitectura, [#144](https://github.com/MiguelCock/ParafinaGel/issues/144) laboratorio de fluido y [#138](https://github.com/MiguelCock/ParafinaGel/issues/138) corte de mecha. En curso: [#145](https://github.com/MiguelCock/ParafinaGel/issues/145) slice clásica → capas, figura y gel → [#140](https://github.com/MiguelCock/ParafinaGel/issues/140) QA, tutorial y baseline. No abras los cuatro tipos antes de que la clásica pase QA completo.

## Checklist

- [ ] `npm test` y `npm run check` pasan.
- [ ] `npm run qa:game` pasa y las capturas se revisan.
- [ ] Flujo de los 4 tipos + sandbox.
- [ ] Retos manuales con teclado y puntero.
- [ ] Simulación visible y `mix`/`spill` en el score.
- [ ] Receta y CTA de WhatsApp al final.
- [ ] Sin precios ni propinas.
- [ ] 360 px sin scroll horizontal.
- [ ] axe 0 violaciones en claro/oscuro/móvil.
- [ ] Fallback sin WebGL.
- [ ] GDD, referencias y skills relacionadas revisadas antes de cambiar el flujo.

Diseño canónico: [`docs/game-design.md`](../../../docs/game-design.md). Referencias: [`docs/references.md`](../../../docs/references.md). El resumen [`references/game-design.md`](references/game-design.md) describe la versión 2.1 y queda como histórico; si contradice al GDD, gana el GDD.
