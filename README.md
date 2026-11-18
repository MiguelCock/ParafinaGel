# ParafinaGel

Sitio web del negocio familiar de velas **ParafinaGel**: catálogo, contacto para comprar y un juego 3D cozy para aprender a hacer velas.

Construido con **Astro 7**, islas de **Svelte 5** y **Threlte / Three.js** para el juego. Salida 100 % estática.

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
  components/game3d/  # isla 3D: escena, estaciones, paneles y HUD
  components/game/    # juego 2D de respaldo
  content/         # productos del catálogo (Markdown)
  lib/game3d/      # motor: pedidos, scoring, estado y datos
  lib/             # lógica de productos, WhatsApp y formato
  styles/          # tokens y estilos globales
public/            # favicon, robots
```

Rutas: `/`, `/productos`, `/productos/[slug]`, `/nosotros`, `/juego`, `/contacto` y 404. `/about` redirige a `/nosotros`.

## Juego 3D

`/juego` tiene una experiencia 3D con cámara fija tipo diorama. Atiendes tres pedidos en el taller: mostrador, cera, vertido, enfriado y acabado. Cada pedido se puntúa por receta, temperatura, vertido y acabado, y termina en propinas y un resumen del día.

- **Modo 3D / Modo ligero**: si el navegador no soporta WebGL, entra directo al juego 2D de respaldo. También puedes cambiar manualmente.
- **Calidad**: en móvil inicia en “Baja” (sin sombras, menor DPR). Puedes cambiarla desde el HUD.
- **Rendimiento**: en desarrollo hay un overlay con FPS, draw calls y triángulos. El juego solo carga en `/juego`.
- **Peso**: el chunk del juego ronda 850 KB minificado (~217 KB gzip) por Three.js/Threlte; el resto del sitio no carga ese peso.
- **Contenido**: los pedidos son de ejemplo y `productSlug` enlaza al catálogo real. Las temperaturas y tiempos son aproximados; valídalos antes de publicar.
- **Arte**: esta fase usa primitivas procedurales (blockout). Los modelos GLB y el arte final llegan en una fase posterior.

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

## Datos por reemplazar

| Qué                                  | Dónde                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------- |
| WhatsApp, correo, Instagram y ciudad | `src/config/site.ts`                                                            |
| Dominio del sitio                    | `astro.config.mjs`                                                              |
| Catálogo y precios                   | `src/content/productos/*.md`                                                    |
| Historia y copy de páginas           | `src/pages/nosotros.astro`, `src/pages/index.astro`, `src/pages/contacto.astro` |
| Juego y tips educativos              | `src/lib/game3d/data.ts`, `src/lib/game3d/orders.ts` y `src/components/game3d/` |
| Paleta, tipografía y tokens          | `src/styles/global.css`                                                         |

El juego usa datos de ejemplo y no incluye temperaturas reales. Valida tiempos, ceras y materiales con el negocio antes de publicar.

## Prototipo Go

`cmd/`, `internal/` y `go.mod` pertenecen al prototipo anterior y no los usa Astro. Se pueden eliminar cuando la versión nueva esté aprobada; el historial de Git conserva el código.

## Notas

- El sitio no tiene backend ni checkout. El CTA de compra es WhatsApp.
- `npm audit` reporta vulnerabilidades altas en dependencias de build (`picomatch` y tooling). No ejecutes `npm audit fix --force`: puede romper las versiones de Astro/Svelte/Threlte. No afecta el sitio estático.
- La accesibilidad se verificó con axe (WCAG 2.1 AA) en las páginas principales, en modo claro y oscuro.
- `npm test` cubre el motor puro del juego; `npm run check` valida Astro y Svelte.

## Antes de publicar

- [ ] Reemplazar WhatsApp, correo, Instagram y ciudad.
- [ ] Definir el dominio en `astro.config.mjs`.
- [ ] Cargar productos reales y quitar `borrador: true`.
- [ ] Reemplazar los textos marcados como ejemplo.
- [ ] Validar los datos del juego con el negocio.
- [ ] Reemplazar el blockout 3D por modelos/arte aprobados.
- [ ] Agregar fotos reales y `alt` descriptivos.
- [ ] Ejecutar `npm test`, `npm run check`, `npm run build` y revisar en 360 px y desktop.
