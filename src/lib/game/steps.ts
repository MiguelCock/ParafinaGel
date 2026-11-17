export type PasoJuego =
  "inicio" | "elegir" | "preparar" | "verter" | "curar" | "resultado";

export interface PasoInfo {
  id: Exclude<PasoJuego, "inicio" | "resultado">;
  titulo: string;
  instruccion: string;
  tip: string;
  accion: string;
  interacciones: number;
}

export const pasos: PasoInfo[] = [
  {
    id: "elegir",
    titulo: "Elige tu aroma",
    instruccion:
      "Escoge el producto que quieres probar. Cada aroma cambia el color de la vela.",
    tip: "Los aromas se eligen según el momento que quieres acompañar.",
    accion: "Continuar",
    interacciones: 0,
  },
  {
    id: "preparar",
    titulo: "Prepara la cera",
    instruccion:
      "Remueve la cera a baño maría. Hazlo despacio para que se derrita de forma pareja.",
    tip: "La temperatura depende del tipo de cera. En el taller validamos la indicada.",
    accion: "Remover",
    interacciones: 3,
  },
  {
    id: "verter",
    titulo: "Vierte despacio",
    instruccion:
      "Vierte la cera por el centro del frasco y deja un poco de espacio en el borde.",
    tip: "Un vertido lento evita burbujas y ayuda a que la superficie quede pareja.",
    accion: "Verter",
    interacciones: 2,
  },
  {
    id: "curar",
    titulo: "Deja curar",
    instruccion:
      "La vela necesita reposo antes de encenderse. Espera y deja que el aroma se asiente.",
    tip: "En la vida real el curado toma días; aquí lo hacemos simbólico.",
    accion: "Esperar",
    interacciones: 3,
  },
];
