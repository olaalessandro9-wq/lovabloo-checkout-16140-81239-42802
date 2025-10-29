export function formatBRL(value?: number | null): string {
  const n = Number.isFinite(value as number) ? Number(value) : 0;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}
