import { describe, it, expect } from 'vitest'
import { questionRepository } from './questionRepository'

describe('questionRepository', () => {
  describe('getAll', () => {
    it('returns bundled questions', () => {
      expect(questionRepository.getAll().length).toBeGreaterThanOrEqual(155)
    })
  })

  describe('getById', () => {
    it('returns a question for a known id', () => {
      const first = questionRepository.getAll()[0]
      expect(questionRepository.getById(first.id)).toBe(first)
    })

    it('returns undefined for an unknown id', () => {
      expect(questionRepository.getById('__nonexistent__')).toBeUndefined()
    })
  })

  describe('getByIds', () => {
    it('returns questions matching the given ids', () => {
      const all = questionRepository.getAll()
      const ids = [all[0].id, all[1].id]
      const result = questionRepository.getByIds(ids)
      expect(result).toHaveLength(2)
      expect(result.map((q) => q.id)).toEqual(expect.arrayContaining(ids))
    })

    it('ignores ids that do not exist', () => {
      const id = questionRepository.getAll()[0].id
      const result = questionRepository.getByIds([id, '__missing__'])
      expect(result).toHaveLength(1)
    })
  })

  describe('getBySubject', () => {
    it('returns only questions for the given subject', () => {
      const result = questionRepository.getBySubject('typescript')
      expect(result.length).toBeGreaterThan(0)
      result.forEach((q) => expect(q.subjectId).toBe('typescript'))
    })

    it('filters by a single difficulty', () => {
      const result = questionRepository.getBySubject('typescript', { difficulty: 'beginner' })
      expect(result.length).toBeGreaterThan(0)
      result.forEach((q) => expect(q.difficulty).toBe('beginner'))
    })

    it('filters by multiple difficulties', () => {
      const result = questionRepository.getBySubject('typescript', {
        difficulty: ['beginner', 'intermediate'],
      })
      result.forEach((q) => expect(['beginner', 'intermediate']).toContain(q.difficulty))
    })

    it('filters by type', () => {
      const result = questionRepository.getBySubject('typescript', { type: 'single' })
      expect(result.length).toBeGreaterThan(0)
      result.forEach((q) => expect(q.type).toBe('single'))
    })

    it('filters by multiple types', () => {
      const result = questionRepository.getBySubject('typescript', { type: ['single', 'code'] })
      result.forEach((q) => expect(['single', 'code']).toContain(q.type))
    })

    it('filters commonInterviewOnly', () => {
      const result = questionRepository.getBySubject('typescript', { commonInterviewOnly: true })
      expect(result.length).toBeGreaterThan(0)
      result.forEach((q) => expect(q.commonInterviewQuestion).toBe(true))
    })

    it('returns empty array for unknown subject', () => {
      expect(questionRepository.getBySubject('__nope__')).toHaveLength(0)
    })
  })

  describe('getByTopic', () => {
    it('returns questions for a specific topic', () => {
      const topics = questionRepository.getAllTopics()
      const topic = topics[0]
      const result = questionRepository.getByTopic(topic.id)
      expect(result.length).toBeGreaterThan(0)
      result.forEach((q) => expect(q.topicId).toBe(topic.id))
    })
  })

  describe('countBySubject', () => {
    it('returns 155 for typescript', () => {
      expect(questionRepository.countBySubject('typescript')).toBe(155)
    })

    it('returns 0 for unknown subject', () => {
      expect(questionRepository.countBySubject('__unknown__')).toBe(0)
    })
  })

  describe('countByTopic', () => {
    it('returns a positive count for a known topic', () => {
      const topic = questionRepository.getAllTopics()[0]
      expect(questionRepository.countByTopic(topic.id)).toBeGreaterThan(0)
    })
  })

  describe('getAllSubjects', () => {
    it('returns at least one subject', () => {
      expect(questionRepository.getAllSubjects().length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('getSubjectById', () => {
    it('returns the typescript subject', () => {
      const subject = questionRepository.getSubjectById('typescript')
      expect(subject).toBeDefined()
      expect(subject?.id).toBe('typescript')
    })

    it('returns undefined for an unknown subject', () => {
      expect(questionRepository.getSubjectById('__nope__')).toBeUndefined()
    })
  })

  describe('getAllTopics', () => {
    it('returns 6 typescript topics', () => {
      const topics = questionRepository.getAllTopics()
      expect(topics.length).toBeGreaterThanOrEqual(6)
    })
  })

  describe('getTopicById', () => {
    it('returns a topic for a known id', () => {
      const topics = questionRepository.getAllTopics()
      const t = topics[0]
      expect(questionRepository.getTopicById(t.id)).toEqual(t)
    })

    it('returns undefined for unknown id', () => {
      expect(questionRepository.getTopicById('__nope__')).toBeUndefined()
    })
  })

  describe('getTopicsBySubject', () => {
    it('returns topics for typescript', () => {
      const result = questionRepository.getTopicsBySubject('typescript')
      expect(result.length).toBeGreaterThan(0)
      result.forEach((t) => expect(t.subjectId).toBe('typescript'))
    })
  })

  describe('getCommonInterviewQuestions', () => {
    it('returns only questions marked as common interview questions', () => {
      const result = questionRepository.getCommonInterviewQuestions()
      expect(result.length).toBeGreaterThan(0)
      result.forEach((q) => expect(q.commonInterviewQuestion).toBe(true))
    })

    it('filters by subject when provided', () => {
      const result = questionRepository.getCommonInterviewQuestions('typescript')
      result.forEach((q) => {
        expect(q.commonInterviewQuestion).toBe(true)
        expect(q.subjectId).toBe('typescript')
      })
    })
  })
})
