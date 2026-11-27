# Arquitectura del juego

Mapa de responsabilidades del taller de **ParafinaGel**. La regla base es simple:
la simulación pura no sabe que existe un navegador, el render no es dueño de las
reglas de la partida y la UI DOM no dibuja el escenario interactivo. Cada capa
puede probarse o reemplazarse sin arrastrar a las demás.

## Capas

| Capa                | Rutas principales                                                           | Responsabilidad                                                                                           | Puede depender de                                       | No debe hacer                                                    |
| ------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| **Simulación pura** | `src/lib/game/{types,design,craft,fluid,liquid,scoring,supplies}.ts`        | Reglas, estado de fabricación, fluidos, puntaje y receta. Sin DOM, Pixi ni Svelte.                        | Tipos y datos                                           | Leer `window`, animar o mutar el DOM.                            |
| **Layout**          | `src/lib/game/layout.ts`                                                    | Geometría compartida del escenario 1000×640, zonas de destino y mapeo de coordenadas.                     | Nada                                                    | Importar Pixi, Svelte o reglas de juego.                         |
| **Datos**           | `src/lib/game/data.ts`, `src/content/productos/*.md`, `src/lib/products.ts` | Clientes, briefs, ceras, colores, aromas, recipientes, moldes, pabilos, etiquetas y catálogo público.     | Tipos                                                   | Hardcodear productos en componentes.                             |
| **Estado**          | `src/lib/game/game-state.svelte.ts`, `motion.svelte.ts`                     | Orquestación con runes: fase, vista, diseño, taller, puntaje, receta y preferencias de movimiento.        | Simulación y datos                                      | Depender de Pixi o de un componente.                             |
| **Render Pixi**     | `src/lib/game/render/*`                                                     | Escena visual, rigs de vela/líquido/fluido, paleta WebGL y traducción de gestos a comandos del estado.    | `layout.ts`, simulación, tipos de estado y `palette.ts` | Guardar estado de partida o construir controles accesibles.      |
| **UI DOM**          | `src/components/game/*.svelte`, `src/styles/game.css`                       | HUD, brief, tabs, paneles, estantería, selector accesible, receta, ayuda y estados de foco.               | `GameState`, datos y tokens de `global.css`             | Importar Pixi directamente ni duplicar reglas.                   |
| **Shell / isla**    | `src/pages/juego.astro`, `GameExperience.svelte`, `StageCanvas.svelte`      | Montar el juego solo en `/juego`, cargar Pixi en diferido, alternar escenas y ofrecer fallback sin WebGL. | Estado y renderer dinámico                              | Cargar Pixi en el resto del sitio.                               |
| **Assets**          | `public/art/*`, `src/assets/productos/*`, `portrait.ts`, previews SVG       | Texturas, fotos, retratos procedurales y respaldo visual.                                                 | Nada en runtime de red                                  | Bloquear el juego si un asset falla.                             |
| **QA**              | `src/lib/game/*.test.ts`, `scripts/qa-game.mjs`, `scripts/qa/*`             | Tests puros del motor, typecheck, E2E, axe, overflow, consola, bundle y FPS.                              | Build estático                                          | Correr dentro de `npm run build` o en CI sin decisión explícita. |

Motion tiene tres piezas: `motion.ts` (tokens, easings y `MotionController`
puros), `motion.svelte.ts` (estado de movimiento reducido, pausa y override por
query) y `render/motion.ts` (re-exporta los tokens y comparte el controlador de
tweens de la escena activa). Ninguna escena inventa duraciones propias.

## Dirección de dependencias

```text
páginas Astro
  └── GameExperience (isla Svelte)
        ├── GameState ──► data + simulación pura
        ├── WorkshopStage ──► StageCanvas ──► import dinámico ──► StageRenderer
        │                                                        └── scenes ──► layout + rigs
        └── paneles DOM ──► GameState

simulación pura ──► tests
layout ──► render
```

Las flechas no se invierten. En particular:

- `craft.ts`, `fluid.ts`, `liquid.ts` y `scoring.ts` no importan `game-state`.
- `layout.ts` no importa Pixi ni Svelte; puede probarse en Node.
- Las escenas no crean su propio estado de partida: leen `GameState` y llaman
  métodos públicos.
- La UI DOM no importa `stage-renderer`; solo `StageCanvas` lo hace, de forma
  dinámica.

## Límite DOM / Pixi

Pixi es el **escenario ilustrado**, no el framework de la aplicación. El canvas
solo existe en `/juego` y se carga después de montar la isla Svelte.

