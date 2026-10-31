# Publishing to the Chrome Web Store

## Prerequisites

- A Google account
- $5 one-time developer registration fee (paid once per account)
- A production build of the extension

---

## 1. Build the Extension

```bash
npm run prerelease   # run all checks first
npm run build        # produces dist/
npm run package      # produces dist/interview-prep-v<version>.zip
```

---

## 2. Create a Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in with your Google account
3. Pay the one-time $5 registration fee if prompted

---

## 3. Create a New Item

1. Click **Add new item**
2. Upload the ZIP file produced by `npm run package`
3. Click **Continue**

---

## 4. Fill in Store Listing

### Name

```
InterviewPrep
```

### Short Description (max 132 characters)

```
Offline-first technical interview prep. TypeScript, Java, React, Python, Node.js, Spring Boot & more. No account needed.
```

### Detailed Description (paste as-is)

```
InterviewPrep is an offline-first browser extension for developers preparing for technical job interviews. All questions and your progress are stored locally — no account, no server, no internet connection required during study.

─── BUILT-IN CONTENT ───────────────────────────────────

▸ TypeScript — 197 questions across 11 topics
  Basics, Interfaces & Types, Functions, Generics, Classes, Advanced Types,
  Async, Modules, Compiler Config, Runtime Validation, Real-World Patterns

─── DOWNLOADABLE SUBJECT PACKS ─────────────────────────

Install additional subjects with one click from the Subjects screen:

▸ Python & FastAPI — 200 questions, 20 topics
  Python fundamentals, OOP, typing, collections, iterators/generators,
  concurrency, testing, and 8 FastAPI-specific topics including Pydantic,
  dependency injection, auth, middleware, and deployment

▸ Java — 222 questions, 11 topics
  Core Java, OOP, Collections, Concurrency, JVM, Spring Boot, Streams,
  Exceptions, Generics, I/O, JDBC, and Annotations

▸ Node.js — 150 questions, 6 topics
  Event loop, async patterns, Express.js, streams, and production best practices

▸ Spring Boot — 120 questions, 12 topics
  Fundamentals, auto-configuration, DI, REST, JPA, transactions, security,
  testing, Actuator, microservices, and performance

▸ React — 80 questions, 8 topics
  Fundamentals, components/props, state/events, rendering/lists,
  Hooks/effects, forms/context, performance/routing, and testing

▸ DevOps — 150 questions, 6 topics
  Docker, Kubernetes, CI/CD, Linux, Infrastructure as Code, and monitoring

─── KEY FEATURES ───────────────────────────────────────

✓ Study mode — step through questions at your own pace with full explanations
✓ Practice interview — timed simulation with configurable question count and topics
✓ Progress tracking — per-topic completion rates and correct/incorrect history
✓ Bookmarks — save questions to review later
✓ Filtering — by difficulty (beginner / intermediate / advanced), question type, and common interview questions
✓ Dark and light themes
✓ Font size control (8 sizes)
✓ Export any subject as JSON to edit and re-import as a custom pack
✓ Import your own question packs in the open SubjectPackJSON format
✓ Fully offline — works with no internet connection after install

─── PRIVACY ────────────────────────────────────────────

No data ever leaves your device. There is no account, no telemetry, no analytics,
and no external service beyond fetching optional subject packs from GitHub
when you choose to install them.

─── OPEN SOURCE ────────────────────────────────────────

Project website: https://www.fuatyazar.com/interviewprep
Source code: https://github.com/fuvito/interview-prep
```

### Category

```
Education
```

### Language

```
English
```

### Homepage URL

```
https://www.fuatyazar.com/interviewprep
```

### Screenshots

Run `node scripts/generate-screenshots.mjs` to generate 1280×800 PNGs into `store-assets/`. Upload at least one. Recommended order:

1. Dashboard (subject selected, topics visible)
2. Study mode (question with explanation revealed)
3. Practice interview (question in progress)
4. Subjects screen (built-in + downloadable packs)
5. Progress view

### Promotional Tile (440×280)

Run `node scripts/generate-store-assets.mjs`.

### Icon

128×128 PNG — already at `public/icons/icon-128.png`.

---

## 5. Privacy Practices

On the **Privacy practices** tab:

**Single purpose:**
> Helps developers prepare for technical job interviews with offline question sets, study mode, and practice interviews.

**Permissions justification:**

| Permission | Reason |
|---|---|
| `tabs` | Opens documentation and repository links in a new tab from the About screen |
| `downloads` | Saves subject pack exports as JSON files to the user's Downloads folder |
| `host_permissions: https://raw.githubusercontent.com/*` | Fetches optional official subject packs (Java, Node.js, etc.) from the project's GitHub repository when the user chooses to install them |

**Data usage:** Select *This extension does not collect or transmit any personal data*

**Remote code:** Select *No*

---

## 6. Submit for Review

Click **Submit for review**. Chrome Web Store review typically takes **1–3 business days** for new submissions.

---

## 7. After Approval

Once approved you will receive an email. The item becomes publicly listed on the Chrome Web Store. To publish an update:

1. Bump `version` in `manifest.json` and `package.json`
2. Run `npm run prerelease`
3. Run `npm run build && npm run package`
4. Go to the Developer Dashboard → your item → **Package** tab → upload the new ZIP
5. Click **Submit for review**

---

## Useful Links

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Extension publishing docs](https://developer.chrome.com/docs/webstore/publish/)
- [Store listing best practices](https://developer.chrome.com/docs/webstore/best_practices/)
