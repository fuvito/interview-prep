import Dexie, { type EntityTable } from 'dexie'
import type {
  AssessmentSession,
  Bookmark,
  QuestionProgress,
  ReviewScheduleEntry,
  UserPreferences,
} from '@/types'
import { DB_NAME, DB_VERSION, DB_STORES_V1 } from './schema'

const db = new Dexie(DB_NAME) as Dexie & {
  questionProgress: EntityTable<QuestionProgress, 'questionId'>
  assessmentSessions: EntityTable<AssessmentSession, 'id'>
  bookmarks: EntityTable<Bookmark, 'questionId'>
  userPreferences: EntityTable<UserPreferences, 'id'>
  reviewSchedule: EntityTable<ReviewScheduleEntry, 'questionId'>
}

db.version(DB_VERSION).stores(DB_STORES_V1)

export { db }
