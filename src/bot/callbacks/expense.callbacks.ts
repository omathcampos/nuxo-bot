import { InlineKeyboard } from 'grammy'
import { BotContext } from '../../types/bot.types'
import { ExpenseService } from '../../services/expense.service'
import { formatBRL } from '../../utils/format.utils'
import { parseBillingDate, formatMonthYear } from '../../utils/date.utils'

// ── expense:delete:<id> ─────────────────────────────────────────────────────
// Parcelado: pergunta se quer apagar histórico passado também
// À vista: confirmação simples
export async function expenseDeleteCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const expenseId = parseInt((ctx.callbackQuery?.data ?? '').split(':')[2])
  const userId    = ctx.session.dbUserId!

  const expense = await ExpenseService.findById(expenseId, userId)
  if (!expense) {
    await ctx.reply('Gasto não encontrado.')
    return
  }

  const desc = expense.description ?? 'este gasto'

  if (expense.charge_type === 'installment') {
    const kb = new InlineKeyboard()
      .text('Sim, apagar tudo', `expense:delete:confirm:all:${expenseId}`).row()
      .text('Não, só parcelas futuras', `expense:delete:confirm:future:${expenseId}`).row()
      .text('Cancelar', 'expense:noop')

    await ctx.reply(
      `🗑 *Excluir "${desc}"*\n\nDeseja remover também as parcelas dos meses anteriores?`,
      { parse_mode: 'Markdown', reply_markup: kb },
    )
  } else {
    const kb = new InlineKeyboard()
      .text('Sim, excluir', `expense:delete:confirm:all:${expenseId}`)
      .text('Cancelar', 'expense:noop')

    await ctx.reply(
      `🗑 Confirma a exclusão de *"${desc}"* (${formatBRL(expense.total_amount)})?`,
      { parse_mode: 'Markdown', reply_markup: kb },
    )
  }
}

// ── expense:delete:confirm:<mode>:<id> ─────────────────────────────────────
export async function expenseDeleteConfirmCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const parts      = (ctx.callbackQuery?.data ?? '').split(':')
  const deleteAll  = parts[3] === 'all'
  const expenseId  = parseInt(parts[4])
  const userId     = ctx.session.dbUserId!

  await ExpenseService.deleteExpense(expenseId, userId, deleteAll)
  await ctx.editMessageText(
    deleteAll
      ? '✅ Gasto removido por completo.'
      : '✅ Parcelas futuras removidas. O histórico anterior foi preservado.',
  )
}

// ── expense:cancel:<id> ────────────────────────────────────────────────────
// Recorrente: pergunta a partir de qual mês cancelar
export async function expenseCancelCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const expenseId = parseInt((ctx.callbackQuery?.data ?? '').split(':')[2])
  const userId    = ctx.session.dbUserId!

  const expense = await ExpenseService.findById(expenseId, userId)
  if (!expense) {
    await ctx.reply('Gasto não encontrado.')
    return
  }

  const desc    = expense.description ?? 'este gasto recorrente'
  const nowDate = new Date()
  const thisMonth = formatMonthYear(nowDate)
  const nextMonth = formatMonthYear(new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 1))

  const kb = new InlineKeyboard()
    .text(`Este mês (${thisMonth})`,   `expense:cancel:confirm:${expenseId}:${thisMonth}`).row()
    .text(`Próximo mês (${nextMonth})`, `expense:cancel:confirm:${expenseId}:${nextMonth}`).row()
    .text('Outra data…',               `expense:cancel:custom:${expenseId}`).row()
    .text('Cancelar',                  'expense:noop')

  await ctx.reply(
    `❌ *Cancelar "${desc}"*\n\nA partir de qual mês deseja parar a cobrança?\n_(cobranças anteriores serão preservadas)_`,
    { parse_mode: 'Markdown', reply_markup: kb },
  )
}

// ── expense:cancel:confirm:<id>:<MM/YYYY> ──────────────────────────────────
export async function expenseCancelConfirmCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const parts     = (ctx.callbackQuery?.data ?? '').split(':')
  const expenseId = parseInt(parts[3])
  const monthStr  = parts[4]  // MM/YYYY
  const userId    = ctx.session.dbUserId!

  const cancelFrom = parseBillingDate(monthStr)
  if (!cancelFrom) {
    await ctx.reply('Data inválida.')
    return
  }

  await ExpenseService.cancelRecurring(expenseId, userId, cancelFrom)
  await ctx.editMessageText(
    `✅ Cobrança cancelada a partir de *${monthStr}*. O histórico anterior foi preservado.`,
    { parse_mode: 'Markdown' },
  )
}

// ── expense:cancel:custom:<id> ─────────────────────────────────────────────
// Usuário vai digitar a data manualmente
export async function expenseCancelCustomCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const expenseId = parseInt((ctx.callbackQuery?.data ?? '').split(':')[3])
  await ctx.reply(
    `Digite o mês de cancelamento no formato *MM/AAAA* (ex: 05/2025):`,
    { parse_mode: 'Markdown', reply_markup: { force_reply: true } },
  )
  // A resposta é tratada pelo listener de reply em callbacks/index.ts
  // Guardamos o expenseId na sessão para recuperar na resposta
  ;(ctx.session as any)._pendingCancelExpenseId = expenseId
}

// ── expense:noop ───────────────────────────────────────────────────────────
export async function expenseNoopCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery('Operação cancelada.')
  await ctx.editMessageText('Operação cancelada.')
}
