# Checklist de página

## Contenido

- [ ] Copy real en español, sin lorem ipsum ni placeholders visibles.
- [ ] Precio, tamaño y aroma correctos (o "Precio por confirmar").
- [ ] Un CTA principal claro; links de WhatsApp/contacto funcionando.
- [ ] Títulos y descripciones SEO únicos.

## Visual

- [ ] Jerarquía evidente: se entiende qué mirar primero.
- [ ] Espaciado consistente con `--space-*`.
- [ ] Paleta cálida y coherente; sin colores fuera de tokens.
- [ ] Imágenes nítidas, misma proporción, sin deformación.
- [ ] Modo claro y oscuro revisados.
- [ ] Hover/focus visibles; nada depende solo del color.

## Responsive

- [ ] 360px, 768px y 1280px sin scroll horizontal.
- [ ] Áreas táctiles >= 44px.
- [ ] Texto legible sin zoom (>= 16px en cuerpo).
- [ ] El menú móvil (`<details>`) abre y se puede usar.

## Accesibilidad

- [ ] Contraste AA en texto y botones.
- [ ] Navegación por teclado y `focus-visible`.
- [ ] `alt` descriptivo en imágenes.
- [ ] `prefers-reduced-motion` respetado.
- [ ] Si tocaste el juego, sigue siendo jugable con teclado y sin audio.
- [ ] Si hay axe/Lighthouse disponible, sin violaciones WCAG 2.1 AA en las páginas tocadas.

## Verificación

- [ ] `npm run check` sin errores.
- [ ] `npm run build` sin errores.
- [ ] `npm run dev` y revisión visual en el navegador.
- [ ] Si hay placeholders, `PUBLIC_SHOW_DRAFTS=true` para verlos en el build.
