import { supabase } from '../db/client'

export const UserRepository = {
  async findByTelegramId(telegramId: number) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single()
    return data
  },

  async upsert(telegramId: number, telegramName: string | undefined) {
    const { data } = await supabase
      .from('users')
      .upsert({ telegram_id: telegramId, telegram_name: telegramName ?? null },
               { onConflict: 'telegram_id' })
      .select('*')
      .single()
    return data
  },
}
