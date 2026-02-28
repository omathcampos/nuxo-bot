import { Bot } from 'grammy'
import { BotContext } from '../../types/bot.types'
import { startCommand } from './start.command'
import { addCommand } from './add.command'
import { monthCommand } from './month.command'

export function registerCommands(bot: Bot<BotContext>) {
  bot.command('start', startCommand)
  bot.command('add',   addCommand)
  bot.command('month', (ctx) => monthCommand(ctx))
}
