import { describe, it, expect } from 'vitest'
import { parseAmount, formatInstallment, formatBRL } from './format.utils'

describe('parseAmount', () => {
  it('"150" → 150', () => {
    expect(parseAmount('150')).toBe(150)
  })

  it('"150,00" → 150', () => {
    expect(parseAmount('150,00')).toBe(150)
  })

  it('"1.500,00" → 1500 (separador de milhar + vírgula decimal)', () => {
    expect(parseAmount('1.500,00')).toBe(1500)
  })

  it('"150.00" → 15000 (ponto é separador de milhar, não decimal)', () => {
    // A função trata qualquer ponto como separador de milhar (padrão BR)
    expect(parseAmount('150.00')).toBe(15000)
  })

  it('"1500,50" → 1500.5 (vírgula como decimal)', () => {
    expect(parseAmount('1500,50')).toBe(1500.5)
  })

  it('"0,01" → 0.01 (valor mínimo positivo)', () => {
    expect(parseAmount('0,01')).toBe(0.01)
  })

  it('"10,999" → 11 (arredonda para 2 casas decimais)', () => {
    expect(parseAmount('10,999')).toBe(11)
  })

  it('"0" → null (zero não é positivo)', () => {
    expect(parseAmount('0')).toBeNull()
  })

  it('"0,00" → null', () => {
    expect(parseAmount('0,00')).toBeNull()
  })

  it('"-50" → null (negativo)', () => {
    expect(parseAmount('-50')).toBeNull()
  })

  it('"abc" → null', () => {
    expect(parseAmount('abc')).toBeNull()
  })

  it('"" → null (string vazia)', () => {
    expect(parseAmount('')).toBeNull()
  })

  it('undefined → null', () => {
    expect(parseAmount(undefined)).toBeNull()
  })

  it('espaços em branco são ignorados', () => {
    expect(parseAmount('  100,00  ')).toBe(100)
  })
})

describe('formatInstallment', () => {
  it('(2, 3) → "2/3"', () => {
    expect(formatInstallment(2, 3)).toBe('2/3')
  })

  it('(1, 12) → "1/12"', () => {
    expect(formatInstallment(1, 12)).toBe('1/12')
  })

  it('(1, 1) → "1/1"', () => {
    expect(formatInstallment(1, 1)).toBe('1/1')
  })
})

describe('formatBRL', () => {
  it('1500.5 → inclui "1.500" e "50" no formato pt-BR', () => {
    const result = formatBRL(1500.5)
    expect(result).toContain('1.500')
    expect(result).toContain('50')
    expect(result.toLowerCase()).toContain('r$')
  })

  it('0 → inclui "0,00"', () => {
    const result = formatBRL(0)
    expect(result).toContain('0,00')
    expect(result.toLowerCase()).toContain('r$')
  })

  it('1.5 → inclui "1,50"', () => {
    const result = formatBRL(1.5)
    expect(result).toContain('1,50')
  })
})
