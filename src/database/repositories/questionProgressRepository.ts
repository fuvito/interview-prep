import { db } from '../db'
import type { QuestionProgress } from '@/types'

export const questionProgressRepository = {
  async get(questionId: string): Promise<QuestionProgress | undefined> {
    return db.questionProgress.get(questionId)
  },

  async getAll(): Promise<QuestionProgress[]> {
    return db.questionProgress.toArray()
  },

  async getByIds(questionIds: string[]): Promise<QuestionProgress[]> {
    return db.questionProgress.where('questionId').anyOf(questionIds).toArray()
  },

  async upsert(progress: QuestionProgress): Promise<void> {
    await db.questionProgress.put(progress)
  },

  async delete(questionId: string): Promise<void> {
    await db.questionProgress.delete(questionId)
  },

  async clear(): Promise<void> {
    await db.questionProgress.clear()
  },
}
