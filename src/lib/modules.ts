import type { BrandConfig, Item } from "@/config/brand";

export type StaffArea = "salon" | "cocina" | "bar" | "mostrador" | "admin";
export type ModuleRoute = StaffArea | "carta" | "tienda";

export function moduleEnabled(c: BrandConfig, area: ModuleRoute): boolean {
  const carta = c.modules.cafeteria || c.modules.bar;
  switch (area) {
    case "admin": return true;
    case "tienda": case "mostrador": return c.modules.tienda;
    case "carta": return carta;
    case "salon": return carta && c.modules.salon;
    case "cocina": return c.modules.cafeteria;
    case "bar": return carta;
  }
}

// Solo bar: no ofrecer platos que necesitan una cocina apagada.
export function menuItemEnabled(c: BrandConfig, item: Item): boolean {
  const category = c.categories.find((k) => k.id === item.categoryId);
  return Boolean(category?.kind === "carta" && c.modules[category.line] &&
    item.area && moduleEnabled(c, item.area));
}

export function shopStock(item: Item): number {
  return Math.max(0, Math.floor(item.stock ?? 0));
}