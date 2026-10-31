import { createWriteStream, existsSync } from 'fs'
import { readdir, stat } from 'fs/promises'
import { join, relative } from 'path'
import { createReadStream } from 'fs'
import { createGzip } from 'zlib'

// Use only Node built-ins — no archiver dependency needed.
// We produce a ZIP using the built-in zlib + a minimal ZIP writer.

// ── Minimal ZIP writer ────────────────────────────────────────────────────────

function dosDate(d) {
  return ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
}
function dosTime(d) {
  return (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2)
}

function crc32(buf) {
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Uint32Array(256)
    for (let i = 0; i < 256; i++) {
      let c = i
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      t[i] = c
    }
    return t
  })())
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function writeUint16LE(buf, offset, v) { buf[offset] = v & 0xff; buf[offset + 1] = (v >> 8) & 0xff }
function writeUint32LE(buf, offset, v) {
  buf[offset] = v & 0xff; buf[offset + 1] = (v >> 8) & 0xff
  buf[offset + 2] = (v >> 16) & 0xff; buf[offset + 3] = (v >> 24) & 0xff
}

async function buildZip(entries) {
  // entries: Array<{ name: string, data: Buffer, date: Date }>
  const chunks = []
  const central = []
  let offset = 0

  for (const { name, data, date } of entries) {
    const nameBuf = Buffer.from(name)
    const crc = crc32(data)
    const dt = dosDate(date)
    const tm = dosTime(date)

    // Local file header
    const local = Buffer.alloc(30 + nameBuf.length)
    writeUint32LE(local, 0, 0x04034b50)   // signature
    writeUint16LE(local, 4, 20)            // version needed
    writeUint16LE(local, 6, 0)             // flags
    writeUint16LE(local, 8, 0)             // compression: stored
    writeUint16LE(local, 10, tm)
    writeUint16LE(local, 12, dt)
    writeUint32LE(local, 14, crc)
    writeUint32LE(local, 18, data.length)  // compressed size
    writeUint32LE(local, 22, data.length)  // uncompressed size
    writeUint16LE(local, 26, nameBuf.length)
    writeUint16LE(local, 28, 0)            // extra field length
    nameBuf.copy(local, 30)

    central.push({ name: nameBuf, crc, size: data.length, dt, tm, offset })
    offset += local.length + data.length

    chunks.push(local, data)
  }

  const centralStart = offset
  for (const c of central) {
    const rec = Buffer.alloc(46 + c.name.length)
    writeUint32LE(rec, 0, 0x02014b50)   // signature
    writeUint16LE(rec, 4, 20)           // version made by
    writeUint16LE(rec, 6, 20)           // version needed
    writeUint16LE(rec, 8, 0)            // flags
    writeUint16LE(rec, 10, 0)           // compression
    writeUint16LE(rec, 12, c.tm)
    writeUint16LE(rec, 14, c.dt)
    writeUint32LE(rec, 16, c.crc)
    writeUint32LE(rec, 20, c.size)
    writeUint32LE(rec, 24, c.size)
    writeUint16LE(rec, 28, c.name.length)
    writeUint16LE(rec, 30, 0)           // extra
    writeUint16LE(rec, 32, 0)           // comment
    writeUint16LE(rec, 34, 0)           // disk start
    writeUint16LE(rec, 36, 0)           // int attrs
    writeUint32LE(rec, 38, 0)           // ext attrs
    writeUint32LE(rec, 42, c.offset)
    c.name.copy(rec, 46)
    chunks.push(rec)
    offset += rec.length
  }

  const centralSize = offset - centralStart
  const eocd = Buffer.alloc(22)
  writeUint32LE(eocd, 0, 0x06054b50)
  writeUint16LE(eocd, 4, 0)
  writeUint16LE(eocd, 6, 0)
  writeUint16LE(eocd, 8, central.length)
  writeUint16LE(eocd, 10, central.length)
  writeUint32LE(eocd, 12, centralSize)
  writeUint32LE(eocd, 16, centralStart)
  writeUint16LE(eocd, 20, 0)
  chunks.push(eocd)

  return Buffer.concat(chunks)
}

// ── Collect dist files ────────────────────────────────────────────────────────

async function collectFiles(dir, base = dir) {
  const result = []
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry)
    const s = await stat(full)
    if (s.isDirectory()) {
      result.push(...await collectFiles(full, base))
    } else {
      result.push({ path: full, name: relative(base, full).replace(/\\/g, '/'), date: s.mtime })
    }
  }
  return result
}

// ── Main ──────────────────────────────────────────────────────────────────────

if (!existsSync('dist')) {
  console.error('dist/ not found — run "npm run build" first')
  process.exit(1)
}

const { readFile } = await import('fs/promises')
const pkg = JSON.parse(await readFile('package.json', 'utf8'))
const version = pkg.version ?? '0.0.0'
const outName = `dist/interview-prep-v${version}.zip`

const files = await collectFiles('dist')
const entries = await Promise.all(
  files.map(async ({ path, name, date }) => ({
    name,
    data: await readFile(path),
    date,
  }))
)

const zipBuf = await buildZip(entries)
await (await import('fs/promises')).writeFile(outName, zipBuf)

const kb = (zipBuf.length / 1024).toFixed(1)
console.log(`✓ ${outName}  (${kb} KB, ${entries.length} files)`)
