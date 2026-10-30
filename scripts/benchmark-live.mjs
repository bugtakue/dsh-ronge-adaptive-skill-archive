#!/usr/bin/env node
/**
 * Live A/B protocol for task-level evidence. This script NEVER fabricates
 * model runs: it either prints the protocol or aggregates records produced by
 * a real DSH run.
 *
 * usage:
 *   node scripts/benchmark-live.mjs --dry-run
 *   node scripts/benchmark-live.mjs --record runs.json --out report.json
 *
 * run record shape:
 *   [{ taskId, arm: "baseline"|"plugin", success: true, tokens: 12000,
 *      toolCalls: 8, wallMs: 45000, notes: "..." }]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TASKS_FILE = path.join(ROOT, 'test', 'fixtures', 'live-ab-tasks.json')
const args = process.argv.slice(2)
const flag = (name) => args.indexOf(name)
const value = (name) => (flag(name) >= 0 ? args[flag(name) + 1] : null)
const tasks = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'))
const dryRun = flag('--dry-run') >= 0
const recordFile = value('--record')
const outFile = value('--out')

if (!dryRun && !recordFile) {
  console.error('use --dry-run to print the protocol, or --record <file> to aggregate real run records')
  process.exit(1)
}

function aggregate(records) {
  const byArm = {}
  for (const arm of ['baseline', 'plugin']) {
    const rows = records.filter((record) => record.arm === arm)
    const success = rows.filter((record) => record.success === true).length
    const sum = (key) => rows.reduce((total, record) => total + (Number(record[key]) || 0), 0)
    byArm[arm] = {
      runs: rows.length,
      successRate: rows.length ? Math.round((success / rows.length) * 1000) / 1000 : null,
      meanTokens: rows.length ? Math.round(sum('tokens') / rows.length) : null,
      meanToolCalls: rows.length ? Math.round((sum('toolCalls') / rows.length) * 10) / 10 : null,
      meanWallMs: rows.length ? Math.round(sum('wallMs') / rows.length) : null,
    }
  }
  return byArm
}

if (dryRun) {
  const protocol = {
    schema: 'skill-intelligence-live-ab/v1',
    status: 'awaiting-real-runs',
    tasks: tasks.length,
    arms: ['baseline', 'plugin'],
    instruction: 'Run each task twice (same model, same tools, same time budget). Arm "baseline" = no skill archive tools/panel; arm "plugin" = use skill_archive_plan then execute. Record success/tokens/toolCalls/wallMs per run.',
    tasksDetail: tasks,
    recordShape: { taskId: 'video-01', arm: 'baseline|plugin', success: true, tokens: 12000, toolCalls: 8, wallMs: 45000, notes: 'evidence' },
    note: 'No numbers are produced until a real run is recorded; this script does not call a model.',
  }
  console.log(JSON.stringify(protocol, null, 2))
  process.exit(0)
}

const raw = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), recordFile), 'utf8'))
if (!Array.isArray(raw)) throw new Error('record file must be a JSON array')
const taskIds = new Set(tasks.map((task) => task.id))
for (const record of raw) {
  if (!record || !taskIds.has(record.taskId)) throw new Error('unknown taskId: ' + JSON.stringify(record && record.taskId))
  if (record.arm !== 'baseline' && record.arm !== 'plugin') throw new Error('arm must be baseline or plugin')
}
const report = {
  schema: 'skill-intelligence-live-ab/v1',
  status: 'recorded',
  generatedAt: new Date().toISOString(),
  tasks: tasks.length,
  records: raw.length,
  arms: aggregate(raw),
  caveat: 'Task-level A/B; success is human/rubric reviewed, tokens/time are runner-reported. Do not compare across models or task sets.',
}
if (outFile) fs.writeFileSync(path.resolve(process.cwd(), outFile), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify(report, null, 2))
