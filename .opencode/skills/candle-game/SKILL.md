---
name: Candle game
description: Diseñar, implementar o modificar el juego 3D cozy de ParafinaGel (Astro + Svelte 5 + Threlte/Three.js): estaciones, pedidos, cámara fija, rendimiento móvil y fallback 2D. Úsalo al tocar el juego, su escena, UI o scoring.
---

# Juego 3D de velas

## Dónde vive

- Página: `src/pages/juego.astro`.
- Experiencia: `src/components/game3d/GameExperience.svelte` (detecta WebGL y alterna 3D / modo ligero).
- Shell: `src/components/game3d/Game3D.svelte` (HUD, panel, `<Canvas>`).
- Escena: `GameScene.svelte`, `CameraRig`, `GameClock`, `FrameStats`, `WorkshopRoom` y estaciones.
- UI: `*Panel.svelte`, `StationTabs`, `OrderTicket`.
- Motor: `src/lib/game3d/` (`game-state.svelte.ts`, `data.ts`, `orders.ts`, `palette.ts`, `motion.ts`, tests).
- Respaldo 2D: `src/components/game/CandleGame.svelte`.

## Estado actual

- Diorama 3D con **cámara fija**; no free-roam, no física, no motor de juego adicional.
- Flujo: mostrador → cera → vertido → enfriado → acabado → score.
- 3 pedidos de ejemplo y resumen del día.
- Calidad `alta`/`baja` (sombras, DPR, detalle); móvil inicia en baja.
- Modo ligero 2D si no hay WebGL o si el jugador lo elige.
- Blockout procedural con primitivas de Three.js; el arte GLB llega después.
- `npm test` cubre el motor puro; `npm run check` valida Astro/Svelte.

## Arquitectura

- Mantén el motor puro separado de la escena y la UI. `Game3DState` vive en un `.svelte.ts` y usa runes.
- `GameExperience` se hidrata con `client:only="svelte"`; el juego no se carga fuera de `/juego`.
- `Game3D` orquesta HUD + panel + canvas. Las acciones críticas son botones HTML; los hotspots 3D son un extra.
- `GameScene` contiene la escena Threlte y llama `interactivity()`.
- La cámara se mueve con `CameraRig` entre posiciones fijas. Respeta `prefers-reduced-motion` (corte instantáneo).
- Datos de pedidos en `data.ts`; `productSlug` enlaza al catálogo real. Los tiempos/temperaturas son aproximados.

## Gotchas de Threlte/Svelte 5

- `useThrelte().camera` es un **CurrentWritable**: usa `camera.current.position`, no `camera.position`.
- `interactivity()` debe ejecutarse en un componente **hijo** de `<Canvas>`, no en el componente que renderiza `<Canvas>`.
- **Nunca nombres una variable `state` en un componente que usa `$state`**: Svelte compila `$state` como suscripción a un store y lanza `store_invalid_shape`. Usa `game` o `store`.
- `useTask` es el frame loop; pausa en `visibilitychange` y limita `delta`.
- `Canvas` controla `shadows`, `dpr` y `renderMode`. No agregues postprocessing en móvil.

## Rendimiento móvil

- Presupuesto objetivo: 60 fps en gama media, 30 fps mínima; < 100 draw calls ideal.
- Calidad baja: sin sombras, DPR `[0.75, 1.2]`, menos velas de repisa y herramientas ocultas.
- Evita materiales físicos con transmisión/refracción; el vidrio es estilizado.
- No agregues Phaser, Rapier ni otro motor. Si hace falta optimizar, usa instancing/merge de geometría.
- Usa el overlay de stats en dev para ver FPS, draw calls y triángulos.

## Reglas de juego

- Feedback inmediato y positivo; sin fail state que bloquee.
- La temperatura se registra al entrar en rango; el enfriado es simbólico.
- No inventes temperaturas, tiempos ni materiales reales: valida con el negocio.
- Mantén el juego jugable con teclado, touch y sin audio.
- Respeta movimiento reducido en cámara, llama, ventilador, vapor, cliente y jarra.

## Fase 2

- “Crear mi vela” con captura 3D y CTA a WhatsApp.
- Puntaje, persistencia en `localStorage`, audio opcional.
- Más aromas, frascos, etiquetas y clientes.
- Arte GLB optimizado y sonido.
- Integración real con catálogo y precios.

## Checklist

- [ ] `npm test` y `npm run check` pasan.
- [ ] El flujo completo funciona en 3D y en modo ligero.
- [ ] 360 px sin scroll horizontal; controles alcanzables.
- [ ] El canvas no bloquea la lectura ni el teclado.
- [ ] Sin errores de consola ni contextos WebGL perdidos.
- [ ] Calidad baja usable y sin sombras.
- [ ] Termina en un producto real con CTA.

Diseño de referencia: `references/game-design.md`.
