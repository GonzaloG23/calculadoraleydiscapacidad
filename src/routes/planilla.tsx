import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { formatCurrency, isValidAmount, parseAmount } from "../lib/amount";
import {
  PLANILLA_VACIA,
  borrarPlanilla,
  cargarPlanilla,
  guardarPlanilla,
  type PlanillaValores,
} from "../lib/planilla";

export const Route = createFileRoute("/planilla")({
  component: PlanillaPage,
  head: () => ({
    meta: [
      { title: "Valores de la planilla oficial — Auditoría Tucumán" },
      {
        name: "description",
        content:
          "Cargá los valores de la planilla oficial (remunerativo, no remunerativo y Ley 7991) para que la calculadora los use automáticamente.",
      },
      {
        property: "og:title",
        content: "Valores de la planilla oficial — Auditoría Tucumán",
      },
      {
        property: "og:description",
        content:
          "Cargá los valores de la planilla oficial y la calculadora los aplica automáticamente a cada boleta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const inputBase =
  "w-full bg-ink/50 border rounded-lg px-3 py-2 text-sm font-mono text-fg placeholder:text-faint focus:outline-none focus:ring-2 transition-colors";
const inputOk = "border-line focus:border-cyan/60 focus:ring-cyan/20";
const inputErr = "border-err/60 focus:border-err focus:ring-err/30";

function PlanillaPage() {
  const router = useRouter();
  const [valores, setValores] = useState<PlanillaValores>(PLANILLA_VACIA);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const stored = cargarPlanilla();
    if (stored) setValores(stored);
  }, []);

  const set = (patch: Partial<PlanillaValores>) => {
    setValores((prev) => ({ ...prev, ...patch }));
    setGuardado(false);
  };

  const remOk = isValidAmount(valores.remunerativo);
  const noRemOk = isValidAmount(valores.noRemunerativo);
  const leyOk = isValidAmount(valores.ley7991);
  const todoOk = remOk && noRemOk && leyOk;

  const handleGuardar = () => {
    if (!todoOk) return;
    guardarPlanilla(valores);
    setGuardado(true);
  };

  const handleGuardarYCalcular = () => {
    if (!todoOk) return;
    guardarPlanilla(valores);
    router.navigate({ to: "/" });
  };

  const handleBorrar = () => {
    borrarPlanilla();
    setValores(PLANILLA_VACIA);
    setGuardado(false);
  };

  const campos = [
    {
      id: "rem",
      label: "Remunerativo",
      value: valores.remunerativo,
      ok: remOk,
      onChange: (v: string) => set({ remunerativo: v }),
    },
    {
      id: "norem",
      label: "No remunerativo",
      value: valores.noRemunerativo,
      ok: noRemOk,
      onChange: (v: string) => set({ noRemunerativo: v }),
    },
    {
      id: "ley",
      label: "Ley 7991",
      value: valores.ley7991,
      ok: leyOk,
      onChange: (v: string) => set({ ley7991: v }),
    },
  ];

  return (
    <div className="min-h-screen bg-ink text-fg font-sans antialiased">
      <div
        className="absolute inset-x-0 top-0 h-[440px] overflow-hidden pointer-events-none print-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 left-[10%] size-[520px] rounded-full bg-cyan/20 blur-[130px]" />
        <div className="absolute -top-40 left-[55%] size-[520px] rounded-full bg-mint/15 blur-[150px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 py-8">
        <header className="mb-8">
          <Link
            to="/"
            className="print-hidden inline-flex items-center gap-1.5 text-mut hover:text-fg text-xs font-mono transition-colors"
          >
            ← Volver a la calculadora
          </Link>
          <h1 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
            Valores de la planilla oficial
          </h1>
          <p className="mt-2 text-mut text-sm text-pretty max-w-[58ch]">
            Cargá acá los importes de la planilla oficial. La calculadora los
            aplica automáticamente a cada boleta nueva, y podés modificarlos en
            cada boleta si hace falta.
          </p>
        </header>

        <section className="bg-panel/70 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {campos.map((c) => (
              <div key={c.id}>
                <label
                  htmlFor={c.id}
                  className="block text-[12px] font-medium text-fg mb-1.5"
                >
                  {c.label}
                </label>
                <input
                  id={c.id}
                  type="text"
                  inputMode="decimal"
                  value={c.value}
                  onChange={(e) => c.onChange(e.target.value)}
                  placeholder="0,00"
                  className={`${inputBase} ${c.ok ? inputOk : inputErr}`}
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <span className="block text-[12px] font-medium text-fg mb-1.5">
              Tratamiento provincial por defecto
            </span>
            <div
              className="grid grid-cols-2 gap-1 bg-ink/50 border border-line rounded-lg p-1 max-w-xs"
              role="group"
              aria-label="Tratamiento provincial por defecto"
            >
              {(["dentro", "fuera"] as const).map((op) => (
                <button
                  key={op}
                  type="button"
                  onClick={() => set({ tratamiento: op })}
                  className={`py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${
                    valores.tratamiento === op
                      ? "bg-cyan/15 text-cyan ring-1 ring-inset ring-cyan/40"
                      : "text-mut hover:text-fg"
                  }`}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          {!todoOk && (
            <p className="mt-4 text-[12px] text-err/90 leading-snug">
              Revisá los importes: usá coma o punto como separador decimal y
              evitá letras.
            </p>
          )}

          {todoOk && (
            <div className="mt-5 rounded-xl bg-ink/50 ring-1 ring-inset ring-white/10 p-4 space-y-1 font-mono text-[13px]">
              <div className="flex items-center justify-between py-1.5 border-b border-line/60">
                <span className="text-mut">Remunerativo</span>
                <span>{formatCurrency(parseAmount(valores.remunerativo))}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-line/60">
                <span className="text-mut">No remunerativo</span>
                <span>
                  {formatCurrency(parseAmount(valores.noRemunerativo))}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-mut">Ley 7991</span>
                <span>{formatCurrency(parseAmount(valores.ley7991))}</span>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2.5 print-hidden">
            <button
              type="button"
              onClick={handleGuardarYCalcular}
              disabled={!todoOk}
              className="inline-flex items-center gap-2 bg-cyan/15 text-cyan ring-1 ring-inset ring-cyan/40 hover:bg-cyan/25 disabled:opacity-40 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            >
              Guardar y calcular
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              disabled={!todoOk}
              className="inline-flex items-center gap-2 text-mut hover:text-fg ring-1 ring-inset ring-white/10 hover:ring-white/20 disabled:opacity-40 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={handleBorrar}
              className="inline-flex items-center gap-2 text-mut hover:text-err ring-1 ring-inset ring-white/10 hover:ring-err/40 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Borrar valores
            </button>
          </div>

          {guardado && (
            <p className="mt-3 text-[12px] text-mint">
              Valores guardados. Ya los usa la calculadora.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
