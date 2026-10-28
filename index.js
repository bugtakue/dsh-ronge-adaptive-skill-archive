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

const MODE_TEXT = {
  plan: `## Skill Studio plan mode

Plan mode is ON. Before acting, inspect the request and the installed skills, then present a short plan that names the 1–3 relevant skills and what you will do, and ask the user to confirm before proceeding. Do not execute or load skills until the user confirms. The point of the question is approval to proceed, not a choice between single and combined skills.`,
  immersive: `## Skill Studio immersive mode

Immersive mode is ON. Do not ask the user to confirm. Inspect the available skills, load the 1–3 most relevant with the \`skill\` tool, combine their instructions, execute the task, and state which skills you used and why.`,
}

const SKILL_INTROS = {
  'agent-experience': {
    zh: '工具与技能设计：让 Agent 更会做选择、少占上下文。',
    en: 'Tool, skill and context design so the agent chooses better with less context.',
  },
  'beat-promo-director': {
    zh: '卡点宣传片导演：音乐卡点、大字排版、10–40 秒动效短片。',
    en: 'Beat-synced promo director for 10–40s kinetic typography and motion shorts.',
  },
  'cordis-composition-reference': {
    zh: 'Cordis 组合参考：patch 语法、可安装插件清单。',
    en: 'Cordis composition reference: patch dialect and installable plugin packages.',
  },
  'cordis-plugin-development': {
    zh: '给 DSH 写、装、调插件的完整流程。',
    en: 'End-to-end workflow for authoring, installing and debugging DSH plugins.',
  },
  'editing-cordis-compositions': {
    zh: '编辑、验证 agent preset 与 Cordis 组合。',
    en: 'Edit and validate agent presets and Cordis compositions.',
  },
  hyperframes: {
    zh: '用 HTML 渲染视频的完整制作规范（先读）。',
    en: 'The complete HTML-to-video production contract for HyperFrames.',
  },
  'hyperframes-cli': {
    zh: 'HyperFrames 命令行：脚手架、预览、渲染、发布、排错。',
    en: 'HyperFrames CLI: scaffold, preview, render, publish and recover.',
  },
  'hyperframes-registry': {
    zh: '450+ 现成动效、转场、图表组件；先找现成的再自己做。',
    en: '450+ ready-made motion, transition and chart blocks to reuse.',
  },
  'media-use': {
    zh: '给视频找/做音乐、音效、图片、图标、配音、字幕、调色。',
    en: 'Source or create music, SFX, images, icons, voiceover, captions and grades.',
  },
  office: {
    zh: 'Office / PDF 总入口：Word、Excel、PPT、PDF 的创建、编辑、转换。',
    en: 'Office/PDF entry point: create, edit, inspect and convert DOCX, XLSX, PPTX and PDF.',
  },
  'office-docx': {
    zh: 'Word 文档的创建、读取、编辑和校验。',
    en: 'Create, read, edit and validate Word documents.',
  },
  'office-export-pdf': {
    zh: '把 Office 文档导出为 PDF（LibreOffice Kit）。',
    en: 'Export an Office document to PDF with LibreOffice Kit.',
  },
  'office-pptx': {
    zh: 'PowerPoint 演示的创建、读取、编辑和校验。',
    en: 'Create, read, edit and validate PowerPoint decks.',
  },
  'office-recalculate': {
    zh: 'Excel 公式重算与计算值校验。',
    en: 'Refresh spreadsheet formula caches and verify calculated values.',
  },
  'office-render': {
    zh: '把文档渲染成图片，检查版式。',
    en: 'Render documents to images and inspect layout.',
  },
  'office-xlsx': {
    zh: 'Excel 表格、数据和公式的读写与校验。',
    en: 'Read, create, edit and validate Excel workbooks, data and formulas.',
  },
}

function localizeSkill(skill, lang) {
  const known = SKILL_INTROS[skill.name]
  const intro = known ? known[lang] || known.en || known.zh : undefined
  if (intro) return { ...skill, intro }
  const description = String(skill.description || '')
  const hasChinese = /[\u4e00-\u9fff]/.test(description)
  if (lang === 'zh' && !hasChinese && skill.whenToUse) {
    return { ...skill, intro: `${description}（${skill.whenToUse}）` }
  }
  return { ...skill, intro: description }
}

