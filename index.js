/**
 * 荣哥技能卷轴收藏馆（可沉浸式体验版本 / ronge-adaptive-skill-archive） — Host half.
 *
 * One bundle, three jobs:
 *   1. GET  /ronge-adaptive-skill-archive/catalog.json?sessionId=... → catalog + recommendations + active skills
 *   2. POST /ronge-adaptive-skill-archive/create                    → create a user skill
 *   3. session/event listener                        → completion chime (top-level turns only)
 *
 * The catalog is read through the live `ctx.skills` registry of the requesting
 * session's Agent when available, so it matches what that agent actually sees.
 * A filesystem scan is the fallback for agentless requests.
 */
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const inject = ['webServer', 'skills']

const PACKAGE_DIR = path.dirname(fileURLToPath(import.meta.url))
const DEFAULT_CHIME = '/System/Library/Sounds/Glass.aiff'
const CHIME_COOLDOWN_MS = 1500

const MODE_TEXT = {
  plan: `## 荣哥技能卷轴收藏馆（可沉浸式体验版本） plan mode

Plan mode is ON. Before acting, inspect the request and the installed skills, then present a short plan that names the 1–3 relevant skills and what you will do, and ask the user to confirm before proceeding. Do not execute or load skills until the user confirms. The point of the question is approval to proceed, not a choice between single and combined skills.`,
  immersive: `## 荣哥技能卷轴收藏馆（可沉浸式体验版本） immersive mode

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
  pdf: {
    zh: 'PDF 处理：抽取文本/表格、填表、合并与拆页。',
    en: 'Work with PDFs: extract text/tables, fill forms, merge and split.',
  },
  docx: {
    zh: 'Word 文档创建与编辑（Anthropic 官方技能）。',
    en: 'Create and edit Word documents (Anthropic skill).',
  },
  xlsx: {
    zh: 'Excel 工作簿创建与编辑（Anthropic 官方技能）。',
    en: 'Create and edit Excel workbooks (Anthropic skill).',
  },
  pptx: {
    zh: 'PowerPoint 演示创建与编辑（Anthropic 官方技能）。',
    en: 'Create and edit PowerPoint decks (Anthropic skill).',
  },
  'frontend-design': {
    zh: '前端界面设计：布局、配色、组件与响应式。',
    en: 'Frontend design: layouts, color, components and responsive UI.',
  },
  'brand-guidelines': {
    zh: '品牌规范：把视觉与文案风格统一到产品里。',
    en: 'Brand guidelines for consistent visual and voice styles.',
  },
  'skill-creator': {
    zh: '创建/打磨 skill：结构、触发描述与评测。',
    en: 'Create and refine skills: structure, triggering and evals.',
  },
  'mcp-builder': {
    zh: '构建 MCP server：工具定义、传输与调试。',
    en: 'Build MCP servers: tool definitions, transports and debugging.',
  },
  'webapp-testing': {
    zh: 'Web 应用测试：起服务、点页面、抓失败现场。',
    en: 'Web app testing: start the app, drive the page, capture failures.',
  },
  'canvas-design': {
    zh: '画布/海报设计：版式、视觉层次与导出。',
    en: 'Canvas and poster design: layout, visual hierarchy and export.',
  },
  'algorithmic-art': {
    zh: '算法艺术：用代码生成图形与图案。',
    en: 'Algorithmic art: generate graphics and patterns with code.',
  },
  'internal-comms': {
    zh: '内部沟通写作：公告、周报、状态同步。',
    en: 'Internal communications: announcements, updates and status notes.',
  },
  'theme-factory': {
    zh: '主题工厂：快速生成配色与视觉主题。',
    en: 'Theme factory: generate color schemes and visual themes.',
  },
  'slack-gif-creator': {
    zh: '做 Slack 用的 GIF 动图。',
    en: 'Create GIFs sized for Slack.',
  },
  'artifacts-builder': {
    zh: '把页面/组件打包成可分享的 artifacts。',
    en: 'Bundle pages and components into shareable artifacts.',
  },
  'web-artifacts-builder': {
    zh: '打包 Web artifacts：HTML/CSS/JS 单文件交付。',
    en: 'Build web artifacts as single-file HTML/CSS/JS deliverables.',
  },
}

const LIBRARY_CATEGORY_LABELS = {
  ai: 'AI',
  coding: '编程',
  design: '设计',
  data: '数据',
  writing: '写作',
  video: '视频',
  office: '办公',
  research: '研究',
  security: '安全',
  marketing: '营销',
  business: '商业',
  productivity: '效率',
  education: '教育',
  other: '其他',
}

const INTRO_HINTS = [
  [/video|motion|animation|footage|reel|clip/i, '视频/动效'],
  [/image|photo|graphic|illustration|icon|svg/i, '图片/图形'],
  [/music|audio|sound|voice|speech|sfx/i, '音频/配音'],
  [/document|docx|word|\.pdf\b|report|contract/i, '文档/报告'],
  [/spreadsheet|excel|xlsx|formula|csv|data table/i, '表格/公式'],
  [/slide|presentation|pptx|deck/i, '演示/幻灯片'],
  [/format|convert|export|render|preview/i, '格式转换/渲染'],
  [/test|testing|qa|assert|playwright|browser/i, '测试/验证'],
  [/design|ui|ux|layout|style|theme|css/i, '界面/设计'],
  [/code|coding|program|developer|refactor|debug|api/i, '编程/开发'],
  [/data|analysis|analytics|insight|metric|sql/i, '数据分析'],
  [/research|search|scrape|retrieval|knowledge/i, '检索/研究'],
  [/security|auth|vulnerab|scan|audit|permission/i, '安全/审计'],
  [/marketing|seo|ad(s|vertising)?\b|growth|social/i, '营销/增长'],
  [/writ(e|ing)|copy|content|blog|article|email/i, '写作/文案'],
  [/skill|prompt|agent|llm|ai\b|model/i, 'AI/技能'],
  [/plugin|extension|bundle|hook|mcp|server|tool/i, '插件/工具'],
  [/office|doc|excel|ppt|pdf/i, '办公文档'],
]

const LOCAL_CATEGORY_LABELS = { video: '视频/动效', office: '办公文档', harness: 'Harness 插件', other: '通用' }

function conciseChineseIntro(skill) {
  const text = [skill.name, skill.description, skill.whenToUse || ''].join(' ')
  const hints = []
  for (const [pattern, label] of INTRO_HINTS) {
    if (pattern.test(text) && !hints.includes(label)) hints.push(label)
  }
  const category = categoryOf(skill.name)
  const categoryLabel = LOCAL_CATEGORY_LABELS[category] || LOCAL_CATEGORY_LABELS.other
  const head = `「${categoryLabel}」技能` + (hints.length ? `，涉及${hints.slice(0, 3).join('、')}` : '')
  const description = String(skill.description || '').replace(/\s+/g, ' ').trim()
  const tail = description ? `。原文：${description.slice(0, 120)}` : ''
  return head + tail
}

function localizeSkill(skill, lang) {
  const known = SKILL_INTROS[skill.name]
  const intro = known ? known[lang] || known.en || known.zh : undefined
  if (intro) return { ...skill, intro }
  const description = String(skill.description || '')
  const hasChinese = /[\u4e00-\u9fff]/.test(description)
  if (lang === 'zh') {
    if (hasChinese) return { ...skill, intro: description }
    return { ...skill, intro: conciseChineseIntro(skill), introGenerated: true }
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

const LEGACY_STUDIO_DIR_NAME = 'skill-studio'
const STUDIO_DIR_NAME = 'ronge-adaptive-skill-archive'

function legacyStudioDir() {
  return path.join(dshHome(), LEGACY_STUDIO_DIR_NAME)
}

function studioDir() {
  return path.join(dshHome(), STUDIO_DIR_NAME)
}

function migrateLegacyStudioDir() {
  const legacy = legacyStudioDir()
  const current = studioDir()
  if (fs.existsSync(current) || !fs.existsSync(legacy)) return
  try {
    fs.cpSync(legacy, current, { recursive: true })
  } catch {
    // Migration is best-effort; the old directory is never deleted.
  }
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
  migrateLegacyStudioDir()
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
  const task = (state.userTexts.find((text) => text && text.length > 1 && isHumanUserText(text)) || '').slice(0, 240)
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
      totalDurationMs: Number(previous.totalDurationMs || 0) + entry.durationMs,
      failureStreak: 0,
      lastUsed: entry.time,
    }
  }
  saveMemory()
  appendMemoryMarkdown(entry)
  const evolution = loadEvolution()
  evolution.stats.tasks = Number(evolution.stats.tasks || 0) + 1
  for (const name of skills) noteSkillOutcome(name, 1)
  saveEvolution()
}

function recordFailedTurn(sessionId, header, state) {
  const skills = [...state.skills].filter(Boolean)
  if (skills.length === 0) return
  const time = new Date().toISOString()
  for (const name of skills) noteSkillOutcome(name, -1)
  for (const name of skills) {
    const previous = memory.skills[name] || { uses: 0, successes: 0, good: 0, bad: 0, lastUsed: null }
    memory.skills[name] = {
      ...previous,
      uses: Number(previous.uses || 0) + 1,
      failureStreak: Number(previous.failureStreak || 0) + 1,
      lastUsed: time,
    }
  }
  saveMemory()
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
  noteExperienceFeedback(entry.skills, rating)
  saveEvolution()
  maybeEvolve()
  return entry
}

function experienceSnapshot(cwd) {
  const aggregate = aggregateSkillStats(memory.skills)
  const topSkills = Object.values(aggregate)
    .sort((left, right) => right.uses - left.uses || left.name.localeCompare(right.name))
    .slice(0, 8)
  const feedback = loadRecFeedback()
  return {
    topSkills,
    recent: memory.entries.slice(-5).reverse(),
    totalEntries: memory.entries.length,
    path: memoryMarkdownFile(),
    health: experienceHealth(memory.skills, cwd),
    recFeedback: { skills: feedback.skills, updatedAt: feedback.updatedAt },
  }
}

// --- Security & trust (G1) -------------------------------------------------
// Local, heuristic scan of a SKILL.md. It never uploads anything and never
// executes a skill: it only flags the instruction text a user is about to trust.
const RISK_RULES = [
  {
    id: 'shell-exec',
    label: 'shell 执行',
    severity: 'high',
    pattern: /\b(?:child_process|execSync|spawnSync|os\.system|subprocess\.(?:run|call|Popen))\b/i,
  },
  {
    id: 'pipe-to-shell',
    label: '下载后直接执行',
    severity: 'high',
    pattern: /(?:curl|wget)[^\n|]{0,200}\|\s*(?:sh|bash|zsh)\b/i,
  },
  {
    id: 'dynamic-eval',
    label: '动态执行/解码',
    severity: 'high',
    pattern: /\b(?:(?:eval|new Function)\s*\(|base64\s+-d\b|atob\s*\()/i,
  },
  {
    id: 'prompt-injection',
    label: '提示注入模式',
    severity: 'high',
    pattern:
      /(?:ignore|disregard|forget)\s+(?:all\s+)?(?:the\s+)?(?:previous|prior|above|earlier)\s+(?:instructions|rules|prompts)|system\s+prompt|jailbreak/i,
  },
  {
    id: 'network',
    label: '网络访问',
    severity: 'medium',
    pattern: /\b(?:curl|wget|https?:\/\/|fetch\s*\(|requests\.(?:get|post)|axios\b)/i,
  },
  {
    id: 'credentials',
    label: '凭据/密钥访问',
    severity: 'medium',
    pattern:
      /(?:\.ssh\/|id_rsa|\.aws\/credentials|(?:^|[^.\w])\.env\b|keychain|\.netrc|\.npmrc|api[_-]?key|secret[_-]?key)/i,
  },
  {
    id: 'file-write',
    label: '文件系统写入/提权',
    severity: 'low',
    pattern: /\b(?:rm\s+-rf|sudo\s+|chmod\s+\+?x|\bwriteFileSync\b|\bwriteFile\b)/i,
  },
]

const RISK_WEIGHT = { high: 40, medium: 15, low: 5 }

function scanSkillText(text) {
  const source = String(text || '')
  const lines = source.split(/\r?\n/)
  const findings = []
  for (const rule of RISK_RULES) {
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      if (!line || line.length > 4000) continue
      if (!rule.pattern.test(line)) continue
      findings.push({
        rule: rule.id,
        label: rule.label,
        severity: rule.severity,
        line: index + 1,
        excerpt: line.trim().slice(0, 120),
      })
      break
    }
  }
  const frontmatter = parseFrontmatter(source)
  const allowedTools = String(frontmatter['allowed-tools'] || '')
  if (
    allowedTools &&
    (allowedTools.includes('*') || /(?:^|[\s,])(?:Bash|shell|bash)(?:[\s,]|$)/.test(allowedTools))
  ) {
    findings.push({
      rule: 'broad-tools',
      label: 'allowed-tools 过宽',
      severity: 'medium',
      line: 1,
      excerpt: ('allowed-tools: ' + allowedTools).slice(0, 120),
    })
  }
  const score = findings.reduce((total, finding) => total + (RISK_WEIGHT[finding.severity] || 0), 0)
  const level = findings.some((finding) => finding.severity === 'high')
    ? 'high'
    : score >= RISK_WEIGHT.medium
      ? 'medium'
      : 'low'
  return { level, score, findings: findings.slice(0, 8) }
}

const OFFICIAL_ORGS = new Set(['anthropics', 'openai', 'github', 'microsoft', 'google', 'aws', 'vercel-labs'])

function classifyTrust(skill, sourceMeta) {
  const meta = sourceMeta || {}
  const recorded = String(meta.trust || '').toLowerCase()
  if (recorded === 'official' || recorded === 'verified') return recorded
  const repo = String(meta.repo || '').toLowerCase()
  const org = repo.includes('/') ? repo.split('/')[0] : ''
  if (org && OFFICIAL_ORGS.has(org)) return 'official'
  if (repo) return 'community'
  if (skill && skill.source === 'bundled') return 'official'
  if (skill && ['project-dsh', 'project-agents', 'profile', 'user-dsh', 'user-agents'].includes(skill.source)) {
    return 'local'
  }
  return 'unknown'
}

const securityCache = new Map()

function securityForSkill(skill) {
  const fallback = { trust: classifyTrust(skill, null), license: null, security: null }
  if (!skill || !skill.path) return fallback
  try {
    const stat = fs.statSync(skill.path)
    const key = skill.path + ':' + stat.mtimeMs
    const cached = securityCache.get(key)
    if (cached) return cached
    const text = fs.readFileSync(skill.path, 'utf8')
    const frontmatter = parseFrontmatter(text)
    const sourceMeta = readJsonFile(path.join(path.dirname(skill.path), SOURCE_META_FILE), null)
    const result = {
      trust: classifyTrust(skill, sourceMeta),
      license: frontmatter.license ? String(frontmatter.license) : null,
      security: scanSkillText(text),
    }
    if (securityCache.size > 800) securityCache.clear()
    securityCache.set(key, result)
    return result
  } catch {
    return fallback
  }
}

// --- Update diff / lockfile / rollback (G5) --------------------------------
function diffSkillLines(before, after, maxLines = 60) {
  const left = String(before ?? '').split(/\r?\n/)
  const right = String(after ?? '').split(/\r?\n/)
  let start = 0
  while (start < left.length && start < right.length && left[start] === right[start]) start += 1
  let endLeft = left.length - 1
  let endRight = right.length - 1
  while (endLeft >= start && endRight >= start && left[endLeft] === right[endRight]) {
    endLeft -= 1
    endRight -= 1
  }
  const lines = []
  let removed = 0
  let added = 0
  for (let index = start; index <= endLeft; index += 1) {
    removed += 1
    if (lines.length < maxLines) lines.push({ type: '-', text: String(left[index]).slice(0, 160) })
  }
  for (let index = start; index <= endRight; index += 1) {
    added += 1
    if (lines.length < maxLines) lines.push({ type: '+', text: String(right[index]).slice(0, 160) })
  }
  return { added, removed, changedAtLine: start + 1, lines }
}

function lockFile() {
  return path.join(studioDir(), 'skills-lock.json')
}

function loadLock() {
  const data = readJsonFile(lockFile(), null)
  if (data && data.skills && typeof data.skills === 'object') return data
  return { version: 1, updatedAt: null, skills: {} }
}

function saveLock(lock) {
  lock.version = 1
  lock.updatedAt = new Date().toISOString()
  writeJsonFile(lockFile(), lock)
}

function upsertLock(entry) {
  if (!entry || !entry.name) return null
  const lock = loadLock()
  const previous = lock.skills[entry.name] || {}
  const next = { ...previous, ...entry, updatedAt: new Date().toISOString() }
  if (!entry.previousSha256 && previous.sha256 && previous.sha256 !== next.sha256) {
    next.previousSha256 = previous.sha256
    next.previousUpdatedAt = previous.updatedAt || null
  }
  lock.skills[entry.name] = next
  saveLock(lock)
  return next
}

function backupsDir(name) {
  return path.join(studioDir(), 'backups', name)
}

function backupSkillFile(name, text) {
  const dir = backupsDir(name)
  fs.mkdirSync(dir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const file = path.join(dir, stamp + '.md')
  fs.writeFileSync(file, String(text ?? ''))
  return file
}

function listBackups(name) {
  try {
    return fs
      .readdirSync(backupsDir(name))
      .filter((file) => file.endsWith('.md'))
      .map((file) => {
        const full = path.join(backupsDir(name), file)
        const stat = fs.statSync(full)
        return { file: full, name: file, mtime: stat.mtimeMs }
      })
      .sort((left, right) => right.mtime - left.mtime)
  } catch {
    return []
  }
}

function installedSkillDir(name) {
  const normalized = String(name || '').trim()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    throw new HttpError(400, 'skill name must be kebab-case')
  }
  return path.join(dshHome(), 'skills', normalized)
}

async function applySkillUpdate(name) {
  const dir = installedSkillDir(name)
  const file = path.join(dir, 'SKILL.md')
  if (!fs.existsSync(file)) throw new HttpError(404, 'skill "' + name + '" is not installed')
  const source = readJsonFile(path.join(dir, SOURCE_META_FILE), null)
  if (!source || !source.url) throw new HttpError(400, 'skill "' + name + '" has no recorded source')
  const localText = fs.readFileSync(file, 'utf8')
  const { text: remoteText } = await fetchRemoteSkill(source.url)
  if (sha256(remoteText) === source.sha256) {
    return { ok: true, name, changed: false, diff: { added: 0, removed: 0, lines: [] } }
  }
  const backup = backupSkillFile(name, localText)
  fs.writeFileSync(file, remoteText)
  const frontmatter = parseFrontmatter(remoteText)
  const license = frontmatter.license ? String(frontmatter.license) : null
  const nextSource = {
    ...source,
    sha256: sha256(remoteText),
    license,
    updatedAt: new Date().toISOString(),
  }
  fs.writeFileSync(path.join(dir, SOURCE_META_FILE), JSON.stringify(nextSource, null, 2))
  upsertLock({
    name,
    url: source.url,
    repo: source.repo || remoteRepoFromUrl(source.url),
    sha256: nextSource.sha256,
    previousSha256: sha256(localText),
    trust: source.trust || 'community',
    license,
    installedAt: source.installedAt || null,
    updatedAt: nextSource.updatedAt,
  })
  return {
    ok: true,
    name,
    changed: true,
    sha256: nextSource.sha256,
    backup,
    diff: diffSkillLines(localText, remoteText),
  }
}

function rollbackSkill(name) {
  const dir = installedSkillDir(name)
  const file = path.join(dir, 'SKILL.md')
  if (!fs.existsSync(file)) throw new HttpError(404, 'skill "' + name + '" is not installed')
  const backups = listBackups(name)
  if (!backups.length) throw new HttpError(404, 'no backup found for "' + name + '"')
  const currentText = fs.readFileSync(file, 'utf8')
  const restoredText = fs.readFileSync(backups[0].file, 'utf8')
  const backup = backupSkillFile(name, currentText)
  fs.writeFileSync(file, restoredText)
  const source = readJsonFile(path.join(dir, SOURCE_META_FILE), null) || {}
  const nextSource = { ...source, sha256: sha256(restoredText), updatedAt: new Date().toISOString() }
  fs.writeFileSync(path.join(dir, SOURCE_META_FILE), JSON.stringify(nextSource, null, 2))
  upsertLock({
    name,
    sha256: nextSource.sha256,
    previousSha256: sha256(currentText),
    url: source.url || null,
    updatedAt: nextSource.updatedAt,
  })
  return {
    ok: true,
    name,
    restoredFrom: backups[0].name,
    backup,
    diff: diffSkillLines(currentText, restoredText),
  }
}

async function applyAllSkillUpdates() {
  const checked = await checkSkillUpdates()
  const results = []
  for (const update of checked.updates.slice(0, 40)) {
    try {
      results.push(await applySkillUpdate(update.name))
    } catch (error) {
      results.push({
        ok: false,
        name: update.name,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }
  return {
    ok: true,
    checked: checked.checked,
    updated: results.filter((result) => result.changed).length,
    failed: results.filter((result) => result.ok === false).length,
    results,
  }
}

// --- Recommendation feedback & evaluation (G2/G3) --------------------------
function recFeedbackFile() {
  return path.join(studioDir(), 'rec-feedback.json')
}

function loadRecFeedback() {
  const data = readJsonFile(recFeedbackFile(), null)
  if (data && data.skills && typeof data.skills === 'object') return data
  return { version: 1, updatedAt: null, skills: {} }
}

function recordRecommendationFeedback(name, verdict, kind) {
  const skillName = String(name || '').trim()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skillName)) {
    throw new HttpError(400, 'skillName must be kebab-case')
  }
  if (!['adopt', 'good', 'bad'].includes(verdict)) {
    throw new HttpError(400, 'verdict must be adopt, good, or bad')
  }
  const feedback = loadRecFeedback()
  const stat = feedback.skills[skillName] || { adopt: 0, good: 0, bad: 0, lastAt: null }
  stat[verdict] = (Number(stat[verdict]) || 0) + 1
  stat.lastAt = new Date().toISOString()
  feedback.skills[skillName] = stat
  feedback.updatedAt = stat.lastAt
  writeJsonFile(recFeedbackFile(), feedback)
  noteRecommendationOutcome(String(kind || ''), verdict, skillName)
  saveEvolution()
  const evolved = maybeEvolve()
  return {
    stats: stat,
    updatedAt: feedback.updatedAt,
    evolution: evolved ? { changed: evolved.changed, changes: evolved.changes } : null,
  }
}

function evaluateRecommendations(cases, skills, skillStats = {}, k = 4) {
  const list = Array.isArray(cases) ? cases : []
  const perCase = []
  let hits = 0
  for (const item of list) {
    if (!item || !item.context || !Array.isArray(item.expect) || !item.expect.length) continue
    const top = recommendSkills(skills, item.context, skillStats)
      .slice(0, k)
      .map((skill) => skill.name)
    const hit = item.expect.some((name) => top.includes(name))
    if (hit) hits += 1
    perCase.push({ context: item.context.slice(0, 120), expect: item.expect, top, hit })
  }
  return {
    total: perCase.length,
    hits,
    recall: perCase.length ? Math.round((hits / perCase.length) * 100) / 100 : 0,
    k,
    cases: perCase,
  }
}

// --- Experience depth (G4) -------------------------------------------------
function aggregateSkillStats(skillStats) {
  const output = {}
  for (const [name, stat] of Object.entries(skillStats || {})) {
    if (!name || !stat || typeof stat !== 'object') continue
    const uses = Number(stat.uses || 0)
    const successes = Number(stat.successes || 0)
    const totalDurationMs = Number(stat.totalDurationMs || 0)
    output[name] = {
      name,
      uses,
      successes,
      good: Number(stat.good || 0),
      bad: Number(stat.bad || 0),
      lastUsed: stat.lastUsed || null,
      failureStreak: Number(stat.failureStreak || 0),
      successRate: uses > 0 ? Math.round((successes / uses) * 100) / 100 : 0,
      avgDurationMs: uses > 0 ? Math.round(totalDurationMs / uses) : 0,
    }
  }
  return output
}

const STALE_DAYS = 45

function experienceHealth(skillStats, cwd) {
  const aggregate = aggregateSkillStats(skillStats)
  const now = Date.now()
  const health = { stale: [], failing: [], neverUsed: [], licenseUnknown: [] }
  for (const stat of Object.values(aggregate)) {
    const lastUsedAt = stat.lastUsed ? Date.parse(stat.lastUsed) : 0
    if (lastUsedAt && now - lastUsedAt > STALE_DAYS * 86400000) {
      health.stale.push({ name: stat.name, lastUsed: stat.lastUsed, uses: stat.uses })
    }
    if (stat.bad >= 2 || stat.failureStreak >= 2) {
      health.failing.push({
        name: stat.name,
        bad: stat.bad,
        failureStreak: stat.failureStreak,
      })
    }
  }
  let installed = []
  try {
    installed = scanSkills(cwd || process.cwd()).map((skill) => summarize(skill))
  } catch {
    installed = []
  }
  const known = new Set(Object.keys(aggregate))
  for (const skill of installed) {
    const extra = securityForSkill(skill)
    if (!known.has(skill.name)) health.neverUsed.push({ name: skill.name, trust: extra.trust })
    if (!extra.license) health.licenseUnknown.push({ name: skill.name, trust: extra.trust })
  }
  health.stale = health.stale.slice(0, 20)
  health.failing = health.failing.slice(0, 20)
  health.neverUsed = health.neverUsed.slice(0, 40)
  health.licenseUnknown = health.licenseUnknown.slice(0, 40)
  return { installed: installed.length, ...health }
}

function exportExperience() {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    entries: memory.entries,
    skills: memory.skills,
    recFeedback: loadRecFeedback().skills,
  }
}

function mergeExperienceData(current, payload) {
  if (!payload || typeof payload !== 'object') throw new HttpError(400, 'payload is required')
  const base = {
    entries: Array.isArray(current?.entries) ? current.entries.slice() : [],
    skills: { ...(current?.skills || {}) },
    recFeedback: { ...(current?.recFeedback || {}) },
  }
  const incomingEntries = Array.isArray(payload.entries) ? payload.entries : []
  const known = new Set(base.entries.map((entry) => entry && entry.id).filter(Boolean))
  let addedEntries = 0
  for (const entry of incomingEntries.slice(-1000)) {
    if (!entry || typeof entry.id !== 'string' || known.has(entry.id)) continue
    base.entries.push(entry)
    known.add(entry.id)
    addedEntries += 1
  }
  if (base.entries.length > 1000) base.entries = base.entries.slice(-1000)
  let mergedSkills = 0
  const incomingSkills = payload.skills && typeof payload.skills === 'object' ? payload.skills : {}
  for (const [name, stat] of Object.entries(incomingSkills)) {
    if (!name || !stat || typeof stat !== 'object') continue
    const previous = base.skills[name] || {}
    const pick = (key) => Math.max(Number(previous[key] || 0), Number(stat[key] || 0))
    const dates = [previous.lastUsed, stat.lastUsed].filter(Boolean).sort()
    base.skills[name] = {
      uses: pick('uses'),
      successes: pick('successes'),
      good: pick('good'),
      bad: pick('bad'),
      totalDurationMs: pick('totalDurationMs'),
      failureStreak: Number(previous.failureStreak || 0),
      lastUsed: dates.length ? dates[dates.length - 1] : null,
    }
    mergedSkills += 1
  }
  let mergedFeedback = 0
  const incomingFeedback =
    payload.recFeedback && typeof payload.recFeedback === 'object' ? payload.recFeedback : {}
  for (const [name, stat] of Object.entries(incomingFeedback)) {
    if (!name || !stat || typeof stat !== 'object') continue
    const previous = base.recFeedback[name] || {}
    const pick = (key) => Math.max(Number(previous[key] || 0), Number(stat[key] || 0))
    const dates = [previous.lastAt, stat.lastAt].filter(Boolean).sort()
    base.recFeedback[name] = {
      adopt: pick('adopt'),
      good: pick('good'),
      bad: pick('bad'),
      lastAt: dates.length ? dates[dates.length - 1] : null,
    }
    mergedFeedback += 1
  }
  return { ...base, addedEntries, mergedSkills, mergedFeedback }
}

function importExperience(payload) {
  const merged = mergeExperienceData(
    { entries: memory.entries, skills: memory.skills, recFeedback: loadRecFeedback().skills },
    payload,
  )
  memory.entries = merged.entries
  memory.skills = merged.skills
  saveMemory()
  const feedback = loadRecFeedback()
  feedback.skills = merged.recFeedback
  feedback.updatedAt = new Date().toISOString()
  writeJsonFile(recFeedbackFile(), feedback)
  return {
    ok: true,
    addedEntries: merged.addedEntries,
    mergedSkills: merged.mergedSkills,
    mergedFeedback: merged.mergedFeedback,
  }
}


// --- Self-evolution (v1.6.0) -----------------------------------------------
// The recommendation weights are learnable parameters: feedback outcomes are
// attributed to the reason kind that produced the recommendation, and the
// engine nudges the corresponding weight in small, bounded steps. Everything
// stays local and explainable: every change is logged with its evidence and
// can be rolled back.
const EVOLUTION_DEFAULT_WEIGHTS = { token: 1, name: 8, category: 0.6, experience: 1, completion: 1 }
const EVOLUTION_BOUNDS = {
  token: [0.5, 2],
  name: [4, 14],
  category: [0.2, 1.5],
  experience: [0.4, 2],
}
const EVOLUTION_KIND_WEIGHT = { keyword: 'token', name: 'name', category: 'category', experience: 'experience' }
const EVOLUTION_CONTENT_LABELS = { token: '关键词', name: '名称', category: '类别', experience: '经验' }
const EVOLUTION_MIN_SAMPLES = 8
const EVOLUTION_STEP = 0.1
const EVOLUTION_EVAL_EVERY = 10
const EVOLUTION_HISTORY_MAX = 50
const EVOLUTION_KIND_MEMORY_MAX = 300

// Exploration: reserve roughly 10% of the recommendation slots for skills the
// user rarely sees, so the engine keeps collecting evidence instead of only
// exploiting what it already likes.
const EVOLUTION_DEFAULT_EXPLORATION = 0.1
const EVOLUTION_EXPLORATION_BOUNDS = [0, 0.3]
const EVOLUTION_EXPLORATION_STEP = 0.05
const EVOLUTION_EXPLORATION_MIN_ATTEMPTS = 8

// Per-category affinity: which families of skills actually work for this user.
const EVOLUTION_DEFAULT_CATEGORY_WEIGHTS = { video: 1, office: 1, harness: 1, other: 1 }
const EVOLUTION_CATEGORY_BOUNDS = [0.5, 2]
const EVOLUTION_CATEGORY_LABELS = { video: '视频/动效', office: '办公文档', harness: 'Harness 插件', other: '通用' }

let evolutionState = null

function evolutionFile() {
  return path.join(studioDir(), 'evolution.json')
}

function roundWeight(value) {
  return Math.round(value * 100) / 100
}

function clampWeight(key, value) {
  const bounds = EVOLUTION_BOUNDS[key]
  const number = Number(value)
  const safe = Number.isFinite(number) ? number : EVOLUTION_DEFAULT_WEIGHTS[key]
  if (!bounds) return roundWeight(safe)
  return roundWeight(Math.min(bounds[1], Math.max(bounds[0], safe)))
}

function resolveEvolutionWeights(weights) {
  const source = weights && typeof weights === 'object' ? weights : {}
  const merged = {}
  for (const key of Object.keys(EVOLUTION_DEFAULT_WEIGHTS)) {
    merged[key] = clampWeight(key, source[key] ?? EVOLUTION_DEFAULT_WEIGHTS[key])
  }
  return merged
}

function clampExploration(value) {
  const number = Number(value)
  const safe = Number.isFinite(number) ? number : EVOLUTION_DEFAULT_EXPLORATION
  return roundWeight(
    Math.min(EVOLUTION_EXPLORATION_BOUNDS[1], Math.max(EVOLUTION_EXPLORATION_BOUNDS[0], safe)),
  )
}

function clampCategoryWeight(value) {
  const number = Number(value)
  const safe = Number.isFinite(number) ? number : 1
  return roundWeight(
    Math.min(EVOLUTION_CATEGORY_BOUNDS[1], Math.max(EVOLUTION_CATEGORY_BOUNDS[0], safe)),
  )
}

function resolveCategoryWeights(weights) {
  const source = weights && typeof weights === 'object' ? weights : {}
  const merged = {}
  for (const key of Object.keys(EVOLUTION_DEFAULT_CATEGORY_WEIGHTS)) {
    merged[key] = clampCategoryWeight(source[key] ?? EVOLUTION_DEFAULT_CATEGORY_WEIGHTS[key])
  }
  return merged
}

function normalizeAffinity(saved) {
  const source = saved && typeof saved === 'object' ? saved : {}
  const output = {}
  for (const [name, entry] of Object.entries(source)) {
    if (!name || !entry || typeof entry !== 'object') continue
    const score = Number(entry.score)
    const samples = Number(entry.samples)
    output[name] = {
      score: roundWeight(Math.min(1, Math.max(0, Number.isFinite(score) ? score : 0.5))),
      samples: Number.isFinite(samples) && samples > 0 ? Math.floor(samples) : 0,
      lastAt: entry.lastAt || null,
    }
  }
  return output
}

function updateSkillAffinityEntry(affinity, name, delta) {
  if (!name) return
  const previous = affinity[name] || { score: 0.5, samples: 0, lastAt: null }
  const target = delta > 0 ? 1 : 0
  const weight = previous.samples === 0 ? 0.35 : 0.2
  affinity[name] = {
    score: roundWeight(previous.score + (target - previous.score) * weight),
    samples: previous.samples + 1,
    lastAt: new Date().toISOString(),
  }
}

function emptyEvolutionStats() {
  return {
    exposures: 0,
    tasks: 0,
    observations: 0,
    good: 0,
    bad: 0,
    byKind: {
      name: { adopt: 0, good: 0, bad: 0 },
      keyword: { adopt: 0, good: 0, bad: 0 },
      category: { adopt: 0, good: 0, bad: 0 },
      experience: { adopt: 0, good: 0, bad: 0 },
    },
    byCategory: {
      video: { good: 0, bad: 0 },
      office: { good: 0, bad: 0 },
      harness: { good: 0, bad: 0 },
      other: { good: 0, bad: 0 },
    },
    exploration: { served: 0, attempts: 0, adopted: 0, good: 0, bad: 0 },
  }
}

function normalizeEvolutionState(saved) {
  const base = {
    version: 1,
    updatedAt: null,
    weights: resolveEvolutionWeights(null),
    categoryWeights: resolveCategoryWeights(null),
    explorationRate: EVOLUTION_DEFAULT_EXPLORATION,
    skillAffinity: {},
    stats: emptyEvolutionStats(),
    kindBySkill: {},
    categoryBySkill: {},
    observationsSinceEval: 0,
    lastEvaluatedAt: null,
    history: [],
  }
  if (!saved || typeof saved !== 'object') return base
  const stats = saved.stats && typeof saved.stats === 'object' ? saved.stats : {}
  const byKind = stats.byKind && typeof stats.byKind === 'object' ? stats.byKind : {}
  const byCategory = stats.byCategory && typeof stats.byCategory === 'object' ? stats.byCategory : {}
  const exploration = stats.exploration && typeof stats.exploration === 'object' ? stats.exploration : {}
  return {
    version: 1,
    updatedAt: saved.updatedAt || null,
    weights: resolveEvolutionWeights(saved.weights),
    categoryWeights: resolveCategoryWeights(saved.categoryWeights),
    explorationRate: clampExploration(saved.explorationRate),
    skillAffinity: normalizeAffinity(saved.skillAffinity),
    stats: {
      exposures: Number(stats.exposures || 0),
      tasks: Number(stats.tasks || 0),
      observations: Number(stats.observations || 0),
      good: Number(stats.good || 0),
      bad: Number(stats.bad || 0),
      byKind: {
        name: { ...emptyEvolutionStats().byKind.name, ...(byKind.name || {}) },
        keyword: { ...emptyEvolutionStats().byKind.keyword, ...(byKind.keyword || {}) },
        category: { ...emptyEvolutionStats().byKind.category, ...(byKind.category || {}) },
        experience: { ...emptyEvolutionStats().byKind.experience, ...(byKind.experience || {}) },
      },
      byCategory: {
        video: { ...emptyEvolutionStats().byCategory.video, ...(byCategory.video || {}) },
        office: { ...emptyEvolutionStats().byCategory.office, ...(byCategory.office || {}) },
        harness: { ...emptyEvolutionStats().byCategory.harness, ...(byCategory.harness || {}) },
        other: { ...emptyEvolutionStats().byCategory.other, ...(byCategory.other || {}) },
      },
      exploration: {
        served: Number(exploration.served || 0),
        attempts: Number(exploration.attempts || 0),
        adopted: Number(exploration.adopted || 0),
        good: Number(exploration.good || 0),
        bad: Number(exploration.bad || 0),
      },
    },
    kindBySkill: saved.kindBySkill && typeof saved.kindBySkill === 'object' ? saved.kindBySkill : {},
    categoryBySkill:
      saved.categoryBySkill && typeof saved.categoryBySkill === 'object' ? saved.categoryBySkill : {},
    observationsSinceEval: Number(saved.observationsSinceEval || 0),
    lastEvaluatedAt: saved.lastEvaluatedAt || null,
    history: Array.isArray(saved.history) ? saved.history.slice(-EVOLUTION_HISTORY_MAX) : [],
  }
}

function loadEvolution() {
  if (evolutionState) return evolutionState
  evolutionState = normalizeEvolutionState(readJsonFile(evolutionFile(), null))
  return evolutionState
}

function saveEvolution() {
  const state = loadEvolution()
  try {
    ensureStudioDir()
    state.updatedAt = new Date().toISOString()
    fs.writeFileSync(evolutionFile(), JSON.stringify(state, null, 2))
  } catch {
    // Evolution is best-effort; never affect a turn or a request.
  }
}

function evolutionSnapshot() {
  const state = loadEvolution()
  const byKind = state.stats.byKind
  const totalGood = Object.values(byKind).reduce((sum, entry) => sum + Number(entry.good || 0), 0)
  const totalBad = Object.values(byKind).reduce((sum, entry) => sum + Number(entry.bad || 0), 0)
  const affinityValues = Object.values(state.skillAffinity || {})
  const avgAffinity = affinityValues.length
    ? roundWeight(affinityValues.reduce((sum, entry) => sum + Number(entry.score || 0), 0) / affinityValues.length)
    : null
  return {
    weights: state.weights,
    defaults: { ...EVOLUTION_DEFAULT_WEIGHTS },
    bounds: EVOLUTION_BOUNDS,
    contentLabels: EVOLUTION_CONTENT_LABELS,
    explorationRate: state.explorationRate,
    explorationBounds: EVOLUTION_EXPLORATION_BOUNDS,
    categoryWeights: state.categoryWeights,
    categoryLabels: EVOLUTION_CATEGORY_LABELS,
    categoryBounds: EVOLUTION_CATEGORY_BOUNDS,
    stats: {
      exposures: state.stats.exposures,
      tasks: state.stats.tasks,
      observations: state.stats.observations,
      good: totalGood,
      bad: totalBad,
      successRate: totalGood + totalBad > 0 ? Math.round((totalGood / (totalGood + totalBad)) * 100) / 100 : null,
      byKind,
      byCategory: state.stats.byCategory,
      exploration: state.stats.exploration,
    },
    learning: {
      skillsTracked: affinityValues.length,
      avgAffinity,
      exploredServed: state.stats.exploration.served,
      exploredRecommendations: state.stats.exploration.attempts,
      explorationAdopted: state.stats.exploration.adopted,
    },
    observationsSinceEval: state.observationsSinceEval,
    lastEvaluatedAt: state.lastEvaluatedAt,
    recentHistory: state.history.slice(-3).map((entry) => ({
      at: entry.at,
      reason: entry.reason,
      changes: entry.changes,
    })),
    canRollback: state.history.length > 0,
    path: evolutionFile(),
  }
}

function evaluateEvolutionState(state, options = {}) {
  const current = normalizeEvolutionState(state)
  const minSamples = Number(options.minSamples || EVOLUTION_MIN_SAMPLES)
  const step = Number(options.step || EVOLUTION_STEP)
  const reason = String(options.reason || 'auto')
  const changes = []
  const nextWeights = { ...current.weights }
  const nextCategoryWeights = { ...current.categoryWeights }
  let nextExploration = current.explorationRate

  for (const [kind, weightKey] of Object.entries(EVOLUTION_KIND_WEIGHT)) {
    const stat = current.stats.byKind[kind]
    if (!stat) continue
    const good = Number(stat.good || 0)
    const bad = Number(stat.bad || 0)
    const sample = good + bad
    if (sample < minSamples) continue
    const rate = good / sample
    let factor = 1
    let why = ''
    if (rate >= 0.7) {
      factor = 1 + step
      why = '好评为 ' + good + '/' + sample
    } else if (rate <= 0.4) {
      factor = 1 - step
      why = '差评为 ' + bad + '/' + sample
    }
    if (factor === 1) continue
    const from = nextWeights[weightKey]
    const to = clampWeight(weightKey, from * factor)
    if (to === from) continue
    nextWeights[weightKey] = to
    changes.push({
      kind,
      weight: weightKey,
      label: EVOLUTION_CONTENT_LABELS[weightKey] || weightKey,
      from,
      to,
      rate: Math.round(rate * 100) / 100,
      sample,
      reason: why,
    })
  }

  // Category weights learn which skill families work for this user.
  for (const [category, label] of Object.entries(EVOLUTION_CATEGORY_LABELS)) {
    const stat = current.stats.byCategory[category]
    if (!stat) continue
    const good = Number(stat.good || 0)
    const bad = Number(stat.bad || 0)
    const sample = good + bad
    if (sample < minSamples) continue
    const rate = good / sample
    let factor = 1
    if (rate >= 0.7) factor = 1 + step
    else if (rate <= 0.4) factor = 1 - step
    if (factor === 1) continue
    const from = nextCategoryWeights[category]
    const to = clampCategoryWeight(from * factor)
    if (to === from) continue
    nextCategoryWeights[category] = to
    changes.push({
      kind: 'category',
      weight: 'category:' + category,
      label: label + ' 类别权重',
      from,
      to,
      rate: Math.round(rate * 100) / 100,
      sample,
      reason: '好评为 ' + good + '/' + sample,
    })
  }

  // The exploration quota tunes itself: if exploration rarely gets adopted,
  // spend less on it; if it works, explore a little more.
  const exploration = current.stats.exploration
  const attempts = Number(exploration.attempts || 0)
  const adopted = Number(exploration.adopted || 0)
  if (attempts >= EVOLUTION_EXPLORATION_MIN_ATTEMPTS) {
    const adoptionRate = adopted / attempts
    let next = nextExploration
    if (adoptionRate < 0.05) next = clampExploration(nextExploration - EVOLUTION_EXPLORATION_STEP)
    else if (adoptionRate >= 0.3) next = clampExploration(nextExploration + EVOLUTION_EXPLORATION_STEP)
    if (next !== nextExploration) {
      changes.push({
        kind: 'exploration',
        weight: 'explorationRate',
        label: '探索配额',
        from: nextExploration,
        to: next,
        rate: Math.round(adoptionRate * 100) / 100,
        sample: attempts,
        reason: '探索采用率为 ' + adopted + '/' + attempts,
      })
      nextExploration = next
    }
  }

  if (changes.length === 0) {
    return { state: { ...current, lastEvaluatedAt: new Date().toISOString() }, changes: [] }
  }
  const at = new Date().toISOString()
  const history = current.history.concat({
    at,
    reason,
    changes,
    before: {
      weights: { ...current.weights },
      categoryWeights: { ...current.categoryWeights },
      explorationRate: current.explorationRate,
    },
    after: { weights: { ...nextWeights }, categoryWeights: { ...nextCategoryWeights }, explorationRate: nextExploration },
  })
  return {
    state: {
      ...current,
      updatedAt: at,
      weights: nextWeights,
      categoryWeights: nextCategoryWeights,
      explorationRate: nextExploration,
      observationsSinceEval: 0,
      lastEvaluatedAt: at,
      history: history.slice(-EVOLUTION_HISTORY_MAX),
    },
    changes,
  }
}

function runEvolution(reason) {
  const report = evaluateEvolutionState(loadEvolution(), { reason })
  evolutionState = report.state
  saveEvolution()
  return {
    ok: true,
    reason,
    changed: report.changes.length,
    changes: report.changes,
    snapshot: evolutionSnapshot(),
  }
}

function maybeEvolve() {
  const state = loadEvolution()
  if (state.observationsSinceEval < EVOLUTION_EVAL_EVERY) return null
  return runEvolution('auto')
}

function noteRecommendationExposure(recommendations) {
  if (!Array.isArray(recommendations) || recommendations.length === 0) return
  const state = loadEvolution()
  state.stats.exposures = Number(state.stats.exposures || 0) + recommendations.length
  const at = new Date().toISOString()
  for (const item of recommendations) {
    if (!item || !item.name) continue
    const top = Array.isArray(item.reasonsDetail) ? item.reasonsDetail.find((reason) => reason && reason.kind) : null
    if (top && EVOLUTION_KIND_WEIGHT[top.kind]) {
      state.kindBySkill[item.name] = { kind: top.kind, at }
    }
    state.categoryBySkill[item.name] = { category: categoryOf(item.name), at }
    if (item.exploration) {
      state.stats.exploration.served = Number(state.stats.exploration.served || 0) + 1
    }
  }
  const names = Object.keys(state.kindBySkill)
  if (names.length > EVOLUTION_KIND_MEMORY_MAX) {
    for (const name of names.slice(0, names.length - EVOLUTION_KIND_MEMORY_MAX)) delete state.kindBySkill[name]
  }
}

function noteRecommendationOutcome(kind, verdict, skillName) {
  if (!['adopt', 'good', 'bad'].includes(verdict)) return
  const state = loadEvolution()
  if (kind === 'explore') {
    state.stats.exploration.attempts = Number(state.stats.exploration.attempts || 0) + 1
    if (verdict === 'adopt' || verdict === 'good') {
      state.stats.exploration.adopted = Number(state.stats.exploration.adopted || 0) + 1
    }
    if (verdict === 'bad') state.stats.exploration.bad = Number(state.stats.exploration.bad || 0) + 1
  } else if (EVOLUTION_KIND_WEIGHT[kind]) {
    const bucket = state.stats.byKind[kind]
    bucket[verdict] = Number(bucket[verdict] || 0) + 1
  } else {
    return
  }
  if (skillName) {
    updateSkillAffinityEntry(state.skillAffinity, skillName, verdict === 'bad' ? -1 : 1)
    const hint = state.categoryBySkill[skillName]
    if (hint && (verdict === 'good' || verdict === 'bad')) {
      const category = hint.category || 'other'
      const bucket = state.stats.byCategory[category] || state.stats.byCategory.other
      bucket[verdict] = Number(bucket[verdict] || 0) + 1
    }
  }
  state.stats.observations = Number(state.stats.observations || 0) + 1
  state.observationsSinceEval = Number(state.observationsSinceEval || 0) + 1
  if (verdict === 'good') state.stats.good = Number(state.stats.good || 0) + 1
  if (verdict === 'bad') state.stats.bad = Number(state.stats.bad || 0) + 1
}

function noteExperienceFeedback(skills, rating) {
  if (!Array.isArray(skills) || !rating) return
  const state = loadEvolution()
  const at = new Date().toISOString()
  for (const name of skills) {
    const hint = state.kindBySkill[name]
    if (hint && EVOLUTION_KIND_WEIGHT[hint.kind]) {
      const bucket = state.stats.byKind[hint.kind]
      bucket[rating] = Number(bucket[rating] || 0) + 1
      state.stats.observations = Number(state.stats.observations || 0) + 1
      state.observationsSinceEval = Number(state.observationsSinceEval || 0) + 1
      if (rating === 'good') state.stats.good = Number(state.stats.good || 0) + 1
      if (rating === 'bad') state.stats.bad = Number(state.stats.bad || 0) + 1
      state.kindBySkill[name] = { kind: hint.kind, at }
    }
    state.categoryBySkill[name] = { category: categoryOf(name), at }
    updateSkillAffinityEntry(state.skillAffinity, name, rating === 'bad' ? -1 : 1)
    if (rating === 'good' || rating === 'bad') {
      const category = categoryOf(name)
      const bucket = state.stats.byCategory[category] || state.stats.byCategory.other
      bucket[rating] = Number(bucket[rating] || 0) + 1
    }
  }
}

function noteSkillOutcome(name, delta) {
  if (!name) return
  const state = loadEvolution()
  updateSkillAffinityEntry(state.skillAffinity, name, delta)
  const category = categoryOf(name)
  state.categoryBySkill[name] = { category, at: new Date().toISOString() }
  if (delta > 0) {
    state.stats.byCategory[category] = state.stats.byCategory[category] || { good: 0, bad: 0 }
  }
}

function setEvolutionExplorationRate(value) {
  const rate = clampExploration(value)
  const state = loadEvolution()
  state.explorationRate = rate
  saveEvolution()
  return { ok: true, explorationRate: rate, snapshot: evolutionSnapshot() }
}

function applyExploration(skills, ranked, skillStats = {}, options = {}) {
  const rate = clampExploration(options.explorationRate ?? 0)
  if (rate <= 0 || !Array.isArray(ranked) || ranked.length === 0) return ranked
  const random = typeof options.random === 'function' ? options.random : Math.random
  if (random() >= rate) return ranked
  const excluded = new Set(ranked.map((item) => item && item.name).filter(Boolean))
  const candidates = (Array.isArray(skills) ? skills : []).filter(
    (skill) => skill && skill.name && !excluded.has(skill.name),
  )
  if (candidates.length === 0) return ranked
  const statOf = (name) => (skillStats && skillStats[name]) || {}
  candidates.sort((left, right) => {
    const leftUses = Number(statOf(left.name).uses || 0)
    const rightUses = Number(statOf(right.name).uses || 0)
    if (leftUses !== rightUses) return leftUses - rightUses
    return String(left.name).localeCompare(String(right.name))
  })
  const pool = candidates.slice(0, Math.min(8, candidates.length))
  const index = Math.min(pool.length - 1, Math.floor(random() * pool.length))
  const picked = pool[Math.max(0, index)]
  const explore = {
    ...picked,
    score: 0.1,
    exploration: true,
    reasons: ['探索'],
    reasonsDetail: [
      {
        kind: 'explore',
        label: '探索',
        detail: '10% 探索配额：给平时不常被推荐的技能一个验证机会',
        weight: 0,
      },
    ],
  }
  const next = ranked.slice(0, Math.max(1, ranked.length - 1))
  next.push(explore)
  return next
}

function rollbackEvolution() {
  const state = loadEvolution()
  if (state.history.length === 0) throw new HttpError(409, 'no evolution history to roll back')
  const last = state.history[state.history.length - 1]
  const before = last.before && typeof last.before === 'object' ? last.before : {}
  evolutionState = {
    ...state,
    weights: resolveEvolutionWeights(before.weights || null),
    categoryWeights: resolveCategoryWeights(before.categoryWeights || null),
    explorationRate: before.explorationRate === undefined ? state.explorationRate : clampExploration(before.explorationRate),
    history: state.history.slice(0, -1),
    observationsSinceEval: 0,
    lastEvaluatedAt: new Date().toISOString(),
  }
  saveEvolution()
  return { ok: true, rolledBack: last.at, weights: evolutionState.weights, snapshot: evolutionSnapshot() }
}

function resetEvolution() {
  const state = loadEvolution()
  evolutionState = {
    ...state,
    weights: resolveEvolutionWeights(null),
    categoryWeights: resolveCategoryWeights(null),
    explorationRate: EVOLUTION_DEFAULT_EXPLORATION,
    observationsSinceEval: 0,
    lastEvaluatedAt: null,
  }
  saveEvolution()
  return { ok: true, weights: evolutionState.weights, snapshot: evolutionSnapshot() }
}

const SOURCE_META_FILE = '.skill-studio-source.json'
const MCP_REGISTRY_URL = 'https://registry.modelcontextprotocol.io/v0/servers'

function remoteCacheFile() {
  return path.join(studioDir(), 'remote-index.json')
}

function sourcesFile() {
  return path.join(studioDir(), 'sources.json')
}

function readJsonFile(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJsonFile(file, value) {
  ensureStudioDir()
  fs.writeFileSync(file, JSON.stringify(value, null, 2))
}

function loadRemoteSources() {
  const fallback = {
    sources: [{ repo: 'anthropics/skills', label: 'Anthropic Skills', trust: 'official' }],
  }
  const configured = readJsonFile(sourcesFile(), null)
  if (configured && Array.isArray(configured.sources) && configured.sources.length) {
    return configured.sources
      .filter((source) => source && typeof source.repo === 'string' && source.repo.includes('/'))
      .slice(0, 5)
  }
  return fallback.sources
}

function loadBundledRemote() {
  const file = path.join(PACKAGE_DIR, 'sources', 'anthropic-skills.json')
  const data = readJsonFile(file, null)
  if (!data || !Array.isArray(data.entries)) return { entries: [], cachedAt: null, label: 'Bundled index' }
  return {
    entries: data.entries.map((entry) => ({
      ...entry,
      sourceLabel: 'Anthropic Skills',
      trust: entry.trust || 'official',
    })),
    cachedAt: data.fetchedAt || null,
    label: 'Bundled index',
  }
}

function loadRemoteIndex() {
  const cached = readJsonFile(remoteCacheFile(), null)
  if (cached && Array.isArray(cached.entries) && cached.entries.length) {
    return { entries: cached.entries, cachedAt: cached.fetchedAt || null, label: 'Remote cache' }
  }
  return loadBundledRemote()
}

function sha256(text) {
  return createHash('sha256').update(String(text)).digest('hex')
}

function normalizeRemoteEntry(entry, source) {
  const description = String(entry.description || '').replace(/\s+/g, ' ').trim()
  const whenToUse = String(entry.whenToUse || '').replace(/\s+/g, ' ').trim()
  return {
    name: entry.name,
    description,
    whenToUse: whenToUse || null,
    repo: entry.repo || source.repo,
    path: entry.path || '',
    url: entry.url,
    trust: source.trust || 'community',
    sourceLabel: source.label || source.repo,
  }
}

async function refreshRemoteIndex() {
  const sources = loadRemoteSources()
  const entries = []
  const errors = []
  const token = process.env.GITHUB_TOKEN || ''
  for (const source of sources) {
    try {
      const headers = {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'ronge-skill-studio',
      }
      if (token) headers.Authorization = 'Bearer ' + token
      const repoResponse = await fetch('https://api.github.com/repos/' + source.repo, {
        headers,
        signal: AbortSignal.timeout(15000),
      })
      if (!repoResponse.ok) throw new Error('GitHub repo ' + repoResponse.status)
      const repoInfo = await repoResponse.json()
      const branch = repoInfo.default_branch || 'main'
      const treeResponse = await fetch(
        'https://api.github.com/repos/' + source.repo + '/git/trees/' + branch + '?recursive=1',
        { headers, signal: AbortSignal.timeout(20000) },
      )
      if (!treeResponse.ok) throw new Error('GitHub tree ' + treeResponse.status)
      const tree = await treeResponse.json()
      const paths = (tree.tree || [])
        .filter((item) => item.type === 'blob' && item.path.endsWith('SKILL.md'))
        .slice(0, 80)
      for (const item of paths) {
        try {
          const rawUrl =
            'https://raw.githubusercontent.com/' +
            source.repo +
            '/' +
            branch +
            '/' +
            item.path
          const response = await fetch(rawUrl, {
            headers: { 'User-Agent': 'ronge-skill-studio' },
            signal: AbortSignal.timeout(15000),
          })
          if (!response.ok) continue
          const text = await response.text()
          if (text.length > 262144) continue
          const front = parseFrontmatter(text)
          const fallbackName = item.path.split('/').slice(-2, -1)[0] || 'skill'
          const name = front.name || fallbackName
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) continue
          entries.push(
            normalizeRemoteEntry(
              {
                name,
                description: front.description || '',
                whenToUse: front.whenToUse || front.when_to_use || '',
                repo: source.repo,
                path: item.path,
                url: rawUrl,
              },
              source,
            ),
          )
        } catch {
          // Skip one unreadable skill; keep the rest of the index.
        }
      }
    } catch (error) {
      errors.push(source.repo + ': ' + (error instanceof Error ? error.message : String(error)))
    }
  }
  if (entries.length === 0) {
    throw new HttpError(502, 'Remote index refresh failed: ' + (errors.join('; ') || 'no entries'))
  }
  const payload = {
    fetchedAt: new Date().toISOString(),
    sources,
    entries,
    errors,
  }
  writeJsonFile(remoteCacheFile(), payload)
  return payload
}

function validateRemoteUrl(raw) {
  let url
  try {
    url = new URL(String(raw))
  } catch {
    throw new HttpError(400, 'invalid remote url')
  }
  if (url.protocol !== 'https:' || url.hostname !== 'raw.githubusercontent.com') {
    throw new HttpError(400, 'remote url must be a raw.githubusercontent.com SKILL.md')
  }
  if (!url.pathname.endsWith('/SKILL.md')) {
    throw new HttpError(400, 'remote url must point to a SKILL.md')
  }
  return url.toString()
}

async function fetchRemoteSkill(raw) {
  const url = validateRemoteUrl(raw)
  const response = await fetch(url, {
    headers: { 'User-Agent': 'ronge-skill-studio' },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new HttpError(502, 'remote fetch failed: HTTP ' + response.status)
  const text = await response.text()
  if (text.length > 262144) throw new HttpError(413, 'remote skill is too large (max 256 KiB)')
  return { url, text }
}

function remoteRepoFromUrl(raw) {
  try {
    const parts = new URL(raw).pathname.split('/').filter(Boolean)
    return parts.length >= 2 ? parts[0] + '/' + parts[1] : null
  } catch {
    return null
  }
}

function installRemoteSkill(payload) {
  const raw = payload && payload.url
  if (!raw) throw new HttpError(400, 'url is required')
  return fetchRemoteSkill(raw).then(({ url, text }) => {
    const front = parseFrontmatter(text)
    const name = String(front.name || '').trim()
    const description = String(front.description || '').replace(/\s+/g, ' ').trim()
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
      throw new HttpError(400, 'remote SKILL.md has an invalid or missing name')
    }
    if (!description) throw new HttpError(400, 'remote SKILL.md has no description')
    const dir = path.join(dshHome(), 'skills', name)
    if (fs.existsSync(dir)) throw new HttpError(409, 'skill "' + name + '" already exists locally')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'SKILL.md'), text, { flag: 'wx' })
    const repo = remoteRepoFromUrl(url)
    const license = front.license ? String(front.license) : null
    const trust = classifyTrust({ name, source: 'user-dsh' }, { repo, trust: String(payload.trust || '') })
    const security = scanSkillText(text)
    const source = {
      url,
      repo,
      name,
      sha256: sha256(text),
      trust,
      license,
      risk: security.level,
      installedAt: new Date().toISOString(),
    }
    fs.writeFileSync(path.join(dir, SOURCE_META_FILE), JSON.stringify(source, null, 2))
    upsertLock({
      name,
      url,
      repo,
      sha256: source.sha256,
      trust,
      license,
      installedAt: source.installedAt,
      updatedAt: source.installedAt,
    })
    return {
      ok: true,
      name,
      path: path.join(dir, 'SKILL.md'),
      source,
      trust,
      license,
      security,
      note: 'Only SKILL.md was fetched. Referenced assets/scripts are not installed automatically.',
    }
  })
}

async function checkSkillUpdates() {
  const root = path.join(dshHome(), 'skills')
  const updates = []
  let entries = []
  try {
    entries = fs.readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory())
  } catch {
    return { ok: true, updates, checked: 0 }
  }
  for (const entry of entries.slice(0, 40)) {
    const dir = path.join(root, entry.name)
    const source = readJsonFile(path.join(dir, SOURCE_META_FILE), null)
    if (!source || !source.url) continue
    let localText = ''
    try {
      localText = fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8')
    } catch {
      localText = ''
    }
    try {
      const { text } = await fetchRemoteSkill(source.url)
      const remoteHash = sha256(text)
      if (remoteHash !== source.sha256) {
        const front = parseFrontmatter(text)
        updates.push({
          name: entry.name,
          url: source.url,
          localSha256: source.sha256,
          remoteSha256: remoteHash,
          trust: source.trust || 'community',
          license: front.license ? String(front.license) : null,
          risk: scanSkillText(text).level,
          diff: diffSkillLines(localText, text),
        })
      }
    } catch {
      // A missing remote or rate limit should not fail the whole check.
    }
  }
  return { ok: true, updates, checked: Math.min(entries.length, 40) }
}

async function searchMcpServers(query) {
  const url = new URL(MCP_REGISTRY_URL)
  url.searchParams.set('limit', '20')
  if (query) url.searchParams.set('search', query)
  const response = await fetch(url, {
    headers: { 'User-Agent': 'ronge-skill-studio' },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new HttpError(502, 'MCP registry fetch failed: HTTP ' + response.status)
  const payload = await response.json()
  const servers = (payload.servers || []).map((item) => {
    const server = item.server || item
    return {
      name: server.name,
      title: server.title || server.name,
      description: server.description || '',
      version: server.version || '',
      repo: server.repository?.url || null,
      remotes: Array.isArray(server.remotes) ? server.remotes.map((remote) => remote.url).filter(Boolean) : [],
    }
  })
  return { ok: true, servers, query: query || '', source: MCP_REGISTRY_URL }
}


let libraryCache = null

function loadLibraryIndex() {
  if (libraryCache) return libraryCache
  const file = path.join(PACKAGE_DIR, 'library', 'skills-index.json')
  const data = readJsonFile(file, null)
  libraryCache = data && Array.isArray(data.entries) ? data : null
  return libraryCache
}

let libraryRatingCache = null

function libraryRatingMap() {
  if (libraryRatingCache) return libraryRatingCache
  const map = new Map()
  const library = loadLibraryIndex()
  for (const entry of library?.entries || []) {
    map.set(entry.name, {
      rating: Number(entry.rating) || null,
      category: entry.category || '',
    })
  }
  libraryRatingCache = map
  return map
}

function installedSkillNameSet() {
  const set = new Set()
  try {
    const skillsDir = path.join(dshHome(), 'skills')
    for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      if (!fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md'))) continue
      set.add(entry.name)
    }
  } catch {
    // No installed skills yet.
  }
  return set
}

function searchLibrary(query, category, minRating, page, limit, lang, options = {}) {
  const language = lang === 'zh' || lang === 'en' ? lang : 'zh'
  const library = loadLibraryIndex()
  if (!library) return { ok: false, error: 'library index is not installed' }
  const q = String(query || '').trim().toLowerCase()
  const qTokens = q.split(/\s+/).filter(Boolean)
  const categoryFilter = String(category || '').trim()
  const threshold = Number(minRating) || 0
  const pageNumber = Math.max(1, Number(page) || 1)
  const pageSize = Math.min(80, Math.max(1, Number(limit) || 40))
  const installedNames = options.installed instanceof Set ? options.installed : installedSkillNameSet()
  const filtered = library.entries.filter((entry) => {
    if (options.excludeInstalled && installedNames.has(entry.name)) return false
    if (categoryFilter && entry.category !== categoryFilter) return false
    if (threshold && Number(entry.rating || 0) < threshold) return false
    if (!q) return true
    const haystack = [entry.name, entry.description, entry.whenToUse, entry.repo, entry.path, entry.category]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    if (haystack.includes(q)) return true
    return qTokens.some((token) => haystack.includes(token))
  })
  const total = filtered.length
  const start = (pageNumber - 1) * pageSize
  const entries = filtered.slice(start, start + pageSize).map((entry) => {
    const localized = localizeSkill(
      {
        name: entry.name,
        description: entry.description || '',
        whenToUse: entry.whenToUse || null,
      },
      language,
    )
    return {
      ...entry,
      intro: localized.intro || entry.description || '',
      categoryLabel: LIBRARY_CATEGORY_LABELS[entry.category] || entry.category || '',
      installed: installedNames.has(entry.name),
    }
  })
  return {
    ok: true,
    total,
    page: pageNumber,
    pageSize,
    categories: library.categories || {},
    categoryLabels: LIBRARY_CATEGORY_LABELS,
    generatedAt: library.generatedAt || null,
    entries,
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

const ROUTING_SECTION = `## 荣哥技能卷轴收藏馆（可沉浸式体验版本） routing

The session header has a 荣哥技能卷轴收藏馆（可沉浸式体验版本） panel ("技能") with context-aware skill recommendations, active-skill tracking, and a completion chime. The session skill catalog stays authoritative; before starting a task, call the \`skill\` tool when a matching skill exists. Common routes: video / motion / HyperFrames → beat-promo-director, hyperframes, hyperframes-cli, hyperframes-registry, media-use; Office documents → office, office-docx, office-xlsx, office-pptx, office-render, office-export-pdf, office-recalculate; Harness plugins or UI → cordis-plugin-development, cordis-composition-reference; agent presets or compositions → editing-cordis-compositions; tool and skill design → agent-experience.`

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
  const lines = match[1].split(/\r?\n/)
  const data = {}
  let index = 0
  while (index < lines.length) {
    const field = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(lines[index])
    if (!field) {
      index += 1
      continue
    }
    const key = field[1]
    let value = field[2].trim()
    index += 1
    if (value === '>' || value === '|' || value === '>-' || value === '|-') {
      const buffer = []
      while (
        index < lines.length &&
        (lines[index].startsWith(' ') || lines[index].startsWith('\t') || lines[index].trim() === '')
      ) {
        buffer.push(lines[index].trim())
        index += 1
      }
      value = buffer.filter(Boolean).join(' ')
    } else {
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
    }
    data[key] = value
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

function isHumanUserText(text) {
  const value = String(text || '').trim()
  if (!value) return false
  return !/^(background job|job .* finished|bash-[a-z0-9]+|a background job)/i.test(value)
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
  const humanTexts = userTexts.filter(isHumanUserText)
  const contextUserTexts = humanTexts.length ? humanTexts : userTexts
  const lastUserText = contextUserTexts.slice(-1)[0] || ''
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

  const contextMessages = contextUserTexts.slice(-12)
  const contextText = [contextMessages.join('\n'), fileNames.join(' ')].join('\n').trim()
  return {
    running: lastType !== 'turn/end',
    contextMessages: contextMessages.length,
    contextFiles: fileNames.length,
    activeSkills: dedupeSkillCalls(skillCalls.filter((call) => call.turn === maxTurn)).slice(-3),
    recentSkills: dedupeSkillCalls(skillCalls).slice(-6),
    activeTurn: maxTurn,
    contextText,
    lastUserText,
  }
}

function recommendSkills(
  skills,
  contextText,
  skillStats = {},
  weights = EVOLUTION_DEFAULT_WEIGHTS,
  options = {},
) {
  if (!contextText) return []
  const resolvedWeights = resolveEvolutionWeights(weights)
  const categoryWeights = resolveCategoryWeights(options.categoryWeights)
  const affinity = normalizeAffinity(options.affinity)
  const contextTokens = tokenize(contextText)
  const contextLower = contextText.toLowerCase()
  const scored = []
  for (const skill of skills) {
    const skillText = [skill.name, skill.description, skill.whenToUse || '', skill.intro || ''].join(' ')
    const skillTokens = tokenize(skillText)
    let score = 0
    const reasonsDetail = []
    const seen = new Set()
    let keywordCount = 0
    const addReason = (kind, label, detail, weight) => {
      if (!label || seen.has(kind + ':' + label)) return
      if (kind === 'keyword') {
        if (keywordCount >= 3) return
        keywordCount += 1
      }
      seen.add(kind + ':' + label)
      reasonsDetail.push({ kind, label, detail, weight: Math.round(weight * 10) / 10 })
    }
    for (const token of skillTokens) {
      if (!contextTokens.has(token)) continue
      score += resolvedWeights.token
      addReason('keyword', token, '上下文命中「' + token + '」', resolvedWeights.token)
    }
    if (skill.name && contextLower.includes(skill.name.toLowerCase())) {
      score += resolvedWeights.name
      reasonsDetail.unshift({
        kind: 'name',
        label: skill.name,
        detail: '请求里直接提到了这个技能',
        weight: resolvedWeights.name,
      })
    }
    const category = categoryOf(skill.name)
    const categoryWeight = categoryWeights[category] || 1
    for (const cue of CATEGORY_CUES[category] || []) {
      if (!contextLower.includes(cue.toLowerCase())) continue
      score += resolvedWeights.category * categoryWeight
      addReason('category', cue, '类别线索「' + cue + '」', resolvedWeights.category * categoryWeight)
    }
    const affinityEntry = affinity[skill.name]
    if (affinityEntry && affinityEntry.samples > 0) {
      const affinityBoost = Math.round(((affinityEntry.score - 0.5) * 2 * 2) * 10) / 10
      score += affinityBoost
      if (Math.abs(affinityBoost) >= 0.2) {
        addReason(
          'affinity',
          '手感×' + affinityEntry.samples,
          '这类任务的实际手感 ' + Math.round(affinityEntry.score * 100) + '%（' + affinityEntry.samples + ' 次）',
          affinityBoost,
        )
      }
    }
    const stat = skillStats[skill.name]
    if (stat && stat.uses > 0) {
      const good = Number(stat.good || 0)
      const bad = Number(stat.bad || 0)
      const completion =
        (good + bad === 0 ? Math.min(2, (stat.successes || stat.uses) * 0.25) : 0) *
        resolvedWeights.completion
      const boost =
        (Math.min(4, good * 0.8) - Math.min(2, bad * 0.5)) * resolvedWeights.experience + completion
      score += boost
      const label = good > 0 ? `好评×${good}` : bad > 0 ? `差评×${bad}` : `完成×${stat.successes || stat.uses}`
      addReason(
        'experience',
        label,
        `用过 ${stat.uses} 次，好评 ${good} / 差评 ${bad}`,
        boost,
      )
    }
    if (score > 0) {
      const kindOrder = { name: 0, experience: 1, affinity: 2, category: 3, keyword: 4 }
      const orderedReasons = reasonsDetail
        .slice()
        .sort((left, right) => (kindOrder[left.kind] ?? 9) - (kindOrder[right.kind] ?? 9))
        .slice(0, 6)
      scored.push({
        ...skill,
        score: Math.round(score * 10) / 10,
        reasons: orderedReasons.map((reason) => reason.label).slice(0, 5),
        reasonsDetail: orderedReasons,
      })
    }
  }
  const ranked = scored.sort((left, right) => right.score - left.score).slice(0, 4)
  if (options.explorationRate === undefined) return ranked
  return applyExploration(skills, ranked, skillStats, {
    explorationRate: options.explorationRate,
    random: options.random,
  })
}

function comboRatingFor(names) {
  const ratings = libraryRatingMap()
  const found = []
  for (const name of names) {
    const meta = ratings.get(name)
    if (meta && Number.isFinite(Number(meta.rating)) && Number(meta.rating) > 0) {
      found.push(Number(meta.rating))
    }
  }
  if (!found.length) return { rating: null, ratedSkills: 0 }
  return {
    rating: Math.round((found.reduce((sum, value) => sum + value, 0) / found.length) * 10) / 10,
    ratedSkills: found.length,
  }
}

const LIBRARY_CATEGORY_FOR_SKILL_CATEGORY = {
  video: ['video'],
  office: ['office'],
  harness: ['coding', 'ai'],
  other: ['ai', 'productivity', 'design'],
}

function buildActiveCombo(analysis, recommendations, mode, skillStats = {}) {
  const active = Array.isArray(analysis.activeSkills) ? analysis.activeSkills : []
  const recent = Array.isArray(analysis.recentSkills) ? analysis.recentSkills : []
  const source = active.length ? 'active' : recent.length ? 'recent' : recommendations.length ? 'recommended' : null
  if (!source) return null
  const picked =
    source === 'active'
      ? active
      : source === 'recent'
        ? recent.slice(-3)
        : recommendations.slice(0, 2).map((item) => ({ name: item.name }))
  const byName = new Map(recommendations.map((item) => [item.name, item]))
  const ratings = libraryRatingMap()
  const skills = picked.map((item) => {
    const rec = byName.get(item.name)
    const labels = rec && Array.isArray(rec.reasonsDetail) ? rec.reasonsDetail.map((reason) => reason.label).filter(Boolean) : []
    const meta = ratings.get(item.name)
    return {
      name: item.name,
      rating: meta && Number.isFinite(Number(meta.rating)) ? Number(meta.rating) : null,
      category: meta?.category || categoryOf(item.name),
      reason: labels.slice(0, 2).join(' · '),
    }
  })
  const { rating, ratedSkills } = comboRatingFor(skills.map((item) => item.name))
  const localRates = skills
    .map((item) => {
      const stat = skillStats && skillStats[item.name]
      if (!stat) return null
      const uses = Number(stat.uses || 0)
      const successes = Number(stat.successes || 0)
      if (!uses) return null
      return Math.min(1, Math.max(0, successes / uses))
    })
    .filter((value) => value !== null)
  const localRate = localRates.length
    ? Math.round((localRates.reduce((sum, value) => sum + value, 0) / localRates.length) * 100)
    : null
  const labels = []
  for (const skill of skills) {
    if (skill.reason) labels.push(skill.name + ': ' + skill.reason)
  }
  let why = labels.slice(0, 2).join('  /  ')
  if (!why) {
    why =
      source === 'recommended'
        ? '当前会话上下文与这些技能的关键词/类别匹配'
        : '由你的会话上下文触发；推荐器会根据使用结果继续调整'
  }
  const turn = Number(analysis.activeTurn || analysis.turn || 0) || null
  const lastAt = picked
    .map((item) => Number(item.time || 0))
    .filter((value) => value > 0)
    .sort((left, right) => right - left)[0]
  return {
    source,
    label: source,
    mode,
    skills,
    names: skills.map((item) => item.name),
    rating,
    ratedSkills,
    localRate,
    why,
    key: source + ':' + (turn || '') + ':' + skills.map((item) => item.name).join('+'),
    turn,
    changedAt: lastAt ? new Date(lastAt).toISOString() : null,
    contextPreview: String(analysis.lastUserText || '').slice(0, 120),
  }
}

function buildDiscoveries(analysis, recommendations, language, installedNames) {
  const categories = new Set()
  for (const item of recommendations) {
    const mapped = LIBRARY_CATEGORY_FOR_SKILL_CATEGORY[categoryOf(item.name)] || []
    for (const category of mapped) categories.add(category)
  }
  const found = []
  const addEntries = (entries) => {
    for (const entry of entries) {
      if (installedNames.has(entry.name)) continue
      if (found.find((item) => item.name === entry.name)) continue
      found.push(entry)
    }
  }
  const nameTokens = [...new Set(
    recommendations.flatMap((item) =>
      String(item.name || '')
        .split(/[-_]/)
        .filter((token) => token.length >= 3),
    ),
  )].slice(0, 10)
  if (nameTokens.length) {
    const result = searchLibrary(nameTokens.join(' '), '', 3, 1, 16, language, {
      excludeInstalled: true,
      installed: installedNames,
    })
    addEntries(result.entries || [])
  }
  for (const category of categories) {
    const result = searchLibrary('', category, 4, 1, 12, language, {
      excludeInstalled: true,
      installed: installedNames,
    })
    addEntries(result.entries || [])
  }
  if (found.length < 3) {
    const tokens = [...tokenize(analysis.contextText || analysis.lastUserText || '')]
      .filter((token) => token.length >= 2)
      .slice(-10)
    if (tokens.length) {
      const result = searchLibrary(tokens.join(' '), '', 4, 1, 12, language, {
        excludeInstalled: true,
        installed: installedNames,
      })
      addEntries(result.entries || [])
    }
  }
  found.sort((left, right) => Number(right.rating || 0) - Number(left.rating || 0))
  return found.slice(0, 3).map((entry) => ({
    name: entry.name,
    description: String(entry.description || '').slice(0, 240),
    intro: entry.intro || entry.description || '',
    category: entry.category,
    categoryLabel: entry.categoryLabel,
    rating: entry.rating,
    trust: entry.trust,
    rawUrl: entry.rawUrl,
    url: entry.url,
    repo: entry.repo,
    path: entry.path,
    installed: false,
  }))
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
  // The panel is a UI surface: when the client tells us its locale, use it.
  // Context language only decides when the caller did not specify one.
  const language =
    lang === 'zh' || lang === 'en'
      ? lang
      : detectLang(analysis.lastUserText || analysis.contextText, 'zh')
  const summaries = sortSkills([...merged.values()])
    .map((skill) => localizeSkill(skill, language))
    .map((skill) => ({ ...skill, ...securityForSkill(skill) }))
  const evolution = loadEvolution()
  const recommendations = analysis.contextText
    ? recommendSkills(summaries, analysis.contextText, memory.skills, evolution.weights, {
        categoryWeights: evolution.categoryWeights,
        affinity: evolution.skillAffinity,
        explorationRate: evolution.explorationRate,
      })
    : []
  noteRecommendationExposure(recommendations)
  const installedNames = installedSkillNameSet()
  const activeCombo = buildActiveCombo(analysis, recommendations, studioMode, memory.skills)
  const discoveries = buildDiscoveries(analysis, recommendations, language, installedNames)
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
    discoveries,
    activeCombo,
    activeSkills: analysis.activeSkills,
    recentSkills: analysis.recentSkills,
    running: analysis.running,
    contextPreview: analysis.lastUserText.slice(0, 160),
    contextWindow: {
      messages: Number(analysis.contextMessages || 0),
      files: Number(analysis.contextFiles || 0),
    },
    mode: studioMode,
    experience: experienceSnapshot(cwd),
    evolution: evolutionSnapshot(),
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
  migrateLegacyStudioDir()
  loadStudioState()
  const disposers = []
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/catalog.json',
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
      path: '/ronge-adaptive-skill-archive/create',
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
      path: '/ronge-adaptive-skill-archive/mode',
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
      path: '/ronge-adaptive-skill-archive/feedback',
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
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/discover',
      handler: route(async (req, res) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(405, 'method not allowed')
        const url = new URL(req.url || '/', 'http://127.0.0.1')
        const query = (url.searchParams.get('q') || '').trim().toLowerCase()
        const index = loadRemoteIndex()
        const entries = index.entries
          .filter((entry) => {
            if (!query) return true
            return [entry.name, entry.description, entry.whenToUse, entry.repo, entry.path]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(query)
          })
          .slice(0, 40)
          .map((entry) => ({
            ...entry,
            installed: installedNames.has(entry.name),
          }))
        sendJson(res, 200, {
          ok: true,
          entries,
          cachedAt: index.cachedAt,
          label: index.label,
          total: index.entries.length,
        })
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/discover/refresh',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        const payload = await refreshRemoteIndex()
        sendJson(res, 200, {
          ok: true,
          count: payload.entries.length,
          fetchedAt: payload.fetchedAt,
          errors: payload.errors,
        })
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/discover/preview',
      handler: route(async (req, res) => {
        if (req.method !== 'GET') throw new HttpError(405, 'method not allowed')
        const url = new URL(req.url || '/', 'http://127.0.0.1')
        const remoteUrl = url.searchParams.get('url') || ''
        const { url: checkedUrl, text } = await fetchRemoteSkill(remoteUrl)
        const front = parseFrontmatter(text)
        const repo = remoteRepoFromUrl(checkedUrl)
        sendJson(res, 200, {
          ok: true,
          url: checkedUrl,
          content: text,
          frontmatter: front,
          trust: classifyTrust({ name: String(front.name || '') }, { repo }),
          license: front.license ? String(front.license) : null,
          security: scanSkillText(text),
        })
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/discover/install',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        const payload = await readJson(req)
        const installed = await installRemoteSkill(payload)
        sendJson(res, 201, installed)
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/discover/updates',
      handler: route(async (req, res) => {
        if (req.method !== 'GET') throw new HttpError(405, 'method not allowed')
        const result = await checkSkillUpdates()
        sendJson(res, 200, result)
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/discover/update',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        const payload = await readJson(req)
        const updated = await applySkillUpdate(String(payload?.name ?? ''))
        sendJson(res, 200, updated)
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/discover/update-all',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        const result = await applyAllSkillUpdates()
        sendJson(res, 200, result)
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/discover/rollback',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        const payload = await readJson(req)
        const restored = rollbackSkill(String(payload?.name ?? ''))
        sendJson(res, 200, restored)
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/recommend-feedback',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        const payload = await readJson(req)
        const result = recordRecommendationFeedback(
          String(payload?.skillName ?? ''),
          String(payload?.verdict ?? ''),
          String(payload?.kind ?? ''),
        )
        sendJson(res, 200, {
          ok: true,
          stats: result.stats,
          updatedAt: result.updatedAt,
          evolution: result.evolution,
        })
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/experience/export',
      handler: route(async (req, res) => {
        if (req.method !== 'GET') throw new HttpError(405, 'method not allowed')
        sendJson(res, 200, { ok: true, payload: exportExperience() })
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/experience/import',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        const body = await readJson(req, 1024 * 1024)
        const payload = body && body.payload && typeof body.payload === 'object' ? body.payload : body
        const result = importExperience(payload)
        sendJson(res, 200, result)
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/health',
      handler: route(async (req, res) => {
        if (req.method !== 'GET') throw new HttpError(405, 'method not allowed')
        const url = new URL(req.url || '/', 'http://127.0.0.1')
        const cwd = url.searchParams.get('cwd') || config?.cwd || process.cwd()
        sendJson(res, 200, { ok: true, ...experienceHealth(memory.skills, cwd) })
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/evolution',
      handler: route(async (req, res) => {
        if (req.method !== 'GET') throw new HttpError(405, 'method not allowed')
        sendJson(res, 200, { ok: true, ...evolutionSnapshot() })
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/evolution/evaluate',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        sendJson(res, 200, runEvolution('manual'))
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/evolution/config',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        const payload = await readJson(req)
        if (payload.explorationRate === undefined) throw new HttpError(400, 'explorationRate is required')
        const result = setEvolutionExplorationRate(payload.explorationRate)
        sendJson(res, 200, result)
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/evolution/rollback',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        sendJson(res, 200, rollbackEvolution())
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/evolution/reset',
      handler: route(async (req, res) => {
        if (req.method !== 'POST') throw new HttpError(405, 'method not allowed')
        sendJson(res, 200, resetEvolution())
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/library',
      handler: route(async (req, res) => {
        if (req.method !== 'GET') throw new HttpError(405, 'method not allowed')
        const url = new URL(req.url || '/', 'http://127.0.0.1')
        const result = searchLibrary(
          url.searchParams.get('q') || '',
          url.searchParams.get('category') || '',
          url.searchParams.get('minRating') || 0,
          url.searchParams.get('page') || 1,
          url.searchParams.get('limit') || 40,
          url.searchParams.get('lang') || '',
          {
            excludeInstalled: url.searchParams.get('hideInstalled') === '1',
            installed: installedSkillNameSet(),
          },
        )
        if (result.ok === false) throw new HttpError(503, result.error)
        sendJson(res, 200, result)
      }),
    }),
  )
  disposers.push(
    ctx.webServer.register({
      kind: 'exact',
      path: '/ronge-adaptive-skill-archive/tools',
      handler: route(async (req, res) => {
        if (req.method !== 'GET') throw new HttpError(405, 'method not allowed')
        const url = new URL(req.url || '/', 'http://127.0.0.1')
        const query = (url.searchParams.get('q') || '').trim()
        const result = await searchMcpServers(query)
        sendJson(res, 200, result)
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
        name: 'ronge-adaptive-skill-archive',
        order: 880,
        text: ROUTING_SECTION,
      }),
    )
    ctx.effect(() =>
      systemPrompt.section({
        name: 'ronge-adaptive-skill-archive-mode',
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
      } else if (topLevel && state && state.skills.size > 0) {
        recordFailedTurn(sid, header, state)
      }
      turnStates.delete(sid)
    }),
  )
}

export {
  EVOLUTION_DEFAULT_EXPLORATION,
  EVOLUTION_DEFAULT_WEIGHTS,
  aggregateSkillStats,
  applyExploration,
  classifyTrust,
  detectLang,
  diffSkillLines,
  evaluateEvolutionState,
  evaluateRecommendations,
  localizeSkill,
  mergeExperienceData,
  parseSkillArguments,
  recommendSkills,
  resolveCategoryWeights,
  resolveEvolutionWeights,
  scanSkillText,
  tokenize,
  buildActiveCombo,
  buildDiscoveries,
  libraryRatingMap,
  installedSkillNameSet,
}
