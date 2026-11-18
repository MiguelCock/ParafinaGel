---
name: Candle game
description: Diseñar, implementar o modificar el juego 2D cozy de ParafinaGel (Astro + Svelte 5): pedido progresivo, diseñador de capas/figuras/gel, mini-juegos, receta de insumos, sandbox, SVG/CSS, responsive y accesibilidad. Úsalo al tocar el juego, sus escenas, paneles, motor o scoring.
---

# Juego 2D de velas

## Norte del producto

El sitio vende **insumos y materias primas**, no velas terminadas. El juego es la forma de que la clienta descubra qué vela podría hacer y qué materiales necesita. El cierre siempre es **receta + lista de insumos + WhatsApp**, nunca precio o propina de una vela terminada.

## Dónde vive

- Página: `src/pages/juego.astro`.
- Shell: `src/components/game/GameExperience.svelte` (HUD, progreso, reloj, modo experto, ayuda).
- Escenario: `WorkshopStage.svelte`, `WorkshopBackdrop.svelte`, `CounterScene`, `DesignScene`, `MeltScene`, `PourScene`, `WickScene`, `CoolScene`, `FinishScene`.
- Pedido: `BriefTicket` (progresivo) y `BriefSummary` (nota fija).
- Diseño: `DesignPanel`, `DesignBasics`, `DesignColors`, `ColorDots`.
- Vista previa: `CandlePreview` (capas, gel, etiqueta, mecha) y `MoldPreview` (partes de figura).
- Controles: `*Panel.svelte`, `StationTabs`, `OverviewPanel`, `LockedPanel`, `ShoppingList`.
- Arte: `Pot2D`, `Pitcher2D`, `Fan2D`, `Steam2D`, `CustomerPortrait`, `StationIcon`.
- Motor: `src/lib/game/` (`types`, `data`, `design`, `craft`, `scoring`, `supplies`, `game-state.svelte.ts`, `game.test.ts`).
- Estilos compartidos: `src/styles/game.css`.

## Flujo

`brief → design → melt → pour → wick → cool → finish → score`

1. **Mostrador / brief**: el cliente habla por líneas. Cada “Continuar” revela un detalle y añade requisitos. Al final “Crear nota”.
2. **Diseño**: tipo (clásica, capas, figura, gel), cera, tamaño, recipiente o molde, capas/partes/montajes, aroma, mecha y etiqueta.
3. **Cera**: calentar y remover 3 veces. El rango depende de la cera; la temperatura se registra al estar dentro.
4. **Vertido**: una unidad por capa o parte de figura; llenar a la meta, terminar y esperar el cuajado entre capas.
5. **Mecha**: mini-juego de centrado con flechas.
6. **Curado**: esperar/abanicar; en gel, quitar burbujas.
7. **Acabado**: alinear etiqueta (x/y/giro), cortar mecha a la medida, tapa y empaque.
8. **Score**: puntos, estrellas, receta e insumos; CTA a WhatsApp. Sin precio ni propina.

## Tipos de pedido

| Tipo | Requisitos |
|---|---|
| `clasico` | Una capa de color, recipiente, aroma, mecha, etiqueta. |
| `capas` | 2–4 capas con colores ordenados y alturas; espera entre capas. |
| `figura` | Molde con partes (`mold.parts`) y un color por parte. |
| `gel` | Cera gel, recipiente transparente, montajes suspendidos y burbujas. |

Los cuatro briefs viven en `data.ts` con `lines` (diálogo + notas) y `target` (solución esperada).

## Modelo de datos

- `CandleDesign`: `mode`, `waxId`, `vesselId`, `moldId`, `sizeId`, `scentIds`, `layers`, `figureColors`, `inclusions`, `wickId`, `labelId`, `lidOn`, `wrapped`.
- `LayerDesign`: `id`, `colorId`, `height`; las capas suman 100%.
- `PourUnit`: unidad de vertido derivada del diseño; `fill`, `target`, `done`, `accuracy`.
- `Craft`: temperatura, unidades, película entre capas, curado, burbujas, mecha, etiqueta, tapa y empaque.
- `BriefTarget`: valores esperados para puntuar el diseño.
- `RecipeLine`: insumo, cantidad y unidad para la lista de compras.

