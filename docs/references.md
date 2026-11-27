# Referencias · qué tomamos y qué evitamos

Referencias de ritmo, manipulación y lectura de materiales para el rediseño del taller. **Este documento no incluye imágenes, capturas, audio ni assets con copyright**: solo enlaces y notas. Ninguna referencia se copia en arte, UI, narrativa, nombres o sonidos.

## Matriz rápida

| Referencia               | Tomar                                                                                                    | Evitar                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Dressmaker**           | Elegir material, cortar, ensamblar, decorar y entregar a un cliente; pasos manuales con objetos físicos. | Copiar arte, UI, narrativa o el minijuego de costura.          |
| **Noita**                | Autómata celular, densidades, reacciones legibles y sensación emergente.                                 | Pixel art, caos letal, estructura roguelike y sistemas opacos. |
| **Sandspiel**            | Grid pequeño, rendimiento web, herramientas simples y causa-efecto inmediata.                            | Copiar UI o contenido; quedarse en un juguete sin receta.      |
| **Falling-sand**         | Grilla lateral, reglas locales y materiales que se leen por su comportamiento.                           | Prometer precisión física o simulación científica.             |
| **Potion Craft**         | Dosificación táctil, pedidos de clientes, experimentación y receta como recompensa.                      | Copiar estética de alquimia, mapa o árbol de recetas opaco.    |
| **Unpacking**            | Ritmo calmado, colocación de objetos, narrativa ambiental y audio doméstico.                             | Copiar historia, arte o estructura emocional.                  |
| **A Little to the Left** | Gestos de orden, varias soluciones válidas y feedback amable de “casi”.                                  | Convertirlo en puzzle puro o copiar gato/ilustración.          |
| **Wilmot's Warehouse**   | Estanterías, etiquetas, inventario físico y satisfacción de organizar.                                   | Alcance de simulador de almacén, presión de tiempo o grilla.   |

## 1. Dressmaker

