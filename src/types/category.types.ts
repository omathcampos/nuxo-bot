export interface Category {
  id: number
  userId: number | null
  name: string
  icon: string | null
  isDefault: boolean
  createdAt: Date
}

export interface CreateCategoryDTO {
  userId: number
  name: string
  icon?: string
}
