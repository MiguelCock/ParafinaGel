---
name: Candle game
description: Diseñar, implementar o modificar el juego 2D WebGL de ParafinaGel con PixiJS 8: pedido progresivo, diseñador de capas/figuras/gel, simulación de líquido viscoso, retos manuales, receta de insumos, sandbox, responsive y accesibilidad.
---

# Juego 2D WebGL de velas

## Norte del producto

El sitio vende **insumos y materias primas**, no velas terminadas. El juego permite descubrir qué vela se puede hacer y qué materiales se necesitan. El cierre es **receta + lista de insumos + WhatsApp**, sin precio ni propina de vela terminada.

## Dónde vive

- Página: `src/pages/juego.astro`.
- Shell: `src/components/game/GameExperience.svelte` (HUD, progreso, reloj, experto, ayuda).
- Escenario: `WorkshopStage.svelte`, `WorkshopBackdrop.svelte`, `StageCanvas.svelte`.
- Render WebGL: `src/lib/game/render/`:
  - `stage-renderer.ts`: `Application` de PixiJS, escenario virtual 1000×640, input y cambio de escena.
  - `scene.ts`: interfaz `StageScene`.
  - `candle-rig.ts`: frasco/moldes, capas, gel, mecha, etiqueta, llama.
  - `palette.ts`: colores para WebGL (no lee CSS vars).
  - `scenes/design-scene.ts`, `melt-scene.ts`, `pour-scene.ts`, `wick-scene.ts`, `cool-scene.ts`, `finish-scene.ts`.
- Pedido: `BriefTicket`, `BriefSummary`, `CounterScene`.
- Diseño: `DesignPanel`, `DesignBasics`, `DesignColors`, `ColorDots`.
- Paneles: `MeltPanel`, `PourPanel`, `WickPanel`, `CoolPanel`, `FinishPanel`, `ScorePanel`, `ShoppingList`.
- Fallback: `CandlePreview` y `MoldPreview` (SVG) si no hay WebGL.
- Motor: `src/lib/game/` (`types`, `data`, `design`, `craft`, `liquid`, `scoring`, `supplies`, `portrait`, `game-state.svelte.ts`, `game.test.ts`).
- Estilos: `src/styles/game.css`.

## Flujo

`brief → design → melt → pour → wick → cool → finish → score`

1. **Mostrador**: el cliente revela el pedido por líneas. “Crear nota” fija el brief.
2. **Diseño**: tipo, cera, tamaño, recipiente/molde, capas/partes/montajes, aroma, mecha y etiqueta.
3. **Cera**: mantener la palanca para calentar; arrastrar la cuchara en círculos.
4. **Vertido**: arrastrar la jarra sobre la boca; el líquido cae, se ondula y llena. Soltar cierra la capa.
5. **Mecha**: arrastrar la mecha al centro de la vista superior.
6. **Curado**: tocar el ventilador; en gel, tocar las burbujas.
7. **Acabado**: arrastrar etiqueta y tirador, cortar la mecha sobre la vela, tocar tapa y empaque.
8. **Score**: puntos, estrellas, receta e insumos; WhatsApp.

## WebGL y PixiJS

- **Solo PixiJS 8**, no Three.js/Threlte ni WebGL crudo.
- `StageCanvas` importa el renderer con `import()` dinámico en `onMount`; nunca en SSR.
- El escenario virtual mide 1000×640 y se escala con letterboxing. Todas las escenas comparten coordenadas.
- El canvas vive dentro de `role="application"` focusable. El teclado es la alternativa accesible; el panel explica los gestos.
- El canvas usa `pointerdown/move/up`; el renderer convierte coordenadas de cliente a virtuales.
- `prefers-reduced-motion` reduce ondas, vapor, ventilador y llama.
- Si `webglAvailable()` falla o `Application.init` lanza, se muestra `CandlePreview` y “Ver receta sin taller”.

## Retos manuales

- **Cera**: `pointerDown` en la palanca inicia calor; `pointerUp` lo detiene. Arrastrar sobre la olla acumula ángulo y llama `game.stir()` cada 1.6π. Teclado: Espacio y flechas.
- **Vertido**: arrastrar la jarra; `game.setPourOffset` alinea. Si `|offset| <= 0.32`, el tick llena la unidad; si no, acumula `spill`. Al soltar, `game.releasePour()` cierra la capa si hay suficiente cera. Teclado: flechas + Espacio.
- **Mecha**: arrastrar en la vista superior; `game.setWickPosition` y `placeWick`. Teclado: flechas + Enter.
- **Curado**: clic en el ventilador (`game.fan()`); burbujas de gel (`game.popBubble()`). Teclado: Espacio y B.
- **Acabado**: etiqueta arrastrable con tirador de giro; corte de mecha con regla; tapa y empaque clicables. Teclado: 1 etiqueta, 2 mecha, 3 tapa, 4 empaque, flechas, Mayús + flechas, Enter.
- No reintroduzcas sliders/botones para estos retos. Los botones de navegación, selección de materiales y CTA sí se quedan.

## Líquido y puntaje

- `liquid.ts` es puro y determinista: superficie de 28 puntos con onda amortiguada, partículas de salpicadura y burbujas.
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

- `npm test` cubre briefs, validación, capas, scoring, receta y líquido.
- `npm run check`, `npm run build`.
- Flujo completo de los 4 tipos + sandbox + fallback sin WebGL.
- Pruebas de captura con Puppeteer/Brave y flags WebGL (`--enable-webgl --ignore-gpu-blocklist --use-angle=swiftshader --enable-unsafe-swiftshader`).
- Capturas de retratos, olla/cuchara, jarra/chorro, etiqueta/mecha y score.

## Fase 3

- Mezclador de colores y laboratorio de aromas.
- Reto de presupuesto con precios reales.
- Prueba de quemado según mecha.
- Sets de regalo, retos de temporada y recetario persistente.
- Enlace real del catálogo de insumos.

## Checklist

- [ ] `npm test` y `npm run check` pasan.
- [ ] Flujo de los 4 tipos + sandbox.
- [ ] Retos manuales con teclado y puntero.
- [ ] Simulación visible y `mix`/`spill` en el score.
- [ ] Receta y CTA de WhatsApp al final.
- [ ] Sin precios ni propinas.
- [ ] 360 px sin scroll horizontal.
- [ ] axe 0 violaciones en claro/oscuro/móvil.
- [ ] Fallback sin WebGL.

Diseño de referencia: `references/game-design.md`.
