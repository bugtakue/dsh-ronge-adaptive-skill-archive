#!/usr/bin/env node
/**
 * Verify a live DSH profile after restart. Read-only; makes no writes.
 * usage: node scripts/check-live-quality.mjs --port 57696 --cookie-file /tmp/dsh-cookie.txt
 */
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)
const arg = (name, fallback) => {
  const index = args.indexOf(name)
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback
}
const port = arg('--port', '57696')
const cookieFile = arg('--cookie-file', '/tmp/dsh-cookie.txt')
const expected = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version
const cookie = fs.existsSync(cookieFile) ? fs.readFileSync(cookieFile, 'utf8').trim() : ''
const base = `http://127.0.0.1:${port}/dsh-ronge-adaptive-skill-archive`

async function get(path) {
  const res = await fetch(base + path, { headers: cookie ? { cookie } : {} })
  return { status: res.status, body: await res.json() }
}
async function plan(task) {
  const res = await fetch(base + '/intelligence/plan', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: JSON.stringify({ task }),
  })
  return { status: res.status, body: await res.json() }
}

const checks = []
const check = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail })

try {
  const version = await get('/version')
  check('live version = ' + expected, version.body.version === expected, version.body.version)
  const simple = await plan('把会议记录整理成 docx 会议纪要')
  const simplePlan = simple.body.plan || {}
  check('simple task plan.simple=true', simplePlan.simple === true, simplePlan.simple)
  check('simple task <=1 stage', Array.isArray(simplePlan.stages) && simplePlan.stages.length <= 1, simplePlan.stages?.length)

  const excel = await plan('分析这份 Excel 销售数据，做成 8 页发布 PPT，并用数据支撑结论')
  const excelNames = (excel.body.plan?.stages || []).flatMap((stage) => (stage.skills || []).map((skill) => skill.name))
  check('Excel plan excludes agent-experience', !excelNames.includes('agent-experience'), excelNames.join(','))
  check('Excel plan keeps office-xlsx', excelNames.includes('office-xlsx'), excelNames.join(','))

  const security = await plan('审查第三方 SKILL.md 的安装脚本安全风险，给出审计报告')
  const securityPlan = security.body.plan || {}
  check('security plan escalates', securityPlan.pattern === 'escalation', securityPlan.pattern)
  check('security-audit critical reported', (securityPlan.missing || []).some((item) => item.capability === 'security-audit' && item.critical), (securityPlan.missing || []).map((item) => item.capability).join(','))
} catch (error) {
  check('live endpoint reachable', false, error.message)
}

console.log(JSON.stringify({ expected, port, checks }, null, 2))
process.exit(checks.every((item) => item.ok) ? 0 : 1)
