# Ruta directa de construcción

Fuente operativa: [issue #124](https://github.com/MiguelCock/ParafinaGel/issues/124) y los hitos de GitHub.

109 issues accionables en 7 fases. Los epics son carpetas y no se construyen aparte.

| Fase | Hito                      | Pasos   |
| ---- | ------------------------- | ------- |
| 0    | Datos                     | 1       |
| 1    | Proceso y receta          | 2–7     |
| 2    | Visuales de la estantería | 8–19    |
| 3    | Modos y resultado         | 20–31   |
| 4    | Persistencia y colección  | 32–40   |
| 5    | Juice                     | 41–107  |
| 6    | Cierre                    | 108–109 |

## Regla de avance

- Fases 0–1 ahora: datos, proceso, receta y briefs.
- Fases 2–4 después: visuales, modos/resultado y persistencia/colección.
- Fase 5 solo con las mecánicas y visuales estables.
- #108 baseline visual se hace al final, después de #88.

## Orden

### Fase 0 · Datos

- 1. #87 — Auditoría y validación de datos placeholder

### Fase 1 · Proceso y receta

- 2. #110 — Cortar, derretir y endurecer la cera
- 3. #111 — Mezclar color y aroma en la cera
- 4. #112 — Verter, curar y retirar el sostenedor
- 5. #90 — Receta real y catálogo de insumos
- 6. #114 — Receta y briefs con el proceso real
- 7. #89 — Variedad de clientes y briefs con curva de dificultad

### Fase 2 · Visuales de la estantería

- 8. #116 — Estantería de materiales: composición, profundidad y luces
- 9. #117 — Objetos de cera por producto
- 10. #118 — Envases: lata, cerámica y vidrio
- 11. #119 — Pabilos, porta pabilo y centrador
- 12. #120 — Frascos de color y aroma, etiquetas y moldes
- 13. #121 — Hover, foco, arrastre y encaje de objetos
- 14. #122 — Responsive y objetivos táctiles de la estantería
- 15. #123 — Catálogo: placeholders por categoría y fotos reales
- 16. #12 — Personajes con expresión y escenario coherente
- 17. #19 — C1 Sistema de expresiones y anclas
- 18. #20 — C2 Repaso de retratos: pelo, ropa y accesorios
- 19. #21 — C3 Props, composición y UI responsive

### Fase 3 · Modos y resultado

- 20. #11 — Modo Calma / Taller real
- 21. #16 — B1 Modelo de dificultad y persistencia
- 22. #17 — B2 Tolerancias y tiempos por estación
- 23. #18 — B3 UI, pistas y balance de los 4 pedidos
- 24. #10 — Resultado explicado y reacción del cliente
- 25. #13 — A1 Diagnóstico y priorización de hallazgos
- 26. #14 — A2 Callouts en la vela y comparación brief vs resultado
- 27. #15 — A3 Reacción del cliente y versión móvil/accesible
- 28. #91 — Vista encendida: cómo se comportaría la vela
- 29. #92 — D1 Modelo de simulación de quemado
- 30. #93 — D2 Escena Pixi encendida
- 31. #94 — D3 Explicación educativa y accesibilidad

### Fase 4 · Persistencia y colección

- 32. #22 — Recetario, guardado local y progreso
- 33. #24 — E1 Persistencia local versionada
- 34. #25 — E2 Recetario y diseños guardados
- 35. #113 — Muro de velas coleccionables
- 36. #26 — E3 Progreso visible y logros
- 37. #23 — Estudio con memoria y experimentación
- 38. #27 — F1 Undo/redo, duplicar y reset
- 39. #28 — F2 Presets e inspiración
- 40. #29 — F3 Borradores y comparación de variantes

### Fase 5 · Juice

**J1 · Shell y entrada**

- 41. #36 — Botones y foco
- 42. #37 — Carga WebGL
- 43. #30 — Entrada al taller
- 44. #31 — Transición taller ↔ estación
- 45. #32 — Hotspots del taller
- 46. #33 — HUD de puntos
- 47. #34 — Barra de progreso
- 48. #35 — Tabs de estación
- 49. #38 — Entrada del cliente
- 50. #39 — Revelado del brief
- 51. #40 — Sello “Crear nota”
- 52. #96 — Modal de ayuda
- 53. #97 — Resumen de nota expand/collapse
- 54. #102 — Tooltips de herramientas
- 55. #84 — Cursor contextual
- 56. #95 — Cliente idle: parpadeo y respiración

**J2 · Diseño y estantería**

- 57. #42 — Preview de vela
- 58. #43 — Capas del diseñador
- 59. #44 — Partes de figura
- 60. #45 — Inclusiones de gel
- 61. #60 — Gel y refracción
- 62. #46 — Paleta de colores
- 63. #47 — Validación del diseño

**J3 · Preparación y mecha**

- 64. #61 — Arrastre de mecha
- 65. #62 — Anillo central
- 66. #63 — Tipos de mecha

**J4 · Cera**

- 67. #48 — Llama del hornillo
- 68. #49 — Vapor de la cera
- 69. #50 — Cuchara y remolino
- 70. #51 — Cera derretida
- 71. #52 — Medidor de temperatura

**J5 · Vertido**

- 72. #53 — Jarra de vertido
- 73. #54 — Chorro de cera
- 74. #55 — Superficie del líquido
- 75. #56 — Capas durante el vertido
- 76. #57 — Derrame
- 77. #58 — Salpicaduras
- 78. #59 — Línea meta

**J6 · Curado**

- 79. #64 — Ventilador de curado
- 80. #65 — Burbujas de gel
- 81. #66 — Timer de curado

**J7 · Acabado**

- 82. #98 — Desmolde de figura
- 83. #67 — Etiqueta arrastrable
- 84. #68 — Guía de etiqueta
- 85. #69 — Aplicar etiqueta
- 86. #70 — Tijeras y corte de mecha
- 87. #71 — Tapa de la vela
- 88. #72 — Empaque
- 89. #73 — Encendido final

**J8 · Resultado y receta**

- 90. #41 — Animación de la reacción del cliente
- 91. #74 — Estrellas del score
- 92. #101 — Confeti de 5 estrellas
- 93. #75 — Puntaje count-up
- 94. #76 — Recibo del score
- 95. #100 — Guardar receta: bookmark/fly
- 96. #99 — Logro desbloqueado
- 97. #77 — Receta en cascada
- 98. #78 — CTA de WhatsApp
- 99. #79 — Cambio de pedido
- 100. #80 — Fin del día

**J9 · Ambiente y audio**

- 101. #81 — Luz ambiental por estación
- 102. #82 — Parallax del taller
- 103. #83 — Partículas ambientales
- 104. #103 — Ambiente sonoro del taller
- 105. #104 — Sonidos de UI
- 106. #105 — Sonidos de gestos
- 107. #106 — Sonido de celebración

### Fase 6 · Cierre

- 108. #88 — Tutorial contextual de primer uso
- 109. #108 — Baseline visual y diff de capturas del juego
