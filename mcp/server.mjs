#!/usr/bin/env node
/**
 * Cross-agent MCP server: the recommendation / experience / evolution engine
 * of dsh-ronge-adaptive-skill-archive, usable from Claude Code, Codex, Cursor and
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
  fetchRemoteSkill,
  scanSkillText,
  tokenize,
  uniqueSkillName,
} from '../index.js'
import { atomicWriteFile, atomicWriteJson } from '../lib/fsx.js'
import { createHash } from 'node:crypto'

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
    fs.mkdirSync(HOME, { recursive: true, mode: 0o700 })
    atomicWriteJson(DATA_FILE, state)
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

// ---------------------------------------------------------------------------
// Local, deterministic hash-vector retrieval ("semantic search" without a model)
//
// Text -> 256-dim vector: word tokens and CJK character n-grams (2-4) are
// hashed into buckets with signed feature hashing, then L2-normalized. A small
// built-in bilingual concept table expands a matched concept into its Chinese
// and English aliases, so a Chinese request can match an English skill and vice
// versa. This is a lexical hashing embedding, NOT a neural embedding: there is
// no network call, no model download and no new dependency, and the same text
// always maps to the same vector.
//
// Ranking fuses 0.6 * cosine(query, entry) with 0.4 * (keyword hits/quality);
// the existing weak / duplicateRank / quality<45 filters are unchanged.
// ---------------------------------------------------------------------------
const EMBED_DIM = 256
const EMBED_EXPANSION_WEIGHT = 0.8
const SEMANTIC_FLOOR = 0.12
const SEMANTIC_WEIGHT = 0.6
const KEYWORD_WEIGHT = 0.4
const KEYWORD_QUALITY_SPLIT = 0.7

// zh: every surface is both a trigger and an expansion alias.
// en: every word is an expansion alias; only `strong` words trigger the group,
// which keeps ambiguous words such as "editing", "test" or "design" quiet.
const CONCEPT_GROUPS = [
  { zh: ['视频', '宣传片', '短片', '影片', '电影', '剪辑', '分镜', '动画', '特效', '卡点', '配乐', '影视'], en: ['video', 'promo', 'film', 'trailer', 'editing', 'storyboard', 'animation', 'motion', 'music', 'movie', 'cinematic'], strong: ['video', 'promo', 'film', 'trailer', 'storyboard', 'cinematic'] },
  { zh: ['图片', '图像', '海报', '封面', '插画', '修图', '配色', '视觉', '美工', '图形'], en: ['image', 'picture', 'poster', 'cover', 'illustration', 'visual', 'graphic'], strong: ['poster', 'illustration', 'graphic'] },
  { zh: ['表格', '文档', '演示', '幻灯片', '报告', '报表', '公式', '数据透视', 'excel'], en: ['excel', 'spreadsheet', 'table', 'document', 'word', 'ppt', 'slide', 'presentation', 'report', 'formula'], strong: ['excel', 'spreadsheet', 'ppt', 'slide'] },
  { zh: ['pdf', '提取', '扫描', '表单', 'ocr'], en: ['pdf', 'extract', 'scan', 'ocr', 'form', 'parse'], strong: ['pdf', 'ocr'] },
  { zh: ['代码', '编程', '重构', '调试', '函数', '脚本', '接口', '仓库'], en: ['code', 'coding', 'program', 'refactor', 'debug', 'function', 'script', 'api', 'repository'], strong: ['refactor', 'debug', 'api', 'repository'] },
  { zh: ['网页', '前端', '网站', '浏览器', '界面', 'h5'], en: ['web', 'frontend', 'website', 'browser', 'html', 'css', 'react', 'vue', 'ui'], strong: ['frontend', 'website', 'html', 'css', 'react', 'vue'] },
  { zh: ['后端', '服务', '数据库', '部署', '服务器'], en: ['backend', 'server', 'database', 'deploy', 'service', 'api'], strong: ['backend', 'database', 'deploy'] },
  { zh: ['数据', '分析', '统计', '可视化', '图表', '指标', '报表'], en: ['data', 'analysis', 'analytics', 'statistics', 'visualization', 'chart', 'metric', 'dashboard'], strong: ['analytics', 'dashboard', 'visualization', 'statistics'] },
  { zh: ['智能体', '模型', '提示词', '推理', '大模型', '工作流', '技能'], en: ['agent', 'model', 'prompt', 'llm', 'inference', 'workflow', 'skill'], strong: ['llm', 'prompt', 'agent'] },
  { zh: ['写作', '文案', '文章', '博客', '润色', '摘要', '笔记', '内容'], en: ['writing', 'copy', 'blog', 'article', 'edit', 'summary', 'note', 'content'], strong: ['writing', 'blog', 'article', 'summary'] },
  { zh: ['营销', '推广', '品牌', '增长', '转化', '运营', '投放'], en: ['marketing', 'promotion', 'brand', 'growth', 'conversion', 'campaign', 'ads'], strong: ['marketing', 'brand', 'campaign', 'conversion'] },
  { zh: ['研究', '调研', '检索', '论文', '文献', '学术'], en: ['research', 'survey', 'search', 'paper', 'literature', 'academic'], strong: ['research', 'paper', 'literature'] },
  { zh: ['安全', '漏洞', '扫描', '风险', '隐私', '渗透'], en: ['security', 'vulnerability', 'scan', 'risk', 'privacy', 'pentest'], strong: ['security', 'vulnerability', 'pentest'] },
  { zh: ['版本', '提交', '分支', '合并', '代码审查'], en: ['git', 'version', 'commit', 'branch', 'merge', 'review', 'pull'], strong: ['git', 'commit', 'branch', 'merge'] },
  { zh: ['测试', '单元', '集成', '回归'], en: ['test', 'unit', 'integration', 'regression', 'qa'], strong: ['qa', 'integration', 'regression'] },
  { zh: ['设计', '排版', '字体', '颜色', '交互'], en: ['design', 'layout', 'typography', 'font', 'color', 'interaction', 'ui', 'ux'], strong: ['typography', 'layout', 'ui', 'ux'] },
  { zh: ['音频', '配音', '语音', '播客', '音乐', '声音'], en: ['audio', 'voiceover', 'speech', 'podcast', 'music', 'sound'], strong: ['audio', 'voiceover', 'podcast'] },
  { zh: ['小红书', '抖音', '微博', '公众号', '社交媒体', '自媒体'], en: ['xiaohongshu', 'tiktok', 'weibo', 'wechat', 'social', 'media', 'creator'], strong: ['xiaohongshu', 'tiktok', 'wechat', 'social'] },
  { zh: ['财务', '金融', '会计', '发票', '报销', '预算'], en: ['finance', 'financial', 'accounting', 'invoice', 'expense', 'budget'], strong: ['finance', 'accounting', 'invoice'] },
  { zh: ['合同', '法律', '合规', '条款'], en: ['contract', 'legal', 'compliance', 'clause'], strong: ['legal', 'contract', 'compliance'] },
  { zh: ['教学', '课程', '学习', '考试', '教育'], en: ['teach', 'course', 'learning', 'exam', 'education'], strong: ['course', 'learning', 'education'] },
  { zh: ['效率', '管理', '计划', '任务', '清单'], en: ['productivity', 'management', 'plan', 'task', 'checklist'], strong: ['productivity', 'checklist'] },
  { zh: ['翻译', '本地化', '语言'], en: ['translate', 'translation', 'language', 'localization'], strong: ['translate', 'translation', 'localization'] },
  { zh: ['搜索', '优化', '排名'], en: ['seo', 'search', 'optimization', 'ranking'], strong: ['seo', 'optimization'] },
]

function normalizeForEmbed(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
}

function hashFeature(feature) {
  // FNV-1a 32-bit + murmur3 finalizer: plain FNV-1a low bits are too clustered
  // for 256 buckets on short tokens.
  let hash = 0x811c9dc5
  for (let index = 0; index < feature.length; index += 1) {
    hash ^= feature.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  hash ^= hash >>> 16
  hash = Math.imul(hash, 0x85ebca6b)
  hash ^= hash >>> 13
  hash = Math.imul(hash, 0xc2b2ae35)
  hash ^= hash >>> 16
  return hash >>> 0
}

function addEmbedFeature(features, feature, weight) {
  features.set(feature, (features.get(feature) || 0) + weight)
}

function embedFeatures(text) {
  const value = normalizeForEmbed(text)
  const features = new Map()
  if (!value) return features
  const tokens = tokenize(value)
  for (const token of tokens) addEmbedFeature(features, 'w:' + token, 1)
  for (const run of value.match(/[\u4e00-\u9fff]+/g) || []) {
    for (let size = 2; size <= 4; size += 1) {
      for (let start = 0; start + size <= run.length; start += 1) {
        addEmbedFeature(features, 'c:' + run.slice(start, start + size), size === 2 ? 0.6 : size === 3 ? 0.4 : 0.25)
      }
    }
  }
  const expansion = []
  for (const group of CONCEPT_GROUPS) {
    const zhHit = group.zh.some((surface) => value.includes(surface))
    const enHit = group.strong.some((word) => tokens.has(word))
    if (!zhHit && !enHit) continue
    expansion.push(...group.zh, ...group.en)
  }
  if (expansion.length) {
    for (const token of tokenize(expansion.join(' '))) addEmbedFeature(features, 'w:' + token, EMBED_EXPANSION_WEIGHT)
    for (const surface of expansion) {
      if (!/[\u4e00-\u9fff]/.test(surface)) continue
      for (let size = 2; size <= Math.min(4, surface.length); size += 1) {
        addEmbedFeature(features, 'c:' + surface.slice(0, size), EMBED_EXPANSION_WEIGHT * 0.4)
      }
    }
  }
  return features
}

function vectorFromFeatures(features) {
  const vector = new Float32Array(EMBED_DIM)
  for (const [feature, weight] of features) {
    const hash = hashFeature(feature)
    vector[hash % EMBED_DIM] += (hash >>> 31) === 0 ? weight : -weight
  }
  let norm = 0
  for (let index = 0; index < EMBED_DIM; index += 1) norm += vector[index] * vector[index]
  norm = Math.sqrt(norm)
  if (norm > 0) for (let index = 0; index < EMBED_DIM; index += 1) vector[index] /= norm
  return vector
}

function embedText(text) {
  return vectorFromFeatures(embedFeatures(text))
}

function cosineSimilarity(left, right) {
  let dot = 0
  for (let index = 0; index < EMBED_DIM; index += 1) dot += left[index] * right[index]
  return dot
}

const ENTRY_VECTORS = new WeakMap()

function entryVector(entry) {
  let vector = ENTRY_VECTORS.get(entry)
  if (!vector) {
    vector = embedText(
      [entry.name, String(entry.description || '').slice(0, 900), String(entry.whenToUse || '').slice(0, 300)].filter(Boolean).join(' '),
    )
    ENTRY_VECTORS.set(entry, vector)
  }
  return vector
}

// `quality` is the 0-100 index score. Tolerate a future `stars` field: a value
// of 5 or less is treated as a 5-star scale and rescaled to 0-100.
function entryQuality(entry) {
  const quality = Number(entry.quality)
  if (Number.isFinite(quality) && quality > 0) return Math.min(100, quality)
  const stars = Number(entry.stars)
  if (Number.isFinite(stars) && stars > 0) return stars <= 5 ? stars * 20 : Math.min(100, stars)
  return 0
}

function buildQuery(text) {
  const raw = String(text || '').trim()
  const features = embedFeatures(raw)
  return {
    raw,
    tokens: [...tokenize(raw)],
    lower: raw.toLowerCase(),
    vector: vectorFromFeatures(features),
    hasFeatures: features.size > 0,
  }
}

function lexicalScore(entry, query, options) {
  const name = String(entry.name || '').toLowerCase()
  const text = [entry.description, entry.whenToUse, options.category ? entry.category : ''].filter(Boolean).join(' ').toLowerCase()
  let score = 0
  if (options.phrase && name.includes(query.lower)) score += 6
  for (const token of query.tokens) {
    const inName = name.includes(token)
    if (inName) score += 3
    if (options.bothFields ? text.includes(token) : !inName && text.includes(token)) score += 1
  }
  return score
}

function fusedEntryScore(entry, query, lexicalOptions) {
  const semantic = query.hasFeatures ? Math.max(0, cosineSimilarity(query.vector, entryVector(entry))) : 0
  const raw = lexicalScore(entry, query, lexicalOptions)
  const keyword = raw / (raw + 4)
  const quality = Math.min(1, Math.max(0, entryQuality(entry) / 100))
  return {
    semantic,
    raw,
    score: SEMANTIC_WEIGHT * semantic + KEYWORD_WEIGHT * (KEYWORD_QUALITY_SPLIT * keyword + (1 - KEYWORD_QUALITY_SPLIT) * quality),
    grounded: semantic >= SEMANTIC_FLOOR || raw > 0,
  }
}

function searchLibrary(query, category, limit) {
  const parsed = buildQuery(query)
  if (!parsed.raw) return []
  const intentCategories = queryIntentCategories(query)
  const lexicalOptions = { phrase: true, bothFields: true, category: false }
  const scored = []
  for (const entry of getLibrary().entries || []) {
    if (category && entry.category !== category) continue
    const fused = fusedEntryScore(entry, parsed, lexicalOptions)
    if (!fused.grounded) continue
    const intentBoost = intentCategories.has(entry.category) ? 0.18 : 0
    scored.push({ entry, score: fused.score + intentBoost })
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
  const home = fs.existsSync(os.homedir()) ? fs.realpathSync(os.homedir()) : os.homedir()
  const cwd = fs.existsSync(process.cwd()) ? fs.realpathSync(process.cwd()) : process.cwd()
  const inside = (parent, target) => target === parent || target.startsWith(parent + path.sep)
  const parentReal = fs.existsSync(resolved) ? fs.realpathSync(resolved) : fs.realpathSync(path.dirname(resolved))
  if (!inside(home, parentReal) && !inside(cwd, parentReal)) {
    throw new Error('targetDir must be inside the home directory or the current working directory')
  }
  if (fs.existsSync(resolved) && !fs.lstatSync(resolved).isDirectory()) throw new Error('targetDir must be a directory')
  return resolved
}

function renameFrontmatter(text, name) {
  const match = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return String(text)
  const body = match[1].replace(/^name\s*:.*$/m, 'name: ' + name)
  return String(text).replace(match[0], '---\n' + body + '\n---')
}

function remoteRepo(raw) {
  try {
    const parts = new URL(raw).pathname.split('/').filter(Boolean)
    return parts.length >= 2 ? parts[0] + '/' + parts[1] : null
  } catch {
    return null
  }
}

async function installSkill({ url, agent = 'claude-code', targetDir }) {
  const source = String(url || '').trim()
  if (!/^https:\/\/raw\.githubusercontent\.com\/[^\s]+\/SKILL\.md$/.test(source)) {
    throw new Error('url must be a raw.githubusercontent.com/**/SKILL.md URL')
  }
  let fetched
  try {
    fetched = await fetchRemoteSkill(source)
  } catch (error) {
    throw new Error('download failed: ' + String(error && error.message ? error.message : error))
  }
  const text = fetched.text
  if (Buffer.byteLength(text) > MAX_SKILL_BYTES) throw new Error('SKILL.md exceeds 256 KiB')
  const scan = scanSkillText(text)
  if (scan.level === 'high') {
    throw new Error(
      'high-risk content found; installation blocked. Review the SKILL.md manually and edit it before installing. Findings: ' +
        scan.findings.map((finding) => finding.rule).join(', '),
    )
  }
  const front = parseFrontmatter(text)
  const rawName = String(front.name || path.basename(path.dirname(new URL(source).pathname))).trim()
  if (!/^[a-zA-Z0-9._-]{1,80}$/.test(rawName)) throw new Error('invalid skill name')
  const base = checkTargetDir(targetDir, agent)
  let name = rawName
  let content = text
  let renamedFrom = null
  let dir = path.join(base, name)
  fs.mkdirSync(base, { recursive: true, mode: 0o700 })
  let counter = 0
  while (true) {
    dir = path.join(base, name)
    try {
      fs.mkdirSync(dir, { mode: 0o755 })
      break
    } catch (error) {
      if (!error || error.code !== 'EEXIST') throw error
      if (!renamedFrom) renamedFrom = rawName
      name = uniqueSkillName(rawName, remoteRepo(source), source + (counter ? '#' + counter : ''))
      content = renameFrontmatter(text, name)
      counter += 1
      if (counter > 50) throw new Error('could not allocate a unique skill directory')
    }
  }
  const file = path.join(dir, 'SKILL.md')
  fs.mkdirSync(dir, { recursive: true })
  atomicWriteFile(file, content, { mode: 0o644 })
  const sourceMeta = {
    url: source,
    repo: remoteRepo(source),
    originalName: rawName,
    renamedFrom,
    sha256: createHash('sha256').update(content).digest('hex'),
    installedAt: new Date().toISOString(),
    risk: scan.level,
  }
  atomicWriteJson(path.join(dir, '.skill-source.json'), sourceMeta)
  return {
    ok: true,
    agent,
    name,
    originalName: rawName,
    renamedFrom,
    path: file,
    bytes: Buffer.byteLength(content),
    level: scan.level,
    findings: scan.findings,
    source: sourceMeta,
    scan,
  }
}

