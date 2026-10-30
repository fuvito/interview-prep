/**
 * Generates downloadable subject pack files in /packs.
 * Run: node scripts/generate-packs.mjs
 * Each pack combines subject.json + topics.json + all question files into one JSON.
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')
const contentDir = join(root, 'src', 'content', 'subjects')
const outDir = join(root, 'packs')

mkdirSync(outDir, { recursive: true })

const subjectIds = readdirSync(contentDir)

for (const id of subjectIds) {
  const subjectDir = join(contentDir, id)
  const subject = JSON.parse(readFileSync(join(subjectDir, 'subject.json'), 'utf8'))
  const topics = JSON.parse(readFileSync(join(subjectDir, 'topics.json'), 'utf8'))

  const questionsDir = join(subjectDir, 'questions')
  const questionFiles = readdirSync(questionsDir).filter((f) => f.endsWith('.json'))
  const questions = questionFiles.flatMap((f) =>
    JSON.parse(readFileSync(join(questionsDir, f), 'utf8'))
  )

  const pack = {
    schemaVersion: 1,
    id,
    version: subject.version ?? '1.0.0',
    updatedAt: new Date().toISOString().slice(0, 10),
    subject,
    topics,
    questions,
  }

  const outPath = join(outDir, `${id}.json`)
  writeFileSync(outPath, JSON.stringify(pack))
  console.log(`✓ packs/${id}.json — ${questions.length} questions`)
}

console.log(`\nGenerated ${subjectIds.length} packs in /packs`)
