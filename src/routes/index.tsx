import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { formatCurrency, isValidAmount, parseAmount } from "../lib/amount";
import {
  cargarPlanilla,
  planillaTieneDatos,
  type PlanillaValores,
} from "../lib/planilla";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: "Calculadora Ley de Discapacidad — Auditoría Tucumán",
      },
      {
        name: "description",
        content:
          "Herramienta de verificación de cálculos para auditorías de la Ley de Discapacidad en el Ministerio de Educación de Tucumán.",
      },
      {
        property: "og:title",
        content: "Calculadora Ley de Discapacidad — Auditoría Tucumán",
      },
      {
        property: "og:description",
        content:
          "Herramienta de verificación de cálculos para auditorías de la Ley de Discapacidad en el Ministerio de Educación de Tucumán.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});


type Tratamiento = "dentro" | "fuera";

interface CalculationResult {
  usaAjuste: boolean;
  remunerativo: number;
  noRemunerativo: number;
  remAjustado: number;
  noRemAjustado: number;
  base: number;
  factor: number;
  resultado: number;
}

interface Boleta {
  id: string;
  numero: string;
  remunerativo: string;
  noRemunerativo: string;
  ley7991: string;
  tratamiento: Tratamiento;
}

function nuevaBoleta(id: string, planilla?: PlanillaValores | null): Boleta {
  return {
    id,
    numero: "",
    remunerativo: planilla?.remunerativo ?? "",
    noRemunerativo: planilla?.noRemunerativo ?? "",
    ley7991: planilla?.ley7991 ?? "",
    tratamiento: planilla?.tratamiento ?? "dentro",
  };
}

function calcular(b: Boleta): CalculationResult | null {
  if (
    !isValidAmount(b.remunerativo) ||
    !isValidAmount(b.noRemunerativo) ||
    !isValidAmount(b.ley7991)
  ) {
    return null;
  }

  const remunerativo =
    b.remunerativo.trim() === "" ? 0 : parseAmount(b.remunerativo);
  const noRemunerativo =
    b.noRemunerativo.trim() === "" ? 0 : parseAmount(b.noRemunerativo);
  const ley7991 = b.ley7991.trim() === "" ? 0 : parseAmount(b.ley7991);

  const factor = b.tratamiento === "dentro" ? 1.5 : 3;
  const usaAjuste = ley7991 !== 0;

  if (usaAjuste) {
    const remAjustado = remunerativo / 0.81;
    const noRemAjustado = noRemunerativo - ley7991;
    const base = remAjustado + noRemAjustado;
    return {
      usaAjuste,
      remunerativo,
      noRemunerativo,
      remAjustado,
      noRemAjustado,
      base,
      factor,
      resultado: base * factor,
    };
  }

  const base = remunerativo + noRemunerativo;
  return {
    usaAjuste,
    remunerativo,
    noRemunerativo,
    remAjustado: 0,
    noRemAjustado: 0,
    base,
    factor,
    resultado: base * factor,
  };
}

function tieneDatos(b: Boleta): boolean {
  return (
    b.remunerativo.trim() !== "" ||
    b.noRemunerativo.trim() !== "" ||
    b.ley7991.trim() !== ""
  );
}

const inputBase =
  "w-full bg-ink/50 border rounded-lg px-3 py-2 text-sm font-mono text-fg placeholder:text-faint focus:outline-none focus:ring-2 transition-colors";
const inputOk = "border-line focus:border-cyan/60 focus:ring-cyan/20";
const inputErr = "border-err/60 focus:border-err focus:ring-err/30";

function siguienteId(prev: Boleta[]): string {
  const max = prev.reduce((acc, b) => {
    const n = Number(b.id.slice(1));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, 0);
  return `b${max + 1}`;
}

function Index() {
  const [boletas, setBoletas] = useState<Boleta[]>(() => [nuevaBoleta("b1")]);
  const [planilla, setPlanilla] = useState<PlanillaValores | null>(null);

  useEffect(() => {
    const stored = cargarPlanilla();
    if (!planillaTieneDatos(stored)) return;
    setPlanilla(stored);
    setBoletas((prev) =>
      prev.length === 1 && !tieneDatos(prev[0]!)
        ? [nuevaBoleta(prev[0]!.id, stored)]
        : prev,
    );
  }, []);

  const update = (id: string, patch: Partial<Boleta>) =>
    setBoletas((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );

  const addBoleta = () =>
    setBoletas((prev) => [...prev, nuevaBoleta(siguienteId(prev), planilla)]);

  const removeBoleta = (id: string) =>
    setBoletas((prev) =>
      prev.length === 1
        ? [nuevaBoleta(siguienteId(prev), planilla)]
        : prev.filter((b) => b.id !== id),
    );

  const handleReset = () => setBoletas([nuevaBoleta("b1", planilla)]);
  const handlePrint = () => window.print();

  const resultados = useMemo(
    () => boletas.map((b) => ({ boleta: b, calc: calcular(b) })),
    [boletas],
  );

  const conDatos = resultados.filter(({ boleta }) => tieneDatos(boleta));
  const hayInvalidos = resultados.some(
    ({ boleta, calc }) => tieneDatos(boleta) && calc === null,
  );
  const totalGeneral = conDatos.reduce(
    (acc, { calc }) => acc + (calc?.resultado ?? 0),
    0,
  );
  const totalDentro = conDatos.reduce(
    (acc, { boleta, calc }) =>
      acc + (boleta.tratamiento === "dentro" ? (calc?.resultado ?? 0) : 0),
    0,
  );
  const totalFuera = totalGeneral - totalDentro;

  return (
    <div className="min-h-screen bg-ink text-fg font-sans antialiased">
      <div
        className="absolute inset-x-0 top-0 h-[440px] overflow-hidden pointer-events-none print-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 left-[6%] size-[520px] rounded-full bg-cyan/25 blur-[130px]" />
        <div className="absolute -top-40 left-[38%] size-[560px] rounded-full bg-mint/20 blur-[150px]" />
        <div className="absolute -top-20 left-[72%] size-[440px] rounded-full bg-[#3d63b0]/25 blur-[140px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <header className="flex items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="size-8 rounded-lg bg-cyan/15 ring-1 ring-inset ring-cyan/40 grid place-items-center">
                <span className="font-mono text-cyan text-sm font-semibold">
                  Σ
                </span>
              </span>
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-mut">
                Dirección de Auditoría Interna
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance max-w-[26ch]">
              Calculadora de Ley de Discapacidad
            </h1>
            <p className="mt-2 text-mut text-sm text-pretty max-w-[56ch]">
              Cargá cada boleta de sueldo por separado. La app calcula el
              importe de cada una y el total general del agente.
            </p>
            <p className="mt-1 text-faint text-xs text-pretty max-w-[56ch]">
              Autor: Lic. Gonzalo García
            </p>
            <Link
              to="/planilla"
              className="print-hidden mt-3 inline-flex items-center gap-1.5 text-cyan hover:text-fg text-xs font-mono transition-colors"
            >
              {planilla
                ? "Editar valores de la planilla oficial →"
                : "Cargar valores de la planilla oficial →"}
            </Link>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-faint">
              v1.1 · local
            </span>
            <span className="size-2 rounded-full bg-mint" />
          </div>
        </header>

        <div className="space-y-4">
          {resultados.map(({ boleta, calc }, index) => {
            const remOk = isValidAmount(boleta.remunerativo);
            const noRemOk = isValidAmount(boleta.noRemunerativo);
            const leyOk = isValidAmount(boleta.ley7991);
            const activa = tieneDatos(boleta);

            return (
              <section
                key={boleta.id}
                className="bg-panel/70 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl p-5 sm:p-6"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-faint">
                      {boleta.numero.trim() !== ""
                        ? boleta.numero
                        : `#${index + 1}`}
                    </span>
                    {activa && calc && (
                      <span className="font-mono text-[12px] text-mint">
                        {formatCurrency(calc.resultado)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeBoleta(boleta.id)}
                    aria-label={`Quitar ${boleta.numero.trim() !== "" ? boleta.numero : `#${index + 1}`}`}
                    className="print-hidden text-faint hover:text-err text-xs font-mono ring-1 ring-inset ring-white/10 hover:ring-err/40 rounded-md px-2 py-1 transition-colors"
                  >
                    ✕ Quitar
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-5">
                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor={`num-${boleta.id}`}
                        className="block text-[12px] font-medium text-fg mb-1.5"
                      >
                        N.º de boleta
                      </label>
                      <input
                        id={`num-${boleta.id}`}
                        type="text"
                        value={boleta.numero}
                        onChange={(e) =>
                          update(boleta.id, { numero: e.target.value })
                        }
                        placeholder="Ej. B-2024-0917"
                        className={`${inputBase} ${inputOk}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label
                          htmlFor={`rem-${boleta.id}`}
                          className="block text-[12px] font-medium text-fg mb-1.5"
                        >
                          Remunerativo
                        </label>
                        <input
                          id={`rem-${boleta.id}`}
                          type="text"
                          inputMode="decimal"
                          value={boleta.remunerativo}
                          onChange={(e) =>
                            update(boleta.id, { remunerativo: e.target.value })
                          }
                          placeholder="0,00"
                          className={`${inputBase} ${remOk ? inputOk : inputErr}`}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`norem-${boleta.id}`}
                          className="block text-[12px] font-medium text-fg mb-1.5"
                        >
                          No remunerativo
                        </label>
                        <input
                          id={`norem-${boleta.id}`}
                          type="text"
                          inputMode="decimal"
                          value={boleta.noRemunerativo}
                          onChange={(e) =>
                            update(boleta.id, {
                              noRemunerativo: e.target.value,
                            })
                          }
                          placeholder="0,00"
                          className={`${inputBase} ${noRemOk ? inputOk : inputErr}`}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`ley-${boleta.id}`}
                          className="block text-[12px] font-medium text-fg mb-1.5"
                        >
                          Ley 7991
                        </label>
                        <input
                          id={`ley-${boleta.id}`}
                          type="text"
                          inputMode="decimal"
                          value={boleta.ley7991}
                          onChange={(e) =>
                            update(boleta.id, { ley7991: e.target.value })
                          }
                          placeholder="0,00"
                          className={`${inputBase} ${leyOk ? inputOk : inputErr}`}
                        />
                      </div>
                    </div>

                    <div>
                      <span className="block text-[12px] font-medium text-fg mb-1.5">
                        Tratamiento provincial
                      </span>
                      <div
                        className="grid grid-cols-2 gap-1 bg-ink/50 border border-line rounded-lg p-1"
                        role="group"
                        aria-label={`Tratamiento provincial ${boleta.numero.trim() !== "" ? boleta.numero : `#${index + 1}`}`}
                      >
                        {(["dentro", "fuera"] as const).map((op) => (
                          <button
                            key={op}
                            type="button"
                            onClick={() =>
                              update(boleta.id, { tratamiento: op })
                            }
                            className={`py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${
                              boleta.tratamiento === op
                                ? "bg-cyan/15 text-cyan ring-1 ring-inset ring-cyan/40"
                                : "text-mut hover:text-fg"
                            }`}
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-ink/50 ring-1 ring-inset ring-white/10 p-4">
                    {calc && activa ? (
                      <div className="space-y-1 font-mono text-[13px]">
                        {calc.usaAjuste ? (
                          <>
                            <div className="flex items-center justify-between py-1.5 border-b border-line/60">
                              <span className="text-mut">
                                Remunerativo ÷ 0,81
                              </span>
                              <span>{formatCurrency(calc.remAjustado)}</span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-line/60">
                              <span className="text-mut">
                                No remunerativo − Ley 7991
                              </span>
                              <span>
                                {formatCurrency(calc.noRemAjustado)}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between py-1.5 border-b border-line/60">
                              <span className="text-mut">Remunerativo</span>
                              <span>
                                {formatCurrency(calc.remunerativo)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-b border-line/60">
                              <span className="text-mut">
                                No remunerativo
                              </span>
                              <span>
                                {formatCurrency(calc.noRemunerativo)}
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex items-center justify-between py-1.5 border-b border-line/60">
                          <span className="text-mut">Suma (base)</span>
                          <span>{formatCurrency(calc.base)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-mut">
                            Factor ×{calc.factor.toFixed(1).replace(".", ",")}{" "}
                            <span className="text-cyan">
                              ({boleta.tratamiento})
                            </span>
                          </span>
                          <span className="text-fg text-base font-semibold">
                            {formatCurrency(calc.resultado)}
                          </span>
                        </div>
                      </div>
                    ) : activa && !calc ? (
                      <p className="text-[12px] text-err/90 leading-snug">
                        Revisá los importes de esta boleta: usá coma o punto
                        como separador decimal y evitá letras.
                      </p>
                    ) : (
                      <p className="text-[12px] text-faint leading-snug">
                        Ingresá los importes de esta boleta para ver el
                        desglose.
                      </p>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5 print-hidden">
          <button
            type="button"
            onClick={addBoleta}
            className="inline-flex items-center gap-2 bg-cyan/15 text-cyan ring-1 ring-inset ring-cyan/40 hover:bg-cyan/25 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          >
            <span className="font-mono text-[13px]">+</span>
            Agregar boleta
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-mut hover:text-fg ring-1 ring-inset ring-white/10 hover:ring-white/20 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <span className="font-mono text-[13px]">↻</span>
            Limpiar todo
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-mut hover:text-fg ring-1 ring-inset ring-white/10 hover:ring-white/20 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            <span className="font-mono text-[13px]">⎙</span>
            Imprimir
          </button>
        </div>

        <section className="mt-6 bg-panel/70 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-mut">
              Total del agente
            </h2>
            <span className="font-mono text-[10px] text-faint">
              {conDatos.length} boleta{conDatos.length === 1 ? "" : "s"} con
              datos
            </span>
          </div>

          {conDatos.length > 0 ? (
            <>
              <div className="space-y-1 font-mono text-sm mb-5">
                {resultados.map(
                  ({ boleta, calc }, index) =>
                    tieneDatos(boleta) && (
                      <div
                        key={boleta.id}
                        className="flex items-center justify-between py-1.5 border-b border-line/50"
                      >
                        <span className="text-mut text-[13px]">
                          {boleta.numero.trim() !== ""
                            ? boleta.numero
                            : `#${String(index + 1).padStart(2, "0")}`}{" "}
                          <span className="text-faint">
                            ({boleta.tratamiento})
                          </span>
                        </span>
                        <span className={calc ? "text-fg" : "text-err"}>
                          {calc ? formatCurrency(calc.resultado) : "—"}
                        </span>
                      </div>
                    ),
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="rounded-lg bg-ink/50 ring-1 ring-inset ring-white/10 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-faint mb-1">
                    Dentro de la provincia
                  </div>
                  <div className="font-mono text-lg text-fg">
                    {formatCurrency(totalDentro)}
                  </div>
                </div>
                <div className="rounded-lg bg-ink/50 ring-1 ring-inset ring-white/10 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-faint mb-1">
                    Fuera de la provincia
                  </div>
                  <div className="font-mono text-lg text-fg">
                    {formatCurrency(totalFuera)}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-ink/60 ring-1 ring-inset ring-white/10 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
                    Total final
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-mint">
                    <span className="size-1.5 rounded-full bg-mint" />
                    Recalculado
                  </span>
                </div>
                <div className="font-mono text-[40px] leading-none font-semibold tracking-tight text-fg">
                  {formatCurrency(totalGeneral)}
                </div>
              </div>

              {hayInvalidos && (
                <div className="mt-4 rounded-lg bg-err/10 ring-1 ring-inset ring-err/30 px-3.5 py-2.5 flex items-start gap-2.5">
                  <span className="mt-0.5 font-mono text-err text-sm">!</span>
                  <p className="text-[12px] text-err/90 leading-snug">
                    Hay boletas con importes no válidos; esas quedan fuera del
                    total hasta que las corrijas.
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-mut">
              Cargá al menos una boleta para ver el total del agente.
            </p>
          )}

          <p className="mt-5 pt-4 border-t border-line/60 text-[11px] text-faint leading-relaxed">
            Herramienta local de verificación. Sin autenticación ni
            persistencia; los datos no se almacenan.
          </p>
        </section>
      </div>
    </div>
  );
}
