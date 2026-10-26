import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { StarLogo } from "@/components/brand/StarLogo";
import { PhotoSlot } from "@/components/brand/PhotoSlot";
import { ModuleGate } from "@/components/brand/ModuleGate";
import { ModuleError, ModuleUnavailable } from "@/components/brand/ModuleState";
import { money, useStore } from "@/lib/store";

export const Route = createFileRoute("/tienda")({
  validateSearch: (s: Record<string, unknown>): { cat?: string | undefined } => ({ cat: typeof s["cat"] === "string" ? s["cat"] : undefined }),
  head: () => ({ meta: [
    { title: "La tienda — La Estrella Cubana" },
    { name: "description", content: "Alimentos, confitería, bebidas y aseo en Maceo 28, Manzanillo. Mira qué hay hoy." },
    { property: "og:title", content: "La tienda de La Estrella Cubana" },
    { property: "og:description", content: "Catálogo con precios y disponibilidad del día." },
  ] }),
  component: () => <ModuleGate area="tienda"><Tienda /></ModuleGate>,
  errorComponent: ModuleError,
});

function Tienda() {
  const { cat } = Route.useSearch();
  const c = useStore((s) => s.config);
  const cats = c.categories.filter((k) => k.kind === "tienda");
  const [sel, setSel] = useState<string | "all">(cat ?? "all");
  const shown = cats.filter((k) => sel === "all" || k.id === sel);

  return (
    <div className="min-h-screen">
      <header className="bg-navy px-5 py-8 text-cream">
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          <Link to="/"><StarLogo className="h-16 w-16" /></Link>
          <div><p className="font-script text-3xl leading-none text-gold">La tienda</p><h1 className="font-display text-2xl uppercase md:text-3xl">{c.name}</h1>
            <p className="text-sm text-cream/70">Ven a buscarlo a {c.address}. Precios del día en {c.currency}.</p></div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5">
        <div className="flex gap-2 overflow-x-auto py-4">
          {[{ id: "all", name: "Todo" }, ...cats].map((k) => (
            <button key={k.id} onClick={() => setSel(k.id)} className={`whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-bold ${sel === k.id ? "border-gold bg-gold text-navy" : "border-border"}`}>{k.name}</button>
          ))}
        </div>
        {shown.map((k) => (
          <section key={k.id} className="mb-10">
            <h2 className="mb-3 font-display text-xl uppercase">{k.name}</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {c.items.filter((i) => i.categoryId === k.id).map((it) => (
                <article key={it.id} className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="relative aspect-square"><PhotoSlot photo={it.photo ?? k.photo} alt={it.name} />
                    <span className={`absolute left-2 top-2 rounded-full px-3 py-1 text-xs font-bold ${it.available ? "bg-free text-navy" : "bg-cuban text-cream"}`}>{it.available ? "Hay" : "Se acabó"}</span></div>
                  <div className="p-3"><h3 className="font-semibold leading-tight">{it.name}</h3><p className="font-display text-gold">{money(it.price, c.currency)}</p></div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
