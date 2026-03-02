import { InlineKeyboard } from 'grammy'
import { BotContext } from '../../types/bot.types'
import { monthCommand } from '../commands/month.command'
import { ExpenseService } from '../../services/expense.service'
import { formatBRL } from '../../utils/format.utils'
import { ChargeType } from '../../types/expense.types'

// Callback: month:nav:2025-04
export async function monthNavCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const data = ctx.callbackQuery?.data ?? ''
  const [, , yearMonth] = data.split(':')
  const [year, month] = yearMonth.split('-').map(Number)
  await ctx.editMessageText('Carregando...')
  await monthCommand(ctx, year, month)
}

// Callback: month:manage:2025-03
// Lista todos os itens do mês como botões para o usuário selecionar e gerenciar
export async function monthManageCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const data = ctx.callbackQuery?.data ?? ''
  const [, , yearMonth] = data.split(':')
  const [year, month] = yearMonth.split('-').map(Number)
  const userId = ctx.session.dbUserId!

  const summary = await ExpenseService.getMonthlySummary(userId, year, month)

  const allItems = Object.values(summary.byCategory).flatMap((cat) => cat.items)

  if (allItems.length === 0) {
    await ctx.reply('Nenhum gasto neste mês para gerenciar.')
    return
  }

  const kb = new InlineKeyboard()
  for (const item of allItems) {
    const label = item.description ?? 'Sem descrição'
    const value = formatBRL(item.amount)
    const isRecurring = item.chargeType === 'recurring'
    const btnLabel = isRecurring
      ? `❌ ${label} — ${value} 🔄`
      : `🗑 ${label} — ${value}`
    const action = isRecurring ? 'cancel' : 'delete'
    kb.text(btnLabel, `expense:${action}:${item.expenseId}`).row()
  }
  kb.text('Voltar', `month:nav:${yearMonth}`)

  await ctx.reply('Selecione o gasto para gerenciar:', { reply_markup: kb })
}

// Callback: month:filter:2025-03
// Exibe sub-menu de filtros
export async function monthFilterCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const data = ctx.callbackQuery?.data ?? ''
  const [, , yearMonth] = data.split(':')
  const [year, month] = yearMonth.split('-').map(Number)
  const userId = ctx.session.dbUserId!

  const summary = await ExpenseService.getMonthlySummary(userId, year, month)
  const categories = Object.keys(summary.byCategory)

  const kb = new InlineKeyboard()

  // Filtro por tipo de cobrança
  kb.text('À vista', `month:ftype:${yearMonth}:one_time`).row()
  kb.text('Parcelado', `month:ftype:${yearMonth}:installment`).row()
  kb.text('Recorrente 🔄', `month:ftype:${yearMonth}:recurring`).row()

  // Filtro por categoria
  for (const catName of categories) {
    kb.text(catName, `month:fcat:${yearMonth}:${catName}`).row()
  }

  kb.text('Cancelar', `month:nav:${yearMonth}`)

  await ctx.reply('Filtrar por:', { reply_markup: kb })
}

// Callback: month:ftype:2025-03:one_time
export async function monthFilterTypeCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const data = ctx.callbackQuery?.data ?? ''
  // format: month:ftype:{yearMonth}:{chargeType}
  const parts = data.split(':')
  const yearMonth = parts[2]
  const chargeType = parts[3] as ChargeType
  const [year, month] = yearMonth.split('-').map(Number)

  ctx.session._monthFilter = { chargeType }
  await ctx.editMessageText('Carregando...')
  await monthCommand(ctx, year, month)
}

// Callback: month:fcat:2025-03:Alimentação
export async function monthFilterCatCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const data = ctx.callbackQuery?.data ?? ''
  // format: month:fcat:{yearMonth}:{categoryName}
  const colonIdx3 = data.indexOf(':', data.indexOf(':', data.indexOf(':') + 1) + 1)
  const prefix = data.slice(0, colonIdx3)     // "month:fcat:2025-03"
  const categoryName = data.slice(colonIdx3 + 1) // "Alimentação"
  const yearMonth = prefix.split(':')[2]
  const [year, month] = yearMonth.split('-').map(Number)

  ctx.session._monthFilter = { categoryName }
  await ctx.editMessageText('Carregando...')
  await monthCommand(ctx, year, month)
}

// Callback: month:fclear:2025-03
export async function monthFilterClearCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const data = ctx.callbackQuery?.data ?? ''
  const [, , yearMonth] = data.split(':')
  const [year, month] = yearMonth.split('-').map(Number)

  ctx.session._monthFilter = undefined
  await ctx.editMessageText('Carregando...')
  await monthCommand(ctx, year, month)
}
