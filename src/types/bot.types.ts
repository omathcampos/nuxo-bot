import { Context, SessionFlavor } from 'grammy'
import { ConversationFlavor, Conversation } from '@grammyjs/conversations'

export interface SessionData {
  dbUserId: number | null
}

// BaseContext: contexto sem o flavor de conversations
type BaseContext = Context & SessionFlavor<SessionData>

// BotContext: contexto completo usado em commands, callbacks e conversations
export type BotContext = ConversationFlavor<BaseContext>

// BotConversation: tipo do objeto `conversation` dentro de uma conversa
export type BotConversation = Conversation<BotContext, BotContext>
