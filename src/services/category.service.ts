import { CategoryRepository } from '../repositories/category.repository'
import { CreateCategoryDTO } from '../types/category.types'

export const CategoryService = {
  async getAllForUser(userId: number) {
    return CategoryRepository.findAllForUser(userId)
  },

  async create(dto: CreateCategoryDTO) {
    return CategoryRepository.create(dto)
  },
}
