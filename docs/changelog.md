# Changelog

All notable changes to InterviewPrep are documented here.

---

## v1.0.0 — 2026-10-30

First public release.

### Subjects

- **TypeScript** — 155 questions across 6 topics (Basics, Interfaces & Types, Functions, Generics, Classes, Advanced Types) — bundled, works offline immediately
- **Node.js** — 150 questions across 6 topics — downloadable on demand
- **Java** — 150 questions across 6 topics (Core Java, OOP, Collections, Concurrency, Java 8+, Streams) — downloadable on demand
- **DevOps** — 150 questions across 6 topics (Docker, Kubernetes, CI/CD, Linux, IaC, Monitoring) — downloadable on demand

### Features

- **Learning Mode** — study questions one by one with full explanations, key concepts, and code examples; self-assess open-ended questions
- **Interview Mode** — timed quiz sessions with automatic scoring; stop early and keep progress for answered questions
- **Results Review** — per-question breakdown with correct/incorrect indicators and explanations
- **Progress Dashboard** — topic completion rates, correct answer rates, weak area identification
- **Bookmarks** — save any question for later review
- **On-demand subject downloads** — subjects download from GitHub with version tracking; update available badge when a newer version exists
- **Manual download fallback** — dialog with pack URL, copy button, and step-by-step instructions for corporate/restricted networks
- **Subject author attribution** — version and author credit shown on each subject card
- **Stop controls** — leave a study or interview session at any point and return to the main menu
- **Font size control** — 8 levels: XS → SM → MD → LG → XL → 2XL → 3XL → 4XL
- **Theme** — dark and light modes
- **Popup sizes** — normal (480×600) and expanded (800×600) mode with persistent preference
- **Fully offline** — no account, no tracking, no external requests after initial subject download

### Technical

- Chrome Extension Manifest V3
- React 19, TypeScript 5.7, Vite 6, Tailwind CSS v4
- All user data stored locally in IndexedDB via Dexie.js
- Zustand for state management
- Markdown rendering with syntax highlighting for code snippets