const PROMPTS = [
  {
    name: 'recommend',
    title: 'Recommend skills for this task',
    description:
      'Ask the cockpit to recommend up to four installed skills for a task, then load the best one. Use this before choosing a skill for a non-trivial request.',
    arguments: [
      { name: 'context', description: 'The user request or a short task summary.', required: true },
      { name: 'cwd', description: 'Optional project directory for extra context.', required: false },
    ],
  },
  {
    name: 'skill-workflow',
    title: 'Recommend → load → record outcome',
    description:
      'Run the full learning loop: recommend skills, load the chosen one, and record what happened so the recommender improves.',
    arguments: [
      { name: 'context', description: 'The user request or a short task summary.', required: true },
      { name: 'cwd', description: 'Optional project directory for extra context.', required: false },
    ],
  },
]

const RESOURCES = [
  {
    uri: 'ronge://experience/summary',
    name: 'Experience and self-evolution summary',
    description: 'Tracked skills, recent outcomes, learned weights, category weights and exploration quota.',
    mimeType: 'application/json',
  },
  {
    uri: 'ronge://library/index',
    name: 'Public SKILL.md library summary',
    description: 'Size, snapshot date and category counts of the bundled 6,399-entry index.',
    mimeType: 'application/json',
  },
]

const RESOURCE_TEMPLATES = [
  {
    uriTemplate: 'ronge://library/{name}',
    name: 'Library skill detail',
    description: 'Metadata and raw GitHub URL for one skill in the public index.',
    mimeType: 'application/json',
  },
  {
    uriTemplate: 'ronge://skill/{name}',
    name: 'Installed skill content',
    description: 'The installed SKILL.md content (truncated to 8 KiB) for one skill.',
    mimeType: 'text/markdown',
  },
]

