import { createFileRoute } from "@tanstack/react-router";
import { Estacion } from "@/components/staff/Estacion";
import { ModuleError } from "@/components/brand/ModuleState";

export const Route = createFileRoute("/bar")({
  head: () => ({ meta: [
    { title: "Bar — La Estrella Cubana" },
    { name: "description", content: "Pedidos de barra: pendiente, preparando, listo." },
    { property: "og:title", content: "Bar" }, { property: "og:description", content: "Estación de barra." },
  ] }),
  component: () => <Estacion area="bar" titulo="Bar" shellArea="bar" />,
  errorComponent: ModuleError,
});
