import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function isValidAmount(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return true;

  // Allow digits, commas, dots and spaces as thousand separators.
  const cleaned = trimmed.replace(/ /g, "").replace(/[^0-9.,]/g, "");
  if (cleaned !== trimmed.replace(/ /g, "")) return false;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let normalized: string;
  if (lastComma > lastDot) {
    // Comma is the decimal separator.
    const [whole, decimal = ""] = cleaned.split(",");
    if (cleaned.split(",").length > 2) return false;
    normalized = (whole ?? "").replace(/\./g, "") + (decimal ? "." + decimal : "");
  } else if (lastDot > lastComma) {
    // Dot is the decimal separator.
    const [whole, decimal = ""] = cleaned.split(".");
    if (cleaned.split(".").length > 2) return false;
    normalized = (whole ?? "").replace(/,/g, "") + (decimal ? "." + decimal : "");
  } else {
    normalized = cleaned;
  }

  const num = parseFloat(normalized);
  return !isNaN(num);
}

function parseAmount(value: string): number {
  if (!isValidAmount(value) || value.trim() === "") return 0;

  const trimmed = value.trim().replace(/ /g, "");
  const lastComma = trimmed.lastIndexOf(",");
  const lastDot = trimmed.lastIndexOf(".");

  let normalized: string;
  if (lastComma > lastDot) {
    const [whole, decimal = ""] = trimmed.split(",");
    normalized = (whole ?? "").replace(/\./g, "") + (decimal ? "." + decimal : "");
  } else if (lastDot > lastComma) {
    const [whole, decimal = ""] = trimmed.split(".");
    normalized = (whole ?? "").replace(/,/g, "") + (decimal ? "." + decimal : "");
  } else {
    normalized = trimmed;
  }

  return parseFloat(normalized);
}

type Tratamiento = "dentro" | "fuera";

interface CalculationResult {
  remAjustado: number;
  noRemAjustado: number;
  base: number;
  factor: number;
  resultado: number;
}

