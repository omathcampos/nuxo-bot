import { InlineKeyboard } from 'grammy'

export function paymentMethodKeyboard() {
  return new InlineKeyboard()
    .text('PIX', 'pay:pix').text('Dinheiro', 'pay:cash').row()
    .text('VR', 'pay:vr').text('VA', 'pay:va').row()
    .text('Débito', 'pay:debit_card').text('Crédito', 'pay:credit_card')
}
