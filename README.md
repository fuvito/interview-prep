# InterviewPrep

An offline-first browser extension for technical interview preparation. Study questions, run mock interviews, track your progress — no internet required after the initial install.

## Features

- Browse subjects and topics (TypeScript bundled; Node.js, Java, DevOps downloadable on demand)
- Four question types: single choice, multiple select, code output, free text
- Learning Mode — study with detailed explanations and code examples
- Interview Mode — quiz sessions with scoring; stop early without losing answered progress
- Results Review — per-question breakdown with correct/incorrect indicators
- Progress Dashboard — topic stats and weak area identification
- Bookmarks — save questions for later review
- Font size control — 8 levels (XS → 4XL)
- Dark and light themes
- Popup (480×600) and expanded (800×600) modes
- Fully offline — no account, no tracking, no external requests after subject download

## Tech Stack

| Component | Technology |
|---|---|
| Platform | Chrome Extension Manifest V3 |
| Frontend | React 19 + TypeScript 5.7 |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Database | IndexedDB via Dexie.js |
| Content | Bundled + downloadable JSON packs |

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
2. Open Chrome → `chrome://extensions`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select the `dist/` folder
5. The extension appears in your toolbar

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run prerelease` | Full pre-release check (TS, lint, tests, build) |
| `npm run generate-packs` | Regenerate `packs/*.json` from source content |

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

## Documentation

- [User Guide](docs/user-guide.md)
- [Changelog](docs/changelog.md)
- [Privacy Policy](docs/privacy.md)
- [Terms of Use](docs/terms.md)

## Publishing

- [Chrome Web Store](docs/submit-chrome.md)
- [Firefox Add-ons (AMO)](docs/submit-firefox.md)
- [Safari App Store](docs/submit-safari.md)

## Contributing

Contributions are welcome. To add or improve a subject pack:

1. Add or edit JSON files under `src/content/subjects/<id>/`
2. Run `npm run generate-packs` to rebuild the downloadable pack
3. Update `public/registry.json` if question/topic counts changed
4. Run `npm run prerelease` to verify everything passes
5. Open a pull request

## License

[MIT](LICENSE)
