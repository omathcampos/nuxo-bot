import { BotError } from 'grammy'
import { BotContext } from '../../types/bot.types'

export async function errorMiddleware(err: BotError<BotContext>) {
  console.error('Bot error:', err.message, err.ctx?.update)
  try {
    await err.ctx.reply('Ocorreu um erro inesperado. Tente novamente.')
  } catch {
    // ignora se não conseguir responder
  }
}