## Reglas del motor

- Validación en `design.ts`: estructura, compatibilidad gel/recipiente, partes completas, capas y advertencia de mecha por diámetro.
- Puntaje en `scoring.ts`: diseño 60 (tipo 10, cera 8, forma 8, aroma 10, color 10–14, mecha 5, etiqueta 5) + taller 40 (temperatura 8, vertido 12, mecha 8, etiqueta 4, corte 3, gel 5).
- Estrellas: ≥90 = 5, ≥75 = 4, ≥55 = 3, ≥35 = 2, resto 1. Puntos = total + estrellas × 10.
- Receta en `supplies.ts`: cera en gramos, aroma en ml, colorante en gotas, mecha, recipiente/molde, montajes, etiqueta, tapa/empaque y herramientas.
- Sin fail state: un error baja el puntaje, no termina la partida. El objetivo es aprender.
- El reloj es `requestAnimationFrame` con delta limitado; `visibilitychange` pausa los timers.
- No uses `Math.random` en el motor; los briefs son fijos y testeables.

## UI y accesibilidad

- Estética de papel/editorial: crema, terracota, salvia, ámbar, tinta.
- Un CTA principal por paso; estados `disabled` claros; notas y advertencias visibles.
- Desktop: escenario + panel lateral (400 px); móvil: HUD, escenario ~360 px, ticket, tabs y controles apilados.
- Los mini-juegos deben funcionar con botones/ranges nativos, no solo con arrastre.
- Respeta `prefers-reduced-motion` (llama, vapor, ventilador, burbujas, transiciones).
- axe (WCAG 2.1 AA) debe pasar en `/juego` en claro, oscuro y móvil.
- Nada de scroll horizontal en 360, 390, 768 o 1280 px.
- El panel lateral resetea su scroll al cambiar de fase; en móvil se vuelve al inicio del juego.

## Modo libre

- `GameState.startSandbox()`: sin brief ni reloj, todo desbloqueado.
- Se puede cambiar de tipo con `setMode`; los materiales se reinician.
- “Ver mi receta” muestra la lista de insumos sin taller.
- “Probar el taller” ejecuta el flujo completo y puntúa contra un diseño libre (60 de diseño).
- “Salir” vuelve a la portada guiada.

## Modo experto

- `game.expert` oculta pistas numéricas del diseño y del acabado.
- No cambia el scoring; es una ayuda visual opcional.

## Verificación

- `npm test` (Vitest) cubre briefs, validación, capas, scoring, precisión y receta.
- `npm run check`, `npm run build`.
- Flujo completo de 4 pedidos + sandbox + receta.
- axe en claro/oscuro/móvil; overflow en 360/390/768/1280.
- Revisa que la receta incluya cera, aroma, color(es), mecha, recipiente/molde, montajes y etiqueta.

## Fase 3 posible

- Mezclador de colores y laboratorio de aromas.
- Reto de presupuesto con precios reales de insumos.
- Prueba de quemado según mecha.
- Sets de regalo y retos de temporada.
- Guardar recetas en `localStorage` y código compartible.
- Integración real del catálogo de insumos.

## Checklist

- [ ] `npm test` y `npm run check` pasan.
- [ ] Flujo de los 4 tipos + sandbox.
- [ ] La receta y el CTA de WhatsApp aparecen al final.
- [ ] Sin precios ni propinas de vela terminada.
- [ ] 360 px sin scroll horizontal; controles alcanzables.
- [ ] Sin errores de consola.
- [ ] axe 0 violaciones en claro/oscuro/móvil.
- [ ] Respeta movimiento reducido y teclado.
- [ ] Los datos placeholder están marcados como ejemplo.

Diseño de referencia: `references/game-design.md`.
