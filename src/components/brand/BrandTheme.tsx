import { useEffect } from "react";
import { useStore } from "@/lib/store";

/** Aplica los colores de la configuración de marca a todas las pantallas. */
export function BrandTheme() {
  const colors = useStore((s) => s.config.colors);
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--brand-navy", colors.navy);
    r.setProperty("--brand-blue", colors.blue);
    r.setProperty("--brand-red", colors.red);
    r.setProperty("--brand-gold", colors.gold);
    r.setProperty("--brand-cream", colors.cream);
  }, [colors]);
  return null;
}
