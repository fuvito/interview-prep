# InterviewPrep — Claude Code Guide

## Project Summary

Offline-first Chrome Extension (Manifest V3) for technical interview preparation. React + TypeScript + Vite frontend. No backend, no auth, no external APIs. All data lives in IndexedDB via Dexie.js. All question content is bundled JSON.

Full spec: `docs/project-description.md` — read it before making changes.

---

## Tech Stack

| Component | Technology |
|---|---|
| Platform | Chrome Extension Manifest V3 |
| Frontend | React |
| Language | TypeScript (strict, no `any`) |
| Build | Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| DB | IndexedDB via Dexie.js |
| Content | Bundled JSON |
| Package Manager | npm |

---

## Folder Structure

```
src/
├── app/            # App entry, routes, providers
├── components/     # common/, layout/
├── features/       # dashboard, subjects, questions, learning, interview, results, progress, bookmarks
├── core/           # question-engine, assessment-engine, scoring-engine, progress-engine
├── database/       # db.ts, schema.ts, repositories/
├── content/        # subjects/typescript/ (subject.json, topics.json, questions/)
├── store/
├── types/
├── hooks/
├── utils/
└── styles/
```

---

## Development Rules

1. Read `docs/project-description.md` before making changes.
2. Implement one phase at a time — never skip foundations.
3. Strict TypeScript; no `any`.
4. Keep business logic outside React components.
5. All IndexedDB access goes through Dexie repositories — never directly from components.
6. Static question content is separate from user progress data.
7. Use Dexie schema versioning for all migrations.
8. No localStorage or chrome.storage as primary persistence.
9. No backend, no authentication, no external API calls.
10. No unnecessary dependencies.
11. Write tests for scoring, evaluation, and progress logic.
12. Update the phase checklist in `docs/project-description.md` as tasks complete.
13. Do not rewrite working modules unnecessarily.

---

## Before Implementing a Phase

1. Review existing code.
2. Identify dependencies.
3. Explain the approach.
4. Implement.
5. Run tests and build.
6. Report completed tasks and outstanding issues.

---

## Development Phases

| Phase | Description | Status |
|---|---|---|
| 1 | Project Foundation (Vite, React, TS, Manifest V3, Tailwind) | [ ] |
| 2 | Database and Content (Dexie, schema, repositories, JSON format) | [ ] |
| 3 | Core Engines (question eval, scoring, progress, bookmarks) | [ ] |
| 4 | User Interface (all screens) | [ ] |
| 5 | TypeScript Content Pack (150–200 questions) | [ ] |
| 6 | Testing and Release | [ ] |

---

## Database

- DB name: `InterviewPrepDB`
- Stores: `questionProgress`, `assessmentSessions`, `bookmarks`, `userPreferences`, `reviewSchedule`

---

## Key Data Models

See `docs/project-description.md` §4.3 for full interfaces: `Question`, `QuestionProgress`, `AssessmentSession`, `Bookmark`.

Question types: `single`, `multiple`, `code`, `text`
Difficulty: `beginner`, `intermediate`, `advanced`

---

## MVP Acceptance Criteria

A user can install the extension, use it fully offline, browse TypeScript topics, study questions with explanations, run interview simulations, review results, bookmark questions, track progress, and reopen Chrome without losing data.

---

## Pre-Release Checklist

Run `npm run prerelease` before every release. It executes all automated checks in sequence. After it passes, go through the manual checks below.

### Automated (`npm run prerelease`)

1. **TypeScript** — `tsc -b` (strict, no `any`, zero errors)
2. **Lint** — `eslint src` (zero warnings or errors)
3. **Unit tests** — `vitest run` (all pass)
4. **E2E tests** — `playwright test` (all pass)
5. **Production build** — `vite build` (must succeed, check bundle size)

### Manual (do before submitting to Chrome Web Store)

- **Content accuracy** — verify question counts in store listing copy match actual totals from `src/content/index.ts` (currently 605+)
- **Screenshots** — regenerate with `node scripts/generate-screenshots.mjs`; must reflect current UI, light mode, correct subject/topic names and question counts
- **Promo images** — regenerate with `node scripts/generate-store-assets.mjs`; same content accuracy requirements
- **Popup sizing** — test both normal (480×600) and expanded (800×600) modes; no scrollbars, no blank gaps
- **Font size scaling** — step through all 8 sizes (xs→4xl); all text, icons, and bottom nav must scale
- **Theme toggle** — verify dark and light modes across all screens
- **Offline** — disable network in Chrome DevTools; all features must work without errors
- **Fresh install** — load unpacked in a clean Chrome profile; no console errors on first run
- **Manifest version** — bump `version` in `manifest.json` and `package.json` before tagging
