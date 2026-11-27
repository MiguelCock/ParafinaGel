# Notas de wireframes y storyboards

Material de diseño para [#141](https://github.com/MiguelCock/ParafinaGel/issues/141). Acompaña a [`../game-design.md`](../game-design.md) y [`../references.md`](../references.md).

- Hoja de estaciones: [`estaciones.svg`](estaciones.svg)
- Storyboards de gestos: [`storyboards.svg`](storyboards.svg)

Los SVG son **wireframes originales**: líneas, formas y texto con fuentes del sistema. No usan fuentes externas, imágenes embebidas, capturas ni assets de terceros. No son arte final; sirven para acordar cámara, capas, gestos y estados antes de tocar Pixi.

## Cómo leer la hoja

La franja superior es el flujo objetivo:

```text
brief → taller / estantería → preparación → cera → mezcla → vertido → curado → acabado → receta
```

Cada panel tiene:

1. **Cámara y verbo** en la cabecera.
2. **Wireframe** de la composición: fondo, mesa, objetos y primer plano.
3. **Estados** con líneas punteadas, flechas y badges.
4. **Nota de alcance** al pie.

La cámara es fija por estación. La única excepción es la cámara aérea de la tapa y la vista final en Acabado. El escenario virtual sigue siendo de **1000×640**; los paneles se adaptan a la caja disponible y a 390 px.

## Capas de implementación

| Capa           | Qué contiene                                   | Dónde vive                                                       |
| -------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| Fondo          | Pared, estantes, ventana, sombras ambientales. | Pixi o fondo ilustrado, según la escena.                         |
| Mesa / materia | Olla, cera, jarra, vela, fluido, etiqueta.     | Pixi (`render/scenes`, `candle-rig`, `fluid-rig`, `liquid-rig`). |
| Herramientas   | Perilla, cuchara, gotero, tijeras, tapa.       | Pixi con zonas de pointer; el panel refleja el estado.           |
| Estantería     | Objetos, categorías, selección, arrastre.      | DOM accesible sobre el escenario.                                |
| Panel          | Brief, validaciones, dosis, score, receta.     | DOM (`src/components/game`).                                     |
| Anuncios       | Estado para lector de pantalla.                | `aria-live` y `aria-label` del canvas.                           |

Regla: **el texto esencial no se hornea solo en el canvas**. El canvas puede mostrar temperatura, “LISTO” o una guía; el panel y el `aria-label` deben decir lo mismo para teclado y lector de pantalla.

## Notas por estación

### 01 · Taller / estantería

**Objetivo:** que el jugador entienda que está en un espacio físico y que los materiales se toman de un mueble, no de una tabla.

- **Cámara:** plano general 2.5D, fijo. Parallax suave opcional; si se usa, se apaga con reduced.
- **Capas:** pared y estantes al fondo; mesa de trabajo en el medio; objetos y hotspots al frente.
- **Estantería:** puede verse como mueble ilustrado, pero sus controles son DOM. Cada objeto tiene foco, nombre, precio oficial si existe y estado.
- **Verbo:** tomar/arrastrar un material; elegir una estación.
- **Feedback:** el objeto se levanta, encuentra su lugar en la mesa y se etiqueta. El hotspot se enciende.
- **Error:** si el objeto no aplica, vuelve a su lugar con una pista (“No compatible con gel”, “No coincide con el diámetro”). Si la estación está bloqueada, `LockedPanel` explica el paso previo.
- **Reduced:** sin arrastre animado; selector accesible con la misma información.
- **390 px:** estantería debajo del escenario o en panel deslizable; objetivos táctiles de 44×44 px; no usar hover como única pista.
- **Código actual:** `WorkshopStage.svelte` ya tiene hotspots y `MaterialShelf.svelte` ya es DOM; el reto es integrarlos visualmente en el taller y no duplicar el diseño en dos lugares.

### 02 · Preparación

**Objetivo:** preparar el frasco, colocar la mecha y cortarla antes de verter.

- **Cámara:** vista lateral del frasco, a la altura del banco. `wick-scene.ts` ya usa esta dirección.
- **Capas:** banco, frasco, porta pabilo, mecha, sostenedor y tijeras.
- **Verbo:** colocar la mecha (puede quedar inclinada o de lado), centrarla con el sostenedor y cortar la mecha.
- **Feedback:** guía circular, sombra, encaje, mecha inclinada/de lado, sostenedor y guía de corte; la mecha queda pareja.
- **Error:** mecha fuera de centro, sin sostenedor o corte de mecha irregular. Se corrige antes de avanzar; el badge dice “Muy centrada”, “Algo desviada”, etc.
- **Reduced:** sin temblor ni rebote; guía estática; flechas + Enter.
- **Código actual:** `WickPanel.svelte` y `wick-scene.ts` ya validan centrado y corte de mecha; `finish-scene.ts` ya no lo incluye. El corte del bloque sigue en `melt-scene.ts` (Cera).

### 03 · Cera

**Objetivo:** derretir con control, no con reflejos.

- **Cámara:** lateral 3/4 del fogón; olla, perilla y tabla visibles.
- **Capas:** fogón, olla, cera, vapor, cuchara, termómetro y perilla.
- **Verbo:** cortar el bloque, girar la perilla (no mantener), añadir ácido esteárico y arrastrar la cuchara en círculos.
- **Feedback:** tabla de corte, trozos, llama, vapor, menisco, aguja de temperatura, badge de rango y cuchara que gira.
- **Error:** falta corte de bloque/esteárico, temperatura baja o sobrecalentamiento. **Hoy `overheated` queda fijo y bloquea el avance**; el rediseño debe permitir retirar la olla o reiniciar la estación sin reiniciar el día.
- **Reduced:** llama y vapor estáticos; aguja y texto; sin oscilación.
- **Código actual:** `melt-scene.ts` ya tiene tabla, olla, perilla, vapor y fluido; `MeltPanel.svelte` ya muestra el rango. El corte de bloque se queda aquí; el cambio de Preparación es el corte de mecha.

### 04 · Mezcla

**Objetivo:** entender que cada capa o parte tiene su lote y que color y aroma se dosifican distinto.

- **Cámara:** lateral, fogones en fila; foco en el fogón activo. Hoy `mix-scene.ts` usa una grilla frontal de tarjetas.
- **Capas:** fogones, ollas, palancas, frascos de color y aroma, cuchara y vapor.
- **Verbo:** calentar el fogón, una gota de color, un chorrito de aroma, revolver.
- **Feedback:** color que se integra, gotas/ml, nivel de aroma, vapor y “LISTO”.
- **Error:** fuera de rango, sin color/aroma, dosis alta/baja o aroma cruzado. Se corrige dentro del fogón; no se pierde la capa.
- **Reduced:** sin burbujas, vapor ni remolino; cambios por pasos y texto.
- **Código actual:** `MixPanel.svelte` y `mix-scene.ts` ya tienen fogones, frascos, gotas y cuchara. El chorrito de aroma visible y la cámara lateral son objetivo de rediseño.

### 05 · Vertido

**Objetivo:** sentir el peso de la jarra y la cercanía de la meta.

- **Cámara:** lateral/corte del envase; jarra arriba y banda meta visible.
- **Capas:** jarra, chorro, superficie, capas, salpicaduras, derrame y mesa.
- **Verbo:** arrastrar la jarra sobre la boca, inclinar y soltar para cerrar la capa.
- **Feedback:** chorro, salpicaduras, llenado, banda meta, película entre capas y derrame.
- **Error:** fuera de la boca, por encima/debajo de la meta o derrame. Afecta el score, no bloquea.
- **Reduced:** chorro estático, llenado por pasos, sin salpicaduras; misma meta.
- **Código actual:** `pour-scene.ts` ya tiene jarra, chorro, salpicaduras, derrame y meta; `liquid.ts` resuelve la superficie.

### 06 · Curado

**Objetivo:** esperar de forma activa y entender que el sostenedor se retira cuando la vela está firme.

- **Cámara:** lateral sobre repisa; ventilador a la derecha.
- **Capas:** repisa, vela, sostenedor, vapor, ventilador, anillo de tiempo y burbujas.
- **Verbo:** tocar el ventilador, retirar el sostenedor y, en gel, reventar burbujas.
- **Feedback:** anillo de tiempo, vapor, giro del ventilador, brillo del sostenedor y “pop”.
- **Error:** retirar antes de firme, dejar burbujas o no ventilar; se refleja en el score.
- **Reduced:** sin giro ni vapor; anillo y texto; pops instantáneos.
- **Código actual:** `cool-scene.ts` ya tiene repisa, ventilador, anillo, sostenedor y burbujas; `CoolPanel.svelte` da las instrucciones.

### 07 · Acabado

**Objetivo:** cerrar la pieza con orgullo y dejar claro que la tapa se coloca desde arriba.

- **Cámara:** aérea para la tapa y la vista final; detalle lateral para etiqueta/moño.
- **Capas:** vela, etiqueta, moño/sticker, tapa, caja y mesa.
- **Verbo:** arrastrar la etiqueta y el tirador, poner la tapa, empacar y decorar con moño/sticker.
- **Feedback:** guía punteada, snap, inclinación, sello de tapa y lazo.
- **Error:** etiqueta torcida o tapa/empaque faltante. Se puede corregir antes de entregar.
- **Reduced:** sin rebote ni confeti; guías y valores estáticos; colocación instantánea.
- **Código actual:** `finish-scene.ts` tiene etiqueta, tapa y empaque; `FinishPanel.svelte` ya muestra los checks y el corte de mecha se movió a Preparación. Moños/stickers y tapa aérea son objetivo de rediseño.

## Notas por storyboard

Cada gesto se lee en tres frames: **inicio → acción/umbral → resultado**. La recuperación está en la nota de cada tarjeta.

### Perilla

- **Input:** arrastre vertical sobre la perilla o `+` / `−`.
- **Umbral:** la perilla se queda donde se suelta; no hay que mantener nada.
- **Feedback:** llama, vapor, aguja y badge de rango.
- **Error:** sobrecalentamiento. El wireframe muestra la necesidad de retirar la olla; hoy el estado no se recupera.
- **Reduced:** teclas y llama estática.
- **Código:** `melt-scene.ts` (`pointerMove`, `keyDown`), `motion.ts` para tweens.

### Gota

- **Input:** tocar el frasco o `C`; una gota por gesto.
- **Umbral:** cada gota cuenta; el panel muestra gotas y objetivo.
- **Feedback:** gota, onda, color y pips.
- **Error:** exceso de color; se satura y se corrige.
- **Reduced:** sin onda ni salpicadura; el color cambia por pasos.
- **Código:** `MixPanel.svelte`, `mix-scene.ts`, `fluid.ts` (color que se disuelve).

### Chorrito

- **Input:** inclinar el gotero o mantener `A`; se corta al soltar.
- **Umbral:** el nivel sube mientras cae; el rango depende de la cera (placeholder).
- **Feedback:** hilo, menisco, nivel y badge.
- **Error:** fuera de rango; se corta el chorro y la dosis queda corta.
- **Reduced:** dosificación por pasos, sin hilo animado.
- **Código:** `game-state.svelte.ts` (`startAroma`, `AROMA_POUR_RATE`), `mix-scene.ts`.

### Inclinación

- **Input:** arrastrar la jarra sobre la boca; `←`/`→` y Espacio con teclado.
- **Umbral:** si el offset está dentro de ±0.32, el chorro cae; si no, va al derrame.
- **Feedback:** chorro, llenado, banda meta y película.
- **Error:** fuera de la boca, sobrellenado o derrame; no bloquea.
- **Reduced:** chorro estático y llenado por pasos.
- **Código:** `pour-scene.ts`, `liquid.ts`, `game-state.svelte.ts` (`setPourOffset`, `startPour`, `releasePour`).

### Corte de mecha

- **Estación:** Preparación.
- **Input:** colocar la mecha (puede quedar inclinada o de lado), fijarla con el sostenedor y arrastrar la tijera; flechas + Enter para cortar.
- **Umbral:** la guía muestra la longitud antes de soltar. El objetivo de 5 mm es de ejemplo.
- **Feedback:** guía, longitud, sostenedor, tijera y badge.
- **Error:** corte largo o corto; se puede repetir.
- **Reduced:** guía estática y ajuste por teclado.
- **Código actual:** `wick-scene.ts` (`trimPreview`), `game-state.svelte.ts` (`setTrimMm`, `cutWick`) y `craft.ts` (`trimAccuracy`). El corte del bloque no se toca.

### Tapa

- **Input:** arrastrar la tapa desde arriba, tocarla o pulsar `3`.
- **Umbral:** centro y sombra; la tapa baja y sella.
- **Feedback:** anillo, encaje y badge de cierre.
- **Error:** torcida o fuera de centro; se puede volver a tomar.
- **Reduced:** colocación instantánea, sin rebote.
- **Código:** `finish-scene.ts`, `FinishPanel.svelte`, `game-state.svelte.ts` (`addLid`).

## Reglas de composición y accesibilidad

1. **Un verbo principal por estación.** Si hay dos, uno es navegación o consecuencia.
2. **El material primero.** El panel confirma; no reemplaza la respuesta visual.
3. **Estado siempre visible.** Disponible, en curso, resuelto, con error. No depender solo del color.
4. **Puntero y teclado.** Cada gesto tiene equivalente; el canvas es `role="application"` focusable.
5. **Reduced.** `prefers-reduced-motion` y `?motion=off` conservan la información; `?motion=full` solo para QA visual.
6. **390 px.** Paneles apilados, stage mínimo de 360 px, objetivos táctiles de 44×44 px, sin scroll horizontal.
7. **Anclas estables.** Mantener `data-testid`, las coordenadas del escenario 1000×640 y la geometría compartida de `src/lib/game/layout.ts` al reemplazar wireframe por arte.
8. **Sin assets externos.** El arte final se produce en el repo; las referencias solo se enlazan.

## Pendientes que este material deja abiertos

- Integrar la estantería en el taller físico sin duplicar `MaterialShelf` y `DesignPanel`.
- Validar la medida de corte de mecha; el gesto ya vive en Preparación y el corte de bloque se queda en Cera.
- Añadir estado de moño/sticker (hoy no existe en `types.ts`) y la cámara aérea de tapa.
- Resolver la recuperación del sobrecalentamiento.
- Definir el chorrito de aroma visible y su relación con `AROMA_POUR_RATE`.
- Validar dosis, temperaturas y medidas con el negocio antes de mostrarlas como reales.

## Checklist de aceptación de #141

- [x] Un wireframe por estación (7 paneles en `estaciones.svg`).
- [x] Un storyboard por gesto (perilla, gota, chorrito, inclinación, corte de mecha y tapa en `storyboards.svg`).
- [x] Cámara, verbo, feedback, error y reduced por estación.
- [x] Referencias con “tomar / evitar”, sin imágenes.
- [x] Decisiones fijas: 2.5D ilustrado, fluido suave, DOM accesible, clásica primero.
- [x] Sin fuentes externas, imágenes embebidas ni assets con copyright.
