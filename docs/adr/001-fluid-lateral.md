# 001 · Fluido celular lateral de bordes suaves

- **Estado:** Aceptado
- **Fecha:** 2026-11-27
- **Contexto:** #125, #126, #143

## Contexto

El rediseño necesita que cera, gel, color y aroma se vean moverse de lado, con
volumen y bordes suaves, sin convertir el taller en una simulación física
costosa. Un solver Navier-Stokes completo no cabe en el presupuesto de un juego
2D móvil, y dibujar una `Graphics` por celda rompería el rendimiento.

## Decisión

Usar un autómata celular tipo _falling-sand_, puro y determinista, en
`src/lib/game/fluid.ts`:

- grid lateral de baja resolución (la olla usa 48×26, semilla fija);
- recorrido de abajo hacia arriba, con orden horizontal alternado por frame y
  `clock` para no mover dos veces la misma celda;
- densidades y “viscosidad” como probabilidad de flujo lateral, no como
  constantes físicas;
- color y aroma se disuelven al tocar cera o gel;
- aleatoriedad con LCG sembrado, sin `Math.random` ni tiempo real dentro del
  solver.

El render usa `FluidRig`: un canvas del tamaño del grid, una `Texture` y **un
solo `Sprite`** escalado. Los bordes suaves son una decisión de presentación:
textura de baja resolución con filtrado lineal, máscara redondeada de la boca
del recipiente y la superficie decorativa de `liquid-rig`. No se aplica blur por
frame ni se dibuja una forma por celda.

## Consecuencias

**A favor**

- Determinista y testeable en Node, sin DOM ni Pixi.
- Barato: una textura y un sprite, sin miles de objetos.
- Se integra con la paleta y el motion existentes.
- El mismo solver sirve para cera, gel, color y aroma.

**En contra**

- No conserva presión ni volumen y la mezcla es aproximada.
- La resolución limitada no permite detalles finos.
- El calor hoy solo sube temperatura; si debe cambiar la fluidez, hay que
  acoplarlo y probarlo.
- El paso depende del frame hasta que se agregue un acumulador de paso fijo.
- Los dirty rects y el grid adaptativo siguen pendientes (#126).

**Límites**

- No agregar Navier-Stokes, librerías de física ni un `Graphics` por celda.
- No usar `Math.random` dentro del solver.
- Mantener `fluid.ts` puro; el canvas y las máscaras viven en `render/`.
- Escalar la resolución o cambiar el modelo exige medir y actualizar esta ADR.
