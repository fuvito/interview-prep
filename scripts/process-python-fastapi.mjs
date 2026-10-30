import { readFileSync, writeFileSync, mkdirSync } from 'fs'

const src = JSON.parse(readFileSync('C:/Users/fyaza/Downloads/python-fastapi.json', 'utf8'))

const subjectId = 'python-fastapi'

const topicMeta = {
  'Python Fundamentals':                             { id: 'py-fundamentals',     prefix: 'py-fund',    file: 'py-fundamentals' },
  'Strings, Collections & Comprehensions':           { id: 'py-collections',      prefix: 'py-col',     file: 'py-collections' },
  'Functions, Scope & Functional Features':          { id: 'py-functions',        prefix: 'py-func',    file: 'py-functions' },
  'Object-Oriented Programming':                     { id: 'py-oop',              prefix: 'py-oop',     file: 'py-oop' },
  'Exceptions & Error Handling':                     { id: 'py-exceptions',       prefix: 'py-exc',     file: 'py-exceptions' },
  'Modules, Packages & Environments':                { id: 'py-modules',          prefix: 'py-mod',     file: 'py-modules' },
  'Iterators, Generators & Context Managers':        { id: 'py-iterators',        prefix: 'py-iter',    file: 'py-iterators' },
  'Typing, Dataclasses & Modern Python':             { id: 'py-typing',           prefix: 'py-type',    file: 'py-typing' },
  'Files, Serialization & Standard Library':         { id: 'py-files',            prefix: 'py-files',   file: 'py-files' },
  'Concurrency, Asyncio & Multiprocessing':          { id: 'py-concurrency',      prefix: 'py-async',   file: 'py-concurrency' },
  'Testing, Debugging & Code Quality':               { id: 'py-testing',          prefix: 'py-test',    file: 'py-testing' },
  'Performance, Memory & Python Internals':          { id: 'py-performance',      prefix: 'py-perf',    file: 'py-performance' },
  'FastAPI Fundamentals & Application Setup':        { id: 'fapi-fundamentals',   prefix: 'fapi-fund',  file: 'fapi-fundamentals' },
  'Pydantic, Validation & Data Models':              { id: 'fapi-pydantic',       prefix: 'fapi-pyd',   file: 'fapi-pydantic' },
  'Dependency Injection & Application Architecture': { id: 'fapi-di',             prefix: 'fapi-di',    file: 'fapi-di' },
  'Async Endpoints & Background Tasks':              { id: 'fapi-async',          prefix: 'fapi-async', file: 'fapi-async' },
  'Databases, SQLAlchemy & Persistence':             { id: 'fapi-db',             prefix: 'fapi-db',    file: 'fapi-db' },
  'Authentication, Authorization & Security':        { id: 'fapi-auth',           prefix: 'fapi-auth',  file: 'fapi-auth' },
  'Errors, Middleware & API Design':                 { id: 'fapi-middleware',     prefix: 'fapi-mw',    file: 'fapi-middleware' },
  'Testing, Deployment & Production FastAPI':        { id: 'fapi-deployment',     prefix: 'fapi-dep',   file: 'fapi-deployment' },
}

const dir = `src/content/subjects/${subjectId}`
mkdirSync(`${dir}/questions`, { recursive: true })

// subject.json
const subject = {
  id: subjectId,
  name: src.subject.name,
  description: src.subject.description,
  version: src.subject.version,
  author: src.subject.author,
}
writeFileSync(`${dir}/subject.json`, JSON.stringify(subject, null, 2))

// topics.json
const topics = src.topics.map((t) => {
  const meta = topicMeta[t.name]
  return {
    id: meta.id,
    subjectId,
    name: t.name,
    description: t.description,
    order: t.order,
  }
})
writeFileSync(`${dir}/topics.json`, JSON.stringify(topics, null, 2))

// group questions by topic
const byTopic = {}
for (const name of Object.keys(topicMeta)) byTopic[name] = []
for (const q of src.questions) byTopic[q.topic].push(q)

// write question files
for (const [topicName, questions] of Object.entries(byTopic)) {
  const meta = topicMeta[topicName]
  const output = questions.map((q, i) => ({
    id: `${meta.prefix}-${String(i + 1).padStart(2, '0')}`,
    subjectId,
    topicId: meta.id,
    type: q.type,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options,
    correctAnswers: q.correctAnswers,
    explanation: q.explanation,
    keyConcepts: q.keyConcepts,
    commonInterviewQuestion: q.commonInterviewQuestion ?? false,
  }))
  writeFileSync(`${dir}/questions/${meta.file}.json`, JSON.stringify(output, null, 2))
  console.log(`Created ${meta.file}.json : ${output.length} questions`)
}

console.log(`topics.json: ${topics.length} topics`)
