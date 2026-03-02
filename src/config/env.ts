import 'dotenv/config'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env var: ${key}`)
  return value
}

const NODE_ENV = process.env.NODE_ENV ?? 'development'

export const env = {
  BOT_TOKEN:                 requireEnv('BOT_TOKEN'),
  SUPABASE_URL:              requireEnv('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  // Só obrigatório em produção (webhook mode)
  WEBHOOK_DOMAIN: NODE_ENV === 'production' ? requireEnv('WEBHOOK_DOMAIN') : (process.env.WEBHOOK_DOMAIN ?? ''),
  PORT:           parseInt(process.env.PORT ?? '3000'),
  NODE_ENV,
} as const
