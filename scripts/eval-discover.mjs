#!/usr/bin/env node
/**
 * Evaluate MCP discover_skills on realistic task prompts against the 6,399
 * library index. Metrics: category Hit@5, optional keyword Hit@5, mean signal
 * score. This is a semi-manual benchmark, not a human quality label set.
 *
 * usage: node scripts/eval-discover.mjs [--k 5] [--min 0.75]
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { __testing } from '../mcp/server.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const argValue = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 ? Number(args[index + 1]) : fallback
}
const k = argValue('--k', 5)
const minHit = argValue('--min', 0.75)
const cases = JSON.parse(fs.readFileSync(path.join(ROOT, 'test', 'fixtures', 'discover-cases.json'), 'utf8'))
const rows = []
let categoryHits = 0
let keywordHits = 0
let keywordCases = 0
let qualitySum = 0
let qualityCount = 0
let precisionSum = 0
let top1Hits = 0
let mrrSum = 0

for (const item of cases) {
  const results = __testing.discoverLibrarySkills(String(item.context || ''), k)
  const categories = results.map((entry) => entry.category)
  const categoryHit = categories.some((category) => (item.expectCategories || []).includes(category))
  if (categoryHit) categoryHits += 1
  const expected = item.expectCategories || []
  const relevant = categories.filter((category) => expected.includes(category)).length
  precisionSum += categories.length ? relevant / categories.length : 0
  if (expected.includes(categories[0])) top1Hits += 1
  const firstExpectedRank = categories.findIndex((category) => expected.includes(category))
  mrrSum += firstExpectedRank >= 0 ? 1 / (firstExpectedRank + 1) : 0
  let keywordHit = null
  if (Array.isArray(item.expectKeywords) && item.expectKeywords.length) {
    keywordCases += 1
    const haystack = results.map((entry) => [entry.name, entry.description].join(' ').toLowerCase()).join(' ')
    keywordHit = item.expectKeywords.some((keyword) => haystack.includes(String(keyword).toLowerCase()))
    if (keywordHit) keywordHits += 1
  }
  for (const entry of results) {
    if (Number.isFinite(Number(entry.quality))) {
      qualitySum += Number(entry.quality)
      qualityCount += 1
    }
  }
  rows.push({
    id: item.id,
    context: String(item.context || '').slice(0, 60),
    expectCategories: item.expectCategories,
    got: results.map((entry) => entry.name + ' [' + entry.category + ']').slice(0, k),
    categoryHit,
    keywordHit,
  })
}

for (const row of rows) {
  console.log(
    (row.categoryHit ? 'HIT ' : 'MISS') +
      '  ' +
      row.id.padEnd(14) +
      (row.keywordHit === null ? '        ' : row.keywordHit ? 'kw-HIT   ' : 'kw-MISS  ') +
      'expect=' +
      row.expectCategories.join(',') +
      '  got=' +
      row.got.join(' | '),
  )
}
const total = cases.length
const categoryRate = total ? categoryHits / total : 0
const keywordRate = keywordCases ? keywordHits / keywordCases : 0
console.log('Category Hit@' + k + ':', Math.round(categoryRate * 1000) / 1000, `(${categoryHits}/${total})`)
console.log('Category P@' + k + ':', Math.round((precisionSum / total) * 1000) / 1000)
console.log('Top-1 category hit:', Math.round((top1Hits / total) * 1000) / 1000)
console.log('Category MRR:', Math.round((mrrSum / total) * 1000) / 1000)
console.log('Keyword  Hit@' + k + ':', Math.round(keywordRate * 1000) / 1000, `(${keywordHits}/${keywordCases})`)
console.log('Mean signal score:', qualityCount ? Math.round((qualitySum / qualityCount) * 10) / 10 : 'n/a')
if (categoryRate < minHit) {
  console.error('FAIL: category Hit@' + k + ' below threshold', minHit)
  process.exit(1)
}
console.log('ok: discover benchmark passed')
