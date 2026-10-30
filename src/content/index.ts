import type { Subject, Topic, Question, UploadedSubjectPack } from '@/types'

import tsSubjectData from './subjects/typescript/subject.json'
import tsTopicsData from './subjects/typescript/topics.json'
import tsBasicsData from './subjects/typescript/questions/ts-basics.json'
import interfacesTypesData from './subjects/typescript/questions/interfaces-types.json'
import functionsData from './subjects/typescript/questions/functions.json'
import genericsData from './subjects/typescript/questions/generics.json'
import classesData from './subjects/typescript/questions/classes.json'
import advancedTypesData from './subjects/typescript/questions/advanced-types.json'

import nodeSubjectData from './subjects/nodejs/subject.json'
import nodeTopicsData from './subjects/nodejs/topics.json'
import nodeFundamentalsData from './subjects/nodejs/questions/node-fundamentals.json'
import nodeModulesData from './subjects/nodejs/questions/node-modules.json'
import asyncEventLoopData from './subjects/nodejs/questions/async-event-loop.json'
import nodeCoreModulesData from './subjects/nodejs/questions/node-core-modules.json'
import nodeExpressData from './subjects/nodejs/questions/node-express.json'
import nodeStreamsEventsData from './subjects/nodejs/questions/node-streams-events.json'

import devopsSubjectData from './subjects/devops/subject.json'
import devopsTopicsData from './subjects/devops/topics.json'
import dockerData from './subjects/devops/questions/docker.json'
import kubernetesData from './subjects/devops/questions/kubernetes.json'
import cicdData from './subjects/devops/questions/cicd.json'
import linuxShellData from './subjects/devops/questions/linux-shell.json'
import iacData from './subjects/devops/questions/iac.json'
import monitoringData from './subjects/devops/questions/monitoring.json'

import javaSubjectData from './subjects/java/subject.json'
import javaTopicsData from './subjects/java/topics.json'
import javaFundamentalsData from './subjects/java/questions/java-fundamentals.json'
import javaCollectionsData from './subjects/java/questions/java-collections.json'
import javaConcurrencyData from './subjects/java/questions/java-concurrency.json'
import javaJvmData from './subjects/java/questions/java-jvm.json'
import javaSpringData from './subjects/java/questions/java-spring.json'
import javaStreamsData from './subjects/java/questions/java-streams.json'

export const allSubjects: Subject[] = [
  tsSubjectData as unknown as Subject,
  nodeSubjectData as unknown as Subject,
  devopsSubjectData as unknown as Subject,
  javaSubjectData as unknown as Subject,
]

export const allTopics: Topic[] = [
  ...(tsTopicsData as unknown as Topic[]),
  ...(nodeTopicsData as unknown as Topic[]),
  ...(devopsTopicsData as unknown as Topic[]),
  ...(javaTopicsData as unknown as Topic[]),
]

export const allQuestions: Question[] = [
  ...(tsBasicsData as unknown as Question[]),
  ...(interfacesTypesData as unknown as Question[]),
  ...(functionsData as unknown as Question[]),
  ...(genericsData as unknown as Question[]),
  ...(classesData as unknown as Question[]),
  ...(advancedTypesData as unknown as Question[]),
  ...(nodeFundamentalsData as unknown as Question[]),
  ...(nodeModulesData as unknown as Question[]),
  ...(asyncEventLoopData as unknown as Question[]),
  ...(nodeCoreModulesData as unknown as Question[]),
  ...(nodeExpressData as unknown as Question[]),
  ...(nodeStreamsEventsData as unknown as Question[]),
  ...(dockerData as unknown as Question[]),
  ...(kubernetesData as unknown as Question[]),
  ...(cicdData as unknown as Question[]),
  ...(linuxShellData as unknown as Question[]),
  ...(iacData as unknown as Question[]),
  ...(monitoringData as unknown as Question[]),
  ...(javaFundamentalsData as unknown as Question[]),
  ...(javaCollectionsData as unknown as Question[]),
  ...(javaConcurrencyData as unknown as Question[]),
  ...(javaJvmData as unknown as Question[]),
  ...(javaSpringData as unknown as Question[]),
  ...(javaStreamsData as unknown as Question[]),
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

export function registerUploadedPacks(packs: UploadedSubjectPack[]): void {
  for (const pack of packs) {
    allSubjects.push(pack.subject)
    allTopics.push(...pack.topics)
    allQuestions.push(...pack.questions)
  }
}

export function deregisterUploadedPack(pack: UploadedSubjectPack): void {
  const subjectIds = new Set([pack.subject.id])
  const topicIds = new Set(pack.topics.map((t) => t.id))
  const questionIds = new Set(pack.questions.map((q) => q.id))

  for (let i = allSubjects.length - 1; i >= 0; i--) {
    if (subjectIds.has(allSubjects[i].id)) allSubjects.splice(i, 1)
  }
  for (let i = allTopics.length - 1; i >= 0; i--) {
    if (topicIds.has(allTopics[i].id)) allTopics.splice(i, 1)
  }
  for (let i = allQuestions.length - 1; i >= 0; i--) {
    if (questionIds.has(allQuestions[i].id)) allQuestions.splice(i, 1)
  }
}
