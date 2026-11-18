# Mapa del sitio actual

## Rutas

| Ruta | Archivo | Notas |
|---|---|---|
| `/` | `src/pages/index.astro` | Hero, destacados, cómo comprar, historia, juego, CTA |
| `/productos/` | `src/pages/productos/index.astro` | Grid completo; estado vacío en producción sin borradores |
| `/productos/[slug]/` | `src/pages/productos/[slug].astro` | `getStaticPaths`, JSON-LD, relacionados |
| `/nosotros/` | `src/pages/nosotros.astro` | Historia, valores y proceso |
| `/juego/` | `src/pages/juego.astro` | `GameExperience` con `client:only`; 3D + modo ligero |
| `/contacto/` | `src/pages/contacto.astro` | WhatsApp, correo, Instagram y FAQ |
| `/404` | `src/pages/404.astro` | Página no encontrada |
| `/about` | `astro.config.mjs` | Redirect a `/nosotros` |

## Equivalencias con el prototipo Go

| Go (legacy) | Astro actual |
|---|---|
| `internal/templates/layouts/base.html` | `src/layouts/BaseLayout.astro` |
| `internal/templates/layouts/nav.html` / `footer.html` | `src/components/Nav.astro` / `Footer.astro` |
| `internal/templates/pages/home.html` | `src/pages/index.astro` |
| `internal/templates/pages/about.html` | `src/pages/nosotros.astro` |
| `internal/templates/components/button.html` | `src/components/Button.astro` |
| `internal/web/static/css/style.css` | `src/styles/global.css` |
| `internal/web/static/js/index.js` | scripts de componentes / isla Svelte |
| `cmd/server/main.go` | routing por archivos en `src/pages/` |
| `internal/handlers/*.go` | frontmatter + content collections |
| `internal/templates/template.go` | `astro:content` + `getStaticPaths` |

## Contenido

- Un producto = `src/content/productos/<slug>.md`.
- El schema vive en `src/content.config.ts`.
- Las imágenes reales van en `src/assets/productos/<slug>/` y se referencian con `imagenes: [{ src, alt }]`.
- Los helpers de `src/lib/products.ts` ordenan por categoría (velas, difusores, kits, accesorios) y filtran borradores en producción.

## Juego 3D

- Página: `src/pages/juego.astro` → `src/components/game3d/GameExperience.svelte`.
- Escena: `Game3D.svelte`, `GameScene.svelte`, `CameraRig`, `WorkshopRoom` y estaciones.
- Motor: `src/lib/game3d/game-state.svelte.ts`, `data.ts`, `orders.ts`, `palette.ts`, `motion.ts`.
- UI compartida: `src/styles/game.css`.
- Respaldo 2D: `src/components/game/CandleGame.svelte`.
- Tests: `src/lib/game3d/orders.test.ts` con Vitest.

## Qué falta

- Retirar `cmd/`, `internal/` y `go.mod` cuando se apruebe la versión Astro.
- Reemplazar el contenido de ejemplo y las fotos.
- Implementar “Crear mi vela”, persistencia/puntaje y audio del juego.
- Reemplazar el blockout 3D por modelos GLB/arte final.
- Configurar el dominio real y el despliegue.
