import { createFileRoute } from "@tanstack/react-router";
import { Estacion } from "@/components/staff/Estacion";
import { ModuleError } from "@/components/brand/ModuleState";

export const Route = createFileRoute("/cocina")({
  head: () => ({ meta: [
    { title: "Cocina — La Estrella Cubana" },
    { name: "description", content: "Pedidos de cocina: pendiente, preparando, listo." },
    { property: "og:title", content: "Cocina" }, { property: "og:description", content: "Estación de cocina." },
  ] }),
  component: () => <Estacion area="cocina" titulo="Cocina" shellArea="cocina" />,
  errorComponent: ModuleError,
});
