// ============================================
// HORIZON EQUITY - NUMBER & CURRENCY FORMATTERS
// ============================================

/**
 * Safely parses any value (string, number, Decimal representation, or undefined/null)
 * into a safe JavaScript number. Prevents NaN and runtime crashes.
 */
export function toNum(val: unknown): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") {
    return isNaN(val) ? 0 : val;
  }
  if (typeof val === "string") {
    // Handle scientific notation like "0E-8" or empty strings
    const trimmed = val.trim();
    if (!trimmed) return 0;
    const parsed = Number(trimmed);
    if (!isNaN(parsed)) return parsed;
    const floatParsed = parseFloat(trimmed);
    return isNaN(floatParsed) ? 0 : floatParsed;
  }
  return 0;
}

/**
 * Formats a crypto balance with safety against non-numeric values.
 */
export function formatCrypto(val: unknown, decimals: number = 6): string {
  const num = toNum(val);
  return num.toFixed(decimals);
}

/**
 * Formats a USD financial figure with commas and 2 decimal places.
 */
export function formatUsd(val: unknown, decimals: number = 2): string {
  const num = toNum(val);
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats a percentage value safely.
 */
export function formatPercent(val: unknown, decimals: number = 1): string {
  const num = toNum(val);
  return `${num.toFixed(decimals)}%`;
}
