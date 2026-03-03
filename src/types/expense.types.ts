export type ChargeType = 'one_time' | 'installment' | 'recurring'

export type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'cash' | 'vr' | 'va'

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  credit_card: 'Cartão de crédito',
  debit_card:  'Cartão de débito',
  pix:         'PIX',
  cash:        'Dinheiro',
  vr:          'Vale Refeição',
  va:          'Vale Alimentação',
}

export const CHARGE_TYPE_LABEL: Record<ChargeType, string> = {
  one_time:    'À vista',
  installment: 'Parcelado',
  recurring:   'Recorrente',
}

export interface Expense {
  id: number
  userId: number
  categoryId: number
  description: string | null
  totalAmount: number
  paymentMethod: PaymentMethod
  chargeType: ChargeType
  billingStartDate: Date
  installmentsTotal: number | null
  cancelledAt: Date | null
  createdAt: Date
}

// Linha retornada pela função SQL get_monthly_expenses
export interface MonthlyExpenseRow {
  expense_id: number
  description: string | null
  category_name: string
  category_icon: string | null
  payment_method: PaymentMethod
  charge_type: ChargeType
  effective_amount: string  // Supabase retorna NUMERIC como string
  installment_number: number | null
  installments_total: number | null
  billing_start_date: string
}

export interface CreateExpenseDTO {
  userId: number
  categoryId: number
  description?: string
  totalAmount: number
  paymentMethod: PaymentMethod
  chargeType: ChargeType
  billingStartDate: Date
  installmentsTotal?: number
}

export interface MonthlyExpenseSummary {
  byCategory: Record<string, {
    icon: string | null
    items: MonthlyExpenseItem[]
    total: number
  }>
  grandTotal: number
}

export interface MonthlyExpenseItem {
  expenseId: number
  description: string | null
  paymentMethod: PaymentMethod
  chargeType: ChargeType
  amount: number
  installmentNumber: number | null
  installmentsTotal: number | null
}
