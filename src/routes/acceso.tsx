import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Delete } from "lucide-react";
import { StarLogo } from "@/components/brand/StarLogo";
import { ModuleError } from "@/components/brand/ModuleState";
import { login, ownerLogin, sessionHome, logout, useStore } from "@/lib/store";
import { roleLabel } from "@/config/brand";

export const Route = createFileRoute("/acceso")({
  validateSearch: (s: Record<string, unknown>): { modo?: "propietario" | undefined } => ({ modo: s["modo"] === "propietario" ? "propietario" : undefined }),
  head: () => ({ meta: [
    { title: "Acceso del personal — La Estrella Cubana" },
    { name: "description", content: "Entrada y fichaje del personal con código personal." },
    { property: "og:title", content: "Acceso del personal" },
    { property: "og:description", content: "Entrada y fichaje con código." },
  ] }),
  component: Acceso,
  errorComponent: ModuleError,
});

function Acceso() {
  const { modo } = Route.useSearch();
  const nav = useNavigate();
  const name = useStore((s) => s.config.name);
  const [now, setNow] = useState<Date | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [owner, setOwner] = useState(modo === "propietario");
  const [pw, setPw] = useState("");
  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const submit = (v: string) => {
    const s = login(v);
    if (!s) { setMsg({ ok: false, text: "Código incorrecto" }); setCode(""); return; }
    const destination = sessionHome(s);
    if (!destination) { logout(false); setMsg({ ok: false, text: "Tu puesto no está activo en este local" }); setCode(""); return; }
    setMsg({ ok: true, text: `Hola, ${s.name} · ${roleLabel[s.role as keyof typeof roleLabel]} · entrada fichada` });
    setTimeout(() => nav({ to: destination }), 900);
  };
  const press = (d: string) => { if (code.length >= 6) return; const v = code + d; setCode(v); setMsg(null); if (v.length === 4) submit(v); };

  return (
    <div className="staff flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="flex items-center gap-3"><StarLogo className="h-12 w-12" /><span className="font-display text-xl">{name}</span></div>
      <div className="text-center">
        <div className="font-display text-7xl tabular-nums md:text-8xl">{now?.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) ?? "--:--"}</div>
        <div className="mt-1 text-lg capitalize text-muted-foreground">{now?.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }) ?? ""}</div>
      </div>
      {!owner ? (
        <>
          <div className="flex gap-3">{[0, 1, 2, 3].map((k) => <span key={k} className={`h-5 w-5 rounded-full border-2 border-gold transition ${k < code.length ? "scale-110 bg-gold" : ""}`} />)}</div>
          <p className={`h-6 text-center font-semibold ${msg?.ok ? "text-free" : "text-cuban"}`}>{msg?.text}</p>
          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => <Key key={d} onClick={() => press(d)}>{d}</Key>)}
            <Key onClick={() => setCode("")} small>Borrar</Key>
            <Key onClick={() => press("0")}>0</Key>
            <Key onClick={() => setCode(code.slice(0, -1))} small><Delete className="h-7 w-7" /></Key>
          </div>
          <button className="text-sm text-muted-foreground hover:text-gold" onClick={() => setOwner(true)}>Entrar como propietaria</button>
        </>
      ) : (
        <form className="flex w-full max-w-xs flex-col gap-3" onSubmit={(e) => { e.preventDefault(); if (ownerLogin(pw)) nav({ to: "/admin" }); else setMsg({ ok: false, text: "Contraseña incorrecta" }); }}>
          <input type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Contraseña del propietario" className="rounded-xl border-2 border-input bg-card px-4 py-4 text-lg" />
          <p className="h-5 text-center text-cuban">{msg?.text}</p>
          <button className="btn-gold">Entrar a Administración</button>
          <button type="button" className="text-sm text-muted-foreground" onClick={() => setOwner(false)}>Volver al teclado</button>
        </form>
      )}
    </div>
  );
}

function Key({ children, onClick, small }: { children: React.ReactNode; onClick: () => void; small?: boolean }) {
  return <button onClick={onClick} className={`grid h-20 w-20 place-items-center rounded-2xl border-2 border-border bg-card font-display ${small ? "text-sm" : "text-3xl"} transition active:scale-95 active:border-gold active:bg-gold active:text-navy md:h-24 md:w-24`}>{children}</button>;
}
