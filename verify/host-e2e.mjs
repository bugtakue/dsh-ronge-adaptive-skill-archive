/**
 * Host 端到端验证（v1.5.0）：真实 loopback HTTP + 真实 raw.githubusercontent.com 网络。
 * 不触碰用户 profile：DSH_HOME/DSH_AGENTS_HOME 指向临时目录。
 *
 *   node host-e2e.mjs
 */
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PRODUCT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'index.js')
const PDF = 'https://raw.githubusercontent.com/anthropics/skills/HEAD/skills/pdf/SKILL.md'
const DOCX = 'https://raw.githubusercontent.com/anthropics/skills/HEAD/skills/docx/SKILL.md'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ronge-e2e-'))
process.env.DSH_HOME = path.join(tmp, 'home')
process.env.DSH_AGENTS_HOME = path.join(tmp, 'agents')
const project = path.join(tmp, 'project')
fs.mkdirSync(project, { recursive: true })

const { apply } = await import('file://' + PRODUCT)

const routes = new Map()
const effects = []
const ctx = {
  webServer: {
    register({ path: routePath, handler }) {
      routes.set(routePath, handler)
      return () => routes.delete(routePath)
    },
  },
  skills: { list: async () => [] },
  get(name) {
    if (name === 'systemPrompt') return { section: () => () => {} }
    return undefined
  },
  effect(fn) {
    const dispose = fn()
    effects.push(dispose)
    return () => {}
  },
  on() {
    return () => {}
  },
}

const server = createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const handler = routes.get(url.pathname)
  if (!handler) {
    res.writeHead(404, { 'content-type': 'application/json' })
    res.end('{"ok":false,"error":"route not found"}')
    return
  }
  Promise.resolve(handler(req, res)).catch((error) => {
    res.writeHead(500, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: false, error: String(error) }))
  })
})

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const base = 'http://127.0.0.1:' + server.address().port
apply(ctx, { cwd: project })

