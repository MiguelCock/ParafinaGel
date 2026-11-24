# Inventario de datos: validados y placeholder

Auditoría del **24 de noviembre de 2026** para separar lo que ya confirmó el
negocio de lo que sigue siendo ejemplo del juego.

- **Issue:** [#87](https://github.com/MiguelCock/ParafinaGel/issues/87)
- **Dependen de esta auditoría:** #90, #110, #111, #112, #114, #89.
- **Fuente oficial de precios:** lista de venta del negocio, cargada en
  `src/content/productos/`.
- **Fuente de proceso:** notas de la clase de fabricación y del curso de gel,
  resumidas en [`proceso-de-fabricacion.md`](proceso-de-fabricacion.md).

## Cómo leer y aprobar

Cada fila tiene un código (`CAT`, `CER`, `PRO`, `SEG`). Para aprobar o corregir:

1. Responder en [#87](https://github.com/MiguelCock/ParafinaGel/issues/87) con
   el código y el valor validado.
2. Indicar la fuente (lista, clase, prueba o decisión del negocio).
3. Actualizar este documento y cambiar el estado a **Validado** con fecha.

No cambiar un estado a **Validado** sin una fuente. Los valores **Placeholder**
pueden verse en la UI, pero deben seguir marcados como ejemplo.

| Estado          | Significado                                                  |
| --------------- | ------------------------------------------------------------ |
| **Oficial**     | Precio o referencia tomada de la lista de venta del negocio. |
| **Notas**       | Dato de la clase o del curso, todavía sin medición formal.   |
| **Placeholder** | Valor de ejemplo del juego; no es un dato técnico real.      |
| **Pendiente**   | Falta el dato; bloquea una parte del proceso o del catálogo. |

### Qué bloquea cada bloque

| Bloque de datos               | Issues que dependen        |
| ----------------------------- | -------------------------- |
| Precios, unidades y catálogo  | #90 (epic #6)              |
| Ceras, temperaturas y tiempos | #110, #114 (epics #6 y #9) |
| Ácido esteárico y corte       | #110, #90                  |
| Aromas, colores y mezcla      | #111, #90                  |
| Vertido, curado y sostenedor  | #112, #114                 |
| Pabilos, envases y medidas    | #90, #114                  |
| Briefs y dificultad           | #89 (epic #9)              |

## 1. Catálogo y precios

Precios de venta en **COP enteros**. No se registran costos, márgenes ni
proveedores.

| Código | Producto                         | Precio | Unidad | Estado      |
| ------ | -------------------------------- | -----: | ------ | ----------- |
| CAT-01 | Cera vaso                        | 15.500 | kg     | **Oficial** |
| CAT-02 | Cera soya APF                    | 21.500 | kg     | **Oficial** |
| CAT-03 | Cera soya BPF                    | 21.500 | kg     | **Oficial** |
| CAT-04 | Cera coco                        | 26.000 | kg     | **Oficial** |
| CAT-05 | Cera palma                       | 12.000 | kg     | **Oficial** |
| CAT-06 | Cera molde                       | 19.000 | kg     | **Oficial** |
| CAT-07 | Parafina desmoldable             | 25.000 | pote   | **Oficial** |
| CAT-08 | Parafina china                   |  8.800 | kg     | **Oficial** |
| CAT-09 | Parafina Ecopetrol               |  8.300 | kg     | **Oficial** |
| CAT-10 | Parafina gel                     | 20.000 | pote   | **Oficial** |
| CAT-11 | Cera masaje premium              | 31.500 | kg     | **Oficial** |
| CAT-12 | Ácido esteárico                  | 14.500 | kg     | **Oficial** |
| CAT-13 | Pabilo parafinado 65 cm · 3 cm   |    700 | unidad | **Oficial** |
| CAT-14 | Pabilo parafinado 65 cm · 4–5 cm |    700 | unidad | **Oficial** |
| CAT-15 | Pabilo parafinado 65 cm · 6–7 cm |    700 | unidad | **Oficial** |
| CAT-16 | Aceite cristal 250 ml            |  3.500 | unidad | **Oficial** |

**Pendiente de catálogo:** envases, aromas, colorantes, moldes, etiquetas,
montajes, tapas y empaques no están en la lista oficial. Hoy el juego usa
nombres y precios de ejemplo; no deben publicarse como oferta real.

**Observación CAT-12:** el precio es por kg y la receta del juego usa gramos.
La cantidad es correcta, pero el precio unitario no se muestra en la receta.

## 2. Ceras y proceso de fusión

Rangos, tiempos y velocidades son ejemplos del motor. La UI los usa para el
reto de temperatura; no son una tabla técnica validada.

| Código | Cera                 | Formato | Rango de fusión | Curado | Aroma  | Estado          |
| ------ | -------------------- | ------- | --------------- | ------ | ------ | --------------- |
| CER-01 | Cera vaso            | Escamas | 48–58 °C        | 8 s    | 8–10 % | **Placeholder** |
| CER-02 | Cera soya APF        | Escamas | 52–62 °C        | 8 s    | 8–10 % | **Placeholder** |
| CER-03 | Cera soya BPF        | Escamas | 52–62 °C        | 8 s    | 8–10 % | **Placeholder** |
| CER-04 | Cera coco            | Escamas | 48–58 °C        | 8 s    | 8–10 % | **Placeholder** |
| CER-05 | Cera palma           | Escamas | 50–60 °C        | 7 s    | 8–10 % | **Placeholder** |
| CER-06 | Cera molde           | Bloque  | 56–66 °C        | 7 s    | 8–10 % | **Placeholder** |
| CER-07 | Parafina desmoldable | Bloque  | 56–66 °C        | 7 s    | 8–10 % | **Placeholder** |
| CER-08 | Parafina china       | Bloque  | 56–66 °C        | 7 s    | 8–10 % | **Placeholder** |
| CER-09 | Parafina Ecopetrol   | Bloque  | 56–66 °C        | 7 s    | 8–10 % | **Placeholder** |
| CER-10 | Parafina gel         | Gel     | 65–80 °C        | 9 s    | 3–6 %  | **Placeholder** |

- **CER-11 · Dosis de aroma:** 8–10 % para ceras de recipiente y 3–6 % para
  gel, tomado de las notas. **Pendiente:** confirmar si es por peso o volumen y
  la temperatura de incorporación.
- **CER-12 · Ácido esteárico:** el juego usa **10 % de ejemplo** solo en
  parafinas en bloque. **Pendiente:** porcentaje real y compatibilidad con soya
  y gel [CAT-12].
- **CER-13 · Tiempo de fusión:** el juego acelera la fusión con 2–4 cortes. Es
  una mecánica de juego, no un tiempo real de laboratorio.
- **CER-14 · Atributos internos:** `heatRate` 8–10 y `coolTime` 7–9 s son
  constantes de juego. No representan minutos reales de curado.

## 3. Corte, vertido y acabado

| Código | Dato                        | Valor actual                               | Estado          |
| ------ | --------------------------- | ------------------------------------------ | --------------- |
| PRO-01 | Corte de parafina en bloque | 2 cortes mínimo, 4 máximo                  | **Placeholder** |
| PRO-02 | Efecto del tamaño del trozo | 2 cortes = 0,8× velocidad; 4 cortes = 1,0× | **Placeholder** |
| PRO-03 | Temperatura de vertido      | 88 °C objetivo                             | **Placeholder** |
| PRO-04 | Inicio de temperatura       | 20 °C                                      | **Placeholder** |
| PRO-05 | Sobrecalentamiento          | `meltMax + 12 °C`                          | **Placeholder** |
| PRO-06 | Película entre capas        | 1,6 s                                      | **Placeholder** |
| PRO-07 | Corte de mecha              | 5 mm objetivo; rango 2–12 mm               | **Placeholder** |
| PRO-08 | Corte de mecha en gel       | 10–15 mm según el curso                    | **Notas**       |
| PRO-09 | Carga de cera por tamaño    | 180 g → 165 g; 250 g → 225 g (90 %)        | **Placeholder** |
| PRO-10 | Cantidad de estearina       | 10 % de la cera; 15 g o 25 g según tamaño  | **Placeholder** |

**Conflicto PRO-07/PRO-08:** el juego corta a 5 mm, pero el curso de gel indica
1–1,5 cm. Falta decidir si el corte depende del tipo de vela. Bloquea #90 y
#114.

### 3.1 Mezcla y dosificación

| Código | Dato                       | Valor actual                                                  | Estado          |
| ------ | -------------------------- | ------------------------------------------------------------- | --------------- |
| MIX-01 | Fogones por vela           | 1 por capa o parte del molde; máximo 4                        | **Placeholder** |
| MIX-02 | Color por gotas            | `max(1, round(gramos / 60))`; el colorante es concentrado     | **Placeholder** |
| MIX-03 | Aroma manual               | 8–10 % en recipiente; 3–6 % en gel, dosificado en ml          | **Placeholder** |
| MIX-04 | Aroma por fogón            | Un aroma por fogón; hasta 4 aromas elegidos en el diseño      | **Placeholder** |
| MIX-05 | Palanca de calor por fogón | Cada fogón empieza 6 °C bajo el mínimo y sube hasta el máximo | **Placeholder** |
| MIX-06 | Receta por lote            | Aroma y gotas de color se reparten entre los fogones          | **Placeholder** |

**Pendiente MIX-03:** confirmar si el aroma se mide por peso o volumen, la
temperatura de incorporación y la equivalencia de las gotas de colorante.
Bloquea #111, #90 y #114.

## 4. Envases, moldes y materiales sin lista oficial

| Código | Material                 | Valores actuales                                               | Estado          |
| ------ | ------------------------ | -------------------------------------------------------------- | --------------- |
| ENV-01 | Frasco ámbar             | 250 g · 70 mm de diámetro                                      | **Placeholder** |
| ENV-02 | Frasco claro             | 220 g · 65 mm                                                  | **Placeholder** |
| ENV-03 | Vaso de cristal          | 260 g · 70 mm                                                  | **Placeholder** |
| ENV-04 | Lata de metal            | 200 g · 65 mm                                                  | **Placeholder** |
| ENV-05 | Tarro de cerámica        | 220 g · 70 mm                                                  | **Placeholder** |
| ENV-06 | Moldes                   | Corazón, luna, flor y osito; 1–3 partes                        | **Placeholder** |
| ENV-07 | Etiquetas                | Clásica, regalo y minimal                                      | **Placeholder** |
| ENV-08 | Aromas                   | Lavanda, vainilla, café, cítricos, rosas y madera              | **Placeholder** |
| ENV-09 | Colorantes               | Natural, crema, salvia, ámbar, rosa, terracota, azul y grafito | **Placeholder** |
| ENV-10 | Montajes de gel          | Flores secas, brillo, cuentas y hierbas                        | **Placeholder** |
| ENV-11 | Precios de ENV-01–ENV-10 | Sin precio; la UI muestra “Precio por confirmar”               | **Pendiente**   |

**Pabilos:** los tres productos y sus precios son oficiales (CAT-13–CAT-15),
pero la correspondencia **cera + diámetro + tipo de pabilo** sigue pendiente.
El juego solo habilita los pabilos que caben en el diámetro del envase; con los
envases actuales, el pabilo de 3 cm y el de 4–5 cm quedan deshabilitados.

## 5. Seguridad y combustión

Checklist para revisar con el negocio antes de publicar datos como reales:

- [ ] **SEG-01** Temperatura segura del baño maría y límite de
      sobrecalentamiento.
- [ ] **SEG-02** Uso de termómetro, guantes y protección térmica.
- [ ] **SEG-03** Ventilación del espacio y superficies de trabajo.
- [ ] **SEG-04** Prohibición de agregar agua a la cera caliente.
- [ ] **SEG-05** Estabilidad de montajes en gel; materiales no inflamables.
- [ ] **SEG-06** Compatibilidad envase–cera–pabilo y primera quemada.
- [ ] **SEG-07** Tiempo de curado antes de encender.
- [ ] **SEG-08** Advertencias de uso para velas de gel y figuras.

## 6. Qué sigue siendo placeholder en la UI

- Temperaturas, tiempos de curado y velocidad de fusión de las 10 ceras.
- Carga de aroma (8–10 % / 3–6 %) y su unidad.
- Gotas reales de colorante por peso de cera y temperatura de mezcla.
- Reparto de aromas y colores entre los fogones de cada capa o parte.
- Porcentaje de ácido esteárico y su aplicación a soya o gel.
- Capacidades y diámetros de envases, medidas de moldes y etiquetas.
- Nombres y precios de envases, aromas, colorantes, moldes, etiquetas,
  montajes, tapas y empaques.
- Objetivo de corte de mecha y tabla de pabilos por diámetro.
- Las cantidades de receta (90 % del tamaño y dosis de estearina).
- Las 4 historias, clientes y briefs son de ejemplo; no son pedidos reales.

## 7. Datos ya confirmados

- La parafina en bloque se corta antes de derretir.
- El ácido esteárico aporta dureza.
- El color se integra revolviendo.
- El aroma de recipiente se usa entre 8 y 10 %; el de gel, entre 3 y 6 %.
- El pabilo se elige por el diámetro del envase.
- El sostenedor de madera no es el pabilo y se retira después del curado.
- Se usan porta pabilo y sostenedor.
- Los envases pueden ser lata, cerámica o vidrio.
- Las velas terminadas pueden formar parte de una colección.

## 8. Registro de aprobación

| Fecha      | Código | Valor aprobado                                       | Fuente | Aprobado por |
| ---------- | ------ | ---------------------------------------------------- | ------ | ------------ |
| 2026-11-24 | —      | Auditoría inicial; sin aprobaciones técnicas todavía | —      | —            |

Las aprobaciones se agregan aquí y en el issue #87. Mientras una fila no tenga
aprobación, su estado sigue siendo **Placeholder** o **Pendiente**.
