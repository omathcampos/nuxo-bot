import { InlineKeyboard } from 'grammy'
import { BotContext } from '../../types/bot.types'
import { ExpenseService } from '../../services/expense.service'
import { MonthlyExpenseSummary, ChargeType } from '../../types/expense.types'
import { formatBRL } from '../../utils/format.utils'
import { formatMonthLabel } from '../../utils/date.utils'

export async function monthCommand(ctx: BotContext, year?: number, month?: number) {
  const now = new Date()
  const y = year  ?? now.getFullYear()
  const m = month ?? now.getMonth() + 1
  const userId = ctx.session.dbUserId!

  const filter = ctx.session._monthFilter

  const fullSummary = await ExpenseService.getMonthlySummary(userId, y, m)
  const summary = applyFilter(fullSummary, filter)

  const yearMonthStr = `${y}-${String(m).padStart(2, '0')}`

  const lines: string[] = [`📅 *${formatMonthLabel(y, m)}*\n`]

  if (filter) {
    const filterDesc = filter.categoryName
      ? `🔍 Filtro: *${filter.categoryName}*`
      : filter.chargeType
        ? `🔍 Filtro: *${chargeTypeLabel(filter.chargeType)}*`
        : ''
    if (filterDesc) lines.push(filterDesc + '\n')
  }

  if (Object.keys(summary.byCategory).length === 0) {
    lines.push('Nenhum gasto registrado neste mês.')
  } else {
    for (const [catName, data] of Object.entries(summary.byCategory)) {
      lines.push(`${data.icon ?? '📦'} *${catName}* — ${formatBRL(data.total)}`)

      for (const item of data.items) {
        const desc  = item.description ?? catName
        const value = formatBRL(item.amount)
        const parc  = item.installmentNumber
          ? ` _(${item.installmentNumber}/${item.installmentsTotal})_`
          : item.chargeType === 'recurring' ? ' 🔄' : ''

        lines.push(`  • ${desc}${parc} — ${value}`)
      }
      lines.push('')
    }
    lines.push(`*Total: ${formatBRL(summary.grandTotal)}*`)
  }

  const kb = new InlineKeyboard()

  // Linha de ação: Gerenciar + Filtrar/Limpar
  const hasItems = Object.keys(fullSummary.byCategory).length > 0
  if (hasItems) {
    kb.text('✏️ Gerenciar', `month:manage:${yearMonthStr}`)
  }

  if (filter) {
    kb.text('❌ Limpar filtro', `month:fclear:${yearMonthStr}`)
  } else {
    kb.text('🔍 Filtrar', `month:filter:${yearMonthStr}`)
  }
  kb.row()

  // Navegação entre meses
  const prev = new Date(y, m - 2, 1)
  const next = new Date(y, m, 1)
  kb
    .text(
      `◀ ${formatMonthLabel(prev.getFullYear(), prev.getMonth() + 1).split(' de ')[0]}`,
      `month:nav:${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`,
    )
    .text(
      `${formatMonthLabel(next.getFullYear(), next.getMonth() + 1).split(' de ')[0]} ▶`,
      `month:nav:${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`,
    )

  await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown', reply_markup: kb })
}

function applyFilter(
  summary: MonthlyExpenseSummary,
  filter?: { chargeType?: ChargeType; categoryName?: string },
): MonthlyExpenseSummary {
  if (!filter) return summary

  const byCategory: MonthlyExpenseSummary['byCategory'] = {}
  let grandTotal = 0

  for (const [catName, data] of Object.entries(summary.byCategory)) {
    if (filter.categoryName && catName !== filter.categoryName) continue

    const items = filter.chargeType
      ? data.items.filter((i) => i.chargeType === filter.chargeType)
      : data.items

    if (items.length === 0) continue

    const total = items.reduce((sum, i) => sum + i.amount, 0)
    byCategory[catName] = { icon: data.icon, items, total }
    grandTotal += total
  }

  return { byCategory, grandTotal }
}

function chargeTypeLabel(ct: ChargeType): string {
  if (ct === 'one_time')    return 'À vista'
  if (ct === 'installment') return 'Parcelado'
  return 'Recorrente'
}
