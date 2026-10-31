import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const VALID_TYPES = new Set(['single', 'multiple', 'code', 'text'])
const VALID_DIFFICULTIES = new Set(['beginner', 'intermediate', 'advanced'])

let errors = 0
let warnings = 0
let totalQuestions = 0

function err(file, id, msg) {
  console.error(`  ✗ [${id}] ${msg}  (${file})`)
  errors++
}

function warn(file, id, msg) {
  console.warn(`  ⚠ [${id}] ${msg}  (${file})`)
  warnings++
}

// Collect all subjects
const subjectsDir = 'src/content/subjects'
const subjectDirs = readdirSync(subjectsDir).filter(d =>
  statSync(join(subjectsDir, d)).isDirectory()
)

const allIds = new Map() // id → file path, for duplicate detection

for (const subjectDir of subjectDirs) {
  const base = join(subjectsDir, subjectDir)

  // Load topics
  const topicsPath = join(base, 'topics.json')
  const topicsRaw = JSON.parse(readFileSync(topicsPath, 'utf8'))
  const topicIds = new Set(topicsRaw.map(t => t.id))
  const topicSubjectIds = new Set(topicsRaw.map(t => t.subjectId))

  // Load subject
  const subjectPath = join(base, 'subject.json')
  const subject = JSON.parse(readFileSync(subjectPath, 'utf8'))
  const subjectId = subject.id

  console.log(`\n── ${subject.name} (${subjectId}) ──`)

  // Validate topics
  for (const topic of topicsRaw) {
    if (!topic.id)          console.error(`  ✗ topic missing id in ${topicsPath}`)
    if (!topic.subjectId)   console.error(`  ✗ topic ${topic.id} missing subjectId`)
    if (topic.subjectId !== subjectId) {
      console.error(`  ✗ topic ${topic.id} has subjectId "${topic.subjectId}", expected "${subjectId}"`)
      errors++
    }
    if (topic.order == null) {
      console.warn(`  ⚠ topic ${topic.id} missing order`)
      warnings++
    }
  }

  // Load question files
  const qDir = join(base, 'questions')
  const qFiles = readdirSync(qDir).filter(f => f.endsWith('.json'))
  let subjectCount = 0

  for (const qFile of qFiles) {
    const filePath = join(qDir, qFile)
    const questions = JSON.parse(readFileSync(filePath, 'utf8'))

    for (const q of questions) {
      subjectCount++

      const id = q.id ?? '<missing-id>'

      // ── Duplicate ID check ──
      if (allIds.has(id)) {
        err(filePath, id, `Duplicate ID — also found in ${allIds.get(id)}`)
      } else {
        allIds.set(id, filePath)
      }

      // ── Required string fields ──
      if (!q.id)          err(filePath, id, 'Missing id')
      if (!q.subjectId)   err(filePath, id, 'Missing subjectId')
      if (!q.topicId)     err(filePath, id, 'Missing topicId')
      if (!q.type)        err(filePath, id, 'Missing type')
      if (!q.difficulty)  err(filePath, id, 'Missing difficulty')
      if (!q.question || !q.question.trim()) err(filePath, id, 'Empty question text')
      if (!q.explanation || !q.explanation.trim()) err(filePath, id, 'Empty explanation')

      // ── subjectId consistency ──
      if (q.subjectId && q.subjectId !== subjectId) {
        err(filePath, id, `subjectId "${q.subjectId}" doesn't match subject "${subjectId}"`)
      }

      // ── topicId validity ──
      if (q.topicId && !topicIds.has(q.topicId)) {
        err(filePath, id, `topicId "${q.topicId}" not found in topics.json`)
      }

      // ── Type validity ──
      if (q.type && !VALID_TYPES.has(q.type)) {
        err(filePath, id, `Invalid type "${q.type}"`)
      }

      // ── Difficulty validity ──
      if (q.difficulty && !VALID_DIFFICULTIES.has(q.difficulty)) {
        err(filePath, id, `Invalid difficulty "${q.difficulty}"`)
      }

      // ── keyConcepts ──
      if (!Array.isArray(q.keyConcepts) || q.keyConcepts.length === 0) {
        warn(filePath, id, 'keyConcepts is empty or missing')
      }

      // ── commonInterviewQuestion ──
      if (typeof q.commonInterviewQuestion !== 'boolean') {
        err(filePath, id, 'commonInterviewQuestion must be boolean')
      }

      // ── Options & correctAnswers for choice-type questions ──
      const isChoice = q.type === 'single' || q.type === 'multiple' || q.type === 'code'

      if (isChoice) {
        if (!Array.isArray(q.options) || q.options.length === 0) {
          err(filePath, id, `type "${q.type}" requires non-empty options array`)
        } else {
          const optionIds = new Set()
          for (const opt of q.options) {
            if (!opt.id)   err(filePath, id, `Option missing id`)
            if (!opt.text || !opt.text.trim()) err(filePath, id, `Option "${opt.id}" has empty text`)
            if (optionIds.has(opt.id)) err(filePath, id, `Duplicate option id "${opt.id}"`)
            optionIds.add(opt.id)
          }

          if (!Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0) {
            err(filePath, id, `type "${q.type}" requires at least one correctAnswer`)
          } else {
            for (const ans of q.correctAnswers) {
              if (!optionIds.has(ans)) {
                err(filePath, id, `correctAnswer "${ans}" not found in options`)
              }
            }

            if (q.type === 'single' && q.correctAnswers.length !== 1) {
              err(filePath, id, `type "single" must have exactly 1 correctAnswer, found ${q.correctAnswers.length}`)
            }
            if (q.type === 'multiple' && q.correctAnswers.length < 2) {
              warn(filePath, id, `type "multiple" typically has 2+ correct answers, found ${q.correctAnswers.length}`)
            }
          }
        }
      }

      // text type — no options needed
      if (q.type === 'text') {
        if (Array.isArray(q.options) && q.options.length > 0) {
          warn(filePath, id, 'type "text" has unexpected options array')
        }
      }
    }
  }

  console.log(`  ${subjectCount} questions, ${topicsRaw.length} topics`)
  totalQuestions += subjectCount
}

console.log(`\n${'─'.repeat(60)}`)
console.log(`Total questions validated: ${totalQuestions}`)
console.log(`Errors:   ${errors}`)
console.log(`Warnings: ${warnings}`)

if (errors > 0) {
  console.error(`\n✗ Validation FAILED — ${errors} error(s) found`)
  process.exit(1)
} else if (warnings > 0) {
  console.log(`\n⚠ Validation passed with ${warnings} warning(s)`)
} else {
  console.log(`\n✓ All questions valid`)
}
