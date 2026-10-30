# InterviewPrep

An offline-first Chrome Extension for technical interview preparation. Study questions, run mock interviews, track your progress — no internet required.

## Features

- Browse subjects and topics with difficulty filters
- Four question types: single choice, multiple select, code output, free text
- Learning Mode — study with detailed explanations and code examples
- Interview Mode — timed simulations with scored results
- Progress dashboard — performance stats, weak area identification
- Bookmarks — save questions for later review
- Fully offline — no backend, no auth, no external APIs

## Tech Stack

| Component | Technology |
|---|---|
| Platform | Chrome Extension Manifest V3 |
| Frontend | React + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | IndexedDB via Dexie.js |
| Content | Bundled JSON |

## Getting Started

**Prerequisites:** Node.js 20+, npm, Google Chrome

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Production build
npm run build
```

## Loading the Extension in Chrome

1. Run `npm run build`
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the `dist/` folder
5. The extension will appear in your toolbar

## Project Structure

```
src/
├── app/            # App entry, routes, providers
├── components/     # Shared UI components
├── features/       # dashboard, subjects, questions, learning,
│                   # interview, results, progress, bookmarks
├── core/           # question-engine, assessment-engine,
│                   # scoring-engine, progress-engine
├── database/       # Dexie setup, schema, repositories
├── content/        # Bundled JSON question content
├── store/          # Zustand stores
├── types/          # Domain interfaces
├── hooks/          # Custom React hooks
└── utils/
```

## Development Roadmap

| Phase | Description |
| --- | --- |
| 1 | Project foundation — Vite, React, TS, Manifest V3, Tailwind |
| 2 | Database and content — Dexie schema, repositories, JSON format |
| 3 | Core engines — evaluation, scoring, progress, bookmarks |
| 4 | User interface — all screens |
| 5 | TypeScript content pack — 150–200 questions |
| 6 | Testing and Chrome Web Store release |

## Initial Content

TypeScript interview questions across beginner, intermediate, and advanced levels. Future packs planned for JavaScript, React, Node.js, Java, Python, AWS, SQL, System Design, and more.

## License

[MIT](LICENSE)
