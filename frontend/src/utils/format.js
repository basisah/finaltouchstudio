const CAD = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });
const CAD_WHOLE = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });

/** 45 -> "$45", 7.5 -> "$7.50" */
export function formatPrice(value) {
  const amount = Number(value) || 0;
  return Number.isInteger(amount) ? CAD_WHOLE.format(amount) : CAD.format(amount);
}

/** Always two decimals — for totals and receipts. */
export function formatMoney(value) {
  return CAD.format(Number(value) || 0);
}

/** "bridal-shower" -> "Bridal Shower" */
export function titleCase(slug = "") {
  return String(slug)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Date | "YYYY-MM-DD" -> "Jun 14, 2026" */
export function formatDate(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value).length <= 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}
