import type { Subject, Topic, Question } from '@/types'

import subjectData from './subjects/typescript/subject.json'
import topicsData from './subjects/typescript/topics.json'
import tsBasicsData from './subjects/typescript/questions/ts-basics.json'
import interfacesTypesData from './subjects/typescript/questions/interfaces-types.json'
import functionsData from './subjects/typescript/questions/functions.json'
import genericsData from './subjects/typescript/questions/generics.json'
import classesData from './subjects/typescript/questions/classes.json'
import advancedTypesData from './subjects/typescript/questions/advanced-types.json'

export const allSubjects: Subject[] = [subjectData as unknown as Subject]

export const allTopics: Topic[] = topicsData as unknown as Topic[]

export const allQuestions: Question[] = [
  ...(tsBasicsData as unknown as Question[]),
  ...(interfacesTypesData as unknown as Question[]),
  ...(functionsData as unknown as Question[]),
  ...(genericsData as unknown as Question[]),
  ...(classesData as unknown as Question[]),
  ...(advancedTypesData as unknown as Question[]),
]

export function getSubjectById(id: string): Subject | undefined {
  return allSubjects.find((s) => s.id === id)
}

export function getTopicsBySubject(subjectId: string): Topic[] {
  return allTopics.filter((t) => t.subjectId === subjectId).sort((a, b) => a.order - b.order)
}

export function getTopicById(id: string): Topic | undefined {
  return allTopics.find((t) => t.id === id)
}

export function getQuestionsByTopic(topicId: string): Question[] {
  return allQuestions.filter((q) => q.topicId === topicId)
}

export function getQuestionsBySubject(subjectId: string): Question[] {
  return allQuestions.filter((q) => q.subjectId === subjectId)
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find((q) => q.id === id)
}