const results = []
function pass(name, detail) {
  results.push({ ok: true, name })
  console.log(`PASS  ${name}${detail ? '  —  ' + detail : ''}`)
}
function fail(name, error) {
  results.push({ ok: false, name, error })
  console.log(`FAIL  ${name}  —  ${error && error.message ? error.message : error}`)
}
async function check(name, fn) {
  try {
    await fn()
    pass(name)
  } catch (error) {
    fail(name, error)
  }
}
async function api(routePath, { method = 'GET', body } = {}) {
  const response = await fetch(base + routePath, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const payload = await response.json().catch(() => ({}))
  return { status: response.status, body: payload }
}
const sha256 = (text) => createHash('sha256').update(text).digest('hex')
const home = process.env.DSH_HOME
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'))

try {
  // 1. 真实网络：preview 远端 SKILL.md + 安全/信任/许可
  let preview = null
  await check('preview real raw.githubusercontent.com SKILL.md', async () => {
    const { status, body } = await api('/dsh-ronge-adaptive-skill-archive/discover/preview?url=' + encodeURIComponent(PDF))
    assert.equal(status, 200)
    assert.equal(body.ok, true)
    assert.ok(body.content.length > 1000, 'content fetched')
    assert.equal(body.trust, 'official')
    assert.ok(body.security && ['low', 'medium', 'high'].includes(body.security.level))
    assert.ok('license' in body)
    preview = body
  })
  await check('preview rejects non-raw.githubusercontent URL', async () => {
    const { status, body } = await api('/dsh-ronge-adaptive-skill-archive/discover/preview?url=' + encodeURIComponent('https://example.com/x/SKILL.md'))
    assert.equal(status, 400)
    assert.equal(body.ok, false)
  })

  // 2. 真实网络：install → lock / source meta / 风险字段
  let installed = null
  await check('install real remote skill writes source meta + lock', async () => {
    const { status, body } = await api('/dsh-ronge-adaptive-skill-archive/discover/install', { method: 'POST', body: { url: PDF } })
    assert.equal(status, 201)
    assert.equal(body.ok, true)
    installed = body
    const dir = path.join(home, 'skills', body.name)
    assert.ok(fs.existsSync(path.join(dir, 'SKILL.md')))
    const source = readJson(path.join(dir, '.skill-studio-source.json'))
    assert.equal(source.trust, 'official')
    assert.equal(source.sha256, sha256(fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8')))
    const lock = readJson(path.join(home, 'dsh-ronge-adaptive-skill-archive', 'skills-lock.json'))
    assert.ok(lock.skills[body.name])
    assert.equal(lock.skills[body.name].trust, 'official')
    assert.equal(lock.skills[body.name].sha256, source.sha256)
  })

  // 3. catalog 附加 security / trust / license
  await check('catalog attaches security/trust/license to installed skill', async () => {
    const { status, body } = await api('/dsh-ronge-adaptive-skill-archive/catalog.json')
    assert.equal(status, 200)
    const skill = body.skills.find((item) => item.name === installed.name)
    assert.ok(skill, 'installed skill is in catalog')
    assert.equal(skill.trust, 'official')
    assert.ok(skill.security && typeof skill.security.level === 'string')
    assert.ok(body.experience && body.experience.health && body.experience.recFeedback)
  })

  // 4. 模拟本地版本落后：改写本地文件 + 把 source 指向另一个真实 SKILL.md
  const localVariant = ['---', 'name: ' + installed.name, 'description: local variant', '---', '# local', 'keep me'].join('\n')
  const installedFile = path.join(home, 'skills', installed.name, 'SKILL.md')
  const sourceFile = path.join(home, 'skills', installed.name, '.skill-studio-source.json')
  const sourceBefore = readJson(sourceFile)
  fs.writeFileSync(installedFile, localVariant)
  fs.writeFileSync(
    sourceFile,
    JSON.stringify({ ...sourceBefore, url: DOCX, sha256: sha256(localVariant), trust: 'official' }, null, 2),
  )

  await check('updates returns real diff from network', async () => {
    const { status, body } = await api('/dsh-ronge-adaptive-skill-archive/discover/updates')
    assert.equal(status, 200)
    const update = body.updates.find((item) => item.name === installed.name)
    assert.ok(update, 'update detected')
    assert.ok(update.diff.added > 0 || update.diff.removed > 0)
    assert.ok(Array.isArray(update.diff.lines) && update.diff.lines.length > 0)
    assert.ok('license' in update)
    assert.ok(update.risk === 'low' || update.risk === 'medium' || update.risk === 'high')
  })

  await check('update applies remote content, backs up, updates lock', async () => {
    const { status, body } = await api('/dsh-ronge-adaptive-skill-archive/discover/update', {
      method: 'POST',
      body: { name: installed.name },
    })
    assert.equal(status, 200, JSON.stringify(body))
    assert.equal(body.changed, true)
    assert.ok(body.diff.added > 0)
    const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || 'http://127.0.0.1:7897'
    const remote = execFileSync('curl', ['-fsSL', '--max-time', '20', '--proxy', proxy, DOCX], { encoding: 'utf8', maxBuffer: 512 * 1024 })
    assert.equal(fs.readFileSync(installedFile, 'utf8'), remote)
    assert.ok(fs.existsSync(body.backup), 'backup file exists')
    const lock = readJson(path.join(home, 'dsh-ronge-adaptive-skill-archive', 'skills-lock.json'))
    assert.equal(lock.skills[installed.name].sha256, sha256(remote))
    assert.equal(lock.skills[installed.name].previousSha256, sha256(localVariant))
  })

  await check('updates is clean after applying', async () => {
    const { body } = await api('/dsh-ronge-adaptive-skill-archive/discover/updates')
    assert.ok(!body.updates.some((item) => item.name === installed.name))
  })

  await check('rollback restores the previous version', async () => {
    const { status, body } = await api('/dsh-ronge-adaptive-skill-archive/discover/rollback', {
      method: 'POST',
      body: { name: installed.name },
    })
    assert.equal(status, 200)
    assert.equal(fs.readFileSync(installedFile, 'utf8'), localVariant)
    const lock = readJson(path.join(home, 'dsh-ronge-adaptive-skill-archive', 'skills-lock.json'))
    assert.equal(lock.skills[installed.name].sha256, sha256(localVariant))
  })

  // 5. 推荐反馈 / 经验导入导出 / 健康
  await check('recommend-feedback persists adopt/good/bad', async () => {
    const { status, body } = await api('/dsh-ronge-adaptive-skill-archive/recommend-feedback', {
      method: 'POST',
      body: { skillName: installed.name, verdict: 'adopt' },
    })
    assert.equal(status, 200)
    assert.equal(body.stats.adopt, 1)
    const feedback = readJson(path.join(home, 'dsh-ronge-adaptive-skill-archive', 'rec-feedback.json'))
    assert.equal(feedback.skills[installed.name].adopt, 1)
  })

  await check('experience export/import round-trip', async () => {
    const exported = await api('/dsh-ronge-adaptive-skill-archive/experience/export')
    assert.equal(exported.body.payload.version, 2)
    const imported = await api('/dsh-ronge-adaptive-skill-archive/experience/import', {
      method: 'POST',
      body: {
        payload: {
          version: 2,
          entries: [{ id: 'e2e-entry', skills: [installed.name], task: 'e2e task' }],
          skills: { [installed.name]: { uses: 4, successes: 3, good: 1, bad: 2, totalDurationMs: 8000, lastUsed: '2026-10-01T00:00:00Z' } },
          recFeedback: { [installed.name]: { adopt: 2, good: 1, bad: 0 } },
        },
      },
    })
    assert.equal(imported.status, 200)
    assert.equal(imported.body.addedEntries, 1)
    const again = await api('/dsh-ronge-adaptive-skill-archive/experience/export')
    const stat = again.body.payload.skills[installed.name]
    assert.equal(stat.uses, 4)
    assert.equal(stat.successes, 3)
    assert.equal(again.body.payload.recFeedback[installed.name].adopt, 2)
    assert.ok(again.body.payload.entries.some((entry) => entry.id === 'e2e-entry'))
  })

  await check('health reports installed + failing + licenseUnknown', async () => {
    const { status, body } = await api('/dsh-ronge-adaptive-skill-archive/health')
    assert.equal(status, 200)
    assert.ok(body.installed >= 1)
    assert.ok(Array.isArray(body.failing) && Array.isArray(body.licenseUnknown))
    assert.ok(body.failing.some((item) => item.name === installed.name), 'bad=2 is reported as failing')
  })

  await check('catalog experience.topSkills has successRate/avgDurationMs', async () => {
    const { body } = await api('/dsh-ronge-adaptive-skill-archive/catalog.json')
    const top = (body.experience.topSkills || []).find((item) => item.name === installed.name)
    assert.ok(top, 'topSkills contains installed skill')
    assert.equal(top.successRate, 0.75)
    assert.equal(top.avgDurationMs, 2000)
  })

  await check('catalog honors lang=zh and localizes intros', async () => {
    const zh = await api('/dsh-ronge-adaptive-skill-archive/catalog.json?lang=zh')
    assert.equal(zh.status, 200)
    assert.equal(zh.body.lang, 'zh')
    const skill = zh.body.skills.find((item) => item.name === installed.name)
    assert.ok(skill && skill.intro && /[\u4e00-\u9fff]/.test(skill.intro), 'zh intro for installed skill')
    const en = await api('/dsh-ronge-adaptive-skill-archive/catalog.json?lang=en')
    assert.equal(en.body.lang, 'en')
  })

  await check('library returns zh intro and category labels', async () => {
    const result = await api('/dsh-ronge-adaptive-skill-archive/library?q=pdf&lang=zh')
    assert.equal(result.status, 200)
    assert.equal(result.body.ok, true)
    assert.ok(result.body.categoryLabels && result.body.categoryLabels.ai)
    const entry = (result.body.entries || [])[0]
    if (entry) {
      assert.ok(entry.categoryLabel, 'category label')
      assert.ok(entry.intro && entry.intro.length > 0, 'intro')
    }
  })

  // 6. Self-evolution: snapshot → feedback attribution → auto-tune → rollback
  await check('evolution snapshot + manual evaluate', async () => {
    const snapshot = await api('/dsh-ronge-adaptive-skill-archive/evolution')
    assert.equal(snapshot.status, 200)
    assert.equal(snapshot.body.ok, true)
    assert.equal(snapshot.body.weights.name, 8)
    assert.equal(snapshot.body.canRollback, false)
    const evaluated = await api('/dsh-ronge-adaptive-skill-archive/evolution/evaluate', { method: 'POST', body: {} })
    assert.equal(evaluated.status, 200)
    assert.equal(evaluated.body.changed, 0)
  })

  await check('exploration quota + category weights are exposed and configurable', async () => {
    const snapshot = await api('/dsh-ronge-adaptive-skill-archive/evolution')
    assert.equal(snapshot.status, 200)
    assert.equal(snapshot.body.explorationRate, 0.1)
    assert.deepEqual(snapshot.body.categoryWeights, { video: 1, office: 1, harness: 1, other: 1 })
    assert.ok(snapshot.body.learning && typeof snapshot.body.learning.skillsTracked === 'number')
    const configured = await api('/dsh-ronge-adaptive-skill-archive/evolution/config', {
      method: 'POST',
      body: { explorationRate: 0.2 },
    })
    assert.equal(configured.status, 200)
    assert.equal(configured.body.explorationRate, 0.2)
    const restore = await api('/dsh-ronge-adaptive-skill-archive/evolution/config', {
      method: 'POST',
      body: { explorationRate: 0.1 },
    })
    assert.equal(restore.body.explorationRate, 0.1)
  })

  await check('feedback attribution auto-tunes a weight, rollback restores it', async () => {
    for (let index = 0; index < 10; index += 1) {
      const response = await api('/dsh-ronge-adaptive-skill-archive/recommend-feedback', {
        method: 'POST',
        body: { skillName: installed.name, verdict: 'good', kind: 'name' },
      })
      assert.equal(response.status, 200)
    }
    const evolved = await api('/dsh-ronge-adaptive-skill-archive/evolution')
    assert.ok(evolved.body.stats.observations >= 10)
    assert.ok(evolved.body.weights.name > 8, 'name weight grew from praised feedback')
    assert.ok(evolved.body.recentHistory.length >= 1)
    assert.equal(evolved.body.canRollback, true)
    const rollback = await api('/dsh-ronge-adaptive-skill-archive/evolution/rollback', { method: 'POST', body: {} })
    assert.equal(rollback.status, 200)
    assert.equal(rollback.body.weights.name, 8)
  })
  await check('v5 version endpoint reports 5.0.0', async () => {
    const { status, body } = await api('/dsh-ronge-adaptive-skill-archive/version')
    assert.equal(status, 200)
    assert.equal(body.version, '5.0.0')
  })
  await check('v5 intelligence plan endpoint returns a plan', async () => {
    const { status, body } = await api('/dsh-ronge-adaptive-skill-archive/intelligence/plan', {
      method: 'POST',
      body: { task: '帮我把这份 docx 合同逐条核对，另外配一段 30 秒宣传视频' },
    })
    assert.equal(status, 200)
    assert.equal(body.ok, true)
    assert.ok(Array.isArray(body.plan.stages) && body.plan.stages.length >= 1)
  })
  await check('v5 intelligence draft endpoint returns a draft without writing', async () => {
    const { status, body } = await api('/dsh-ronge-adaptive-skill-archive/intelligence/draft', {
      method: 'POST',
      body: { task: '做一个合同条款比对技能' },
    })
    assert.equal(status, 200)
    assert.equal(body.ok, true)
    assert.equal(body.draft.written, false)
    assert.match(body.draft.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  })
} finally {
  for (const dispose of effects) {
    try {
      if (typeof dispose === 'function') dispose()
    } catch {}
  }
  await new Promise((resolve) => server.close(resolve))
}

const passed = results.filter((item) => item.ok).length
const failed = results.length - passed
console.log(`\n${passed}/${results.length} passed, ${failed} failed`)
if (failed > 0) {
  for (const item of results.filter((entry) => !entry.ok)) console.log('  -', item.name, ':', item.error && item.error.message)
  process.exitCode = 1
}
