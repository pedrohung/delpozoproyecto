import { beforeEach, describe, expect, it } from "vitest";
import { defaultBrand } from "@/config/brand";
import { canAccess, closeAccount, dayReport, getState, login, markServed, openOrders, placeOrder, requestBill, sessionHome, setAreaStatus, setState, shopSale, updateConfig, type Session } from "@/lib/store";
import { menuItemEnabled, moduleEnabled } from "@/lib/modules";

beforeEach(() => {
  setState(() => ({ config: structuredClone(defaultBrand), orders: [], sales: [], punches: [], bills: [], counter: 0, session: null }));
});

const areas = ["salon", "cocina", "bar", "mostrador", "admin"] as const;
describe("Acceso por puesto", () => {
  it.each([["1111", "salon"], ["2222", "cocina"], ["3333", "bar"], ["4444", "mostrador"]] as const)("cada código %s abre solo %s", (code, allowed) => {
    const session = login(code);
    expect(session).not.toBeNull();
    for (const area of areas) expect(canAccess(session, area)).toBe(area === allowed);
  });
  it("el encargado entra a todas las áreas operativas; administración requiere propietaria", () => {
    const session = login("1234");
    for (const area of areas.filter((a) => a !== "admin")) expect(canAccess(session, area)).toBe(true);
    expect(canAccess(session, "admin")).toBe(false);
  });
  it("sin sesión no se entra a ninguna área", () => {
    for (const area of areas) expect(canAccess(null, area)).toBe(false);
  });
});

it("el precio de pedidos y ventas queda congelado", () => {
  const place = { kind: "mesa", n: 1 } as const;
  const order = placeOrder(place, "qr", [{ itemId: "c1", qty: 2 }]);
  expect(order?.lines[0]?.price).toBe(60);
  updateConfig((c) => ({ ...c, items: c.items.map((i) => i.id === "c1" ? { ...i, price: 900 } : i) }));
  expect(getState().orders[0]?.lines[0]?.price).toBe(60);
  closeAccount(place);
  updateConfig((c) => ({ ...c, items: c.items.map((i) => i.id === "c1" ? { ...i, price: 1200 } : i) }));
  expect(getState().sales[0]?.total).toBe(120);
  expect(getState().sales[0]?.lines[0]?.price).toBe(60);
});

it("QR → listo → servido → cuenta → cobrar → arqueo y cierre del día", () => {
  const place = { kind: "mesa", n: 3 } as const;
  const order = placeOrder(place, "qr", [{ itemId: "c1", qty: 1 }, { itemId: "p1", qty: 1 }]);
  if (!order) throw new Error("El pedido debe existir");
  setAreaStatus(order.id, "bar", "preparando");
  setAreaStatus(order.id, "bar", "listo");
  expect(getState().orders[0]?.lines[1]?.status).toBe("pendiente");
  setAreaStatus(order.id, "cocina", "listo");
  markServed(place);
  expect(getState().orders[0]?.lines.every((l) => l.status === "servido")).toBe(true);
  requestBill(place);
  expect(getState().bills).toContain("mesa-3");
  closeAccount(place);
  expect(openOrders(getState(), place)).toHaveLength(0);
  expect(getState().bills).not.toContain("mesa-3");
  const report = dayReport(getState());
  expect(report.sales).toHaveLength(1);
  expect(report.total).toBe(1510);
  expect(report.byVia.find((v) => v.v === "qr")?.n).toBe(1510);
  closeAccount(place);
  expect(getState().sales).toHaveLength(1);
});

it("solo tienda apaga carta, salón y estaciones; acceso del camarero no encuentra destino", () => {
  updateConfig((c) => ({ ...c, modules: { tienda: true, cafeteria: false, bar: false, salon: true } }));
  const c = getState().config;
  for (const area of ["carta", "salon", "cocina", "bar"] as const) expect(moduleEnabled(c, area)).toBe(false);
  expect(moduleEnabled(c, "mostrador")).toBe(true);
  expect(moduleEnabled(c, "admin")).toBe(true);
  const waiter: Session = { workerId: "w2", role: "camarero", name: "Luis" };
  expect(sessionHome(waiter, c)).toBeNull();
  const manager = login("1234");
  if (!manager) throw new Error("Encargado no encontrado");
  expect(sessionHome(manager, c)).toBe("/mostrador");
});

it("solo bar no ofrece platos de cocina apagada", () => {
  updateConfig((c) => ({ ...c, modules: { tienda: false, cafeteria: false, bar: true, salon: true } }));
  const c = getState().config;
  const croquettes = c.items.find((i) => i.id === "k1");
  const beer = c.items.find((i) => i.id === "e1");
  if (!croquettes || !beer) throw new Error("Faltan ejemplos");
  expect(menuItemEnabled(c, croquettes)).toBe(false);
  expect(menuItemEnabled(c, beer)).toBe(true);
  expect(placeOrder({ kind: "mesa", n: 1 }, "qr", [{ itemId: "k1", qty: 1 }])).toBeNull();
});

it("stock de tienda se descuenta, agota y no admite sobreventa; carta no lleva stock", () => {
  updateConfig((c) => ({ ...c, items: c.items.map((i) => i.id === "t1" ? { ...i, stock: 2 } : i) }));
  expect(shopSale([{ itemId: "t1", qty: 3 }])).toBeNull();
  expect(shopSale([{ itemId: "t1", qty: 2 }])?.total).toBe(760);
  const item = getState().config.items.find((i) => i.id === "t1");
  expect(item?.stock).toBe(0);
  expect(item?.available).toBe(false);
  expect(shopSale([{ itemId: "t1", qty: 1 }])).toBeNull();
  expect(getState().sales).toHaveLength(1);
  expect(getState().config.items.find((i) => i.id === "c1")?.stock).toBeUndefined();
});

it("duplicados en cesta no permiten vender más stock y el cierre excluye otros días", () => {
  updateConfig((c) => ({ ...c, items: c.items.map((i) => i.id === "t1" ? { ...i, stock: 2 } : i) }));
  expect(shopSale([{ itemId: "t1", qty: 2 }, { itemId: "t1", qty: 1 }])).toBeNull();
  const sale = shopSale([{ itemId: "t1", qty: 1 }]);
  if (!sale) throw new Error("Venta no creada");
  setState((s) => ({ ...s, sales: [...s.sales, { ...sale, id: "yesterday", at: Date.now() - 86400000 }] }));
  expect(dayReport(getState()).total).toBe(380);
});