import fs from 'node:fs'
import path from 'node:path'

export function ensureDir(dir, mode = 0o700) {
  fs.mkdirSync(dir, { recursive: true, mode })
  return dir
}

export function atomicWriteFile(file, content, options = {}) {
  const dir = path.dirname(file)
  ensureDir(dir, options.dirMode || 0o700)
  const tmp = path.join(dir, '.' + path.basename(file) + '.tmp-' + process.pid + '-' + Date.now() + '-' + Math.random().toString(16).slice(2))
  const mode = options.mode ?? 0o600
  let fd
  try {
    fd = fs.openSync(tmp, 'wx', mode)
    fs.writeFileSync(fd, String(content ?? ''))
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = undefined
    fs.renameSync(tmp, file)
    try {
      const dirFd = fs.openSync(dir, 'r')
      try { fs.fsyncSync(dirFd) } finally { fs.closeSync(dirFd) }
    } catch {}
  } catch (error) {
    try { if (fd !== undefined) fs.closeSync(fd) } catch {}
    try { fs.unlinkSync(tmp) } catch {}
    throw error
  }
  return file
}

export function atomicWriteJson(file, value, options = {}) {
  return atomicWriteFile(file, JSON.stringify(value, null, 2) + '\n', options)
}

export function isInside(parent, child) {
  const base = path.resolve(parent)
  const target = path.resolve(child)
  return target === base || target.startsWith(base + path.sep)
}

export function safeTargetInside(parent, child) {
  const base = fs.existsSync(parent) ? fs.realpathSync(parent) : path.resolve(parent)
  const target = path.resolve(base, child)
  if (!isInside(base, target)) throw new Error('path escapes allowed root')
  return target
}

const locks = new Map()

export function withKeyLock(key, task) {
  const previous = locks.get(key) || Promise.resolve()
  const next = previous.catch(() => {}).then(task)
  locks.set(key, next)
  next.finally(() => {
    if (locks.get(key) === next) locks.delete(key)
  }).catch(() => {})
  return next
}
