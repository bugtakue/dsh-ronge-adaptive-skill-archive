#!/usr/bin/env node
/**
 * Cross-agent MCP server: the recommendation / experience / evolution engine
 * of ronge-adaptive-skill-archive, usable from Claude Code, Codex, Cursor and
 * any other MCP client.
 *
 * Transport: stdio, newline-delimited JSON-RPC 2.0 (MCP 2024-11-05).
 * No profile writes: this process only manages its own data directory and
 * (optionally) installs a user-approved SKILL.md into an agent skill folder.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applyExploration,
  evaluateEvolutionState,
  recommendSkills,
  resolveCategoryWeights,
  resolveEvolutionWeights,
  scanSkillText,
  tokenize,
} from '../index.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PKG = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const HOME = process.env.RONGE_SKILL_HOME || path.join(os.homedir(), '.ronge-adaptive-skill-cockpit')
const DATA_FILE = path.join(HOME, 'cross-agent.json')
const MAX_SKILL_BYTES = 256 * 1024
const DEFAULT_DIRS = [
  path.join(os.homedir(), '.claude', 'skills'),
  path.join(os.homedir(), '.codex', 'skills'),
  path.join(os.homedir(), '.agents', 'skills'),
  path.join(os.homedir(), '.dsh', 'skills'),
  path.join(process.cwd(), '.claude', 'skills'),
  path.join(process.cwd(), '.codex', 'skills'),
  path.join(process.cwd(), '.agents', 'skills'),
  path.join(process.cwd(), '.dsh', 'skills'),
]
const AGENT_DIRS = {
  'claude-code': path.join(os.homedir(), '.claude', 'skills'),
  codex: path.join(os.homedir(), '.codex', 'skills'),
  dsh: path.join(os.homedir(), '.dsh', 'skills'),
  agents: path.join(os.homedir(), '.agents', 'skills'),
}

const log = (text) => process.stderr.write('[ronge-mcp] ' + text + '\n')
let stateCache = null
let libraryCache = null

function emptyEvolution() {
  return {
    version: 1,
    weights: resolveEvolutionWeights(null),
    categoryWeights: resolveCategoryWeights(null),
    explorationRate: 0.1,
    skillAffinity: {},
    stats: {
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
    },
    kindBySkill: {},
    categoryBySkill: {},
    observationsSinceEval: 0,
    lastEvaluatedAt: null,
    history: [],
  }
}

function loadState() {
  if (stateCache) return stateCache
  let saved = null
  try {
    saved = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch {
    saved = null
  }
  const evolution = saved && saved.evolution && typeof saved.evolution === 'object' ? saved.evolution : {}
  stateCache = {
    version: 1,
    updatedAt: saved?.updatedAt || null,
    experience: {
      skills: saved?.experience?.skills && typeof saved.experience.skills === 'object' ? saved.experience.skills : {},
      entries: Array.isArray(saved?.experience?.entries) ? saved.experience.entries.slice(-500) : [],
    },
    evolution: { ...emptyEvolution(), ...evolution },
  }
  return stateCache
}

function saveState() {
  const state = loadState()
  state.updatedAt = new Date().toISOString()
  try {
    fs.mkdirSync(HOME, { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2))
  } catch (error) {
    log('cannot save state: ' + error.message)
  }
}

function categoryOf(name, text = '') {
  const haystack = (String(name) + ' ' + String(text)).toLowerCase()
  if (/video|视频|宣传片|抖音|剪辑|分镜|动画|短片|音乐|hyperframes|beat/.test(haystack)) return 'video'
  if (/office|文档|表格|ppt|word|excel|pdf|演示|报告|docx|xlsx/.test(haystack)) return 'office'
  if (/harness|dsh|插件|面板|bundle|slot|cordis|plugin|ui/.test(haystack)) return 'harness'
  return 'other'
}

function parseFrontmatter(text) {
  const source = String(text || '')
  const match = source.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---/)
  const data = {}
  if (!match) return data
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/)
    if (pair) data[pair[1]] = pair[2].replace(/^['"]|['"]$/g, '')
  }
  return data
}

function introOf(text, frontmatter) {
  const body = String(text || '').replace(/^\uFEFF?---[\s\S]*?---\r?\n?/, '')
  const first = body
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.replace(/^#+\s*/, '').trim())
    .find((part) => part && !part.startsWith('#'))
  return String(frontmatter.description || first || '').replace(/\s+/g, ' ').slice(0, 220)
}

