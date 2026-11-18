---
name: Product catalog
description: Modelo de productos e insumos del catálogo de ParafinaGel: schema, precios COP, borradores, imágenes, copy en español y CTA de WhatsApp. Úsalo al agregar o editar productos, categorías o el catálogo.
---

# Catálogo de productos

## Dónde vive

- Contenido: `src/content/productos/<slug>.md`.
- Schema: `src/content.config.ts`.
- Consultas y formato: `src/lib/products.ts` y `src/lib/format.ts`.
- Contacto y WhatsApp: `src/config/site.ts` y `src/lib/whatsapp.ts`.
- Juego 2D: `src/lib/game/data.ts` (briefs, materiales y catálogo placeholder de insumos).
- Receta y lista de compras: `src/lib/game/supplies.ts`.
- Referencia de campos: `references/product-schema.md`.

## Reglas

- Un producto = un archivo de contenido; nunca hardcodees productos en componentes.
- Slugs en kebab-case, estables y únicos (`vela-lavanda-250g`). Cambiar un slug rompe links: agrega redirect.
- Precios en **pesos colombianos (COP)** como entero, sin decimales ni símbolo en el dato; el formato se aplica al mostrar (`$ 45.000`).
- Precio y `precioDesde` son opcionales. Si faltan, la UI muestra “Precio por confirmar”. No inventes precios.
- Los placeholders llevan `borrador: true`; el build de producción los excluye. Para verlos: `PUBLIC_SHOW_DRAFTS=true npm run build`.
- Categorías válidas hoy: `velas`, `difusores`, `accesorios`, `kits`. El catálogo se ordena velas → difusores → kits → accesorios. La migración a insumos (ceras, mechas, aromas, colorantes, moldes, recipientes) está pendiente: si se agregan, actualiza el enum del schema, `src/lib/products.ts`, el orden de categorías y el copy.
- Las imágenes son opcionales mientras no haya fotos; `ProductImage.astro` genera un placeholder SVG por categoría.
- Cada producto real debe tener al menos una imagen con `alt` descriptivo.
- El juego usa un catálogo placeholder propio en `src/lib/game/data.ts` (`supplyCatalog`). Cuando exista el catálogo real de insumos, enlaza cada `RecipeLine` con su producto y mantén las cantidades/unidades alineadas.

## Imágenes

- Ruta sugerida: `src/assets/productos/<slug>/01.webp`.
- Formato WebP/AVIF, ancho ~1200 px, sin texto incrustado.
- La primera imagen es la principal; proporción consistente (4:5 o 1:1).
- `alt` en español: "Vela de soya aromática de lavanda en frasco de vidrio ámbar".
- Se referencian en el frontmatter con `imagenes: [{ src, alt }]` y se renderizan con `astro:assets`.

## Copy

Lee `references/copy-guide.md`. Resumen: español de Colombia, cálido y concreto; describe aroma, tamaño, duración y cuidados; evita superlativos sin prueba.

## CTA de compra

- Mientras no haya checkout, el CTA principal es WhatsApp.
- El número vive en `site.whatsapp` (`src/config/site.ts`), con indicativo y sin `+`, espacios ni guiones.
- Usa `whatsappLink(mensaje)` de `src/lib/whatsapp.ts`; no armes la URL a mano en cada componente.
- El mensaje precargado debe incluir el nombre del producto: "Hola, quiero pedir la vela de lavanda de 250 g".
- Valida el link en móvil y desktop.

## Al agregar un producto

1. Copia un archivo de `src/content/productos/` y renómbralo con el slug.
2. Completa los campos obligatorios del schema.
3. Agrega `precio` o `precioDesde` cuando el dueño lo confirme.
4. Agrega imágenes reales con `alt` y elimina `borrador: true` cuando el contenido sea definitivo.
5. Ejecuta `npm run check` y revisa la card y el detalle en 360 px y desktop.
