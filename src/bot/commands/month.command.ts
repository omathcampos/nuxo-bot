import { BotContext } from '../../types/bot.types'
import { ExpenseService } from '../../services/expense.service'
import { formatBRL as _formatBRL } from '../../utils/format.utils'
import { formatMonthLabel } from '../../utils/date.utils'
import { InlineKeyboard } from 'grammy'

export async function monthCommand(ctx: BotContext, year?: number, month?: number) {
  const now = new Date()
  const y = year  ?? now.getFullYear()
  const m = month ?? now.getMonth() + 1
  const userId = ctx.session.dbUserId!

  const summary = await ExpenseService.getMonthlySummary(userId, y, m)

  const lines: string[] = [`📅 *${formatMonthLabel(y, m)}*\n`]

  if (Object.keys(summary.byCategory).length === 0) {
    lines.push('Nenhum gasto registrado neste mês.')
  } else {
    for (const [catName, data] of Object.entries(summary.byCategory)) {
      const icon = data.icon ?? '📦'
      lines.push(`${icon} *${catName}* — ${_formatBRL(data.total)}`)
      for (const item of data.items) {
        const desc  = item.description ?? catName
        const value = _formatBRL(item.amount)
        const parc  = item.installmentNumber
          ? ` (${item.installmentNumber}/${item.installmentsTotal})`
          : item.chargeType === 'recurring' ? ' 🔄' : ''
        lines.push(`  • ${desc}${parc} — ${value}`)
      }
      lines.push('')
    }
    lines.push(`*Total: ${_formatBRL(summary.grandTotal)}*`)
  }

  // Navegação entre meses
  const prevDate = new Date(y, m - 2, 1)
  const nextDate = new Date(y, m, 1)
  const navKb = new InlineKeyboard()
    .text(`◀ ${formatMonthLabel(prevDate.getFullYear(), prevDate.getMonth() + 1).split(' ')[0]}`,
          `month:nav:${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`)
    .text(`${formatMonthLabel(nextDate.getFullYear(), nextDate.getMonth() + 1).split(' ')[0]} ▶`,
          `month:nav:${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`)

  await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown', reply_markup: navKb })
}
