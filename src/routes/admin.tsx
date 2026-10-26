import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Palette, BookOpen, Users, Wallet, Clock3, LayoutGrid, QrCode, Printer, Dices, Plus, Trash2 } from "lucide-react";
import { StaffShell } from "@/components/staff/StaffShell";
import { StarLogo } from "@/components/brand/StarLogo";
import { ModuleError } from "@/components/brand/ModuleState";
import { lineLabel, roleLabel, type Area, type Role } from "@/config/brand";
import { dayReport, money, setState, uid, updateConfig, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Administración — La Estrella Cubana" },
    { name: "description", content: "Personalización, carta, trabajadores, ventas y caja." },
    { property: "og:title", content: "Administración" }, { property: "og:description", content: "Gestión del negocio." },
  ] }),
  component: Admin,
  errorComponent: ModuleError,
});

const TABS = [
  { id: "marca", label: "Personalización", icon: Palette },
  { id: "carta", label: "Carta y catálogo", icon: BookOpen },
  { id: "equipo", label: "Trabajadores", icon: Users },
  { id: "ventas", label: "Ventas y caja", icon: Wallet },
  { id: "horas", label: "Horas", icon: Clock3 },
  { id: "salon", label: "Salón", icon: LayoutGrid },
  { id: "qr", label: "Códigos QR", icon: QrCode },
] as const;
type Tab = (typeof TABS)[number]["id"];

function Admin() {
  const [tab, setTab] = useState<Tab>("marca");
  const config = useStore((s) => s.config);
  return (
    <StaffShell area="admin">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {TABS.filter((t) => t.id !== "salon" || (config.modules.salon && (config.modules.cafeteria || config.modules.bar))).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-bold ${tab === t.id ? "border-gold bg-gold text-navy" : "border-border"}`}><t.icon className="h-4 w-4" />{t.label}</button>
          ))}
        </div>
        {tab === "marca" && <TabMarca />}
        {tab === "carta" && <TabCarta />}
        {tab === "equipo" && <TabEquipo />}
        {tab === "ventas" && <TabVentas />}
        {tab === "horas" && <TabHoras />}
        {tab === "salon" && <TabSalon />}
        {tab === "qr" && <TabQr />}
      </div>
    </StaffShell>
  );
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-sm font-semibold text-muted-foreground">{label}</span>{children}</label>;
}

function TabMarca() {
  const c = useStore((s) => s.config);
  const set = (patch: Partial<typeof c>) => updateConfig((x) => ({ ...x, ...patch }));
  const setColor = (k: keyof typeof c.colors, v: string) => updateConfig((x) => ({ ...x, colors: { ...x.colors, [k]: v } }));
  const colorFields: [keyof typeof c.colors, string][] = [["navy", "Azul marino (fondo)"], ["blue", "Azul bandera"], ["red", "Rojo cubano"], ["gold", "Dorado"], ["cream", "Crema (superficie)"]];
  const mods: [keyof typeof c.modules, string][] = [["tienda", "Tienda"], ["cafeteria", "Cafetería"], ["bar", "Bar"], ["salon", "Salón (mesas)"]];
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg">Datos del negocio</h2>
        <Field label="Prefijo (caligráfico)"><input className={inputCls} value={c.prefix} onChange={(e) => set({ prefix: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre, línea 1"><input className={inputCls} value={c.nameLine1} onChange={(e) => set({ nameLine1: e.target.value, name: `${e.target.value} ${c.nameLine2}` })} /></Field>
          <Field label="Nombre, línea 2"><input className={inputCls} value={c.nameLine2} onChange={(e) => set({ nameLine2: e.target.value, name: `${c.nameLine1} ${e.target.value}` })} /></Field>
        </div>
        <Field label="Lema"><input className={inputCls} value={c.slogan} onChange={(e) => set({ slogan: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dirección"><input className={inputCls} value={c.address} onChange={(e) => set({ address: e.target.value })} /></Field>
          <Field label="Detalle"><input className={inputCls} value={c.addressDetail} onChange={(e) => set({ addressDetail: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Teléfono"><input className={inputCls} value={c.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
          <Field label="Ciudad"><input className={inputCls} value={c.city} onChange={(e) => set({ city: e.target.value })} /></Field>
          <Field label="Moneda"><input className={inputCls} value={c.currency} onChange={(e) => set({ currency: e.target.value })} /></Field>
        </div>
        <Field label="Contraseña del propietario"><input type="password" className={inputCls} value={c.ownerPassword} onChange={(e) => set({ ownerPassword: e.target.value })} /></Field>
      </section>
      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-lg">Colores de marca</h2>
        {colorFields.map(([k, label]) => (
          <div key={k} className="flex items-center gap-3">
            <input type="color" value={c.colors[k]} onChange={(e) => setColor(k, e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-border" />
            <span className="flex-1 text-sm font-semibold">{label}</span><code className="text-xs text-muted-foreground">{c.colors[k]}</code>
          </div>
        ))}
        <h2 className="pt-3 font-display text-lg">Módulos activos</h2>
        {mods.map(([k, label]) => (
          <button key={k} onClick={() => updateConfig((x) => ({ ...x, modules: { ...x.modules, [k]: !x.modules[k] } }))}
            className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 font-semibold ${c.modules[k] ? "border-free" : "border-border opacity-60"}`}>
            {label}<span className={`rounded-full px-3 py-1 text-xs font-bold ${c.modules[k] ? "bg-free text-navy" : "bg-muted"}`}>{c.modules[k] ? "Encendido" : "Apagado"}</span>
          </button>
        ))}
        <p className="text-xs text-muted-foreground">Lo apagado desaparece de los menús y de la web pública al instante.</p>
      </section>
    </div>
  );
}

