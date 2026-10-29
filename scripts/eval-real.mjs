/**
 * 真实任务推荐评测（30 条半人工金标）：读 test/fixtures 的用例与技能清单，
 * 调用 index.js 的 evaluateRecommendations，输出逐条 HIT/MISS、Recall@K 与按类别汇总。
 *
 * 纯本地、无网络、无随机探索（不传经验统计，K 默认 4），同样的输入每次结果一致。
 * Recall < EVAL_THRESHOLD（默认 0.8）时退出码 1；expect 引用了清单外技能也直接失败。
 *
 *   node scripts/eval-real.mjs
 *   EVAL_K=4 EVAL_THRESHOLD=0.8 node scripts/eval-real.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { evaluateRecommendations } from '../index.js'

const root = path.resolve(import.meta.dirname, '..')
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))

const skills = read('test/fixtures/eval-skills.json')
const cases = read('test/fixtures/recommend-cases-real.json')
const k = Number(process.env.EVAL_K || 4)
const threshold = Number(process.env.EVAL_THRESHOLD || 0.8)

const CATEGORY_LABELS = {
  video: '视频/动效',
  office: 'Office 文档',
  'doc-check': '文档校验',
  'harness-plugin': 'Harness 插件',
  mcp: 'MCP',
  'skill-design': 'skill 设计',
  composition: 'preset/组合',
  'cross-category': '跨类别干扰',
}

const clip = (text, max = 64) => {
  const value = String(text || '').replace(/\s+/g, ' ').trim()
  return value.length > max ? value.slice(0, max) + '…' : value
}

if (!Array.isArray(skills) || !skills.length) {
  console.error('eval-real failed: test/fixtures/eval-skills.json 为空或格式不对')
  process.exit(1)
}
if (!Array.isArray(cases) || cases.length < 30) {
  console.error(`eval-real failed: test/fixtures/recommend-cases-real.json 需要至少 30 条用例（当前 ${cases.length || 0}）`)
  process.exit(1)
}

// 金标用到的技能必须真实存在于技能清单里，避免「编造技能名」把指标做虚。
const skillNames = new Set(skills.map((skill) => skill.name))
const unknown = []
for (const item of cases) {
  for (const name of Array.isArray(item.expect) ? item.expect : []) {
    if (!skillNames.has(name)) unknown.push(`${item.id || '(no id)'}: ${name}`)
  }
}
if (unknown.length) {
  console.error('eval-real failed: expect 引用了技能清单里不存在的技能:')
  for (const entry of unknown) console.error(' -', entry)
  process.exit(1)
}

const report = evaluateRecommendations(cases, skills, {}, k)
if (report.total !== cases.length) {
  console.error(`eval-real failed: ${cases.length - report.total} 条用例缺少 context/expect 被跳过`)
  process.exit(1)
}

const groups = new Map()
const misses = []
cases.forEach((item, index) => {
  const result = report.cases[index]
  const category = item.category || 'uncategorized'
  if (!groups.has(category)) groups.set(category, { total: 0, hits: 0 })
  const group = groups.get(category)
  group.total += 1
  if (result.hit) group.hits += 1
  else misses.push(`${item.id || '-'} [${CATEGORY_LABELS[category] || category}] ${clip(item.context, 48)}`)

  const mark = result.hit ? 'HIT ' : 'MISS'
  const actual = result.top.length ? result.top.join(',') : '(无推荐)'
  console.log(
    `${mark} ${String(item.id || '-').padEnd(13)} ${CATEGORY_LABELS[category] || category}  期望=${item.expect.join(',')} 实际=${actual}  ← ${clip(item.context)}`,
  )
})

console.log('')
console.log('按类别汇总：')
for (const [category, group] of groups) {
  const label = CATEGORY_LABELS[category] || category
  const percent = Math.round((group.hits / group.total) * 100)
  console.log(`  ${label}: ${group.hits}/${group.total} = ${percent}%`)
}

console.log('')
console.log(`Recall@${report.k}: ${report.recall} (${report.hits}/${report.total})  阈值 ${threshold}`)
if (misses.length) {
  console.log(`已知 MISS（${misses.length} 条，见 docs/eval.md 的「已知短板」）：`)
  for (const item of misses) console.log(' -', item)
}

if (report.recall < threshold) {
  console.error(`\neval-real failed: Recall@${report.k}=${report.recall} 低于阈值 ${threshold}`)
  process.exit(1)
}
console.log('\nok: 真实任务推荐评测通过')
