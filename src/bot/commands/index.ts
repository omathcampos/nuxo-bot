import { Bot } from 'grammy'
import { BotContext } from '../../types/bot.types'
import { startCommand } from './start.command'
import { addCommand } from './add.command'
import { monthCommand } from './month.command'
import { recurringCommand } from './recurring.command'
import { yearCommand } from './year.command'

export function registerCommands(bot: Bot<BotContext>) {
  bot.command('start',     startCommand)
  bot.command('add',       addCommand)
  bot.command('month',     (ctx) => monthCommand(ctx))
  bot.command('recurring', recurringCommand)
  bot.command('year',      yearCommand)
}
