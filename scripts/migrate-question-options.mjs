/**
 * Migrates question files from the old format (options as string[], correctAnswers as number[])
 * to the proper format (options as {id,text}[], correctAnswers as string[]).
 *
 * Skips TypeScript (already correct) and text questions (no options).
 *
 * Run: node scripts/migrate-question-options.mjs
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')
const contentDir = join(root, 'src', 'content', 'subjects')
const OPTION_IDS = ['a', 'b', 'c', 'd', 'e', 'f']

const subjectIds = readdirSync(contentDir).filter((id) => id !== 'typescript')

let totalFixed = 0

for (const subjectId of subjectIds) {
  const questionsDir = join(contentDir, subjectId, 'questions')
  const files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'))

  for (const file of files) {
    const path = join(questionsDir, file)
    const questions = JSON.parse(readFileSync(path, 'utf8'))
    let changed = false

    const migrated = questions.map((q) => {
      if (!q.options || q.options.length === 0) return q
      // Already migrated — options are objects
      if (typeof q.options[0] === 'object') return q

      // Convert string[] → {id, text}[]
      const newOptions = q.options.map((text, i) => ({ id: OPTION_IDS[i], text }))

      // Convert numeric correctAnswers to string IDs
      const rawAnswers = Array.isArray(q.correctAnswers) ? q.correctAnswers : [q.correctAnswers]
      const newAnswers = rawAnswers.map((idx) => OPTION_IDS[Number(idx)])

      changed = true
      return { ...q, options: newOptions, correctAnswers: newAnswers }
    })

    if (changed) {
      writeFileSync(path, JSON.stringify(migrated, null, 2))
      const count = migrated.filter((q) => q.options && typeof q.options[0] === 'object').length
      console.log(`✓ ${subjectId}/${file} — migrated ${count} questions`)
      totalFixed++
    }
  }
}

console.log(`\nDone — ${totalFixed} file(s) updated.`)
