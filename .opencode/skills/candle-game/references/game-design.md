# Diseño del juego

La implementación actual es un vertical slice 3D de 3 pedidos. Este documento sirve como referencia para ampliarlo sin romper el flujo.

## Escena 3D

- Diorama cozy de un solo taller con cámara fija.
- Estaciones físicas: mostrador, mesa de cera, mesa de vertido, repisa de enfriado y mesa de acabado.
- La cámara hace transiciones suaves a cada estación; con movimiento reducido, corta directo.
- El cliente aparece en el mostrador y se oculta en las estaciones de trabajo para no tapar la acción.
- El blockout usa primitivas; los modelos finales serán GLB optimizados.

## Pantallas actuales

| Pantalla | Contenido | Acción |
|---|---|---|
| Inicio | Promesa, duración y resumen | Empezar |
| Mostrador | Cliente, ticket y saludo | Tomar pedido |
| Cera | Olla, temperatura, aroma y color | Calentar, elegir, remover 3 veces |
| Vertido | Frasco, jarra y nivel | Elegir frasco y verter |
| Enfriado | Repisa, ventilador y timer | Abanicar |
| Acabado | Mecha, etiqueta, tapa y empaque | Completar y entregar |
| Score | Puntos, estrellas, propina y producto | Siguiente cliente |
| Fin del día | Ventas, propinas y estrellas | Jugar otra vez |

## Reglas

- Feedback inmediato y positivo; un paso mal hecho se corrige, no termina la partida.
- Puntaje por precisión y orden, no por velocidad.
- La temperatura se registra al entrar en el rango; el enfriado es simbólico.
- El jugador puede revisar estaciones anteriores; la estación activa manda.
- Textos en español de Colombia, frases cortas.
- La vela se enciende solo en el resultado/visualización; no simules fuego real.

## Puntaje

- Aroma 25, color 20, frasco 10, etiqueta 10.
- Temperatura 10 (registrada), vertido 15, acabado 10.
- Total 100; estrellas 5/4/3/2/1.
- Propina según puntaje y bonus de 5 estrellas.

## Fase 2: “Crear mi vela”

- Modo libre sin timer: elegir cera, aroma, color, frasco, etiqueta y acabado.
- Captura del render 3D y tarjeta compartible con el nombre de la combinación.
- CTA a WhatsApp con la combinación elegida.
- Guardar creaciones en `localStorage`.

## Datos que faltan

- Tipo de cera que usa el negocio y temperaturas reales.
- Aromas, frascos y productos disponibles.
- Duración real del curado.
- Voz del dueño para los textos (tú/usted, tono).
- Referencias visuales para el arte 3D final.

Pregunta antes de publicar; no inventes cifras.
