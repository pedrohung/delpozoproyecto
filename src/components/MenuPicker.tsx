import { useState } from "react";
import { Minus, Plus, MessageSquare } from "lucide-react";
import { PhotoSlot } from "@/components/brand/PhotoSlot";
import { money, useStore, type CartLine } from "@/lib/store";
import { menuItemEnabled } from "@/lib/modules";

/** Lista de platos por categoría con − / + y nota para cocina. Compartida por Carta (QR) y Comanda. */
export function MenuPicker({ cart, setCart, initialCat, compact = false }: {
  cart: CartLine[]; setCart: (c: CartLine[]) => void; initialCat?: string | undefined; compact?: boolean;
}) {
  const c = useStore((s) => s.config);
  const cats = c.categories.filter((k) => k.kind === "carta" && c.modules[k.line] && c.items.some((i) => i.categoryId === k.id && menuItemEnabled(c, i)));
  const [cat, setCat] = useState(initialCat && cats.some((k) => k.id === initialCat) ? initialCat : cats[0]?.id);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const activeCat = cats.some((k) => k.id === cat) ? cat : cats[0]?.id;
  const items = c.items.filter((i) => i.categoryId === activeCat && menuItemEnabled(c, i));
  const get = (id: string) => cart.find((x) => x.itemId === id);
  const upd = (id: string, patch: Partial<CartLine>) => {
    const cur = get(id) ?? { itemId: id, qty: 0 };
    const next = { ...cur, ...patch };
    setCart(next.qty <= 0 && !next.note ? cart.filter((x) => x.itemId !== id) : [...cart.filter((x) => x.itemId !== id), next]);
  };

  if (!cats.length) return <p className="py-10 text-center text-muted-foreground">La carta está vacía por ahora.</p>;

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 flex gap-2 overflow-x-auto bg-background/95 px-4 py-3 backdrop-blur">
        {cats.map((k) => (
          <button key={k.id} onClick={() => setCat(k.id)}
            className={`whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-bold transition ${cat === k.id ? "border-gold bg-gold text-navy" : "border-border"}`}>{k.name}</button>
        ))}
      </div>
      <ul className="mt-2 grid gap-3">
        {items.map((it) => {
          const line = get(it.id); const qty = line?.qty ?? 0;
          return (
            <li key={it.id} className={`flex gap-3 rounded-xl border bg-card p-3 transition ${qty ? "border-gold" : "border-border"} ${!it.available ? "opacity-50" : ""}`}>
              {!compact && <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg"><PhotoSlot photo={it.photo ?? c.categories.find((k) => k.id === it.categoryId)?.photo} alt={it.name} /></div>}
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold leading-tight">{it.name}</h3>
                  <span className="whitespace-nowrap font-display text-gold">{money(it.price, c.currency)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{it.available ? it.description : "Se acabó por hoy"}</p>
                {line?.note && <p className="mt-1 text-xs italic text-cuban">Nota: {line.note}</p>}
                {noteFor === it.id && (
                  <input autoFocus defaultValue={line?.note} placeholder="Ej.: sin cebolla" onBlur={(e) => { upd(it.id, { note: e.target.value || undefined }); setNoteFor(null); }}
                    className="mt-2 rounded-md border border-input bg-background px-2 py-1 text-sm" />
                )}
                <div className="mt-auto flex items-center justify-end gap-2 pt-2">
                  {qty > 0 && <button onClick={() => setNoteFor(it.id)} className="mr-auto flex items-center gap-1 text-xs text-muted-foreground"><MessageSquare className="h-3.5 w-3.5" />Nota</button>}
                  {qty > 0 && <button aria-label="Quitar" onClick={() => upd(it.id, { qty: qty - 1 })} className="grid h-11 w-11 place-items-center rounded-full border-2 border-gold"><Minus className="h-5 w-5" /></button>}
                  {qty > 0 && <span key={qty} className="w-6 animate-pop text-center text-lg font-bold">{qty}</span>}
                  <button aria-label="Añadir" disabled={!it.available} onClick={() => upd(it.id, { qty: qty + 1 })} className="grid h-11 w-11 place-items-center rounded-full bg-gold text-navy disabled:opacity-40"><Plus className="h-5 w-5" /></button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
