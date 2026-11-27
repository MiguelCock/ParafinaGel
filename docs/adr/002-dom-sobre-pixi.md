# 002 · DOM accesible sobre Pixi

- **Estado:** Aceptado
- **Fecha:** 2026-11-27
- **Contexto:** #125, #143

## Contexto

El taller necesita un canvas WebGL para la escena, pero el juego también
necesita briefs, formularios, botones, tabs, receta, ayuda y mensajes para
lectores de pantalla. Un canvas no expone semántica, foco, texto seleccionable
ni controles nativos, y el sitio es público y debe seguir siendo indexable.

## Decisión

Pixi dibuja **solo el escenario**; la interfaz vive en DOM/Svelte.

- HUD, brief, tabs, paneles de estación, estantería, selector accesible, receta,
  ayuda y fallback son componentes Svelte.
- El canvas es un `role="application"` focusable, con `aria-label`, atajos de
  teclado y un panel que explica los gestos.
- Ninguna información crítica existe solo dentro del canvas: temperatura,
  progreso, logros y receta también se muestran en DOM o en una región
  `aria-live`.
- Las escenas leen `GameState` y llaman sus métodos; no crean un estado paralelo.
- El canvas se monta únicamente en `/juego` y Pixi se importa en diferido.
- Sin WebGL, la UI sigue funcionando con `CandlePreview`/`MoldPreview` y se
  puede ver la receta.

## Consecuencias

**A favor**

- Accesibilidad, foco, teclado y lectores de pantalla con herramientas nativas.
- Texto indexable, responsive y fácil de traducir.
- El canvas se puede reemplazar o degradar sin rehacer los paneles.
- Los tests E2E pueden usar roles, textos y `data-testid` estables.

**En contra**

- Hay dos superficies que mantener sincronizadas (DOM y escena).
- Cada acción espacial necesita su equivalente de teclado y su explicación.
- Hay que mapear coordenadas y evitar duplicar estado.
- El canvas no puede ser la única fuente de feedback.

**Límites**

- No construir formularios, menús o texto largo dentro de Pixi.
- No duplicar el estado de la partida en Svelte y en la escena.
- No agregar un canvas global al sitio: solo la isla del juego.
- Toda estación nueva debe cumplir puntero, teclado, 390 px y axe antes de
  considerarse terminada.
