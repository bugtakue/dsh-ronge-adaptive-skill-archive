import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('guarded runner executes an allowed test chain and audits avoided callbacks', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ronge-guard-'))
  fs.mkdirSync(path.join(dir, 'tests'))
  fs.writeFileSync(path.join(dir, 'sum.mjs'), 'export function sum(xs){return xs.reduce((a,b)=>a+b,0)}\n')
  for (const name of ['a', 'b']) {
    fs.writeFileSync(path.join(dir, 'tests', name + '.test.mjs'), "import test from 'node:test';import assert from 'node:assert/strict';import {sum} from '../sum.mjs';test('sum',()=>assert.equal(sum([1,2]),3))\n")
  }
  const steps = path.join(dir, 'steps.json')
  fs.writeFileSync(steps, JSON.stringify([
    { id: 'a', bin: 'node', args: ['--test', 'tests/a.test.mjs'], guard: { exitCode: 0 } },
    { id: 'b', bin: 'node', args: ['--test', 'tests/b.test.mjs'], guard: { exitCode: 0 } },
  ]))
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'guarded-runner.mjs'), '--root', dir, '--steps', steps], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
  const report = JSON.parse(result.stdout)
  assert.equal(report.ok, true)
  assert.equal(report.steps.length, 2)
  assert.equal(report.modelCallbacksAvoided, 1)
})
