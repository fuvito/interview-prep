import { describe, it, expect } from 'vitest'
import { parseSubjectPack, ImportError } from './subjectImporter'

const validQuestion = {
  topic: 'Basics',
  type: 'single',
  difficulty: 'beginner',
  question: 'What is Python?',
  explanation: 'A programming language.',
  keyConcepts: ['scripting'],
  commonInterviewQuestion: false,
  options: [
    { id: 'a', text: 'A snake' },
    { id: 'b', text: 'A language' },
  ],
  correctAnswers: ['b'],
}

const validPack = {
  subject: { name: 'Python', description: 'Python interview prep.' },
  topics: [{ name: 'Basics', description: 'Core Python concepts.' }],
  questions: [validQuestion],
}

// ─── Happy path ───────────────────────────────────────────────────────────────

describe('parseSubjectPack — structure', () => {
  it('returns a pack with subject, topics, questions, and importedAt', () => {
    const result = parseSubjectPack(validPack, [])
    expect(result.subject.name).toBe('Python')
    expect(result.subject.description).toBe('Python interview prep.')
    expect(result.topics).toHaveLength(1)
    expect(result.questions).toHaveLength(1)
    expect(typeof result.importedAt).toBe('string')
  })

  it('slugifies the subject name to build the id', () => {
    const pack = { ...validPack, subject: { ...validPack.subject, name: 'My Cool Subject!' } }
    const result = parseSubjectPack(pack, [])
    expect(result.subject.id).toBe('my-cool-subject')
    expect(result.id).toBe('my-cool-subject')
  })

  it('appends -001 suffix when id already exists', () => {
    const result = parseSubjectPack(validPack, ['python'])
    expect(result.subject.id).toBe('python-001')
  })

  it('appends -002 when both base and -001 already exist', () => {
    const result = parseSubjectPack(validPack, ['python', 'python-001'])
    expect(result.subject.id).toBe('python-002')
  })

  it('assigns sequential padded ids to questions', () => {
    const pack = { ...validPack, questions: [validQuestion, { ...validQuestion, question: 'Q2?' }] }
    const result = parseSubjectPack(pack, [])
    expect(result.questions[0].id).toBe('python/q-001')
    expect(result.questions[1].id).toBe('python/q-002')
  })

  it('links questions to topics by name', () => {
    const result = parseSubjectPack(validPack, [])
    expect(result.questions[0].topicId).toBe('python/basics')
  })

  it('sets topic subjectId to match the subject', () => {
    const result = parseSubjectPack(validPack, [])
    expect(result.topics[0].subjectId).toBe('python')
  })

  it('defaults topic order to index + 1 when not specified', () => {
    const pack = {
      ...validPack,
      topics: [
        { name: 'Basics', description: 'A.' },
        { name: 'Advanced', description: 'B.' },
      ],
      questions: [validQuestion, { ...validQuestion, topic: 'Advanced' }],
    }
    const result = parseSubjectPack(pack, [])
    expect(result.topics[0].order).toBe(1)
    expect(result.topics[1].order).toBe(2)
  })

  it('uses explicit topic order when provided', () => {
    const pack = { ...validPack, topics: [{ name: 'Basics', description: 'A.', order: 10 }] }
    const result = parseSubjectPack(pack, [])
    expect(result.topics[0].order).toBe(10)
  })

  it('trims whitespace from subject name and description', () => {
    const pack = { ...validPack, subject: { name: '  Python  ', description: '  Desc.  ' } }
    const result = parseSubjectPack(pack, [])
    expect(result.subject.name).toBe('Python')
    expect(result.subject.description).toBe('Desc.')
  })
})

describe('parseSubjectPack — version and author', () => {
  it('uses version from subject when provided', () => {
    const pack = { ...validPack, subject: { ...validPack.subject, version: '2.3.1' } }
    expect(parseSubjectPack(pack, []).subject.version).toBe('2.3.1')
  })

  it('defaults version to "1.0" when not provided', () => {
    expect(parseSubjectPack(validPack, []).subject.version).toBe('1.0')
  })

  it('preserves author name and email when both provided', () => {
    const pack = { ...validPack, subject: { ...validPack.subject, author: { name: 'Jane', email: 'jane@example.com' } } }
    const result = parseSubjectPack(pack, [])
    expect(result.subject.author?.name).toBe('Jane')
    expect(result.subject.author?.email).toBe('jane@example.com')
  })

  it('preserves author name without email', () => {
    const pack = { ...validPack, subject: { ...validPack.subject, author: { name: 'Jane' } } }
    const result = parseSubjectPack(pack, [])
    expect(result.subject.author?.name).toBe('Jane')
    expect(result.subject.author?.email).toBeUndefined()
  })

  it('omits author when not provided', () => {
    expect(parseSubjectPack(validPack, []).subject.author).toBeUndefined()
  })
})

