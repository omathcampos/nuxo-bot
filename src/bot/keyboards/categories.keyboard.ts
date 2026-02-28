import { InlineKeyboard } from 'grammy'
import { Category } from '../../types/category.types'

export function categoriesKeyboard(categories: Category[]) {
  const kb = new InlineKeyboard()

  categories.forEach((cat, i) => {
    const label = cat.icon ? `${cat.icon} ${cat.name}` : cat.name
    kb.text(label, `cat:${cat.id}`)
    if ((i + 1) % 2 === 0) kb.row()
  })

  kb.row().text('+ Nova categoria', 'cat:new')

  return kb
}
