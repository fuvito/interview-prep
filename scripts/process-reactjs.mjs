import { readFileSync, writeFileSync, mkdirSync } from 'fs'

const src = JSON.parse(readFileSync('C:/Users/fyaza/Downloads/reactjs.json', 'utf8'))

const subjectId = 'reactjs'

const topicMeta = {
  'React Fundamentals':                   { id: 'react-fundamentals',              prefix: 'react-fund',  file: 'react-fundamentals' },
  'Components, Props & Composition':      { id: 'react-components',                prefix: 'react-comp',  file: 'react-components' },
  'State & Event Handling':               { id: 'react-state',                     prefix: 'react-state', file: 'react-state' },
  'Rendering, Lists & Conditional UI':    { id: 'react-rendering',                 prefix: 'react-render',file: 'react-rendering' },
  'Hooks & Effects':                      { id: 'react-hooks',                     prefix: 'react-hooks', file: 'react-hooks' },
  'Forms, Context & State Management':    { id: 'react-forms',                     prefix: 'react-forms', file: 'react-forms' },
  'Performance, Routing & APIs':          { id: 'react-perf',                      prefix: 'react-perf',  file: 'react-perf' },
  'Testing, Accessibility & Modern React':{ id: 'react-testing',                   prefix: 'react-test',  file: 'react-testing' },
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
const topics = src.topics.map((t, i) => {
  const meta = topicMeta[t.name]
  return {
    id: meta.id,
    subjectId,
    name: t.name,
    description: t.description,
    order: t.order ?? i + 1,
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
