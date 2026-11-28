# Game design · ParafinaGel

**Estado:** propuesta de diseño para la issue [#141](https://github.com/MiguelCock/ParafinaGel/issues/141). No implementa cambios de código.
**Base:** juego 2.2 (`src/lib/game`, `src/components/game`), [`proceso-de-fabricacion.md`](proceso-de-fabricacion.md) y [`datos-validacion.md`](datos-validacion.md).
**Regla:** los valores marcados como ejemplo o placeholder no son datos técnicos validados. La fuente de verdad es `datos-validacion.md`.

## Resumen en 30 segundos

ParafinaGel es un juego web sobre una tarde en un taller familiar de velas. El jugador escucha un pedido, elige materias primas, las manipula con las manos —corta, derrite, dosifica, vierte, cura y decora— y cierra con una receta de insumos.

No es un simulador de tienda ni un juego de velas terminadas. El negocio vende lo necesario para hacerlas. La fantasía es una clase práctica de unos 10 minutos: aprender un oficio y salir con algo propio, una vela y la receta para repetirla.

## 1. La fantasía

Eres aprendiz en un taller de barrio, no en una fábrica. El cliente llega con una idea incompleta; tú la traduces a cera, color, aroma, mecha y recipiente. El taller huele a madera y a parafina, la luz es cálida y las herramientas se pueden tocar.

La cámara es ilustrada en 2.5D: capas de fondo, mesa y primer plano, con perspectiva estable y fluidos de bordes suaves. No es pixel art. El escenario se siente construido, no dibujado en una cuadrícula.

El cierre no es una vidriera de venta: es una receta con cantidades, dosis marcadas por confirmar y un CTA de WhatsApp para pedir los insumos. La vela es el recuerdo; la receta es el producto.

**Tono:** doméstico, paciente, sensorial. Nada de urgencia, horror, cinismo ni estética de laboratorio. El error se muestra, se explica y se corrige.

## 2. Pilares

1. **La materia se ve.** Cada acción cambia algo en pantalla: la cera baja, el color se mezcla, la mecha se mueve, la etiqueta se pega. El fluido es una grilla pequeña, pero se renderiza suave; la simulación no debe parecer un tablero de píxeles.
2. **El gesto es la interfaz.** Girar la perilla, arrastrar la mecha, dosificar una gota, inclinar la jarra, cortar la mecha. Los retos no usan sliders ni botones. El DOM existe para la estantería, los paneles, la accesibilidad y la receta.
3. **El error enseña, no castiga.** No hay pantalla de derrota. Un derrame, una mecha descentrada o una etiqueta torcida se ven, cuestan puntos y se pueden corregir. El jugador siempre puede terminar la vela.
4. **Aprender haciendo termina en receta.** Cada estación corresponde a un paso real del proceso. La receta final traduce las decisiones del juego a insumos, cantidades y advertencias.
5. **Un taller para todos.** El escenario WebGL es el taller; la estantería y los paneles son DOM accesible. Todo gesto tiene equivalente de teclado, foco visible y versión con movimiento reducido.
6. **Una vela a la vez.** La vertical slice es la clásica de una capa. Capas, figura y gel existen en 2.2, pero no se profundizan hasta que la clásica cumpla los criterios de “se siente bien”.

## 3. Core loop

### Loop macro

```text
brief del cliente
  → taller / estantería física
  → preparación (mecha lateral + corte de mecha)
  → cera (corte de bloque + perilla + esteárico + revolver)
  → mezcla (gotas + chorrito + revolver)
  → vertido lateral
  → curado en repisa
  → acabado (moños/stickers + tapa aérea)
  → receta
  → siguiente pedido
```

La receta cierra el pedido y alimenta el catálogo de insumos. El loop se repite cuatro veces; al final, el resumen del día suma estrellas y puntos. En modo libre se saltan el brief y el puntaje, pero no la receta.

### Loop micro

```text
mirar → tocar → leer la respuesta → corregir → confirmar
```

Cada estación tiene un verbo principal y un estado visible de “listo”. El panel acompaña; no es la única fuente de verdad. Si el jugador tiene que mirar el panel para saber qué pasó en la mesa, el feedback de la escena falló.

## 4. Sesión

Una vela completa debe caber en una sesión de **8–10 minutos**. El Día 1 encadena **cuatro pedidos** de ejemplo (clásica, capas, figura y gel); el día completo es un arco de **35–45 minutos**, y se puede jugar un pedido por sesión.

No hay reloj de sesión ni cuenta atrás: “Día 1” es narrativo. El único temporizador es el curado (7–9 s de ejemplo en el código), y el ventilador lo acorta. El jugador puede quedarse mirando, abrir la ayuda o volver al taller sin penalización.

| Momento             | Objetivo por vela (≈10 min) | Qué ocurre                                                    |
| ------------------- | --------------------------: | ------------------------------------------------------------- |
| Mostrador           |                     30–45 s | El cliente revela líneas; “Crear nota” fija el brief.         |
| Taller / estantería |                    90–150 s | Tomar materiales, armar capas/figura/gel y validar el diseño. |
| Preparación         |                     45–60 s | Mecha, porta pabilo, sostenedor y corte de mecha.             |
| Cera                |                     60–75 s | Corte de bloque, perilla, ácido esteárico y rango.            |
| Mezcla              |                     60–75 s | Un fogón por capa/parte, gotas, aroma y revuelta.             |
| Vertido             |                     45–60 s | Jarra sobre la boca, meta por capa, película entre capas.     |
| Curado              |                     20–30 s | Repisa, ventilador, sostenedor y burbujas de gel.             |
| Acabado             |                     60–75 s | Etiqueta/moño, tapa, empaque y decoración.                    |
| Receta              |                     30–40 s | Puntaje, receta, precios oficiales y CTA.                     |

**Modos actuales:** `guided` (4 pedidos), `sandbox` (sin brief ni reloj) y `expert` (oculta pistas numéricas). El fallback sin WebGL muestra el diseño en SVG y permite ver la receta. La persistencia, el recetario y el muro de velas son fases posteriores del roadmap, no parte de 2.2.

### Emociones por estación

| Estación    | Emoción buscada          | Qué la produce                                                      |
| ----------- | ------------------------ | ------------------------------------------------------------------- |
| Taller      | Orientación y curiosidad | Ver las estaciones alrededor y elegir por dónde empezar.            |
| Preparación | Cuidado y precisión      | Centrar la mecha y cortarla a medida sin prisa.                     |
| Cera        | Paciencia y atención     | Cortar el bloque; la perilla responde y la llama dice si vas bien.  |
| Mezcla      | Juego y control          | Una gota cambia el color; el aroma cae en hilo; la cuchara mezcla.  |
| Vertido     | Tensión contenida        | La jarra está en el aire; la meta se acerca; soltar cierra la capa. |
| Curado      | Calma y espera activa    | El ventilador, el anillo de tiempo y el sostenedor que se retira.   |
| Acabado     | Orgullo y detalle        | La etiqueta se alinea, el moño remata, la tapa sella.               |
| Receta      | Logro y utilidad         | La vela se parece al diseño y la lista sirve para comprar.          |

## 5. Flujo y estaciones

### 5.1 Flujo objetivo

```text
brief
  → taller / estantería física
  → preparación lateral (mecha + corte de mecha)
  → cera con perilla (corte de bloque)
  → mezcla con gotas/chorrito
  → vertido lateral
  → curado en repisa
  → moños/stickers + tapa aérea
  → receta
```

### 5.2 Delta con el código 2.2

| Paso                | Dirección de diseño                                                                                        | Hoy en código                                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Taller / estantería | El diseño y la estantería viven dentro del taller físico; se toman objetos y se arma la vela en la mesa.   | `DesignPanel.svelte` y `MaterialShelf.svelte` están en el panel DOM; `design-scene.ts` muestra una vista previa. `WorkshopStage.svelte` ya tiene el plano general y hotspots. |
| Preparación         | Cámara lateral del frasco: colocar la mecha (puede quedar inclinada/de lado), sostenedor y corte de mecha. | `wick-scene.ts` ya usa vista lateral con colocación, inclinación y corte; `finish-scene.ts` ya no corta la mecha. El corte del bloque sigue en `melt-scene.ts` (Cera).        |
| Cera                | Fogón lateral con corte de bloque, perilla, olla, cuchara y termómetro.                                    | `melt-scene.ts` ya tiene tabla con trozos que caen, olla con nivel de cera, perilla, vapor y fluido.                                                                          |
| Mezcla              | Fogones laterales en fila, gota de color y chorrito de aroma visible.                                      | `mix-scene.ts` usa una grilla frontal de 1–4 fogones; el chorrito de aroma es objetivo visual.                                                                                |
| Vertido             | Corte lateral del envase, jarra inclinada y meta.                                                          | `pour-scene.ts` ya lo resuelve con jarra, chorro, salpicaduras y derrame.                                                                                                     |
| Curado              | Repisa, ventilador, sostenedor y burbujas.                                                                 | `cool-scene.ts` ya tiene repisa, ventilador, anillo y sostenedor.                                                                                                             |
| Acabado             | Etiqueta/moño, tapa desde vista aérea y empaque.                                                           | `finish-scene.ts` ya tiene etiqueta, tapa y empaque; el corte de mecha se movió a Preparación. Sumar moños/stickers y cámara aérea siguen como objetivo.                      |
| Receta              | Recibo DOM con cantidades, precios oficiales y CTA.                                                        | `ScorePanel` + `ShoppingList` ya lo hacen.                                                                                                                                    |

**Nota de alcance:** integrar la estantería en el taller y añadir moños/stickers implica tocar estado, escenas y tests; el corte de mecha ya vive en Preparación y el corte del bloque sigue en Cera. Este documento fija la dirección; no es una promesa de implementación en #141.

### 5.3 Tabla de estaciones

La cámara objetivo es fija y teatral, no libre. La columna “reduced” describe la versión con `prefers-reduced-motion` o `?motion=off`.

| Estación                | Cámara                                                                                | Verbo                                                                                 | Feedback                                                                             | Error                                                                                                       | Reduced                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Taller / estantería** | Plano general ilustrado 2.5D; estantería como mueble físico; parallax suave opcional. | Tomar y arrastrar un material; elegir estación.                                       | El objeto encaja, se etiqueta y queda en la mesa; hotspot, progreso y foco visible.  | El objeto vuelve a su lugar con una pista; estación bloqueada: `LockedPanel` explica el paso previo.        | Selector DOM accesible, sin arrastre animado; estados por color y texto.  |
| **Preparación**         | Vista lateral del frasco a la altura del banco. Hoy: cenital.                         | Colocar mecha (puede quedar inclinada/de lado), centrar con sostenedor, cortar mecha. | Guía circular, sombra, encaje, mecha inclinada, sostenedor y guía de corte.          | Mecha descentrada, sin sostenedor o corte de mecha irregular; se corrige antes de seguir.                   | Sin temblor ni rebote; encaje instantáneo y guía estática.                |
| **Cera**                | Lateral 3/4 del fogón; tabla, olla, perilla y termómetro visibles.                    | Cortar el bloque, girar perilla, añadir esteárico, revolver 3 veces.                  | Tabla de corte, trozos, llama, vapor, menisco, termómetro, cuchara y badge de rango. | Falta corte de bloque/esteárico, temperatura baja o sobrecalentamiento. **Hoy el overheat no se recupera.** | Llama y vapor estáticos; aguja y texto; sin oscilación.                   |
| **Mezcla**              | Lateral, fogones en fila; foco en el fogón activo. Hoy: grilla frontal.               | Calentar, gota de color, chorrito de aroma, revolver.                                 | Color mezclado, gotas/ml, nivel de aroma, vapor y “LISTO”.                           | Fuera de rango, sin color/aroma, dosis alta/baja o aroma cruzado; se corrige.                               | Sin burbujas, vapor ni remolino; cambios por pasos y texto.               |
| **Vertido**             | Lateral/corte del envase; jarra arriba y banda meta visible.                          | Arrastrar jarra, inclinar, soltar para cerrar la capa.                                | Chorro, salpicaduras, llenado, banda meta, derrame y película entre capas.           | Fuera de la boca, por encima/debajo de la meta o derrame; afecta puntos, no bloquea.                        | Chorro estático, llenado por pasos, sin salpicaduras; misma meta.         |
| **Curado**              | Lateral sobre repisa; ventilador a la derecha.                                        | Tocar ventilador, retirar sostenedor, reventar burbujas (gel).                        | Anillo de tiempo, vapor, giro del ventilador, brillo del sostenedor y “pop”.         | Retirar antes de firme, dejar burbujas o no ventilar; se refleja en el score.                               | Sin giro ni vapor; anillo y texto; pops instantáneos.                     |
| **Acabado**             | Aérea para la tapa y la vista final; detalle lateral para etiqueta/moño.              | Arrastrar etiqueta, girar tirador, poner tapa, empacar, moño/sticker.                 | Guía punteada, snap, inclinación, sello de tapa y lazo.                              | Etiqueta torcida o tapa/empaque faltante; se puede corregir.                                                | Sin rebote ni confeti; guías y valores estáticos; colocación instantánea. |

### 5.4 Marco: mostrador y receta

| Momento       | Cámara                                        | Verbo                             | Feedback                                                  | Error                                                     | Reduced                                                     |
| ------------- | --------------------------------------------- | --------------------------------- | --------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| **Mostrador** | DOM, mostrador ilustrado y retrato por capas. | Escuchar y crear la nota.         | Líneas reveladas, notas que se fijan, sello “Crear nota”. | No se puede crear la nota antes de revelar el brief.      | Sin entrada animada del cliente; el texto aparece completo. |
| **Receta**    | DOM, sin WebGL.                               | Revisar, guardar y pedir insumos. | Puntaje, estrellas, receta en cascada y CTA.              | Precio faltante: “Precio por confirmar”, nunca inventado. | Sin cascada ni confeti; recibo completo de una vez.         |

## 6. No-goals

- **No pixel art, no 3D, no fotorrealismo.** La decisión es ilustración 2.5D con fluidos de bordes suaves.
- **No simulación realista de fluidos.** `fluid.ts` es un autómata pequeño inspirado en falling-sand; no es Navier–Stokes ni una promesa de física real.
- **No simulador de tienda, economía o reputación.** No se venden velas terminadas, no hay propinas, precios de venta ni gestión de stock.
- **No castigo con pantalla de derrota.** Nada de “perdiste el pedido” por un derrame o un corte torcido.
- **No reloj de cuenta atrás ni presión de tiempo.** “Día 1” es narrativo; el curado se puede acelerar, no penalizar.
- **No sliders ni botones para los retos manuales.** El teclado es la alternativa accesible, no un menú de acciones.
- **No procedural, roguelike ni inventario infinito.** La vertical slice es una vela clásica bien hecha.
- **No nuevas dependencias de animación.** Se usan `motion.ts`, `motionBudget` y las escenas existentes.
- **No datos inventados.** Temperaturas, tiempos, dosis y medidas siguen marcados como placeholder hasta validarlos.
- **No assets, arte, UI, narrativa ni audio de las referencias.** Solo se toman lecciones de ritmo y manipulación.
- **No promesas de seguridad no validadas.** El copy de cera caliente y gel se revisa con el negocio.

## 7. Criterios de “se siente bien”

No son adjetivos: son pruebas observables.

| Criterio            | Cómo se comprueba                                                           | Umbral                                                                    |
| ------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Primera acción      | Desde “Jugar pedidos” hasta elegir el primer material, sin ayuda.           | ≤ 90 s.                                                                   |
| Respuesta al gesto  | Cada input cambia la escena o el panel.                                     | ≤ 100 ms / siguiente frame.                                               |
| Error recuperable   | Todo error tiene una acción de corrección visible.                          | ≤ 2 acciones; 0 softlocks.                                                |
| Sin solo-puntero    | Completar las 7 estaciones con teclado.                                     | 7/7.                                                                      |
| Movimiento reducido | Completar con `?motion=off`; ninguna información depende de la animación.   | 7/7.                                                                      |
| Mobile y axe        | 360 px, claro/oscuro, sin scroll horizontal; axe AA.                        | 0 fallos duros.                                                           |
| Performance         | Desktop y móvil; partículas y tweens dentro del presupuesto.                | 60 fps desktop / ≥ 30 fps móvil; ≤ 40 partículas; bundle 180–230 KB gzip. |
| Fidelidad           | La vela del resultado coincide con color, capas, mecha y etiqueta elegidos. | 100 %; la receta coincide.                                                |
| Comprensión         | 5 personas nuevas, sin ayuda, completan la clásica y explican un error.     | 4/5 completan; 5/5 explican.                                              |
| Ganas de repetir    | Al terminar una vela, el jugador quiere hacer otro pedido.                  | 4/5; una vela ≤ 10 min.                                                   |
| Honestidad de datos | Placeholders marcados; precios solo oficiales.                              | 100 %.                                                                    |

**Prueba de la mano:** cada estación debe tener al menos un gesto que se pueda imitar sin mirar la UI. Si no lo tiene, es un formulario.

**Prueba de la receta:** dar la receta a alguien que no jugó. Debe poder identificar los insumos y el orden del proceso sin explicación extra.

**Prueba de los 10 segundos:** al entrar a una estación, el jugador debe saber qué tocar en 10 segundos. Si no, falla la affordance, no el jugador.

## 8. Estado real y límites

La versión 2.2 ya implementa:

- Escenario PixiJS 8 de 1000×640, cargado solo en `/juego`, con escenas separadas para diseño, preparación, cera, mezcla, vertido, curado y acabado.
- La geometría compartida del rediseño empieza en `src/lib/game/layout.ts` (`STAGE`, `MATERIAL_SHELF`, `WORKTABLE`, `CURING_RACK`); las escenas todavía conservan constantes locales, así que la migración es parte del rediseño.
- Cuatro pedidos y cuatro tipos: clásica, capas, figura y gel. Cuatro clientes de ejemplo.
- Estantería DOM con categorías, arrastre, selección y selector accesible.
- Retos manuales con teclado: flechas, Espacio, Enter, Mayús + flechas, 1–4 y atajos C/E/A/H/B.
- Fluido celular lateral en `fluid.ts` (48×26 en la olla), superficie con menisco en `liquid.ts` y render suave por textura.
- Puntaje de 100: diseño 60 + taller 40; estrellas y puntos; receta con CTA de WhatsApp.
- Motion tokens, `motionBudget`, `?motion=off`/`?motion=full`, pausa por pestaña oculta y fallback sin WebGL.
- Tests del motor, typecheck y QA con axe, overflow, consola, bundle y FPS.

Cambios del rediseño que **no** estaban en 2.2:

1. Estantería integrada en el taller físico, con el diseño en la misma mesa (hoy el diseño y la estantería viven en el panel DOM).
2. Preparación lateral con frasco, mecha, sostenedor y corte de mecha en el mismo banco (implementado en `wick-scene.ts`; el corte del bloque sigue en Cera).
3. Mezcla lateral en fila y chorrito de aroma visible (hoy: grilla frontal y dosis mientras se mantiene el gotero).
4. Moños/stickers y tapa aérea en Acabado (hoy: etiqueta, tapa y empaque; el corte de mecha ya no está en Acabado).
5. Recuperación del sobrecalentamiento (hoy `overheated` bloquea el avance y no se puede revertir sin reiniciar).
6. Vertical slice clásica como prioridad de pulido, aunque los cuatro tipos ya existan.

## 9. Definition of Ready

Una estación o cambio de flujo se implementa solo si:

- [ ] Tiene sección en este GDD y wireframe/storyboard en `docs/sketches/`.
- [ ] Define entrada y salida: qué debe existir antes y qué desbloquea después.
- [ ] Define el contrato de datos en `types.ts` o `GameState`.
- [ ] Define gesto, feedback, error y recuperación.
- [ ] Define equivalente de teclado y versión reduced.
- [ ] Define layout de 390 px y objetivos táctiles de 44×44 px.
- [ ] Define efecto en score/receta y qué dato es placeholder.
- [ ] Tiene plan de tests y QA.
- [ ] Es un vertical slice de un solo tipo de vela, no los cuatro a la vez.
- [ ] Tiene archivos asignados para evitar dos agentes en el mismo archivo.

## 10. Referencias

Las lecciones de Noita, Sandspiel, falling-sand, Dressmaker, Potion Craft, Unpacking, A Little to the Left y Wilmot's Warehouse están en [`references.md`](references.md), con qué tomar y qué evitar. Ninguna referencia aporta arte, UI, narrativa, audio ni imágenes con copyright.

## 11. Wireframes y storyboards

- Hoja de 7 estaciones: [`sketches/estaciones.svg`](sketches/estaciones.svg)
- Storyboards de gestos: [`sketches/storyboards.svg`](sketches/storyboards.svg)
- Notas de alcance, capas, hotspots y accesibilidad: [`sketches/notas.md`](sketches/notas.md)

## Checklist de este entregable

- [x] Fantasía, pilares, loop, sesión, no-goals y emociones por estación.
- [x] Tabla estación / cámara / verbo / feedback / error / reduced.
- [x] Wireframe por estación y storyboard por gesto.
- [x] Referencias con “tomar / evitar” y enlaces, sin imágenes.
- [x] Lectura objetivo ≤ 10 minutos.
- [x] Decisiones fijas: 2.5D ilustrado, fluido suave, estantería DOM accesible, clásica primero, flujo físico con preparación lateral y corte de mecha.
