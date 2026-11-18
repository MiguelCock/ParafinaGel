# Diseño del juego 2D

La implementación actual es la versión 2.0: cuatro briefs, diseñador de velas, taller con mini-juegos, sandbox y receta de insumos.

## Escenario

- Taller ilustrado en SVG/CSS con estantes, ventana, lámpara, mostrador y plantas.
- Vista general con hotspots para moverse a cada estación.
- Escenas de papel por estación; cámara fija y crossfade.
- El cliente aparece en el mostrador, en el ticket y en la escena de brief.

## Pantallas

| Pantalla | Contenido | Acción |
|---|---|---|
| Inicio | Promesa, duración, modo guiado y modo libre | Jugar pedidos / Modo libre |
| Mostrador | Retrato, diálogo progresivo, notas y progreso | Continuar / Mostrar todo / Crear nota |
| Diseño | Tipo, cera, tamaño, forma, colores, aroma, mecha y etiqueta | Ir al taller / Ver receta (sandbox) |
| Cera | Olla, temperatura, rango y removidos | Calentar, remover, continuar |
| Vertido | Unidad actual, meta, jarra y lista de capas/partes | Verter, terminar, esperar película |
| Mecha | Vista superior y pad de flechas | Centrar y colocar |
| Curado | Repisa, ventilador, timer y burbujas de gel | Abanicar, quitar burbujas |
| Acabado | Etiqueta x/y/giro, corte de mecha, tapa y empaque | Aplicar, cortar, cerrar y entregar |
| Score | Puntos, estrellas, desglose, receta e insumos | WhatsApp / siguiente cliente |
| Fin del día | Pedidos, puntos, estrellas y promedio | Jugar otra vez / Modo libre |

## Reglas

- Feedback inmediato y positivo; un paso mal hecho se corrige, no termina la partida.
- Puntaje por precisión y por cumplir el brief, no por velocidad.
- El brief se revela poco a poco; la nota final queda visible en un `<details>`.
- El jugador puede revisar estaciones anteriores, pero no editarlas.
- Textos en español de Colombia, frases cortas.
- La vela se enciende solo en el resultado visual; no simules fuego real.
- Nada de precios ni propinas: el negocio vende insumos.

## Puntaje

Diseño (60):

- Tipo 10, cera 8, forma 8, aroma 10, color/montajes 14, mecha 5, etiqueta 5.

Taller (40):

- Temperatura 8, vertido 12, mecha 8, etiqueta 4, corte 3, gel 5.

Estrellas: ≥90 = 5, ≥75 = 4, ≥55 = 3, ≥35 = 2, resto 1.
Puntos = total + estrellas × 10.

## Mini-juegos

- **Mecha**: vista superior; flechas de 4 px. Éxito = distancia al centro. `wickAccuracy`.
- **Etiqueta**: ejes x/y y giro; guía visual. `labelAccuracy` combina los tres desvíos.
- **Corte**: rango de 2–12 mm; objetivo placeholder 5 mm. `trimAccuracy`.
- **Burbujas**: cinco burbujas de gel; cada clic suma. El puntaje de gel es proporcional.

## Receta

- Cera: 90% del tamaño en gramos, redondeado a 5 g.
- Aroma: 8% del peso de cera en ml.
- Colorante: 4 gotas por color único.
- Mecha: 1 unidad (2 si es doble).
- Recipiente o molde, montajes, etiqueta, tapa y empaque.
- Herramientas: termómetro y jarra.
- El mensaje de WhatsApp incluye resumen del diseño y lista de insumos.

## Datos que faltan

- Catálogo real de insumos, precios y disponibilidad.
- Ceras que usa el negocio y temperaturas reales.
- Rangos de mecha por diámetro y medida de corte.
- Aromas, colorantes, moldes y recipientes disponibles.
- Tiempos reales de curado.
- Voz del dueño para los textos (tú/usted, tono).
- Referencias visuales para el arte final.

Pregunta antes de publicar; no inventes cifras.
