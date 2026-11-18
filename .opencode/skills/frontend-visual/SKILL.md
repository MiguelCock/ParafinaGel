---
name: Frontend visual
description: Diseño y pulido visual del sitio de ParafinaGel en Astro: jerarquía, tipografía, color, layout responsivo, microinteracciones y revisión estética antes de entregar una página. Úsalo al crear o rediseñar hero, catálogo, cards de producto, CTA o cualquier vista.
---

# Frontend visual

Objetivo: que el sitio se vea como una marca de velas artesanales cuidada, no como una plantilla genérica.

## Antes de tocar código

1. Lee `src/styles/global.css` y reutiliza los tokens existentes. Los tokens y utilidades son globales; los componentes usan estilos scoped.
2. Revisa `src/components/` antes de crear un componente nuevo.
3. Define en una frase qué debe sentir el visitante en esa página (ej. "calidez de una vela encendida", "regalo listo para dar").
4. Elige una sola acción principal por sección. En este sitio suele ser "Pedir por WhatsApp".
5. Usa fotos reales cuando existan; mientras tanto, `ProductImage.astro` genera placeholders SVG por categoría. No inventes fotos ni textos de producto.

## Reglas de diseño

- **Paleta**: crema, terracota y salvia. Usa los tokens; nada de gradientes azul-morado ni glassmorphism genérico.
- **Tipografía**: Fraunces Variable para títulos y Manrope Variable para cuerpo, autohospedadas con Fontsource. No agregues fuentes por CDN.
- **Espaciado**: usa `--space-1` a `--space-9`. Secciones con aire; el sitio debe respirar.
- **Layout**: contenedor de `--container` (1180 px), una columna en móvil y grids de 2–3 columnas en desktop.
- **Hero**: foto o visual de producto, propuesta de valor concreta y un CTA primario. Sin carrusel automático ni autoplay.
- **Cards de producto**: imagen consistente (4:5), nombre, precio o "Precio por confirmar", aromas y CTA. Alturas uniformes y hover sutil.
- **Botones**: clases globales `.button`, `.button--primary`, `.button--secondary`, `.button--whatsapp`. Área táctil mínima 44×44 px.
- **Contraste**: usa `--color-accent-strong` para texto sobre `--color-accent-soft` y `--color-on-whatsapp` para el texto del botón verde. El sitio pasa axe WCAG 2.1 AA; no lo rompas.
- **Movimiento**: 150–250 ms, solo `transform`/`opacity`. Respeta `prefers-reduced-motion`.
- **Imágenes**: `astro:assets` (`<Image />`) para fotos reales, con `alt` descriptivo y dimensiones.
- **Modo oscuro**: tokens en `@media (prefers-color-scheme: dark)`; revisa ambos temas.
- **Astro/Svelte**: estilos scoped por componente. No uses `is:global` salvo que sea realmente global.
- **Juego 3D**: su UI usa `src/styles/game.css` y clases `.game-*`; la escena es cálida y no sigue el modo oscuro. Revisa el skill `candle-game` antes de tocar el canvas.

## Anti-patrones

- Lorem ipsum o copy de relleno en una entrega.
- Emojis como iconos de interfaz.
- Cards idénticas sin jerarquía ni producto destacado.
- Animaciones constantes, parallax agresivo o audio automático.
- Colores hardcodeados fuera de los tokens.
- Agregar Tailwind, Bootstrap o una librería de UI sin acordarlo.
- Hidratar componentes que pueden ser HTML estático.

## Checklist de entrega

Lee `references/page-checklist.md` y revísalo completo antes de decir que una página está lista.

Tokens actuales y reglas de contraste: `references/design-tokens.md`.
