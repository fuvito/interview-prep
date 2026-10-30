/**
 * Generates Chrome Web Store screenshots at 1280×800 in light mode.
 * The UI fills the entire viewport with a desktop-style layout.
 *
 * Run: node scripts/generate-screenshots.mjs
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'store-assets')
mkdirSync(OUT_DIR, { recursive: true })

// ─── Light mode design tokens ─────────────────────────────────────────────────
const BG_MAIN   = '#f1f5f9'   // slate-100
const BG_CARD   = '#ffffff'
const BG_TOP    = '#ffffff'
const BG_SIDE   = '#ffffff'
const BLUE      = '#3b82f6'
const BLUE_L    = '#60a5fa'
const BLUE_BG   = '#eff6ff'   // blue-50
const BLUE_B    = '#bfdbfe'   // blue-200
const AMBER     = '#f59e0b'
const AMBER_BG  = '#fffbeb'
const GREEN     = '#22c55e'
const GREEN_BG  = '#f0fdf4'
const GREEN_B   = '#bbf7d0'
const RED       = '#ef4444'
const RED_BG    = '#fef2f2'
const RED_B     = '#fecaca'
const TEXT_1    = '#0f172a'   // slate-900
const TEXT_2    = '#475569'   // slate-600
const TEXT_3    = '#94a3b8'   // slate-400
const BORDER    = '#e2e8f0'   // slate-200
const BORDER_D  = '#cbd5e1'   // slate-300
const NAVY      = '#0c1628'

// ─── Full-page shell with sidebar nav ─────────────────────────────────────────
function page(activeNav, titleText, mainHtml) {
  const navItems = [
    { id: 'home',      icon: '⌂',  label: 'Home' },
    { id: 'subjects',  icon: '📖', label: 'Subjects' },
    { id: 'progress',  icon: '📊', label: 'Progress' },
    { id: 'bookmarks', icon: '🔖', label: 'Bookmarks' },
  ]

  const navHtml = navItems.map(n => {
    const active = n.id === activeNav
    return `<div class="nav-item ${active ? 'active' : ''}">
      <span class="nav-icon">${n.icon}</span>
      <span class="nav-label">${n.label}</span>
    </div>`
  }).join('')

  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:1280px; height:800px; overflow:hidden; background:${BG_MAIN};
      font-family:'Segoe UI', system-ui, -apple-system, sans-serif; color:${TEXT_1}; }

    /* Layout */
    .layout { display:flex; flex-direction:column; height:100vh; }

    /* Topbar */
    .topbar {
      height:56px; background:${NAVY}; border-bottom:1px solid ${BORDER};
      display:flex; align-items:center; padding:0 24px; gap:14px; flex-shrink:0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .tb-logo { display:flex; align-items:center; gap:8px; }
    .tb-ip { font-size:16px; font-weight:900; letter-spacing:-0.02em;
      background:linear-gradient(135deg,${BLUE},${BLUE_L});
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .tb-dot { width:6px; height:6px; border-radius:50%; background:${AMBER}; }
    .tb-divider { width:1px; height:20px; background:rgba(255,255,255,0.15); }
    .tb-title { font-size:15px; font-weight:600; color:#f1f5f9; }
    .tb-spacer { flex:1; }
    .tb-badge { font-size:11px; font-weight:600; background:rgba(59,130,246,0.2);
      color:${BLUE_L}; border:1px solid rgba(59,130,246,0.3); border-radius:20px; padding:3px 10px; }

    /* Body split: sidebar + content */
    .body { display:flex; flex:1; overflow:hidden; }

    /* Sidebar */
    .sidebar {
      width:200px; background:${BG_SIDE}; border-right:1px solid ${BORDER};
      display:flex; flex-direction:column; padding:16px 0; gap:2px; flex-shrink:0;
    }
    .nav-item {
      display:flex; align-items:center; gap:10px; padding:10px 20px;
      border-radius:0; cursor:pointer; font-size:14px; font-weight:500; color:${TEXT_2};
      transition:all 0.15s;
    }
    .nav-item.active { background:${BLUE_BG}; color:${BLUE}; border-right:3px solid ${BLUE}; }
    .nav-item:not(.active):hover { background:${BG_MAIN}; }
    .nav-icon { font-size:16px; width:20px; text-align:center; }
    .nav-label { font-size:14px; }

    /* Main content */
    .main { flex:1; overflow-y:auto; padding:28px 32px; }

    /* Page heading */
    .page-heading { font-size:22px; font-weight:700; color:${TEXT_1}; margin-bottom:6px; }
    .page-sub { font-size:13px; color:${TEXT_2}; margin-bottom:24px; }

    /* Stat cards */
    .stat-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
    .stat-card { background:${BG_CARD}; border:1px solid ${BORDER}; border-radius:12px; padding:18px 20px; }
    .stat-n { font-size:28px; font-weight:800; color:${TEXT_1}; letter-spacing:-0.02em; }
    .stat-n.blue { color:${BLUE}; }
    .stat-n.green { color:${GREEN}; }
    .stat-n.amber { color:${AMBER}; }
    .stat-l { font-size:12px; color:${TEXT_2}; margin-top:4px; font-weight:500; }
    .stat-bar { height:4px; border-radius:2px; background:${BORDER}; margin-top:10px; }
    .stat-bar-fill { height:100%; border-radius:2px; background:linear-gradient(90deg,${BLUE},${BLUE_L}); }

    /* Section titles */
    .section-title { font-size:13px; font-weight:700; color:${TEXT_3}; letter-spacing:0.07em;
      text-transform:uppercase; margin-bottom:12px; }

    /* Topic rows */
    .topic-list { background:${BG_CARD}; border:1px solid ${BORDER}; border-radius:12px; overflow:hidden; }
    .topic-row { display:flex; align-items:center; padding:14px 18px; border-bottom:1px solid ${BORDER}; gap:12px; cursor:pointer; }
    .topic-row:last-child { border-bottom:none; }
    .topic-row:hover { background:${BG_MAIN}; }
    .topic-icon { width:36px; height:36px; background:${BLUE_BG}; border-radius:8px;
      display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
    .topic-name { font-size:14px; font-weight:600; color:${TEXT_1}; flex:1; }
    .topic-sub  { font-size:12px; color:${TEXT_2}; margin-top:2px; }
    .topic-progress { display:flex; align-items:center; gap:10px; }
    .topic-bar { width:80px; height:5px; background:${BORDER}; border-radius:3px; }
    .topic-fill { height:100%; border-radius:3px; background:${BLUE}; }
    .topic-pct { font-size:12px; font-weight:700; color:${TEXT_2}; width:32px; text-align:right; }
    .chevron { font-size:16px; color:${TEXT_3}; }

    /* Question card */
    .q-card { background:${BG_CARD}; border:1px solid ${BORDER}; border-radius:12px; padding:24px; margin-bottom:16px; }
    .q-meta { display:flex; gap:8px; margin-bottom:14px; }
    .badge { font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }
    .badge-blue  { background:${BLUE_BG}; color:${BLUE}; border:1px solid ${BLUE_B}; }
    .badge-green { background:${GREEN_BG}; color:${GREEN}; border:1px solid ${GREEN_B}; }
    .badge-amber { background:${AMBER_BG}; color:${AMBER}; border:1px solid #fde68a; }
    .q-text { font-size:15px; font-weight:500; color:${TEXT_1}; line-height:1.6; margin-bottom:18px; }

    /* Options */
    .option { display:flex; align-items:flex-start; gap:12px; padding:12px 14px;
      border-radius:8px; border:1.5px solid ${BORDER}; margin-bottom:8px; cursor:pointer; }
    .option.correct { border-color:${GREEN}; background:${GREEN_BG}; }
    .option.wrong   { border-color:${RED}; background:${RED_BG}; }
    .option.selected { border-color:${BLUE}; background:${BLUE_BG}; }
    .option-bullet { width:20px; height:20px; border-radius:50%; border:2px solid ${BORDER_D};
      display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
    .option-bullet.correct { background:${GREEN}; border-color:${GREEN}; color:#fff; font-size:11px; }
    .option-bullet.wrong   { background:${RED}; border-color:${RED}; color:#fff; font-size:11px; }
    .option-bullet.dot { background:${BLUE}; border-color:${BLUE}; }
    .option-text { font-size:13px; color:${TEXT_1}; line-height:1.55; }

    /* Explanation */
    .explanation { background:${GREEN_BG}; border:1px solid ${GREEN_B}; border-radius:10px;
      padding:14px 16px; font-size:13px; color:#15803d; line-height:1.6; }
    .expl-label { font-size:11px; font-weight:700; color:${GREEN}; letter-spacing:0.06em; margin-bottom:6px; }

    /* Code block */
    .code-block { background:#1e293b; border-radius:10px; padding:16px;
      font-family:'Consolas','Courier New',monospace; font-size:12px;
      color:#e2e8f0; line-height:1.6; margin-bottom:14px; white-space:pre; }
    .code-kw  { color:#c084fc; }
    .code-str { color:#86efac; }
    .code-cmt { color:#64748b; }

    /* Buttons */
    .btn { padding:10px 20px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; border:none; }
    .btn-primary { background:${BLUE}; color:#fff; }
    .btn-secondary { background:${BG_CARD}; color:${TEXT_2}; border:1px solid ${BORDER}; }
    .btn-row { display:flex; gap:10px; }

    /* Timer */
    .timer-bar { background:${BG_CARD}; border:1px solid ${BORDER}; border-radius:12px;
      padding:16px 20px; display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
    .timer-time { font-size:28px; font-weight:800; color:${AMBER}; font-variant-numeric:tabular-nums; }
    .q-progress-bar { flex:1; height:8px; background:${BORDER}; border-radius:4px; margin:0 20px; }
    .q-progress-fill { height:100%; border-radius:4px; background:linear-gradient(90deg,${BLUE},${BLUE_L}); }
    .q-count { font-size:14px; font-weight:700; color:${TEXT_1}; }

    /* Results */
    .score-ring { width:120px; height:120px; border-radius:50%;
      border:8px solid ${BLUE_B}; display:flex; flex-direction:column;
      align-items:center; justify-content:center; flex-shrink:0; }
    .score-n { font-size:32px; font-weight:900; color:${BLUE}; line-height:1; }
    .score-label { font-size:11px; color:${TEXT_3}; font-weight:600; margin-top:3px; }

    /* Subject cards */
    .subject-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
    .subject-card { background:${BG_CARD}; border:1px solid ${BORDER}; border-radius:12px;
      padding:20px; cursor:pointer; }
    .subject-card:hover { border-color:${BLUE}; }
    .subject-card-name { font-size:16px; font-weight:700; color:${TEXT_1}; margin-bottom:6px; }
    .subject-card-desc { font-size:12px; color:${TEXT_2}; line-height:1.5; margin-bottom:12px; }
    .subject-card-footer { display:flex; align-items:center; justify-content:space-between; }
    .subject-q-count { font-size:12px; font-weight:600; color:${TEXT_3}; }
    .start-btn { font-size:12px; font-weight:600; color:${BLUE};
      background:${BLUE_BG}; border:1px solid ${BLUE_B}; border-radius:6px; padding:4px 12px; }
  </style>
  </head><body>
  <div class="layout">
    <div class="topbar">
      <div class="tb-logo">
        <span class="tb-ip">IP</span>
        <div class="tb-dot"></div>
      </div>
      <div class="tb-divider"></div>
      <span class="tb-title">${titleText}</span>
      <div class="tb-spacer"></div>
      <span class="tb-badge">Offline</span>
    </div>
    <div class="body">
      <div class="sidebar">${navHtml}</div>
      <div class="main">${mainHtml}</div>
    </div>
  </div>
  </body></html>`
}

// ─── Screen 1: Home — subject progress + topics ───────────────────────────────
function screen1() {
  const main = `
    <div class="page-heading">TypeScript</div>
    <div class="page-sub">Your current subject — pick up where you left off</div>

    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-n">155</div>
        <div class="stat-l">Total Questions</div>
        <div class="stat-bar"><div class="stat-bar-fill" style="width:100%"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-n">62</div>
        <div class="stat-l">Attempted</div>
        <div class="stat-bar"><div class="stat-bar-fill" style="width:40%"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-n green">81%</div>
        <div class="stat-l">Accuracy</div>
        <div class="stat-bar"><div class="stat-bar-fill" style="width:81%;background:${GREEN}"></div></div>
      </div>
      <div class="stat-card">
        <div class="stat-n amber">2</div>
        <div class="stat-l">Weak Areas</div>
        <div class="stat-bar"><div class="stat-bar-fill" style="width:33%;background:${AMBER}"></div></div>
      </div>
    </div>

    <div class="section-title">Topics</div>
    <div class="topic-list">
      <div class="topic-row">
        <div class="topic-icon">📘</div>
        <div style="flex:1"><div class="topic-name">TypeScript Basics</div><div class="topic-sub">25 questions · 100% complete</div></div>
        <div class="topic-progress">
          <div class="topic-bar"><div class="topic-fill" style="width:100%;background:${GREEN}"></div></div>
          <div class="topic-pct" style="color:${GREEN}">100%</div>
        </div>
        <span class="chevron">›</span>
      </div>
      <div class="topic-row">
        <div class="topic-icon">🔷</div>
        <div style="flex:1"><div class="topic-name">Interfaces &amp; Types</div><div class="topic-sub">25 questions · 88% complete</div></div>
        <div class="topic-progress">
          <div class="topic-bar"><div class="topic-fill" style="width:88%"></div></div>
          <div class="topic-pct">88%</div>
        </div>
        <span class="chevron">›</span>
      </div>
      <div class="topic-row">
        <div class="topic-icon">⚙️</div>
        <div style="flex:1"><div class="topic-name">Functions</div><div class="topic-sub">25 questions · 72% complete</div></div>
        <div class="topic-progress">
          <div class="topic-bar"><div class="topic-fill" style="width:72%"></div></div>
          <div class="topic-pct">72%</div>
        </div>
        <span class="chevron">›</span>
      </div>
      <div class="topic-row">
        <div class="topic-icon">🧩</div>
        <div style="flex:1"><div class="topic-name">Generics</div><div class="topic-sub">25 questions · 40% complete</div></div>
        <div class="topic-progress">
          <div class="topic-bar"><div class="topic-fill" style="width:40%"></div></div>
          <div class="topic-pct">40%</div>
        </div>
        <span class="chevron">›</span>
      </div>
      <div class="topic-row">
        <div class="topic-icon" style="background:${AMBER_BG}">⚠️</div>
        <div style="flex:1"><div class="topic-name" style="color:${AMBER}">Advanced Types</div><div class="topic-sub">Weak area · 48% accuracy</div></div>
        <div class="topic-progress">
          <div class="topic-bar"><div class="topic-fill" style="width:48%;background:${AMBER}"></div></div>
          <div class="topic-pct" style="color:${AMBER}">48%</div>
        </div>
        <span class="chevron">›</span>
      </div>
    </div>
  `
  return page('home', 'TypeScript', main)
}

// ─── Screen 2: Study mode — question with answer revealed ─────────────────────
function screen2() {
  const main = `
    <div class="page-heading">TypeScript Basics</div>
    <div class="page-sub">Study mode · Question 3 of 25</div>

    <div class="q-card">
      <div class="q-meta">
        <span class="badge badge-blue">Single choice</span>
        <span class="badge badge-green">Beginner</span>
      </div>
      <div class="q-text">What is the difference between <code style="background:#f1f5f9;padding:2px 7px;border-radius:4px;color:#3b82f6;font-family:monospace;font-size:14px;">type</code> and <code style="background:#f1f5f9;padding:2px 7px;border-radius:4px;color:#3b82f6;font-family:monospace;font-size:14px;">interface</code> in TypeScript?</div>

      <div class="option correct">
        <div class="option-bullet correct">✓</div>
        <div class="option-text">Both can define object shapes; interfaces support declaration merging while types can define unions, intersections, and mapped types</div>
      </div>
      <div class="option wrong">
        <div class="option-bullet wrong">✗</div>
        <div class="option-text">Types are only for primitives; interfaces are only for objects</div>
      </div>
      <div class="option">
        <div class="option-bullet"></div>
        <div class="option-text">Interfaces are compiled away; types remain at runtime</div>
      </div>
      <div class="option">
        <div class="option-bullet"></div>
        <div class="option-text">They are completely identical — no difference exists</div>
      </div>
    </div>

    <div class="explanation">
      <div class="expl-label">EXPLANATION</div>
      Both <strong>type</strong> and <strong>interface</strong> can describe object shapes. Key difference: interfaces support declaration merging (you can reopen and extend them), while type aliases support unions, intersections, conditional types, and mapped types. Prefer interfaces for public API shapes; types for complex type manipulations.
    </div>

    <div class="btn-row" style="margin-top:16px;">
      <button class="btn btn-secondary">← Previous</button>
      <button class="btn btn-primary" style="flex:1;">Next Question →</button>
      <button style="padding:10px 14px;background:${AMBER_BG};border:1px solid #fde68a;border-radius:8px;font-size:18px;cursor:pointer;">🔖</button>
    </div>
  `
  return page('home', 'TypeScript · Basics', main)
}

// ─── Screen 3: Interview simulation ──────────────────────────────────────────
function screen3() {
  const main = `
    <div class="timer-bar">
      <div>
        <div style="font-size:11px;font-weight:600;color:${TEXT_3};letter-spacing:0.07em;text-transform:uppercase;margin-bottom:4px;">Time Remaining</div>
        <div class="timer-time">12:34</div>
      </div>
      <div class="q-progress-bar">
        <div class="q-progress-fill" style="width:35%"></div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;font-weight:600;color:${TEXT_3};letter-spacing:0.07em;text-transform:uppercase;margin-bottom:4px;">Progress</div>
        <div class="q-count">7 / 20 Questions</div>
      </div>
    </div>

    <div class="q-card">
      <div class="q-meta">
        <span class="badge badge-blue">Code</span>
        <span class="badge badge-amber">Intermediate</span>
      </div>
      <div class="q-text">What will happen when <code style="background:#f1f5f9;padding:2px 7px;border-radius:4px;color:#3b82f6;font-family:monospace;font-size:14px;">/api/posts</code> fails in the following code?</div>
      <div class="code-block"><span class="code-kw">async function</span> fetchData() {
  <span class="code-kw">const</span> result = <span class="code-kw">await</span> Promise.all([
    fetch(<span class="code-str">'/api/users'</span>),
    fetch(<span class="code-str">'/api/posts'</span>),
  ])
  <span class="code-kw">return</span> result
}
<span class="code-cmt">// What happens if /api/posts fails?</span></div>

      <div class="option selected">
        <div class="option-bullet dot"></div>
        <div class="option-text">The entire Promise.all rejects immediately — even if /api/users succeeded</div>
      </div>
      <div class="option">
        <div class="option-bullet"></div>
        <div class="option-text">Only the failed promise rejects; users data is still returned</div>
      </div>
      <div class="option">
        <div class="option-bullet"></div>
        <div class="option-text">Both promises are retried automatically by the browser</div>
      </div>
      <div class="option">
        <div class="option-bullet"></div>
        <div class="option-text">An empty array is returned as the result</div>
      </div>
    </div>

    <button class="btn btn-primary" style="width:100%;padding:12px;font-size:14px;">Submit Answer</button>
  `
  return page('home', 'Interview Simulation', main)
}

// ─── Screen 4: Subjects selection ────────────────────────────────────────────
function screen4() {
  const main = `
    <div class="page-heading">Subjects</div>
    <div class="page-sub">Choose a subject to study or switch your active subject</div>

    <div class="subject-grid">
      <div class="subject-card" style="border-color:${BLUE};background:${BLUE_BG};">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:24px;">📘</span>
          <div class="subject-card-name" style="color:${BLUE};">TypeScript</div>
          <span style="font-size:11px;background:${BLUE};color:#fff;border-radius:20px;padding:2px 8px;font-weight:600;margin-left:auto;">Active</span>
        </div>
        <div class="subject-card-desc">Types, generics, classes, advanced patterns &amp; compiler internals</div>
        <div class="subject-card-footer">
          <span class="subject-q-count">155 questions · 6 topics</span>
          <span class="start-btn">Study →</span>
        </div>
      </div>
      <div class="subject-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:24px;">🟢</span>
          <div class="subject-card-name">Node.js</div>
        </div>
        <div class="subject-card-desc">Event loop, streams, Express, core modules &amp; async patterns</div>
        <div class="subject-card-footer">
          <span class="subject-q-count">150 questions · 6 topics</span>
          <span class="start-btn">Study →</span>
        </div>
      </div>
      <div class="subject-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:24px;">🐳</span>
          <div class="subject-card-name">DevOps</div>
        </div>
        <div class="subject-card-desc">Docker, Kubernetes, CI/CD, Linux, Terraform &amp; monitoring</div>
        <div class="subject-card-footer">
          <span class="subject-q-count">150 questions · 6 topics</span>
          <span class="start-btn">Study →</span>
        </div>
      </div>
      <div class="subject-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:24px;">☕</span>
          <div class="subject-card-name">Java</div>
        </div>
        <div class="subject-card-desc">OOP, Collections, Concurrency, JVM, Spring &amp; Streams</div>
        <div class="subject-card-footer">
          <span class="subject-q-count">150 questions · 6 topics</span>
          <span class="start-btn">Study →</span>
        </div>
      </div>
    </div>

    <div style="border:2px dashed ${BORDER_D};border-radius:12px;padding:20px;display:flex;align-items:center;gap:14px;margin-top:16px;cursor:pointer;">
      <div style="width:40px;height:40px;background:${BG_MAIN};border:2px dashed ${BORDER_D};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:20px;">+</div>
      <div>
        <div style="font-size:14px;font-weight:600;color:${TEXT_2};">Upload Custom Subject JSON</div>
        <div style="font-size:12px;color:${TEXT_3};margin-top:2px;">Import your own questions in the standard format</div>
      </div>
    </div>
  `
  return page('subjects', 'Subjects', main)
}

// ─── Screen 5: Interview results ──────────────────────────────────────────────
function screen5() {
  const main = `
    <div class="page-heading">Interview Results</div>
    <div class="page-sub">TypeScript · Completed just now · 20 questions</div>

    <div style="display:flex;gap:24px;margin-bottom:24px;align-items:flex-start;">
      <div class="score-ring">
        <div class="score-n">82%</div>
        <div class="score-label">Score</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;flex:1;">
        <div class="stat-card">
          <div class="stat-n green">16</div>
          <div class="stat-l">Correct</div>
        </div>
        <div class="stat-card">
          <div class="stat-n" style="color:${RED}">4</div>
          <div class="stat-l">Wrong</div>
        </div>
        <div class="stat-card">
          <div class="stat-n amber">18:22</div>
          <div class="stat-l">Time</div>
        </div>
      </div>
    </div>

    <div class="section-title">Performance by Topic</div>
    <div class="topic-list">
      <div class="topic-row">
        <div style="flex:1"><div class="topic-name">TypeScript Basics</div></div>
        <div class="topic-progress">
          <div class="topic-bar"><div class="topic-fill" style="width:100%;background:${GREEN}"></div></div>
          <div class="topic-pct" style="color:${GREEN}">100%</div>
        </div>
      </div>
      <div class="topic-row">
        <div style="flex:1"><div class="topic-name">Interfaces &amp; Types</div></div>
        <div class="topic-progress">
          <div class="topic-bar"><div class="topic-fill" style="width:80%"></div></div>
          <div class="topic-pct">80%</div>
        </div>
      </div>
      <div class="topic-row">
        <div style="flex:1"><div class="topic-name">Generics</div></div>
        <div class="topic-progress">
          <div class="topic-bar"><div class="topic-fill" style="width:75%"></div></div>
          <div class="topic-pct">75%</div>
        </div>
      </div>
      <div class="topic-row">
        <div style="flex:1"><div class="topic-name">Advanced Types</div><div class="topic-sub" style="color:${AMBER}">Needs practice</div></div>
        <div class="topic-progress">
          <div class="topic-bar"><div class="topic-fill" style="width:50%;background:${AMBER}"></div></div>
          <div class="topic-pct" style="color:${AMBER}">50%</div>
        </div>
      </div>
    </div>

    <div class="btn-row" style="margin-top:16px;">
      <button class="btn btn-secondary" style="flex:1;">Review Answers</button>
      <button class="btn btn-primary" style="flex:1;">New Interview</button>
    </div>
  `
  return page('home', 'Results', main)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const browser = await chromium.launch()
  const pg = await browser.newPage()
  await pg.setViewportSize({ width: 1280, height: 800 })

  const screens = [
    { name: 'screenshot-1-home.png',        html: screen1() },
    { name: 'screenshot-2-study.png',        html: screen2() },
    { name: 'screenshot-3-interview.png',    html: screen3() },
    { name: 'screenshot-4-subjects.png',     html: screen4() },
    { name: 'screenshot-5-results.png',      html: screen5() },
  ]

  for (const { name, html } of screens) {
    await pg.setContent(html, { waitUntil: 'networkidle' })
    await pg.screenshot({ path: join(OUT_DIR, name), clip: { x: 0, y: 0, width: 1280, height: 800 } })
    console.log(`✓ ${name}`)
  }

  await browser.close()
  console.log(`\nAll screenshots saved to store-assets/ (1280×800, light mode)`)
}

main().catch(console.error)
