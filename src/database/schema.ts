export const DB_NAME = 'InterviewPrepDB'

export const DB_VERSION = 1

// Dexie index definitions per version.
// Primary key is the first field; additional indexed fields follow.
export const DB_STORES_V1 = {
  questionProgress: 'questionId',
  assessmentSessions: 'id, subjectId, startedAt',
  bookmarks: 'questionId, createdAt',
  userPreferences: 'id',
  reviewSchedule: 'questionId, nextReviewAt',
} as const
