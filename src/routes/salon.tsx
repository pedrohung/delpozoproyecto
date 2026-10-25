import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, Receipt, Send, CheckCheck, X } from "lucide-react";
import { StaffShell } from "@/components/staff/StaffShell";
import { ModuleError } from "@/components/brand/ModuleState";
import { MenuPicker } from "@/components/MenuPicker";
import { closeAccount, lineTotal, markServed, money, openOrders, placeKey, placeLabel, placeOrder, useStore, type CartLine, type Place, type State } from "@/lib/store";

export const Route = createFileRoute("/salon")({
  head: () => ({ meta: [
    { title: "Salón — La Estrella Cubana" },
    { name: "description", content: "Plano del salón: mesas y banquetas, comandas y cuentas." },
    { property: "og:title", content: "Salón" }, { property: "og:description", content: "Plano del salón y comandas." },
  ] }),
  component: Salon,
  errorComponent: ModuleError,
});

function elapsed(s: State, p: Place, now: number) {
  const open = openOrders(s, p);
  if (!open.length) return null;
  const min = Math.min(...open.map((o) => o.createdAt));
  const m = Math.max(0, Math.floor((now - min) / 60000));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${m % 60}`;
}

function Salon() {
  const s = useStore((x) => x);
  const [sel, setSel] = useState<Place | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 20000); return () => clearInterval(t); }, []);
  const { tables, stools } = s.config.salon;

  const seat = (p: Place, round: boolean) => {
    const open = openOrders(s, p);
    const busy = open.length > 0;
    const ready = open.some((o) => o.lines.some((l) => l.status === "listo"));
    const bill = s.bills.includes(placeKey(p));
    const t = elapsed(s, p, now);
    return (
      <button key={placeKey(p)} onClick={() => setSel(p)} aria-label={placeLabel(p)}
        className={`relative grid place-items-center font-display transition active:scale-95 ${round ? "h-16 w-16 rounded-full" : "h-24 w-24 rounded-xl"} border-4 ${sel && placeKey(sel) === placeKey(p) ? "border-gold" : "border-transparent"} ${busy ? "bg-busy text-cream" : "bg-free text-navy"}`}>
        <span className={round ? "text-lg" : "text-2xl"}>{p.n}</span>
        {t && <span className="absolute -bottom-6 text-xs font-sans font-semibold text-muted-foreground">{t}</span>}
        {ready && <Star className="absolute -right-2 -top-2 h-6 w-6 fill-gold text-gold drop-shadow animate-pop" />}
        {bill && <Receipt className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-gold p-1 text-navy" />}
      </button>
    );
  };

  return (
    <StaffShell area="salon">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center gap-6">
          <h1 className="font-display text-2xl uppercase">Salón</h1>
          <span className="flex items-center gap-2 text-sm"><i className="h-4 w-4 rounded bg-free" /> Libre</span>
          <span className="flex items-center gap-2 text-sm"><i className="h-4 w-4 rounded bg-busy" /> Ocupada</span>
          <span className="flex items-center gap-2 text-sm"><Star className="h-4 w-4 fill-gold text-gold" /> Algo listo</span>
          <span className="flex items-center gap-2 text-sm"><Receipt className="h-4 w-4 text-gold" /> Pidió la cuenta</span>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-12 rounded-2xl border border-border bg-card p-6">
            <div>
              <h2 className="mb-6 text-sm uppercase tracking-widest text-muted-foreground">Mesas</h2>
              <div className="flex flex-wrap gap-x-6 gap-y-10">{Array.from({ length: tables }, (_, k) => seat({ kind: "mesa", n: k + 1 }, false))}</div>
            </div>
            <div>
              <h2 className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">Barra</h2>
              <div className="relative rounded-full border-2 border-gold/40 bg-secondary px-6 py-8">
                <div className="absolute inset-x-10 top-1/2 h-1 -translate-y-1/2 rounded bg-gold/30" />
                <div className="relative flex flex-wrap justify-around gap-x-4 gap-y-8">{Array.from({ length: stools }, (_, k) => seat({ kind: "banqueta", n: k + 1 }, true))}</div>
              </div>
            </div>
          </div>
          {sel ? <Comanda place={sel} onClose={() => setSel(null)} /> : (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Toca una mesa o banqueta para abrir su comanda y su cuenta.</div>
          )}
        </div>
      </div>
    </StaffShell>
  );
}

function Comanda({ place, onClose }: { place: Place; onClose: () => void }) {
  const s = useStore((x) => x);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [tab, setTab] = useState<"pedir" | "cuenta">("pedir");
  const open = openOrders(s, place);
  const lines = open.flatMap((o) => o.lines);
  const total = lineTotal(lines);
  const ready = lines.some((l) => l.status === "listo");
  const cartCount = cart.reduce((a, l) => a + l.qty, 0);

  return (
    <aside className="flex flex-col rounded-2xl border-2 border-gold bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-display text-xl">{placeLabel(place)}</h2>
        <button onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
      </div>
      <div className="flex gap-1 p-2">
        {(["pedir", "cuenta"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 rounded-full py-2 text-sm font-bold capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{t === "pedir" ? "Comanda" : "Cuenta"}</button>
        ))}
      </div>
      {tab === "pedir" ? (
        <div className="flex-1 overflow-y-auto p-3">
          <MenuPicker cart={cart} setCart={setCart} compact />
          <button className="btn-gold mt-3 w-full" disabled={!cartCount} onClick={() => { placeOrder(place, "comanda", cart); setCart([]); setTab("cuenta"); }}>
            <Send className="h-4 w-4" /> Enviar a cocina y bar{cartCount ? ` (${cartCount})` : ""}
          </button>
        </div>
      ) : (
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {open.length === 0 && <p className="py-6 text-center text-muted-foreground">Sin pedidos abiertos.</p>}
          {open.map((o) => (
            <div key={o.id} className="rounded-xl border border-border p-3">
              <div className="mb-1 flex justify-between text-xs text-muted-foreground"><span>Pedido #{o.num} · {new Date(o.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span><span>{o.origin === "qr" ? "QR" : "Comanda"}</span></div>
              {o.lines.map((l, k) => (
                <div key={k} className="flex justify-between gap-2 text-sm">
                  <span>{l.qty}× {l.name}{l.note ? <em className="ml-1 text-xs text-cuban">({l.note})</em> : null}</span>
                  <span className="flex items-center gap-2"><EstadoDot status={l.status} />{money(l.price * l.qty, s.config.currency)}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border pt-3 font-display text-2xl"><span>Total</span><span className="text-gold">{money(total, s.config.currency)}</span></div>
          {ready && <button className="btn-ghost-gold w-full" onClick={() => markServed(place)}><CheckCheck className="h-4 w-4" /> Marcar servido</button>}
          <button className="btn-red w-full" disabled={!open.length} onClick={() => { closeAccount(place); onClose(); }}>Cobrar y cerrar</button>
        </div>
      )}
    </aside>
  );
}

export function EstadoDot({ status }: { status: string }) {
  const c = status === "listo" ? "bg-free" : status === "preparando" ? "bg-gold" : status === "servido" ? "bg-muted-foreground" : "bg-cuban";
  return <i title={status} className={`h-2.5 w-2.5 rounded-full ${c}`} />;
}
