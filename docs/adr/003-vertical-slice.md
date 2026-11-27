# 003 · Vertical slice clásica primero

- **Estado:** Aceptado
- **Fecha:** 2026-11-27
- **Contexto:** #125, #143

## Contexto

El rediseño abarca fluidos, taller físico, nuevos gestos de acabado y cuatro
tipos de vela. Construir todo en paralelo produce sistemas a medias, UI sin
flujo real y decisiones de layout que se validan tarde. La versión actual ya
soporta clásica, capas, figura y gel; la decisión aplica al rediseño y a toda
mecánica nueva.

## Decisión

Cerrar primero una **rebanada vertical de vela clásica**, de punta a punta:

```text
brief → diseño → preparación → cera → mezcla → vertido → curado → acabado → score/receta
```

La rebanada incluye puntero, teclado, 390 px, axe, motion reducido y receta con
CTA. Los sistemas nuevos (fluido, estantería física, gestos de acabado) se
integran primero en clásica. Después se generalizan a capas, figura y gel. Las
variantes existentes no se eliminan: se mantienen estables mientras se adaptan.

Una mecánica no se considera terminada por verse bien en una captura; debe
cerrar el ciclo completo y actualizar la receta.

## Consecuencias

**A favor**

- Integración temprana y feedback real de una partida completa.
- Contratos de estado, layout y score estables antes de multiplicar variantes.
- Menos UI muerta y menos trabajo paralelo sin validar.
- El QA puede recorrer un camino completo desde el primer corte.

**En contra**

- Supuestos de la vela clásica pueden filtrarse a capas, figura o gel.
- Algunas funciones quedan temporalmente limitadas a clásica.
- Hay presión por cerrar la rebanada antes de explorar variantes.

**Mitigación**

- Mantener el modelo de datos preparado para varias capas/unidades aunque la
  primera rebanada use una.
- Probar desde el inicio las reglas de capas, figura y gel que no dependan del
  render.
- No agregar flags permanentes; documentar qué falta y retirarlas al generalizar.
