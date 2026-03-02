import { InlineKeyboard } from 'grammy'
import { BotContext } from '../../types/bot.types'
import { ExpenseService } from '../../services/expense.service'
import { formatBRL } from '../../utils/format.utils'

export async function recurringCommand(ctx: BotContext) {
  const userId = ctx.session.dbUserId!
  const items = await ExpenseService.getActiveRecurring(userId)

  if (items.length === 0) {
    await ctx.reply('Você não possui cobranças recorrentes ativas.')
    return
  }

  const lines: string[] = ['🔄 *Recorrentes ativos*\n']
  const kb = new InlineKeyboard()

  for (const item of items) {
    const cat  = item.categories
    const icon = cat?.icon ?? '📦'
    const name = item.description ?? cat?.name ?? 'Sem nome'
    const val  = formatBRL(item.total_amount)

    lines.push(`${icon} ${name} — ${val}/mês`)
    kb.text(`❌ Cancelar: ${name}`, `expense:cancel:${item.id}`).row()
  }

  await ctx.reply(lines.join('\n'), { parse_mode: 'Markdown', reply_markup: kb })
}
