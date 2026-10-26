import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { StaffShell } from "@/components/staff/StaffShell";
import { StarLogo } from "@/components/brand/StarLogo";
import { ModuleError } from "@/components/brand/ModuleState";
import { shopStock } from "@/lib/modules";
import { money, shopSale, useStore, type CartLine, type Sale } from "@/lib/store";

export const Route = createFileRoute("/mostrador")({
  head: () => ({ meta: [
    { title: "Mostrador — La Estrella Cubana" },
    { name: "description", content: "Venta de tienda en mostrador." },
    { property: "og:title", content: "Mostrador" }, { property: "og:description", content: "Venta de tienda." },
  ] }),
  component: Mostrador,
  errorComponent: ModuleError,
});

function Mostrador() {
  const c = useStore((s) => s.config);
  const cats = c.categories.filter((k) => k.kind === "tienda");
  const [cat, setCat] = useState(cats[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [done, setDone] = useState<Sale | null>(null);

  const items = c.items.filter((i) => i.categoryId === cat && i.available && shopStock(i) > 0 && (!q || i.name.toLowerCase().includes(q.toLowerCase())));
  const get = (id: string) => cart.find((x) => x.itemId === id)?.qty ?? 0;
  const upd = (id: string, qty: number) => {
    const item = c.items.find((i) => i.id === id);
    if (!item || qty > shopStock(item)) return;
    setCart(qty <= 0 ? cart.filter((x) => x.itemId !== id) : [...cart.filter((x) => x.itemId !== id), { itemId: id, qty }]);
  };
  const validCart = cart.length > 0 && cart.every((l) => {
    const item = c.items.find((i) => i.id === l.itemId);
    return item && item.available && l.qty <= shopStock(item);
  });
  const total = cart.reduce((a, l) => a + (c.items.find((i) => i.id === l.itemId)?.price ?? 0) * l.qty, 0);

  if (done) return (
    <StaffShell area="mostrador">
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <StarLogo className="h-28 w-28" animated />
        <h2 className="font-display text-3xl uppercase">Venta cobrada</h2>
        <div className="animate-pop font-display text-6xl text-gold">{money(done.total, c.currency)}</div>
        <p className="text-muted-foreground">Cae en la caja de hoy, en la línea Tienda.</p>
        <button className="btn-gold" onClick={() => { setDone(null); setCart([]); }}>Nueva venta</button>
      </div>
    </StaffShell>
  );

  return (
    <StaffShell area="mostrador">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-3 flex items-center gap-2 rounded-xl border-2 border-input bg-card px-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto…" className="w-full bg-transparent py-3 text-lg outline-none" />
          </div>
          <div className="mb-3 flex gap-2 overflow-x-auto">
            {cats.map((k) => <button key={k.id} onClick={() => setCat(k.id)} className={`whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-bold ${cat === k.id ? "border-gold bg-gold text-navy" : "border-border"}`}>{k.name}</button>)}
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {items.map((it) => {
              const qty = get(it.id);
              return (
                <button key={it.id} disabled={qty >= shopStock(it)} onClick={() => upd(it.id, qty + 1)} className={`relative rounded-xl border-2 bg-card p-4 text-left transition active:scale-95 ${qty ? "border-gold" : "border-border"}`}>
                  <div className="font-semibold leading-tight">{it.name}</div>
                  <div className="text-xs text-muted-foreground">Stock: {shopStock(it)}</div><div className="mt-1 font-display text-gold">{money(it.price, c.currency)}</div>
                  {qty > 0 && <span key={qty} className="absolute right-2 top-2 grid h-8 w-8 animate-pop place-items-center rounded-full bg-gold font-display text-navy">{qty}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <aside className="flex h-fit flex-col rounded-2xl border-2 border-gold bg-card">
          <h2 className="border-b border-border p-4 font-display text-xl">Venta actual</h2>
          <div className="max-h-80 flex-1 space-y-2 overflow-y-auto p-4">
            {cart.length === 0 && <p className="py-6 text-center text-muted-foreground">Toca productos para añadirlos.</p>}
            {cart.map((l) => {
              const it = c.items.find((i) => i.id === l.itemId);
              if (!it) return null;
              return (
                <div key={l.itemId} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 font-semibold">{it.name}</span>
                  <button aria-label="Quitar" onClick={() => upd(l.itemId, l.qty - 1)} className="grid h-9 w-9 place-items-center rounded-full border border-border"><Minus className="h-4 w-4" /></button>
                  <span className="w-6 text-center font-bold">{l.qty}</span>
                  <button aria-label="Añadir" disabled={l.qty >= shopStock(it)} onClick={() => upd(l.itemId, l.qty + 1)} className="grid h-9 w-9 place-items-center rounded-full bg-gold text-navy"><Plus className="h-4 w-4" /></button>
                  <span className="w-20 text-right font-semibold">{money(it.price * l.qty, c.currency)}</span>
                </div>
              );
            })}
          </div>
          <div className="space-y-3 border-t border-border p-4">
            <div className="flex justify-between font-display text-3xl"><span>Total</span><span key={total} className="animate-pop text-gold">{money(total, c.currency)}</span></div>
            <button className="btn-gold w-full text-lg" disabled={!validCart} onClick={() => { const sale = shopSale(cart); if (sale) setDone(sale); }}>Cobrar</button>
            {cart.length > 0 && <button className="flex w-full items-center justify-center gap-1 text-sm text-muted-foreground" onClick={() => setCart([])}><Trash2 className="h-4 w-4" /> Vaciar</button>}
          </div>
        </aside>
      </div>
    </StaffShell>
  );
}