function discoveryResult(entry) {
  return {
    name: entry.name,
    description: String(entry.description || '').slice(0, 240),
    category: entry.category,
    rating: entry.rating,
    quality: entry.quality,
    qualityLabel: entry.qualityLabel,
    stars: entry.stars,
    trust: entry.trust,
    rawUrl: entry.rawUrl,
    repo: entry.repo,
    path: entry.path,
    install: 'install_skill({ url: rawUrl, agent: "claude-code" })',
  }
}

const CATEGORY_INTENT_TERMS = {
  video: ['视频', '宣传片', '短片', '影片', '剪辑', '分镜', '动画', '特效', 'video', 'promo', 'film', 'trailer', 'animation', 'motion'],
  office: ['ppt', 'pptx', 'excel', 'word', 'docx', 'pdf', '文档', '表格', '演示', '幻灯片', '报告', 'office', 'spreadsheet', 'slide', 'presentation'],
  coding: ['代码', '编程', '重构', '调试', '测试', 'react', 'python', 'typescript', 'api', 'repository', 'debug', 'refactor', 'test', 'coding'],
  design: ['设计', '界面', 'ui', 'ux', '海报', '品牌', '排版', 'design', 'figma', 'layout'],
  data: ['数据', '分析', '统计', '可视化', '图表', '指标', 'dashboard', 'pandas', 'csv', 'data', 'analytics', 'chart'],
  writing: ['写作', '文案', '小红书', '公众号', '论文', 'release notes', 'pr', 'writing', 'copy', 'redbook'],
  marketing: ['营销', '竞品', '推广', '种草', 'marketing', 'campaign', 'seo'],
  research: ['调研', '研究', '来源', 'research', 'survey', 'market research'],
  security: ['安全', '审计', '漏洞', 'security', 'audit', 'vulnerability'],
  productivity: ['会议', '纪要', '周报', '效率', '文件整理', 'productivity', 'meeting', 'summary'],
  ai: ['skill', '技能', 'agent', '智能体', 'claude', 'mcp', 'prompt'],
}

