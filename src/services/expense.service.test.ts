import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ExpenseService } from './expense.service'
import { MonthlyExpenseRow } from '../types/expense.types'

// Mock dos repositórios
vi.mock('../repositories/expense.repository', () => ({
  ExpenseRepository: {
    findById:        vi.fn(),
    create:          vi.fn(),
    deleteById:      vi.fn(),
    getMonthly:      vi.fn(),
    cancelRecurring: vi.fn(),
  },
}))

vi.mock('../repositories/category.repository', () => ({
  CategoryRepository: {
    findAllForUser: vi.fn(),
  },
}))

// Importa os mocks tipados após o vi.mock
import { ExpenseRepository } from '../repositories/expense.repository'

// Helpers para criar fixtures
function makeRow(overrides: Partial<MonthlyExpenseRow> = {}): MonthlyExpenseRow {
  return {
    expense_id:         1,
    description:        'Teste',
    category_name:      'Alimentação',
    category_icon:      '🍕',
    payment_method:     'pix',
    charge_type:        'one_time',
    effective_amount:   '100.00',
    installment_number: null,
    installments_total: null,
    billing_start_date: '2025-03-01',
    ...overrides,
  }
}

// Expense raw do Supabase (snake_case) retornado por findById
function makeExpense(overrides: Record<string, unknown> = {}) {
  return {
    id:                 1,
    user_id:            42,
    category_id:        3,
    description:        'Netflix',
    total_amount:       300,
    payment_method:     'credit_card',
    charge_type:        'installment',
    billing_start_date: '2024-12-01',
    installments_total: 6,
    cancelled_at:       null,
    created_at:         '2024-12-01T00:00:00Z',
    ...overrides,
  }
}

// ----- getMonthlySummary / buildSummary -----

describe('getMonthlySummary — buildSummary', () => {
  it('retorna estrutura vazia quando não há rows', async () => {
    vi.mocked(ExpenseRepository.getMonthly).mockResolvedValue([])
    const result = await ExpenseService.getMonthlySummary(1, 2025, 3)
    expect(result.byCategory).toEqual({})
    expect(result.grandTotal).toBe(0)
  })

  it('um item → grupo correto e grandTotal correto', async () => {
    vi.mocked(ExpenseRepository.getMonthly).mockResolvedValue([makeRow()])
    const result = await ExpenseService.getMonthlySummary(1, 2025, 3)
    expect(Object.keys(result.byCategory)).toHaveLength(1)
    expect(result.byCategory['Alimentação']).toBeDefined()
    expect(result.byCategory['Alimentação'].icon).toBe('🍕')
    expect(result.byCategory['Alimentação'].items).toHaveLength(1)
    expect(result.byCategory['Alimentação'].total).toBe(100)
    expect(result.grandTotal).toBe(100)
  })

  it('dois itens da mesma categoria → acumula total e items', async () => {
    vi.mocked(ExpenseRepository.getMonthly).mockResolvedValue([
      makeRow({ expense_id: 1, effective_amount: '100.00' }),
      makeRow({ expense_id: 2, description: 'Almoço', effective_amount: '50.00' }),
    ])
    const result = await ExpenseService.getMonthlySummary(1, 2025, 3)
    expect(result.byCategory['Alimentação'].items).toHaveLength(2)
    expect(result.byCategory['Alimentação'].total).toBe(150)
    expect(result.grandTotal).toBe(150)
  })

  it('duas categorias diferentes → grupos separados, grandTotal somado', async () => {
    vi.mocked(ExpenseRepository.getMonthly).mockResolvedValue([
      makeRow({ expense_id: 1, category_name: 'Alimentação', category_icon: '🍕', effective_amount: '200.00' }),
      makeRow({ expense_id: 2, category_name: 'Transporte', category_icon: '🚗', effective_amount: '80.00' }),
    ])
    const result = await ExpenseService.getMonthlySummary(1, 2025, 3)
    expect(Object.keys(result.byCategory)).toHaveLength(2)
    expect(result.byCategory['Alimentação'].total).toBe(200)
    expect(result.byCategory['Transporte'].total).toBe(80)
    expect(result.grandTotal).toBe(280)
  })

  it('effective_amount como string é parseado corretamente como float', async () => {
    vi.mocked(ExpenseRepository.getMonthly).mockResolvedValue([
      makeRow({ effective_amount: '49.99' }),
    ])
    const result = await ExpenseService.getMonthlySummary(1, 2025, 3)
    expect(result.byCategory['Alimentação'].total).toBeCloseTo(49.99)
    expect(result.grandTotal).toBeCloseTo(49.99)
  })

  it('item de parcela preserva installmentNumber e installmentsTotal', async () => {
    vi.mocked(ExpenseRepository.getMonthly).mockResolvedValue([
      makeRow({
        charge_type:        'installment',
        installment_number: 2,
        installments_total: 6,
        effective_amount:   '50.00',
      }),
    ])
    const result = await ExpenseService.getMonthlySummary(1, 2025, 3)
    const item = result.byCategory['Alimentação'].items[0]
    expect(item.installmentNumber).toBe(2)
    expect(item.installmentsTotal).toBe(6)
    expect(item.chargeType).toBe('installment')
  })
})

