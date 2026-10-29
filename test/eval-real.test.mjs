import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = path.resolve(import.meta.dirname, '..')
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))

const skills = read('test/fixtures/eval-skills.json')
const cases = read('test/fixtures/recommend-cases-real.json')
const skillNames = new Set(skills.map((skill) => skill.name))
const script = path.join(root, 'scripts', 'eval-real.mjs')

const runEval = (env = {}) =>
  spawnSync(process.execPath, [script], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  })

test('real-task benchmark keeps at least 30 labelled cases', () => {
  assert.ok(Array.isArray(cases), 'recommend-cases-real.json must be an array')
  assert.ok(cases.length >= 30, `expected >= 30 cases, got ${cases.length}`)
  assert.ok(skills.length > 0, 'eval-skills.json must not be empty')
})

test('every expected skill exists in the installed-skill fixture', () => {
  const unknown = []
  for (const item of cases) {
    assert.ok(Array.isArray(item.expect), `${item.id || '(no id)'}: expect must be an array`)
    assert.ok(item.expect.length >= 1 && item.expect.length <= 3, `${item.id || '(no id)'}: expect must hold 1-3 skills`)
    for (const name of item.expect) {
      if (!skillNames.has(name)) unknown.push(`${item.id || '(no id)'}: ${name}`)
    }
  }
  assert.deepEqual(unknown, [], 'benchmark must not invent skill names')
})

test('every case has a complete, unique label', () => {
  const ids = new Set()
  for (const item of cases) {
    assert.equal(typeof item.id, 'string')
    assert.ok(item.id.length > 0)
    assert.equal(ids.has(item.id), false, `duplicate case id: ${item.id}`)
    ids.add(item.id)

    assert.equal(typeof item.context, 'string')
    assert.ok(item.context.trim().length >= 8, `${item.id}: context is too short`)
    assert.equal(typeof item.category, 'string')
    assert.ok(item.category.length > 0, `${item.id}: category is required for the group report`)
    assert.equal(typeof item.note, 'string')
    assert.ok(item.note.length >= 8, `${item.id}: note must explain why these skills are expected`)
  }
})

test('eval-real script exits 0 and reports Recall@4 >= 0.8', () => {
  const result = runEval({ EVAL_THRESHOLD: '0.8' })
  assert.equal(result.status, 0, `script failed:\n${result.stdout}\n${result.stderr}`)

  const recall = /Recall@(\d+): ([\d.]+) \((\d+)\/(\d+)\)/.exec(result.stdout)
  assert.ok(recall, `Recall line missing from output:\n${result.stdout}`)
  const [, k, recallText, hitsText, totalText] = recall
  assert.equal(Number(k), 4)
  assert.equal(Number(totalText), cases.length, 'script must evaluate every fixture case')
  assert.ok(Number(recallText) >= 0.8, `Recall@4 ${recallText} below 0.8`)
  assert.equal(Number(hitsText), Math.round(Number(recallText) * Number(totalText)))

  const caseLines = result.stdout.split('\n').filter((line) => /^(HIT|MISS) /.test(line))
  assert.equal(caseLines.length, cases.length, 'script must print one HIT/MISS line per case')
  assert.match(result.stdout, /按类别汇总/, 'script must print a per-category summary')
})

test('eval-real script exits 1 when Recall falls below the threshold', () => {
  const result = runEval({ EVAL_THRESHOLD: '1.01' })
  assert.equal(result.status, 1, 'an unmet threshold must fail the script')
  assert.match(result.stderr, /低于阈值|below threshold/)
})