function detectLang(contextText, fallback) {
  const text = String(contextText || '')
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length
  const latin = (text.match(/[A-Za-z]/g) || []).length
  if (cjk >= 4 && cjk >= latin) return 'zh'
  if (latin >= 4 && latin > cjk) return 'en'
  return fallback === 'zh' ? 'zh' : 'en'
}

let studioMode = 'plan'
let memory = { version: 1, updatedAt: null, entries: [], skills: {} }
let lastChimeAt = 0
const turnStates = new Map()

function studioDir() {
  return path.join(dshHome(), 'skill-studio')
}

function memoryFile() {
  return path.join(studioDir(), 'experience.json')
}

function memoryMarkdownFile() {
  return path.join(studioDir(), 'experience.md')
}

function modeFile() {
  return path.join(studioDir(), 'config.json')
}

function ensureStudioDir() {
  fs.mkdirSync(studioDir(), { recursive: true })
}

function loadStudioState() {
  try {
    const config = JSON.parse(fs.readFileSync(modeFile(), 'utf8'))
    if (config && ['off', 'plan', 'immersive'].includes(config.mode)) studioMode = config.mode
  } catch {
    studioMode = 'plan'
  }
  try {
    const saved = JSON.parse(fs.readFileSync(memoryFile(), 'utf8'))
    if (saved && Array.isArray(saved.entries) && saved.skills && typeof saved.skills === 'object') {
      memory = {
        version: 1,
        updatedAt: saved.updatedAt || null,
        entries: saved.entries.slice(-1000),
        skills: saved.skills,
      }
    }
  } catch {
    memory = { version: 1, updatedAt: null, entries: [], skills: {} }
  }
}

function saveStudioMode(next) {
  studioMode = next
  try {
    ensureStudioDir()
    fs.writeFileSync(modeFile(), JSON.stringify({ mode: next, updatedAt: new Date().toISOString() }, null, 2))
  } catch {
    // Mode still applies for this process even when persistence fails.
  }
}

function saveMemory() {
  try {
    ensureStudioDir()
    memory.updatedAt = new Date().toISOString()
    fs.writeFileSync(memoryFile(), JSON.stringify(memory, null, 2))
  } catch {
    // Memory is best-effort; never affect a turn.
  }
}

function appendMemoryMarkdown(entry) {
  try {
    ensureStudioDir()
    const file = memoryMarkdownFile()
    if (!fs.existsSync(file)) {
      fs.writeFileSync(
        file,
        '# Skill Studio · 经验记忆\n\n每次主任务完成后自动追加：任务、使用的 skills、结果摘要。\n',
      )
    }
    const lines = [
      '',
      `## ${entry.time} · ${entry.task.slice(0, 60) || '未命名任务'}`,
      `- Skills: ${entry.skills.map((name) => '`' + name + '`').join(', ')}`,
      `- Outcome: ${entry.outcome.slice(0, 300) || '（无摘要）'}`,
      `- Session: ${entry.sessionId}`,
      entry.durationMs ? `- Duration: ${Math.round(entry.durationMs / 1000)}s` : '',
      '',
    ].filter(Boolean)
    fs.appendFileSync(file, lines.join('\n'))
  } catch {
    // Best-effort.
  }
}

function recordExperience(sessionId, header, state) {
  const skills = [...state.skills].filter(Boolean)
  if (skills.length === 0) return
  const task = (state.userTexts.find((text) => text && text.length > 1) || '').slice(0, 240)
  const outcome = (state.assistant || '').slice(0, 500)
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: new Date().toISOString(),
    sessionId: String(sessionId),
    cwd: header?.cwd || null,
    task,
    skills,
    outcome,
    durationMs: Date.now() - state.start,
  }
  memory.entries.push(entry)
  if (memory.entries.length > 1000) memory.entries = memory.entries.slice(-1000)
  for (const name of skills) {
    const previous = memory.skills[name] || { uses: 0, successes: 0, good: 0, bad: 0, lastUsed: null }
    memory.skills[name] = {
      uses: previous.uses + 1,
      successes: previous.successes + 1,
      good: previous.good || 0,
      bad: previous.bad || 0,
      lastUsed: entry.time,
    }
  }
  saveMemory()
  appendMemoryMarkdown(entry)
}

