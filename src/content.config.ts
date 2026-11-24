import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const productos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/productos" }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string().min(3),
      categoria: z.enum([
        "ceras",
        "aditivos",
        "mechas",
        "aceites",
        "envases",
        "aromas",
        "colorantes",
        "moldes",
        "etiquetas",
        "herramientas",
        "kits",
      ]),
      precio: z.number().int().positive().optional(),
      precioDesde: z.number().int().positive().optional(),
      moneda: z.literal("COP").default("COP"),
      unidad: z.enum(["kg", "pote", "unidad"]).optional(),
      tamano: z.string().optional(),
      aromas: z.array(z.string()).default([]),
      descripcion: z.string().min(20),
      cuidados: z.array(z.string()).default([]),
      imagenes: z
        .array(
          z.object({
            src: image(),
            alt: z.string().min(5),
          }),
        )
        .default([]),
      disponible: z.boolean().default(true),
      destacado: z.boolean().default(false),
      borrador: z.boolean().default(false),
    }),
});

export const collections = { productos };
