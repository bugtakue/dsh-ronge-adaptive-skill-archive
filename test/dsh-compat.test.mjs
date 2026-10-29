import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('DSH bundle compatibility check passes', () => {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'dsh-compat-check.mjs')], {
    encoding: 'utf8',
    timeout: 30000,
  })
  assert.equal(result.status, 0, String(result.stderr || result.stdout).slice(-1200))
  assert.match(result.stdout, /ok: DSH compatibility/)
})

test('DSH compatibility doc records the tested Harness version', () => {
  const doc = fs.readFileSync(path.join(ROOT, 'docs', 'dsh-compatibility.md'), 'utf8')
  assert.match(doc, /0\.2\.1-rc\.3/)
  assert.match(doc, /install_bundle/)
  assert.match(doc, /restart/i)
})
