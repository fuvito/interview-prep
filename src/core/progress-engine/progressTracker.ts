import { questionProgressRepository } from '@/database/repositories'
import { questionRepository } from '@/core/question-engine'
import { calculateSessionScore } from '@/core/scoring-engine'
import type { QuestionProgress, SubjectStats, TopicStats, WeakArea } from '@/types'

async function getTopicStats(topicId: string): Promise<TopicStats> {
  const questions = questionRepository.getByTopic(topicId)
  const questionIds = questions.map((q) => q.id)
  const records = await questionProgressRepository.getByIds(questionIds)

  const correctAttempts = records.reduce((sum, p) => sum + p.correctAttempts, 0)
  const incorrectAttempts = records.reduce((sum, p) => sum + p.incorrectAttempts, 0)
  const totalAttempts = correctAttempts + incorrectAttempts

  return {
    topicId,
    totalQuestions: questions.length,
    attemptedQuestions: records.length,
    correctAttempts,
    incorrectAttempts,
    completionRate: questions.length > 0 ? records.length / questions.length : 0,
    correctRate: totalAttempts > 0 ? correctAttempts / totalAttempts : 0,
  }
}

export const progressTracker = {
  async recordAttempt(questionId: string, isCorrect: boolean): Promise<QuestionProgress> {
    const existing = await questionProgressRepository.get(questionId)
    const now = new Date().toISOString()

    const progress: QuestionProgress = {
      questionId,
      attempts: (existing?.attempts ?? 0) + 1,
      correctAttempts: (existing?.correctAttempts ?? 0) + (isCorrect ? 1 : 0),
      incorrectAttempts: (existing?.incorrectAttempts ?? 0) + (isCorrect ? 0 : 1),
      lastAttemptAt: now,
      lastResult: isCorrect ? 'correct' : 'incorrect',
    }

    await questionProgressRepository.upsert(progress)
    return progress
  },

  async getProgress(questionId: string): Promise<QuestionProgress | undefined> {
    return questionProgressRepository.get(questionId)
  },

  async getAllProgress(): Promise<QuestionProgress[]> {
    return questionProgressRepository.getAll()
  },

  async getTopicStats(topicId: string): Promise<TopicStats> {
    return getTopicStats(topicId)
  },

  async getSubjectStats(subjectId: string): Promise<SubjectStats> {
    const topics = questionRepository.getTopicsBySubject(subjectId)
    const topicStats = await Promise.all(topics.map((t) => getTopicStats(t.id)))

    const totalQuestions = topicStats.reduce((sum, ts) => sum + ts.totalQuestions, 0)
    const attemptedQuestions = topicStats.reduce((sum, ts) => sum + ts.attemptedQuestions, 0)
    const correctAttempts = topicStats.reduce((sum, ts) => sum + ts.correctAttempts, 0)
    const incorrectAttempts = topicStats.reduce((sum, ts) => sum + ts.incorrectAttempts, 0)
    const totalAttempts = correctAttempts + incorrectAttempts

    return {
      subjectId,
      totalQuestions,
      attemptedQuestions,
      totalAttempts,
      correctAttempts,
      score: calculateSessionScore(correctAttempts, totalAttempts),
      topicStats,
    }
  },

  // Returns topics where the correct rate is below the threshold, worst first.
  async getWeakAreas(subjectId: string, threshold = 0.6): Promise<WeakArea[]> {
    const topics = questionRepository.getTopicsBySubject(subjectId)
    const topicStats = await Promise.all(topics.map((t) => getTopicStats(t.id)))
    const topicMap = new Map(topics.map((t) => [t.id, t]))

    return topicStats
      .filter((ts) => ts.attemptedQuestions > 0 && ts.correctRate < threshold)
      .sort((a, b) => a.correctRate - b.correctRate)
      .map((ts) => ({
        topicId: ts.topicId,
        topicName: topicMap.get(ts.topicId)?.name ?? ts.topicId,
        correctRate: ts.correctRate,
        attemptedQuestions: ts.attemptedQuestions,
      }))
  },

  async getRecentlyAttempted(limit = 10): Promise<QuestionProgress[]> {
    const all = await questionProgressRepository.getAll()
    return all
      .sort(
        (a, b) => new Date(b.lastAttemptAt).getTime() - new Date(a.lastAttemptAt).getTime(),
      )
      .slice(0, limit)
  },
}
