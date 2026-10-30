/**
 * Generates Chrome Web Store assets using Playwright:
 * - Extension icons: 16, 32, 48, 128 px
 * - App Store icon: 1024×1024 (no rounded corners — for Safari/App Store)
 * - Small promo tile: 440×280
 * - Large promo tile: 920×680
 * - Marquee image: 1400×560
 *
 * Subject names and counts are read dynamically from public/registry.json
 * so promo assets stay accurate as new subjects are added.
 *
 * Run: node scripts/generate-store-assets.mjs
 */

import { chromium } from 'playwright'
import { mkdirSync, copyFileSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'store-assets')
const ICONS_DIR = join(ROOT, 'public', 'icons')
mkdirSync(OUT_DIR, { recursive: true })
mkdirSync(ICONS_DIR, { recursive: true })

// ─── Read subjects dynamically from registry ──────────────────────────────────
const registry = JSON.parse(readFileSync(join(ROOT, 'public', 'registry.json'), 'utf8'))
const SUBJECTS = registry.subjects
const TOTAL_QUESTIONS = SUBJECTS.reduce((sum, s) => sum + s.questionCount, 0)
const TOTAL_QUESTIONS_LABEL = `${Math.floor(TOTAL_QUESTIONS / 50) * 50}+`

// ─── Design tokens (light mode) ───────────────────────────────────────────────
const BG_DEEP     = '#f1f5f9'   // slate-100
const BG_NAVY     = '#0c1628'   // kept dark for icons only
const BG_CARD     = '#ffffff'
const BLUE_BRIGHT = '#3b82f6'
const BLUE_LIGHT  = '#60a5fa'
const BLUE_DIM    = '#bfdbfe'   // blue-200
const BLUE_BG     = '#eff6ff'   // blue-50
const TEXT_WHITE  = '#0f172a'   // slate-900 (dark text on light bg)
const TEXT_GRAY   = '#64748b'   // slate-500
const AMBER       = '#f59e0b'
const BORDER      = '#e2e8f0'   // slate-200

// ─── Icon HTML — bold, high-contrast, visible at 16 px in Chrome toolbar ─────
function iconHtml(size) {
  const r = Math.round(size * 0.22)
  const ipSize = size <= 16 ? Math.round(size * 0.56) : Math.round(size * 0.50)
  const prepSize = Math.round(size * 0.13)
  const dotR = Math.round(size * 0.10)
  const dotOff = Math.round(size * 0.06)
  // Slightly larger text for 16 px readability; tight letter-spacing at all sizes
  const letterSpacing = size <= 16 ? '-0.02em' : '-0.05em'

  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:${size}px; height:${size}px; overflow:hidden; }
    body {
      background: linear-gradient(145deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      border-radius: ${r}px;
      font-family: 'Segoe UI', Arial, system-ui, sans-serif;
      position: relative;
    }
    .letters {
      font-size: ${ipSize}px;
      font-weight: 900;
      letter-spacing: ${letterSpacing};
      color: #ffffff;
      line-height: 1;
      z-index: 1;
      text-shadow: 0 1px ${Math.max(1, Math.round(size * 0.04))}px rgba(0,0,0,0.4);
    }
    ${size >= 48 ? `.prep {
      font-size: ${prepSize}px;
      font-weight: 700;
      letter-spacing: 0.18em;
      color: rgba(255,255,255,0.70);
      margin-top: ${Math.round(size * 0.02)}px;
      z-index: 1;
    }` : ''}
    .dot {
      width: ${dotR}px; height: ${dotR}px;
      background: ${AMBER};
      border-radius: 50%;
      position: absolute;
      bottom: ${dotOff}px; right: ${dotOff}px;
      box-shadow: 0 0 ${Math.max(2, Math.round(size * 0.06))}px ${AMBER}99;
    }
  </style>
  </head><body>
    <div class="letters">IP</div>
    ${size >= 48 ? `<div class="prep">PREP</div>` : ''}
    <div class="dot"></div>
  </body></html>`
}

// ─── App Store icon 1024×1024 (no border-radius — Apple applies its own mask) ─
function appStoreIconHtml() {
  const size = 1024
  const ipSize = Math.round(size * 0.42)
  const prepSize = Math.round(size * 0.11)
  const dotR = Math.round(size * 0.08)
  const dotOff = Math.round(size * 0.06)
  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:${size}px; height:${size}px; overflow:hidden; }
    body {
      background: linear-gradient(145deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: 'Segoe UI', Arial, system-ui, sans-serif;
      position: relative;
    }
    .letters { font-size:${ipSize}px; font-weight:900; letter-spacing:-0.05em; color:#fff; line-height:1; z-index:1;
      text-shadow: 0 6px 24px rgba(0,0,0,0.35); }
    .prep { font-size:${prepSize}px; font-weight:700; letter-spacing:0.22em; color:rgba(255,255,255,0.72);
      margin-top:${Math.round(size*0.025)}px; z-index:1; }
    .dot { width:${dotR}px; height:${dotR}px; background:${AMBER}; border-radius:50%;
      position:absolute; bottom:${dotOff}px; right:${dotOff}px;
      box-shadow:0 0 ${Math.round(size*0.05)}px ${AMBER}99; }
  </style>
  </head><body>
    <div class="letters">IP</div>
    <div class="prep">PREP</div>
    <div class="dot"></div>
  </body></html>`
}

