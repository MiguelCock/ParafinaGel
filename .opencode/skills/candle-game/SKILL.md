---
name: Candle game
description: Diseñar, implementar o modificar el juego 2D cozy de ParafinaGel (Astro + Svelte 5): escenario ilustrado, estaciones, pedidos, SVG/CSS, responsive y accesibilidad. Úsalo al tocar el juego, sus escenas, paneles o scoring.
---

# Juego 2D de velas

## Dónde vive

- Página: `src/pages/juego.astro`.
- Shell: `src/components/game/GameExperience.svelte` (HUD, progreso, reloj y panel).
- Escenario: `WorkshopStage.svelte`, `WorkshopBackdrop.svelte`, `CounterScene`, `MeltScene`, `PourScene`, `CoolScene`, `FinishScene`.
- Controles: `*Panel.svelte`, `OrderTicket`, `StationTabs`, `OverviewPanel`, `LockedPanel`.
- Arte: `Jar2D`, `Pot2D`, `Pitcher2D`, `Fan2D`, `Steam2D`, `CustomerPortrait`, `StationIcon`.
- Motor: `src/lib/game/` (`game-state.svelte.ts`, `data.ts`, `orders.ts`, `types.ts`, tests).
- Estilos compartidos: `src/styles/game.css`.

## Estado actual

- Juego 2D con escenario ilustrado y cámara fija; no WebGL, canvas, Three.js ni Threlte.
- Flujo: mostrador → cera → vertido → enfriado → acabado → score.
- 3 pedidos de ejemplo y resumen del día; 5 estrellas, propinas y breakdown.
- Arte procedural SVG/CSS; `CustomerPortrait` puede usar `customer.portrait` cuando exista arte final.
- `GameExperience` se hidrata con `client:visible`; el resto del sitio no paga el JS del juego.

## Arquitectura

- Mantén el motor puro separado de la UI. `GameState` vive en un `.svelte.ts` y usa runes.
- El reloj es `requestAnimationFrame` con `delta` limitado; `visibilitychange` pausa los timers.
- La UI crítica son botones HTML; los hotspots del escenario son un extra.
- El escenario cambia con `game.view`; `WorkshopStage` renderiza overview o la escena de estación.
- Los paneles copiados desde la etapa anterior mantienen `data-testid`; úsalos para pruebas.
- Datos en `src/lib/game/data.ts`; `productSlug` enlaza al catálogo real. No inventes temperaturas/tiempos reales.

## Diseño y UI

- Estética de papel/editorial: crema, terracota, salvia, ámbar, tinta.
- Tickets con cinta, sello “Ejemplo” y línea punteada; score como recibo; fin del día como ledger.
- Iconos SVG lineales; no emojis como iconos.
- Barra de progreso de 5 estaciones; tabs con iconos y checks.
- Un CTA principal por paso; estados disabled claros; hints contextuales.
- Desktop: escenario + panel lateral; móvil: HUD, escenario 4:3/380 px, ticket y controles apilados.
- No agregues scroll horizontal; cuida el contraste y el foco.

## Rendimiento y accesibilidad

- Nada de Three.js/Threlte/canvas. Si se necesita animación, CSS o SVG.
- Respeta `prefers-reduced-motion` en llama, vapor, ventilador, escenas y transiciones.
- axe (WCAG 2.1 AA) debe pasar en `/juego` en claro, oscuro y móvil.
- `npm test`, `npm run check` y `npm run build` deben pasar.
- Prueba el flujo completo de 3 pedidos y el cambio de estación; verifica 360/390/768/1280 px.

## Fase 2

- “Crear mi vela” con resumen compartible y CTA a WhatsApp.
- Puntaje persistente/`localStorage`, audio opcional y más clientes.
- Retratos/escenas AI o arte final: usa `customer.portrait` y reemplaza SVG sin tocar el motor.
- Integración real con catálogo y precios.

## Checklist

- [ ] `npm test` y `npm run check` pasan.
- [ ] Flujo completo de 3 pedidos y score correcto.
- [ ] 360 px sin scroll horizontal; controles alcanzables.
- [ ] Sin errores de consola.
- [ ] axe 0 violaciones en claro/oscuro/móvil.
- [ ] Respeta movimiento reducido y teclado.
- [ ] Termina en un producto real con CTA.

Diseño de referencia: `references/game-design.md`.
