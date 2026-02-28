import { InlineKeyboard } from 'grammy'

export function expenseTypeKeyboard() {
  return new InlineKeyboard()
    .text('À vista', 'type:one_time').row()
    .text('Parcelado', 'type:installment').row()
    .text('Recorrente 🔄', 'type:recurring')
}
