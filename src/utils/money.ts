/**
 * Utilitários para conversão de preços entre BRL (string) e centavos (inteiro)
 * 
 * Problema: "R$ 56,60" estava virando "5,66" ou "0,57" por conversão duplicada
 * Solução: Sempre armazenar em centavos (inteiro) e converter apenas na exibição
 */

/**
 * Converte string BRL para centavos (inteiro)
 * 
 * @param s - String no formato BRL (ex: "R$ 56,60", "56,60", "56.60")
 * @returns Valor em centavos (ex: 5660)
 * 
 * @example
 * parseBRLToCents("R$ 56,60")  // 5660
 * parseBRLToCents("56,60")     // 5660
 * parseBRLToCents("56.60")     // 5660
 * parseBRLToCents("1.234,56")  // 123456
 */
export const parseBRLToCents = (s: string): number => {
  // Remove tudo exceto dígitos, vírgula, ponto e hífen
  // Remove pontos de milhar (ex: "1.234,56" → "1234,56")
  // Troca vírgula por ponto (ex: "1234,56" → "1234.56")
  const cleaned = s
    .replace(/[^\d,.-]/g, '')  // Remove R$, espaços, etc
    .replace(/\./g, '')         // Remove pontos de milhar
    .replace(',', '.');         // Troca vírgula por ponto
  
  const value = Number(cleaned || '0');
  
  // Multiplica por 100 para converter para centavos
  return Math.round(value * 100);
};

/**
 * Converte centavos (inteiro) para string BRL formatada
 * 
 * @param cents - Valor em centavos (ex: 5660)
 * @returns String formatada em BRL (ex: "R$ 56,60")
 * 
 * @example
 * formatCentsToBRL(5660)   // "R$ 56,60"
 * formatCentsToBRL(123456) // "R$ 1.234,56"
 * formatCentsToBRL(0)      // "R$ 0,00"
 */
export const formatCentsToBRL = (cents: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format((cents || 0) / 100);
};

/**
 * Converte centavos para reais (número decimal)
 * 
 * @param cents - Valor em centavos (ex: 5660)
 * @returns Valor em reais (ex: 56.60)
 * 
 * @example
 * centsToReais(5660)   // 56.60
 * centsToReais(123456) // 1234.56
 */
export const centsToReais = (cents: number): number => {
  return (cents || 0) / 100;
};

/**
 * Converte reais (número decimal) para centavos
 * 
 * @param reais - Valor em reais (ex: 56.60)
 * @returns Valor em centavos (ex: 5660)
 * 
 * @example
 * reaisToCents(56.60)   // 5660
 * reaisToCents(1234.56) // 123456
 */
export const reaisToCents = (reais: number): number => {
  return Math.round((reais || 0) * 100);
};

