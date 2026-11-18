# Tokens y sistema visual

Fuente de verdad: `src/styles/global.css`.

## Tipografía

- `--font-display`: `"Fraunces Variable"`, Georgia, serif. Títulos y cifras grandes.
- `--font-body`: `"Manrope Variable"`, system-ui, sans-serif. Cuerpo, botones y navegación.
- Escala: `--text-xs` 0.75rem, `--text-sm` 0.875rem, `--text-base` 1rem, `--text-lg` 1.125rem, `--text-xl` 1.375rem, `--text-2xl`, `--text-3xl` y `--text-4xl` con `clamp()`.
- Las fuentes se cargan con `@fontsource-variable/...` en `BaseLayout.astro`.

## Color (modo claro)

- Fondo: `--color-bg` `#faf5ee`; elevado: `--color-bg-elevated` `#fffdf9`.
- Superficies: `--color-surface` `#f3ece2`; `--color-surface-strong` `#e9dfd2`.
- Texto: `--color-text` `#2a241e`; secundario `--color-text-muted` `#6f6358`; títulos `--color-heading` `#1e1914`.
- Acento: `--color-accent` `#b4552f`; hover `#94401f`; `--color-accent-strong` `#8f3f20`; suave `--color-accent-soft` `#f3ddd2`.
- Salvia: `--color-sage` `#4f6247`; suave `#e4eadf`.
- Bordes: `--color-border` `#e4d8ca`; fuerte `#cfc0ae`.
- WhatsApp: `--color-whatsapp` `#17754d`; hover `#11603e`; texto `--color-on-whatsapp` `#ffffff`.
- Panel oscuro del juego: `--color-panel` `#2f3a2b`; texto `--color-panel-text` `#fbf3e9`.

## Color (modo oscuro)

- Fondo `#151210`; elevado `#1e1a16`; superficie `#251f1a`; fuerte `#322a23`.
- Texto `#eadfd3`; secundario `#b3a596`; títulos `#fbf3e9`.
- Acento `#e08a5f`; fuerte `#f0a27a`; suave `#3a261d`.
- Salvia `#9db292`; suave `#263024`.
- WhatsApp `#4ecf92`; texto `--color-on-whatsapp` `#062117`.

## Espaciado, formas y sombras

- `--space-1` 0.25rem, `--space-2` 0.5rem, `--space-3` 0.75rem, `--space-4` 1rem, `--space-5` 1.5rem, `--space-6` 2rem, `--space-7` 3rem, `--space-8` 4rem, `--space-9` 6rem.
- Radios: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`.
- Sombras: `--shadow-sm`, `--shadow-md`, `--shadow-lg`.
- Contenedor: `--container` 1180px; header: `--header-height` 4.75rem; transición: `--transition` 180ms ease.

## Reglas

- No hardcodees colores ni espaciados fuera de los tokens.
- Para texto sobre fondo suave usa `--color-accent-strong` / `--color-sage`, no el acento base.
- El botón de WhatsApp usa `--color-on-whatsapp` para el texto; el contraste cambia entre temas.
- No agregues una librería de UI ni Tailwind sin acordarlo.
- Cualquier token nuevo debe tener su equivalente en modo oscuro.

## Juego 2D

- La UI del juego usa los tokens del sitio (`src/styles/game.css`).
- El escenario ilustrado y los objetos (jarra, olla, jarra de vertido, ventilador, vapor, iconos) viven en `src/components/game/` como SVG/CSS; no agregues paletas 3D ni canvas.
- Las tarjetas de escena son theme-aware: usan `var(--color-bg-elevated)` para que el modo oscuro mantenga contraste.
- `CustomerPortrait` admite `customer.portrait` para futuros retratos AI/foto; si falta, usa el SVG.
- Mantén la estética de papel: tickets, sellos, líneas punteadas y recibos.
