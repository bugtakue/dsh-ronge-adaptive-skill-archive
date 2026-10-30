import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
const PKG_VERSION = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ronge-intel-'))
process.env.DSH_HOME = path.join(tmp, 'home')
process.env.DSH_AGENTS_HOME = path.join(tmp, 'agents')

const skills = JSON.parse(fs.readFileSync(new URL('./fixtures/eval-skills.json', import.meta.url), 'utf8'))
const routes = new Map()
const tools = new Map()
const ctx = {
  webServer: { register: ({ path: routePath, handler }) => { routes.set(routePath, handler); return () => routes.delete(routePath) } },
  skills: { list: async () => skills },
  get(name) {
    if (name === 'systemPrompt') return { section: () => () => {} }
    if (name === 'tools') return { register: (definition) => { tools.set(definition.name, definition); return () => tools.delete(definition.name) } }
    return undefined
  },
  effect(fn) { const dispose = fn(); return () => { if (typeof dispose === 'function') dispose() } },
  on: () => () => {},
}

const { apply } = await import('../index.js')
apply(ctx, { cwd: tmp })

function req({ method = 'GET', url = '/', body, headers = {} } = {}) {
  const request = new EventEmitter()
  request.method = method
  request.url = url
  request.headers = { 'content-type': 'application/json', ...headers }
  if (body !== undefined) {
    setImmediate(() => { request.emit('data', Buffer.from(JSON.stringify(body))); request.emit('end') })
  }
  return request
}

function call(routePath, options = {}) {
  const handler = routes.get(routePath)
  assert.ok(handler, 'route missing ' + routePath)
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout ' + routePath)), 5000)
    const res = {
      statusCode: 200,
      writeHead(status) { this.statusCode = status },
      end(payload) { clearTimeout(timer); resolve({ status: this.statusCode, body: payload ? JSON.parse(payload) : null }) },
    }
    Promise.resolve(handler(req(options), res)).catch(reject)
  })
}

test('intelligence endpoints return a plan, a draft and version/health', async () => {
  const plan = await call('/dsh-ronge-adaptive-skill-archive/intelligence/plan', {
    method: 'POST',
    body: { task: '帮我把这份 docx 合同逐条核对，另外配一段 30 秒宣传视频' },
  })
  assert.equal(plan.status, 200)
  assert.equal(plan.body.ok, true)
  assert.ok(Array.isArray(plan.body.plan.stages) && plan.body.plan.stages.length >= 1)
  assert.ok(plan.body.plan.primaryIntent)
  assert.ok(plan.body.diagnostics.installedCount >= 10, 'diagnostics expose installed skills')
  assert.ok(plan.body.plan.selected.some((skill) => skill.name === 'office-docx'), 'installed office-docx wins over library-only candidates')

  const draft = await call('/dsh-ronge-adaptive-skill-archive/intelligence/draft', {
    method: 'POST',
    body: { task: '做一个合同条款比对技能', missing: ['contract-review'] },
  })
  assert.equal(draft.status, 200)
  assert.equal(draft.body.ok, true)
  assert.match(draft.body.draft.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  assert.match(draft.body.draft.content, /^---/)
  assert.equal(draft.body.draft.lint.ok, true)

  const health = await call('/dsh-ronge-adaptive-skill-archive/health', { method: 'GET', url: '/dsh-ronge-adaptive-skill-archive/health' })
  assert.equal(health.status, 200)
  assert.equal(health.body.version, PKG_VERSION)
  assert.ok(health.body.libraryEntries > 0)

  const version = await call('/dsh-ronge-adaptive-skill-archive/version')
  assert.equal(version.status, 200)
  assert.equal(version.body.version, PKG_VERSION)
})

test('DSH native tools are registered without install/force capabilities', async () => {
  assert.ok(tools.has('skill_archive_plan'))
  assert.ok(tools.has('skill_archive_compose'))
  assert.ok(tools.has('skill_archive_draft_skill'))
  assert.equal([...tools.keys()].some((name) => /install|force/.test(name)), false)
  const planTool = tools.get('skill_archive_plan')
  assert.equal(planTool.parameters.required.includes('task'), true)
  const result = await planTool.execute({ task: '做一份 Excel 数据分析报告' })
  assert.equal(result.ok, true)
  assert.ok(result.plan)
})

test('cross-site mutating requests are rejected', async () => {
  const result = await call('/dsh-ronge-adaptive-skill-archive/intelligence/plan', {
    method: 'POST',
    body: { task: 'x' },
    headers: { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' },
  })
  assert.equal(result.status, 403)
})
