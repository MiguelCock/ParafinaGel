---
name: Game playtest
description: Guiar sesiones de playtest de 10 minutos del taller de ParafinaGel: guion, preguntas, observación, fricción, accesibilidad y reduced motion, capturas y conversión de hallazgos en issues. Úsalo después de una vertical slice o al cambiar un gesto.
---

# Playtest de 10 minutos

El playtest valida **si el jugador puede hacer la vela y entiende qué pasó**, no si le gustó el arte. Se hace con la vertical slice clásica antes de escalar a capas, figura o gel.

Criterio de éxito de una ronda (GDD §7): **4/5 completan** la clásica sin ayuda, **5/5 explican un error** y una vela cabe en **≤ 10 min**. El score no es criterio de usabilidad.

## Cuándo

- Después de la vertical slice clásica ([#145](https://github.com/MiguelCock/ParafinaGel/issues/145)).
- Después de cambiar un gesto: perilla, gota, chorrito, inclinación, tapa, corte o moños.
- Después de cambiar score, receta o CTA de WhatsApp.
- Antes de convertir un hallazgo en una nueva estación o en los cuatro tipos de vela.

No lo uses para aprobar una idea sin build jugable. Para revisar código o diseño, usa [`game-design`](../game-design/SKILL.md) o [`game-production`](../game-production/SKILL.md).

## Antes de la sesión

- [ ] Build de producción: `npm run build` y `npm run preview`, o `npm run dev` si estás iterando. No mezcles builds a mitad de sesión.
- [ ] Define la tarea: “haz una vela clásica y llega a la receta”.
- [ ] Prepara 3–5 participantes que no sean del equipo. Al menos uno debe usar solo teclado; uno debe probar 390 px; uno debe usar movimiento reducido.
- [ ] Prueba `?motion=off` y `?motion=full` antes de la primera sesión.
- [ ] Prepara grabación de pantalla y carpeta `qa/playtest/<fecha>/` (ignorada por git). Pide consentimiento para voz o imagen; por defecto, no grabes la cara.
- [ ] Lee [`docs/game-design.md`](../../../docs/game-design.md) y el flujo actual para no explicar lo que el juego debería explicar solo.
- [ ] Ten el issue de la slice abierto para anotar el contexto y el build.

## Guion de 10 minutos

| Minuto | Qué haces | Qué no haces |
| --- | --- | --- |
| 0–1 | Bienvenida, consentimiento, “piensa en voz alta”, “no hay forma de perder” | Explicar la interfaz ni dónde hacer clic |
| 1–2 | Pregunta abierta: “¿qué crees que puedes hacer aquí?” | Decir “esto es una estantería” |
| 2–8 | Tarea: “haz una vela clásica y llega a la receta”. Observa y anota | Tocar el mouse, corregir o resolver el gesto |
| 8–9 | Tarea de cierre: “¿cómo pedirías los materiales?” | Asumir que el CTA se entiende |
| 9–10 | Tres preguntas finales y cierre | Seguir probando funciones nuevas |

Si la persona se bloquea más de 2 minutos, anota el punto exacto y da **una pista mínima** (“prueba con la perilla”) o pasa a la siguiente estación. No completes la tarea por ella. Si termina antes, pídele repetir un gesto o probar teclado; no agregues tareas que rompan la comparación.

## Preguntas

Haz preguntas abiertas y sobre la acción, no sobre gustos:

- “¿Qué crees que tienes que hacer ahora?”
- “¿Qué acabas de hacer y qué esperabas que pasara?”
- “¿Qué mirabas cuando elegiste ese material?”
- “¿Dónde sentiste que el juego no te hizo caso?”
- “¿Qué harías si quisieras pedir los insumos?”
- “¿Qué parte te gustaría hacer otra vez?”
- “¿Qué parte te saltarías?”
- “En una palabra: ¿cómo se sintió el taller?”

Evita “¿te gustó?”, “¿entiendes?”, “¿es claro?” y cualquier pregunta que sugiera la respuesta. Si la persona dice “está bonito”, pregunta qué acción concreta le hizo sentirse así.

## Qué observar

Por estación anota:

| Campo | Qué registrar |
| --- | --- |
| Tiempo | Entrada y salida de la estación |
| Primera acción | Qué intenta antes de leer |
| Dudas | Silencios de más de 5 s, miradas al panel, prueba y error |
| Gestos fallidos | Arrastre que no agarra, perilla que no gira, gota que no cae |
| Recuperación | ¿Entiende el error? ¿Reintenta solo? |
| Ayuda | ¿Abre el modal? ¿Lee las pistas? |
| Cita | Frase textual, sin parafrasear |
| Score | Solo como contexto; no es una medida de usabilidad |

Clasifica la fricción:

- **Descubrir**: no sabe qué hacer.
- **Agarrar**: no sabe dónde tomar o arrastrar.
- **Entender**: hizo el gesto pero no entiende el resultado.
- **Control**: el gesto es demasiado difícil o impreciso.
- **Ritmo**: espera, repetición o prisa excesiva.
- **Accesibilidad**: teclado, foco, contraste, reduced, 390 px.
- **Contenido**: copy, dato o receta confusos.
- **Técnico**: jank, overflow, consola, WebGL.

Severidad:

- **Blocker**: no puede avanzar sin ayuda.
- **Fricción**: avanza, pero duda, falla o repite.
- **Pulido**: entiende y avanza; el detalle molesta.

Frecuencia: 1 de 3 es anécdota; 2 de 3 es patrón; 3 de 3 es candidato a blocker. Con 5 participantes usa la proporción (2/5, 4/5). No conviertas una opinión aislada en una reescritura.

## Accesibilidad y reduced

El playtest debe incluir, aunque sea en sesiones cortas:

- **Solo teclado**: Tab hasta el canvas, flechas, Espacio, Enter, Mayús + flechas, 1–4. Verifica foco visible, `aria-label` y que el panel explique el gesto.
- **390 px**: sin scroll horizontal, objetivos táctiles de 44×44 px, nada que dependa de hover.
- **Reduced**: `prefers-reduced-motion: reduce` o `?motion=off`. Comprueba que la información no viva solo en una animación; el fluido debe seguir leyéndose.
- **Contraste y tema**: claro y oscuro; axe se corre en QA, pero observa si el foco se pierde.
- **Zoom**: prueba 200 % si puedes; el layout no debe romperse.

Pregunta después de la versión reducida: “¿qué información te falta ahora?”. Si la respuesta es “no sé si la cera está lista”, la versión reduced no es equivalente.

## Qué capturar

- Grabación de pantalla con timestamps.
- Capturas en los puntos de fricción: `P1-390-keyboard-cera-01.png`.
- Cita textual, acción esperada y resultado real.
- Entorno: fecha, build/commit, navegador, sistema, viewport, input, `motion`, zoom.
- Tiempo por estación y si llegó a la receta.
- No captures datos personales, voces ni caras sin consentimiento. El repo es público; `qa/` está ignorada, pero un issue no debe llevar información personal.

Guarda las notas crudas en `qa/playtest/<fecha>/` y comparte en el issue solo el resumen y la evidencia necesaria.

## De hallazgos a issues

Sintetiza el mismo día:

1. Agrupa citas y clips por fricción, no por persona.
2. Quedate con las 3 fricciones con más evidencia.
3. Distingue bug, diseño, dato y accesibilidad.
4. Propón el arreglo más pequeño que permita avanzar.
5. Re-testea con un participante del mismo perfil si era blocker.

Plantilla de issue:

```md
## Contexto

P2 · 390 px · teclado · `?motion=off` · build `<sha>`

## Evidencia

Clip 00:42. Cita: “no sé si esto ya está caliente”.

## Fricción

No hay confirmación de temperatura en la versión reduced.

## Impacto

Fricción · 2/3 participantes · estación Cera.

## Propuesta

Mantener el estado textual y el color de la perilla sin depender del vapor.

## Criterios de aceptación

- [ ] El estado se entiende con `?motion=off`.
- [ ] Funciona con teclado y a 390 px.
- [ ] QA rápido sin overflow ni consola.

## Archivos probables

`src/lib/game/render/scenes/melt-scene.ts`, `src/components/game/MeltPanel.svelte`
```

Reglas:

- Un issue por fricción, no uno por participante.
- Enlaza la épica [#125](https://github.com/MiguelCock/ParafinaGel/issues/125), la slice y el issue de estación.
- Usa las labels existentes (`design`, `redesign`, `priority:now`, `story`) y no inventes una taxonomía nueva.
- Si es un bug, incluye pasos, esperado, actual y errores de consola; si es dato, enlaza [#87](https://github.com/MiguelCock/ParafinaGel/issues/87).
- No pegues videos con personas ni información personal.
- El issue debe poder resolverse sin volver a entrevistar a la persona.

## Anti-patrones

- Explicar la interfaz y luego concluir que “es intuitiva”.
- Corregir el build durante la sesión.
- Medir éxito por score o estrellas.
- Probar solo con el equipo.
- Convertir una queja de una persona en prioridad inmediata.
- Preguntar “¿te gusta?” en vez de observar la acción.
- Ignorar teclado, reduced o 390 px hasta el final.
- Guardar notas con nombres o datos de participantes en el repo.

## Checklist

- [ ] Sesión de 10 minutos con guion y consentimiento.
- [ ] Tarea clara: vela clásica hasta la receta y CTA.
- [ ] Observación por estación con citas y timestamps.
- [ ] Una sesión con teclado, una a 390 px y una con reduced.
- [ ] Fricciones clasificadas por tipo, severidad y frecuencia.
- [ ] Notas en `qa/playtest/` y evidencia anonimizada.
- [ ] Issues creados con contexto, evidencia, impacto y criterios.
- [ ] Si era blocker, re-test después del arreglo.