function Index() {
  const [boletas, setBoletas] = useState("");
  const [remunerativo, setRemunerativo] = useState("");
  const [noRemunerativo, setNoRemunerativo] = useState("");
  const [ley7991, setLey7991] = useState("");
  const [tratamiento, setTratamiento] = useState<Tratamiento>("dentro");

  const isRemValid = isValidAmount(remunerativo);
  const isNoRemValid = isValidAmount(noRemunerativo);
  const isLeyValid = isValidAmount(ley7991);
  const hasValidInputs = isRemValid && isNoRemValid && isLeyValid;

  const calculations: CalculationResult | null = useMemo(() => {
    if (!hasValidInputs) return null;

    const remAjustado =
      remunerativo === "" ? 0 : parseAmount(remunerativo) / 0.81;
    const noRemAjustado =
      noRemunerativo === "" ? 0 : parseAmount(noRemunerativo) - parseAmount(ley7991);
    const base = remAjustado + noRemAjustado;
    const factor = tratamiento === "dentro" ? 1.5 : 3;
    const resultado = base * factor;

    return { remAjustado, noRemAjustado, base, factor, resultado };
  }, [tratamiento, hasValidInputs, remunerativo, noRemunerativo, ley7991]);

  const hasNumericInput =
    remunerativo.trim() !== "" ||
    noRemunerativo.trim() !== "" ||
    ley7991.trim() !== "";

  const handleReset = () => {
    setBoletas("");
    setRemunerativo("");
    setNoRemunerativo("");
    setLey7991("");
    setTratamiento("dentro");
  };

  const handlePrint = () => {
    window.print();
  };

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
                Aurora · Auditoría
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-balance max-w-[26ch]">
              Calculadora de Ley de Discapacidad
            </h1>
            <p className="mt-2 text-mut text-sm text-pretty max-w-[52ch]">
              Tratamiento de remunerativo y no remunerativo según Ley 7991 —
              dentro o fuera de la provincia. Cálculo inmediato para
              verificación contra planillas.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-faint">
              v1.0 · local
            </span>
            <span className="size-2 rounded-full bg-mint" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
          <section className="bg-panel/70 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-mut">
                Datos de la planilla
              </h2>
              <span className="font-mono text-[10px] text-faint">01 / 02</span>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="boletas"
                  className="block text-[13px] font-medium text-fg mb-1.5"
                >
                  N.º de boletas
                </label>
                <input
                  id="boletas"
                  type="text"
                  value={boletas}
                  onChange={(e) => setBoletas(e.target.value)}
                  placeholder="Ej. B-2024-0917"
                  className="w-full bg-ink/50 border border-line rounded-lg px-3 py-2.5 text-sm font-mono text-fg placeholder:text-faint focus:outline-none focus:border-cyan/60 focus:ring-2 focus:ring-cyan/20 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="rem"
                    className="block text-[12px] font-medium text-fg mb-1.5"
                  >
                    Remunerativo
                  </label>
                  <input
                    id="rem"
                    type="text"
                    inputMode="decimal"
                    value={remunerativo}
                    onChange={(e) => setRemunerativo(e.target.value)}
                    placeholder="0,00"
                    className={`w-full bg-ink/50 border rounded-lg px-3 py-2.5 text-sm font-mono text-fg placeholder:text-faint focus:outline-none focus:ring-2 transition-colors ${
                      isRemValid
                        ? "border-line focus:border-cyan/60 focus:ring-cyan/20"
                        : "border-err/60 focus:border-err focus:ring-err/30"
                    }`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="norem"
                    className="block text-[12px] font-medium text-fg mb-1.5"
                  >
                    No remunerativo
                  </label>
                  <input
                    id="norem"
                    type="text"
                    inputMode="decimal"
                    value={noRemunerativo}
                    onChange={(e) => setNoRemunerativo(e.target.value)}
                    placeholder="0,00"
                    className={`w-full bg-ink/50 border rounded-lg px-3 py-2.5 text-sm font-mono text-fg placeholder:text-faint focus:outline-none focus:ring-2 transition-colors ${
                      isNoRemValid
                        ? "border-line focus:border-cyan/60 focus:ring-cyan/20"
                        : "border-err/60 focus:border-err focus:ring-err/30"
                    }`}
                  />
                </div>
                <div>
                  <label
                    htmlFor="ley"
                    className="block text-[12px] font-medium text-fg mb-1.5"
                  >
                    Ley 7991
                  </label>
                  <input
                    id="ley"
                    type="text"
                    inputMode="decimal"
                    value={ley7991}
                    onChange={(e) => setLey7991(e.target.value)}
                    placeholder="0,00"
                    className={`w-full bg-ink/50 border rounded-lg px-3 py-2.5 text-sm font-mono text-fg placeholder:text-faint focus:outline-none focus:ring-2 transition-colors ${
                      isLeyValid
                        ? "border-line focus:border-cyan/60 focus:ring-cyan/20"
                        : "border-err/60 focus:border-err focus:ring-err/30"
                    }`}
                  />
                </div>
              </div>

              <div>
                <span className="block text-[13px] font-medium text-fg mb-1.5">
                  Tratamiento provincial
                </span>
                <div
                  className="grid grid-cols-2 gap-1 bg-ink/50 border border-line rounded-lg p-1"
                  role="group"
                  aria-label="Tratamiento provincial"
                >
                  <button
                    type="button"
                    onClick={() => setTratamiento("dentro")}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                      tratamiento === "dentro"
                        ? "bg-cyan/15 text-cyan ring-1 ring-inset ring-cyan/40"
                        : "text-mut hover:text-fg"
                    }`}
                  >
                    Dentro
                  </button>
                  <button
                    type="button"
                    onClick={() => setTratamiento("fuera")}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                      tratamiento === "fuera"
                        ? "bg-cyan/15 text-cyan ring-1 ring-inset ring-cyan/40"
                        : "text-mut hover:text-fg"
                    }`}
                  >
                    Fuera
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-line/70 flex flex-wrap gap-2.5 print-hidden">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 bg-cyan/15 text-cyan ring-1 ring-inset ring-cyan/40 hover:bg-cyan/25 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
              >
                <span className="size-4 shrink-0 grid place-items-center">
                  <span className="font-mono text-[13px]">↻</span>
                </span>
                Limpiar
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 text-mut hover:text-fg ring-1 ring-inset ring-white/10 hover:ring-white/20 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              >
                <span className="size-4 shrink-0 grid place-items-center">
                  <span className="font-mono text-[13px]">⎙</span>
                </span>
                Imprimir
              </button>
            </div>
          </section>

          <section className="bg-panel/70 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-mut">
                Desglose paso a paso
              </h2>
              <span className="font-mono text-[10px] text-faint">02 / 02</span>
            </div>

            {calculations ? (
              <>
                <div className="space-y-1 font-mono text-sm">
                  <div className="flex items-center justify-between py-2.5 border-b border-line/60">
                    <span className="text-mut text-[13px]">
                      Remunerativo ÷ 0,81
                    </span>
                    <span className="text-fg">
                      {formatCurrency(calculations.remAjustado)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-line/60">
                    <span className="text-mut text-[13px]">
                      No remunerativo − Ley 7991
                    </span>
                    <span className="text-fg">
                      {formatCurrency(calculations.noRemAjustado)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 border-b border-line/60">
                    <span className="text-mut text-[13px]">Suma (base)</span>
                    <span className="text-fg">
                      {formatCurrency(calculations.base)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-mut text-[13px]">
                      Factor ×{calculations.factor.toFixed(1).replace(".", ",")}{" "}
                      <span className="text-cyan">({tratamiento})</span>
                    </span>
                    <span className="text-fg">
                      {formatCurrency(calculations.resultado)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-ink/60 ring-1 ring-inset ring-white/10 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan">
                      Resultado
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-mint">
                      <span className="size-1.5 rounded-full bg-mint" />
                      Recalculado
                    </span>
                  </div>
                  <div className="font-mono text-[40px] leading-none font-semibold tracking-tight text-fg">
                    {formatCurrency(calculations.resultado)}
                  </div>
                  <div className="mt-2 text-[13px] text-mut">
                    Ley 7991 · {tratamiento} de la provincia
                    {boletas ? ` · boleta ${boletas}` : ""}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <span className="font-mono text-4xl text-faint mb-3">Σ</span>
                <p className="text-sm text-mut max-w-[32ch]">
                  Ingresá los valores de la planilla para ver el desglose del
                  cálculo.
                </p>
              </div>
            )}

            {!hasValidInputs && hasNumericInput && (
              <div className="mt-4 rounded-lg bg-err/10 ring-1 ring-inset ring-err/30 px-3.5 py-2.5 flex items-start gap-2.5">
                <span className="mt-0.5 font-mono text-err text-sm">!</span>
                <p className="text-[12px] text-err/90 leading-snug">
                  Algunos campos numéricos no son válidos. Revisá que uses coma
                  o punto como separador decimal y evitás letras.
                </p>
              </div>
            )}

            <p className="mt-auto pt-5 text-[11px] text-faint leading-relaxed">
              Herramienta local de verificación. Sin autenticación ni
              persistencia; los datos no se almacenan.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
