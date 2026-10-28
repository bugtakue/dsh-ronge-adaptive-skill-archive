/**
 * Skill Studio — Host half.
 *
 * One bundle, three jobs:
 *   1. GET  /skill-studio/catalog.json?sessionId=... → catalog + recommendations + active skills
 *   2. POST /skill-studio/create                    → create a user skill
 *   3. session/event listener                        → completion chime (top-level turns only)
 *
 * The catalog is read through the live `ctx.skills` registry of the requesting
 * session's Agent when available, so it matches what that agent actually sees.
 * A filesystem scan is the fallback for agentless requests.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const inject = ['webServer', 'skills']

const DEFAULT_CHIME = '/System/Library/Sounds/Glass.aiff'
const CHIME_COOLDOWN_MS = 1500

const SOURCE_ORDER = {
  'project-dsh': 0,
  'project-agents': 1,
  profile: 2,
  'user-dsh': 3,
  'user-agents': 4,
  bundled: 5,
}

const ROUTING_SECTION = `## Skill Studio routing

The session header has a Skill Studio panel ("技能") with context-aware skill recommendations, active-skill tracking, and a completion chime. The session skill catalog stays authoritative; before starting a task, call the \`skill\` tool when a matching skill exists. Common routes: video / motion / HyperFrames → beat-promo-director, hyperframes, hyperframes-cli, hyperframes-registry, media-use; Office documents → office, office-docx, office-xlsx, office-pptx, office-render, office-export-pdf, office-recalculate; Harness plugins or UI → cordis-plugin-development, cordis-composition-reference; agent presets or compositions → editing-cordis-compositions; tool and skill design → agent-experience.`

function playChime() {
  const sound = process.env.DSH_TASK_CHIME_SOUND || DEFAULT_CHIME
  try {
    if (!sound || !fs.existsSync(sound)) return
    const child = spawn('/usr/bin/afplay', [sound], { stdio: 'ignore', detached: true })
    child.on('error', () => {})
    child.unref()
  } catch {
    // A failed chime must never affect the turn.
  }
}

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function dshHome() {
  return process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
}

function profileDir() {
  return process.env.DSH_PROFILE_DIR || ''
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(payload))
}

async function readJson(req, limit = 64 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new HttpError(413, 'request body is too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8') || '{}'
        resolve(JSON.parse(text))
      } catch {
        reject(new HttpError(400, 'request body must be valid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function parseFrontmatter(text) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)
  if (!match) return {}
  const data = {}
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (!field) continue
    let value = field[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    data[field[1]] = value
  }
  return data
}

function booleanish(value) {
  if (typeof value === 'boolean') return value
  const normalized = String(value ?? '').trim().toLowerCase()
  if (['true', 'yes', 'on', '1'].includes(normalized)) return true
  if (['false', 'no', 'off', '0'].includes(normalized)) return false
  return undefined
}

function skillRoots(cwd) {
  const roots = []
  const add = (rootPath, source) => {
    if (rootPath) roots.push({ path: rootPath, source })
  }
  add(path.join(cwd, '.dsh', 'skills'), 'project-dsh')
  add(path.join(cwd, '.agents', 'skills'), 'project-agents')
  if (profileDir()) add(path.join(profileDir(), 'skills'), 'profile')
  add(path.join(dshHome(), 'skills'), 'user-dsh')
  const agentsHome = process.env.DSH_AGENTS_HOME || path.join(os.homedir(), '.agents')
  add(path.join(agentsHome, 'skills'), 'user-agents')
  if (process.env.DSH_BUNDLED_SKILL_DIR) {
    add(process.env.DSH_BUNDLED_SKILL_DIR, 'bundled')
  }
  try {
    if (process.resourcesPath) {
      add(
        path.join(
          process.resourcesPath,
          'app.asar',
          'dsh',
          'node_modules',
          '@deepseek-ai',
          'dsh-agent-preset',
          'skills',
        ),
        'bundled',
      )
    }
  } catch {
    // Not an Electron host; a bundled root is optional.
  }
  return roots
}

function scanRoot(root) {
  const skills = []
  let entries
  try {
    entries = fs.readdirSync(root.path, { withFileTypes: true })
  } catch {
    return skills
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    let file
    if (entry.isDirectory()) {
      file = path.join(root.path, entry.name, 'SKILL.md')
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      file = path.join(root.path, entry.name)
    } else {
      continue
    }
    try {
      const stat = fs.statSync(file)
      if (!stat.isFile() || stat.size > 200_000) continue
      const text = fs.readFileSync(file, 'utf8')
      const front = parseFrontmatter(text)
      if (!front.name || !front.description) continue
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(front.name)) continue
      if (booleanish(front['disable-model-invocation']) === true) continue
      skills.push({
        name: front.name,
        description: front.description,
        whenToUse: front.whenToUse || front.when_to_use || undefined,
        source: root.source,
        provider: 'filesystem-scan',
        path: file,
        invocation: {
          modelInvocable: true,
          userInvocable: booleanish(front['user-invocable']) !== false,
        },
      })
    } catch {
      // A malformed or unreadable skill is skipped, matching the provider.
    }
  }
  return skills
}

function scanSkills(cwd) {
  const byName = new Map()
  for (const root of skillRoots(cwd)) {
    for (const skill of scanRoot(root)) {
      if (!byName.has(skill.name)) byName.set(skill.name, skill)
    }
  }
  return [...byName.values()]
}

function summarize(skill) {
  return {
    name: skill.name,
    description: skill.description,
    whenToUse: skill.whenToUse ?? null,
    source: skill.source,
    provider: skill.provider,
    path: skill.path ?? null,
    modelInvocable: skill.invocation?.modelInvocable !== false,
    userInvocable: skill.invocation?.userInvocable !== false,
  }
}

function sortSkills(skills) {
  return skills.sort((a, b) => {
    const bySource = (SOURCE_ORDER[a.source] ?? 99) - (SOURCE_ORDER[b.source] ?? 99)
    return bySource !== 0 ? bySource : a.name.localeCompare(b.name)
  })
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'this', 'that', 'use', 'when', 'you',
  'your', 'our', 'are', 'can', 'will', 'should', 'has', 'have', 'was', 'were',
  'been', 'not', 'but', 'all', 'any', 'one', 'two', 'how', 'what', 'why',
  'who', 'its', 'into', 'than', 'then', 'also', 'more', 'most', 'such', 'via',
  'per', 'out', 'off', 'over', 'under', 'about', 'after', 'before', 'between',
  'during', 'without', 'within', 'a', 'an', 'to', 'of', 'in', 'on', 'is', 'it',
  'as', 'by', 'or', 'we', 'if', 'do', 'does', 'did', 'be', 'at', 'so', 'no',
  'up', 'my', 'me', 'i', 'he', 'she', 'they', 'them', 'their', 'there', 'here',
  'these', 'those',
])

const CATEGORY_CUES = {
  video: ['视频', '宣传片', '抖音', '可灵', '剪辑', '分镜', '动画', '短片', '镜头', '音乐'],
  office: ['文档', '表格', 'ppt', 'word', 'excel', 'pdf', '演示', '报告', '排版'],
  harness: ['插件', 'harness', 'dsh', '面板', 'ui', '技能', 'bundle', 'slot', '主题'],
  composition: ['preset', 'composition', 'agent', '组合', '配置', '预设'],
}

function collectTexts(value, out = []) {
  if (typeof value === 'string') {
    const text = value.trim()
    if (text.length > 1) out.push(text)
    return out
  }
  if (Array.isArray(value)) {
    for (const item of value) collectTexts(item, out)
    return out
  }
  if (value && typeof value === 'object') {
    for (const key of ['text', 'content', 'message', 'prompt', 'query', 'title', 'description']) {
      if (Object.prototype.hasOwnProperty.call(value, key)) collectTexts(value[key], out)
    }
  }
  return out
}

const RUNTIME_LINE = /^(Time sampled|Current runtime context|Current working directory|Current DSH|Current DeepSeek|You are an AI|Browser time zone|The user may also|Use only names|Approval prompts|Tokens prefixed|Use the read tool|Use the glob|Use the grep|Track every background|web_search results|web_fetch returns|create_goal may|After session resume|Mark complete|Use the workflow|Start independent|Agent Teams is available|The Team Lead|To message another|The runtime context names|The browser provides)/i

function cleanUserText(parts) {
  const lines = parts
    .flatMap((part) => String(part).split(/\r?\n/))
    .map((line) => line.trim())
    .filter((line) => line && !RUNTIME_LINE.test(line))
  return lines.join(' ').replace(/\s+/g, ' ').trim()
}

function tokenize(text) {
  const value = String(text || '').toLowerCase()
  const tokens = new Set()
  for (const word of value.match(/[a-z0-9][a-z0-9_+.-]*/g) || []) {
    if (word.length >= 3 && !STOP_WORDS.has(word)) tokens.add(word)
  }
  for (const run of value.match(/[\u4e00-\u9fff]{2,}/g) || []) {
    for (let index = 0; index < run.length - 1; index += 1) {
      tokens.add(run.slice(index, index + 2))
    }
  }
  return tokens
}

