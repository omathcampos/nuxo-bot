import { InlineKeyboard } from 'grammy'
import { PaymentMethod } from '../../types/expense.types'

export function expenseTypeKeyboard(paymentMethod: PaymentMethod) {
  const kb = new InlineKeyboard()
    .text('À vista', 'type:one_time').row()

  if (paymentMethod === 'credit_card') {
    kb.text('Parcelado', 'type:installment').row()
  }

  kb.text('Recorrente 🔄', 'type:recurring')
  return kb
}
