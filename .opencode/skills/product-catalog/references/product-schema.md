# Schema de producto

Fuente de verdad: `src/content.config.ts`. Ejemplo resumido:

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const productos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/productos" }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string().min(3),
      categoria: z.enum(["ceras", "aditivos", "mechas", "aceites", "envases", "aromas", "colorantes", "moldes", "etiquetas", "herramientas", "kits"]),
      precio: z.number().int().positive().optional(),
      precioDesde: z.number().int().positive().optional(),
      moneda: z.literal("COP").default("COP"),
      unidad: z.enum(["kg", "pote", "unidad"]).optional(),
      tamano: z.string().optional(),
      aromas: z.array(z.string()).default([]),
      descripcion: z.string().min(20),
      cuidados: z.array(z.string()).default([]),
      imagenes: z
        .array(z.object({ src: image(), alt: z.string().min(5) }))
        .default([]),
      disponible: z.boolean().default(true),
      destacado: z.boolean().default(false),
      borrador: z.boolean().default(false),
    }),
});

export const collections = { productos };
```

## Campos

| Campo | Tipo | Obligatorio | Nota |
|---|---|---|---|
| `nombre` | string | sí | Nombre comercial, sin código interno |
| `categoria` | enum | sí | `ceras`, `aditivos`, `mechas`, `aceites`, `envases`, `aromas`, `colorantes`, `moldes`, `etiquetas`, `herramientas`, `kits` |
| `precio` / `precioDesde` | int COP | no | Si faltan, se muestra “Precio por confirmar” |
| `moneda` | literal `COP` | no | Default `COP` |
| `unidad` | enum | no | `kg`, `pote` o `unidad`; se muestra junto al precio |
| `tamano` | string | no | Peso o volumen visible al cliente |
| `aromas` | string[] | no | Uno o varios; vacío para accesorios |
| `descripcion` | string | sí | 1–2 frases concretas |
| `cuidados` | string[] | no | Instrucciones de uso |
| `imagenes` | array `{src, alt}` | no | Vacío mientras se usan placeholders |
| `disponible` | boolean | no | Default `true`; controla el badge y el CTA |
| `destacado` | boolean | no | Default `false`; aparece en la home |
| `borrador` | boolean | no | Default `false`; los `true` no se publican en producción |

## Frontmatter de ejemplo

```yaml
---
nombre: "Cera vaso"
categoria: ceras
precio: 15500
unidad: kg
tamano: "1 kg"
descripcion: "Cera para velas en vaso, de acabado cremoso. Precio por kilo."
disponible: true
destacado: true
borrador: false
---
Producto oficial de ParafinaGel.
```

## Reglas

- `borrador: true` es obligatorio para placeholders; el build de producción los excluye.
- Para ver borradores futuros en un build: `PUBLIC_SHOW_DRAFTS=true npm run build`.
- Cuando existan fotos reales, considera endurecer `imagenes` con `.min(1)`.
- No agregues campos que nadie vaya a completar.
