import { db } from '../db'
import type { UserPreferences } from '@/types'

const PREFERENCES_ID = 'preferences'

const defaults: UserPreferences = {
  id: PREFERENCES_ID,
  theme: 'system',
}

export const userPreferencesRepository = {
  async get(): Promise<UserPreferences> {
    const prefs = await db.userPreferences.get(PREFERENCES_ID)
    return prefs ?? defaults
  },

  async save(changes: Partial<Omit<UserPreferences, 'id'>>): Promise<void> {
    const current = await this.get()
    await db.userPreferences.put({ ...current, ...changes })
  },
}