function parseSkillArguments(raw) {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    // Fall through to the regex for a partially streamed argument string.
  }
  const match = /"name"\s*:\s*"([^"]+)"/.exec(raw)
  return match ? { name: match[1] } : undefined
}

function dedupeSkillCalls(calls) {
  const byName = new Map()
  for (const call of calls) {
    byName.delete(call.name)
    byName.set(call.name, call)
  }
  return [...byName.values()]
}

function categoryOf(name) {
  if (/^office/.test(name)) return 'office'
  if (/^(hyperframes|beat-promo|media-use)/.test(name)) return 'video'
  if (/^cordis|^editing-cordis/.test(name) || name === 'agent-experience') return 'harness'
  return 'other'
}

function analyzeSession(ctx, sessionId, cwd) {
  const empty = {
    running: false,
    activeSkills: [],
    recentSkills: [],
    contextText: '',
    lastUserText: '',
  }
  if (!sessionId) return empty
  let session
  try {
    session = ctx.get('sessions')?.get?.(sessionId)
  } catch {
    return empty
  }
  if (!session) return empty

  const seq = Number(session.seq || 0)
  let events = []
  try {
    events = session.snapshotEvents(Math.max(0, seq - 800))
  } catch {
    return empty
  }

  const userTexts = []
  const skillCalls = []
  let maxTurn = 0
  let lastType = ''
  for (const event of events) {
    lastType = event.type
    const turn = Number(event.data?.turn)
    if (Number.isFinite(turn) && turn > maxTurn) maxTurn = turn
    if (event.type === 'user/message') {
      const text = cleanUserText(collectTexts(event.data))
      if (text) userTexts.push(text.slice(0, 1200))
    }
    if (event.type === 'tool/call' && event.data?.name === 'skill') {
      const args = parseSkillArguments(event.data.arguments)
      const name = args?.name || args?.skill || args?.id
      if (typeof name === 'string' && name) {
        skillCalls.push({
          name,
          turn: Number(event.data.turn) || 0,
          step: Number(event.data.step) || 0,
          time: Number(event.time) || 0,
        })
      }
    }
  }

  const lastUserText = userTexts.slice(-1)[0] || ''
  let fileNames = []
  try {
    fileNames = fs
      .readdirSync(cwd, { withFileTypes: true })
      .filter((entry) => !entry.name.startsWith('.'))
      .slice(0, 80)
      .map((entry) => entry.name)
  } catch {
    // cwd may be a file or unavailable; recommendations still use messages.
  }

  const contextText = [userTexts.slice(-8).join('\n'), fileNames.join(' ')].join('\n').trim()
  return {
    running: lastType !== 'turn/end',
    activeSkills: dedupeSkillCalls(skillCalls.filter((call) => call.turn === maxTurn)).slice(-3),
    recentSkills: dedupeSkillCalls(skillCalls).slice(-6),
    contextText,
    lastUserText,
  }
}

