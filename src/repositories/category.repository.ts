import { supabase } from '../db/client'
import { CreateCategoryDTO } from '../types/category.types'

export const CategoryRepository = {
  // Retorna categorias globais + as do usuário
  async findAllForUser(userId: number) {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order('is_default', { ascending: false })
      .order('name')
    return data ?? []
  },

  async create(dto: CreateCategoryDTO) {
    const { data } = await supabase
      .from('categories')
      .insert({ user_id: dto.userId, name: dto.name, icon: dto.icon ?? null })
      .select('*')
      .single()
    return data
  },
}