function TabCarta() {
  const c = useStore((s) => s.config);
  const [newCat, setNewCat] = useState("");
  const patchItem = (id: string, patch: Record<string, unknown>) => updateConfig((x) => ({ ...x, items: x.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  return (
    <div className="space-y-6">
      {c.categories.map((k) => (
        <section key={k.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg">{k.name} <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-sans">{k.kind === "carta" ? lineLabel[k.line] : "Tienda"}</span></h2>
            <button className="btn-ghost-gold !px-3 !py-1.5 text-sm" onClick={() => updateConfig((x) => ({ ...x, items: [...x.items, { id: uid(), categoryId: k.id, name: "Nuevo", description: "", price: 0, area: k.kind === "carta" ? "cocina" : null, available: true, ...(k.kind === "tienda" ? { stock: 0, available: false } : {}) }] }))}><Plus className="h-4 w-4" /> Añadir</button>
          </div>
          <div className="space-y-2">
            {c.items.filter((i) => i.categoryId === k.id).map((it) => (
              <div key={it.id} className="grid grid-cols-[1fr_90px] items-center gap-2 rounded-xl border border-border p-2 md:grid-cols-[1fr_110px_130px_110px_40px]">
                <input className={inputCls} value={it.name} onChange={(e) => patchItem(it.id, { name: e.target.value })} />
                <input className={inputCls} type="number" min={0} value={it.price} onChange={(e) => patchItem(it.id, { price: Number(e.target.value) })} title={`Precio en ${c.currency}`} />
                {k.kind === "carta" ? (
                  <select className={inputCls} value={it.area ?? "cocina"} onChange={(e) => patchItem(it.id, { area: e.target.value as Area })}>
                    <option value="cocina">Cocina</option><option value="bar">Bar</option>
                  </select>
                ) : <Field label={`Stock · ${it.name}`}><input className={inputCls} type="number" min={0} step={1} value={it.stock ?? 0} onChange={(e) => { const stock = Math.max(0, Math.floor(Number(e.target.value) || 0)); patchItem(it.id, { stock, available: stock > 0 }); }} /></Field>}
                <button disabled={k.kind === "tienda" && (it.stock ?? 0) === 0} onClick={() => patchItem(it.id, { available: !it.available })} className={`rounded-full px-3 py-2 text-xs font-bold ${it.available ? "bg-free text-navy" : "bg-cuban text-cream"}`}>{it.available ? "Hay" : "Se acabó"}</button>
                <button aria-label="Eliminar" onClick={() => updateConfig((x) => ({ ...x, items: x.items.filter((i) => i.id !== it.id) }))} className="hidden justify-self-end rounded-full p-2 text-muted-foreground hover:text-cuban md:block"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </section>
      ))}
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!newCat.trim()) return; updateConfig((x) => ({ ...x, categories: [...x.categories, { id: uid(), name: newCat.trim(), kind: "carta", line: "cafeteria" }] })); setNewCat(""); }}>
        <input className={inputCls} placeholder="Nueva categoría de la carta…" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
        <button className="btn-gold whitespace-nowrap"><Plus className="h-4 w-4" /> Crear</button>
      </form>
      <p className="text-xs text-muted-foreground">Cambiar un precio nunca altera las ventas ya cobradas: cada venta guarda su propio precio.</p>
    </div>
  );
}

function TabEquipo() {
  const c = useStore((s) => s.config);
  const roles = Object.keys(roleLabel) as Role[];
  return (
    <div className="space-y-3">
      {c.workers.map((w) => (
        <div key={w.id} className="grid grid-cols-[1fr_130px] items-center gap-2 rounded-xl border border-border bg-card p-3 md:grid-cols-[1fr_160px_140px_44px_44px]">
          <input className={inputCls} value={w.name} onChange={(e) => updateConfig((x) => ({ ...x, workers: x.workers.map((y) => (y.id === w.id ? { ...y, name: e.target.value } : y)) }))} />
          <select className={inputCls} value={w.role} onChange={(e) => updateConfig((x) => ({ ...x, workers: x.workers.map((y) => (y.id === w.id ? { ...y, role: e.target.value as Role } : y)) }))}>
            {roles.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
          </select>
          <input className={`${inputCls} hidden text-center font-display tracking-widest md:block`} value={w.code} onChange={(e) => updateConfig((x) => ({ ...x, workers: x.workers.map((y) => (y.id === w.id ? { ...y, code: e.target.value.replace(/\D/g, "").slice(0, 6) } : y)) }))} />
          <button aria-label="Código aleatorio" title="Generar código aleatorio" onClick={() => updateConfig((x) => ({ ...x, workers: x.workers.map((y) => (y.id === w.id ? { ...y, code: String(Math.floor(1000 + Math.random() * 9000)) } : y)) }))} className="hidden rounded-full border border-border p-2 hover:border-gold md:block"><Dices className="h-5 w-5" /></button>
          <button aria-label="Eliminar" onClick={() => updateConfig((x) => ({ ...x, workers: x.workers.filter((y) => y.id !== w.id) }))} className="hidden rounded-full p-2 text-muted-foreground hover:text-cuban md:block"><Trash2 className="h-5 w-5" /></button>
        </div>
      ))}
      <button className="btn-gold" onClick={() => updateConfig((x) => ({ ...x, workers: [...x.workers, { id: uid(), name: "Nuevo trabajador", role: "camarero", code: String(Math.floor(1000 + Math.random() * 9000)) }] }))}><Plus className="h-4 w-4" /> Añadir trabajador</button>
      <p className="text-xs text-muted-foreground">Cada código abre solo el área de su puesto. El encargado entra a todo.</p>
    </div>
  );
}

function TabVentas() {
  const s = useStore((x) => x);
  const [cierre, setCierre] = useState(false);
  const { sales, total, byLine, byVia, hours } = dayReport(s);
  const viaLabel = { qr: "QR del cliente", comanda: "Comanda", tienda: "Mostrador" } as const;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border-2 border-gold bg-card p-5 text-center"><div className="text-sm uppercase tracking-widest text-muted-foreground">Total del día</div><div className="font-display text-4xl text-gold">{money(total, s.config.currency)}</div></div>
        <div className="rounded-2xl border border-border bg-card p-5 text-center"><div className="text-sm uppercase tracking-widest text-muted-foreground">Ventas / tickets</div><div className="font-display text-4xl">{sales.length}</div></div>
        <button className="btn-gold self-center" onClick={() => { setCierre(true); setTimeout(() => window.print(), 100); }}><Printer className="h-5 w-5" /> Cierre del día (imprimir)</button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5"><h2 className="mb-3 font-display text-lg">Por línea de negocio</h2>
          {byLine.map(({ l, n }) => <div key={l} className="flex justify-between border-b border-border py-2 last:border-0"><span>{lineLabel[l]}</span><strong>{money(n, s.config.currency)}</strong></div>)}</section>
        <section className="rounded-2xl border border-border bg-card p-5"><h2 className="mb-3 font-display text-lg">Por vía</h2>
          {byVia.map(({ v, n }) => <div key={v} className="flex justify-between border-b border-border py-2 last:border-0"><span>{viaLabel[v]}</span><strong>{money(n, s.config.currency)}</strong></div>)}</section>
      </div>
      <section className="rounded-2xl border border-border bg-card p-5"><h2 className="mb-3 font-display text-lg">Ventas de hoy</h2>
        {sales.length === 0 && <p className="text-muted-foreground">Todavía no hay ventas hoy.</p>}
        {sales.slice().reverse().map((v) => (
          <div key={v.id} className="flex justify-between border-b border-border py-2 text-sm last:border-0">
            <span>{new Date(v.at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} · {viaLabel[v.via]}{v.place ? ` · ${v.place.kind} ${v.place.n}` : ""}</span>
            <strong>{money(v.total, s.config.currency)}</strong>
          </div>))}
      </section>
      {cierre && (
        <div className="print-area">
          <h2 style={{ fontSize: 16, fontWeight: 700 }}>{s.config.name} — Cierre del día</h2>
          <p>{new Date().toLocaleDateString("es-ES", { dateStyle: "full" })}</p><hr />
          <p><strong>Total: {money(total, s.config.currency)}</strong> · {sales.length} ventas</p>
          {byLine.map(({ l, n }) => <p key={l}>{lineLabel[l]}: {money(n, s.config.currency)}</p>)}
          {byVia.map(({ v, n }) => <p key={v}>{viaLabel[v]}: {money(n, s.config.currency)}</p>)}
          <hr /><p><strong>Horas del personal</strong></p>
          {hours.map(({ p, h }) => <p key={p.id}>{s.config.workers.find((w) => w.id === p.workerId)?.name ?? "?"}: {h.toFixed(1)} h</p>)}
        </div>
      )}
    </div>
  );
}

function TabHoras() {
  const s = useStore((x) => x);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const rows = s.config.workers.map((w) => {
    const ps = s.punches.filter((p) => p.workerId === w.id && new Date(p.in).toISOString().startsWith(month));
    const h = ps.reduce((a, p) => a + ((p.out ?? Date.now()) - p.in) / 36e5, 0);
    return { w, ps, h };
  });
  return (
    <div className="space-y-4">
      <Field label="Mes"><input type="month" className={`${inputCls} max-w-xs`} value={month} onChange={(e) => setMonth(e.target.value)} /></Field>
      {rows.map(({ w, ps, h }) => (
        <section key={w.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-2 flex items-center justify-between"><h2 className="font-display text-lg">{w.name} <span className="text-sm font-sans text-muted-foreground">· {roleLabel[w.role]}</span></h2><strong className="font-display text-xl text-gold">{h.toFixed(1)} h</strong></div>
          {ps.length === 0 && <p className="text-sm text-muted-foreground">Sin fichajes este mes.</p>}
          {ps.map((p) => (
            <div key={p.id} className="flex justify-between border-b border-border py-1.5 text-sm last:border-0">
              <span>{new Date(p.in).toLocaleDateString("es-ES")} · {new Date(p.in).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })} → {p.out ? new Date(p.out).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) : "en turno"}</span>
              <span>{(((p.out ?? Date.now()) - p.in) / 36e5).toFixed(1)} h</span>
            </div>))}
        </section>
      ))}
    </div>
  );
}

function TabSalon() {
  const c = useStore((s) => s.config);
  return (
    <div className="grid max-w-md gap-4 rounded-2xl border border-border bg-card p-5">
      <Field label="Número de mesas"><input type="number" min={0} max={40} className={inputCls} value={c.salon.tables} onChange={(e) => updateConfig((x) => ({ ...x, salon: { ...x.salon, tables: Number(e.target.value) } }))} /></Field>
      <Field label="Banquetas de la barra"><input type="number" min={0} max={30} className={inputCls} value={c.salon.stools} onChange={(e) => updateConfig((x) => ({ ...x, salon: { ...x.salon, stools: Number(e.target.value) } }))} /></Field>
      <p className="text-xs text-muted-foreground">El plano del salón se redibuja solo con estas cantidades.</p>
    </div>
  );
}

function TabQr() {
  const c = useStore((s) => s.config);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const codes = [
    ...Array.from({ length: (c.modules.cafeteria || c.modules.bar) && c.modules.salon ? c.salon.tables : 0 }, (_, k) => ({ label: `Mesa ${k + 1}`, url: `${origin}/carta?mesa=${k + 1}` })),
    ...Array.from({ length: (c.modules.cafeteria || c.modules.bar) && c.modules.salon ? c.salon.stools : 0 }, (_, k) => ({ label: `Banqueta ${k + 1}`, url: `${origin}/carta?banqueta=${k + 1}` })),
    ...(c.modules.tienda ? [{ label: "Tienda", url: `${origin}/tienda` }] : []),
  ];
  return (
    <div>
      <button className="btn-gold mb-6" onClick={() => window.print()}><Printer className="h-5 w-5" /> Imprimir hoja de QR</button>
      <div className="print-area print-show grid grid-cols-2 gap-4 md:grid-cols-4">
        {codes.map((q) => (
          <div key={q.label} className="flex flex-col items-center gap-2 rounded-2xl border-2 border-gold bg-card p-4 text-center">
            <StarLogo className="h-8 w-8" />
            <QRCodeSVG value={q.url} size={120} fgColor="#011530" bgColor="#FDF5EA" />
            <strong className="font-display text-sm uppercase">{q.label}</strong>
            <span className="text-[10px] text-muted-foreground">{c.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function resetDemo() { setState((s) => ({ ...s, orders: [], sales: [], bills: [] })); }
