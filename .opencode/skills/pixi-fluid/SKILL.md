---
name: Pixi fluid
description: Implementar y depurar el autómata celular lateral de cera, gel, color y aroma de ParafinaGel: grid, densidades, viscosidad, dirty rects, textura Pixi, máscaras, determinismo, rendimiento y errores comunes. Úsalo al tocar fluid.ts, fluid-rig.ts o una escena con fluido.
---

# Fluido celular lateral con PixiJS

El fluido del taller es un **falling-sand** simplificado, no una simulación de Navier-Stokes. Este skill explica el solver, el puente a Pixi y cómo depurarlo sin romper determinismo ni rendimiento.

## Lee primero

- [`AGENTS.md`](../../../AGENTS.md): reglas, arquitectura y comandos.
- [`docs/game-design.md`](../../../docs/game-design.md): qué debe sentir cada estación.
- [`docs/references.md`](../../../docs/references.md): Noita, Sandspiel y falling-sand.
- [`../game-design/SKILL.md`](../game-design/SKILL.md): gesto, feedback y no-goals.
- [`docs/architecture.md`](../../../docs/architecture.md) y [`docs/adr/001-fluid-lateral.md`](../../../docs/adr/001-fluid-lateral.md): decisión del solver lateral y límites de capas.
- [`../candle-game/SKILL.md`](../candle-game/SKILL.md): flujo y escenas.
- Issues relacionados: [#126](https://github.com/MiguelCock/ParafinaGel/issues/126) (motor), [#144](https://github.com/MiguelCock/ParafinaGel/issues/144) (laboratorio), [#132](https://github.com/MiguelCock/ParafinaGel/issues/132) (vertido).

## Mapa del código

| Archivo | Responsabilidad | Regla |
| --- | --- | --- |
| `src/lib/game/fluid.ts` | Solver puro: celdas, materiales, densidades, paso | Sin DOM, sin Pixi, sin timers |
| `src/lib/game/render/fluid-rig.ts` | Convierte celdas a RGBA, canvas, `Texture`, `Sprite` | Solo render; no simula |
| `src/lib/game/render/scenes/melt-scene.ts` | Integración actual: olla, grid 48×26, máscara, perilla | Una escena, una textura |
| `src/lib/game/game.test.ts` | Tests de caída, expansión, densidad, color, aroma, RGBA y semilla | Deterministas |
| `src/lib/game/liquid.ts` | Simulación de superficie heredada (vertido/curado) | No agregar mecánicas nuevas aquí |
| `src/lib/game/render/liquid-rig.ts` | Dibujo de la superficie heredada | Se reemplaza progresivamente |
| `src/lib/game/layout.ts` | Constantes compartidas de escenario; ya existe, migración de escenas pendiente | No duplicar coordenadas ni tolerancias |
| `src/lib/game/render/palette.ts` | Colores WebGL | No leer CSS vars desde Pixi |

Cuando exista, el laboratorio aislado `/lab/fluido` ([#144](https://github.com/MiguelCock/ParafinaGel/issues/144)) será el lugar para probar caudales, perilla e inclinación. No conviertas una escena de producción en laboratorio.

## Modelo de celdas

`createFluidState(width, height, seed = 7)` crea:

```ts
material: Uint8Array;    // FLUID_EMPTY | WALL | WAX | GEL | COLOR | AROMA
color: Uint32Array;      // RGB empaquetado (0 = usa el color del material)
temperature: Float32Array;
aroma: Float32Array;
clock: Uint8Array;       // evita mover la misma celda dos veces por paso
frame: number;
seed: number;
```

Materiales:

| Material | Id | Densidad | “Viscosidad” | Comportamiento |
| --- | ---: | ---: | ---: | --- |
| `FLUID_EMPTY` | 0 | 0 | — | Se puede desplazar |
| `FLUID_WALL` | 1 | 99 | — | Nunca se desplaza |
| `FLUID_WAX` | 2 | 1.05 | 0.82 | Cae y se nivela; acepta color/aroma |
| `FLUID_GEL` | 3 | 1.35 | 0.36 | Más denso que la cera; se hunde y fluye menos |
| `FLUID_COLOR` | 4 | 1.12 | 0.94 | Se disuelve al tocar cera/gel |
| `FLUID_AROMA` | 5 | 0.88 | 0.98 | Se disuelve al tocar cera/gel sin cambiar material |

Ojo con el nombre: `VISCOSITY` es en realidad la **probabilidad de flujo lateral**. Un valor bajo (gel, 0.36) significa más viscoso; uno alto (aroma, 0.98) significa más fluido. `input.viscosity` multiplica esa probabilidad; `input.flow` también. No los interpretes como constantes físicas.

`canDisplace(source, target)` solo permite mover si el destino está vacío o si el origen es más denso que el destino por más de `0.01`. Por eso el gel se hunde a través de la cera y el aroma no desplaza cera.

## Paso de simulación

`stepFluid(state, { heat, flow, viscosity })`:

1. Incrementa `frame`.
2. Recorre filas de **abajo hacia arriba**.
3. Alterna el orden horizontal cada frame (`reverse = frame & 1`) para no sesgar siempre a la izquierda.
4. Salta celdas cuyo `clock === frame & 0xff`; así una celda no se mueve varias veces en el mismo paso.
5. Aplica `heat` a la temperatura (0..1 por paso, con clamp).
6. Intenta disolver color/aroma en cera/gel vecina.
7. Prueba candidatos: abajo, diagonales abajo, laterales. Los laterales solo si `nextRandom() < viscosityChance * flow`.
8. Si se mueve, intercambia celdas y marca `clock` en el destino. Si no, marca `clock` en la celda actual.

No hay movimiento hacia arriba: el fluido no sube. Si una estación necesita “remover” o “inyectar”, se hace agregando celdas o cambiando el material, no invirtiendo la gravedad.

### Heat y viscosidad

Hoy `heat` **solo sube `temperature`**. No reduce `VISCOSITY` ni cambia el flujo. Si el GDD pide que la cera caliente fluya más, hay que acoplar la viscosidad a la temperatura y cubrirlo con un test; no lo simules con un `if` en la escena.

## Grid y resolución

- Grid actual de la olla: `48×26`, semilla `17`, escala `6.4` px por celda.
- La textura mide 48×26 y el sprite la escala; no dibujes 1.248 `Graphics`.
- Para una estación, empieza en 48×26 o 64×32. No saltes a 200×100 sin medir.
- Usa celdas cuadradas (misma escala X/Y) para que el flujo no se vea estirado.
- Grid adaptativo (#126): calcula el tamaño desde la caja visible, el tamaño de celda deseado y un clamp; conserva la proporción y comparte la geometría en `layout.ts`.
- El coste del paso es O(ancho × alto). 48×26 = 1.248 celdas; 128×72 = 9.216; el coste se multiplica, no se reparte.

## Textura Pixi

`FluidRig` crea un canvas del tamaño del grid, un `ImageData`, una `Texture` y un `Sprite`.

- `writeFluidPixels(state, image.data, palette)` es puro y testeable.
- Cera/gel usan el color empaquetado si `state.color[index] !== 0`; si no, el color del material.
- El gel escribe alfa `170`; vacío escribe alfa `0`; el resto alfa `255`.
- `update()` escribe píxeles, `putImageData` y llama `texture.source.update()`.
- `resize()` destruye la textura anterior y crea una nueva; nunca dejes el sprite apuntando a una textura destruida.
- `destroy()` libera textura y canvas.

Para bordes suaves:

- Mantén el canvas en resolución de simulación y escala el sprite; no dibujes un canvas gigante por celda.
- Confirma `texture.source.scaleMode = "linear"` si el filtro por defecto no es el que quieres. Si el borde se ve pixelado, sube la resolución del grid antes que aplicar blur por frame.
- No uses filtros de Pixi por frame para “suavizar” el fluido; cuestan GPU y ensucian el look ilustrado.

## Dirty rects

Hoy `FluidRig.update()` recorre todo el grid y sube la textura completa. Es correcto para 48×26, pero #126 pide dirty rects. Si los implementas:

1. Marca en el solver el rectángulo mínimo de celdas que cambiaron: material, color, temperatura o aroma. Un swap marca origen y destino; una disolución marca la celda consumida y la que recibe; el calor marca la celda.
2. Expande el rect en 1 celda por los bordes y guárdalo en `FluidState` (campo opcional) o devuélvelo desde `stepFluid`.
3. En el render, recorre solo ese rect, escribe esos píxeles y usa `putImageData(image, 0, 0, dx, dy, dw, dh)`.
4. Limpia el rect al crear, limpiar o redimensionar el estado.
5. Testea que el resultado completo y el parcial sean idénticos, y que un estado sin cambios produzca rect vacío.

Advertencia de rendimiento: `texture.source.update()` sube el canvas completo a GPU. El dirty rect ahorra CPU (recorrido, mezcla y `putImageData`), no necesariamente ancho de banda GPU. Con 48×26 la ganancia es marginal; mide antes de agregar complejidad. Si el upload domina, la solución es un sub-upload personalizado o un shader, no un dirty rect más pequeño.

## Máscaras

La olla usa una máscara `Graphics.roundRect` para recortar el fluido a la boca del recipiente.

- La máscara y el sprite deben estar en el **mismo sistema de coordenadas**.
- Añade la máscara al `view` (como hace `MeltScene`) y asígnala con `sprite.mask = mask`.
- Si la máscara es más pequeña que el fluido, lo recorta; si es más grande, se escapa.
- No redibujes la máscara cada frame. Si el recipiente se mueve, mete sprite y máscara en un `Container` y mueve el contenedor.
- Destruye la máscara junto con la escena; una máscara huérfana mantiene recursos.
- Las máscaras usan stencil; no pongas una máscara animada por cada celda.

## Rendimiento

Presupuesto actual de QA: chunk grande ≤ 130 KB gzip, JS total ≤ 280 KB; FPS < 30 es aviso bajo SwiftShader (`scripts/qa/checks.mjs`). En el último reporte el total ronda los 262 KB y el chunk mayor los 99 KB, así que **no agregues dependencias**.

- Un solo `Sprite` + textura; nunca un `Graphics` por celda.
- Evita asignaciones por celda en el hot path: `stepFluid` crea un array de candidatos por celda líquida y dos números aleatorios. A 1.248 celdas es aceptable; si el grid crece, reemplaza arrays por comprobaciones directas y mide GC.
- `MeltScene` recorre todo el grid cada frame para teñir la cera. Cachea el color y actualiza solo cuando cambie la cera.
- La simulación corre dentro de `scene.update()`, que `StageRenderer` llama en cada tick del ticker. A 120 Hz corre al doble que a 60 Hz. Usa un acumulador y un paso fijo (30 o 60 Hz) si la sensación cambia entre equipos.
- `StageRenderer` limita `delta` a `0.05`; no dependas de deltas gigantes.
- `StageRenderer` llama `scene.update()` aunque `motion.paused` esté activo. Si la ayuda está abierta o la escena no se ve, salta `stepFluid`/`update` en la escena; no basta con pausar tweens.
- No actualices la textura si no cambió nada; no recrees `ImageData` por frame.
- Mide con `performance.now()` alrededor de `stepFluid`, `writeFluidPixels`, `putImageData` y `source.update()`. Quita las mediciones antes de entregar.

## Determinismo

- Toda la aleatoriedad pasa por `nextRandom`, un LCG con `state.seed`. No uses `Math.random`, `Date.now` ni `performance.now` dentro de `fluid.ts`.
- Misma semilla + mismas entradas = mismo `material`, `color`, `temperature`, `aroma` y `frame`.
- La semilla es por estación; no la compartas entre escenas si quieres reproducir un bug.
- El paso debe ser determinista para tests. Si agregas tiempo real, usa un paso fijo o cuantiza el delta.
- Los tests existentes comparan dos estados con la misma semilla (`game.test.ts`, “is deterministic for the same seed”). Mantén esa garantía.

## Errores comunes

| Síntoma | Causa probable | Arreglo |
| --- | --- | --- |
| No se ve fluido | Máscara mal posicionada, sprite fuera del `view` o textura sin actualizar | Revisa coordenadas, añade máscara y llama `source.update()` |
| El fluido está congelado | Falta `texture.source.update()` o `stepFluid` no corre | Actualiza textura y confirma el tick |
| Las celdas “teleportan” | `clock` no se marca o el recorrido es de arriba hacia abajo | Recorre de abajo hacia arriba y marca origen/destino |
| El gel flota | Densidad mal definida o se compara al revés | Gel debe ser más denso que cera (`1.35 > 1.05`) |
| El color no se mezcla | La gota no toca cera/gel o se consume antes | Revisa vecindad y `dissolveColor` |
| El aroma desaparece sin efecto | Se disolvió en una celda que no era cera/gel | Asegura contacto con cera/gel |
| Bordes pixelados | Filtro nearest o grid demasiado bajo | `scaleMode = "linear"` y sube resolución |
| El fluido se sale de la olla | Máscara más grande o desalineada | Ajusta rect, usa el mismo contenedor |
| Corre distinto en cada equipo | Simulación atada al frame rate | Paso fijo con acumulador |
| Tirones al mover la perilla | Se recrean `Graphics`/texturas por frame | Reutiliza objetos y actualiza solo el estado |
| La textura se estira al redimensionar | No se llamó `resize` o se destruyó la textura | Recrea canvas, `ImageData` y `Texture` |
| Test no determinista | `Math.random` o estado global compartido | Usa `nextRandom` y una semilla por test |
| El calor no cambia el flujo | `heat` solo sube temperatura | Acopla viscosidad a temperatura si el GDD lo pide |

## Cómo depurar

1. **Test mínimo primero.** Crea un grid de 3×8 con paredes y una celda de cera; comprueba caída con `materialAt` y `countMaterial`. Así separas solver de Pixi.
2. **Dump ASCII.** Imprime una fila por línea con un carácter por material (`#` pared, `~` cera, `G` gel, `c` color, `a` aroma, `.` vacío). Es la forma más rápida de ver si el paso está mal.
3. **Semilla fija.** Reproduce con la misma semilla y las mismas entradas; no compares dos ejecuciones con semillas distintas.
4. **Aísla el render.** Pon `sprite.scale = 1` o desactiva la máscara para ver el grid completo; si el problema desaparece, era máscara/posición.
5. **Verifica la textura.** Testea `writeFluidPixels` con un grid de 2×1 y colores conocidos; si los píxeles son correctos, el bug está en Pixi.
6. **Perfil.** En Chrome DevTools, compara `stepFluid`, `putImageData` y `source.update()`; si el FPS cae solo con la máscara, reduce su complejidad.
7. **QA.** `?motion=off` para capturas estables; `QA_HEADLESS=0` para mirar; revisa `qa/report.md` y `qa/report.json` (FPS, consola, overflow).
8. **Laboratorio.** Usa `/lab/fluido` cuando #144 exista. No metas experiments en `melt-scene` de producción.

Comandos útiles:

```bash
npm test -- -t "side-view fluid"
npm run check
QA_SKIP_BUILD=1 QA_QUICK=1 npm run qa:game
npm run qa:game
```

## Checklist

- [ ] `fluid.ts` no importa DOM, Pixi, Svelte ni timers.
- [ ] El recorrido es de abajo hacia arriba y usa `clock`.
- [ ] Densidades y viscosidad están documentadas; la densidad está cubierta por tests.
- [ ] La misma semilla produce el mismo estado.
- [ ] El render usa una textura, no un `Graphics` por celda.
- [ ] La máscara está alineada y se destruye con la escena.
- [ ] El paso es fijo o independiente del frame rate.
- [ ] La simulación se pausa con la ayuda/pestaña oculta.
- [ ] Si hay dirty rects, el resultado coincide con el completo.
- [ ] `npm test -- -t "side-view fluid"` y `npm run check` pasan.
- [ ] QA rápido pasa; QA completo antes de integrar a una escena.
- [ ] Sin overflow, sin errores de consola y con 390/1280 revisados.
