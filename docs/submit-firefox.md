# Publishing to Firefox Add-ons (AMO)

Firefox supports Manifest V3 but has some differences from Chrome. This guide covers both adaptation and submission.

## Prerequisites

- A Firefox account (free)
- Node.js 20+
- Firefox installed for local testing

---

## 1. Known Differences from Chrome

| Feature | Chrome | Firefox |
|---|---|---|
| `chrome.*` API | native | polyfill needed (`webextension-polyfill`) |
| `service_worker` | supported | supported in MV3 (FF 109+) |
| `host_permissions` | supported | supported (FF 128+) |
| IndexedDB | supported | supported |

The codebase uses only `chrome.downloads` and Dexie (IndexedDB), which both work natively in Firefox. No API polyfill is currently needed.

> The Firefox package script (`npm run package:firefox`) automatically injects `browser_specific_settings.gecko` with a stable extension ID (`interviewprep@fyazar.com`, `strict_min_version: "128.0"`) into the bundled `manifest.json`. The source `public/manifest.json` is not modified.

---

## 2. Build

```bash
npm run prerelease         # run all checks first
npm run build              # produces dist/
npm run package:firefox    # produces dist/interview-prep-v<version>-firefox.zip
```

Firefox AMO also requires a ZIP of the **source code** for review:

```bash
# macOS / Linux
zip -r interview-prep-source-v<version>.zip . \
  --exclude "node_modules/*" --exclude "dist/*" --exclude ".git/*"

# Windows (PowerShell)
Get-ChildItem -Exclude node_modules,dist,.git | Compress-Archive -DestinationPath interview-prep-source-v<version>.zip
```

---

## 3. Test Locally in Firefox

1. Open Firefox and navigate to `about:debugging`
2. Click **This Firefox** in the left sidebar
3. Click **Load Temporary Add-on…**
4. Select any file inside your `dist/` folder (e.g., `manifest.json`)
5. The extension loads temporarily — it will be removed when Firefox restarts

---

## 4. Create a Firefox Account and Submit

1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Sign in or create an account (free)
3. Click **Submit a New Add-on**
4. Choose **On this site** (publicly listed)
5. Upload the extension ZIP (`interview-prep-v<version>-firefox.zip`)
6. When prompted, upload the **source code ZIP** as well (required for review)

---

## 5. Fill in Listing Details

### Name

```
InterviewPrep
```

### Summary (max 250 characters)

```
Offline-first technical interview prep for developers. Study TypeScript, Java, React, Python, Node.js, Spring Boot & more. Practice interviews, track progress, bookmark questions. No account needed.
```

### Description (Markdown supported)

```markdown
**InterviewPrep** is an offline-first browser extension for developers preparing for technical job interviews. All questions and your progress are stored locally — no account, no server, no internet connection required during study.

## Built-in Content

**TypeScript** — 197 questions across 11 topics
Basics, Interfaces & Types, Functions, Generics, Classes, Advanced Types, Async, Modules, Compiler Config, Runtime Validation, Real-World Patterns

## Downloadable Subject Packs

Install additional subjects with one click from the Subjects screen:

- **Python & FastAPI** — 200 questions, 20 topics
- **Java** — 222 questions, 11 topics
- **Node.js** — 150 questions, 6 topics
- **Spring Boot** — 120 questions, 12 topics
- **React** — 80 questions, 8 topics
- **DevOps** — 150 questions, 6 topics

## Key Features

- **Study mode** — step through questions at your own pace with full explanations
- **Practice interview** — timed simulation with configurable question count and topics
- **Progress tracking** — per-topic completion rates and correct/incorrect history
- **Bookmarks** — save questions to review later
- **Filtering** — by difficulty, question type, and common interview questions
- **Dark and light themes** with font size control
- **Export/import** — export any subject as JSON or import your own custom pack
- **Fully offline** — works without internet after install

## Privacy

No data ever leaves your device. No account, no telemetry, no analytics, and no external service beyond fetching optional subject packs from GitHub when you choose to install them.

## Open Source

Project website: https://www.fuatyazar.com/interviewprep
Source code: https://github.com/fuvito/interview-prep
```

### Category

```
Education
```

### Homepage URL

```
https://www.fuatyazar.com/interviewprep
```

### Support URL

```
https://www.fuatyazar.com/interviewprep
```

### Support Email

```
fyazar@gmail.com
```

### Screenshots

Run `node scripts/generate-screenshots.mjs` to generate 1280×800 PNGs into `store-assets/`. AMO accepts images between 500×375 and 3840×2400. Upload at least one. Recommended order:

1. Dashboard (subject selected, topics visible)
2. Study mode (question with explanation revealed)
3. Practice interview (question in progress)
4. Subjects screen (built-in + downloadable packs)
5. Progress view

### Build Instructions (include in source submission notes)

```
npm install
npm run build
# Extension is in dist/
```

---

## 6. Permissions Justification

AMO reviewers may ask for justification. Prepare the following:

| Permission | Reason |
|---|---|
| `tabs` | Opens documentation and repository links in a new tab from the About screen |
| `downloads` | Saves subject pack exports as JSON files to the user's Downloads folder |
| `host_permissions: https://raw.githubusercontent.com/*` | Fetches optional official subject packs from the project's GitHub repository when the user chooses to install them |

---

## 7. Review Process

AMO review can take **1–10 days** for new submissions. Listed add-ons go through human review. Self-hosted add-ons can be signed automatically (faster) but won't appear in the AMO directory.

---

## 8. After Approval

To publish an update:

1. Bump `version` in `manifest.json` and `package.json`
2. Run `npm run prerelease`
3. Run `npm run build && npm run package:firefox`
4. Go to the AMO Developer Hub → your add-on → **Upload New Version**
5. Upload the new Firefox ZIP and source ZIP

---

## Useful Links

- [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
- [Firefox MV3 migration guide](https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/)
- [Extension Workshop](https://extensionworkshop.com/)