// ─── Small promo tile 440×280 (light mode) ───────────────────────────────────
function smallPromoHtml() {
  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:440px; height:280px; overflow:hidden; }
    body {
      background: #ffffff;
      display: flex; align-items: center; justify-content: space-between;
      padding: 32px 36px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      position: relative;
      border: 1px solid ${BORDER};
    }
    .accent-bar { position:absolute; top:0; left:0; right:0; height:4px;
      background:linear-gradient(90deg,${BLUE_BRIGHT},${BLUE_LIGHT},${AMBER}); }
    .left { display: flex; flex-direction: column; gap: 10px; z-index: 1; }
    .logo { display: flex; align-items: center; gap: 8px; }
    .logo-ip {
      font-size: 32px; font-weight: 900; letter-spacing: -0.03em;
      background: linear-gradient(135deg, ${BLUE_BRIGHT}, ${BLUE_LIGHT});
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .logo-dot { width: 7px; height: 7px; border-radius: 50%; background: ${AMBER}; flex-shrink:0; }
    .name { font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; text-transform: uppercase; }
    .tagline { font-size: 12px; color: ${TEXT_GRAY}; max-width: 190px; line-height: 1.55; }
    .count { font-size: 28px; font-weight: 900; color: ${BLUE_BRIGHT}; letter-spacing: -0.02em; margin-top:4px; }
    .count-label { font-size: 10px; color: ${TEXT_GRAY}; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
    .right { display: flex; flex-direction: column; gap: 7px; z-index: 1; }
    .badge {
      background: ${BLUE_BG};
      border: 1px solid ${BLUE_DIM};
      border-radius: 8px;
      padding: 7px 14px;
      font-size: 12px; font-weight: 600; color: ${BLUE_BRIGHT};
      display: flex; align-items: center; gap: 7px;
    }
    .badge-dot { width: 5px; height: 5px; border-radius: 50%; background: ${BLUE_BRIGHT}; flex-shrink:0; }
    .offline-tag { font-size:10px; color:${TEXT_GRAY}; text-align:right; letter-spacing:0.07em; text-transform:uppercase; margin-top:4px; }
  </style>
  </head><body>
    <div class="accent-bar"></div>
    <div class="left">
      <div class="logo">
        <span class="logo-ip">IP</span>
        <div class="logo-dot"></div>
      </div>
      <div class="name">InterviewPrep</div>
      <div class="tagline">Master technical interviews. Study offline, track progress.</div>
      <div>
        <div class="count">${TOTAL_QUESTIONS_LABEL}</div>
        <div class="count-label">Practice Questions</div>
      </div>
    </div>
    <div class="right">
      ${SUBJECTS.slice(0, 4).map(s => `<div class="badge"><div class="badge-dot"></div>${s.name}</div>`).join('\n      ')}
      ${SUBJECTS.length > 4 ? `<div class="badge"><div class="badge-dot"></div>+${SUBJECTS.length - 4} more</div>` : ''}
      <div class="offline-tag">100% Offline</div>
    </div>
  </body></html>`
}

// ─── Large promo tile 920×680 (light mode) ───────────────────────────────────
function largePromoHtml() {
  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:920px; height:680px; overflow:hidden; }
    body {
      background: #ffffff;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: 'Segoe UI', system-ui, sans-serif;
      position: relative; gap: 0;
      border: 1px solid ${BORDER};
    }
    .accent-bar { position:absolute; top:0; left:0; right:0; height:5px;
      background:linear-gradient(90deg,${BLUE_BRIGHT},${BLUE_LIGHT},${AMBER}); }

    .header { display:flex; flex-direction:column; align-items:center; gap:12px; z-index:1; margin-bottom:36px; }
    .logo-row { display:flex; align-items:center; gap:14px; }
    .logo-ip { font-size:64px; font-weight:900; letter-spacing:-0.04em;
      background: linear-gradient(135deg, ${BLUE_BRIGHT}, ${BLUE_LIGHT});
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1; }
    .logo-dot { width:10px; height:10px; border-radius:50%; background:${AMBER}; flex-shrink:0; }
    .logo-text { display:flex; flex-direction:column; }
    .logo-name { font-size:28px; font-weight:800; color:#0f172a; letter-spacing:0.02em; }
    .logo-sub  { font-size:12px; color:${TEXT_GRAY}; letter-spacing:0.12em; text-transform:uppercase; margin-top:3px; }

    .tagline { font-size:18px; font-weight:400; color:#475569; max-width:580px; text-align:center; line-height:1.5; }

    .stat-row { display:flex; gap:0; z-index:1; margin-bottom:36px;
      background:${BLUE_BG}; border:1px solid ${BLUE_DIM}; border-radius:14px; overflow:hidden; }
    .stat { text-align:center; padding:18px 40px; }
    .stat-n { font-size:44px; font-weight:900; color:${BLUE_BRIGHT}; letter-spacing:-0.03em; line-height:1; }
    .stat-l { font-size:11px; color:${TEXT_GRAY}; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; margin-top:5px; }
    .stat-div { width:1px; background:${BLUE_DIM}; margin:12px 0; }

    .cards { display:flex; gap:14px; z-index:1; margin-bottom:32px; }
    .card {
      background: #ffffff;
      border: 1.5px solid ${BORDER};
      border-radius: 14px;
      padding: 20px 22px;
      width: 190px;
      display: flex; flex-direction: column; gap: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .card-icon { font-size: 26px; }
    .card-title { font-size: 14px; font-weight: 700; color: #0f172a; }
    .card-desc  { font-size: 11px; color: ${TEXT_GRAY}; line-height: 1.5; }

    .features { display:flex; gap:24px; z-index:1; }
    .feat { display:flex; align-items:center; gap:8px; }
    .feat-dot { width:6px; height:6px; border-radius:50%; background:${BLUE_BRIGHT}; flex-shrink:0; }
    .feat-text { font-size:12px; color:#475569; font-weight:500; }
  </style>
  </head><body>
    <div class="accent-bar"></div>

    <div class="header">
      <div class="logo-row">
        <div class="logo-ip">IP</div>
        <div class="logo-dot"></div>
        <div class="logo-text">
          <span class="logo-name">InterviewPrep</span>
          <span class="logo-sub">Chrome Extension</span>
        </div>
      </div>
      <div class="tagline">Ace your technical interviews — study offline, track progress, simulate real interview sessions</div>
    </div>

    <div class="stat-row">
      <div class="stat"><div class="stat-n">${TOTAL_QUESTIONS_LABEL}</div><div class="stat-l">Questions</div></div>
      <div class="stat-div"></div>
      <div class="stat"><div class="stat-n">${SUBJECTS.length}</div><div class="stat-l">Subjects</div></div>
      <div class="stat-div"></div>
      <div class="stat"><div class="stat-n">100%</div><div class="stat-l">Offline</div></div>
    </div>

    <div class="cards">
      ${SUBJECTS.slice(0, 4).map(s => `<div class="card">
        <div class="card-icon">📚</div>
        <div class="card-title">${s.name}</div>
        <div class="card-desc">${s.questionCount} questions · ${s.topicCount} topics</div>
      </div>`).join('\n      ')}
      ${SUBJECTS.length > 4 ? `<div class="card">
        <div class="card-icon">➕</div>
        <div class="card-title">+${SUBJECTS.length - 4} more</div>
        <div class="card-desc">More subjects available to download</div>
      </div>` : ''}
    </div>

    <div class="features">
      <div class="feat"><div class="feat-dot"></div><span class="feat-text">Study mode</span></div>
      <div class="feat"><div class="feat-dot"></div><span class="feat-text">Interview simulation</span></div>
      <div class="feat"><div class="feat-dot"></div><span class="feat-text">Progress tracking</span></div>
      <div class="feat"><div class="feat-dot"></div><span class="feat-text">Bookmarks</span></div>
      <div class="feat"><div class="feat-dot"></div><span class="feat-text">Upload custom subjects</span></div>
    </div>
  </body></html>`
}

// ─── Marquee 1400×560 (light mode) ───────────────────────────────────────────
function marqueeHtml() {
  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:1400px; height:560px; overflow:hidden; }
    body {
      background: #ffffff;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 80px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      position: relative;
      border: 1px solid ${BORDER};
    }
    .accent-bar { position:absolute; top:0; left:0; right:0; height:5px;
      background:linear-gradient(90deg,${BLUE_BRIGHT},${BLUE_LIGHT},${AMBER}); }
    .accent-bottom { position:absolute; bottom:0; left:0; right:0; height:1px; background:${BORDER}; }

    .left { display:flex; flex-direction:column; gap:22px; z-index:1; max-width:520px; }
    .logo-row { display:flex; align-items:center; gap:14px; }
    .logo-ip { font-size:80px; font-weight:900; letter-spacing:-0.05em;
      background:linear-gradient(135deg, ${BLUE_BRIGHT}, ${BLUE_LIGHT});
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1; }
    .logo-dot { width:10px; height:10px; border-radius:50%; background:${AMBER}; flex-shrink:0; align-self:flex-end; margin-bottom:10px; }
    .logo-vr { width:2px; height:52px; background:${BORDER}; }
    .logo-name { font-size:32px; font-weight:800; color:#0f172a; letter-spacing:0.02em; }
    .logo-sub  { font-size:13px; color:${TEXT_GRAY}; letter-spacing:0.14em; text-transform:uppercase; margin-top:3px; }
    .headline { font-size:22px; font-weight:400; color:#475569; line-height:1.55; }
    .headline strong { color:#0f172a; font-weight:700; }
    .pills { display:flex; gap:10px; flex-wrap:wrap; }
    .pill { background:${BLUE_BG}; border:1px solid ${BLUE_DIM}; border-radius:20px;
      padding:6px 16px; font-size:13px; font-weight:600; color:${BLUE_BRIGHT}; }

    .right { display:flex; gap:18px; z-index:1; }
    .col { display:flex; flex-direction:column; gap:14px; }
    .stat-card {
      background:#f8fafc; border:1.5px solid ${BORDER}; border-radius:14px;
      padding:18px 24px; min-width:160px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .stat-n { font-size:44px; font-weight:900; color:${BLUE_BRIGHT}; letter-spacing:-0.03em; line-height:1; }
    .stat-l { font-size:11px; color:${TEXT_GRAY}; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; margin-top:5px; }
    .feat-card {
      background:#f8fafc; border:1.5px solid ${BORDER}; border-radius:14px;
      padding:16px 20px; display:flex; flex-direction:column; gap:10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .feat-item { display:flex; align-items:center; gap:10px; }
    .feat-dot { width:6px; height:6px; border-radius:50%; background:${BLUE_BRIGHT}; flex-shrink:0; }
    .feat-text { font-size:13px; color:#475569; font-weight:500; }
  </style>
  </head><body>
    <div class="accent-bar"></div>
    <div class="accent-bottom"></div>

    <div class="left">
      <div class="logo-row">
        <span class="logo-ip">IP</span>
        <div class="logo-dot"></div>
        <div class="logo-vr"></div>
        <div>
          <div class="logo-name">InterviewPrep</div>
          <div class="logo-sub">Chrome Extension</div>
        </div>
      </div>
      <div class="headline">
        <strong>Ace your next technical interview.</strong><br/>
        Study offline, track progress, and simulate real interview sessions.
      </div>
      <div class="pills">
        ${SUBJECTS.slice(0, 5).map(s => `<span class="pill">${s.name}</span>`).join('\n        ')}
        ${SUBJECTS.length > 5 ? `<span class="pill">+${SUBJECTS.length - 5} more</span>` : ''}
        <span class="pill">+ Upload your own</span>
      </div>
    </div>

    <div class="right">
      <div class="col">
        <div class="stat-card">
          <div class="stat-n">${TOTAL_QUESTIONS_LABEL}</div>
          <div class="stat-l">Questions</div>
        </div>
        <div class="stat-card">
          <div class="stat-n">100%</div>
          <div class="stat-l">Offline</div>
        </div>
      </div>
      <div class="col">
        <div class="feat-card">
          <div class="feat-item"><div class="feat-dot"></div><span class="feat-text">Flashcard study mode</span></div>
          <div class="feat-item"><div class="feat-dot"></div><span class="feat-text">Interview simulation</span></div>
          <div class="feat-item"><div class="feat-dot"></div><span class="feat-text">Progress &amp; weak areas</span></div>
          <div class="feat-item"><div class="feat-dot"></div><span class="feat-text">Bookmarks</span></div>
          <div class="feat-item"><div class="feat-dot"></div><span class="feat-text">Custom subject packs</span></div>
          <div class="feat-item"><div class="feat-dot"></div><span class="feat-text">Least-seen first sort</span></div>
        </div>
      </div>
    </div>
  </body></html>`
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Extension icons — written to store-assets/ AND public/icons/
  const iconSizes = [16, 32, 48, 128]
  for (const size of iconSizes) {
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(iconHtml(size), { waitUntil: 'networkidle' })
    const storeOut = join(OUT_DIR, `icon-${size}.png`)
    await page.screenshot({ path: storeOut, clip: { x: 0, y: 0, width: size, height: size } })
    const publicOut = join(ICONS_DIR, `icon-${size}.png`)
    copyFileSync(storeOut, publicOut)
    console.log(`✓ icon-${size}.png  →  store-assets/  +  public/icons/`)
  }

  // App Store icon 1024×1024 (no border-radius — Safari / Mac App Store)
  await page.setViewportSize({ width: 1024, height: 1024 })
  await page.setContent(appStoreIconHtml(), { waitUntil: 'networkidle' })
  await page.screenshot({ path: join(OUT_DIR, 'icon-1024-appstore.png'), clip: { x: 0, y: 0, width: 1024, height: 1024 } })
  console.log('✓ icon-1024-appstore.png  (Safari / Mac App Store)')

  // Small promo tile 440×280
  await page.setViewportSize({ width: 440, height: 280 })
  await page.setContent(smallPromoHtml(), { waitUntil: 'networkidle' })
  await page.screenshot({ path: join(OUT_DIR, 'promo-small-440x280.png'), clip: { x: 0, y: 0, width: 440, height: 280 } })
  console.log('✓ promo-small-440x280.png')

  // Large promo tile 920×680
  await page.setViewportSize({ width: 920, height: 680 })
  await page.setContent(largePromoHtml(), { waitUntil: 'networkidle' })
  await page.screenshot({ path: join(OUT_DIR, 'promo-large-920x680.png'), clip: { x: 0, y: 0, width: 920, height: 680 } })
  console.log('✓ promo-large-920x680.png')

  // Marquee 1400×560
  await page.setViewportSize({ width: 1400, height: 560 })
  await page.setContent(marqueeHtml(), { waitUntil: 'networkidle' })
  await page.screenshot({ path: join(OUT_DIR, 'promo-marquee-1400x560.png'), clip: { x: 0, y: 0, width: 1400, height: 560 } })
  console.log('✓ promo-marquee-1400x560.png')

  await browser.close()

  console.log(`\nAll assets saved to: store-assets/`)
  console.log(`\nSubjects included: ${SUBJECTS.map(s => s.name).join(', ')}`)
  console.log(`Total questions: ${TOTAL_QUESTIONS_LABEL}`)
  console.log('\nChrome Web Store:')
  console.log('  Icons:       icon-16.png, icon-32.png, icon-48.png, icon-128.png')
  console.log('  Small tile:  promo-small-440x280.png')
  console.log('  Large tile:  promo-large-920x680.png')
  console.log('  Marquee:     promo-marquee-1400x560.png')
  console.log('\nSafari / Mac App Store:')
  console.log('  App icon:    icon-1024-appstore.png  (1024×1024, no alpha)')
}

main().catch(console.error)
