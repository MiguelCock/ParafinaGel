# Diseño del juego

La implementación actual es un prototipo de 4 pasos. Este documento sirve como referencia para ampliarlo sin romper el flujo.

## Pantallas actuales

| Pantalla | Contenido | Acción |
|---|---|---|
| Inicio | Promesa, duración, pasos y mejor resumen | Empezar |
| Elegir | Hasta 4 productos reales con nombre y aromas | Seleccionar + continuar |
| Preparar | Instrucción de derretir y tip | Remover 3 veces |
| Verter | Instrucción de vertido y tip | Verter 2 veces |
| Curar | Instrucción de reposo y tip | Esperar 3 veces |
| Resultado | Vela lograda, producto recomendado y CTA | Ver producto / jugar de nuevo |

El visual de la vela cambia de color según el primer aroma y sube el nivel de cera en cada paso. La llama aparece al final.

## Reglas

- Feedback inmediato y positivo; un paso mal hecho se corrige, no termina la partida.
- Puntaje por precisión y orden, no por velocidad (evita frustración en móvil).
- El temporizador de curado es simbólico; aclara que en la vida real toma días.
- Máximo 3 intentos por paso antes de mostrar la respuesta.
- Textos en español de Colombia, frases cortas.
- La vela se enciende solo en el resultado; no simules fuego real.

## Copy de ejemplo

- Inicio: "Haz tu primera vela, paso a paso."
- Preparar: "Derrite la cera a baño maría. Remueve despacio para que no se queme."
- Verter: "Vierte despacio por el centro del frasco."
- Curar: "Deja curar la vela varios días antes de encenderla."
- Resultado: "¡Tu vela está lista! Esta es la que probaste: [producto]."

## Datos que faltan

- Tipo de cera que usa el negocio y temperaturas reales.
- Aromas y productos disponibles.
- Duración real del curado.
- Voz del dueño para los textos (tú/usted, tono).

Pregunta antes de publicar; no inventes cifras.