| Responsabilidad    | DOM / Svelte                                              | Canvas Pixi                                                                |
| ------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| Textos y jerarquía | Títulos, brief, paneles, receta, ayuda y mensajes.        | Etiquetas cortas de estado dentro de la escena.                            |
| Controles          | Botones, tabs, selector accesible, teclado y foco.        | Gestos espaciales: arrastrar, girar, revolver, verter.                     |
| Accesibilidad      | `aria-live`, `aria-label`, `role`, foco visible y atajos. | `role="application"` focusable con `aria-label` y equivalentes de teclado. |
| Estado             | Lo muestra y lo comanda.                                  | Lo lee y lo modifica solo mediante métodos de `GameState`.                 |
| Animación          | Transiciones CSS y estado de movimiento reducido.         | Tweens, líquidos, fluidos, partículas y escenas.                           |
| Respaldo           | `CandlePreview`/`MoldPreview` en SVG.                     | Fallback si WebGL no está disponible.                                      |

Reglas del límite:

1. Ninguna información crítica vive solo en el canvas. La temperatura, la mecha,
   la etiqueta y la receta también se explican en el panel o en el `aria-label`.
2. Toda acción del canvas tiene equivalente de teclado. Si no lo tiene, la
   estación no está terminada.
3. El canvas nunca es la única forma de completar el juego: sin WebGL se puede
   ver el diseño y la receta.
4. El render mantiene solo estado efímero de presentación (arrastre, ángulo de
   cuchara, tween en curso). El progreso real vive en `GameState`.
5. No se superponen controles DOM complejos sobre coordenadas Pixi. La vista
   general usa hotspots DOM sobre el fondo SVG; las escenas usan el canvas.
6. Hay tres sistemas de coordenadas y no se mezclan:
   - Pixi: escenario virtual de **1000×640** (`layout.ts`).
   - Fondo del taller: SVG de **1600×1000**.
   - Hotspots de la vista general: porcentajes CSS en `WorkshopStage.svelte`.

## Flujo de una estación

Tomemos `mix` como ejemplo; el patrón se repite en todas.

1. **Fase y vista.** `GameState.phase` y `GameState.view` deciden qué panel y
   qué escena se muestran. `StationPanel` elige el panel DOM; `WorkshopStage`
   elige la escena.
2. **Montaje.** `StageCanvas` importa `stage-renderer` en diferido, crea el
   `Application` de Pixi y monta una sola escena según `StationId`.
3. **Reloj de juego.** `GameExperience` corre un `requestAnimationFrame` que
   llama `game.tick(delta)`. Ese tick avanza temperatura, curado, vertido y
   aroma. El delta se limita para evitar saltos al volver de otra pestaña.
4. **Reloj de render.** El ticker de Pixi llama `scene.update(game, delta)`.
   La escena dibuja el estado actual, avanza líquidos/tweens decorativos y lee
   `layout.ts` para ubicar objetos.
5. **Entrada.** `StageRenderer` convierte el puntero a coordenadas de escenario
   y se lo pasa a la escena. La escena traduce el gesto a un comando:
   `selectMixBatch`, `startMixHeat`, `addColorDrop`, `stirMix`, etc. El teclado
   llega por `StageCanvas` y sigue el mismo camino.
6. **Reacción.** Los runes de `GameState` actualizan paneles, HUD, progreso,
   `aria-live` y habilitación de botones. No hay copia del estado en la escena.
7. **Cierre.** Los getters (`canContinueMelt`, `canContinueMix`, `canGoCool`,
   `canFinish`) son la única puerta para avanzar. Al servir se calcula el
   puntaje, se arma la receta y se pasa al siguiente brief.

Cada escena implementa `StageScene` (`view`, `update`, manejadores de puntero y
teclado, `ariaLabel` y `destroy`). Esa interfaz es el contrato entre
`StageRenderer` y la escena; no incluye estado de partida ni acceso a datos.

Pausa: `GameExperience` detiene `game.tick` y `MotionState` detiene los tweens
cuando la pestaña se oculta o se abre la ayuda. Al reanudar se reinicia el delta
para no dar un salto. `prefers-reduced-motion` y `?motion=off` usan versiones
estáticas o de baja intensidad.

## Estado: `game-state` y sus riesgos

`GameState` es hoy una clase con runes de casi 900 líneas. Funciona, pero mezcla
demasiadas responsabilidades:

