import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cases = JSON.parse(fs.readFileSync(path.join(ROOT, 'test', 'fixtures', 'discover-cases.json'), 'utf8'))

test('discover benchmark has enough realistic cases and valid labels', () => {
  assert.ok(Array.isArray(cases))
  assert.ok(cases.length >= 24)
  const ids = new Set()
  for (const item of cases) {
    assert.ok(item.id && item.context, 'case id/context')
    assert.ok(!ids.has(item.id), 'duplicate id ' + item.id)
    ids.add(item.id)
    assert.ok(Array.isArray(item.expectCategories) && item.expectCategories.length, 'categories for ' + item.id)
    assert.ok(/[\u4e00-\u9fff]|[a-z]/i.test(item.context), 'context')
  }
})

test('discover benchmark meets the category Hit@5 threshold', () => {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'eval-discover.mjs')], {
    encoding: 'utf8',
    timeout: 60000,
  })
  assert.equal(result.status, 0, String(result.stderr || result.stdout).slice(-800))
  const output = String(result.stdout || '')
  const match = output.match(/Category Hit@5:\s*([\d.]+)/)
  assert.ok(match, 'category metric printed')
  assert.ok(Number(match[1]) >= 0.75, 'category hit ' + match[1])
  const precision = output.match(/Category P@5:\s*([\d.]+)/)
  const top1 = output.match(/Top-1 category hit:\s*([\d.]+)/)
  assert.ok(precision && Number(precision[1]) >= 0.6, 'category precision')
  assert.ok(top1 && Number(top1[1]) >= 0.7, 'top-1 category hit')
  assert.match(output, /ok: discover benchmark passed/)
})
