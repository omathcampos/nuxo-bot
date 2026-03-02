import { BotConversation, BotContext } from '../../types/bot.types'
import { expenseTypeKeyboard } from '../keyboards/expense-type.keyboard'
import { paymentMethodKeyboard } from '../keyboards/payment-method.keyboard'
import { categoriesKeyboard } from '../keyboards/categories.keyboard'
import { ExpenseService } from '../../services/expense.service'
import { parseAmount } from '../../utils/format.utils'
import { parseInstallments } from '../../utils/validation.utils'
import { parseBillingDate, formatMonthYear } from '../../utils/date.utils'
import { ChargeType, PaymentMethod } from '../../types/expense.types'

export async function addExpenseConversation(
  conversation: BotConversation,
  ctx: BotContext,
) {
  const userId = await conversation.external((outerCtx) => outerCtx.session.dbUserId!)

  // PASSO 1: Valor
  await ctx.reply('Qual o valor total? (ex: 150,00)')
  const amountCtx = await conversation.wait()
  const totalAmount = parseAmount(amountCtx.message?.text)
  if (!totalAmount) {
    await ctx.reply('Valor inválido. Use /add para tentar novamente.')
    return
  }

  // PASSO 2: Tipo de cobrança
  await ctx.reply('Como é essa cobrança?', { reply_markup: expenseTypeKeyboard() })
  const typeCtx = await conversation.waitForCallbackQuery(
    ['type:one_time', 'type:installment', 'type:recurring'],
  )
  await typeCtx.answerCallbackQuery()
  const chargeType = typeCtx.callbackQuery.data.split(':')[1] as ChargeType

  // PASSO 3: Parcelas (apenas para installment)
  let installmentsTotal: number | undefined

  if (chargeType === 'installment') {
    await ctx.reply('Em quantas parcelas?')
    const installCtx = await conversation.wait()
    const n = parseInstallments(installCtx.message?.text)
    if (!n) {
      await ctx.reply('Número inválido (mínimo 2). Use /add para tentar novamente.')
      return
    }
    installmentsTotal = n
    await ctx.reply(`${n}x de R$ ${(totalAmount / n).toFixed(2).replace('.', ',')}`)
  }

  // PASSO 4: Forma de pagamento
  await ctx.reply('Forma de pagamento?', { reply_markup: paymentMethodKeyboard(chargeType) })
  const payCtx = await conversation.waitForCallbackQuery(
    ['pay:credit_card', 'pay:debit_card', 'pay:pix', 'pay:cash'],
  )
  await payCtx.answerCallbackQuery()
  const paymentMethod = payCtx.callbackQuery.data.split(':')[1] as PaymentMethod

  // PASSO 5: Data de início
  await ctx.reply('Mês de início da cobrança? (ex: 03/2025 ou *hoje*)', { parse_mode: 'Markdown' })
  const dateCtx = await conversation.wait()
  const billingStartDate = parseBillingDate(dateCtx.message?.text ?? '')
  if (!billingStartDate) {
    await ctx.reply('Data inválida. Use o formato MM/AAAA ou "hoje".')
    return
  }

  // PASSO 6: Categoria
  const categories = await conversation.external(() =>
    ExpenseService.getCategoriesForUser(userId),
  )
  await ctx.reply('Categoria?', { reply_markup: categoriesKeyboard(categories) })
  const catCtx = await conversation.waitForCallbackQuery(/^cat:(\d+|new)$/)
  await catCtx.answerCallbackQuery()
  const catData = catCtx.callbackQuery.data

  let categoryId: number

  if (catData === 'cat:new') {
    await ctx.conversation.enter('add-category')
    await ctx.reply('Categoria criada! Reinicie o registro com /add.')
    return
  } else {
    categoryId = parseInt(catData.split(':')[1])
  }

  // PASSO 7: Descrição (opcional)
  await ctx.reply('Descrição? (opcional — envie /skip para pular)')
  const descCtx = await conversation.wait()
  const description = descCtx.message?.text === '/skip' ? undefined : descCtx.message?.text

  // PASSO 8: Salvar
  await conversation.external(() =>
    ExpenseService.create({
      userId,
      categoryId,
      totalAmount,
      paymentMethod,
      chargeType,
      billingStartDate,
      installmentsTotal,
      description,
    }),
  )

  const startLabel = formatMonthYear(billingStartDate)
  const typeLabel  = chargeType === 'installment'
    ? `${installmentsTotal}x`
    : chargeType === 'recurring' ? 'Recorrente' : 'À vista'

  await ctx.reply(
    `Gasto registrado! ✅\n\n` +
    `Valor: R$ ${totalAmount.toFixed(2).replace('.', ',')}\n` +
    `Tipo: ${typeLabel}\n` +
    `Início: ${startLabel}`,
  )
}
