
/**
 * Converte centavos (inteiro) para string formatada sem o símbolo R$.
 * 
 * @param cents - Valor em centavos (ex: 5660)
 * @returns String formatada (ex: "56,60")
 * 
 * @example
 * formatPriceFromCents(5660)   // "56,60"
 * formatPriceFromCents(123456) // "1.234,56"
 * formatPriceFromCents(0)      // "0,00"
 */
export const formatPriceFromCents = (cents: number | null | undefined): string => {
  if (cents === null || cents === undefined) return "0,00";
  
  const numericCents = Number(cents);
  if (isNaN(numericCents)) return "0,00";
  
  const value = numericCents / 100;
  
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Alias para manter compatibilidade
export const formatCentsToBRL = formatPriceFromCents;
