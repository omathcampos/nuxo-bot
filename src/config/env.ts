import 'dotenv/config'

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env var: ${key}`)
  return value
}

export const env = {
  BOT_TOKEN:                 requireEnv('BOT_TOKEN'),
  WEBHOOK_DOMAIN:            requireEnv('WEBHOOK_DOMAIN'),
  SUPABASE_URL:              requireEnv('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  PORT:                      parseInt(process.env.PORT ?? '3000'),
  NODE_ENV:                  process.env.NODE_ENV ?? 'development',
} as const
