import { bookmarkRepository } from '@/database/repositories'
import { questionRepository } from '@/core/question-engine'
import type { Bookmark, Question } from '@/types'

export const bookmarkEngine = {
  async toggle(questionId: string): Promise<boolean> {
    return bookmarkRepository.toggle(questionId)
  },

  async isBookmarked(questionId: string): Promise<boolean> {
    return bookmarkRepository.isBookmarked(questionId)
  },

  async getAll(): Promise<Bookmark[]> {
    return bookmarkRepository.getAll()
  },

  // Returns full question objects for all bookmarks, preserving bookmark order.
  async getBookmarkedQuestions(): Promise<Question[]> {
    const bookmarks = await bookmarkRepository.getAll()
    return questionRepository.getByIds(bookmarks.map((b) => b.questionId))
  },
}
