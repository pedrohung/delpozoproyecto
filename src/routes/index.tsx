import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Phone, ShoppingCart, Coffee, Beer, ChevronRight } from "lucide-react";
import { StarLogo } from "@/components/brand/StarLogo";
import { PhotoSlot } from "@/components/brand/PhotoSlot";
import { ModuleError } from "@/components/brand/ModuleState";
import { photoSrc } from "@/lib/photos";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "La Estrella Cubana — Tienda, Coffee y Bar en Manzanillo" },
      { name: "description", content: "Mipyme La Estrella Cubana: tienda, cafetería y bar en Maceo 28, Manzanillo, Granma. Un ambiente familiar." },
      { property: "og:title", content: "La Estrella Cubana — Manzanillo, Granma" },
      { property: "og:description", content: "Tienda • Coffee • Bar. Mira la carta y la tienda. Un ambiente familiar." },
    ],
  }),
  component: Home,
  errorComponent: ModuleError,
});

function Home() {
  const c = useStore((s) => s.config);
  const lines = [
    c.modules.tienda && { icon: ShoppingCart, label: "Tienda" },
    c.modules.cafeteria && { icon: Coffee, label: "Coffee" },
    c.modules.bar && { icon: Beer, label: "Bar" },
  ].filter(Boolean) as { icon: typeof Coffee; label: string }[];
  const cats = c.categories.filter((k) => (k.kind === "tienda" ? c.modules.tienda : c.modules[k.line]));

  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="relative isolate min-h-[92vh] overflow-hidden bg-navy text-cream">
        <img src={photoSrc(c.photos.hero)} alt={`Malecón de ${c.city}`} className="absolute inset-0 -z-10 h-full w-full object-cover" width={1920} height={1088} />
        <div className="absolute inset-0 -z-10 bg-hero-veil" />
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2"><StarLogo className="h-10 w-10" /><span className="font-display text-lg">{c.name}</span></div>
          <div className="text-right"><div className="font-display text-sm tracking-[0.3em] uppercase">{c.city}</div><div className="font-script text-xl text-gold">{c.region}</div></div>
        </header>
        <div className="mx-auto flex max-w-6xl flex-col items-center px-5 pb-20 pt-10 text-center md:pt-16">
          <StarLogo className="h-36 w-36 drop-shadow-2xl md:h-48 md:w-48" animated />
          <p className="mt-2 font-script text-5xl text-gold md:text-7xl">{c.prefix}</p>
          <h1 className="font-display text-5xl uppercase leading-[0.95] drop-shadow-lg md:text-8xl">
            {c.nameLine1}<span className="block text-cuban [text-shadow:0_2px_0_var(--brand-cream)]">{c.nameLine2}</span>
          </h1>
          <div className="mt-8 flex items-center gap-4 rounded-full border-2 border-gold bg-navy/80 px-6 py-3 backdrop-blur">
            {lines.map((l, k) => (
              <span key={l.label} className="flex items-center gap-2 font-display text-sm uppercase tracking-widest md:text-base">
                {k > 0 && <span className="text-gold">•</span>}<l.icon className="h-5 w-5 text-gold" />{l.label}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {(c.modules.cafeteria || c.modules.bar) && <Link to="/carta" className="btn-gold">Ver la carta <ChevronRight className="h-4 w-4" /></Link>}
            {c.modules.tienda && <Link to="/tienda" className="btn-ghost-gold">Ver la tienda</Link>}
          </div>
        </div>
      </section>

      {/* MOSAICO */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-10 text-center">
          <p className="font-script text-4xl text-cuban">Lo que te espera</p>
          <h2 className="font-display text-3xl uppercase md:text-5xl">Todo en un solo lugar</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {cats.map((k, idx) => (
            <Link key={k.id} to={k.kind === "tienda" ? "/tienda" : "/carta"} search={{ cat: k.id }}
              className={`group relative overflow-hidden rounded-xl gold-frame ${idx === 0 || idx === 2 ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" : "aspect-square"}`}>
              <div className="absolute inset-0 transition duration-500 group-hover:scale-105"><PhotoSlot photo={k.photo} alt={k.name} /></div>
              <div className="absolute inset-x-0 bottom-0 border-t-2 border-gold bg-navy/90 px-3 py-2 text-center font-display text-xs uppercase tracking-widest text-cream md:text-sm">{k.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* AMBIENTE */}
      <section className="bg-navy text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl gold-frame aspect-[4/3]"><PhotoSlot photo={c.photos.interior} alt="Interior del local" /></div>
          <div>
            <p className="font-script text-5xl text-gold md:text-6xl">{c.slogan}</p>
            <p className="mt-6 max-w-md text-lg text-cream/80">Café recién hecho, la parrillada de la casa, la cerveza bien fría y la tienda del barrio. Ven con la familia: aquí siempre hay sitio.</p>
            <div className="mt-8 h-3 w-40 rounded-full bg-flag-band" />
          </div>
        </div>
      </section>

      {/* DATOS */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 rounded-2xl bg-flag p-8 text-cream md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex items-start gap-4"><MapPin className="h-10 w-10 shrink-0 text-gold" />
            <div><div className="font-display text-2xl">{c.address} <span className="font-sans text-lg font-normal">{c.addressDetail}</span></div><div className="text-cream/80">{c.city}, {c.region}</div></div></div>
          <div className="hidden h-16 w-px bg-gold md:block" />
          <a href={`tel:${c.phone}`} className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-full bg-cuban"><Phone className="h-7 w-7" /></span><span className="font-display text-4xl tracking-wider">{c.phone}</span></a>
        </div>
      </section>

      <footer className="border-t-4 border-gold bg-navy py-10 text-center text-cream">
        <StarLogo className="mx-auto h-14 w-14" />
        <p className="mt-2 font-display uppercase tracking-widest">{c.name}</p>
        <p className="font-script text-2xl text-gold">{c.slogan}</p>
        <Link to="/acceso" className="mt-6 inline-block text-xs text-cream/50 hover:text-gold">Acceso del personal</Link>
      </footer>
    </div>
  );
}