// ----- deleteExpense -----

describe('deleteExpense', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2025, 2, 1)) // Fixo: 01/03/2025
    vi.mocked(ExpenseRepository.create).mockResolvedValue(undefined as never)
    vi.mocked(ExpenseRepository.deleteById).mockResolvedValue(undefined)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('one_time: chama deleteById e NÃO chama create', async () => {
    vi.mocked(ExpenseRepository.findById).mockResolvedValue(
      makeExpense({ charge_type: 'one_time', installments_total: null }),
    )
    await ExpenseService.deleteExpense(1, 42, false)
    expect(ExpenseRepository.deleteById).toHaveBeenCalledWith(1, 42)
    expect(ExpenseRepository.create).not.toHaveBeenCalled()
  })

  it('installment + deleteHistory=true: só chama deleteById', async () => {
    vi.mocked(ExpenseRepository.findById).mockResolvedValue(makeExpense())
    await ExpenseService.deleteExpense(1, 42, true)
    expect(ExpenseRepository.deleteById).toHaveBeenCalledWith(1, 42)
    expect(ExpenseRepository.create).not.toHaveBeenCalled()
  })

  it('installment + deleteHistory=false, 3 meses pagos: cria registro truncado e deleta original', async () => {
    // Usa 'YYYY-MM-DDTHH:mm:ss' (sem Z) para parse em horário local, evitando UTC midnight
    // billing_start_date = Dez/2024, hoje = Mar/2025 → paidMonths = 3
    vi.mocked(ExpenseRepository.findById).mockResolvedValue(
      makeExpense({
        billing_start_date: '2024-12-01T12:00:00',
        total_amount:       300,
        installments_total: 6,
      }),
    )
    await ExpenseService.deleteExpense(1, 42, false)

    expect(ExpenseRepository.create).toHaveBeenCalledOnce()
    const createCall = vi.mocked(ExpenseRepository.create).mock.calls[0][0]
    expect(createCall.installmentsTotal).toBe(3)
    expect(createCall.totalAmount).toBeCloseTo(150) // (300 / 6) * 3

    expect(ExpenseRepository.deleteById).toHaveBeenCalledWith(1, 42)
  })

  it('installment + deleteHistory=false, 0 meses pagos (mesmo mês): NÃO cria e apenas deleta', async () => {
    // billing_start_date = Mar/2025, hoje = Mar/2025 → paidMonths = 0
    vi.mocked(ExpenseRepository.findById).mockResolvedValue(
      makeExpense({ billing_start_date: '2025-03-01T12:00:00', installments_total: 6 }),
    )
    await ExpenseService.deleteExpense(1, 42, false)
    expect(ExpenseRepository.create).not.toHaveBeenCalled()
    expect(ExpenseRepository.deleteById).toHaveBeenCalledWith(1, 42)
  })

  it('recurring + deleteHistory=false: só chama deleteById (sem create)', async () => {
    vi.mocked(ExpenseRepository.findById).mockResolvedValue(
      makeExpense({ charge_type: 'recurring', installments_total: null }),
    )
    await ExpenseService.deleteExpense(1, 42, false)
    expect(ExpenseRepository.create).not.toHaveBeenCalled()
    expect(ExpenseRepository.deleteById).toHaveBeenCalledWith(1, 42)
  })

  it('expense não encontrado: retorna sem chamar nada', async () => {
    vi.mocked(ExpenseRepository.findById).mockResolvedValue(null)
    await ExpenseService.deleteExpense(999, 42, false)
    expect(ExpenseRepository.create).not.toHaveBeenCalled()
    expect(ExpenseRepository.deleteById).not.toHaveBeenCalled()
  })
})

// ----- cancelRecurring -----

describe('cancelRecurring', () => {
  afterEach(() => vi.clearAllMocks())

  it('chama ExpenseRepository.cancelRecurring com o 1º dia do mês passado', async () => {
    vi.mocked(ExpenseRepository.cancelRecurring).mockResolvedValue(undefined)
    const cancelDate = new Date(2025, 4, 15) // 15/05/2025 — deve ser normalizado para 01/05/2025
    await ExpenseService.cancelRecurring(7, 42, cancelDate)

    expect(ExpenseRepository.cancelRecurring).toHaveBeenCalledOnce()
    const [id, userId, date] = vi.mocked(ExpenseRepository.cancelRecurring).mock.calls[0]
    expect(id).toBe(7)
    expect(userId).toBe(42)
    expect(date.getDate()).toBe(1)
    expect(date.getMonth()).toBe(4)
    expect(date.getFullYear()).toBe(2025)
  })

  it('data já no 1º dia do mês → mantém sem alterar', async () => {
    vi.mocked(ExpenseRepository.cancelRecurring).mockResolvedValue(undefined)
    const cancelDate = new Date(2025, 5, 1)
    await ExpenseService.cancelRecurring(1, 42, cancelDate)
    const date = vi.mocked(ExpenseRepository.cancelRecurring).mock.calls[0][2]
    expect(date.getDate()).toBe(1)
    expect(date.getMonth()).toBe(5)
  })
})
