---
name: Candle game
description: Diseñar, implementar o modificar el mini-juego de ParafinaGel (Svelte 5 en Astro) para probar productos y aprender a hacer velas, como isla aislada y mobile-first. Úsalo al tocar el juego, sus pasos, visuales o accesibilidad.
---

# Mini-juego de velas

## Dónde vive

- Página: `src/pages/juego.astro`.
- Isla: `src/components/game/CandleGame.svelte`.
- Visual: `src/components/game/CandleVisual.svelte`.
- Pasos y copy: `src/lib/game/steps.ts`.
- Tipos: `src/lib/game/types.ts`.

## Estado actual

- Svelte 5 con runes (`$state`, `$derived`, `$props`).
- Cargado con `client:visible`; el resto del sitio no paga JS.
- Flujo: inicio → elegir → preparar → verter → curar → resultado.
- Usa hasta 4 productos reales de la colección (velas y kits) y termina con un CTA al producto.
- Sin Canvas, sin motor de juego, sin audio, sin puntaje ni `localStorage` todavía.
- En producción, si no hay productos publicados, muestra un estado vacío con enlace al catálogo.

## Reglas

- No agregues JS global ni hidrates otras páginas.
- Usa botones nativos y mantén el juego jugable con teclado y touch.
- El panel tiene `aria-live="polite"`; conserva el anuncio de cambios de paso.
- Respeta `prefers-reduced-motion` en `CandleVisual` y en las transiciones.
- No inventes temperaturas, tiempos ni materiales: el copy actual es simbólico y debe validarse con el negocio.
- No agregues Phaser, Three.js ni un motor de juego; DOM/CSS es suficiente.
- Mantén el estado en `$state`/`$derived` y los textos/pasos en `steps.ts`; no metas toda la lógica en el markup.
- Presupuesto inicial < 2 MB; el juego solo carga en `/juego`.

## Fase 2

- Puntaje por precisión y orden.
- Persistencia en `localStorage` con clave versionada.
- Audio opcional, apagado por defecto.
- Más pasos o decisiones (color, recipiente, tiempo de curado).
- Validación de datos reales del taller.

## Checklist

- [ ] Se entiende qué hacer sin leer un manual.
- [ ] 360px sin scroll horizontal y con controles alcanzables.
- [ ] Cada paso enseña algo verificable del proceso real.
- [ ] Termina en un producto real con CTA de WhatsApp o al detalle.
- [ ] Funciona con teclado y sin audio.
- [ ] Respeta movimiento reducido.
- [ ] Sin errores de consola; sin JS fuera de `/juego`.
- [ ] `npm run check` y `npm run build` pasan.

Diseño de referencia: `references/game-design.md`.
