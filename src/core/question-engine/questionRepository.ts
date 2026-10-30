import {
  allQuestions,
  allSubjects,
  allTopics,
  getTopicsBySubject,
} from '@/content'
import type { Difficulty, Question, QuestionFilter, QuestionType, Subject, Topic } from '@/types'

function applyFilter(questions: Question[], filter?: QuestionFilter): Question[] {
  if (!filter) return questions

  let result = questions

  if (filter.difficulty !== undefined) {
    const difficulties: Difficulty[] = Array.isArray(filter.difficulty)
      ? filter.difficulty
      : [filter.difficulty]
    result = result.filter((q) => difficulties.includes(q.difficulty))
  }

  if (filter.type !== undefined) {
    const types: QuestionType[] = Array.isArray(filter.type) ? filter.type : [filter.type]
    result = result.filter((q) => types.includes(q.type))
  }

  if (filter.commonInterviewOnly) {
    result = result.filter((q) => q.commonInterviewQuestion)
  }

  return result
}

export const questionRepository = {
  getAll(): Question[] {
    return allQuestions
  },

  getById(id: string): Question | undefined {
    return allQuestions.find((q) => q.id === id)
  },

  getByIds(ids: string[]): Question[] {
    const idSet = new Set(ids)
    return allQuestions.filter((q) => idSet.has(q.id))
  },

  getBySubject(subjectId: string, filter?: QuestionFilter): Question[] {
    const questions = allQuestions.filter((q) => q.subjectId === subjectId)
    return applyFilter(questions, filter)
  },

  getByTopic(topicId: string, filter?: QuestionFilter): Question[] {
    const questions = allQuestions.filter((q) => q.topicId === topicId)
    return applyFilter(questions, filter)
  },

  getCommonInterviewQuestions(subjectId?: string): Question[] {
    const questions = subjectId
      ? allQuestions.filter((q) => q.subjectId === subjectId)
      : allQuestions
    return questions.filter((q) => q.commonInterviewQuestion)
  },

  countByTopic(topicId: string): number {
    return allQuestions.filter((q) => q.topicId === topicId).length
  },

  countBySubject(subjectId: string): number {
    return allQuestions.filter((q) => q.subjectId === subjectId).length
  },

  getAllSubjects(): Subject[] {
    return allSubjects
  },

  getSubjectById(id: string): Subject | undefined {
    return allSubjects.find((s) => s.id === id)
  },

  getAllTopics(): Topic[] {
    return allTopics
  },

  getTopicById(id: string): Topic | undefined {
    return allTopics.find((t) => t.id === id)
  },

  getTopicsBySubject(subjectId: string): Topic[] {
    return getTopicsBySubject(subjectId)
  },
}
