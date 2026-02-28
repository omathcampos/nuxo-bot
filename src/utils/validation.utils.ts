// Valida se uma string representa um número de parcelas válido (>= 2)
export function parseInstallments(input: string | undefined): number | null {
  if (!input) return null
  const n = parseInt(input.trim(), 10)
  if (isNaN(n) || n < 2) return null
  return n
}
