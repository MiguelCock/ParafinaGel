# Proceso de fabricación

Notas tomadas de la clase de fabricación de velas del taller familiar. Son la
base para ordenar las estaciones del juego y para validar datos con el negocio.

## Orden real del proceso

1. **Elegir envase y pabilo**
   - El envase puede ser vidrio, lata o cerámica.
   - El tipo de pabilo se elige según el diámetro del envase.
   - El pabilo se fija con un **porta pabilo** (base metálica).
   - Se usa un **sostenedor de madera** para mantener el pabilo centrado.
2. **Preparar la cera**
   - La parafina llega en bloques: cortarla en pedazos antes de derretir.
   - Derretir en baño maría y controlar la temperatura.
   - Agregar **ácido esteárico** para dar dureza a la vela.
3. **Agregar color**
   - Añadir el colorante a la cera derretida.
   - Revolver hasta que el color quede uniforme; la mezcla debe verse.
4. **Agregar aroma**
   - El aroma se usa en un porcentaje de **8–10 %**.
   - Revolver con cuidado para integrarlo sin perder intensidad.
5. **Verter**
   - Verter la cera en el envase con el pabilo ya preparado.
   - El sostenedor se queda durante el vertido y el curado.
6. **Curar y acabar**
   - Retirar el sostenedor cuando la vela esté firme.
   - Cortar la mecha, etiquetar, tapar y empacar.
7. **Guardar la vela**
   - Cada vela terminada puede sumarse a un muro de colección.

## Correspondencia con el juego

| Proceso real                          | Estación actual o propuesta |
| ------------------------------------- | --------------------------- |
| Elegir envase y pabilo                | Diseño + Preparación        |
| Porta pabilo y sostenedor             | Preparación                 |
| Cortar y derretir parafina            | Cera                        |
| Ácido esteárico                       | Cera / mezcla               |
| Colorante y mezcla                    | Mezcla                      |
| Aroma 8–10 %                          | Mezcla                      |
| Verter                                | Vertido                     |
| Curar y retirar sostenedor            | Curado                      |
| Cortar mecha, etiqueta, tapa, empaque | Acabado                     |
| Muro de velas                         | Colección                   |

Flujo objetivo:

```text
brief → diseño → preparación → cera → mezcla → vertido → curado → acabado → score/colección
```

## Datos confirmados por las notas

- La parafina en bloque se corta antes de derretir.
- El color se integra revolviendo.
- El pabilo se elige por el diámetro del envase.
- El sostenedor de madera no es el pabilo.
- Se usa porta pabilo y sostenedor.
- El ácido esteárico endurece la vela.
- Los envases pueden ser lata, cerámica o vidrio.
- El aroma se usa entre 8 y 10 %.
- Las velas terminadas pueden formar parte de una colección.

## Datos del curso de gel

El PDF del curso aporta datos específicos para velas de gel:

- **Aroma:** 3–6 % (distinto del 8–10 % de las ceras de recipiente).
- **Corte de mecha:** 1–1,5 cm.
- **Orden:** preparar recipiente → colocar mecha al fondo → decorar → trocear/fundir gel → aromatizar y colorear → verter → enfriar → cortar mecha → empacar.
- **Medición:** peso del agua en el recipiente o volumen del cilindro.
- **Seguridad:** cera caliente, guantes, protección térmica, papel periódico, ventilación y limpieza sin agua.
- **Materiales:** pabilos, porta pabilos, centradores, recipientes, esencias, colorantes a la grasa, decoraciones no inflamables, arena, piedritas, flores secas, cuarzo y conchas.

El juego debe usar una **carga de aroma por cera** y un **corte de mecha por cera**, no un único porcentaje global.

## Catálogo oficial

La lista oficial de venta tiene 16 productos:

- 10 ceras/parafinas: vaso, soya APF, soya BPF, coco, palma, molde, desmoldable, china, Ecopetrol y gel.
- Ácido esteárico.
- 3 pabilos parafinados de 65 cm para recipientes de 3, 4–5 y 6–7 cm.
- Aceite cristal 250 ml.

Los precios de venta se cargan en `src/content/productos/`. No se incluyen costos, márgenes ni datos de proveedores.

## Datos pendientes de validar

- Porcentaje de ácido esteárico y si se usa en todas las ceras.
- Si el 8–10 % de aroma es por peso o por volumen.
- Temperatura para agregar color y aroma.
- Tabla real de pabilos por diámetro y tipo de cera.
- Capacidades y diámetros de latas, cerámicas y vidrios.
- Tiempos de curado y temperaturas reales.
- Proceso de velas por capas: ¿un lote por capa o un solo lote?
- Seguridad: baño maría, ventilación, superficies y manejo de cera caliente.

## Nota para el juego

Los valores que no estén confirmados se mantienen como placeholders y deben
marcarse como tales. No inventar porcentajes, temperaturas ni medidas.

Implementación actual:

- El corte solo aparece para parafinas en bloque; soya en escamas y gel no lo
  muestran.
- El jugador puede dar de 2 a 4 cortes. Más cortes producen trozos más pequeños
  y aceleran la fusión; el mínimo permite continuar.
- El ácido esteárico se aplica solo a parafinas en bloque. La dosis usa un 10 %
  de ejemplo, marcado como “por confirmar” en la receta y en el proceso.
- No se aplica a soya ni gel hasta que el negocio confirme compatibilidad y dosis.
