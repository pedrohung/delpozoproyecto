import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Clock } from "lucide-react";
import { StarLogo } from "@/components/brand/StarLogo";
import { ModuleUnavailable } from "@/components/brand/ModuleState";
import { canAccess, logout, useStore, type State } from "@/lib/store";
import { moduleEnabled } from "@/lib/modules";
import { ModuleGate } from "@/components/brand/ModuleGate";

type Area = "salon" | "cocina" | "bar" | "mostrador" | "admin";

const NAV: { area: Area; to: string; label: string; on: (s: State) => boolean }[] = [
  { area: "salon", to: "/salon", label: "Salón", on: (s) => s.config.modules.salon && (s.config.modules.cafeteria || s.config.modules.bar) },
  { area: "cocina", to: "/cocina", label: "Cocina", on: (s) => s.config.modules.cafeteria },
  { area: "bar", to: "/bar", label: "Bar", on: (s) => s.config.modules.bar || s.config.modules.cafeteria },
  { area: "mostrador", to: "/mostrador", label: "Mostrador", on: (s) => s.config.modules.tienda },
  { area: "admin", to: "/admin", label: "Administración", on: () => true },
];

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000 * 15); return () => clearInterval(t); }, []);
  return now;
}

export function StaffShell({ area, children }: { area: Area; children: ReactNode }) {
  const state = useStore((s) => s);
  const path = useRouterState({ select: (r) => r.location.pathname });
  const now = useClock();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const session = state.session;
  const nav = NAV.filter((n) => moduleEnabled(state.config, n.area) && canAccess(session, n.area));

  let body: ReactNode = children;
  if (!hydrated) body = null;
  else if (!canAccess(session, area)) body = (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 text-center">
      <StarLogo className="h-16 w-16" />
      <p className="text-xl">{session ? "Tu código no abre esta área." : "Entra con tu código para continuar."}</p>
      <Link to={area === "admin" ? "/acceso" : "/acceso"} search={area === "admin" ? { modo: "propietario" } : {}} className="btn-gold">Ir al acceso</Link>
    </div>
  );

  return (
    <ModuleGate area={area}><div className="staff min-h-screen">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-2 backdrop-blur">
        <Link to="/" className="flex items-center gap-2"><StarLogo className="h-9 w-9" /><span className="hidden font-display text-lg sm:inline">{state.config.name}</span></Link>
        <nav className="ml-2 flex flex-1 gap-1 overflow-x-auto">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${path === n.to ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{n.label}</Link>
          ))}
        </nav>
        {now && <span className="hidden items-center gap-1 text-sm text-muted-foreground md:flex"><Clock className="h-4 w-4" />{now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>}
        {hydrated && session && (
          <div className="flex items-center gap-2">
            <span className="hidden text-sm sm:inline">{session.name}</span>
            {session.role !== "propietario" && <button onClick={() => logout(true)} className="rounded-full border border-border px-3 py-2 text-xs font-semibold hover:border-gold">Fichar salida</button>}
            <button onClick={() => logout(false)} aria-label="Salir" className="rounded-full p-2 hover:bg-muted"><LogOut className="h-5 w-5" /></button>
          </div>
        )}
      </header>
      <main className="p-4 md:p-6">{body}</main>
    </div></ModuleGate>
  );
}
