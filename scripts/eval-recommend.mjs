/**
 * 离线推荐评估：读 test/fixtures 下的金标用例，输出 Recall@K。
 * 纯本地、无网络；用于每次改 recommendSkills 后跑回归。
 *
 *   npm run eval:recommend
 */
import fs from 'node:fs'
import path from 'node:path'
import { evaluateRecommendations } from '../index.js'

const root = path.resolve(import.meta.dirname, '..')
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))

const skills = read('test/fixtures/eval-skills.json')
const cases = read('test/fixtures/recommend-cases.json')
const k = Number(process.env.EVAL_K || 4)
const report = evaluateRecommendations(cases, skills, {}, k)

for (const item of report.cases) {
  const mark = item.hit ? 'HIT ' : 'MISS'
  console.log(`${mark} 期望=${item.expect.join(',')} 实际=${item.top.join(',')}  ← ${item.context}`)
}
console.log(`\nRecall@${report.k}: ${report.recall} (${report.hits}/${report.total})`)

const threshold = Number(process.env.EVAL_THRESHOLD || 0.75)
if (report.total === 0) {
  console.error('eval failed: no cases loaded')
  process.exitCode = 1
} else if (report.recall < threshold) {
  console.error(`eval below threshold ${threshold}`)
  process.exitCode = 1
}