function skillDirs() {
  if (process.env.RONGE_SKILL_DIRS) return process.env.RONGE_SKILL_DIRS.split(path.delimiter).filter(Boolean)
  return DEFAULT_DIRS
}

function scanInstalledSkills() {
  const found = []
  const seen = new Set()
  for (const dir of skillDirs()) {
    let entries = []
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }
    const candidates = entries.filter((entry) => entry.isDirectory()).map((entry) => path.join(dir, entry.name, 'SKILL.md'))
    if (entries.some((entry) => entry.isFile() && entry.name === 'SKILL.md')) candidates.push(path.join(dir, 'SKILL.md'))
    for (const file of candidates) {
      try {
        const text = fs.readFileSync(file, 'utf8')
        const front = parseFrontmatter(text)
        const name = String(front.name || path.basename(path.dirname(file))).trim()
        if (!name || seen.has(name)) continue
        seen.add(name)
        found.push({
          name,
          description: String(front.description || '').slice(0, 400),
          whenToUse: String(front.whenToUse || front['when-to-use'] || '').slice(0, 300),
          intro: introOf(text, front),
          source: 'installed',
          path: file,
          dir,
          category: categoryOf(name, front.description || text.slice(0, 400)),
          license: String(front.license || ''),
        })
      } catch {
        // unreadable skill folder: skip
      }
    }
  }
  return found
}

function getLibrary() {
  if (libraryCache) return libraryCache
  try {
    libraryCache = JSON.parse(fs.readFileSync(path.join(ROOT, 'library', 'skills-index.json'), 'utf8'))
  } catch {
    libraryCache = { entries: [] }
  }
  return libraryCache
}

function searchLibrary(query, category, limit) {
  const raw = String(query || '').trim()
  if (!raw) return []
  const tokens = tokenize(raw)
  const lower = raw.toLowerCase()
  const scored = []
  for (const entry of getLibrary().entries || []) {
    if (category && entry.category !== category) continue
    const name = String(entry.name || '').toLowerCase()
    const text = [entry.description, entry.whenToUse].filter(Boolean).join(' ').toLowerCase()
    let score = 0
    if (name.includes(lower)) score += 6
    for (const token of tokens) {
      if (name.includes(token)) score += 3
      if (text.includes(token)) score += 1
    }
    if (score > 0) scored.push({ entry, score })
  }
  return scored
    .sort((left, right) => right.score - left.score || Number(right.entry.rating || 0) - Number(left.entry.rating || 0))
    .slice(0, Math.max(1, Math.min(20, limit || 10)))
    .map(({ entry }) => ({
      name: entry.name,
      description: String(entry.description || '').slice(0, 240),
      category: entry.category,
      rating: entry.rating,
      trust: entry.trust,
      rawUrl: entry.rawUrl,
      repo: entry.repo,
      path: entry.path,
    }))
}

function buildRecommendations(context, cwd, limit) {
  const parsed = String(context || '').trim()
  if (!parsed) return { recommendations: [], installedCount: 0 }
  let contextText = parsed
  if (cwd) {
    try {
      contextText += '\n' + fs
        .readdirSync(cwd, { withFileTypes: true })
        .filter((entry) => !entry.name.startsWith('.'))
        .slice(0, 50)
        .map((entry) => entry.name)
        .join(' ')
    } catch {
      // cwd is optional
    }
  }
  const skills = scanInstalledSkills()
  const state = loadState()
  const ranked = recommendSkills(skills, contextText, state.experience.skills, state.evolution.weights, {
    categoryWeights: state.evolution.categoryWeights,
    affinity: state.evolution.skillAffinity,
    explorationRate: state.evolution.explorationRate,
  })
  return {
    recommendations: ranked.slice(0, Math.max(1, Math.min(4, limit || 4))).map((item) => ({
      name: item.name,
      score: item.score,
      reasons: item.reasons,
      reasonsDetail: item.reasonsDetail,
      intro: item.intro,
      path: item.path,
      source: item.source,
      exploration: Boolean(item.exploration),
    })),
    installedCount: skills.length,
    explorationRate: state.evolution.explorationRate,
  }
}

