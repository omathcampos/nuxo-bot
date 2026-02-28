// Normaliza uma data para o 1º dia do mês (formato usado em billing_start_date)
export function toFirstOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

// Retorna o 1º dia do mês atual
export function currentMonthStart(): Date {
  return toFirstOfMonth(new Date())
}

// Parseia "MM/YYYY" ou "hoje" para um Date no 1º do mês
// Retorna null se inválido
export function parseBillingDate(input: string): Date | null {
  const trimmed = input.trim().toLowerCase()

  if (trimmed === 'hoje') return currentMonthStart()

  const match = trimmed.match(/^(\d{2})\/(\d{4})$/)
  if (!match) return null

  const month = parseInt(match[1], 10)
  const year  = parseInt(match[2], 10)

  if (month < 1 || month > 12) return null

  return new Date(year, month - 1, 1)
}

// Formata Date para "MM/YYYY" (ex: 03/2025)
export function formatMonthYear(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${mm}/${date.getFullYear()}`
}

// Formata Date para "Mês YYYY" em PT-BR (ex: Março 2025)
export function formatMonthLabel(year: number, month: number): string {
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

// Avança ou recua N meses a partir de uma data
export function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1)
}
