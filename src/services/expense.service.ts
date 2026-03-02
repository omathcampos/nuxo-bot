import { ExpenseRepository } from '../repositories/expense.repository'
import { CategoryRepository } from '../repositories/category.repository'
import {
  CreateExpenseDTO,
  MonthlyExpenseSummary,
  MonthlyExpenseRow,
} from '../types/expense.types'
import { toFirstOfMonth, currentMonthStart } from '../utils/date.utils'

export const ExpenseService = {
  async findById(expenseId: number, userId: number) {
    return ExpenseRepository.findById(expenseId, userId)
  },

  async getCategoriesForUser(userId: number) {
    return CategoryRepository.findAllForUser(userId)
  },

  async create(dto: CreateExpenseDTO) {
    return ExpenseRepository.create(dto)
  },

  async getMonthlySummary(userId: number, year: number, month: number): Promise<MonthlyExpenseSummary> {
    const rows = await ExpenseRepository.getMonthly(userId, year, month)
    return buildSummary(rows)
  },

  async deleteExpense(expenseId: number, userId: number, deleteHistory: boolean) {
    const expense = await ExpenseRepository.findById(expenseId, userId)
    if (!expense) return

    if (expense.charge_type === 'installment' && !deleteHistory) {
      // Preserva parcelas passadas: recria o gasto com installments_total
      // ajustado para refletir apenas as parcelas já pagas
      const startDate = new Date(expense.billing_start_date)
      const today = currentMonthStart()
      const paidMonths = monthsDiff(startDate, today)

      if (paidMonths > 0) {
        await ExpenseRepository.create({
          userId:            userId,
          categoryId:        expense.category_id,
          description:       expense.description,
          totalAmount:       (expense.total_amount / expense.installments_total) * paidMonths,
          paymentMethod:     expense.payment_method,
          chargeType:        'installment',
          billingStartDate:  startDate,
          installmentsTotal: paidMonths,
        })
      }
    }

    await ExpenseRepository.deleteById(expenseId, userId)
  },

  async cancelRecurring(expenseId: number, userId: number, cancelFromDate: Date) {
    await ExpenseRepository.cancelRecurring(expenseId, userId, toFirstOfMonth(cancelFromDate))
  },
}

function buildSummary(rows: MonthlyExpenseRow[]): MonthlyExpenseSummary {
  const byCategory: MonthlyExpenseSummary['byCategory'] = {}
  let grandTotal = 0

  for (const row of rows) {
    const amount = parseFloat(row.effective_amount)
    grandTotal += amount

    if (!byCategory[row.category_name]) {
      byCategory[row.category_name] = { icon: row.category_icon, items: [], total: 0 }
    }

    byCategory[row.category_name].items.push({
      expenseId:         row.expense_id,
      description:       row.description,
      paymentMethod:     row.payment_method,
      chargeType:        row.charge_type,
      amount,
      installmentNumber: row.installment_number,
      installmentsTotal: row.installments_total,
    })

    byCategory[row.category_name].total += amount
  }

  return { byCategory, grandTotal }
}

function monthsDiff(from: Date, to: Date): number {
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
}