- sesión y navegación (`mode`, `phase`, `view`, `briefIndex`);
- diseño (`CandleDesign`);
- taller (`Craft`, unidades, mecha, etiqueta, curado);
- puntaje, receta y totales del día;
- temporizadores y avance de tick;
- comandos de todas las estaciones.

Riesgos concretos:

1. **Acoplamiento por fase.** Muchos métodos comprueban `phase === ...` y los
   componentes repiten condiciones parecidas. Un cambio de flujo toca varios
   archivos.
2. **Invariantes dispersos.** Las escenas mutan objetos anidados a través de
   métodos, pero nada impide que un método nuevo deje `design` y `craft`
   desalineados.
3. **Archivo grande.** Aumenta el conflicto de merge y la tentación de agregar
   lógica de UI o de Pixi dentro del estado.
4. **Poca prueba directa.** Los tests cubren los módulos puros, no la clase de
   runes. Un refactor de `game-state` sin pruebas de flujo es riesgoso.
5. **Crecimiento futuro.** Persistencia, colección, dificultad y modos van a
   sumar estado; si todo entra en la misma clase, el problema se multiplica.

Mitigación acordada, sin refactorizar en esta issue:

- Mantener las reglas en módulos puros y probarlas ahí.
- Hacer que las escenas solo llamen comandos; nunca asignen campos de
  `GameState` directamente.
- Extraer primero la geometría a `layout.ts` y después controladores por
  estación (por ejemplo `melt-controller`, `mix-controller`) con una API
  explícita.
- Convertir `GameState` en fachada de sesión: diseño, taller, score y receta
  podrán vivir en módulos separados cuando existan pruebas de flujo.
- No introducir stores globales ni otra fuente de verdad durante la migración.
- Recordar la regla de Svelte: no nombrar `state` una variable que use
  `$state`; usar `game` o `store`.

## Datos, contenido y assets

Hay dos catálogos con propósitos distintos:

- `src/lib/game/data.ts`: datos internos del juego (clientes, briefs, ceras,
  colores, aromas, moldes, pabilos, etiquetas, montajes y `supplyCatalog`).
- `src/content/productos/*.md`: catálogo público con precio y unidad de venta.

Un insumo que aparece en el juego y se vende debe existir en ambos. Los datos no
confirmados se mantienen como placeholder, con `borrador: true` cuando
corresponda, y no se publican como oferta real.

Assets:

- `public/art/` contiene texturas que Pixi carga con `Assets` (por ejemplo el
  fogón lateral).
- `src/assets/productos/` contiene fotos del catálogo; hoy hay placeholders.
- `src/lib/game/portrait.ts` genera retratos por capas y
  `CandlePreview`/`MoldPreview` dan respaldo SVG.
- La paleta WebGL vive en `render/palette.ts`; la UI usa tokens de
  `global.css`. Son sistemas distintos y deben mantenerse alineados a mano.

## Layout compartido

La geometría vive en un módulo puro compartido, no en cada escena ni en
`game-state`: así el hit-testing y el mapeo de coordenadas son idénticos en todas
las estaciones, se pueden probar sin Pixi y no se desincronizan al mover un
objeto. `src/lib/game/layout.ts` es la fuente de verdad a la que deben migrar las
escenas; hoy convive con los literales locales listados más abajo:

- `STAGE` (1000×640), centro y transformación uniforme (`fitStage`,
  `viewportToStage`, `stageToViewport`).
- Muebles y superficies: `WORKBENCH`, `MATERIAL_SHELF`, `WORKTABLE`,
  `CURING_RACK`.
- Frasco y vela: `VESSEL_SIZE`, `VESSEL_INNER`, `VESSEL_HOLDER`,
  `VESSEL_SLOTS`.
- Cera: `MELT_POT`, `CUTTING_BOARD`, `STEARIC_JAR`, `MELT_STOVE`.
- Mezcla: `BURNER_CARD`, `BURNER_LAYOUTS`, `burnerLayout`.
- Vertido, mecha, curado y acabado: `POUR`, `POUR_MOUTH`, `POUR_ZONE`,
  `WICK_VIEW`, `FAN`, `COOL_TIMER`, `FINISH_LABEL`, `FINISH_TOOLS`.
- Destinos: `DROP_ZONES`.
- Helpers: `clamp`, `rectFromCenter`, `mapRange`, `pointInRect`,
  `pointInCircle`.

Reglas:

1. Si una coordenada se repite en dos escenas, va a `layout.ts`.
2. Las escenas migran sus literales a imports; no se copian valores nuevos.
3. Las tolerancias y tiempos de juego no se mudan a `layout.ts`.
4. La migración debe conservar los valores actuales. Cualquier cambio visual se
   hace en una tarea aparte, con QA.

