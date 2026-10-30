# InterviewPrep

## 1. Project Overview

Build an offline-first technical interview preparation Chrome Extension.

The application helps software developers prepare for technical interviews through structured question banks, interactive assessments, detailed explanations, and performance tracking.

### Product Principles
- Offline-first. No backend or API dependencies.
- No registration or authentication.
- Local-first data persistence.
- Technology-independent and extensible architecture.
- High-quality technical questions and explanations.
- Clean, modern, responsive UI.

### Target Users
Software developers preparing for junior, mid-level, senior, and staff-level interviews.

### Initial Release
TypeScript interview preparation.

Future subjects:
- JavaScript
- Node.js
- React
- Angular
- Java / Spring Boot
- Python / FastAPI
- AWS / Azure
- DevOps
- SQL / Databases
- Data Structures & Algorithms
- System Design

---

## 2. Technology Stack

| Component | Technology |
|---|---|
| Platform | Chrome Extension Manifest V3 |
| Frontend | React |
| Language | TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Local Database | IndexedDB |
| Database Wrapper | Dexie.js |
| Question Content | Bundled JSON |
| Package Manager | npm |

Use current stable compatible versions when initializing the project.

---

## 3. Architecture

Use a modular, feature-oriented architecture.

```text
src/
├── app/
│   ├── App.tsx
│   ├── routes/
│   └── providers/
│
├── components/
│   ├── common/
│   └── layout/
│
├── features/
│   ├── dashboard/
│   ├── subjects/
│   ├── questions/
│   ├── learning/
│   ├── interview/
│   ├── results/
│   ├── progress/
│   └── bookmarks/
│
├── core/
│   ├── question-engine/
│   ├── assessment-engine/
│   ├── scoring-engine/
│   └── progress-engine/
│
├── database/
│   ├── db.ts
│   ├── schema.ts
│   └── repositories/
│
├── content/
│   └── subjects/
│       └── typescript/
│           ├── subject.json
│           ├── topics.json
│           └── questions/
│
├── store/
├── types/
├── hooks/
├── utils/
└── styles/
```

Keep business logic independent of React components.

Avoid unnecessary abstractions and premature optimization.

---

## 4. Data Architecture

### 4.1 Static Content — JSON

Question content is bundled with the extension.

Static content includes:
- Subjects
- Topics
- Questions
- Answer options
- Correct answers
- Explanations
- Code examples
- Key concepts

Question content must be separate from application logic.

### 4.2 Persistent Data — IndexedDB / Dexie.js

Use Dexie.js as the database abstraction.

Database name: `InterviewPrepDB`

Object stores:

| Store | Purpose |
|---|---|
| questionProgress | Attempts and question performance |
| assessmentSessions | Quiz and interview history |
| bookmarks | Bookmarked questions |
| userPreferences | Application preferences |
| reviewSchedule | Future spaced repetition |

Use Dexie schema versioning for database migrations.

Do not use localStorage or chrome.storage as the primary persistence mechanism.

### 4.3 Data Models

```typescript
type QuestionType =
  | "single"
  | "multiple"
  | "code"
  | "text";

type Difficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

interface Question {
  id: string;
  subjectId: string;
  topicId: string;
  type: QuestionType;
  difficulty: Difficulty;
  question: string;
  codeSnippet?: string;
  options?: {
    id: string;
    text: string;
  }[];
  correctAnswers?: string[];
  explanation: string;
  codeExample?: string;
  keyConcepts: string[];
  commonInterviewQuestion: boolean;
}

interface QuestionProgress {
  questionId: string;
  attempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  lastAttemptAt: string;
  lastResult: "correct" | "incorrect";
}

interface AssessmentSession {
  id: string;
  subjectId: string;
  startedAt: string;
  completedAt?: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
}

interface Bookmark {
  questionId: string;
  createdAt: string;
}
```

---

## 5. Functional Requirements

### FR-01: Subject and Topic Navigation
- Browse available subjects.
- Display topics within subjects.
- Display question counts.
- Filter by difficulty.
- Show question completion statistics.

### FR-02: Question Types

Support four question types:

1. Single Choice — one correct answer.
2. Multiple Select — multiple correct answers.
3. Code Output Prediction — predict execution results.
4. Free Text — user writes and self-assesses an answer.

Free-text answers are self-evaluated in MVP. Do not implement AI grading.

### FR-03: Learning Mode
- Display questions and answer options.
- Allow users to reveal answers.
- Display detailed explanations.
- Display code examples where applicable.
- Display key concepts.
- Navigate between questions.
- Allow bookmarking.

### FR-04: Interview Mode
- Present questions sequentially.
- Hide explanations until submission.
- Support optional timer.
- Calculate final score.
- Review incorrect answers.
- Save assessment history.

### FR-05: Progress Dashboard
- Overall performance.
- Performance by subject and topic.
- Correct and incorrect answer statistics.
- Weak area identification.
- Recently attempted questions.
- Bookmarked questions.

### FR-06: Offline Functionality
- All application assets bundled locally.
- All question content available offline.
- All progress stored in IndexedDB.
- No external API requests.
- No authentication.
- No runtime CDN dependencies.

