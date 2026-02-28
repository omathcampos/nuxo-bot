import { BotContext } from '../../types/bot.types'

export async function startCommand(ctx: BotContext) {
  await ctx.reply(
    `Olá, ${ctx.from?.first_name}! 👋\n\nSou o *Nuxo*, seu assistente financeiro pessoal.\n\nO que deseja fazer?`,
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '➕ Registrar gasto', callback_data: 'menu:add' }],
          [{ text: '📊 Ver gastos do mês', callback_data: 'menu:month' }],
          [{ text: '🏷️ Categorias', callback_data: 'menu:categories' }],
        ],
      },
    }
  )
}
