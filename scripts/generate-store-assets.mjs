/**
 * Generates Chrome Web Store assets using Playwright:
 * - Extension icons: 16, 32, 48, 128 px
 * - Small promo tile: 440×280
 * - Large promo tile: 920×680
 * - Marquee image: 1400×560
 *
 * Run: node scripts/generate-store-assets.mjs
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'store-assets')
mkdirSync(OUT_DIR, { recursive: true })

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG_DEEP     = '#060e1a'
const BG_NAVY     = '#0c1628'
const BG_CARD     = '#0f1f36'
const BLUE_BRIGHT = '#3b82f6'
const BLUE_LIGHT  = '#60a5fa'
const BLUE_DIM    = '#1e3a5f'
const TEXT_WHITE  = '#f1f5f9'
const TEXT_GRAY   = '#94a3b8'
const AMBER       = '#f59e0b'

// ─── Icon HTML (renders at any size) ─────────────────────────────────────────
function iconHtml(size) {
  const r = Math.round(size * 0.18)   // border-radius
  const pad = Math.round(size * 0.1)
  const ipSize = Math.round(size * 0.44)
  const prepSize = Math.round(size * 0.14)
  const dotSize = Math.round(size * 0.07)

  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:${size}px; height:${size}px; overflow:hidden; }
    body {
      background: linear-gradient(145deg, ${BG_NAVY} 0%, ${BG_DEEP} 100%);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      border-radius: ${r}px;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    .ring {
      position: absolute;
      width: ${Math.round(size * 0.88)}px;
      height: ${Math.round(size * 0.88)}px;
      border: ${Math.max(1, Math.round(size * 0.025))}px solid ${BLUE_BRIGHT}22;
      border-radius: 50%;
    }
    .letters {
      font-size: ${ipSize}px;
      font-weight: 900;
      letter-spacing: -0.04em;
      background: linear-gradient(135deg, ${BLUE_BRIGHT} 0%, ${BLUE_LIGHT} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      z-index: 1;
    }
    ${size >= 48 ? `.prep {
      font-size: ${prepSize}px;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: ${TEXT_GRAY};
      margin-top: ${Math.round(size * 0.02)}px;
      z-index: 1;
    }` : ''}
    .dot {
      width: ${dotSize}px; height: ${dotSize}px;
      background: ${AMBER};
      border-radius: 50%;
      position: absolute;
      bottom: ${pad}px; right: ${pad}px;
    }
  </style>
  </head><body>
    <div class="ring"></div>
    <div class="letters">IP</div>
    ${size >= 48 ? `<div class="prep">PREP</div>` : ''}
    <div class="dot"></div>
  </body></html>`
}

// ─── Small promo tile 440×280 ─────────────────────────────────────────────────
function smallPromoHtml() {
  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:440px; height:280px; overflow:hidden; }
    body {
      background: linear-gradient(135deg, ${BG_DEEP} 0%, #0a1830 50%, ${BG_DEEP} 100%);
      display: flex; align-items: center; justify-content: space-between;
      padding: 32px 36px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      position: relative;
    }
    .grid-bg {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(${BLUE_BRIGHT}08 1px, transparent 1px),
        linear-gradient(90deg, ${BLUE_BRIGHT}08 1px, transparent 1px);
      background-size: 40px 40px;
    }
    .glow {
      position: absolute; top: -60px; right: -60px;
      width: 260px; height: 260px;
      background: radial-gradient(circle, ${BLUE_BRIGHT}18 0%, transparent 70%);
      pointer-events: none;
    }
    .left { display: flex; flex-direction: column; gap: 10px; z-index: 1; }
    .logo { display: flex; align-items: baseline; gap: 6px; }
    .logo-ip {
      font-size: 32px; font-weight: 900; letter-spacing: -0.03em;
      background: linear-gradient(135deg, ${BLUE_BRIGHT}, ${BLUE_LIGHT});
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }
    .logo-dot { width: 7px; height: 7px; border-radius: 50%; background: ${AMBER}; margin-bottom: 2px; }
    .name { font-size: 13px; font-weight: 700; color: ${TEXT_WHITE}; letter-spacing: 0.06em; text-transform: uppercase; }
    .tagline { font-size: 11px; color: ${TEXT_GRAY}; max-width: 180px; line-height: 1.5; }
    .right { display: flex; flex-direction: column; gap: 7px; z-index: 1; }
    .badge {
      background: ${BG_CARD};
      border: 1px solid ${BLUE_DIM};
      border-radius: 8px;
      padding: 7px 12px;
      font-size: 11px; font-weight: 600; color: ${BLUE_LIGHT};
      display: flex; align-items: center; gap: 6px;
    }
    .badge-dot { width: 5px; height: 5px; border-radius: 50%; background: ${BLUE_BRIGHT}; flex-shrink:0; }
    .count { font-size: 26px; font-weight: 900; color: ${BLUE_BRIGHT}; letter-spacing: -0.02em; }
    .count-label { font-size: 10px; color: ${TEXT_GRAY}; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
  </style>
  </head><body>
    <div class="grid-bg"></div>
    <div class="glow"></div>
    <div class="left">
      <div class="logo">
        <span class="logo-ip">IP</span>
        <div class="logo-dot"></div>
      </div>
      <div class="name">InterviewPrep</div>
      <div class="tagline">Master technical interviews. Offline-first.</div>
      <div style="margin-top:4px; display:flex; flex-direction:column; gap:3px;">
        <div class="count">455+</div>
        <div class="count-label">Practice Questions</div>
      </div>
    </div>
    <div class="right">
      <div class="badge"><div class="badge-dot"></div>TypeScript</div>
      <div class="badge"><div class="badge-dot"></div>Node.js</div>
      <div class="badge"><div class="badge-dot"></div>DevOps</div>
      <div style="text-align:right; margin-top:4px;">
        <div style="font-size:9px; color:${TEXT_GRAY}; letter-spacing:0.08em; text-transform:uppercase;">Works offline</div>
      </div>
    </div>
  </body></html>`
}

// ─── Large promo tile 920×680 ─────────────────────────────────────────────────
function largePromoHtml() {
  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:920px; height:680px; overflow:hidden; }
    body {
      background: linear-gradient(135deg, ${BG_DEEP} 0%, #091422 60%, ${BG_DEEP} 100%);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: 'Segoe UI', system-ui, sans-serif;
      position: relative; gap: 0;
    }
    .grid-bg {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(${BLUE_BRIGHT}07 1px, transparent 1px),
        linear-gradient(90deg, ${BLUE_BRIGHT}07 1px, transparent 1px);
      background-size: 60px 60px;
    }
    .glow-l { position:absolute; top:-100px; left:-100px; width:500px; height:500px;
      background: radial-gradient(circle, ${BLUE_BRIGHT}12 0%, transparent 65%); }
    .glow-r { position:absolute; bottom:-100px; right:-100px; width:400px; height:400px;
      background: radial-gradient(circle, #7c3aed18 0%, transparent 65%); }

    .header { display:flex; flex-direction:column; align-items:center; gap:12px; z-index:1; margin-bottom:44px; }
    .logo-row { display:flex; align-items:center; gap:12px; }
    .logo-ip { font-size:72px; font-weight:900; letter-spacing:-0.04em;
      background: linear-gradient(135deg, ${BLUE_BRIGHT}, ${BLUE_LIGHT});
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1; }
    .logo-vr { width:2px; height:48px; background:${BLUE_DIM}; }
    .logo-text { display:flex; flex-direction:column; }
    .logo-name { font-size:28px; font-weight:800; color:${TEXT_WHITE}; letter-spacing:0.03em; }
    .logo-sub  { font-size:12px; color:${TEXT_GRAY}; letter-spacing:0.12em; text-transform:uppercase; margin-top:2px; }

    .tagline { font-size:20px; font-weight:500; color:${TEXT_GRAY}; letter-spacing:0.01em; }

    .cards { display:flex; gap:16px; z-index:1; margin-bottom:40px; }
    .card {
      background: ${BG_CARD};
      border: 1px solid ${BLUE_DIM};
      border-radius: 14px;
      padding: 20px 24px;
      width: 200px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .card-icon { font-size: 28px; }
    .card-title { font-size: 14px; font-weight: 700; color: ${TEXT_WHITE}; }
    .card-desc  { font-size: 11px; color: ${TEXT_GRAY}; line-height: 1.5; }

    .features { display:flex; gap:24px; z-index:1; }
    .feat { display:flex; align-items:center; gap:8px; }
    .feat-dot { width:6px; height:6px; border-radius:50%; background:${BLUE_BRIGHT}; flex-shrink:0; }
    .feat-text { font-size:12px; color:${TEXT_GRAY}; font-weight:500; }

    .stat-row { display:flex; gap:40px; z-index:1; margin-bottom:32px; }
    .stat { text-align:center; }
    .stat-n { font-size:48px; font-weight:900; color:${BLUE_BRIGHT}; letter-spacing:-0.03em; line-height:1; }
    .stat-l { font-size:11px; color:${TEXT_GRAY}; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; margin-top:4px; }
    .stat-div { width:1px; background:${BLUE_DIM}; }
  </style>
  </head><body>
    <div class="grid-bg"></div>
    <div class="glow-l"></div>
    <div class="glow-r"></div>

    <div class="header">
      <div class="logo-row">
        <div class="logo-ip">IP</div>
        <div class="logo-vr"></div>
        <div class="logo-text">
          <span class="logo-name">InterviewPrep</span>
          <span class="logo-sub">Chrome Extension</span>
        </div>
      </div>
      <div class="tagline">Ace your technical interviews — study offline, track progress, simulate interviews</div>
    </div>

    <div class="stat-row">
      <div class="stat"><div class="stat-n">455+</div><div class="stat-l">Questions</div></div>
      <div class="stat-div"></div>
      <div class="stat"><div class="stat-n">3</div><div class="stat-l">Subjects</div></div>
      <div class="stat-div"></div>
      <div class="stat"><div class="stat-n">100%</div><div class="stat-l">Offline</div></div>
    </div>

    <div class="cards">
      <div class="card">
        <div class="card-icon">📘</div>
        <div class="card-title">TypeScript</div>
        <div class="card-desc">Types, generics, advanced patterns & compiler internals</div>
      </div>
      <div class="card">
        <div class="card-icon">🟢</div>
        <div class="card-title">Node.js</div>
        <div class="card-desc">Event loop, streams, Express, core modules & async patterns</div>
      </div>
      <div class="card">
        <div class="card-icon">🐳</div>
        <div class="card-title">DevOps</div>
        <div class="card-desc">Docker, Kubernetes, CI/CD, Linux, Terraform & monitoring</div>
      </div>
    </div>

    <div class="features">
      <div class="feat"><div class="feat-dot"></div><span class="feat-text">Study mode</span></div>
      <div class="feat"><div class="feat-dot"></div><span class="feat-text">Interview simulation</span></div>
      <div class="feat"><div class="feat-dot"></div><span class="feat-text">Progress tracking</span></div>
      <div class="feat"><div class="feat-dot"></div><span class="feat-text">Bookmarks</span></div>
      <div class="feat"><div class="feat-dot"></div><span class="feat-text">Custom subjects</span></div>
    </div>
  </body></html>`
}

// ─── Marquee 1400×560 ─────────────────────────────────────────────────────────
function marqueeHtml() {
  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:1400px; height:560px; overflow:hidden; }
    body {
      background: linear-gradient(120deg, #04090f 0%, ${BG_DEEP} 35%, #081428 65%, #04090f 100%);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 80px;
      font-family: 'Segoe UI', system-ui, sans-serif;
      position: relative;
    }
    .grid-bg {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(${BLUE_BRIGHT}05 1px, transparent 1px),
        linear-gradient(90deg, ${BLUE_BRIGHT}05 1px, transparent 1px);
      background-size: 70px 70px;
    }
    .glow { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
      width:800px; height:800px;
      background:radial-gradient(circle, ${BLUE_BRIGHT}0c 0%, transparent 60%); }

    .left { display:flex; flex-direction:column; gap:20px; z-index:1; max-width:500px; }
    .logo-row { display:flex; align-items:center; gap:14px; }
    .logo-ip { font-size:80px; font-weight:900; letter-spacing:-0.05em;
      background:linear-gradient(135deg, ${BLUE_BRIGHT}, ${BLUE_LIGHT});
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1; }
    .logo-vr { width:2px; height:52px; background:${BLUE_DIM}; }
    .logo-name { font-size:32px; font-weight:800; color:${TEXT_WHITE}; letter-spacing:0.02em; }
    .logo-sub  { font-size:13px; color:${TEXT_GRAY}; letter-spacing:0.14em; text-transform:uppercase; margin-top:2px; }
    .headline { font-size:22px; font-weight:400; color:${TEXT_GRAY}; line-height:1.5; }
    .headline strong { color:${TEXT_WHITE}; font-weight:700; }
    .pills { display:flex; gap:10px; flex-wrap:wrap; }
    .pill { background:${BG_CARD}; border:1px solid ${BLUE_DIM}; border-radius:20px;
      padding:6px 14px; font-size:12px; font-weight:600; color:${BLUE_LIGHT}; }

    .right { display:flex; gap:20px; z-index:1; }
    .col { display:flex; flex-direction:column; gap:12px; }
    .stat-card {
      background:${BG_CARD}; border:1px solid ${BLUE_DIM}; border-radius:12px;
      padding:18px 22px; min-width:150px;
    }
    .stat-n { font-size:44px; font-weight:900; color:${BLUE_BRIGHT}; letter-spacing:-0.03em; line-height:1; }
    .stat-l { font-size:11px; color:${TEXT_GRAY}; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; margin-top:4px; }
    .feat-card {
      background:${BG_CARD}; border:1px solid ${BLUE_DIM}; border-radius:12px;
      padding:14px 18px; display:flex; flex-direction:column; gap:8px;
    }
    .feat-item { display:flex; align-items:center; gap:8px; }
    .feat-dot { width:5px; height:5px; border-radius:50%; background:${BLUE_BRIGHT}; flex-shrink:0; }
    .feat-text { font-size:12px; color:${TEXT_GRAY}; font-weight:500; }
  </style>
  </head><body>
    <div class="grid-bg"></div>
    <div class="glow"></div>

    <div class="left">
      <div class="logo-row">
        <span class="logo-ip">IP</span>
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
        <span class="pill">TypeScript</span>
        <span class="pill">Node.js</span>
        <span class="pill">DevOps</span>
        <span class="pill">+ Upload your own</span>
      </div>
    </div>

    <div class="right">
      <div class="col">
        <div class="stat-card">
          <div class="stat-n">455+</div>
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
          <div class="feat-item"><div class="feat-dot"></div><span class="feat-text">Progress & weak areas</span></div>
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

  // Extension icons
  const iconSizes = [16, 32, 48, 128]
  for (const size of iconSizes) {
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(iconHtml(size), { waitUntil: 'networkidle' })
    const out = join(OUT_DIR, `icon-${size}.png`)
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: size, height: size } })
    console.log(`✓ icon-${size}.png`)
  }

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
  console.log('\nWeb Store upload sizes:')
  console.log('  Icons:       icon-16.png, icon-32.png, icon-48.png, icon-128.png')
  console.log('  Small tile:  promo-small-440x280.png  (440×280)')
  console.log('  Large tile:  promo-large-920x680.png  (920×680)')
  console.log('  Marquee:     promo-marquee-1400x560.png (1400×560)')
  console.log('\nAdd icons to manifest.json:')
  console.log('  "icons": { "16":"icons/icon-16.png","32":"icons/icon-32.png","48":"icons/icon-48.png","128":"icons/icon-128.png" }')
}

main().catch(console.error)
