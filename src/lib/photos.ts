import malecon from "@/assets/malecon.jpg";
import interior from "@/assets/interior.jpg";
import cafeteria from "@/assets/cat-cafeteria.jpg";
import parrilladas from "@/assets/cat-parrilladas.jpg";

const local: Record<string, string> = { malecon, interior, cafeteria, parrilladas };

/** Resuelve una clave de foto local o devuelve el valor (dataURL / ruta) tal cual. */
export function photoSrc(key?: string): string | undefined {
  if (!key) return undefined;
  return local[key] ?? key;
}
