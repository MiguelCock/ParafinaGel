---
name: Game production
description: Producir el rediseño del taller de ParafinaGel con vertical slices: WIP 1–2, un agente por slice, plan y build separados, subagentes de investigación, Definition of Done, QA rápido vs completo y commits. Úsalo al planear, implementar o cerrar una issue del juego.
---

# Producción por vertical slices

La producción del juego avanza por **porciones jugables de punta a punta**, no por capas técnicas sueltas. Este skill ordena el trabajo de agentes y el cierre de issues; las reglas del repo siguen en [`AGENTS.md`](../../../AGENTS.md).

## Contexto mínimo

Lee, en este orden:

1. [`AGENTS.md`](../../../AGENTS.md): reglas, arquitectura, comandos y datos pendientes.
2. [`docs/game-design.md`](../../../docs/game-design.md): north star, pilares, loop y no-goals.
3. [`docs/roadmap.md`](../../../docs/roadmap.md): fases, orden y issues.
4. [Épica #125](https://github.com/MiguelCock/ParafinaGel/issues/125): rediseño de fluidos, taller físico y nuevo flujo.
5. [`docs/architecture.md`](../../../docs/architecture.md) y [`docs/adr/`](../../../docs/adr/): límites entre simulación, layout, render, estado y UI ([#143](https://github.com/MiguelCock/ParafinaGel/issues/143)).
6. [`../game-design/SKILL.md`](../game-design/SKILL.md), [`../pixi-fluid/SKILL.md`](../pixi-fluid/SKILL.md) y [`../game-playtest/SKILL.md`](../game-playtest/SKILL.md).

No empieces por `game-state.svelte.ts` ni por una escena aislada. Primero define la slice y su contrato.

## Vertical slice

Una slice es un camino delgado que se puede jugar, demostrar y medir:

- Un solo tipo de vela; o una estación nueva integrada de punta a punta (estado, render, panel, tests), no solo la escena.
- Entrada y salida claras.
- Datos mínimos para score y receta.
- Tests y capturas.
- Sin implementar los cuatro tipos “por si acaso”.

Orden de producción:

1. Diseño y referencias: [#141](https://github.com/MiguelCock/ParafinaGel/issues/141).
2. Laboratorio de fluido: [#144](https://github.com/MiguelCock/ParafinaGel/issues/144).
3. Layout y arquitectura: [#143](https://github.com/MiguelCock/ParafinaGel/issues/143).
4. **Slice clásica de una capa**: [#145](https://github.com/MiguelCock/ParafinaGel/issues/145): taller físico → preparación con mecha lateral y corte → cera con perilla → mezcla con gotas/chorrito → vertido lateral → curado en repisa → moños/stickers + tapa aérea → receta.
5. Capas, figura y gel, una por una, solo cuando la clásica pase QA completo.
6. QA, tutorial, baseline y migración editorial: [#140](https://github.com/MiguelCock/ParafinaGel/issues/140).

No abras capas, figura o gel en paralelo con la clásica. Si la clásica no cierra, las otras tres amplifican el problema.

### Plantilla de slice

```md
## Objetivo
El jugador puede <resultado observable> usando <gesto/estación>.

## Dentro
- ...

## Fuera
- ...

## Contrato
- Estado/API:
- Tipos:
- Datos/placeholders:

## Tests
- ...

## QA
- Rápido:
- Completo:

## Demo
- Captura/GIF:
- Issue:
```

## WIP 1–2 y un agente por slice

- Máximo **2 slices activas** en todo el repo. Si una está esperando QA, no abras otra slice de código.
- **Un agente dueño por slice.** Ese agente integra, actualiza el issue y responde por el resultado.
- Los subagentes de investigación pueden trabajar en paralelo; los constructores solo en archivos disjuntos.
- Archivos de contención: `src/lib/game/game-state.svelte.ts`, `src/lib/game/types.ts`, `src/lib/game/data.ts`, `src/lib/game/layout.ts`, `src/lib/game/render/stage-renderer.ts` y `src/styles/game.css`. Si dos slices los necesitan, primero acuerda el contrato y serializa la edición.
- No toques archivos de otra slice “de paso”. Si detectas un bug fuera de alcance, créale issue y sigue.
- No entregues un cambio gigante con varias slices; prefiere entregas revisables y un issue por slice.

Si hay conflicto de propiedad, el dueño de la slice integra y el otro entrega un diff o un issue con evidencia. No hay fuerza de push ni commits cruzados.

## Plan y build separados

Para slices medianas o grandes, separa dos fases:

### Plan (sin editar código)

El agente de plan produce un comentario en el issue:

- Objetivo y resultado observable.
- Dentro/fuera de alcance.
- Archivos y contratos que tocará.
- Datos reales vs placeholder.
- Tests unitarios y de integración.
- QA rápido y completo.
- Riesgos, dependencias y preguntas abiertas.

El plan no implementa. Si descubre que el GDD es ambiguo, lo anota y bloquea la decisión; no la inventa.

### Build (sin rediseñar)

El agente de build implementa contra el plan:

- Respeta los archivos asignados.
- Si el plan es inviable, para y comenta el hallazgo; no cambia el alcance en silencio.
- Ejecuta tests y QA.
- Deja capturas y un handoff.

Para un cambio pequeño (copy, test, fix de una línea), un solo agente puede planear y construir, pero igual deja el plan escrito en el issue.

## Subagentes de investigación

Úsalos para reducir incertidumbre, no para evitar leer `AGENTS.md`.

Buenos encargos:

- Mapear dónde vive una mecánica y qué archivos tocaría.
- Extraer de Noita/Sandspiel/Dressmaker qué tomar y qué evitar, con fuentes.
- Verificar una API de PixiJS 8 o Svelte 5 antes de usarla.
- Revisar `qa/report.json` y proponer la causa de un fallo.
- Auditar datos placeholder contra `docs/datos-validacion.md`.

Malos encargos:

- “Haz la estación completa” sin contrato.
- “Arregla todo el juego” sin alcance.
- “Investiga” sin pregunta, fuentes ni tiempo límite.

Un subagente de investigación entrega: hallazgos, rutas, fuentes, recomendación y riesgos. No edita producción ni abre una slice paralela.

## Definition of Done

Una slice está terminada cuando:

- [ ] Cumple los criterios de aceptación del issue y la Definition of Ready de [`game-design`](../game-design/SKILL.md).
- [ ] El flujo se puede jugar de punta a punta en la slice acordada.
- [ ] `npm test` pasa.
- [ ] `npm run build` pasa (incluye `npm run check`).
- [ ] QA rápido pasa en cada iteración; QA completo pasa antes de integrar la slice.
- [ ] Si la slice cambia un gesto o el flujo, hay playtest de 10 minutos: 4/5 completan y 5/5 explican un error.
- [ ] 390 px y 1280 px sin overflow.
- [ ] Puntero y teclado producen la misma consecuencia.
- [ ] axe 0 violaciones en claro y oscuro.
- [ ] Sin errores de consola.
- [ ] Receta y CTA de WhatsApp funcionan; sin precios de vela terminada.
- [ ] Fallback sin WebGL sigue mostrando diseño y receta.
- [ ] `?motion=off` y `?motion=full` se revisaron; reduced conserva la información.
- [ ] Bundle dentro de presupuesto: chunk grande ≤ 130 KB gzip y total ≤ 260 KB (`scripts/qa/checks.mjs`). El total está cerca del límite: no agregues dependencias.
- [ ] Capturas en `qa/` revisadas; no se commitea `qa/`, `dist/` ni `node_modules/`.
- [ ] Docs actualizados solo si cambió el comportamiento: GDD, `docs/architecture.md`, `AGENTS.md` o el issue.
- [ ] Datos nuevos marcados como placeholder y enlazados a [#87](https://github.com/MiguelCock/ParafinaGel/issues/87).
- [ ] Handoff escrito en el issue con archivos, comandos, evidencia y pendientes.

Si algo no se puede verificar, no está Done: queda como `warn` explícito en el issue.

## QA rápido vs completo

| Cuándo | Comando | Qué cubre |
| --- | --- | --- |
| Cada iteración | `QA_QUICK=1 npm run qa:game` | Clásica con puntero, sandbox, fallback, overflow, motion y bundle (~3 min) |
| Reutilizando build | `QA_SKIP_BUILD=1 QA_QUICK=1 npm run qa:game` | Lo mismo sin reconstruir |
| Antes de integrar la slice | `npm run qa:game` | 4 pedidos, teclado, 390, gel móvil, oscuro, axe, overflow, consola, bundle y FPS (~10 min) |
| Depurar a mano | `QA_HEADLESS=0 npm run qa:game` | Navegador visible |
| Servidor propio | `QA_BASE_URL=http://127.0.0.1:4321 QA_SKIP_BUILD=1 npm run qa:game` | Reutiliza `npm run dev`/`preview` |
| Navegador específico | `BROWSER_PATH=/ruta/al/chrome npm run qa:game` | Brave/Chromium/Chrome |

Reglas:

- `npm run qa:game` ya hace build; no corras `npm run build` antes solo para QA.
- Fallos duros: axe, overflow, consola, receta y flujo. El FPS bajo SwiftShader es aviso, no veredicto de GPU.
- `QA_QUICK=1` no reemplaza la matriz completa antes de integrar.
- Las capturas tienen nombres estables (`1280-light-clasico-melt`, etc.); úsalas para comparar, no las renombres.
- El baseline visual todavía no existe ([#108](https://github.com/MiguelCock/ParafinaGel/issues/108)); no inventes un diff.

## Commits y handoff

- Commits en inglés y conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `perf:`.
- Un commit no mezcla una slice con formato global, cambios de catálogo o refactors ajenos.
- El cuerpo incluye qué cambió, por qué, tests/QA ejecutados y `Refs #<issue>`.
- **No hagas commit ni push sin pedido explícito del dueño.** Los subagentes no publican.
- No commitees `qa/`, `dist/`, `node_modules/`, `.env` ni capturas temporales.
- Handoff en el issue:

```md
## Estado
Listo para revisión / bloqueado por ...

## Archivos
- ...

## Comandos
- `npm test`
- `QA_QUICK=1 npm run qa:game`

## Evidencia
- `qa/report.md`
- Capturas: ...

## Pendientes
- ...
```

Si estás bloqueado, comenta el issue antes de esperar. No dejes una slice “casi lista” sin handoff.

## Checklist

- [ ] La slice es jugable de punta a punta y tiene un solo alcance.
- [ ] WIP ≤ 2 y un agente dueño.
- [ ] Plan escrito antes del build.
- [ ] Subagentes de investigación con pregunta y fuentes, no constructores sueltos.
- [ ] `npm test` y `npm run build` pasan.
- [ ] QA rápido en iteraciones y completo antes de integrar.
- [ ] Accesibilidad, reduced, 390 px y fallback revisados.
- [ ] Bundle dentro de presupuesto y sin dependencias nuevas.
- [ ] Datos placeholder marcados.
- [ ] Handoff y commits listos, sin push no autorizado.