---

## 6. User Interface

Use a clean, modern developer-focused design.

Main navigation:

1. Dashboard
2. Subjects
3. Learning Mode
4. Interview Mode
5. Bookmarks
6. Progress

### Dashboard
Display:
- Available subjects.
- Total questions.
- Questions completed.
- Overall performance.
- Recent activity.
- Weak areas.

### Question Screen
Display:
- Subject and topic.
- Difficulty indicator.
- Question number.
- Question content.
- Answer options or text input.
- Submit / Reveal Answer.
- Explanation.
- Previous / Next navigation.
- Bookmark action.

### Interview Results
Display:
- Total questions.
- Correct answers.
- Incorrect answers.
- Final score.
- Performance by topic.
- Incorrect question review.

---

## 7. Development Roadmap

Implement incrementally. Do not attempt to build the entire application in one step.

### Phase 1 — Project Foundation
- [x] Initialize Vite + React + TypeScript.
- [x] Configure Chrome Manifest V3.
- [x] Configure Tailwind CSS.
- [x] Establish folder structure.
- [x] Configure development and production builds.
- [x] Verify Chrome extension installation.

### Phase 2 — Database and Content
- [x] Define domain interfaces.
- [x] Configure Dexie.js.
- [x] Create IndexedDB schema.
- [x] Implement database repositories.
- [x] Implement database versioning.
- [x] Define JSON question format.
- [x] Create initial TypeScript subject structure.

### Phase 3 — Core Engines
- [x] Implement question repository.
- [x] Implement question evaluation.
- [x] Implement single-choice scoring.
- [x] Implement multiple-select scoring.
- [x] Implement code-output evaluation.
- [x] Implement free-text self-assessment.
- [x] Implement progress tracking.
- [x] Implement bookmark functionality.

### Phase 4 — User Interface
- [x] Dashboard.
- [x] Subject browser.
- [x] Topic browser.
- [x] Learning Mode.
- [x] Interview Mode.
- [x] Results and review screens.
- [x] Progress dashboard.
- [x] Bookmarks screen.

### Phase 5 — TypeScript Content Pack
- [x] Create 150–200 high-quality questions. (155 across 6 topics)
- [x] Cover beginner, intermediate, and advanced levels.
- [x] Include detailed explanations.
- [x] Include practical code examples.
- [x] Include common interview questions.
- [x] Validate all questions and answers.

### Phase 5b — UI Polish (post-content)
- [x] Dark / light mode toggle with persistence.
- [x] Improved text readability (contrast, gray levels, light mode code blocks).
- [x] Progress reset with confirmation dialog.
- [x] About screen.
- [x] Full-screen / windowed view mode.
- [x] Extension border styling.
- [ ] TopBar title reflects current subject.

### Phase 6 — Testing and Release
- [x] Unit tests for core engines (vitest) — 63 tests, 80% coverage.
- [x] ESLint linter setup.
- [x] Playwright end-to-end tests — 13 tests.
- [ ] Test database persistence.
- [ ] Test database migrations.
- [ ] Test offline functionality.
- [ ] Test Chrome extension lifecycle.
- [ ] Optimize bundle size (highlight.js language subset).
- [ ] Prepare Chrome Web Store release.

---

## 8. Future Enhancements (Out of Scope for MVP)

- Spaced repetition.
- Timed mock interviews.
- Randomized question sets.
- Custom quizzes.
- Import/export progress.
- Additional technology content packs.
- Optional online AI answer evaluation.

---

## 9. Development Rules for Claude

1. Read this document before making changes.
2. Implement one development phase at a time.
3. Do not skip architectural foundations.
4. Use strict TypeScript; avoid `any`.
5. Keep components reusable and focused.
6. Keep business logic outside UI components.
7. Use Dexie repositories for all persistent user data.
8. Do not access IndexedDB directly from React components.
9. Keep static question content separate from user progress.
10. Use database migrations when changing schemas.
11. Write tests for scoring, evaluation, and progress logic.
12. Do not introduce backend services or authentication.
13. Do not add unnecessary dependencies.
14. Ensure all functionality works without internet access.
15. Update this document's task checklist as work progresses.

Before implementing a phase:
- Review existing code.
- Identify dependencies.
- Explain the implementation approach.
- Implement the phase.
- Run relevant tests and build.
- Report completed tasks and outstanding issues.

Do not rewrite working modules unnecessarily.

---

## 10. MVP Acceptance Criteria

The MVP is complete when a user can:

1. Install the Chrome extension.
2. Open it without internet access.
3. Browse TypeScript subjects and topics.
4. Study questions and read detailed explanations.
5. Complete multiple-choice and other supported assessments.
6. Take an interview simulation.
7. Review incorrect answers.
8. Bookmark questions.
9. View personal performance and weak areas.
10. Close and reopen Chrome without losing progress.

**Product Definition:** An offline-first technical interview preparation system that helps developers identify knowledge gaps, learn technical concepts, and practice recalling information under interview conditions.
