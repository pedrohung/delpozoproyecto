import { useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";
import { StaffShell } from "@/components/staff/StaffShell";
import { placeLabel, setAreaStatus, useStore, type Order, type OrderLine } from "@/lib/store";
import type { Area } from "@/config/brand";

function beep() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; g.gain.setValueAtTime(0.2, ctx.currentTime);
    o.start(); o.stop(ctx.currentTime + 0.25);
    setTimeout(() => ctx.close(), 600);
  } catch { /* sin audio */ }
}

const NEXT: Record<string, { to: "preparando" | "listo"; label: string } | null> = {
  pendiente: { to: "preparando", label: "Empezar" },
  preparando: { to: "listo", label: "Marcar listo" },
  listo: null,
};

/** Pantalla de estación (Cocina o Bar): solo sus líneas, legible a dos metros. */
export function Estacion({ area, titulo, shellArea }: { area: Area; titulo: string; shellArea: "cocina" | "bar" }) {
  const s = useStore((x) => x);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const prevCount = useRef<number | null>(null);

  const orders = s.orders
    .filter((o) => !o.paid && o.lines.some((l) => l.area === area && l.status !== "servido"))
    .sort((a, b) => a.createdAt - b.createdAt);
  const pendingCount = s.orders.flatMap((o) => o.lines).filter((l) => l.area === area && l.status === "pendiente").length;

  useEffect(() => {
    if (prevCount.current !== null && pendingCount > prevCount.current) beep();
    prevCount.current = pendingCount;
  }, [pendingCount]);

  useEffect(() => {
    if (printOrder) { const t = setTimeout(() => { window.print(); setPrintOrder(null); }, 80); return () => clearTimeout(t); }
  }, [printOrder]);

  return (
    <StaffShell area={shellArea}>
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 font-display text-3xl uppercase">{titulo}</h1>
        {orders.length === 0 && <p className="rounded-2xl border border-dashed border-border p-12 text-center text-xl text-muted-foreground">Sin pedidos pendientes. Buen momento para limpiar.</p>}
        <div className="grid gap-4 md:grid-cols-2">
          {orders.map((o) => {
            const lines = o.lines.filter((l) => l.area === area && l.status !== "servido");
            const status = lines.every((l) => l.status === "listo") ? "listo" : lines.some((l) => l.status !== "pendiente") ? "preparando" : "pendiente";
            const next = NEXT[status];
            return (
              <article key={o.id} className={`rounded-2xl border-4 bg-card p-5 ${status === "pendiente" ? "animate-pulse-ring border-cuban" : status === "preparando" ? "border-gold" : "border-free"}`}>
                <header className="mb-3 flex items-center justify-between">
                  <div className="font-display text-2xl">{placeLabel(o.place)}</div>
                  <div className="text-right text-sm text-muted-foreground"><div>#{o.num}</div><div>{new Date(o.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</div></div>
                </header>
                <ul className="space-y-2">
                  {lines.map((l: OrderLine, k: number) => (
                    <li key={k} className="text-xl font-semibold"><span className="mr-2 font-display text-gold">{l.qty}×</span>{l.name}
                      {l.note && <div className="ml-8 text-base font-normal italic text-cuban">Nota: {l.note}</div>}</li>
                  ))}
                </ul>
                <div className="mt-4 flex gap-2">
                  {next && <button className={`flex-1 rounded-xl py-4 font-display text-lg uppercase transition active:scale-95 ${status === "pendiente" ? "bg-gold text-navy" : "bg-free text-navy"}`} onClick={() => setAreaStatus(o.id, area, next.to)}>{next.label}</button>}
                  {status === "listo" && <div className="flex-1 rounded-xl bg-free/20 py-4 text-center font-display text-lg uppercase text-free">Listo para servir</div>}
                  <button aria-label="Imprimir comanda" className="rounded-xl border-2 border-border px-4 hover:border-gold" onClick={() => setPrintOrder(o)}><Printer className="h-6 w-6" /></button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      {printOrder && (
        <div className="print-area">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>{titulo.toUpperCase()} — {s.config.name}</h2>
          <p>{placeLabel(printOrder.place)} · Pedido #{printOrder.num} · {new Date(printOrder.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</p>
          <hr />
          {printOrder.lines.filter((l) => l.area === area).map((l, k) => (
            <p key={k}><strong>{l.qty}× {l.name}</strong>{l.note ? <><br />Nota: {l.note}</> : null}</p>
          ))}
        </div>
      )}
    </StaffShell>
  );
}
