export type QuestionType = 'single' | 'multiple' | 'code' | 'text'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  subjectId: string
  topicId: string
  type: QuestionType
  difficulty: Difficulty
  question: string
  codeSnippet?: string
  options?: QuestionOption[]
  correctAnswers?: string[]
  explanation: string
  codeExample?: string
  keyConcepts: string[]
  commonInterviewQuestion: boolean
}

export interface Subject {
  id: string
  name: string
  description: string
  version: string
}

export interface Topic {
  id: string
  subjectId: string
  name: string
  description: string
  order: number
}

export interface QuestionProgress {
  questionId: string
  attempts: number
  correctAttempts: number
  incorrectAttempts: number
  lastAttemptAt: string
  lastResult: 'correct' | 'incorrect'
}

export interface AssessmentSession {
  id: string
  subjectId: string
  topicIds: string[]
  startedAt: string
  completedAt?: string
  totalQuestions: number
  correctAnswers: number
  score: number
}

export interface Bookmark {
  questionId: string
  createdAt: string
}

export interface UserPreferences {
  id: string
  theme: 'dark' | 'light' | 'system'
  fontSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  defaultDifficulty?: Difficulty
}

export interface UploadedSubjectPack {
  id: string
  subject: Subject
  topics: Topic[]
  questions: Question[]
  importedAt: string
}

export interface SubjectPackJSON {
  subject: {
    name: string
    description: string
    version?: string
  }
  topics: Array<{
    name: string
    description: string
    order?: number
  }>
  questions: Array<{
    topic: string
    type: QuestionType
    difficulty: Difficulty
    question: string
    codeSnippet?: string
    options?: Array<{ id: string; text: string }>
    correctAnswers?: string[]
    explanation: string
    codeExample?: string
    keyConcepts: string[]
    commonInterviewQuestion: boolean
  }>
}

export interface ReviewScheduleEntry {
  questionId: string
  nextReviewAt: string
  interval: number
  easeFactor: number
}

// ---- Engine types ----

export interface QuestionFilter {
  difficulty?: Difficulty | Difficulty[]
  type?: QuestionType | QuestionType[]
  commonInterviewOnly?: boolean
}

export interface ChoiceAnswer {
  kind: 'choice'
  selectedAnswerIds: string[]
}

export interface TextAnswer {
  kind: 'text'
  selfAssessment: 'correct' | 'incorrect'
}

export type Answer = ChoiceAnswer | TextAnswer

export interface EvaluationResult {
  isCorrect: boolean
  selectedAnswerIds: string[]
  correctAnswerIds: string[]
  score: number
  questionType: QuestionType
}

export interface TopicStats {
  topicId: string
  totalQuestions: number
  attemptedQuestions: number
  correctAttempts: number
  incorrectAttempts: number
  completionRate: number
  correctRate: number
}

export interface SubjectStats {
  subjectId: string
  totalQuestions: number
  attemptedQuestions: number
  totalAttempts: number
  correctAttempts: number
  score: number
  topicStats: TopicStats[]
}

export interface WeakArea {
  topicId: string
  topicName: string
  correctRate: number
  attemptedQuestions: number
}