function appendFeedbackMarkdown(entry, rating) {
  try {
    ensureStudioDir()
    const file = memoryMarkdownFile()
    if (!fs.existsSync(file)) return
    fs.appendFileSync(
      file,
      `\n### 反馈 ${new Date().toISOString()}\n- Task: ${entry.task.slice(0, 60) || '未命名任务'}\n- Rating: ${rating === 'good' ? '👍' : '👎'}\n`,
    )
  } catch {
    // Best-effort.
  }
}

function recordFeedback(id, rating) {
  const entry = memory.entries.find((candidate) => candidate.id === id)
  if (!entry) return undefined
  const previous = entry.rating
  if (previous === rating) return entry
  entry.rating = rating
  for (const name of entry.skills) {
    const stat = memory.skills[name] || { uses: 0, successes: 0, good: 0, bad: 0, lastUsed: null }
    if (previous === 'good') stat.good = Math.max(0, (stat.good || 0) - 1)
    if (previous === 'bad') stat.bad = Math.max(0, (stat.bad || 0) - 1)
    if (rating === 'good') stat.good = (stat.good || 0) + 1
    if (rating === 'bad') stat.bad = (stat.bad || 0) + 1
    memory.skills[name] = stat
  }
  saveMemory()
  appendFeedbackMarkdown(entry, rating)
  return entry
}

function experienceSnapshot() {
  const topSkills = Object.entries(memory.skills)
    .map(([name, stat]) => ({ name, ...stat }))
    .sort((left, right) => right.uses - left.uses)
    .slice(0, 8)
  return {
    topSkills,
    recent: memory.entries.slice(-5).reverse(),
    totalEntries: memory.entries.length,
    path: memoryMarkdownFile(),
  }
}

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

