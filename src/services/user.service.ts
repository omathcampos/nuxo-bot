import { UserRepository } from '../repositories/user.repository'

export const UserService = {
  async upsert(telegramId: number, telegramName: string | undefined) {
    return UserRepository.upsert(telegramId, telegramName)
  },
}
