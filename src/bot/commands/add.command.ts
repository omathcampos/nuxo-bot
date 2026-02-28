import { BotContext } from '../../types/bot.types'

export async function addCommand(ctx: BotContext) {
  await ctx.conversation.enter('add-expense')
}