function recommendSkills(skills, contextText) {
  if (!contextText) return []
  const contextTokens = tokenize(contextText)
  const contextLower = contextText.toLowerCase()
  const scored = []
  for (const skill of skills) {
    const skillText = [skill.name, skill.description, skill.whenToUse || ''].join(' ')
    const skillTokens = tokenize(skillText)
    let score = 0
    const reasons = []
    for (const token of skillTokens) {
      if (!contextTokens.has(token)) continue
      score += 1
      if (reasons.length < 6 && !reasons.includes(token)) reasons.push(token)
    }
    if (skill.name && contextLower.includes(skill.name.toLowerCase())) {
      score += 8
      if (!reasons.includes(skill.name)) reasons.unshift(skill.name)
    }
    const category = categoryOf(skill.name)
    for (const cue of CATEGORY_CUES[category] || []) {
      if (!contextLower.includes(cue.toLowerCase())) continue
      score += 0.6
      if (reasons.length < 6 && !reasons.includes(cue)) reasons.push(cue)
    }
    if (score > 0) {
      scored.push({
        ...skill,
        score: Math.round(score * 10) / 10,
        reasons: reasons.slice(0, 5),
      })
    }
  }
  return scored.sort((left, right) => right.score - left.score).slice(0, 4)
}

async function buildCatalog(ctx, config, sessionId) {
  let cwd = config?.cwd
  if (!cwd && sessionId) {
    try {
      cwd = ctx.get('sessions')?.get?.(sessionId)?.header?.cwd
    } catch {
      // Session header is optional for agentless requests.
    }
  }
  cwd = cwd || process.cwd()

  let view = ctx.skills
  let scoped = false
  if (sessionId) {
    try {
      const agent = ctx.get('agents')?.get?.(sessionId)
      const agentSkills = agent?.ctx?.skills
      if (agentSkills) {
        view = agentSkills
        scoped = true
      } else if (agent) {
        const presetSkills = ctx.get('agentPresets')?.serviceFor?.(agent, 'skills')
        if (presetSkills) {
          view = presetSkills
          scoped = true
        }
      }
    } catch {
      // Fall back to the global registry.
    }
  }

  let registry = []
  try {
    const listed = await view.list({ cwd })
    registry = listed.map((skill) => summarize(skill))
  } catch {
    // The filesystem scan below still gives the panel a usable catalog.
  }

  // Merge live-registry entries (bundled/programmatic providers, invocation
  // flags) with the filesystem scan (preset/user/project skills and paths).
  // The scan is what makes the panel complete before an agent-scoped service
  // is reachable from a plugin context.
  const merged = new Map()
  for (const skill of scanSkills(cwd).map((entry) => summarize(entry))) {
    merged.set(skill.name, skill)
  }
  for (const skill of registry) {
    const scanned = merged.get(skill.name)
    if (!scanned) {
      merged.set(skill.name, skill)
      continue
    }
    merged.set(skill.name, {
      ...scanned,
      ...skill,
      path: scanned.path || skill.path,
      source: scanned.source || skill.source,
      provider: scanned.provider || skill.provider,
    })
  }

  const summaries = sortSkills([...merged.values()])
  const analysis = analyzeSession(ctx, sessionId, cwd)
  const recommendations = analysis.contextText
    ? recommendSkills(summaries, analysis.contextText)
    : []
  return {
    ok: true,
    count: summaries.length,
    scope: scoped ? 'session+scan' : 'scan+registry',
    scoped,
    complete: true,
    sessionId: sessionId ?? null,
    cwd,
    generatedAt: new Date().toISOString(),
    skills: summaries,
    recommendations,
    activeSkills: analysis.activeSkills,
    recentSkills: analysis.recentSkills,
    running: analysis.running,
    contextPreview: analysis.lastUserText.slice(0, 160),
  }
}

