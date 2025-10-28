export function formatPriceFromCents(cents) {
  if (cents === null || cents === undefined) return "";
  const value = Number(cents) / 100;
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const formatCentsToBRL = formatPriceFromCents;
