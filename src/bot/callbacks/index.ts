import { Bot } from 'grammy'
import { BotContext } from '../../types/bot.types'
import {
  monthNavCallback,
  monthManageCallback,
  monthFilterCallback,
  monthFilterTypeCallback,
  monthFilterCatCallback,
  monthFilterClearCallback,
} from './month.callbacks'
import {
  expenseDeleteCallback,
  expenseDeleteConfirmCallback,
  expenseCancelCallback,
  expenseCancelConfirmCallback,
  expenseCancelCustomCallback,
  expenseNoopCallback,
} from './expense.callbacks'
import { monthCommand } from '../commands/month.command'
import { recurringCommand } from '../commands/recurring.command'
import { yearCommand } from '../commands/year.command'
import { ExpenseService } from '../../services/expense.service'
import { parseBillingDate, formatMonthYear } from '../../utils/date.utils'

export function registerCallbacks(bot: Bot<BotContext>) {
  // Menu principal
  bot.callbackQuery('menu:add', async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.conversation.enter('add-expense')
  })
  bot.callbackQuery('menu:month', async (ctx) => {
    await ctx.answerCallbackQuery()
    await monthCommand(ctx)
  })
  bot.callbackQuery('menu:recurring', async (ctx) => {
    await ctx.answerCallbackQuery()
    await recurringCommand(ctx)
  })
  bot.callbackQuery('menu:year', async (ctx) => {
    await ctx.answerCallbackQuery()
    await yearCommand(ctx)
  })
  bot.callbackQuery('menu:categories', async (ctx) => {
    await ctx.answerCallbackQuery()
    await ctx.conversation.enter('add-category')
  })

  // Navegação de meses
  bot.callbackQuery(/^month:nav:\d{4}-\d{2}$/, monthNavCallback)

  // Gerenciar gastos do mês
  bot.callbackQuery(/^month:manage:\d{4}-\d{2}$/, monthManageCallback)

  // Filtros mensais
  bot.callbackQuery(/^month:filter:\d{4}-\d{2}$/, monthFilterCallback)
  bot.callbackQuery(/^month:ftype:\d{4}-\d{2}:[a-z_]+$/, monthFilterTypeCallback)
  bot.callbackQuery(/^month:fcat:\d{4}-\d{2}:.+$/, monthFilterCatCallback)
  bot.callbackQuery(/^month:fclear:\d{4}-\d{2}$/, monthFilterClearCallback)

  // Exclusão de gastos
  bot.callbackQuery(/^expense:delete:\d+$/, expenseDeleteCallback)
  bot.callbackQuery(/^expense:delete:confirm:(all|future):\d+$/, expenseDeleteConfirmCallback)

  // Cancelamento de recorrentes
  bot.callbackQuery(/^expense:cancel:\d+$/, expenseCancelCallback)
  bot.callbackQuery(/^expense:cancel:confirm:\d+:\d{2}\/\d{4}$/, expenseCancelConfirmCallback)
  bot.callbackQuery(/^expense:cancel:custom:\d+$/, expenseCancelCustomCallback)

  // Noop (usuário cancelou a ação)
  bot.callbackQuery('expense:noop', expenseNoopCallback)

  // Reply livre para data customizada de cancelamento
  bot.on('message:text', async (ctx, next) => {
    const pending = ctx.session._pendingCancelExpenseId
    if (!pending || !ctx.message.reply_to_message) return next()

    const cancelFrom = parseBillingDate(ctx.message.text)
    if (!cancelFrom) {
      await ctx.reply('Data inválida. Use o formato MM/AAAA (ex: 05/2025).')
      return
    }

    await ExpenseService.cancelRecurring(pending, ctx.session.dbUserId!, cancelFrom)
    ctx.session._pendingCancelExpenseId = undefined
    await ctx.reply(
      `✅ Cobrança cancelada a partir de *${formatMonthYear(cancelFrom)}*. Histórico anterior preservado.`,
      { parse_mode: 'Markdown' },
    )
  })
}
