# Mapa del sitio actual

## Rutas

| Ruta | Archivo | Notas |
|---|---|---|
| `/` | `src/pages/index.astro` | Hero, destacados, cómo comprar, historia, juego, CTA |
| `/productos/` | `src/pages/productos/index.astro` | Grid completo; estado vacío en producción sin borradores |
| `/productos/[slug]/` | `src/pages/productos/[slug].astro` | `getStaticPaths`, JSON-LD, relacionados |
| `/nosotros/` | `src/pages/nosotros.astro` | Historia, valores y proceso |
| `/juego/` | `src/pages/juego.astro` | Juego 2D WebGL con `client:visible` |
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
| `internal/web/static/js/index.js` | scripts de componentes / juego Svelte |
| `cmd/server/main.go` | routing por archivos en `src/pages/` |
| `internal/handlers/*.go` | frontmatter + content collections |
| `internal/templates/template.go` | `astro:content` + `getStaticPaths` |

## Contenido

- Un producto = `src/content/productos/<slug>.md`.
- El schema vive en `src/content.config.ts`.
- Las imágenes reales van en `src/assets/productos/<slug>/` y se referencian con `imagenes: [{ src, alt }]`.
- Los helpers de `src/lib/products.ts` ordenan por categoría (velas, difusores, kits, accesorios) y filtran borradores en producción.

## Juego 2D WebGL

- Página: `src/pages/juego.astro` → `src/components/game/GameExperience.svelte`.
- Shell/paneles: Svelte/DOM.
- Canvas: `StageCanvas.svelte` + `src/lib/game/render/stage-renderer.ts` (PixiJS 8).
- Escenas WebGL: `src/lib/game/render/scenes/` (design, melt, pour, wick, cool, finish).
- Rig de vela: `src/lib/game/render/candle-rig.ts`; paleta: `palette.ts`.
- Pedido: `BriefTicket`, `BriefSummary`, `CounterScene`.
- Diseño: `DesignPanel`, `DesignBasics`, `DesignColors`, `ColorDots`.
- Paneles: `MeltPanel`, `PourPanel`, `WickPanel`, `CoolPanel`, `FinishPanel`, `ScorePanel`, `ShoppingList`.
- Fallback: `CandlePreview` y `MoldPreview`.
- Motor: `src/lib/game/types.ts`, `data.ts`, `design.ts`, `craft.ts`, `liquid.ts`, `scoring.ts`, `supplies.ts`, `portrait.ts`, `game-state.svelte.ts`.
- Estilos: `src/styles/game.css`.
- Tests: `src/lib/game/game.test.ts` con Vitest.

## Qué falta

- Retirar `cmd/`, `internal/` y `go.mod` cuando se apruebe la versión Astro.
- Reemplazar el contenido de ejemplo y las fotos.
- Migrar el catálogo a insumos y enlazar la receta del juego con productos reales.
- Validar briefs, temperaturas, tiempos, mechas, líquido y cantidades con el negocio.
- Persistencia/audio y arte final del juego (fase 3).
- Probar WebGL en móvil y el fallback sin WebGL.
- Configurar el dominio real y el despliegue.