describe('parseSubjectPack — question types', () => {
  it('accepts text questions without options or correctAnswers', () => {
    const textQ = {
      topic: 'Basics',
      type: 'text',
      difficulty: 'beginner',
      question: 'Explain closures.',
      explanation: 'Closures capture...',
      keyConcepts: ['closures'],
      commonInterviewQuestion: true,
    }
    expect(() => parseSubjectPack({ ...validPack, questions: [textQ] }, [])).not.toThrow()
  })

  it('accepts multiple-choice questions', () => {
    const multiQ = {
      ...validQuestion,
      type: 'multiple',
      options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' }],
      correctAnswers: ['a', 'b'],
    }
    const result = parseSubjectPack({ ...validPack, questions: [multiQ] }, [])
    expect(result.questions[0].type).toBe('multiple')
    expect(result.questions[0].correctAnswers).toEqual(['a', 'b'])
  })

  it('accepts code questions', () => {
    const codeQ = { ...validQuestion, type: 'code' }
    const result = parseSubjectPack({ ...validPack, questions: [codeQ] }, [])
    expect(result.questions[0].type).toBe('code')
  })

  it('defaults commonInterviewQuestion to false when not provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { commonInterviewQuestion: _ciq, ...q } = validQuestion
    const result = parseSubjectPack({ ...validPack, questions: [q] }, [])
    expect(result.questions[0].commonInterviewQuestion).toBe(false)
  })
})

// ─── Validation errors ────────────────────────────────────────────────────────

describe('parseSubjectPack — input validation', () => {
  it('throws ImportError for a string input', () => {
    expect(() => parseSubjectPack('not-an-object', [])).toThrow(ImportError)
  })

  it('throws ImportError for null', () => {
    expect(() => parseSubjectPack(null, [])).toThrow(ImportError)
  })

  it('throws ImportError for a number', () => {
    expect(() => parseSubjectPack(42, [])).toThrow(ImportError)
  })

  it('throws when subject field is missing', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { subject: _subject, ...noSubject } = validPack
    expect(() => parseSubjectPack(noSubject, [])).toThrow(ImportError)
  })

  it('throws when subject.name is an empty string', () => {
    expect(() => parseSubjectPack({ ...validPack, subject: { ...validPack.subject, name: '' } }, [])).toThrow(ImportError)
  })

  it('throws when subject.name is whitespace only', () => {
    expect(() => parseSubjectPack({ ...validPack, subject: { ...validPack.subject, name: '   ' } }, [])).toThrow(ImportError)
  })

  it('throws when subject.description is missing', () => {
    expect(() => parseSubjectPack({ ...validPack, subject: { name: 'Python' } }, [])).toThrow(ImportError)
  })

  it('throws when topics is an empty array', () => {
    expect(() => parseSubjectPack({ ...validPack, topics: [] }, [])).toThrow(ImportError)
  })

  it('throws when topics is not an array', () => {
    expect(() => parseSubjectPack({ ...validPack, topics: 'oops' }, [])).toThrow(ImportError)
  })

  it('throws when a topic is missing its name', () => {
    expect(() => parseSubjectPack({ ...validPack, topics: [{ description: 'No name.' }] }, [])).toThrow(ImportError)
  })

  it('throws when a topic name is empty', () => {
    expect(() => parseSubjectPack({ ...validPack, topics: [{ name: '', description: 'A.' }] }, [])).toThrow(ImportError)
  })

  it('throws when questions is an empty array', () => {
    expect(() => parseSubjectPack({ ...validPack, questions: [] }, [])).toThrow(ImportError)
  })

  it('throws when questions is not an array', () => {
    expect(() => parseSubjectPack({ ...validPack, questions: 'oops' }, [])).toThrow(ImportError)
  })

  it('throws when a question references an unknown topic', () => {
    const pack = { ...validPack, questions: [{ ...validQuestion, topic: 'Unknown Topic' }] }
    expect(() => parseSubjectPack(pack, [])).toThrow(ImportError)
  })

  it('throws when a question has an invalid type', () => {
    expect(() => parseSubjectPack({ ...validPack, questions: [{ ...validQuestion, type: 'essay' }] }, [])).toThrow(ImportError)
  })

  it('throws when a question has an invalid difficulty', () => {
    expect(() => parseSubjectPack({ ...validPack, questions: [{ ...validQuestion, difficulty: 'expert' }] }, [])).toThrow(ImportError)
  })

  it('throws when question text is empty', () => {
    expect(() => parseSubjectPack({ ...validPack, questions: [{ ...validQuestion, question: '' }] }, [])).toThrow(ImportError)
  })

  it('throws when explanation is not a string', () => {
    expect(() => parseSubjectPack({ ...validPack, questions: [{ ...validQuestion, explanation: 42 }] }, [])).toThrow(ImportError)
  })

  it('throws when keyConcepts is not an array', () => {
    expect(() => parseSubjectPack({ ...validPack, questions: [{ ...validQuestion, keyConcepts: 'nope' }] }, [])).toThrow(ImportError)
  })

  it('throws when a choice question has fewer than 2 options', () => {
    const pack = { ...validPack, questions: [{ ...validQuestion, options: [{ id: 'a', text: 'Only one' }] }] }
    expect(() => parseSubjectPack(pack, [])).toThrow(ImportError)
  })

  it('throws when a choice question has no options at all', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { options: _options, ...noOptions } = validQuestion
    expect(() => parseSubjectPack({ ...validPack, questions: [noOptions] }, [])).toThrow(ImportError)
  })

  it('throws when a choice question has an empty correctAnswers array', () => {
    const pack = { ...validPack, questions: [{ ...validQuestion, correctAnswers: [] }] }
    expect(() => parseSubjectPack(pack, [])).toThrow(ImportError)
  })

  it('throws when a choice question has no correctAnswers field', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { correctAnswers: _correctAnswers, ...noAnswers } = validQuestion
    expect(() => parseSubjectPack({ ...validPack, questions: [noAnswers] }, [])).toThrow(ImportError)
  })
})
