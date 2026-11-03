#!/usr/bin/env node
/**
 * Experimental guarded runner for deterministic Node test chains.
 * SAFETY: only `node --test tests/*.test.mjs` under an explicit root is allowed.
 * No shell, no arbitrary bins, no file edits. This is a prototype for measuring
 * whether one tool call can replace several model->tool callbacks.
 *
 * usage:
 *   node scripts/guarded-runner.mjs --root /tmp/fixture --steps steps.json
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)
const arg = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}
const root = path.resolve(arg('--root', process.cwd()))
const stepsFile = arg('--steps', '')
if (!stepsFile) {
  console.error('--steps is required')
  process.exit(1)
}
const steps = JSON.parse(fs.readFileSync(path.resolve(stepsFile), 'utf8'))
if (!Array.isArray(steps) || steps.length === 0 || steps.length > 8) {
  console.error('steps must be an array of 1..8 items')
  process.exit(1)
}
const rootReal = fs.realpathSync(root)
const results = []
let stopped = null
for (let index = 0; index < steps.length; index += 1) {
  const step = steps[index] || {}
  const bin = String(step.bin || '')
  const stepArgs = Array.isArray(step.args) ? step.args.map(String) : []
  if (bin !== 'node' || stepArgs[0] !== '--test') {
    stopped = { step: index, reason: 'blocked: only node --test is allowed' }
    break
  }
  if (!stepArgs.slice(1).every((item) => /^tests\/[A-Za-z0-9_.-]+\.test\.mjs$/.test(item))) {
    stopped = { step: index, reason: 'blocked: test path must be tests/*.test.mjs' }
    break
  }
  const result = spawnSync(bin, stepArgs, { cwd: rootReal, encoding: 'utf8', timeout: 20000 })
  const exitCode = result.status === null ? -1 : result.status
  const output = String(result.stdout || '').trim().slice(-2000)
  const error = String(result.stderr || '').trim().slice(-2000)
  results.push({ id: step.id || 's' + index, exitCode, ok: exitCode === 0, outputTail: output, errorTail: error })
  const guardExit = step.guard && Number.isFinite(Number(step.guard.exitCode)) ? Number(step.guard.exitCode) : 0
  if (exitCode !== guardExit) {
    stopped = { step: index, reason: 'guard failed', expected: guardExit, actual: exitCode }
    break
  }
}
const ok = !stopped && results.every((item) => item.ok)
console.log(JSON.stringify({
  ok,
  root,
  steps: results,
  stopped,
  modelCallbacksAvoided: Math.max(0, results.length - 1),
  note: 'Experimental: one tool call executed all steps; no shell and no write.',
}, null, 2))
process.exit(ok ? 0 : 1)
