import { StorageAdapter } from 'grammy'
import { supabase } from './client'

// Adapter de sessão persistente usando a tabela `sessions` do Supabase.
// Necessário para que o plugin @grammyjs/conversations sobreviva a restarts.
export class SupabaseSessionStorage<T> implements StorageAdapter<T> {
  async read(key: string): Promise<T | undefined> {
    const { data } = await supabase
      .from('sessions')
      .select('data')
      .eq('key', key)
      .single()
    return data?.data as T | undefined
  }

  async write(key: string, value: T): Promise<void> {
    await supabase
      .from('sessions')
      .upsert({ key, data: value }, { onConflict: 'key' })
  }

  async delete(key: string): Promise<void> {
    await supabase
      .from('sessions')
      .delete()
      .eq('key', key)
  }
}