function updateSkillStat(name, verdict) {
  const experience = loadState().experience
  const stat = experience.skills[name] || { uses: 0, successes: 0, good: 0, bad: 0, lastUsed: null }
  const at = new Date().toISOString()
  if (verdict === 'success') {
    stat.uses += 1
    stat.successes += 1
  } else if (verdict === 'failed') {
    stat.uses += 1
  } else if (verdict === 'adopt' || verdict === 'used') {
    stat.uses += 1
  } else if (verdict === 'good') {
    stat.good += 1
  } else if (verdict === 'bad') {
    stat.bad += 1
  }
  stat.lastUsed = at
  experience.skills[name] = stat
  experience.entries.push({ at, skill: name, verdict })
  if (experience.entries.length > 500) experience.entries = experience.entries.slice(-500)
  return stat
}

function recordOutcome(name, verdict, note) {
  const state = loadState()
  const stat = updateSkillStat(name, verdict)
  const kind = 'experience'
  const bucket = state.evolution.stats.byKind[kind]
  if (bucket && ['good', 'bad'].includes(verdict)) bucket[verdict] += 1
  if (verdict === 'good') state.evolution.stats.good += 1
  if (verdict === 'bad') state.evolution.stats.bad += 1
  state.evolution.stats.observations += 1
  state.evolution.observationsSinceEval += 1
  const delta = verdict === 'bad' || verdict === 'failed' ? -1 : 1
  const prev = state.evolution.skillAffinity[name] || { score: 0.5, samples: 0 }
  const weight = prev.samples === 0 ? 0.35 : 0.2
  state.evolution.skillAffinity[name] = {
    score: Math.round((prev.score + ((delta > 0 ? 1 : 0) - prev.score) * weight) * 100) / 100,
    samples: prev.samples + 1,
    lastAt: new Date().toISOString(),
  }
  const category = categoryOf(name)
  state.evolution.categoryBySkill[name] = { category, at: new Date().toISOString() }
  if (verdict === 'good' || verdict === 'bad') {
    const catBucket = state.evolution.stats.byCategory[category] || { good: 0, bad: 0 }
    catBucket[verdict] += 1
    state.evolution.stats.byCategory[category] = catBucket
  }
  let evolution = null
  if (state.evolution.observationsSinceEval >= 10) {
    const report = evaluateEvolutionState(state.evolution, { reason: 'mcp-auto' })
    state.evolution = report.state
    evolution = report.changes.map((change) => ({ weight: change.weight, from: change.from, to: change.to, label: change.label }))
  }
  saveState()
  return {
    ok: true,
    skill: name,
    verdict,
    note: note ? String(note).slice(0, 300) : undefined,
    stats: { uses: stat.uses, good: stat.good, bad: stat.bad, affinity: state.evolution.skillAffinity[name]?.score },
    evolution,
  }
}

function experienceSummary() {
  const state = loadState()
  const stats = Object.entries(state.experience.skills)
    .map(([name, stat]) => ({ name, ...stat }))
    .sort((left, right) => right.uses - left.uses || right.good - left.good)
    .slice(0, 20)
  return {
    skillsTracked: Object.keys(state.experience.skills).length,
    entries: state.experience.entries.length,
    topSkills: stats,
    recent: state.experience.entries.slice(-8),
    evolution: {
      weights: state.evolution.weights,
      categoryWeights: state.evolution.categoryWeights,
      explorationRate: state.evolution.explorationRate,
      observations: state.evolution.stats.observations,
      lastEvaluatedAt: state.evolution.lastEvaluatedAt,
      recentChanges: state.evolution.history.slice(-3).map((entry) => ({ at: entry.at, reason: entry.reason, changes: entry.changes })),
    },
  }
}

function checkTargetDir(targetDir, agent) {
  const base = AGENT_DIRS[agent]
  if (agent !== 'generic') {
    if (!base) throw new Error('unsupported agent: ' + agent)
    return base
  }
  if (!targetDir) throw new Error('targetDir is required when agent is "generic"')
  const resolved = path.resolve(String(targetDir))
  const home = os.homedir()
  const cwd = process.cwd()
  if (!resolved.startsWith(home + path.sep) && !resolved.startsWith(cwd + path.sep)) {
    throw new Error('targetDir must be inside the home directory or the current working directory')
  }
  return resolved
}

