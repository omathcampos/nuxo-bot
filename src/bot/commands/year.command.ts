import { BotContext } from '../../types/bot.types'
import { ExpenseService } from '../../services/expense.service'
import { formatBRL } from '../../utils/format.utils'
import { formatMonthLabel } from '../../utils/date.utils'

const MONTH_NAMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

export async function yearCommand(ctx: BotContext) {
  const userId = ctx.session.dbUserId!
  const year = new Date().getFullYear()

  const months = await ExpenseService.getYearlySummary(userId, year)

  const lines: string[] = [`📈 *Resumo de ${year}*\n`]

  let yearTotal = 0
  for (const { month, total } of months) {
    yearTotal += total
    const label = MONTH_NAMES[month - 1]
    const bar   = total > 0 ? formatBRL(total) : '—'
    lines.push(`${label}: ${bar}`)
  }

  lines.push(`\n*Total do ano: ${formatBRL(yearTotal)}*`)

  await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown' })
}
