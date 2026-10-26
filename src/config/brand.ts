// Configuración de marca por defecto. TODO lo que cambia entre negocios vive aquí.
// Cambiar de negocio = cambiar esta configuración (o editarla en Administración).

export type Area = "cocina" | "bar";
export type Line = "tienda" | "cafeteria" | "bar";
export type Role = "camarero" | "cocinero" | "barman" | "dependiente" | "encargado";

export interface Category {
  id: string;
  name: string;
  kind: "carta" | "tienda";
  line: Line;
  photo?: string; // clave de foto local (ver src/lib/photos.ts) o dataURL
}

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  area: Area | null; // solo platos de la carta
  available: boolean;
  stock?: number; // Solo tienda; ausente en platos de carta.
  photo?: string;
}

export interface Worker {
  id: string;
  name: string;
  role: Role;
  code: string;
}

export interface BrandConfig {
  prefix: string;
  name: string;
  nameLine1: string;
  nameLine2: string;
  slogan: string;
  city: string;
  region: string;
  address: string;
  addressDetail: string;
  phone: string;
  currency: string;
  ownerPassword: string;
  colors: { navy: string; blue: string; red: string; gold: string; cream: string };
  modules: { tienda: boolean; cafeteria: boolean; bar: boolean; salon: boolean };
  salon: { tables: number; stools: number };
  photos: { hero: string; interior: string };
  categories: Category[];
  items: Item[];
  workers: Worker[];
}

const i = (id: string, categoryId: string, name: string, description: string, price: number, area: Area | null): Item => ({
  id, categoryId, name, description, price, area, available: true,
  ...(area === null ? { stock: 20 } : {}),
});

export const defaultBrand: BrandConfig = {
  prefix: "Mipyme",
  name: "La Estrella Cubana",
  nameLine1: "La Estrella",
  nameLine2: "Cubana",
  slogan: "Un ambiente familiar",
  city: "Manzanillo",
  region: "Granma, Cuba",
  address: "Maceo 28",
  addressDetail: "entre Villuenda y Sariol",
  phone: "23559451",
  currency: "CUP",
  ownerPassword: "estrella",
  colors: { navy: "#011530", blue: "#00247D", red: "#CE2029", gold: "#C9A227", cream: "#FDF5EA" },
  modules: { tienda: true, cafeteria: true, bar: true, salon: true },
  salon: { tables: 8, stools: 6 },
  photos: { hero: "malecon", interior: "interior" },
  categories: [
    { id: "cafeteria", name: "Cafetería", kind: "carta", line: "cafeteria", photo: "cafeteria" },
    { id: "batidos", name: "Batidos y Jugos", kind: "carta", line: "cafeteria" },
    { id: "parrilladas", name: "Parrilladas", kind: "carta", line: "cafeteria", photo: "parrilladas" },
    { id: "sandwiches", name: "Sándwiches", kind: "carta", line: "cafeteria" },
    { id: "picaderas", name: "Picaderas", kind: "carta", line: "bar" },
    { id: "cervezas", name: "Cervezas y Bebidas", kind: "carta", line: "bar" },
    { id: "alimentos", name: "Alimentos", kind: "tienda", line: "tienda" },
    { id: "confiteria", name: "Confitería", kind: "tienda", line: "tienda" },
    { id: "bebidas", name: "Bebidas", kind: "tienda", line: "tienda" },
    { id: "aseo", name: "Aseo Personal y Limpieza", kind: "tienda", line: "tienda" },
  ],
  items: [
    i("c1", "cafeteria", "Café cubano", "Espresso corto, cargado y dulce, como en casa.", 60, "bar"),
    i("c2", "cafeteria", "Cortadito", "Café con un toque de leche espumosa.", 90, "bar"),
    i("c3", "cafeteria", "Café frappé", "Café frío batido con crema y canela.", 250, "bar"),
    i("b1", "batidos", "Batido de mango", "Mango maduro, leche y hielo.", 220, "bar"),
    i("b2", "batidos", "Batido de fresa", "Fresas naturales batidas.", 240, "bar"),
    i("b3", "batidos", "Jugo de guayaba", "Natural, recién hecho.", 150, "bar"),
    i("p1", "parrilladas", "Parrillada mixta", "Cerdo y pollo a la brasa con tostones.", 1450, "cocina"),
    i("p2", "parrilladas", "Masas de cerdo", "Fritas, con mojo criollo.", 950, "cocina"),
    i("p3", "parrilladas", "Pollo a la plancha", "Con arroz congrí y ensalada.", 1100, "cocina"),
    i("s1", "sandwiches", "Sándwich cubano", "Jamón, cerdo asado, queso y pepinillo.", 450, "cocina"),
    i("s2", "sandwiches", "Pan con lechón", "Lechón asado con cebolla y mojo.", 400, "cocina"),
    i("k1", "picaderas", "Croquetas", "Seis croquetas de jamón con salsa.", 300, "cocina"),
    i("k2", "picaderas", "Tostones rellenos", "Con picadillo criollo.", 380, "cocina"),
    i("e1", "cervezas", "Cerveza Cristal", "Lata fría, 355 ml.", 250, "bar"),
    i("e2", "cervezas", "Cerveza Bucanero", "Fuerte, lata 355 ml.", 270, "bar"),
    i("e3", "cervezas", "Refresco de cola", "Lata fría.", 200, "bar"),
    i("t1", "alimentos", "Arroz (1 kg)", "Grano largo.", 380, null),
    i("t2", "alimentos", "Aceite (1 L)", "Aceite vegetal.", 950, null),
    i("t3", "alimentos", "Espaguetis (500 g)", "Pasta de trigo.", 280, null),
    i("t4", "confiteria", "Papas fritas", "Bolsa grande.", 300, null),
    i("t5", "confiteria", "Galletas dulces", "Paquete.", 180, null),
    i("t6", "bebidas", "Agua (1,5 L)", "Agua natural.", 200, null),
    i("t7", "bebidas", "Refresco (1,5 L)", "Sabores variados.", 450, null),
    i("t8", "aseo", "Jabón de tocador", "Unidad.", 150, null),
    i("t9", "aseo", "Detergente (1 kg)", "Para ropa.", 650, null),
    i("t10", "aseo", "Papel higiénico (4u)", "Paquete.", 400, null),
  ],
  workers: [
    { id: "w1", name: "Yanet", role: "encargado", code: "1234" },
    { id: "w2", name: "Luis", role: "camarero", code: "1111" },
    { id: "w3", name: "Marta", role: "cocinero", code: "2222" },
    { id: "w4", name: "Raúl", role: "barman", code: "3333" },
    { id: "w5", name: "Ana", role: "dependiente", code: "4444" },
  ],
};

export const roleLabel: Record<Role, string> = {
  camarero: "Camarero/a",
  cocinero: "Cocinero/a",
  barman: "Barman",
  dependiente: "Dependiente",
  encargado: "Encargado/a",
};

export const lineLabel: Record<Line, string> = { tienda: "Tienda", cafeteria: "Cafetería", bar: "Bar" };
