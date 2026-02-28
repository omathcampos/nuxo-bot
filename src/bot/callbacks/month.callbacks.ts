import { BotContext } from '../../types/bot.types'
import { monthCommand } from '../commands/month.command'

// Callback: month:nav:2025-04
export async function monthNavCallback(ctx: BotContext) {
  await ctx.answerCallbackQuery()
  const data = ctx.callbackQuery?.data ?? ''
  const [, , yearMonth] = data.split(':')
  const [year, month] = yearMonth.split('-').map(Number)
  await ctx.editMessageText('Carregando...')
  await monthCommand(ctx, year, month)
}
