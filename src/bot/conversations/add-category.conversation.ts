import { BotConversation, BotContext } from '../../types/bot.types'
import { CategoryService } from '../../services/category.service'

export async function addCategoryConversation(
  conversation: BotConversation,
  ctx: BotContext,
) {
  const userId = await conversation.external((outerCtx) => outerCtx.session.dbUserId!)

  await ctx.reply('Nome da nova categoria?')
  const nameCtx = await conversation.wait()
  const name = nameCtx.message?.text?.trim()
  if (!name) {
    await ctx.reply('Nome inválido. Tente novamente.')
    return
  }

  await ctx.reply('Emoji para a categoria? (ex: 🎯 — ou /skip para pular)')
  const iconCtx = await conversation.wait()
  const icon = iconCtx.message?.text === '/skip' ? undefined : iconCtx.message?.text?.trim()

  await conversation.external(() =>
    CategoryService.create({ userId, name, icon }),
  )

  await ctx.reply(`Categoria *${icon ? icon + ' ' : ''}${name}* criada!`, { parse_mode: 'Markdown' })
}