async function installSkill({ url, agent = 'claude-code', targetDir, force = false }) {
  const source = String(url || '').trim()
  if (!/^https:\/\/raw\.githubusercontent\.com\/[^\s]+\/SKILL\.md$/.test(source)) {
    throw new Error('url must be a raw.githubusercontent.com/**/SKILL.md URL')
  }
  const response = await fetch(source)
  if (!response.ok) throw new Error('download failed: HTTP ' + response.status)
  const text = await response.text()
  if (Buffer.byteLength(text) > MAX_SKILL_BYTES) throw new Error('SKILL.md exceeds 256 KiB')
  const scan = scanSkillText(text)
  if (scan.level === 'high' && !force) {
    return {
      ok: false,
      blocked: true,
      reason: 'high-risk content found; pass force=true only after manual review',
      level: scan.level,
      findings: scan.findings,
    }
  }
  const front = parseFrontmatter(text)
  const name = String(front.name || path.basename(path.dirname(new URL(source).pathname))).trim()
  if (!/^[a-zA-Z0-9._-]{1,80}$/.test(name)) throw new Error('invalid skill name')
  const base = checkTargetDir(targetDir, agent)
  const dir = path.join(base, name)
  const file = path.join(dir, 'SKILL.md')
  fs.mkdirSync(dir, { recursive: true })
  let backup = null
  if (fs.existsSync(file)) {
    backup = file + '.bak-' + new Date().toISOString().replace(/[:.]/g, '-')
    fs.copyFileSync(file, backup)
  }
  fs.writeFileSync(file, text)
  return {
    ok: true,
    agent,
    name,
    path: file,
    bytes: Buffer.byteLength(text),
    backup,
    level: scan.level,
    findings: scan.findings,
    forced: scan.level === 'high' && Boolean(force),
    scan,
  }
}

const TOOLS = [
  {
    name: 'recommend_skills',
    description:
      'Recommend up to four installed agent skills for the current task, with short reasons and a one-line intro. Use it before choosing which skill to load; pass the user request (plus optional cwd) as context.',
    inputSchema: {
      type: 'object',
      properties: {
        context: { type: 'string', description: 'The current user request or a short summary of the task.' },
        cwd: { type: 'string', description: 'Optional project directory; its top-level file names are added as context.' },
        limit: { type: 'integer', minimum: 1, maximum: 4, description: 'Maximum number of recommendations. Default 4.' },
      },
      required: ['context'],
    },
  },
  {
    name: 'search_skills',
    description:
      'Search the bundled public SKILL.md index (6,399 entries) by keyword. Returns names, descriptions, categories, ratings, trust levels and raw GitHub URLs. Use it to discover a skill that is not installed yet.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords, skill name, or task phrase.' },
        category: { type: 'string', enum: ['video', 'office', 'harness', 'other'], description: 'Optional category filter.' },
        limit: { type: 'integer', minimum: 1, maximum: 20, description: 'Maximum results. Default 10.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'scan_skill_text',
    description:
      'Run the local safety scan over a candidate SKILL.md text before installing it. Returns a risk level (low/medium/high) and findings; this is a heuristic, not a security guarantee.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Full SKILL.md content to scan.' },
        url: { type: 'string', description: 'Alternatively, a raw.githubusercontent.com/**/SKILL.md URL to download and scan.' },
      },
    },
  },
  {
    name: 'install_skill',
    description:
      'Download a raw.githubusercontent.com/**/SKILL.md, run the safety scan, then install it into an agent skill folder (with a backup of the previous file). High-risk content is blocked unless force=true is passed after manual review.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'raw.githubusercontent.com/**/SKILL.md URL.' },
        agent: { type: 'string', enum: ['claude-code', 'codex', 'dsh', 'agents', 'generic'], description: 'Target agent skill folder. Default claude-code.' },
        targetDir: { type: 'string', description: 'Required only for agent "generic"; must be under the home directory or cwd.' },
        force: { type: 'boolean', description: 'Install even when the scan level is high. Only after manual review.' },
      },
      required: ['url'],
    },
  },
  {
    name: 'record_outcome',
    description:
      'Record what happened after using a skill so the local recommender learns: success, failed, good, bad, adopt or used. Feedback stays on this machine and drives category weights, exploration quota and skill affinity.',
    inputSchema: {
      type: 'object',
      properties: {
        skill: { type: 'string', description: 'Exact installed skill name.' },
        verdict: { type: 'string', enum: ['success', 'failed', 'good', 'bad', 'adopt', 'used'] },
        note: { type: 'string', description: 'Optional short note (max 300 chars) about what worked.' },
      },
      required: ['skill', 'verdict'],
    },
  },
  {
    name: 'experience_summary',
    description:
      'Show the local experience and self-evolution state: tracked skills, recent outcomes, learned weights, category weights and the current exploration quota.',
    inputSchema: { type: 'object', properties: {} },
  },
]

