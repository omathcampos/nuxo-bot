import { InlineKeyboard } from 'grammy'
import { ChargeType } from '../../types/expense.types'

export function paymentMethodKeyboard(chargeType: ChargeType) {
  const kb = new InlineKeyboard()

  // Parcelamento só faz sentido com cartão de crédito
  if (chargeType === 'installment') {
    return kb.text('Cartão de crédito', 'pay:credit_card')
  }

  return kb
    .text('PIX', 'pay:pix').text('Dinheiro', 'pay:cash').row()
    .text('Débito', 'pay:debit_card').text('Crédito', 'pay:credit_card')
}
