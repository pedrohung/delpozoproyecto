import { Navigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { moduleEnabled, type ModuleRoute } from "@/lib/modules";
import { useStore } from "@/lib/store";

export function ModuleGate({ area, children }: { area: ModuleRoute; children: ReactNode }) {
  const config = useStore((s) => s.config);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;
  return moduleEnabled(config, area) ? children : <Navigate to="/" replace />;
}