function queryIntentCategories(context) {
  const lower = String(context || '').toLowerCase()
  const categories = new Set()
  for (const [category, terms] of Object.entries(CATEGORY_INTENT_TERMS)) {
    if (terms.some((term) => lower.includes(String(term).toLowerCase()))) categories.add(category)
  }
  return categories
}

function discoverLibrarySkills(context, limit) {
  const parsed = buildQuery(context)
  parsed.tokens = parsed.tokens.filter((token) => token.length >= 2).slice(0, 40)
  const maxResults = Math.max(1, Math.min(10, limit || 5))
  const installedNames = new Set(scanInstalledSkills().map((skill) => skill.name))
  const intentCategories = queryIntentCategories(context)
  const entries = (getLibrary().entries || []).filter(
    (entry) =>
      !installedNames.has(entry.name) &&
      String(entry.description || '').trim().length >= 20 &&
      !entry.weak &&
      Number(entry.duplicateRank || 0) === 0 &&
      entryQuality(entry) >= 45,
  )
  const lexicalOptions = { phrase: false, bothFields: false, category: true }
  // Empty context keeps the old quality-only behaviour.
  if (!parsed.raw) {
    return entries
      .slice()
      .sort((left, right) => entryQuality(right) - entryQuality(left))
      .slice(0, maxResults)
      .map(discoveryResult)
  }
  const scored = []
  for (const entry of entries) {
    const fused = fusedEntryScore(entry, parsed, lexicalOptions)
    if (!fused.grounded) continue
    const intentBoost = intentCategories.has(entry.category) ? 0.18 : 0
    scored.push({ entry, score: fused.score + intentBoost })
  }
  scored.sort((left, right) => right.score - left.score || entryQuality(right.entry) - entryQuality(left.entry))
  return scored.slice(0, maxResults).map(({ entry }) => discoveryResult(entry))
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
      'Search the bundled public SKILL.md index (6,399 entries) with local hash-vector semantic ranking fused with keyword and quality scores. Chinese and English task phrases both work because a built-in bilingual concept list bridges them; no network call or model is used. Returns names, descriptions, categories, ratings, trust levels and raw GitHub URLs. Use it to discover a skill that is not installed yet.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keywords, skill name, or task phrase.' },
        category: {
          type: 'string',
          enum: ['ai', 'coding', 'design', 'data', 'video', 'writing', 'productivity', 'office', 'marketing', 'security', 'research', 'business', 'education', 'other'],
          description: 'Optional category filter.',
        },
        limit: { type: 'integer', minimum: 1, maximum: 20, description: 'Maximum results. Default 10.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'discover_skills',
    description:
      'Search the bundled 6,399-entry public SKILL.md index for skills that are NOT installed yet, ranked by local hash-vector semantic relevance plus index quality. Chinese or English task phrases both work (deterministic local hashing, no network or model). Use it on any MCP client (Cursor/Claude Code/Codex) to find new skills; install with install_skill.',
    inputSchema: {
      type: 'object',
      properties: {
        context: { type: 'string', description: 'The current task or a short description of what you need.' },
        limit: { type: 'integer', minimum: 1, maximum: 10, description: 'Maximum results. Default 5.' },
      },
      required: ['context'],
    },
  },
  {
    name: 'scan_skill_text',
    description:
      'Run the local safety scan over a candidate SKILL.md text before installing it. Returns a risk level (low/medium/high) and findings; this is a heuristic, not a security guarantee.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Full SKILL.md content to scan (max 256 KiB). Text only; this tool never downloads URLs.' },
      },
    },
  },
  {
    name: 'install_skill',
    description:
      'Download a validated raw.githubusercontent.com/**/SKILL.md, run the safety scan, then install it into the selected agent skill folder. High-risk content is always blocked. Existing names are never overwritten: a unique name and frontmatter rename are used, and the source is recorded for later update/rollback.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'raw.githubusercontent.com/**/SKILL.md URL.' },
        agent: { type: 'string', enum: ['claude-code', 'codex', 'dsh', 'agents', 'generic'], description: 'Target agent skill folder. Default claude-code.' },
        targetDir: { type: 'string', description: 'Required only for agent "generic"; must be under the home directory or cwd.' },
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
    case 'discover_skills':
      return { context: String(input.context || '').slice(0, 500), results: discoverLibrarySkills(input.context, input.limit) }
    case 'scan_skill_text': {
      const text = String(input.text || '')
      if (!text) throw new Error('provide text')
      if (Buffer.byteLength(text) > MAX_SKILL_BYTES) throw new Error('text exceeds 256 KiB')
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

function promptMessages(name, args) {
  const input = args && typeof args === 'object' ? args : {}
  const context = String(input.context || '').trim()
  const cwd = String(input.cwd || '').trim()
  if (name === 'recommend') {
    return {
      description: 'Recommend installed skills for the current task, then load the best match.',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text:
              'Call the `recommend_skills` tool of the ronge server with context: ' +
              JSON.stringify(context || 'the current user request') +
              (cwd ? ' and cwd: ' + JSON.stringify(cwd) : '') +
              '. Then tell the user which 1–3 skills you will use and why, and load them before starting the task. ' +
              'After the task, call `record_outcome` for the skills you used.',
          },
        },
      ],
    }
  }
  if (name === 'skill-workflow') {
    return {
      description: 'Run recommend → load → record outcome.',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text:
              'For this task: 1) call `recommend_skills` with context ' +
              JSON.stringify(context || 'the current user request') +
              (cwd ? ' and cwd: ' + JSON.stringify(cwd) : '') +
              '. 2) Load the most relevant recommended skill(s). 3) Do the task. ' +
              '4) Call `record_outcome` with success/failed/good/bad for each skill used, plus a short note. ' +
              '5) If a useful skill is missing, call `search_skills` and then `install_skill`.',
          },
        },
      ],
    }
  }
  throw new Error('unknown prompt: ' + name)
}

