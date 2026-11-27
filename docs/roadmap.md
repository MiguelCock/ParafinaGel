# Ruta directa · Rediseño 2026

Fuente operativa: [issue #124](https://github.com/MiguelCock/ParafinaGel/issues/124), [épica #125](https://github.com/MiguelCock/ParafinaGel/issues/125) y el [tablero](https://github.com/users/MiguelCock/projects/6).

La ruta de 109 pasos de 2.2 quedó como **backlog de referencia**. La cola activa es el rediseño: fluido lateral, taller físico, estantería DOM sobre Pixi y vertical slice clásica.

## Fase D · Diseño y prototipo

- [x] **#141** · North Star, referencias y wireframes
- [x] **#142** · Skills y prácticas para agentes
- [x] **#143** · Organización del código y layout compartido
- [ ] **#144** · Laboratorio de fluido lateral
- [ ] **#145** · Vertical slice clásica

## Fase R · Construcción

- [x] **#126** · R-01 Motor de fluido celular lateral
- [x] **#127** · R-02 Renderer Pixi del fluido
- [ ] **#128** · R-03 Cera lateral con fogón y perilla
- [x] **#129** · R-04 Arte del fogón lateral
- [ ] **#130** · R-05 Mezcla lateral con varios fogones
- [ ] **#131** · R-06 Dosificación visible de color y aroma
- [ ] **#132** · R-07 Vertido lateral con inclinación por centro
- [ ] **#133** · R-08 Curado en repisa larga
- [ ] **#134** · R-09 Gel lateral y transparencia
- [ ] **#135** · R-10 Taller físico: estanterías y arrastre
- [ ] **#136** · R-11 Acabado con moños y stickers
- [ ] **#137** · R-12 Tapa desde vista aérea
- [ ] **#138** · R-13 Corte de mecha en preparación
- [ ] **#139** · R-14 Datos, receta, briefs y scoring
- [ ] **#140** · R-15 QA, tutorial, baseline y migración

## Documentos de diseño

- [`game-design.md`](game-design.md): fantasía, pilares, loop, estaciones y criterios de “se siente bien”.
- [`references.md`](references.md): Dressmaker, Noita, Sandspiel, Potion Craft, Unpacking y más.
- [`architecture.md`](architecture.md): capas, DOM/Pixi y riesgos de `game-state`.
- [`sketches/`](sketches/): wireframes y storyboards.
- [`adr/`](adr/): decisiones de fluido, DOM sobre Pixi y vertical slice.

## Regla de avance

1. Diseño y prototipo primero.
2. Una vertical slice clásica completa antes de capas, figura y gel.
3. No abrir una estación nueva sin referencia, wireframe y gesto definido.
4. WIP máximo 2.
5. No cerrar datos sin #87.
6. QA rápido por issue, QA completo por hito.

## Legado

Las fases 0–6 y sus issues siguen en el repositorio y en el tablero como referencia. Tienen el bloque **“Rediseño 2026 · Fase R”** al inicio. Las marcadas `superseded` no se implementan sin reescribir. #140 decide el cierre final de ese legado.
