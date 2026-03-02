import { describe, it, expect } from 'vitest'
import { parseInstallments } from './validation.utils'

describe('parseInstallments', () => {
  it('"2" → 2 (valor mínimo válido)', () => {
    expect(parseInstallments('2')).toBe(2)
  })

  it('"3" → 3', () => {
    expect(parseInstallments('3')).toBe(3)
  })

  it('"12" → 12', () => {
    expect(parseInstallments('12')).toBe(12)
  })

  it('"1" → null (abaixo do mínimo)', () => {
    expect(parseInstallments('1')).toBeNull()
  })

  it('"0" → null', () => {
    expect(parseInstallments('0')).toBeNull()
  })

  it('"-1" → null (negativo)', () => {
    expect(parseInstallments('-1')).toBeNull()
  })

  it('"abc" → null', () => {
    expect(parseInstallments('abc')).toBeNull()
  })

  it('"" → null (string vazia)', () => {
    expect(parseInstallments('')).toBeNull()
  })

  it('undefined → null', () => {
    expect(parseInstallments(undefined)).toBeNull()
  })

  it('espaços em branco são ignorados', () => {
    expect(parseInstallments('  5  ')).toBe(5)
  })
})
