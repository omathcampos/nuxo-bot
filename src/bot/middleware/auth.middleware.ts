import { NextFunction } from 'grammy'
import { BotContext } from '../../types/bot.types'
import { UserService } from '../../services/user.service'

export async function authMiddleware(ctx: BotContext, next: NextFunction) {
  const telegramId = ctx.from?.id
  if (!telegramId) return next()

  if (!ctx.session.dbUserId) {
    const user = await UserService.upsert(telegramId, ctx.from?.first_name)
    ctx.session.dbUserId = user?.id ?? null
  }

  return next()
}