async function callTool(name, args) {
  const input = args && typeof args === 'object' ? args : {}
  switch (name) {
    case 'recommend_skills':
      return buildRecommendations(input.context, input.cwd, input.limit)
    case 'search_skills':
      return { query: input.query, results: searchLibrary(input.query, input.category, input.limit) }
    case 'scan_skill_text': {
      let text = String(input.text || '')
      if (!text && input.url) {
        const response = await fetch(String(input.url))
        if (!response.ok) throw new Error('download failed: HTTP ' + response.status)
        text = await response.text()
      }
      if (!text) throw new Error('provide text or url')
      const scan = scanSkillText(text)
      return { level: scan.level, score: scan.score, findings: scan.findings }
    }
    case 'install_skill':
      return installSkill(input)
    case 'record_outcome':
      return recordOutcome(input.skill, input.verdict, input.note)
    case 'experience_summary':
      return experienceSummary()
    default:
      throw new Error('unknown tool: ' + name)
  }
}

function writeMessage(message) {
  process.stdout.write(JSON.stringify(message) + '\n')
}

async function handleMessage(message) {
  if (!message || typeof message !== 'object' || message.jsonrpc !== '2.0') return
  const { id, method, params } = message
  const isNotification = id === undefined || id === null
  try {
    if (method === 'initialize') {
      writeMessage({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'ronge-adaptive-skill-archive', version: PKG.version },
        },
      })
      return
    }
    if (method === 'notifications/initialized' || method === 'notifications/cancelled') return
    if (method === 'ping') {
      if (!isNotification) writeMessage({ jsonrpc: '2.0', id, result: {} })
      return
    }
    if (method === 'tools/list') {
      writeMessage({ jsonrpc: '2.0', id, result: { tools: TOOLS } })
      return
    }
    if (method === 'tools/call') {
      const name = params?.name
      const args = params?.arguments || {}
      try {
        const result = await callTool(name, args)
        writeMessage({
          jsonrpc: '2.0',
          id,
          result: {
            content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            structuredContent: result,
            isError: false,
          },
        })
      } catch (error) {
        writeMessage({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: 'Error: ' + String(error.message || error) }], isError: true },
        })
      }
      return
    }
    if (!isNotification) {
      writeMessage({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found: ' + method } })
    }
  } catch (error) {
    if (!isNotification) {
      writeMessage({ jsonrpc: '2.0', id, error: { code: -32603, message: String(error.message || error) } })
    }
  }
}

export function startMcpServer() {
  log(`v${PKG.version} ready (stdio); data: ${HOME}`)
  let buffer = ''
  process.stdin.setEncoding('utf8')
  process.stdin.on('data', (chunk) => {
    buffer += chunk
    let index = buffer.indexOf('\n')
    while (index >= 0) {
      const line = buffer.slice(0, index).trim()
      buffer = buffer.slice(index + 1)
      index = buffer.indexOf('\n')
      if (!line) continue
      let message = null
      try {
        message = JSON.parse(line)
      } catch {
        log('ignored non-JSON line')
        continue
      }
      void handleMessage(message)
    }
  })
  process.stdin.on('end', () => process.exit(0))
}

export const __testing = { buildRecommendations, searchLibrary, recordOutcome, experienceSummary, installSkill, scanInstalledSkills }
