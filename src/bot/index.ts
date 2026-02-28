import { Bot, session, webhookCallback } from 'grammy'
import { conversations, createConversation } from '@grammyjs/conversations'
import express from 'express'
import { BotContext, SessionData } from '../types/bot.types'
import { authMiddleware } from './middleware/auth.middleware'
import { errorMiddleware } from './middleware/error.middleware'
import { registerCommands } from './commands/index'
import { registerCallbacks } from './callbacks/index'
import { addExpenseConversation } from './conversations/add-expense.conversation'
import { addCategoryConversation } from './conversations/add-category.conversation'
import { SupabaseSessionStorage } from '../db/session-storage'
import { env } from '../config/env'

export function createBot() {
  const bot = new Bot<BotContext>(env.BOT_TOKEN)

  // 1. Session persistente via Supabase (deve vir antes de conversations)
  bot.use(session<SessionData, BotContext>({
    initial: (): SessionData => ({ dbUserId: null }),
    storage: new SupabaseSessionStorage(),
  }))

  // 2. Conversations
  bot.use(conversations())
  bot.use(createConversation(addExpenseConversation, 'add-expense'))
  bot.use(createConversation(addCategoryConversation, 'add-category'))

  // 3. Auth (garante usuário no DB antes de qualquer handler)
  bot.use(authMiddleware)

  // 4. Commands e callbacks
  registerCommands(bot)
  registerCallbacks(bot)

  // 5. Error handler global
  bot.catch(errorMiddleware)

  return bot
}

export function createWebhookServer(bot: Bot<BotContext>) {
  const app = express()
  app.use(express.json())

  app.post(`/webhook/${env.BOT_TOKEN}`, webhookCallback(bot, 'express'))
  app.get('/health', (_req, res) => res.json({ status: 'ok' }))

  return app
}
