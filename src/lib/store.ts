import { useSyncExternalStore } from "react";
import { defaultBrand, type Area, type BrandConfig, type Line, type Role } from "@/config/brand";

export type PlaceKind = "mesa" | "banqueta" | "mostrador";
export interface Place { kind: PlaceKind; n: number }
export type LineStatus = "pendiente" | "preparando" | "listo" | "servido";

export interface OrderLine {
  itemId: string; name: string; price: number; qty: number; note?: string;
  area: Area | null; categoryId: string; line: Line; status: LineStatus;
}
export interface Order {
  id: string; num: number; place: Place; origin: "qr" | "comanda" | "tienda";
  createdAt: number; lines: OrderLine[]; paid: boolean;
}
export interface Sale {
  id: string; at: number; total: number; via: "qr" | "comanda" | "tienda";
  place?: Place; lines: OrderLine[];
}
export interface Punch { id: string; workerId: string; in: number; out?: number }
export interface Session { workerId: string; role: Role | "propietario"; name: string }

export interface State {
  config: BrandConfig;
  orders: Order[];
  sales: Sale[];
  punches: Punch[];
  bills: string[]; // claves de sitio que pidieron la cuenta
  counter: number;
  session: Session | null;
}

const KEY = "estrella-state-v1";
const initial: State = { config: defaultBrand, orders: [], sales: [], punches: [], bills: [], counter: 0, session: null };

let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch { /* estado por defecto */ }
  window.addEventListener("storage", (e) => {
    if (e.key === KEY && e.newValue) {
      state = { ...initial, ...JSON.parse(e.newValue) };
      listeners.forEach((l) => l());
    }
  });
}

export function setState(fn: (s: State) => State) {
  load();
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* lleno */ }
  listeners.forEach((l) => l());
}

export function getState() { load(); return state; }

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => { load(); listeners.add(cb); return () => listeners.delete(cb); },
    () => sel(getState()),
    () => sel(initial),
  );
}

export const placeKey = (p: Place) => `${p.kind}-${p.n}`;
export const placeLabel = (p: Place) =>
  p.kind === "mesa" ? `Mesa ${p.n}` : p.kind === "banqueta" ? `Banqueta ${p.n}` : `Mostrador #${p.n}`;
export const uid = () => Math.random().toString(36).slice(2, 10);
export const lineTotal = (lines: OrderLine[]) => lines.reduce((a, l) => a + l.price * l.qty, 0);

export function money(n: number, currency = getState().config.currency) {
  return `${n.toLocaleString("es-ES")} ${currency}`;
}

export interface CartLine { itemId: string; qty: number; note?: string }

export function placeOrder(place: Place, origin: Order["origin"], cart: CartLine[]): Order | null {
  const { config } = getState();
  const lines: OrderLine[] = cart.filter((c) => c.qty > 0).map((c) => {
    const it = config.items.find((x) => x.id === c.itemId)!;
    const cat = config.categories.find((x) => x.id === it.categoryId);
    return { itemId: it.id, name: it.name, price: it.price, qty: c.qty, note: c.note, area: it.area,
      categoryId: it.categoryId, line: cat?.line ?? "cafeteria", status: "pendiente" };
  });
  if (!lines.length) return null;
  let order: Order | null = null;
  setState((s) => {
    const num = s.counter + 1;
    order = { id: uid(), num, place, origin, createdAt: Date.now(), lines, paid: false };
    return { ...s, counter: num, orders: [...s.orders, order] };
  });
  return order;
}

export function openOrders(s: State, place: Place) {
  return s.orders.filter((o) => !o.paid && placeKey(o.place) === placeKey(place));
}

export function setAreaStatus(orderId: string, area: Area, status: LineStatus) {
  setState((s) => ({ ...s, orders: s.orders.map((o) => o.id !== orderId ? o : {
    ...o, lines: o.lines.map((l) => (l.area === area && l.status !== "servido" ? { ...l, status } : l)) }) }));
}

export function markServed(place: Place) {
  setState((s) => ({ ...s, orders: s.orders.map((o) => o.paid || placeKey(o.place) !== placeKey(place) ? o : {
    ...o, lines: o.lines.map((l) => (l.status === "listo" ? { ...l, status: "servido" } : l)) }) }));
}

export function requestBill(place: Place) {
  setState((s) => ({ ...s, bills: Array.from(new Set([...s.bills, placeKey(place)])) }));
}

export function closeAccount(place: Place, via: Sale["via"] = "comanda") {
  setState((s) => {
    const open = openOrders(s, place);
    if (!open.length) return s;
    const lines = open.flatMap((o) => o.lines);
    const hasQr = open.some((o) => o.origin === "qr");
    const sale: Sale = { id: uid(), at: Date.now(), total: lineTotal(lines), via: hasQr ? "qr" : via, place, lines };
    const ids = new Set(open.map((o) => o.id));
    return { ...s, sales: [...s.sales, sale], bills: s.bills.filter((b) => b !== placeKey(place)),
      orders: s.orders.map((o) => (ids.has(o.id) ? { ...o, paid: true } : o)) };
  });
}

export function shopSale(cart: CartLine[]): Sale | null {
  const { config } = getState();
  const lines: OrderLine[] = cart.filter((c) => c.qty > 0).map((c) => {
    const it = config.items.find((x) => x.id === c.itemId)!;
    return { itemId: it.id, name: it.name, price: it.price, qty: c.qty, area: null, categoryId: it.categoryId, line: "tienda", status: "servido" };
  });
  if (!lines.length) return null;
  const sale: Sale = { id: uid(), at: Date.now(), total: lineTotal(lines), via: "tienda", lines };
  setState((s) => ({ ...s, sales: [...s.sales, sale] }));
  return sale;
}

export function updateConfig(fn: (c: BrandConfig) => BrandConfig) {
  setState((s) => ({ ...s, config: fn(s.config) }));
}

export function login(code: string): Session | null {
  const s = getState();
  const w = s.config.workers.find((x) => x.code === code);
  if (!w) return null;
  const session: Session = { workerId: w.id, role: w.role, name: w.name };
  const open = s.punches.find((p) => p.workerId === w.id && !p.out);
  setState((st) => ({ ...st, session,
    punches: open ? st.punches : [...st.punches, { id: uid(), workerId: w.id, in: Date.now() }] }));
  return session;
}

export function ownerLogin(pw: string) {
  if (pw !== getState().config.ownerPassword) return false;
  setState((s) => ({ ...s, session: { workerId: "owner", role: "propietario", name: "Propietaria" } }));
  return true;
}

export function logout(clockOut: boolean) {
  setState((s) => {
    const id = s.session?.workerId;
    return { ...s, session: null,
      punches: clockOut && id ? s.punches.map((p) => (p.workerId === id && !p.out ? { ...p, out: Date.now() } : p)) : s.punches };
  });
}

export const roleHome: Record<Role, string> = {
  camarero: "/salon", cocinero: "/cocina", barman: "/bar", dependiente: "/mostrador", encargado: "/salon",
};

export function canAccess(session: Session | null, area: "salon" | "cocina" | "bar" | "mostrador" | "admin") {
  if (!session) return false;
  if (session.role === "propietario") return true;
  if (area === "admin") return false;
  if (session.role === "encargado") return true;
  return ({ salon: "camarero", cocina: "cocinero", bar: "barman", mostrador: "dependiente" } as const)[area] === session.role;
}
