# Diseño del juego 2D WebGL

La implementación actual es la versión 2.1: cuatro briefs, diseñador, taller manual, simulación de líquido, sandbox y receta de insumos.

## Escenario

- PixiJS 8 renderiza el escenario en WebGL dentro de un canvas.
- Escenario virtual 1000×640 escalado con letterboxing.
- Escenas: mostrador (DOM), diseño, cera, vertido, mecha, curado y acabado (WebGL).
- El fondo ilustrado del taller sigue en DOM/SVG; las estaciones interactivas son WebGL.
- La UI de paneles sigue en Svelte para accesibilidad y fácil iteración.

## Pantallas

| Pantalla | Contenido | Acción |
|---|---|---|
| Inicio | Promesa, modo guiado/libre | Jugar pedidos / Modo libre |
| Mostrador | Retrato, diálogo progresivo, notas | Continuar / Mostrar todo / Crear nota |
| Diseño | Tipo, cera, forma, colores, aroma, mecha y etiqueta | Ir al taller / Ver receta |
| Cera | Olla, palanca, cuchara, temperatura | Mantener calor / girar cuchara |
| Vertido | Jarra, líquido, capas, meta | Arrastrar jarra / soltar |
| Mecha | Vista superior y guía central | Arrastrar mecha |
| Curado | Vela, ventilador, burbujas de gel | Tocar ventilador/burbujas |
| Acabado | Etiqueta, regla, mecha, tapa y empaque | Arrastrar, cortar, tocar |
| Score | Puntos, estrellas, mezcla/derrame, receta | WhatsApp / siguiente |
| Fin del día | Pedidos, puntos, estrellas, promedio | Repetir / Modo libre |

## Reglas

- El brief se revela poco a poco; “Crear nota” fija los requisitos.
- El jugador puede revisar estaciones anteriores, pero no editarlas.
- Feedback inmediato y positivo; los errores bajan el puntaje, no terminan la partida.
- Todo reto manual tiene equivalente de teclado.
- La vela se enciende solo en el resultado; no simules fuego real.
- Nada de precios ni propinas: el negocio vende insumos.

## Puntaje

Diseño (60): tipo 10, cera 8, forma 8, aroma 10, color/montajes 14, mecha 5, etiqueta 5.

Taller (40): temperatura 8, vertido 10, mezcla 4, derrame 3, mecha 6, etiqueta 3, corte 2, gel 4.

Estrellas: ≥90 = 5, ≥75 = 4, ≥55 = 3, ≥35 = 2, resto 1. Puntos = total + estrellas × 10.

## Líquido

- `liquid.ts` simula una superficie de 28 puntos con onda amortiguada, partículas y burbujas.
- `Craft.mix` sube si se vierte por encima de `meltMax - 4`; `Craft.spill` sube si la jarra está fuera de la boca o se desborda.
- `CandleRig` dibuja una banda mezclada en la interfaz de capas y una superficie visible.
- `Craft.pourOffset` controla la jarra; `releasePour()` cierra la capa si hay suficiente cera.

## Motion

- `motion.ts` define duraciones, easings, `motionBudget` y `MotionController`.
- `motion.svelte.ts` centraliza `reduced`, `paused` y `?motion=off` / `?motion=full`.
- `StageRenderer` actualiza los tweens y los limpia al cambiar de escena.
- La ayuda abierta o la pestaña oculta pausan el motion decorativo.
- Toda animación tiene una versión estática o de baja intensidad.
- Capturas de QA: `?motion=off`; revisión completa: `?motion=full`.

## Mini-juegos

- **Cera**: palanca hold + cuchara circular; 1.6π por remoción.
- **Vertido**: jarra arrastrable; alineación ±0.32; el líquido llena o derrama.
- **Mecha**: distancia al centro; `wickAccuracy`.
- **Etiqueta**: x/y/giro; `labelAccuracy`.
- **Corte**: 2–12 mm, objetivo placeholder 5 mm; `trimAccuracy`.
- **Gel**: cinco burbujas; cada una suma.

## Retratos

- `portrait.ts` devuelve SVG por capas: pelo trasero, cuerpo, cara, pelo frontal y rasgos.
- Sofía/Lucía llevan el pelo largo detrás de la cara.
- `CustomerPortrait` usa ids únicos y `{@html}`.

## Datos que faltan

- Catálogo real de insumos, precios y disponibilidad.
- Ceras y temperaturas reales.
- Rangos de mecha por diámetro y medida de corte.
- Aromas, colorantes, moldes y recipientes disponibles.
- Tiempos reales de curado.
- Voz del dueño y referencias visuales para arte final.

No inventes cifras; valida con el negocio.
