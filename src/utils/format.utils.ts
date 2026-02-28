// Formata número como moeda BRL (ex: 1500.5 → "R$ 1.500,50")
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Parseia string de valor monetário digitado pelo usuário
// Aceita: "150", "150.00", "150,00", "1.500,00"
// Retorna null se inválido
export function parseAmount(input: string | undefined): number | null {
  if (!input) return null

  const normalized = input
    .trim()
    .replace(/\./g, '')   // remove separador de milhar
    .replace(',', '.')    // troca vírgula decimal por ponto

  const value = parseFloat(normalized)

  if (isNaN(value) || value <= 0) return null

  return Math.round(value * 100) / 100 // arredonda para 2 casas
}

// Formata label de parcela (ex: installmentNumber=2, total=3 → "2/3")
export function formatInstallment(num: number, total: number): string {
  return `${num}/${total}`
}