function readResource(uri) {
  const target = String(uri || '')
  if (target === 'ronge://experience/summary') {
    return { contents: [{ uri: target, mimeType: 'application/json', text: JSON.stringify(experienceSummary(), null, 2) }] }
  }
  if (target === 'ronge://library/index') {
    const library = getLibrary()
    const categories = {}
    for (const entry of library.entries || []) {
      categories[entry.category] = (categories[entry.category] || 0) + 1
    }
    return {
      contents: [
        {
          uri: target,
          mimeType: 'application/json',
          text: JSON.stringify({ name: library.name, generatedAt: library.generatedAt, total: library.total, categories }, null, 2),
        },
      ],
    }
  }
  const libraryMatch = target.match(/^ronge:\/\/library\/(.+)$/)
  if (libraryMatch) {
    const name = decodeURIComponent(libraryMatch[1])
    const entry = (getLibrary().entries || []).find((item) => item.name === name)
    if (!entry) throw new Error('library skill not found: ' + name)
    return {
      contents: [
        {
          uri: target,
          mimeType: 'application/json',
          text: JSON.stringify(
            {
              name: entry.name,
              description: entry.description,
              category: entry.category,
              rating: entry.rating,
              trust: entry.trust,
              rawUrl: entry.rawUrl,
              repo: entry.repo,
              path: entry.path,
            },
            null,
            2,
          ),
        },
      ],
    }
  }
  const skillMatch = target.match(/^ronge:\/\/skill\/(.+)$/)
  if (skillMatch) {
    const name = decodeURIComponent(skillMatch[1])
    const skill = scanInstalledSkills().find((item) => item.name === name)
    if (!skill) throw new Error('installed skill not found: ' + name)
    const text = fs.readFileSync(skill.path, 'utf8')
    const truncated = Buffer.byteLength(text) > 8192
    const body = truncated ? Buffer.from(text).subarray(0, 8192).toString('utf8') : text
    return {
      contents: [
        {
          uri: target,
          mimeType: 'text/markdown',
          text: body + (truncated ? '\n\n<!-- truncated at 8 KiB; read ' + skill.path + ' for the full file -->' : ''),
        },
      ],
    }
  }
  throw new Error('unknown resource: ' + target)
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
          capabilities: { tools: {}, prompts: {}, resources: {} },
          serverInfo: { name: 'dsh-ronge-adaptive-skill-archive', version: PKG.version },
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
    if (method === 'prompts/list') {
      writeMessage({ jsonrpc: '2.0', id, result: { prompts: PROMPTS } })
      return
    }
    if (method === 'prompts/get') {
      writeMessage({ jsonrpc: '2.0', id, result: promptMessages(params?.name, params?.arguments) })
      return
    }
    if (method === 'resources/list') {
      writeMessage({ jsonrpc: '2.0', id, result: { resources: RESOURCES } })
      return
    }
    if (method === 'resources/templates/list') {
      writeMessage({ jsonrpc: '2.0', id, result: { resourceTemplates: RESOURCE_TEMPLATES } })
      return
    }
    if (method === 'resources/read') {
      writeMessage({ jsonrpc: '2.0', id, result: readResource(params?.uri) })
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startMcpServer()
}

export const __testing = {
  buildRecommendations,
  searchLibrary,
  discoverLibrarySkills,
  embedFeatures,
  embedText,
  cosineSimilarity,
  entryQuality,
  entryVector,
  recordOutcome,
  experienceSummary,
  installSkill,
  scanInstalledSkills,
  promptMessages,
  readResource,
}
