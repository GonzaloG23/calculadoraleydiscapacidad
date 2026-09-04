export interface PlanillaValores {
  remunerativo: string;
  noRemunerativo: string;
  ley7991: string;
  tratamiento: "dentro" | "fuera";
}

export const PLANILLA_VACIA: PlanillaValores = {
  remunerativo: "",
  noRemunerativo: "",
  ley7991: "",
  tratamiento: "dentro",
};

const KEY = "planilla-oficial-v1";

export function cargarPlanilla(): PlanillaValores | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PlanillaValores>;
    return {
      remunerativo: String(parsed.remunerativo ?? ""),
      noRemunerativo: String(parsed.noRemunerativo ?? ""),
      ley7991: String(parsed.ley7991 ?? ""),
      tratamiento: parsed.tratamiento === "fuera" ? "fuera" : "dentro",
    };
  } catch {
    return null;
  }
}

export function guardarPlanilla(valores: PlanillaValores): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(valores));
}

export function borrarPlanilla(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function planillaTieneDatos(p: PlanillaValores | null): boolean {
  if (!p) return false;
  return (
    p.remunerativo.trim() !== "" ||
    p.noRemunerativo.trim() !== "" ||
    p.ley7991.trim() !== ""
  );
}