**Enlace:** [Dressmaker en Steam](https://store.steampowered.com/app/4019220/Dressmaker/)

Juego de costura sobre elegir tela, cortar un patrón, ensamblar piezas, decorar y entregar una prenda a un cliente. Nos interesa la **secuencia física**: el objeto se prepara, se corta, se une y se presenta.

**Tomar**

- La idea de que el pedido del cliente se convierte en pasos manuales concretos.
- Elegir material, cortar, ensamblar y decorar como una cadena, no como un menú.
- La entrega al cliente como cierre emocional del objeto terminado.
- Herramientas que se sienten objetos: tijeras, patrón, tela, hilo.

**Evitar**

- Copiar arte, interfaz, narrativa, personajes o el minijuego de costura.
- Trasladar la simulación de tela a la cera: nuestro material es cera, no tela.
- Convertir cada paso en una animación larga sin decisión.

**En ParafinaGel:** el corte del bloque y de la mecha, el ensamblaje de capas o partes, la etiqueta/moño y la entrega con receta. Dressmaker es referencia de **ritmo y manipulación**, no de estética.

## 2. Noita

**Enlaces:** [Noita en Steam](https://store.steampowered.com/app/881100/Noita/) · [artículo sobre su simulación falling-sand](https://80.lv/articles/noita-a-game-based-on-falling-sand-simulation/)

Nos interesa cómo un mundo de píxeles se comporta como materia: densidades, líquidos que se desplazan, reacciones en cadena y reglas que el jugador aprende mirando.

**Tomar**

- El autómata celular como base de cera, gel, color y aroma.
- Densidades y viscosidades distintas por material.
- Reglas locales que producen resultados legibles, no aleatoriedad decorativa.
- La lección de rendimiento: grid pequeño, actualización acotada, dirty rects.

**Evitar**

- Pixel art como estilo visual. ParafinaGel es ilustrado, con bordes suaves.
- Copiar contenido, nombres, UI o arte de Noita.
- Caos letal, permadeath, roguelike o progresión por runs.
- Sistemas opacos que el jugador no puede leer sin una wiki.
- Miles de partículas o materiales que rompan el presupuesto de motion.

**En ParafinaGel:** `fluid.ts` es un autómata lateral pequeño inspirado en este género, no una copia. La olla usa una grilla de 48×26 y el render suaviza el resultado.

## 3. Sandspiel

**Enlaces:** [Sandspiel](https://sandspiel.club/) · [cómo se hizo Sandspiel](https://maxbittker.com/making-sandspiel)

Un juguete de arena que se pinta con el puntero y reacciona al instante. La lección no es el contenido, sino la **inmediatez** y el rendimiento en web.

**Tomar**

- Herramientas simples: elegir materia y pintar/verter.
- Respuesta inmediata: el material cae, se mezcla o se acumula.
- Grid pequeño y textura como técnica de render.
- La idea de que el jugador experimente sin tutorial largo.

**Evitar**

- Copiar la UI, los materiales o la marca.
- Quedarse en un sandbox sin objetivo: aquí el objetivo es una receta.
- Lienzo infinito o lista enorme de materiales.
- Que la simulación tape la lectura del envase.

**En ParafinaGel:** la mano del jugador vierte cera y gotas en un recipiente acotado. El modo libre puede ser más juguetón, pero el modo guiado siempre vuelve al pedido y a la receta.

## 4. Falling-sand

**Enlace:** [Falling-sand game (Wikipedia)](https://en.wikipedia.org/wiki/Falling-sand_game)

Género de autómatas celulares donde la materia cae, se apila y reacciona. Es la base técnica y conceptual de `fluid.ts`.

**Tomar**

- Grilla lateral con reglas locales de movimiento.
- Materiales que se leen por densidad, viscosidad y color.
- La sensación de que el mundo está hecho de materia, no de sprites.
- Iteración barata: probar una regla y ver el resultado.

**Evitar**

- Prometer física realista o Navier–Stokes.
- Copiar el contenido, los nombres o la estética de un juego concreto.
- Listas interminables de materiales.
- Física que dependa de muchos frames y rompa el frame budget.

**En ParafinaGel:** el fluido es una herramienta de lectura, no el protagonista. La cera debe verse caer, mezclarse y asentarse; el jugador no necesita entender la ecuación.

## 5. Potion Craft

**Enlace:** [Potion Craft: Alchemist Simulator en Steam](https://store.steampowered.com/app/1210320/Potion_Craft_Alchemist_Simulator/)

Simulador de alquimia con herramientas táctiles, clientes y descubrimiento de recetas. Nos interesa la **dosificación** y la conversación entre pedido, experimento y resultado.

**Tomar**

- Herramientas físicas para dosificar: mortero, cucharón, frasco.
- Pedidos de clientes que admiten interpretación.
- La receta como documento que se descubre y se guarda.
- Feedback de causa-efecto: una gota cambia el color, una rama cambia el sabor.

**Evitar**

- Copiar la estética medieval, el mapa, la UI o los nombres.
- Un árbol de recetas opaco que obligue a prueba y error sin pistas.
- Grind, economía o gestión de tienda.
- Convertir la mezcla en una barra de progreso sin gesto.

**En ParafinaGel:** color gota a gota y aroma en chorrito; el panel muestra dosis y rango, pero la mano es la que dosifica. La receta final es el “libro” que el jugador se lleva.

## 6. Unpacking

**Enlace:** [Unpacking en Steam](https://store.steampowered.com/app/1135690/Unpacking/)

Juego sin diálogo sobre sacar objetos de cajas y colocarlos en una casa. La narrativa emerge de los objetos y del ritmo.

**Tomar**

- Ritmo calmado y sin castigo.
- Colocación de objetos con feedback físico: sombra, encaje, sonido.
- Narrativa ambiental: el taller cuenta quién vive ahí con objetos, no con texto.
- Audio como confirmación, no como decoración.

**Evitar**

- Copiar la historia, el arte pixelado o los personajes.
- Convertir ParafinaGel en un juego narrativo doméstico.
- Un modo “sin objetivo” que reemplace la receta.
- Tiempos muertos largos por animaciones.

**En ParafinaGel:** la estantería, la mesa y la repisa se sienten como un espacio habitado. El cliente y el taller tienen memoria visual, pero el foco sigue siendo fabricar.

## 7. A Little to the Left

**Enlace:** [A Little to the Left en Steam](https://store.steampowered.com/app/1629520/A_Little_to_the_Left/)

Puzzle de ordenar objetos cotidianos. La gracia está en la **sensación de “quedó bien”** y en admitir varias soluciones válidas.

**Tomar**

- Gestos de orden: alinear, apilar, centrar, girar.
- Tolerancias amables: el juego reconoce cuando algo está “casi”.
- Varias soluciones válidas cuando el brief lo permite.
- Feedback visual y sonoro de encaje, sin números.

**Evitar**

- Copiar el gato, la ilustración o la estructura de niveles.
- Convertir cada estación en un puzzle arbitrario de solución única.
- Reglas ocultas que frustren sin pista.
- Exceso de pasos para una acción simple.

**En ParafinaGel:** centrar la mecha, alinear la etiqueta, girar el tirador y poner la tapa. La tolerancia se comunica con guías y badges; el error no bloquea.

## 8. Wilmot's Warehouse

**Enlace:** [Wilmot's Warehouse en Steam](https://store.steampowered.com/app/839870/Wilmots_Warehouse/)

Juego de organizar cajas y etiquetas en un almacén. Nos interesa la **satisfacción de clasificar** y la relación física entre objeto, etiqueta y lugar.

**Tomar**

- Estanterías y etiquetas como sistema de memoria.
- Inventario físico: los objetos ocupan un lugar y se pueden tomar.
- La satisfacción de ordenar y encontrar.
- Un tono cozy, sin violencia.

**Evitar**

- Copiar la grilla, el personaje o la UI.
- Alcance de simulador de almacén: stock, pedidos, empleados.
- Presión de tiempo o gestión de recursos.
- Convertir la estantería en una tabla de datos.

**En ParafinaGel:** la estantería de materiales y la lista de insumos. La versión DOM accesible no es un fallback menor: es la misma estantería para teclado y lector de pantalla.

## Reglas de uso

1. **Solo mecánicas y sensaciones.** Nada de arte, UI, narrativa, audio, nombres o personajes de las referencias.
2. **Sin imágenes con copyright.** Este documento solo enlaza; no incrusta capturas ni assets.
3. **La accesibilidad gana.** Si una referencia sugiere un gesto que no tiene equivalente de teclado o reduced, se adapta o se descarta.
4. **Los datos reales ganan.** Ninguna referencia justifica inventar temperaturas, dosis, tiempos o precios.
5. **La receta es el norte.** Si una inspiración no acerca al jugador a entender los insumos, es decoración y se recorta.
6. **Verificar enlaces antes de publicar.** Las URLs pueden cambiar; la fuente de verdad es este archivo.
