---
name: Game design
description: Diseñar la experiencia del taller 2D de ParafinaGel: north star, pilares, loop, referencias, wireframes/storyboards, Definition of Ready y no-goals. Úsalo antes de prototipar una estación, cambiar el flujo o convertir una idea en issue.
---

# Diseño del juego

Este skill decide **qué experiencia construir** antes de tocar Pixi, Svelte o `game-state`. No reemplaza a `AGENTS.md`: lo resume para diseño y apunta a las fuentes.

## Lee primero

1. [`AGENTS.md`](../../../AGENTS.md): reglas del repo, arquitectura y comandos.
2. [`docs/game-design.md`](../../../docs/game-design.md): GDD canónico. Si cambia el flujo, actualízalo antes de codificar; no inventes estaciones.
3. [`docs/references.md`](../../../docs/references.md): referencias, qué tomar y qué evitar.
4. `docs/sketches/estaciones.svg`, `docs/sketches/storyboards.svg` y `docs/sketches/notas.md`: wireframes por estación y storyboards por gesto (los crea [#141](https://github.com/MiguelCock/ParafinaGel/issues/141)).
5. [`docs/proceso-de-fabricacion.md`](../../../docs/proceso-de-fabricacion.md): proceso real y datos pendientes.
6. [`docs/datos-validacion.md`](../../../docs/datos-validacion.md): qué dato es oficial y qué es placeholder.
7. [`docs/architecture.md`](../../../docs/architecture.md) y [`docs/adr/`](../../../docs/adr/): límites entre simulación, render, UI y estado.
8. [`../candle-game/SKILL.md`](../candle-game/SKILL.md): implementación actual y límites técnicos.

Skills de apoyo: [`pixi-fluid`](../pixi-fluid/SKILL.md), [`game-playtest`](../game-playtest/SKILL.md) y [`game-production`](../game-production/SKILL.md).

## North star

Que una persona sin experiencia en velas termine una vela y entienda **qué insumos necesita para repetirla**. El juego es una clase práctica de 8–10 minutos en un taller familiar, no un catálogo ni un simulador físico.

El negocio vende **insumos y materias primas**. El cierre siempre es receta + lista de materiales + WhatsApp; nunca una vela terminada con precio ni propina.

## Pilares

Los pilares canónicos están en [`docs/game-design.md` §2](../../../docs/game-design.md). En corto:

1. **La materia se ve.** Cada acción cambia algo en pantalla; el fluido se renderiza suave, no como pixel art.
2. **El gesto es la interfaz.** Girar, arrastrar, dosificar, inclinar, cortar. El DOM existe para estantería, paneles, accesibilidad y receta.
3. **El error enseña, no castiga.** No hay derrota; un derrame o una mecha descentrada se ven, cuestan puntos y se corrigen.
4. **Aprender haciendo termina en receta.** Cada estación corresponde a un paso real; la receta traduce decisiones a insumos, cantidades y advertencias. Los datos sin validar se marcan como placeholder.
5. **Un taller para todos.** Teclado, foco visible, 390 px y reduced son parte del diseño, no una pasada final.
6. **Una vela a la vez.** La vertical slice clásica se pule antes de profundizar capas, figura o gel.

## Loop

### Loop objetivo (rediseño #125)

```text
brief
→ taller / estantería física
→ preparación: mecha lateral + corte
→ cera: olla lateral + fogón con perilla
→ mezcla: varios fogones + color/aroma visibles
→ vertido: jarra lateral inclinada por cercanía al centro
→ curado: repisa larga
→ acabado: moños/stickers + tapa desde vista aérea
→ score / receta
→ WhatsApp
```

Una vela completa debe caber en **8–10 minutos**; el día guiado encadena 4 pedidos en **35–45 minutos** y se puede jugar un pedido por sesión. No hay reloj de cuenta atrás. El modo libre no tiene brief ni reloj. Si el GDD y el código difieren, el GDD manda para diseño y el código para saber qué existe hoy.

### Loop actual (2.2)

```text
brief → design → wick (preparación) → melt → mix → pour → cool → finish → score
```

El código todavía conserva diseño separado del taller, corte de mecha en acabado y etiqueta en vez de moños. No documentes el flujo objetivo como si ya estuviera implementado. Ver [`candle-game`](../candle-game/SKILL.md).

### Micro-loop por estación

```text
mirar → tocar → leer la respuesta → corregir → confirmar
```

Cada estación tiene un verbo principal y un estado visible de “listo”. Si el jugador tiene que mirar el panel para saber qué pasó en la mesa, el feedback de la escena falló. Si el gesto falla: feedback inmediato, estado comprensible y reintento; nunca bloquear por no entender la interfaz.

### Cierre comercial

`receta → cantidades → lista de insumos → CTA de WhatsApp`. Sin checkout, sin precio de vela terminada, sin datos reales de contacto en el repo.

## Referencias

La tabla completa vive en `docs/references.md`. Resumen operativo:

| Referencia | Tomar | Evitar |
| --- | --- | --- |
| **Noita** ([artículo](https://80.lv/articles/noita-a-game-based-on-falling-sand-simulation/)) | Autómata celular, densidades, dirty rects, sensación emergente de materiales | Pixel art, caos letal, estructura roguelike |
| **Sandspiel** ([artículo](https://maxbittker.com/making-sandspiel)) | Grid pequeño, textura, rendimiento web, reglas simples | Copiar UI, marca o contenido |
| **Falling-sand** ([género](https://en.wikipedia.org/wiki/Falling-sand_game)) | Legibilidad de materiales y reglas locales | Prometer precisión física |
| **Dressmaker** ([Steam](https://store.steampowered.com/app/4019220/Dressmaker/)) | Elegir material, cortar patrón, ensamblar, decorar y entregar a un cliente; objetos físicos y pasos manuales | Copiar arte, UI o narrativa |
| **Potion Craft** | Dosificación táctil y causa-efecto legible | Copiar estética de alquimia |
| **Unpacking** | Ritmo calmado, manipulación de objetos y narrativa ambiental | Copiar historia o arte |
| **A Little to the Left** | Gestos de orden, affordances amables, sensación de “quedó bien” | Convertirlo en puzzle puro |
| **Wilmot's Warehouse** | Estanterías, inventario físico y organización | Alcance de simulación de almacén |

Regla: toma **ritmo y manipulación**, no assets, UI, narrativa ni marca. Si una referencia no aparece en `docs/references.md`, agrégala ahí antes de usarla como argumento de diseño.

## Wireframes y storyboards

No se codea una estación sin wireframe y storyboard. Fuente exacta: [`docs/sketches/estaciones.svg`](../../../docs/sketches/estaciones.svg) (7 estaciones), [`docs/sketches/storyboards.svg`](../../../docs/sketches/storyboards.svg) (gestos) y [`docs/sketches/notas.md`](../../../docs/sketches/notas.md). La tabla de referencia es [`docs/game-design.md` §5.3](../../../docs/game-design.md).

Cada estación necesita:

- **Cámara**: lateral para fabricar; aérea solo para la tapa y la vista final.
- **Verbo**: una acción principal, no una lista de botones.
- **Feedback**: qué cambia en el material, qué se oye y qué se lee.
- **Error**: qué pasa si el gesto sale mal y cómo se recupera.
- **Reduced**: versión estática o de baja intensidad que conserve la información.
- **Puntero y teclado**: misma acción, misma consecuencia.
- **390 px**: composición, orden de paneles y objetivos táctiles.

| Estación | Cámara | Verbo | Feedback | Error | Reduced |
| --- | --- | --- | --- | --- | --- |
| Taller / estantería | Plano general 2.5D | Tomar y arrastrar un objeto | El objeto encaja y se etiqueta | Vuelve a su lugar con pista | Selector accesible |
| Preparación | Lateral | Colocar mecha y cortar | Mecha centrada, corte limpio | Mecha fuera de centro | Flechas/Enter y estado estático |
| Cera | Lateral | Cortar bloque, girar perilla, revolver | Cera cae, temperatura y vapor | Sobrecalentamiento o bloque sin cortar | Perilla con teclas, sin vapor |
| Mezcla | Lateral | Calentar fogón, gota, chorrito, revolver | Color y aroma se integran | Dosis fuera de rango o fogón frío | Teclas 1–4, dosis por paso |
| Vertido | Lateral | Inclinar la jarra por cercanía al centro | Chorro, nivel y capa | Derrame o capa incompleta | Inclinación con flechas |
| Curado | Lateral / repisa | Abanicar, retirar sostenedor, reventar burbujas | Timer y brillo | Burbujas en gel | Acción por tecla, timer visible |
| Acabado | Aérea para tapa; lateral para etiqueta/moño | Pegar etiqueta/moño/sticker, girar tapa, empacar; corte de mecha: decisión abierta (#138) | Encaje y giro | Pieza torcida o tapa mal puesta | Teclas 1–4, flechas, Mayús |

Storyboards obligatorios por gesto: perilla, gota, chorrito, inclinación, tapa y corte. Cada uno muestra inicio, arrastre, umbral, resultado y recuperación.

Decisiones abiertas que no se resuelven en código:

- **Corte de mecha**: [#138](https://github.com/MiguelCock/ParafinaGel/issues/138) lo mueve a Preparación, pero el GDD §5.3 y `sketches/notas.md` todavía lo muestran en Acabado. Confirma la decisión en el GDD y actualiza wireframe/tabla antes de implementar.
- **Sobrecalentamiento**: hoy `overheated` bloquea el avance y no se recupera; el rediseño debe permitir retirar la olla o reiniciar la estación sin reiniciar el día.

## Definition of Ready

Una estación o cambio de flujo está listo para implementarse solo si:

- [ ] Tiene sección en `docs/game-design.md` y wireframe/storyboard en `docs/sketches/`.
- [ ] Pasa el filtro del north star y de los pilares.
- [ ] Define entrada y salida: qué debe existir antes y qué desbloquea después.
- [ ] Define el contrato de datos (`types.ts`, `GameState` o el controlador de estación; la geometría compartida va en `layout.ts`).
- [ ] Define gesto, feedback, error y recuperación.
- [ ] Define equivalente de teclado y versión reduced.
- [ ] Define layout de 390 px y objetivos táctiles de 44×44 px.
- [ ] Define efecto en score/receta y qué datos son placeholder.
- [ ] Tiene plan de tests y QA (ver [`game-production`](../game-production/SKILL.md)).
- [ ] Es un vertical slice de un solo tipo de vela, no los cuatro a la vez.
- [ ] Tiene un agente dueño y archivos acordados para evitar dos agentes en el mismo archivo.

Si falta un punto, el issue vuelve a diseño. No se compensa con código.

## Criterios observables

El GDD §7 define umbrales, no adjetivos. Los que más se rompen:

| Criterio | Umbral |
| --- | --- |
| Primera acción desde “Jugar pedidos” | ≤ 90 s sin ayuda |
| Respuesta al gesto | ≤ 100 ms o el siguiente frame |
| Error recuperable | ≤ 2 acciones; 0 softlocks |
| Solo teclado / solo reduced | 7/7 estaciones |
| 360 px, claro/oscuro, axe AA | 0 fallos duros |
| Comprensión | 4/5 completan la clásica; 5/5 explican un error |
| Duración | Una vela ≤ 10 min; día 35–45 min |

La “prueba de los 10 segundos”: al entrar a una estación, el jugador debe saber qué tocar en 10 s. Si no, falla la affordance, no el jugador.

## No-goals

- Vender velas terminadas, mostrar precios de venta finales, propinas, márgenes, economía, reputación o stock.
- Simulación Navier-Stokes, fuego realista o física de fluidos con precisión científica.
- Pixel art, 3D o fotorrealismo; el objetivo es ilustración 2.5D cozy de bordes suaves.
- Three.js, Threlte o WebGL crudo: la decisión es PixiJS 8 en 2D.
- Reloj de cuenta atrás o presión de tiempo; “Día 1” es narrativo.
- Capas, figura o gel antes de que la vertical slice clásica pase QA completo.
- Sliders o botones para los retos manuales; solo se aceptan como alternativa accesible cuando el gesto ya existe.
- Backend, cuentas, ranking, multijugador, procedural o inventario infinito en esta fase.
- Nuevas dependencias de animación: se usan `motion.ts` y `motionBudget`.
- Copiar arte, UI, narrativa o audio de las referencias.
- Inventar temperaturas, dosis, tiempos, medidas, precios o datos de contacto.
- Prometer seguridad no validada (cera caliente, gel) sin revisión del negocio.
- Agregar JS global o hidratar partes del sitio que pueden ser estáticas.

## Filtros de decisión

Antes de aprobar una idea, responde:

1. ¿Qué aprende el jugador en esta estación?
2. ¿Qué gesto demuestra que lo aprendió?
3. ¿Cómo se ve ese gesto en el material, no solo en el panel?
4. ¿Qué pasa si falla y cómo se recupera sin salir de la estación?
5. ¿Cómo se juega con teclado, con movimiento reducido y a 390 px?
6. ¿Qué dato es real y cuál es placeholder?
7. ¿Esto acerca a la receta o es decoración que compite con el gesto?

## Checklist

- [ ] Leí `AGENTS.md`, el GDD y las referencias antes de decidir.
- [ ] La estación tiene cámara, verbo, feedback, error y reduced.
- [ ] El wireframe/storyboard existe y está enlazado.
- [ ] La Definition of Ready está completa.
- [ ] El cambio respeta los no-goals.
- [ ] El plan de playtest y QA está escrito.
- [ ] No inventé datos ni prometí el flujo objetivo como implementado.
