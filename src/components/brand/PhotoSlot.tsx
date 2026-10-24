import { Camera } from "lucide-react";
import { photoSrc } from "@/lib/photos";
import { StarLogo } from "./StarLogo";

/** Foto del negocio o, si aún no hay, un hueco elegante listo para rellenar. */
export function PhotoSlot({ photo, alt, className = "", eager = false }: { photo?: string; alt: string; className?: string; eager?: boolean }) {
  const src = photoSrc(photo);
  if (src) return <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} className={`h-full w-full object-cover ${className}`} />;
  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-flag ${className}`}>
      <div className="absolute inset-0 opacity-15 bg-flag-band" />
      <div className="relative flex flex-col items-center gap-2 text-cream/80">
        <StarLogo className="h-12 w-12 opacity-90" />
        <span className="flex items-center gap-1 text-[11px] uppercase tracking-widest"><Camera className="h-3 w-3" /> Foto pendiente</span>
      </div>
    </div>
  );
}
