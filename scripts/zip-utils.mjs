import { readdir, stat, readFile } from 'fs/promises'
import { join, relative } from 'path'

// ── CRC-32 ────────────────────────────────────────────────────────────────────

function buildCrcTable() {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
}
const CRC_TABLE = buildCrcTable()

export function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

// ── Little-endian writers ─────────────────────────────────────────────────────

function u16(buf, o, v) { buf[o] = v & 0xff; buf[o + 1] = (v >> 8) & 0xff }
function u32(buf, o, v) {
  buf[o] = v & 0xff; buf[o + 1] = (v >> 8) & 0xff
  buf[o + 2] = (v >> 16) & 0xff; buf[o + 3] = (v >> 24) & 0xff
}

function dosDate(d) { return ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate() }
function dosTime(d) { return (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2) }

// ── ZIP builder ───────────────────────────────────────────────────────────────

/**
 * Build a ZIP buffer from an array of { name, data, date } entries.
 * Stores files uncompressed (method 0) — sufficient for Chrome/Firefox submission.
 */
export function buildZip(entries) {
  const chunks = []
  const central = []
  let offset = 0

  for (const { name, data, date } of entries) {
    const nb = Buffer.from(name)
    const crc = crc32(data)
    const dt = dosDate(date)
    const tm = dosTime(date)

    const local = Buffer.alloc(30 + nb.length)
    u32(local, 0, 0x04034b50); u16(local, 4, 20); u16(local, 6, 0); u16(local, 8, 0)
    u16(local, 10, tm); u16(local, 12, dt)
    u32(local, 14, crc); u32(local, 18, data.length); u32(local, 22, data.length)
    u16(local, 26, nb.length); u16(local, 28, 0)
    nb.copy(local, 30)

    central.push({ nb, crc, size: data.length, dt, tm, offset })
    offset += local.length + data.length
    chunks.push(local, data)
  }

  const centralStart = offset
  for (const c of central) {
    const rec = Buffer.alloc(46 + c.nb.length)
    u32(rec, 0, 0x02014b50); u16(rec, 4, 20); u16(rec, 6, 20); u16(rec, 8, 0); u16(rec, 10, 0)
    u16(rec, 12, c.tm); u16(rec, 14, c.dt)
    u32(rec, 16, c.crc); u32(rec, 20, c.size); u32(rec, 24, c.size)
    u16(rec, 28, c.nb.length); u16(rec, 30, 0); u16(rec, 32, 0); u16(rec, 34, 0)
    u16(rec, 36, 0); u32(rec, 38, 0); u32(rec, 42, c.offset)
    c.nb.copy(rec, 46)
    chunks.push(rec)
    offset += rec.length
  }

  const centralSize = offset - centralStart
  const eocd = Buffer.alloc(22)
  u32(eocd, 0, 0x06054b50); u16(eocd, 4, 0); u16(eocd, 6, 0)
  u16(eocd, 8, central.length); u16(eocd, 10, central.length)
  u32(eocd, 12, centralSize); u32(eocd, 16, centralStart); u16(eocd, 20, 0)
  chunks.push(eocd)

  return Buffer.concat(chunks)
}

// ── File collection ───────────────────────────────────────────────────────────

export async function collectFiles(dir, base = dir) {
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

export async function loadEntries(dir) {
  const files = await collectFiles(dir)
  return Promise.all(
    files.map(async ({ path, name, date }) => ({ name, data: await readFile(path), date }))
  )
}
