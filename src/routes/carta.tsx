import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { StarLogo } from "@/components/brand/StarLogo";
import { ModuleError, ModuleUnavailable } from "@/components/brand/ModuleState";
import { MenuPicker } from "@/components/MenuPicker";
import { money, placeLabel, placeOrder, requestBill, useStore, getState, type CartLine, type Order, type Place } from "@/lib/store";

type Search = { mesa?: number; banqueta?: number; cat?: string };

export const Route = createFileRoute("/carta")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mesa: s.mesa ? Number(s.mesa) : undefined,
    banqueta: s.banqueta ? Number(s.banqueta) : undefined,
    cat: typeof s.cat === "string" ? s.cat : undefined,
  }),
  head: () => ({ meta: [
    { title: "La carta — La Estrella Cubana" },
    { name: "description", content: "Cafetería, batidos, parrilladas, sándwiches, picaderas y cervezas. Pide desde tu mesa." },
    { property: "og:title", content: "La carta de La Estrella Cubana" },
    { property: "og:description", content: "Pide desde tu mesa leyendo el QR." },
  ] }),
  component: Carta,
  errorComponent: ModuleError,
});

function Carta() {
  const { mesa, banqueta, cat } = Route.useSearch();
  const c = useStore((s) => s.config);
  const place: Place | null = mesa ? { kind: "mesa", n: mesa } : banqueta ? { kind: "banqueta", n: banqueta } : null;
  const [cart, setCart] = useState<CartLine[]>([]);
  const [sent, setSent] = useState<Order | null>(null);
  const [billAsked, setBillAsked] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (ready && !c.modules.cafeteria && !c.modules.bar) return <ModuleUnavailable title="La carta no está activa" />;
  const total = cart.reduce((a, l) => a + (getState().config.items.find((i) => i.id === l.itemId)?.price ?? 0) * l.qty, 0);
  const count = cart.reduce((a, l) => a + l.qty, 0);

  if (sent) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy p-6 text-center text-cream">
      <StarLogo className="h-32 w-32" animated />
      <p className="mt-4 font-script text-4xl text-gold">¡Gracias!</p>
      <h1 className="font-display text-3xl uppercase">Pedido enviado</h1>
      <div className="mt-6 rounded-2xl border-2 border-gold px-10 py-5"><div className="text-sm uppercase tracking-widest text-cream/70">Número de pedido</div><div className="font-display text-6xl text-gold">#{sent.num}</div></div>
      <p className="mt-4 text-cream/80">{placeLabel(sent.place)} · Te lo llevamos enseguida.</p>
      <div className="mt-8 flex flex-col gap-3">
        <button className="btn-gold" onClick={() => { setSent(null); setCart([]); }}>Pedir algo más</button>
        {place && <button className="text-sm text-cream/60 underline-offset-4 hover:underline" disabled={billAsked} onClick={() => { requestBill(place); setBillAsked(true); }}>
          <Receipt className="mr-1 inline h-4 w-4" />{billAsked ? "Cuenta pedida, ya vamos" : "Pedir la cuenta"}</button>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-32">
      <header className="bg-navy px-4 pb-6 pt-5 text-cream">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <Link to="/"><StarLogo className="h-14 w-14" /></Link>
          <div className="flex-1"><p className="font-script text-2xl leading-none text-gold">La carta</p><h1 className="font-display text-xl uppercase">{c.name}</h1></div>
          {place ? <span className="rounded-full border-2 border-gold px-4 py-2 font-display text-sm">{placeLabel(place)}</span>
            : <span className="text-right text-xs text-cream/60">Lee el QR de tu mesa<br />para hacer el pedido</span>}
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-4"><MenuPicker cart={cart} setCart={setCart} initialCat={cat} /></div>
      {place && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-gold bg-navy p-3 text-cream">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="flex-1"><div className="text-xs uppercase tracking-widest text-cream/60">{count} {count === 1 ? "producto" : "productos"}</div><div key={total} className="animate-pop font-display text-2xl text-gold">{money(total, c.currency)}</div></div>
            <button className="btn-gold" disabled={!count} onClick={() => { const o = placeOrder(place, "qr", cart); if (o) setSent(o); }}>Enviar pedido</button>
          </div>
          <button className="mx-auto mt-1 block text-xs text-cream/50" onClick={() => { requestBill(place); setBillAsked(true); }}>{billAsked ? "Cuenta pedida" : "Pedir la cuenta"}</button>
        </div>
      )}
    </div>
  );
}
