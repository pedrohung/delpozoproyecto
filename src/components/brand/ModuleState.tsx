import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { StarLogo } from "./StarLogo";

export function ModuleUnavailable({ title = "Módulo no disponible", detail }: { title?: string; detail?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <StarLogo className="h-16 w-16 opacity-70" />
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="max-w-sm text-muted-foreground">{detail ?? "Esta parte no está disponible ahora mismo. El resto del sistema sigue funcionando."}</p>
      <Link to="/" className="btn-ghost-gold">Volver al inicio</Link>
    </div>
  );
}

/** Aviso propio de cada módulo: nunca una pantalla de error global. */
export function ModuleError({ reset }: ErrorComponentProps) {
  return (
    <div>
      <ModuleUnavailable detail="Este módulo tuvo un problema. Los demás siguen funcionando con normalidad." />
      <div className="-mt-16 flex justify-center"><button className="btn-gold" onClick={reset}>Reintentar</button></div>
    </div>
  );
}