const RUNTIME_LINE = /^(Time sampled|Elapsed since|Current runtime context|Current working directory|Current DSH|Current DeepSeek|You are an AI|You are a coding agent|You are the Team Lead|Browser time zone|The user may also|Use only names|Approval prompts|Tokens prefixed|Use the read tool|Use the glob|Use the grep|Track every background|web_search results|web_fetch returns|create_goal may|After session resume|Mark complete|Use the workflow|Start independent|Agent Teams is available|The Team Lead|To message another|The runtime context names|The browser provides|The available skill catalog changed|system-reminder|This snapshot supersedes|Use list_agents|Use send_message|Use the target|Check the \[exit code)/i

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
    events = session.snapshotEvents(Math.max(0, seq - 3000))
  } catch {
    return empty
  }

  const userTexts = []
  const eventUserTexts = []
  const skillCalls = []
  let maxTurn = 0
  let lastType = ''
  try {
    for (const message of session.deriveMessages()) {
      if (!message || message.role !== 'user') continue
      const text = cleanUserText(collectTexts(message))
      if (text) userTexts.push(text.slice(0, 1200))
    }
  } catch {
    // Derivation is optional; event messages below are the fallback.
  }
  for (const event of events) {
    lastType = event.type
    const turn = Number(event.data?.turn)
    if (Number.isFinite(turn) && turn > maxTurn) maxTurn = turn
    if (event.type === 'user/message') {
      const text = cleanUserText(collectTexts(event.data))
      if (text) eventUserTexts.push(text.slice(0, 1200))
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

  if (userTexts.length === 0) userTexts.push(...eventUserTexts)
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

function recommendSkills(skills, contextText, skillStats = {}) {
  if (!contextText) return []
  const contextTokens = tokenize(contextText)
  const contextLower = contextText.toLowerCase()
  const scored = []
  for (const skill of skills) {
    const skillText = [skill.name, skill.description, skill.whenToUse || '', skill.intro || ''].join(' ')
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
    const stat = skillStats[skill.name]
    if (stat && stat.uses > 0) {
      const good = Number(stat.good || 0)
      const bad = Number(stat.bad || 0)
      const completion = good + bad === 0 ? Math.min(2, (stat.successes || stat.uses) * 0.25) : 0
      const boost = Math.min(4, good * 0.8) - Math.min(2, bad * 0.5) + completion
      score += boost
      if (reasons.length < 6) {
        reasons.push(good > 0 ? `好评×${good}` : bad > 0 ? `差评×${bad}` : `完成×${stat.successes || stat.uses}`)
      }
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

async function buildCatalog(ctx, config, sessionId, lang) {
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

  const analysis = analyzeSession(ctx, sessionId, cwd)
  const language = detectLang(analysis.contextText, lang)
  const summaries = sortSkills([...merged.values()]).map((skill) => localizeSkill(skill, language))
  const recommendations = analysis.contextText
    ? recommendSkills(summaries, analysis.contextText, memory.skills)
    : []
  return {
    ok: true,
    count: summaries.length,
    scope: scoped ? 'session+scan' : 'scan+registry',
    scoped,
    complete: true,
    sessionId: sessionId ?? null,
    cwd,
    lang: language,
    generatedAt: new Date().toISOString(),
    skills: summaries,
    recommendations,
    activeSkills: analysis.activeSkills,
    recentSkills: analysis.recentSkills,
    running: analysis.running,
    contextPreview: analysis.lastUserText.slice(0, 160),
    mode: studioMode,
    experience: experienceSnapshot(),
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
  loadStudioState()
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
        const langParam = url.searchParams.get('lang')
        const lang = langParam === 'zh' || langParam === 'en' ? langParam : undefined
        const payload = await buildCatalog(ctx, config, sessionId, lang)
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
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/skill-studio/mode',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        const payload = await readJson(req)
        const next = String(payload?.mode ?? '')
        if (!['off', 'plan', 'immersive'].includes(next)) {
          throw new HttpError(400, 'mode must be off, plan, or immersive')
        }
        saveStudioMode(next)
        sendJson(res, 200, { ok: true, mode: next })
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/skill-studio/feedback',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        const payload = await readJson(req)
        const id = String(payload?.id ?? '')
        const rating = String(payload?.rating ?? '')
        if (!id) throw new HttpError(400, 'id is required')
        if (rating !== 'good' && rating !== 'bad') throw new HttpError(400, 'rating must be good or bad')
        const entry = recordFeedback(id, rating)
        if (!entry) throw new HttpError(404, 'experience entry not found')
        sendJson(res, 200, { ok: true, entry })
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
    ctx.effect(() =>
      systemPrompt.section({
        name: 'skill-studio-mode',
        order: 881,
        text: () => MODE_TEXT[studioMode] || '',
      }),
    )
  }

  ctx.effect(() =>
    ctx.on('session/event', (session, event) => {
      if (!event || !session) return
      const header = session.header
      if (!header) return
      const topLevel = !header.parentSession && header.origin !== 'subagent'
      const sid = String(session.id)

      if (event.type === 'turn/start') {
        turnStates.set(sid, {
          turn: Number(event.data?.turn) || 0,
          start: Date.now(),
          userTexts: [],
          skills: new Set(),
          assistant: '',
        })
        return
      }

      if (event.type === 'user/message') {
        let state = turnStates.get(sid)
        if (!state) {
          state = { turn: 0, start: Date.now(), userTexts: [], skills: new Set(), assistant: '' }
          turnStates.set(sid, state)
        }
        const text = cleanUserText(collectTexts(event.data))
        if (text) state.userTexts.push(text.slice(0, 1200))
        return
      }

      if (event.type === 'tool/call' && event.data?.name === 'skill') {
        const state = turnStates.get(sid)
        if (!state) return
        const args = parseSkillArguments(event.data.arguments)
        const name = args?.name || args?.skill || args?.id
        if (typeof name === 'string' && name) state.skills.add(name)
        return
      }

      if (event.type === 'assistant/message') {
        const state = turnStates.get(sid)
        if (!state) return
        const text = cleanUserText(collectTexts(event.data))
        if (text) state.assistant = text
        return
      }

      if (event.type !== 'turn/end') return
      const state = turnStates.get(sid)
      const completed = event.data?.reason?.kind === 'completed'
      if (topLevel && completed) {
        if (state) recordExperience(sid, header, state)
        const now = Date.now()
        if (now - lastChimeAt >= CHIME_COOLDOWN_MS) {
          lastChimeAt = now
          playChime()
        }
      }
      turnStates.delete(sid)
    }),
  )
}

export { detectLang, localizeSkill, parseSkillArguments, recommendSkills, tokenize }
