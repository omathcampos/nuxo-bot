import { Bot } from 'grammy'
import { BotContext } from '../../types/bot.types'
import { monthNavCallback } from './month.callbacks'
import { expenseDeleteCallback, expenseCancelCallback } from './expense.callbacks'
import { monthCommand } from '../commands/month.command'
import { addCommand } from '../commands/add.command'

export function registerCallbacks(bot: Bot<BotContext>) {
  bot.callbackQuery('menu:add',   (ctx) => { ctx.answerCallbackQuery(); addCommand(ctx) })
  bot.callbackQuery('menu:month', (ctx) => { ctx.answerCallbackQuery(); monthCommand(ctx) })

  bot.callbackQuery(/^month:nav:\d{4}-\d{2}$/, monthNavCallback)
  bot.callbackQuery(/^expense:delete:\d+$/,     expenseDeleteCallback)
  bot.callbackQuery(/^expense:cancel:\d+$/,     expenseCancelCallback)
}
