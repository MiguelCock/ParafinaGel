import { getCollection, type CollectionEntry } from "astro:content";
import { formatCOP } from "./format";

export type Producto = CollectionEntry<"productos">;
export type Categoria = Producto["data"]["categoria"];

export const categoriaLabels: Record<Categoria, string> = {
  ceras: "Ceras",
  aditivos: "Aditivos",
  mechas: "Mechas",
  aceites: "Aceites",
  envases: "Envases",
  aromas: "Aromas",
  colorantes: "Colorantes",
  moldes: "Moldes",
  etiquetas: "Etiquetas",
  herramientas: "Herramientas",
  kits: "Kits",
};

const categoriaOrder: Record<Categoria, number> = {
  ceras: 0,
  mechas: 1,
  aditivos: 2,
  aceites: 3,
  envases: 4,
  aromas: 5,
  colorantes: 6,
  moldes: 7,
  etiquetas: 8,
  herramientas: 9,
  kits: 10,
};

export const mostrarBorradores =
  import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_DRAFTS === "true";

export const unidadLabels: Record<"kg" | "pote" | "unidad", string> = {
  kg: "kg",
  pote: "pote",
  unidad: "unidad",
};

export async function getProductos(): Promise<Producto[]> {
  const productos = await getCollection(
    "productos",
    ({ data }) => mostrarBorradores || !data.borrador,
  );

  return productos.sort(
    (a, b) =>
      categoriaOrder[a.data.categoria] - categoriaOrder[b.data.categoria] ||
      a.data.nombre.localeCompare(b.data.nombre, "es"),
  );
}

export async function getDestacados(limite = 3): Promise<Producto[]> {
  const productos = await getProductos();
  const disponibles = productos.filter((producto) => producto.data.disponible);
  const destacados = disponibles.filter((producto) => producto.data.destacado);
  const resto = disponibles.filter((producto) => !producto.data.destacado);

  return [...destacados, ...resto].slice(0, limite);
}

export function getPrecio(producto: Producto): string | null {
  if (producto.data.precio != null) {
    return formatCOP(producto.data.precio);
  }

  if (producto.data.precioDesde != null) {
    return `Desde ${formatCOP(producto.data.precioDesde)}`;
  }

  return null;
}

export async function getRelacionados(
  producto: Producto,
  limite = 3,
): Promise<Producto[]> {
  const productos = await getProductos();
  const mismaCategoria = productos.filter(
    (item) =>
      item.id !== producto.id &&
      item.data.categoria === producto.data.categoria,
  );
  const otros = productos.filter(
    (item) =>
      item.id !== producto.id &&
      item.data.categoria !== producto.data.categoria,
  );

  return [...mismaCategoria, ...otros].slice(0, limite);
}
