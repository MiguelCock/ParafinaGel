import { getCollection, type CollectionEntry } from "astro:content";
import { formatCOP } from "./format";

export type Producto = CollectionEntry<"productos">;
export type Categoria = Producto["data"]["categoria"];

export const categoriaLabels: Record<Categoria, string> = {
  velas: "Velas",
  difusores: "Difusores",
  accesorios: "Accesorios",
  kits: "Kits",
};

const categoriaOrder: Record<Categoria, number> = {
  velas: 0,
  difusores: 1,
  kits: 2,
  accesorios: 3,
};

export const mostrarBorradores =
  import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_DRAFTS === "true";

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
