# ParafinaGel

Sitio web del negocio familiar de velas **ParafinaGel**: catálogo, contacto y un juego 2D cozy para diseñar velas y descubrir los **insumos** necesarios para hacerlas.

Construido con **Astro 7** e islas de **Svelte 5**. El juego es 2D con SVG/CSS, sin WebGL. Salida 100 % estática.

## Requisitos

- Node.js `>= 22.23.4`
- npm

## Comandos

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # check + build estático en dist/
npm run preview    # previsualiza dist/
npm run check      # astro check + svelte-check
npm test           # tests del motor del juego
npm run format     # Prettier (Astro, Svelte, TS, CSS, MD)
```

## Estructura

```text
src/
  pages/           # rutas por archivo
  layouts/         # BaseLayout con SEO, fuentes y navegación
  components/      # UI en Astro
  components/game/ # juego 2D: shell, escenario, escenas, editor, paneles y SVG
  content/         # productos del catálogo (Markdown)
  lib/game/        # motor: briefs, diseño, craft, scoring, receta y estado
  lib/             # lógica de productos, WhatsApp y formato
  styles/          # tokens y estilos globales
public/            # favicon, robots
```

Rutas: `/`, `/productos`, `/productos/[slug]`, `/nosotros`, `/juego`, `/contacto` y 404. `/about` redirige a `/nosotros`.

## Juego 2D

`/juego` tiene una experiencia cozy ilustrada. El jugador escucha un brief, diseña una vela y la fabrica paso a paso. Al final recibe **puntos, estrellas y una receta con la lista de insumos**, no el precio de una vela terminada.

- **Pedido progresivo**: el cliente revela los requisitos poco a poco; “Crear nota” fija el brief.
- **Cuatro tipos de pedido**: clásica, capas, figura (molde con partes de colores) y gel (transparente con montajes).
- **Diseñador**: cera, tamaño, recipiente o molde, capas y alturas, colores, aroma, mecha, etiqueta y montajes. Validación en vivo.
- **Taller**: calentar y remover, verter por capas o partes, centrar la mecha, curar (con burbujas en gel), alinear etiqueta, cortar mecha, tapar y empacar.
- **Mini-juegos**: la mecha, la etiqueta y el corte se puntúan por precisión. El gel incluye un mini-juego de burbujas.
- **Modo libre**: sandbox sin pedido ni reloj; se puede ver la receta o probar el taller.
- **Modo experto**: oculta las pistas numéricas del diseño y del acabado.
- **Cierre comercial**: receta con cantidades y CTA de WhatsApp para pedir los insumos.
- **Accesibilidad**: controles nativos, teclado, foco visible, `aria-live` y `prefers-reduced-motion`.
- **Sin WebGL**: funciona en navegadores modernos y no carga Three.js.

Los tiempos, temperaturas, medidas de mecha y cantidades son **placeholders**. Valídalos con el negocio antes de publicar.

## Catálogo y placeholders

Los productos actuales están en `src/content/productos/*.md` y tienen `borrador: true`.
En desarrollo se ven todos; en producción se excluyen para no publicar datos de ejemplo.

Para ver el catálogo de ejemplo en un build:

```bash
PUBLIC_SHOW_DRAFTS=true npm run build
```

El schema está en `src/content.config.ts`. Los precios son opcionales: si faltan, la interfaz muestra “Precio por confirmar”.

### Agregar un producto real

1. Crea `src/content/productos/<slug>.md` con los campos del schema.
2. Agrega `precio` (entero COP) o `precioDesde`.
3. Agrega imágenes en `src/assets/productos/<slug>/` y referéncialas en `imagenes` con `alt`.
4. Quita `borrador: true` cuando el contenido sea real.
5. Ejecuta `npm run check` y revisa la card y el detalle en dev.
6. Si el insumo aparece en el juego, actualiza su entrada en `src/lib/game/data.ts` y `supplyCatalog`.

## Datos por reemplazar

| Qué                                  | Dónde                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| WhatsApp, correo, Instagram y ciudad | `src/config/site.ts`                                                            |
| Dominio del sitio                    | `astro.config.mjs`                                                              |
| Catálogo y precios                   | `src/content/productos/*.md`                                                    |
| Historia y copy de páginas           | `src/pages/nosotros.astro`, `src/pages/index.astro`, `src/pages/contacto.astro` |
| Briefs y materiales del juego        | `src/lib/game/data.ts`                                                          |
| Reglas y puntaje del juego           | `src/lib/game/scoring.ts`, `src/lib/game/craft.ts`                              |
| Receta y lista de compras            | `src/lib/game/supplies.ts`                                                      |
| Escenas, tickets y UI del juego      | `src/components/game/` y `src/styles/game.css`                                  |
| Paleta, tipografía y tokens          | `src/styles/global.css`                                                         |

El juego usa datos de ejemplo y no incluye temperaturas reales. Valida tiempos, ceras, mechas, medidas y cantidades con el negocio antes de publicar.

## Prototipo Go

`cmd/`, `internal/` y `go.mod` pertenecen al prototipo anterior y no los usa Astro. Se pueden eliminar cuando la versión nueva esté aprobada; el historial de Git conserva el código.

## Notas

- El sitio no tiene backend ni checkout. El CTA de compra es WhatsApp.
- `npm audit` reporta vulnerabilidades altas en dependencias de build (`picomatch` y tooling). No ejecutes `npm audit fix --force`: puede romper las versiones de Astro/Svelte. No afecta el sitio estático.
- La accesibilidad se verificó con axe (WCAG 2.1 AA) en las páginas principales y en `/juego`, en modo claro y oscuro.
- `npm test` cubre el motor puro del juego; `npm run check` valida Astro y Svelte.

## Antes de publicar

- [ ] Reemplazar WhatsApp, correo, Instagram y ciudad.
- [ ] Definir el dominio en `astro.config.mjs`.
- [ ] Migrar el catálogo de velas terminadas a insumos y materias primas.
- [ ] Cargar productos reales y quitar `borrador: true`.
- [ ] Validar briefs, temperaturas, tiempos, mechas y cantidades con el negocio.
- [ ] Reemplazar los textos marcados como ejemplo.
- [ ] Reemplazar los SVG placeholders del juego por arte final si se desea.
- [ ] Agregar fotos reales y `alt` descriptivos.
- [ ] Ejecutar `npm test`, `npm run check`, `npm run build` y revisar en 360 px y desktop.
