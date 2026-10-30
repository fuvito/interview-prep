import type { Subject, Topic, Question, UploadedSubjectPack, OfficialSubjectPack } from '@/types'

import tsSubjectData from './subjects/typescript/subject.json'
import tsTopicsData from './subjects/typescript/topics.json'
import tsBasicsData from './subjects/typescript/questions/ts-basics.json'
import interfacesTypesData from './subjects/typescript/questions/interfaces-types.json'
import functionsData from './subjects/typescript/questions/functions.json'
import genericsData from './subjects/typescript/questions/generics.json'
import classesData from './subjects/typescript/questions/classes.json'
import advancedTypesData from './subjects/typescript/questions/advanced-types.json'
import asyncData from './subjects/typescript/questions/async.json'
import modulesData from './subjects/typescript/questions/modules.json'
import compilerConfigData from './subjects/typescript/questions/compiler-config.json'
import runtimeValidationData from './subjects/typescript/questions/runtime-validation.json'
import realWorldData from './subjects/typescript/questions/real-world.json'

export const allSubjects: Subject[] = [
  tsSubjectData as unknown as Subject,
]

export const allTopics: Topic[] = [
  ...(tsTopicsData as unknown as Topic[]),
]

export const allQuestions: Question[] = [
  ...(tsBasicsData as unknown as Question[]),
  ...(interfacesTypesData as unknown as Question[]),
  ...(functionsData as unknown as Question[]),
  ...(genericsData as unknown as Question[]),
  ...(classesData as unknown as Question[]),
  ...(advancedTypesData as unknown as Question[]),
  ...(asyncData as unknown as Question[]),
  ...(modulesData as unknown as Question[]),
  ...(compilerConfigData as unknown as Question[]),
  ...(runtimeValidationData as unknown as Question[]),
  ...(realWorldData as unknown as Question[]),
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

export function registerOfficialPacks(packs: OfficialSubjectPack[]): void {
  for (const pack of packs) {
    if (!allSubjects.find((s) => s.id === pack.subject.id)) {
      allSubjects.push(pack.subject)
      allTopics.push(...pack.topics)
      allQuestions.push(...pack.questions)
    }
  }
}

export function deregisterOfficialPack(pack: OfficialSubjectPack): void {
  const topicIds = new Set(pack.topics.map((t) => t.id))
  const questionIds = new Set(pack.questions.map((q) => q.id))
  for (let i = allSubjects.length - 1; i >= 0; i--) {
    if (allSubjects[i].id === pack.subject.id) allSubjects.splice(i, 1)
  }
  for (let i = allTopics.length - 1; i >= 0; i--) {
    if (topicIds.has(allTopics[i].id)) allTopics.splice(i, 1)
  }
  for (let i = allQuestions.length - 1; i >= 0; i--) {
    if (questionIds.has(allQuestions[i].id)) allQuestions.splice(i, 1)
  }
}

export function registerUploadedPacks(packs: UploadedSubjectPack[]): void {
  for (const pack of packs) {
    if (!allSubjects.find((s) => s.id === pack.subject.id)) {
      allSubjects.push(pack.subject)
      allTopics.push(...pack.topics)
      allQuestions.push(...pack.questions)
    }
  }
}

export function deregisterUploadedPack(pack: UploadedSubjectPack): void {
  const topicIds = new Set(pack.topics.map((t) => t.id))
  const questionIds = new Set(pack.questions.map((q) => q.id))
  for (let i = allSubjects.length - 1; i >= 0; i--) {
    if (allSubjects[i].id === pack.subject.id) allSubjects.splice(i, 1)
  }
  for (let i = allTopics.length - 1; i >= 0; i--) {
    if (topicIds.has(allTopics[i].id)) allTopics.splice(i, 1)
  }
  for (let i = allQuestions.length - 1; i >= 0; i--) {
    if (questionIds.has(allQuestions[i].id)) allQuestions.splice(i, 1)
  }
}
