import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('DSH ecosystem bundle/skill/installer/MCP regression passes', () => {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'check-ecosystem.mjs')], { encoding: 'utf8', timeout: 20000 })
  assert.equal(result.status, 0, result.stderr || result.stdout)
  const report = JSON.parse(result.stdout)
  assert.equal(report.ok, true)
  assert.ok(report.checks.every((item) => item.ok))
})
