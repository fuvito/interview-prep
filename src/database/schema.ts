export const DB_NAME = 'InterviewPrepDB'

export const DB_VERSION = 3

export const DB_STORES_V1 = {
  questionProgress: 'questionId',
  assessmentSessions: 'id, subjectId, startedAt',
  bookmarks: 'questionId, createdAt',
  userPreferences: 'id',
  reviewSchedule: 'questionId, nextReviewAt',
} as const

export const DB_STORES_V2 = {
  ...DB_STORES_V1,
  uploadedContent: 'id, importedAt',
} as const

export const DB_STORES_V3 = {
  ...DB_STORES_V2,
  officialPacks: 'id, version, downloadedAt',
} as const
