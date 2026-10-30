/**
 * Generates Chrome Web Store screenshots at 1280×800.
 * Shows the extension popup (480×600) centred on a branded background.
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

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG_DEEP   = '#060e1a'
const BG_NAVY   = '#0c1628'
const BG_CARD   = '#111827'  // gray-900
const BG_950    = '#030712'  // gray-950
const BLUE      = '#3b82f6'
const BLUE_L    = '#60a5fa'
const BLUE_DIM  = '#1e3a5f'
const AMBER     = '#f59e0b'
const GREEN     = '#22c55e'
const RED       = '#ef4444'
const TEXT_W    = '#f1f5f9'
const TEXT_G    = '#9ca3af'  // gray-400
const TEXT_D    = '#4b5563'  // gray-600
const BORDER    = '#1f2937'  // gray-800

// ─── Shared shell: wraps any popup HTML in a 1280×800 branded canvas ─────────
function shell(title, popupHtml) {
  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:1280px; height:800px; overflow:hidden; }
    body {
      background: linear-gradient(135deg, #04090f 0%, ${BG_DEEP} 40%, #081428 70%, #04090f 100%);
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      font-family:'Segoe UI', system-ui, sans-serif; position:relative; gap:18px;
    }
    .grid-bg {
      position:absolute; inset:0;
      background-image:
        linear-gradient(${BLUE}06 1px, transparent 1px),
        linear-gradient(90deg, ${BLUE}06 1px, transparent 1px);
      background-size:60px 60px;
    }
    .glow { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
      width:900px; height:900px;
      background:radial-gradient(circle, ${BLUE}0a 0%, transparent 55%); }

    .caption { font-size:13px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase;
      color:${BLUE_L}; z-index:2; }

    /* The popup frame */
    .popup {
      width:480px; height:600px;
      background:${BG_950}; border-radius:12px;
      border:1px solid ${BLUE_DIM}40;
      box-shadow: 0 32px 80px #00000080, 0 0 0 1px ${BLUE}18;
      overflow:hidden; display:flex; flex-direction:column;
      z-index:2; flex-shrink:0;
    }

    /* TopBar */
    .topbar {
      height:48px; background:${BG_NAVY}; border-bottom:1px solid ${BLUE_DIM};
      display:flex; align-items:center; padding:0 16px; gap:10px; flex-shrink:0;
    }
    .tb-ip { font-size:11px; font-weight:900; letter-spacing:0.1em; color:${BLUE}; text-transform:uppercase; }
    .tb-title { font-size:14px; font-weight:600; color:#dbeafe; }
    .tb-actions { margin-left:auto; display:flex; gap:6px; align-items:center; }
    .tb-icon { width:15px; height:15px; background:${BLUE}30; border-radius:3px; }

    /* BottomNav */
    .bottomnav {
      height:56px; background:${BG_950}; border-top:1px solid ${BORDER};
      display:flex; align-items:stretch; flex-shrink:0;
    }
    .nav-item { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; }
    .nav-item.active .nav-icon { color:${BLUE}; }
    .nav-item.active .nav-label { color:${BLUE}; }
    .nav-icon { font-size:18px; color:${TEXT_D}; line-height:1; }
    .nav-label { font-size:10px; font-weight:500; color:${TEXT_D}; }

    /* Scrollable content area */
    .content { flex:1; overflow:hidden; display:flex; flex-direction:column; }
    .scroll { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:16px; }

    /* Cards */
    .card { background:${BG_CARD}; border:1px solid ${BORDER}; border-radius:10px; padding:14px; }
    .card-title { font-size:10px; font-weight:600; color:${TEXT_G}; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:10px; }
    .stat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
    .stat-cell { background:${BG_CARD}; border:1px solid ${BORDER}; border-radius:8px; padding:12px 8px; text-align:center; }
    .stat-n { font-size:22px; font-weight:800; color:${TEXT_W}; }
    .stat-n.blue { color:${BLUE}; }
    .stat-l { font-size:10px; color:${TEXT_G}; margin-top:2px; }
    .scorebar { height:6px; background:#1f2937; border-radius:3px; margin-top:10px; }
    .scorebar-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,${AMBER},${BLUE}); }

    .subject-row { display:flex; align-items:center; justify-content:space-between;
      background:${BG_CARD}; border:1px solid ${BORDER}; border-radius:10px;
      padding:12px 14px; }
    .subject-name { font-size:14px; font-weight:600; color:${TEXT_W}; }
    .subject-sub  { font-size:11px; color:${TEXT_G}; margin-top:2px; }
    .chevron { font-size:14px; color:${TEXT_D}; }

    /* Question card */
    .q-card { background:${BG_CARD}; border:1px solid ${BORDER}; border-radius:10px; padding:16px; }
    .q-meta { display:flex; gap:6px; margin-bottom:12px; }
    .badge { font-size:10px; font-weight:600; padding:2px 8px; border-radius:20px; }
    .badge-blue { background:${BLUE}20; color:${BLUE_L}; border:1px solid ${BLUE}40; }
    .badge-green { background:${GREEN}20; color:${GREEN}; border:1px solid ${GREEN}40; }
    .badge-amber { background:${AMBER}20; color:${AMBER}; border:1px solid ${AMBER}40; }
    .q-text { font-size:13px; color:${TEXT_W}; line-height:1.6; margin-bottom:14px; font-weight:500; }
    .option { display:flex; align-items:flex-start; gap:10px; padding:10px 12px;
      border-radius:8px; border:1px solid ${BORDER}; margin-bottom:6px; cursor:pointer; }
    .option.correct { border-color:${GREEN}60; background:${GREEN}10; }
    .option.wrong   { border-color:${RED}60; background:${RED}10; }
    .option.selected { border-color:${BLUE}60; background:${BLUE}10; }
    .option-bullet { width:16px; height:16px; border-radius:50%; border:1px solid ${TEXT_D};
      display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
    .option-bullet.correct { background:${GREEN}; border-color:${GREEN}; color:#fff; font-size:10px; }
    .option-bullet.wrong   { background:${RED}; border-color:${RED}; color:#fff; font-size:10px; }
    .option-bullet.dot { background:${BLUE}; border-color:${BLUE}; }
    .option-text { font-size:12px; color:${TEXT_W}; line-height:1.5; }

    /* Explanation box */
    .explanation { background:#0f2918; border:1px solid ${GREEN}30; border-radius:8px;
      padding:12px; font-size:11px; color:#86efac; line-height:1.6; }
    .expl-label { font-size:10px; font-weight:700; color:${GREEN}; letter-spacing:0.06em; margin-bottom:6px; }

    /* Code block */
    .code-block { background:#0a0f1a; border:1px solid ${BLUE_DIM}; border-radius:8px;
      padding:12px; font-family:'Consolas','Courier New',monospace; font-size:11px;
      color:#93c5fd; line-height:1.6; margin-bottom:10px; white-space:pre; }
    .code-kw  { color:#c084fc; }
    .code-str { color:#86efac; }
    .code-num { color:#fb923c; }
    .code-cmt { color:#4b5563; }

    /* Progress bars */
    .topic-row { display:flex; align-items:center; gap:10px; padding:8px 0;
      border-bottom:1px solid ${BORDER}; }
    .topic-row:last-child { border-bottom:none; }
    .topic-name { font-size:12px; color:${TEXT_W}; flex:1; }
    .topic-bar  { flex:1; height:4px; background:${BORDER}; border-radius:2px; }
    .topic-fill { height:100%; border-radius:2px; }
    .topic-pct  { font-size:11px; font-weight:600; color:${TEXT_G}; width:32px; text-align:right; }

    /* Interview timer */
    .timer-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
    .timer { font-size:18px; font-weight:700; color:${AMBER}; font-variant-numeric:tabular-nums; }
    .q-counter { font-size:11px; color:${TEXT_G}; }
    .submit-btn { background:${BLUE}; color:#fff; border:none; border-radius:8px;
      padding:10px; font-size:13px; font-weight:600; width:100%; margin-top:12px; cursor:pointer; }

    /* Bookmark star */
    .bk-row { display:flex; align-items:center; justify-content:space-between;
      padding:10px 14px; background:${BG_CARD}; border:1px solid ${BORDER}; border-radius:10px; margin-bottom:6px; }
    .bk-q   { font-size:12px; color:${TEXT_W}; flex:1; margin-right:10px; }
    .bk-tag { font-size:10px; color:${BLUE_L}; }
    .star   { color:${AMBER}; font-size:15px; }
  </style>
  </head><body>
    <div class="grid-bg"></div>
    <div class="glow"></div>
    <div class="caption">${title}</div>
    <div class="popup">${popupHtml}</div>
  </body></html>`
}

// ─── Screen 1: Home — subject progress + topics ───────────────────────────────
function screen1() {
  const popup = `
    <div class="topbar">
      <span class="tb-ip">IP</span>
      <span class="tb-title">TypeScript</span>
      <div class="tb-actions">
        <div class="tb-icon"></div>
        <div class="tb-icon"></div>
        <div class="tb-icon"></div>
      </div>
    </div>
    <div class="content">
      <div class="scroll">
        <div>
          <div class="card-title">Progress</div>
          <div class="stat-grid">
            <div class="stat-cell"><div class="stat-n">155</div><div class="stat-l">Questions</div></div>
            <div class="stat-cell"><div class="stat-n">42</div><div class="stat-l">Attempted</div></div>
            <div class="stat-cell"><div class="stat-n blue">78%</div><div class="stat-l">Score</div></div>
          </div>
          <div class="scorebar"><div class="scorebar-fill" style="width:78%"></div></div>
        </div>

        <div>
          <div class="card-title">Topics</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div class="subject-row">
              <div><div class="subject-name">TypeScript Basics</div><div class="subject-sub">25 questions</div></div>
              <span class="chevron">›</span>
            </div>
            <div class="subject-row">
              <div><div class="subject-name">Interfaces & Types</div><div class="subject-sub">25 questions</div></div>
              <span class="chevron">›</span>
            </div>
            <div class="subject-row">
              <div><div class="subject-name">Functions</div><div class="subject-sub">25 questions</div></div>
              <span class="chevron">›</span>
            </div>
            <div class="subject-row">
              <div><div class="subject-name">Generics</div><div class="subject-sub">25 questions</div></div>
              <span class="chevron">›</span>
            </div>
            <div class="subject-row" style="border-color:#1e3a5f40;">
              <div><div class="subject-name" style="color:#f59e0b;">⚠ Advanced Types</div><div class="subject-sub">Weak area — 48%</div></div>
              <span class="chevron">›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="bottomnav">
      <div class="nav-item active"><span class="nav-icon">⌂</span><span class="nav-label">Home</span></div>
      <div class="nav-item"><span class="nav-icon">📖</span><span class="nav-label">Subjects</span></div>
      <div class="nav-item"><span class="nav-icon">📊</span><span class="nav-label">Progress</span></div>
      <div class="nav-item"><span class="nav-icon">🔖</span><span class="nav-label">Bookmarks</span></div>
    </div>`
  return shell('Home — Subject Progress & Topics', popup)
}

// ─── Screen 2: Study mode — question with answer revealed ─────────────────────
function screen2() {
  const popup = `
    <div class="topbar">
      <span style="color:${BLUE_L};font-size:15px;">←</span>
      <span class="tb-title" style="margin-left:6px;">TypeScript Basics</span>
      <div class="tb-actions"><div class="tb-icon"></div></div>
    </div>
    <div class="content">
      <div class="scroll">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 0;">
          <span style="font-size:11px;color:${TEXT_G};">Question 3 of 25</span>
          <span style="font-size:10px;color:${TEXT_D};font-weight:600;letter-spacing:0.06em;">BEGINNER</span>
        </div>

        <div class="q-card">
          <div class="q-meta">
            <span class="badge badge-blue">Single choice</span>
            <span class="badge badge-green">Beginner</span>
          </div>
          <div class="q-text">What is the difference between <code style="background:#1e293b;padding:1px 5px;border-radius:3px;color:#93c5fd;font-family:monospace;">type</code> and <code style="background:#1e293b;padding:1px 5px;border-radius:3px;color:#93c5fd;font-family:monospace;">interface</code> in TypeScript?</div>

          <div class="option correct">
            <div class="option-bullet correct">✓</div>
            <div class="option-text">Both can define object shapes; interfaces support declaration merging while types can define unions, intersections, and mapped types</div>
          </div>
          <div class="option wrong">
            <div class="option-bullet wrong">✗</div>
            <div class="option-text">Types are only for primitives; interfaces are for objects</div>
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
          Both <code style="color:#86efac;">type</code> and <code style="color:#86efac;">interface</code> can describe object shapes and are largely interchangeable. Key differences: interfaces support declaration merging (you can reopen and extend them), while type aliases support unions, intersections, conditional types, and mapped types. Prefer interfaces for public API shapes; prefer types for complex type manipulations.
        </div>

        <div style="display:flex;gap:8px;margin-top:4px;">
          <button style="flex:1;padding:10px;background:${BG_CARD};border:1px solid ${BORDER};border-radius:8px;color:${TEXT_G};font-size:12px;font-weight:600;cursor:pointer;">← Previous</button>
          <button style="flex:1;padding:10px;background:${BLUE};border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;">Next →</button>
        </div>
      </div>
    </div>
    <div class="bottomnav">
      <div class="nav-item active"><span class="nav-icon">⌂</span><span class="nav-label">Home</span></div>
      <div class="nav-item"><span class="nav-icon">📖</span><span class="nav-label">Subjects</span></div>
      <div class="nav-item"><span class="nav-icon">📊</span><span class="nav-label">Progress</span></div>
      <div class="nav-item"><span class="nav-icon">🔖</span><span class="nav-label">Bookmarks</span></div>
    </div>`
  return shell('Study Mode — Questions with Explanations', popup)
}

// ─── Screen 3: Interview simulation — code question ───────────────────────────
function screen3() {
  const popup = `
    <div class="topbar">
      <span style="color:${BLUE_L};font-size:15px;">←</span>
      <span class="tb-title" style="margin-left:6px;">Interview</span>
      <div class="tb-actions"><div class="tb-icon"></div></div>
    </div>
    <div class="content">
      <div class="scroll">
        <div class="timer-row">
          <div>
            <div class="timer">12:34</div>
            <div style="font-size:10px;color:${TEXT_G};margin-top:2px;">Time remaining</div>
          </div>
          <div style="text-align:right;">
            <div class="q-counter" style="font-size:14px;font-weight:700;color:${TEXT_W};">7 / 20</div>
            <div style="font-size:10px;color:${TEXT_G};">Questions</div>
          </div>
        </div>

        <div class="q-card">
          <div class="q-meta">
            <span class="badge badge-blue">Code</span>
            <span class="badge badge-amber">Intermediate</span>
          </div>
          <div class="q-text">What will the following code output, and why?</div>
          <div class="code-block"><span class="code-kw">async function</span> <span style="color:#60a5fa;">fetchData</span>() {
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
            <div class="option-text">Both promises are retried automatically</div>
          </div>
          <div class="option">
            <div class="option-bullet"></div>
            <div class="option-text">An empty array is returned</div>
          </div>
        </div>

        <button class="submit-btn">Submit Answer</button>
      </div>
    </div>
    <div class="bottomnav">
      <div class="nav-item active"><span class="nav-icon">⌂</span><span class="nav-label">Home</span></div>
      <div class="nav-item"><span class="nav-icon">📖</span><span class="nav-label">Subjects</span></div>
      <div class="nav-item"><span class="nav-icon">📊</span><span class="nav-label">Progress</span></div>
      <div class="nav-item"><span class="nav-icon">🔖</span><span class="nav-label">Bookmarks</span></div>
    </div>`
  return shell('Interview Simulation — Timed Practice Sessions', popup)
}

// ─── Screen 4: Subjects selection ────────────────────────────────────────────
function screen4() {
  const popup = `
    <div class="topbar">
      <div style="width:20px;"></div>
      <span class="tb-title">Subjects</span>
      <div class="tb-actions"><div class="tb-icon"></div></div>
    </div>
    <div class="content">
      <div class="scroll">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div class="subject-row" style="padding:16px 14px;border-color:${BLUE_DIM};">
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <div class="subject-name">TypeScript</div>
              </div>
              <div style="font-size:11px;color:${TEXT_G};line-height:1.5;max-width:280px;">Types, generics, classes, advanced patterns & compiler</div>
              <div style="font-size:10px;color:${TEXT_D};margin-top:4px;">155 questions</div>
            </div>
            <span class="chevron">›</span>
          </div>
          <div class="subject-row" style="padding:16px 14px;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <div class="subject-name">Node.js</div>
              </div>
              <div style="font-size:11px;color:${TEXT_G};line-height:1.5;max-width:280px;">Event loop, streams, Express, async patterns & core modules</div>
              <div style="font-size:10px;color:${TEXT_D};margin-top:4px;">150 questions</div>
            </div>
            <span class="chevron">›</span>
          </div>
          <div class="subject-row" style="padding:16px 14px;">
            <div>
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <div class="subject-name">DevOps</div>
              </div>
              <div style="font-size:11px;color:${TEXT_G};line-height:1.5;max-width:280px;">Docker, Kubernetes, CI/CD, Linux, Terraform & monitoring</div>
              <div style="font-size:10px;color:${TEXT_D};margin-top:4px;">150 questions</div>
            </div>
            <span class="chevron">›</span>
          </div>

          <div style="border:1px dashed ${TEXT_D};border-radius:10px;padding:14px;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;">
            <span style="font-size:14px;">+</span>
            <span style="font-size:12px;color:${TEXT_G};font-weight:500;">Upload Custom Subject JSON</span>
          </div>
        </div>
      </div>
    </div>
    <div class="bottomnav">
      <div class="nav-item"><span class="nav-icon">⌂</span><span class="nav-label">Home</span></div>
      <div class="nav-item active"><span class="nav-icon">📖</span><span class="nav-label">Subjects</span></div>
      <div class="nav-item"><span class="nav-icon">📊</span><span class="nav-label">Progress</span></div>
      <div class="nav-item"><span class="nav-icon">🔖</span><span class="nav-label">Bookmarks</span></div>
    </div>`
  return shell('3 Built-in Subjects + Upload Your Own', popup)
}

// ─── Screen 5: Interview results ──────────────────────────────────────────────
function screen5() {
  const popup = `
    <div class="topbar">
      <div style="width:20px;"></div>
      <span class="tb-title">Results</span>
      <div class="tb-actions"><div class="tb-icon"></div></div>
    </div>
    <div class="content">
      <div class="scroll">
        <div style="text-align:center;padding:8px 0 4px;">
          <div style="font-size:52px;font-weight:900;color:${BLUE};letter-spacing:-0.03em;line-height:1;">82%</div>
          <div style="font-size:12px;color:${TEXT_G};margin-top:4px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Interview Score</div>
          <div style="display:flex;justify-content:center;gap:20px;margin-top:12px;">
            <div style="text-align:center;">
              <div style="font-size:20px;font-weight:800;color:${GREEN};">16</div>
              <div style="font-size:10px;color:${TEXT_G};">Correct</div>
            </div>
            <div style="width:1px;background:${BORDER};"></div>
            <div style="text-align:center;">
              <div style="font-size:20px;font-weight:800;color:${RED};">4</div>
              <div style="font-size:10px;color:${TEXT_G};">Wrong</div>
            </div>
            <div style="width:1px;background:${BORDER};"></div>
            <div style="text-align:center;">
              <div style="font-size:20px;font-weight:800;color:${AMBER};">18:22</div>
              <div style="font-size:10px;color:${TEXT_G};">Time</div>
            </div>
          </div>
        </div>

        <div>
          <div class="card-title">Performance by Topic</div>
          <div class="card">
            <div class="topic-row">
              <span class="topic-name">TypeScript Basics</span>
              <div class="topic-bar"><div class="topic-fill" style="width:100%;background:${GREEN};"></div></div>
              <span class="topic-pct" style="color:${GREEN};">100%</span>
            </div>
            <div class="topic-row">
              <span class="topic-name">Interfaces & Types</span>
              <div class="topic-bar"><div class="topic-fill" style="width:80%;background:${BLUE};"></div></div>
              <span class="topic-pct" style="color:${BLUE};">80%</span>
            </div>
            <div class="topic-row">
              <span class="topic-name">Generics</span>
              <div class="topic-bar"><div class="topic-fill" style="width:75%;background:${BLUE};"></div></div>
              <span class="topic-pct" style="color:${BLUE};">75%</span>
            </div>
            <div class="topic-row">
              <span class="topic-name">Advanced Types</span>
              <div class="topic-bar"><div class="topic-fill" style="width:50%;background:${AMBER};"></div></div>
              <span class="topic-pct" style="color:${AMBER};">50%</span>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:8px;">
          <button style="flex:1;padding:10px;background:${BG_CARD};border:1px solid ${BORDER};border-radius:8px;color:${TEXT_G};font-size:12px;font-weight:600;">Review Answers</button>
          <button style="flex:1;padding:10px;background:${BLUE};border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:600;">New Interview</button>
        </div>
      </div>
    </div>
    <div class="bottomnav">
      <div class="nav-item active"><span class="nav-icon">⌂</span><span class="nav-label">Home</span></div>
      <div class="nav-item"><span class="nav-icon">📖</span><span class="nav-label">Subjects</span></div>
      <div class="nav-item"><span class="nav-icon">📊</span><span class="nav-label">Progress</span></div>
      <div class="nav-item"><span class="nav-icon">🔖</span><span class="nav-label">Bookmarks</span></div>
    </div>`
  return shell('Interview Results — Detailed Score Breakdown', popup)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1280, height: 800 })

  const screens = [
    { name: 'screenshot-1-home.png',        html: screen1() },
    { name: 'screenshot-2-study.png',        html: screen2() },
    { name: 'screenshot-3-interview.png',    html: screen3() },
    { name: 'screenshot-4-subjects.png',     html: screen4() },
    { name: 'screenshot-5-results.png',      html: screen5() },
  ]

  for (const { name, html } of screens) {
    await page.setContent(html, { waitUntil: 'networkidle' })
    await page.screenshot({ path: join(OUT_DIR, name), clip: { x: 0, y: 0, width: 1280, height: 800 } })
    console.log(`✓ ${name}`)
  }

  await browser.close()
  console.log(`\nAll screenshots saved to store-assets/ (1280×800)`)
}

main().catch(console.error)
