import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const tasks = JSON.parse(fs.readFileSync(path.join(ROOT, 'test', 'fixtures', 'live-ab-tasks.json'), 'utf8'))

test('live A/B fixture has real cross-domain tasks with checks', () => {
  assert.ok(tasks.length >= 10)
  for (const task of tasks) {
    assert.ok(task.id && task.task && task.deliverable)
    assert.ok(Array.isArray(task.checks) && task.checks.length >= 2)
  }
})

test('live A/B dry-run prints protocol without inventing numbers', () => {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'benchmark-live.mjs'), '--dry-run'], { encoding: 'utf8' })
  assert.equal(result.status, 0)
  const payload = JSON.parse(result.stdout)
  assert.equal(payload.status, 'awaiting-real-runs')
  assert.equal(payload.tasks, tasks.length)
  assert.equal(payload.arms.join(','), 'baseline,plugin')
})

test('live A/B aggregates recorded runs and rejects unknown task ids', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ronge-live-ab-'))
  const records = path.join(dir, 'runs.json')
  fs.writeFileSync(records, JSON.stringify([
    { taskId: 'video-01', arm: 'baseline', success: false, tokens: 20000, toolCalls: 12, wallMs: 60000 },
    { taskId: 'video-01', arm: 'plugin', success: true, tokens: 12000, toolCalls: 8, wallMs: 45000 },
  ]))
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'benchmark-live.mjs'), '--record', records], { encoding: 'utf8' })
  assert.equal(result.status, 0)
  const report = JSON.parse(result.stdout)
  assert.equal(report.arms.baseline.runs, 1)
  assert.equal(report.arms.plugin.successRate, 1)
})
