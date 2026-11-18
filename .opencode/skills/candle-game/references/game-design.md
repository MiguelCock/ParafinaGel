# Diseño del juego 2D

La implementación actual es un vertical slice 2D de 3 pedidos. Este documento sirve como referencia para ampliarlo sin romper el flujo.

## Escenario

- Taller ilustrado en SVG/CSS con estantes, ventana, lámpara, mostrador y plantas.
- Vista general con hotspots para moverse a cada estación.
- Escenas de papel por estación; la cámara es fija y el cambio es un crossfade.
- El cliente aparece en el mostrador y en el ticket; no hace falta que esté en todas las escenas.

## Pantallas actuales

| Pantalla | Contenido | Acción |
|---|---|---|
| Inicio | Promesa, duración e instrucciones | Empezar |
| Mostrador | Retrato, saludo, ticket | Tomar pedido |
| Cera | Olla, temperatura, aroma y color | Calentar, elegir, remover 3 veces |
| Vertido | Frasco, jarra, meta y nivel | Elegir frasco y verter |
| Enfriado | Repisa, ventilador y timer | Abanicar |
| Acabado | Mecha, etiqueta, tapa y empaque | Completar y entregar |
| Score | Puntos, estrellas, propina y producto | Siguiente cliente |
| Fin del día | Ventas, propinas, estrellas | Jugar otra vez |

## Reglas

- Feedback inmediato y positivo; un paso mal hecho se corrige, no termina la partida.
- Puntaje por precisión y orden, no por velocidad.
- La temperatura se registra al entrar en el rango; el enfriado es simbólico.
- El jugador puede revisar estaciones anteriores; la estación activa manda.
- Textos en español de Colombia, frases cortas.
- La vela se enciende solo en el resultado visual; no simules fuego real.

## Puntaje

- Aroma 25, color 20, frasco 10, etiqueta 10.
- Temperatura 10 (registrada), vertido 15, acabado 10.
- Total 100; estrellas 5/4/3/2/1.
- Propina según puntaje y bonus de 5 estrellas.

## UI

- Ticket de papel con cinta y sello “Ejemplo”.
- Barra de progreso de 5 estaciones y tabs con iconos/checks.
- Medidores de temperatura/vertido y recibos para score/cierre.
- Panel lateral en desktop; stack en móvil; un CTA principal por paso.

## Fase 2: “Crear mi vela”

- Modo libre sin timer: elegir cera, aroma, color, frasco, etiqueta y acabado.
- Tarjeta compartible con la combinación y CTA a WhatsApp.
- Guardar creaciones en `localStorage`.
- Posibilidad de usar retratos/escenas AI o arte final en `CustomerPortrait`/escenario.

## Datos que faltan

- Tipo de cera que usa el negocio y temperaturas reales.
- Aromas, frascos y productos disponibles.
- Duración real del curado.
- Voz del dueño para los textos (tú/usted, tono).
- Referencias visuales para el arte final.

Pregunta antes de publicar; no inventes cifras.
