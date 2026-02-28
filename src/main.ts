import { createBot, createWebhookServer } from './bot/index'
import { env } from './config/env'

async function main() {
  const bot = createBot()
  const app = createWebhookServer(bot)

  const webhookUrl = `${env.WEBHOOK_DOMAIN}/webhook/${env.BOT_TOKEN}`
  await bot.api.setWebhook(webhookUrl)
  console.log(`Webhook registrado: ${webhookUrl}`)

  app.listen(env.PORT, () => {
    console.log(`Nuxo-Bot rodando na porta ${env.PORT}`)
  })
}

main().catch((err) => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
