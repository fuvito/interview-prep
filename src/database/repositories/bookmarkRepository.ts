import { db } from '../db'
import type { Bookmark } from '@/types'

export const bookmarkRepository = {
  async add(questionId: string): Promise<void> {
    const bookmark: Bookmark = { questionId, createdAt: new Date().toISOString() }
    await db.bookmarks.put(bookmark)
  },

  async remove(questionId: string): Promise<void> {
    await db.bookmarks.delete(questionId)
  },

  async getAll(): Promise<Bookmark[]> {
    return db.bookmarks.orderBy('createdAt').reverse().toArray()
  },

  async isBookmarked(questionId: string): Promise<boolean> {
    const bookmark = await db.bookmarks.get(questionId)
    return bookmark !== undefined
  },

  async toggle(questionId: string): Promise<boolean> {
    const exists = await this.isBookmarked(questionId)
    if (exists) {
      await this.remove(questionId)
      return false
    } else {
      await this.add(questionId)
      return true
    }
  },
}
