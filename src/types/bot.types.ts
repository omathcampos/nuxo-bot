import { Context, SessionFlavor } from 'grammy'
import { ConversationFlavor, Conversation } from '@grammyjs/conversations'
import { ChargeType } from './expense.types'

export interface SessionData {
  dbUserId: number | null
  _pendingCancelExpenseId?: number
  _monthFilter?: { chargeType?: ChargeType; categoryName?: string }
}

// BaseContext: contexto sem o flavor de conversations
type BaseContext = Context & SessionFlavor<SessionData>

// BotContext: contexto completo usado em commands, callbacks e conversations
export type BotContext = ConversationFlavor<BaseContext>

// BotConversation: tipo do objeto `conversation` dentro de uma conversa
export type BotConversation = Conversation<BotContext, BotContext>
