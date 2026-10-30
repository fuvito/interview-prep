import Dexie, { type EntityTable } from 'dexie'
import type {
  AssessmentSession,
  Bookmark,
  OfficialSubjectPack,
  QuestionProgress,
  ReviewScheduleEntry,
  UploadedSubjectPack,
  UserPreferences,
} from '@/types'
import { DB_NAME, DB_VERSION, DB_STORES_V1, DB_STORES_V2, DB_STORES_V3 } from './schema'

const db = new Dexie(DB_NAME) as Dexie & {
  questionProgress: EntityTable<QuestionProgress, 'questionId'>
  assessmentSessions: EntityTable<AssessmentSession, 'id'>
  bookmarks: EntityTable<Bookmark, 'questionId'>
  userPreferences: EntityTable<UserPreferences, 'id'>
  reviewSchedule: EntityTable<ReviewScheduleEntry, 'questionId'>
  uploadedContent: EntityTable<UploadedSubjectPack, 'id'>
  officialPacks: EntityTable<OfficialSubjectPack, 'id'>
}

db.version(1).stores(DB_STORES_V1)
db.version(2).stores(DB_STORES_V2)
db.version(DB_VERSION).stores(DB_STORES_V3)

export { db }
