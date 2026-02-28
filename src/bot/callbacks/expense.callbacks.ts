import { BotContext } from '../../types/bot.types'
import { ExpenseService } from '../../services/expense.service'
import { InlineKeyboard } from 'grammy'

// Callback: expense:delete:123
export async function expenseDeleteCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const expenseId = parseInt((ctx.callbackQuery?.data ?? '').split(':')[2])
  const userId    = ctx.session.dbUserId!

  // Lógica completa implementada na tarefa #7
  await ctx.reply(`Excluir gasto #${expenseId} — em breve!`)
}

// Callback: expense:cancel:123
export async function expenseCancelCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  // Lógica completa implementada na tarefa #7
  await ctx.reply('Cancelar recorrente — em breve!')
}
