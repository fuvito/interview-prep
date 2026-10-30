import { db } from '../db'
import type { AssessmentSession } from '@/types'

export const assessmentSessionRepository = {
  async create(session: AssessmentSession): Promise<void> {
    await db.assessmentSessions.add(session)
  },

  async update(id: string, changes: Partial<Omit<AssessmentSession, 'id'>>): Promise<void> {
    await db.assessmentSessions.update(id, changes)
  },

  async getById(id: string): Promise<AssessmentSession | undefined> {
    return db.assessmentSessions.get(id)
  },

  async getAll(): Promise<AssessmentSession[]> {
    return db.assessmentSessions.orderBy('startedAt').reverse().toArray()
  },

  async getBySubject(subjectId: string): Promise<AssessmentSession[]> {
    return db.assessmentSessions
      .where('subjectId')
      .equals(subjectId)
      .reverse()
      .sortBy('startedAt')
  },

  async delete(id: string): Promise<void> {
    await db.assessmentSessions.delete(id)
  },

  async clear(): Promise<void> {
    await db.assessmentSessions.clear()
  },
}