Pendiente de migración:

| Consumidor                 | Valores locales actuales                       | Destino                                                  |
| -------------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| `render/stage-renderer.ts` | `STAGE_WIDTH/HEIGHT`, cálculo de escala        | `STAGE`, `fitStage`, `viewportToStage`                   |
| `render/candle-rig.ts`     | `JAR_W/H`, `INNER_*`, sostenedor               | `VESSEL_SIZE`, `VESSEL_INNER`, `VESSEL_HOLDER`           |
| `scenes/design-scene.ts`   | vela en 500,315 a escala 0.9                   | `VESSEL_SLOTS.design`                                    |
| `scenes/melt-scene.ts`     | `POT_X/Y`, `BOARD`, `STEARIC`, perilla y fogón | `MELT_POT`, `CUTTING_BOARD`, `STEARIC_JAR`, `MELT_STOVE` |
| `scenes/mix-scene.ts`      | `CARD_WIDTH/HEIGHT`, `POSITIONS`               | `BURNER_CARD`, `BURNER_LAYOUTS`                          |
| `scenes/pour-scene.ts`     | `JAR_X/Y`, `JAR_MOUTH_Y`, carril y meta        | `VESSEL_SLOTS.pour`, `POUR`, `POUR_MOUTH`, `POUR_ZONE`   |
| `scenes/wick-scene.ts`     | `CENTER_X/Y`, `RADIUS`                         | `WICK_VIEW`                                              |
| `scenes/cool-scene.ts`     | `JAR_X/Y`, `FAN_X/Y`, timer y repisa           | `VESSEL_SLOTS.cool`, `FAN`, `COOL_TIMER`, `CURING_RACK`  |
| `scenes/finish-scene.ts`   | `JAR_X/Y`, `LABEL_*`, paneles                  | `VESSEL_SLOTS.finish`, `FINISH_LABEL`, `FINISH_TOOLS`    |
| Taller físico futuro       | estantería y mesa nuevas                       | `MATERIAL_SHELF`, `WORKTABLE`                            |

Los hotspots de `WorkshopStage.svelte` son DOM porcentual y no se migran a
`layout.ts` mientras la vista general siga siendo SVG + botones.

## QA y presupuesto

- **Tests puros:** `npm test` cubre diseño, taller, fluido, líquido, puntaje,
  receta, briefs y retratos. Un cambio en simulación debe agregar o ajustar
  tests ahí.
- **Typecheck:** `npm run check` valida Astro, Svelte y TypeScript, incluido
  `layout.ts`.
- **Build:** `npm run build` genera salida estática; Pixi queda en un chunk
  diferido de `/juego` (~180–230 KB gzip).
- **E2E:** `npm run qa:game` construye, sirve `dist/` y recorre 4 pedidos,
  puntero, teclado, sandbox, fallback, 390/1280, claro/oscuro, axe, overflow,
  consola, bundle y FPS.
- **Criterios duros:** axe, overflow, errores de consola, receta y flujos.
- **Avisos:** FPS bajo SwiftShader no bloquea, pero debe revisarse.
- **Salidas:** `qa/report.md`, `qa/report.json` y `qa/screens/`; `qa/` está
  ignorada. No hay baseline visual todavía.

Después de tocar `layout.ts` o una escena: `npm test`, `npm run check` y
`QA_QUICK=1 npm run qa:game`. La matriz completa se reserva para cambios de
flujo, accesibilidad o render amplio.

## Dónde va cada cosa

| Necesidad                                     | Lugar                                                |
| --------------------------------------------- | ---------------------------------------------------- |
| Regla de temperatura, corte, mezcla o puntaje | `craft.ts`, `scoring.ts` o `design.ts`               |
| Nueva coordenada, zona o tamaño de escena     | `layout.ts`                                          |
| Dibujo, partícula, tween de escena            | `render/`                                            |
| Botón, texto, panel, receta, foco             | `components/game/`                                   |
| Transición de fase o comando de estación      | `game-state.svelte.ts` (hasta extraer controladores) |
| Dato de cliente, cera, color o brief          | `data.ts`                                            |
| Producto vendible                             | `src/content/productos/` + `supplyCatalog`           |
| Prueba de regla pura                          | `src/lib/game/*.test.ts`                             |
| Prueba de flujo, axe o responsive             | `scripts/qa/`                                        |

Decisiones de arquitectura: [`adr/`](adr/).
