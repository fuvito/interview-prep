import type {
  Difficulty,
  Question,
  QuestionType,
  Subject,
  SubjectPackJSON,
  Topic,
  UploadedSubjectPack,
} from '@/types'

const VALID_TYPES: QuestionType[] = ['single', 'multiple', 'code', 'text']
const VALID_DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced']

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
}

function uniqueId(base: string, existing: string[]): string {
  if (!existing.includes(base)) return base
  let n = 1
  while (existing.includes(`${base}-${String(n).padStart(3, '0')}`)) n++
  return `${base}-${String(n).padStart(3, '0')}`
}

function pad(n: number): string {
  return String(n).padStart(3, '0')
}

export class ImportError extends Error {}

export function parseSubjectPack(
  raw: unknown,
  existingSubjectIds: string[],
): UploadedSubjectPack {
  if (typeof raw !== 'object' || raw === null) throw new ImportError('JSON must be an object.')

  const json = raw as Record<string, unknown>

  // --- subject ---
  if (typeof json.subject !== 'object' || json.subject === null)
    throw new ImportError('Missing or invalid "subject" field.')
  const subjectIn = json.subject as Record<string, unknown>
  if (typeof subjectIn.name !== 'string' || !subjectIn.name.trim())
    throw new ImportError('"subject.name" must be a non-empty string.')
  if (typeof subjectIn.description !== 'string')
    throw new ImportError('"subject.description" must be a string.')

  // --- topics ---
  if (!Array.isArray(json.topics) || json.topics.length === 0)
    throw new ImportError('"topics" must be a non-empty array.')

  for (let i = 0; i < json.topics.length; i++) {
    const t = json.topics[i] as Record<string, unknown>
    if (typeof t.name !== 'string' || !t.name.trim())
      throw new ImportError(`topics[${i}].name must be a non-empty string.`)
    if (typeof t.description !== 'string')
      throw new ImportError(`topics[${i}].description must be a string.`)
  }

  // --- questions ---
  if (!Array.isArray(json.questions) || json.questions.length === 0)
    throw new ImportError('"questions" must be a non-empty array.')

  // Build topic name → index map for quick lookup
  const topicNames = (json.topics as Array<{ name: string }>).map((t) => t.name)

  for (let i = 0; i < json.questions.length; i++) {
    const q = json.questions[i] as Record<string, unknown>
    if (typeof q.topic !== 'string' || !topicNames.includes(q.topic))
      throw new ImportError(
        `questions[${i}].topic "${q.topic}" does not match any topic name.`,
      )
    if (!VALID_TYPES.includes(q.type as QuestionType))
      throw new ImportError(`questions[${i}].type must be one of: ${VALID_TYPES.join(', ')}.`)
    if (!VALID_DIFFICULTIES.includes(q.difficulty as Difficulty))
      throw new ImportError(
        `questions[${i}].difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}.`,
      )
    if (typeof q.question !== 'string' || !q.question.trim())
      throw new ImportError(`questions[${i}].question must be a non-empty string.`)
    if (typeof q.explanation !== 'string')
      throw new ImportError(`questions[${i}].explanation must be a string.`)
    if (!Array.isArray(q.keyConcepts))
      throw new ImportError(`questions[${i}].keyConcepts must be an array.`)
    if (q.type !== 'text') {
      if (!Array.isArray(q.options) || (q.options as unknown[]).length < 2)
        throw new ImportError(`questions[${i}].options must have at least 2 items.`)
      if (!Array.isArray(q.correctAnswers) || (q.correctAnswers as unknown[]).length === 0)
        throw new ImportError(`questions[${i}].correctAnswers must be a non-empty array.`)
    }
  }

  // --- generate IDs and build the pack ---
  const subjectId = uniqueId(slugify(subjectIn.name as string), existingSubjectIds)

  const authorIn = subjectIn.author as Record<string, unknown> | undefined
  const subject: Subject = {
    id: subjectId,
    name: (subjectIn.name as string).trim(),
    description: (subjectIn.description as string).trim(),
    version: typeof subjectIn.version === 'string' ? subjectIn.version : '1.0',
    author: authorIn && typeof authorIn.name === 'string'
      ? { name: authorIn.name, email: typeof authorIn.email === 'string' ? authorIn.email : undefined }
      : undefined,
  }

  const topicsIn = json.topics as SubjectPackJSON['topics']
  const topics: Topic[] = topicsIn.map((t, i) => ({
    id: `${subjectId}/${slugify(t.name)}`,
    subjectId,
    name: t.name.trim(),
    description: t.description.trim(),
    order: t.order ?? i + 1,
  }))

  const topicIdByName = new Map(topicsIn.map((t, i) => [t.name, topics[i].id]))

  const questionsIn = json.questions as SubjectPackJSON['questions']
  const questions: Question[] = questionsIn.map((q, i) => ({
    id: `${subjectId}/q-${pad(i + 1)}`,
    subjectId,
    topicId: topicIdByName.get(q.topic)!,
    type: q.type,
    difficulty: q.difficulty,
    question: q.question,
    codeSnippet: q.codeSnippet,
    options: q.options,
    correctAnswers: q.correctAnswers,
    explanation: q.explanation,
    codeExample: q.codeExample,
    keyConcepts: q.keyConcepts,
    commonInterviewQuestion: q.commonInterviewQuestion ?? false,
  }))

  return {
    id: subjectId,
    subject,
    topics,
    questions,
    importedAt: new Date().toISOString(),
  }
}
