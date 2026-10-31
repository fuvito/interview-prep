/**
 * Packages the dist/ folder as a Firefox Add-on ZIP.
 *
 * Differences from the Chrome build:
 *  - Injects browser_specific_settings.gecko into manifest.json so Firefox
 *    assigns a stable extension ID. Without a stable ID, Firefox regenerates
 *    a random ID on every install, which wipes IndexedDB between updates.
 */
import { existsSync } from 'fs'
import { writeFile, readFile } from 'fs/promises'
import { buildZip, loadEntries } from './zip-utils.mjs'

if (!existsSync('dist')) {
  console.error('dist/ not found — run "npm run build" first')
  process.exit(1)
}

const pkg = JSON.parse(await readFile('package.json', 'utf8'))
const version = pkg.version ?? '0.0.0'
const outName = `dist/interview-prep-v${version}-firefox.zip`

// Load all dist files, excluding any previously generated ZIPs
let entries = (await loadEntries('dist')).filter(e => !e.name.endsWith('.zip'))

// Patch manifest.json with Firefox-specific settings
entries = entries.map((entry) => {
  if (entry.name !== 'manifest.json') return entry

  const manifest = JSON.parse(entry.data.toString('utf8'))

  manifest.browser_specific_settings = {
    gecko: {
      id: 'interviewprep@fyazar.com',
      strict_min_version: '128.0',
    },
  }

  return {
    ...entry,
    data: Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'),
  }
})

const zipBuf = buildZip(entries)
await writeFile(outName, zipBuf)

console.log(`✓ ${outName}  (${(zipBuf.length / 1024).toFixed(1)} KB, ${entries.length} files)`)
