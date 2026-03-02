import { InlineKeyboard } from 'grammy'
import { BotContext } from '../../types/bot.types'
import { ExpenseService } from '../../services/expense.service'
import { formatBRL } from '../../utils/format.utils'
import { formatMonthLabel } from '../../utils/date.utils'

export async function monthCommand(ctx: BotContext, year?: number, month?: number) {
  const now = new Date()
  const y = year  ?? now.getFullYear()
  const m = month ?? now.getMonth() + 1
  const userId = ctx.session.dbUserId!

  const summary = await ExpenseService.getMonthlySummary(userId, y, m)

  const lines: string[] = [`📅 *${formatMonthLabel(y, m)}*\n`]
  const kb = new InlineKeyboard()

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

        // Botão de ação por gasto
        const action = item.chargeType === 'recurring' ? 'cancel' : 'delete'
        const label  = item.chargeType === 'recurring' ? `❌ ${desc}` : `🗑 ${desc}`
        kb.text(label, `expense:${action}:${item.expenseId}`).row()
      }
      lines.push('')
    }
    lines.push(`*Total: ${formatBRL(summary.grandTotal)}*`)
  }

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
