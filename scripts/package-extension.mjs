import { existsSync } from 'fs'
import { writeFile, readFile } from 'fs/promises'
import { buildZip, loadEntries } from './zip-utils.mjs'

if (!existsSync('dist')) {
  console.error('dist/ not found — run "npm run build" first')
  process.exit(1)
}

const pkg = JSON.parse(await readFile('package.json', 'utf8'))
const version = pkg.version ?? '0.0.0'
const outName = `dist/interview-prep-v${version}.zip`

const entries = (await loadEntries('dist')).filter(e => !e.name.endsWith('.zip'))
const zipBuf = buildZip(entries)
await writeFile(outName, zipBuf)

console.log(`✓ ${outName}  (${(zipBuf.length / 1024).toFixed(1)} KB, ${entries.length} files)`)
