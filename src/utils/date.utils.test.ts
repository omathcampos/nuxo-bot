import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  toFirstOfMonth,
  parseBillingDate,
  formatMonthYear,
  formatMonthLabel,
  addMonths,
  currentMonthStart,
} from './date.utils'

describe('toFirstOfMonth', () => {
  it('normaliza qualquer dia para o dia 1 do mês', () => {
    const result = toFirstOfMonth(new Date(2025, 2, 15))
    expect(result.getDate()).toBe(1)
    expect(result.getMonth()).toBe(2)
    expect(result.getFullYear()).toBe(2025)
  })

  it('preserva mês e ano', () => {
    const result = toFirstOfMonth(new Date(2024, 11, 31))
    expect(result.getDate()).toBe(1)
    expect(result.getMonth()).toBe(11)
    expect(result.getFullYear()).toBe(2024)
  })

  it('retorna novo objeto (imutabilidade)', () => {
    const original = new Date(2025, 5, 20)
    const result = toFirstOfMonth(original)
    expect(result).not.toBe(original)
    expect(original.getDate()).toBe(20)
  })
})

describe('currentMonthStart', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 2, 15)) // 15/03/2025
  })
  afterEach(() => vi.useRealTimers())

  it('retorna o 1º dia do mês atual', () => {
    const result = currentMonthStart()
    expect(result.getDate()).toBe(1)
    expect(result.getMonth()).toBe(2)
    expect(result.getFullYear()).toBe(2025)
  })
})

describe('parseBillingDate', () => {
  it('"01/2025" → 1º de janeiro de 2025', () => {
    const result = parseBillingDate('01/2025')
    expect(result).not.toBeNull()
    expect(result!.getFullYear()).toBe(2025)
    expect(result!.getMonth()).toBe(0)
    expect(result!.getDate()).toBe(1)
  })

  it('"12/2025" → 1º de dezembro de 2025', () => {
    const result = parseBillingDate('12/2025')
    expect(result).not.toBeNull()
    expect(result!.getMonth()).toBe(11)
    expect(result!.getFullYear()).toBe(2025)
  })

  it('"03/2024" → 1º de março de 2024', () => {
    const result = parseBillingDate('03/2024')
    expect(result).not.toBeNull()
    expect(result!.getMonth()).toBe(2)
    expect(result!.getFullYear()).toBe(2024)
  })

  it('"hoje" → 1º do mês atual', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 2, 20))
    const result = parseBillingDate('hoje')
    expect(result).not.toBeNull()
    expect(result!.getDate()).toBe(1)
    expect(result!.getMonth()).toBe(2)
    vi.useRealTimers()
  })

  it('"HOJE" (maiúsculo) → 1º do mês atual', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 5, 10))
    const result = parseBillingDate('HOJE')
    expect(result).not.toBeNull()
    expect(result!.getMonth()).toBe(5)
    vi.useRealTimers()
  })

  it('"00/2025" → null (mês zero inválido)', () => {
    expect(parseBillingDate('00/2025')).toBeNull()
  })

  it('"13/2025" → null (mês 13 inválido)', () => {
    expect(parseBillingDate('13/2025')).toBeNull()
  })

  it('"1/2025" → null (formato errado — falta zero à esquerda)', () => {
    expect(parseBillingDate('1/2025')).toBeNull()
  })

  it('"01-2025" → null (separador errado)', () => {
    expect(parseBillingDate('01-2025')).toBeNull()
  })

  it('"abc" → null', () => {
    expect(parseBillingDate('abc')).toBeNull()
  })

  it('"" → null', () => {
    expect(parseBillingDate('')).toBeNull()
  })

  it('espaços em branco são ignorados', () => {
    const result = parseBillingDate('  03/2025  ')
    expect(result).not.toBeNull()
    expect(result!.getMonth()).toBe(2)
  })
})

describe('formatMonthYear', () => {
  it('Date(2025, 0, 1) → "01/2025"', () => {
    expect(formatMonthYear(new Date(2025, 0, 1))).toBe('01/2025')
  })

  it('Date(2025, 11, 1) → "12/2025"', () => {
    expect(formatMonthYear(new Date(2025, 11, 1))).toBe('12/2025')
  })

  it('Date(2024, 2, 15) → "03/2024" (zero à esquerda)', () => {
    expect(formatMonthYear(new Date(2024, 2, 15))).toBe('03/2024')
  })
})

describe('formatMonthLabel', () => {
  it('(2025, 3) → contém "março" e "2025"', () => {
    const result = formatMonthLabel(2025, 3)
    expect(result.toLowerCase()).toContain('março')
    expect(result).toContain('2025')
  })

  it('(2025, 1) → contém "janeiro" e "2025"', () => {
    const result = formatMonthLabel(2025, 1)
    expect(result.toLowerCase()).toContain('janeiro')
    expect(result).toContain('2025')
  })

  it('(2024, 12) → contém "dezembro" e "2024"', () => {
    const result = formatMonthLabel(2024, 12)
    expect(result.toLowerCase()).toContain('dezembro')
    expect(result).toContain('2024')
  })
})

describe('addMonths', () => {
  it('avança 1 mês normalmente', () => {
    const result = addMonths(new Date(2025, 0, 1), 1)
    expect(result.getMonth()).toBe(1)
    expect(result.getFullYear()).toBe(2025)
    expect(result.getDate()).toBe(1)
  })

  it('avança passando a virada de ano (Dez → Jan)', () => {
    const result = addMonths(new Date(2024, 11, 1), 1)
    expect(result.getMonth()).toBe(0)
    expect(result.getFullYear()).toBe(2025)
  })

  it('recua 1 mês', () => {
    const result = addMonths(new Date(2025, 2, 1), -1)
    expect(result.getMonth()).toBe(1)
    expect(result.getFullYear()).toBe(2025)
  })

  it('recua passando a virada de ano (Jan → Dez)', () => {
    const result = addMonths(new Date(2025, 0, 1), -1)
    expect(result.getMonth()).toBe(11)
    expect(result.getFullYear()).toBe(2024)
  })

  it('avança 12 meses = próximo ano mesmo mês', () => {
    const result = addMonths(new Date(2025, 3, 1), 12)
    expect(result.getMonth()).toBe(3)
    expect(result.getFullYear()).toBe(2026)
  })

  it('resultado sempre tem dia 1', () => {
    const result = addMonths(new Date(2025, 5, 15), 2)
    expect(result.getDate()).toBe(1)
  })
})
