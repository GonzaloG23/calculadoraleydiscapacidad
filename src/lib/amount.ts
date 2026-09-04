export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function isValidAmount(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return true;

  const cleaned = trimmed.replace(/ /g, "").replace(/[^0-9.,]/g, "");
  if (cleaned !== trimmed.replace(/ /g, "")) return false;

  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  let normalized: string;
  if (lastComma > lastDot) {
    const [whole, decimal = ""] = cleaned.split(",");
    if (cleaned.split(",").length > 2) return false;
    normalized = (whole ?? "").replace(/\./g, "") + (decimal ? "." + decimal : "");
  } else if (lastDot > lastComma) {
    const [whole, decimal = ""] = cleaned.split(".");
    if (cleaned.split(".").length > 2) return false;
    normalized = (whole ?? "").replace(/,/g, "") + (decimal ? "." + decimal : "");
  } else {
    normalized = cleaned;
  }

  const num = parseFloat(normalized);
  return !isNaN(num);
}

export function parseAmount(value: string): number {
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