function createSkill(payload) {
  const name = String(payload?.name ?? '').trim()
  const description = String(payload?.description ?? '').trim().replace(/\s+/g, ' ')
  const whenToUse = String(payload?.whenToUse ?? '').trim().replace(/\s+/g, ' ')
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
    throw new HttpError(400, 'name must be kebab-case, for example my-new-skill')
  }
  if (!description) throw new HttpError(400, 'description is required')
  if (description.length > 500) throw new HttpError(400, 'description must be at most 500 characters')
  if (whenToUse.length > 500) throw new HttpError(400, 'whenToUse must be at most 500 characters')

  const dir = path.join(dshHome(), 'skills', name)
  const file = path.join(dir, 'SKILL.md')
  if (fs.existsSync(dir)) throw new HttpError(409, `skill "${name}" already exists`)
  fs.mkdirSync(dir, { recursive: true })
  const frontmatter = [
    '---',
    `name: ${name}`,
    `description: ${JSON.stringify(description)}`,
  ]
  if (whenToUse) frontmatter.push(`whenToUse: ${JSON.stringify(whenToUse)}`)
  frontmatter.push('---', '')
  const body = `${frontmatter.join('\n')}
# ${name}

## When to use

${whenToUse || description}

## How to use

1. Confirm the task matches this skill.
2. Follow the instructions in this file.
3. Report the result with concrete evidence.
`
  fs.writeFileSync(file, body, { flag: 'wx' })
  return { ok: true, name, path: file }
}

function route(handler) {
  return async (req, res) => {
    try {
      await handler(req, res)
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500
      sendJson(res, status, {
        ok: false,
        error: error instanceof Error ? error.message : 'internal error',
      })
    }
  }
}

export function apply(ctx, config = {}) {
  const disposers = []
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/skill-studio/catalog.json',
      handler: route(async (req, res) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          throw new HttpError(405, 'method not allowed')
        }
        const url = new URL(req.url || '/', 'http://127.0.0.1')
        const sessionId = url.searchParams.get('sessionId') || undefined
        const payload = await buildCatalog(ctx, config, sessionId)
        if (req.method === 'HEAD') {
          res.writeHead(200, { 'cache-control': 'no-store' })
          res.end()
          return
        }
        sendJson(res, 200, payload)
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/skill-studio/create',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        const payload = await readJson(req)
        const created = createSkill(payload)
        sendJson(res, 201, created)
      }),
    }),
  )
  ctx.effect(() => () => {
    for (const dispose of disposers) dispose()
  })

  const systemPrompt = ctx.get('systemPrompt')
  if (systemPrompt) {
    ctx.effect(() =>
      systemPrompt.section({
        name: 'skill-studio',
        order: 880,
        text: ROUTING_SECTION,
      }),
    )
  }

  let lastChimeAt = 0
  ctx.effect(() =>
    ctx.on('session/event', (session, event) => {
      if (!event || event.type !== 'turn/end') return
      if (event.data?.reason?.kind !== 'completed') return
      const header = session?.header
      if (!header || header.parentSession || header.origin === 'subagent') return
      const now = Date.now()
      if (now - lastChimeAt < CHIME_COOLDOWN_MS) return
      lastChimeAt = now
      playChime()
    }),
  )
}
