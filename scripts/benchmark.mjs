#!/usr/bin/env node
/**
 * Skill Intelligence 基准 harness（v5.0.0，零依赖、无网络、确定性）
 *
 * 目标：用 60 条 held-out 跨行业任务，衡量 lib/intelligence 的 plan 质量：
 *   - planCoverage        可执行 plan 覆盖全部期望能力的用例比例
 *   - compositionValidity 组合结构合法率（stages/role/已安装技能/去重/技能数上限）
 *   - capabilityCoverage  期望能力被 plan 技能覆盖的平均比例
 *   - hintRecall          期望技能提示命中率（出现在 stages 或 missing 建议里）
 *   - gapDetection        已安装技能覆盖不了的用例中，正确报告 missing/draftNeeded 的比例
 *   - contextTokens       plan 注入上下文的 token 估算（字符启发式，非真实 tokenizer）
 *   - latencyMs           decompose+compose 调用耗时 p50/p95
 * 同时跑 3 个基线（none / random / keyword）做对照。
 *
 * intel-core 尚未落地时动态 import 失败 → status=skipped、exit 0（不阻塞 CI）；
 * 落地后直接重跑本脚本即可获得真实数字。
 *
 * 用法：
 *   node scripts/benchmark.mjs --smoke              # 12 条（每领域 1 条），默认输出摘要 + 原始 JSON
 *   node scripts/benchmark.mjs --json               # 只输出原始 JSON
 *   node scripts/benchmark.mjs --out /tmp/b.json    # 原始 JSON 写文件（默认不写仓库）
 *   node scripts/benchmark.mjs --smoke --fail-on-threshold
 *
 * 可配置：--limit=N --seed=N --max-skills=N --min-plan-coverage=N --min-validity=N
 *        --min-capability-coverage=N --min-hint-recall=N --min-gap-detection=N
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = path.resolve(import.meta.dirname, '..')
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'))

const argv = process.argv.slice(2)
const hasFlag = (name) => argv.includes('--' + name)
const option = (name) => {
  const prefix = '--' + name + '='
  const inline = argv.find((arg) => arg.startsWith(prefix))
  if (inline) return inline.slice(prefix.length)
  const index = argv.indexOf('--' + name)
  if (index >= 0 && argv[index + 1] && !argv[index + 1].startsWith('--')) return argv[index + 1]
  return undefined
}
const numberOption = (name, fallback) => {
  const raw = option(name)
  if (raw === undefined) return fallback
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

const flags = {
  smoke: hasFlag('smoke'),
  json: hasFlag('json'),
  out: option('out') || null,
  failOnThreshold: hasFlag('fail-on-threshold'),
  seed: numberOption('seed', 42),
  maxSkills: numberOption('max-skills', 5),
  limit: numberOption('limit', 0),
}
const thresholds = {
  planCoverage: numberOption('min-plan-coverage', 0.25),
  compositionValidity: numberOption('min-validity', 0.8),
  capabilityCoverage: numberOption('min-capability-coverage', 0.4),
  hintRecall: numberOption('min-hint-recall', 0.3),
  gapDetection: numberOption('min-gap-detection', 0.6),
}

// --- 基准口径：已安装 10 条技能的能力/领域映射（手工标注，与 eval-skills.json 对齐）---
// intel-core 的 capability index 可以有自己的推断，这里固定的是「评测口径」，
// 用来判断 plan 技能到底能不能覆盖某条期望能力，保证不同实现/基线可比。
const INSTALLED_SKILL_CAPABILITIES = {
  'beat-promo-director': ['generation', 'media', 'planning'],
  hyperframes: ['rendering', 'generation', 'media'],
  'hyperframes-cli': ['automation', 'rendering', 'validation'],
  'media-use': ['media', 'generation', 'retrieval'],
  'office-docx': ['document', 'generation', 'transformation'],
  'office-xlsx': ['data', 'transformation', 'analysis'],
  'office-render': ['rendering', 'validation', 'presentation'],
  'cordis-plugin-development': ['coding', 'orchestration', 'automation'],
  'editing-cordis-compositions': ['transformation', 'orchestration', 'validation'],
  'agent-experience': ['planning', 'design', 'orchestration'],
}
const INSTALLED_SKILL_DOMAINS = {
  'beat-promo-director': 'video',
  hyperframes: 'video',
  'hyperframes-cli': 'video',
  'media-use': 'video',
  'office-docx': 'office',
  'office-xlsx': 'office',
  'office-render': 'office',
  'cordis-plugin-development': 'coding',
  'editing-cordis-compositions': 'coding',
  'agent-experience': 'coding',
}

// --- 通用工具 ---
const clip = (text, max = 120) => {
  const value = String(text ?? '').replace(/\s+/g, ' ').trim()
  return value.length > max ? value.slice(0, max) + '…' : value
}
const rate = (values) => (values.length ? Math.round((values.filter(Boolean).length / values.length) * 1000) / 1000 : null)
const mean = (values) => (values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 1000) / 1000 : null)
const percentile = (values, p) => {
  if (!values.length) return null
  const sorted = values.slice().sort((left, right) => left - right)
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return Math.round(sorted[index] * 100) / 100
}
const stats = (values) => ({
  count: values.length,
  mean: Math.round((mean(values) ?? 0) * 100) / 100,
  p50: percentile(values, 50),
  p95: percentile(values, 95),
  min: values.length ? Math.round(Math.min(...values) * 100) / 100 : null,
  max: values.length ? Math.round(Math.max(...values) * 100) / 100 : null,
})
const meanOf = (values) => {
  const present = values.filter((value) => typeof value === 'number' && Number.isFinite(value))
  return present.length ? Math.round((present.reduce((sum, value) => sum + value, 0) / present.length) * 1000) / 1000 : null
}
const mulberry32 = (seed) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const STOP_BIGRAMS = new Set([
  '帮我', '一个', '这个', '那个', '什么', '怎么', '可以', '需要', '我们', '你们', '他们',
  '做一', '一下', '这份', '那份', '给我', '就是', '不是', '还是', '然后', '顺便', '今天',
  '明天', '别太', '别用', '要能', '能不', '能直', '直接', '尽量', '最好', '记得', '一样',
  '里面', '时候', '如果', '因为', '所以', '但是', '而且', '或者', '已经', '没有', '自己',
])
const tokenize = (text) => {
  const tokens = new Set()
  const value = String(text ?? '').toLowerCase()
  for (const word of value.match(/[a-z0-9][a-z0-9_+.-]*/g) || []) {
    if (word.length >= 3 && word !== 'the' && word !== 'and' && word !== 'for') tokens.add(word)
  }
  for (const run of value.match(/[\u4e00-\u9fff]{2,}/g) || []) {
    for (let index = 0; index < run.length - 1; index += 1) {
      const bigram = run.slice(index, index + 2)
      if (!STOP_BIGRAMS.has(bigram)) tokens.add(bigram)
    }
  }
  return tokens
}
const overlapScore = (left, right) => {
  if (!left.size || !right.size) return 0
  let score = 0
  const [small, large] = left.size <= right.size ? [left, right] : [right, left]
  for (const token of small) if (large.has(token)) score += 1
  return score
}

// --- 输入 ---
const packs = read('library/domain-packs.json')
const fixtureFile = read('test/fixtures/intelligence-cases.json')
const installedSkills = read('test/fixtures/eval-skills.json')
const cases = Array.isArray(fixtureFile.cases) ? fixtureFile.cases : []
const domains = Array.isArray(packs.domains) ? packs.domains : []
const capabilityTaxonomy = Array.isArray(packs.capabilityTaxonomy) ? packs.capabilityTaxonomy : []
const canonicalCapabilities = new Set(capabilityTaxonomy.map((item) => item.id))
const capabilityAliases = new Map(
  capabilityTaxonomy.map((item) => [item.id, (item.aliases || []).map((alias) => String(alias).toLowerCase())]),
)

// intel-core 的 capability 词表更细（58 个），benchmark 的期望能力是 19 个规范 id；
// 这里把细粒度 id 归一到规范 id，保证不同实现/基线用同一把尺子。
const FINE_TO_CANONICAL = {
  storyboard: ['planning', 'media'],
  'video-rendering': ['rendering', 'media'],
  'video-editing': ['transformation', 'media'],
  'motion-graphics': ['generation', 'media'],
  'audio-music': ['media'],
  'media-assets': ['media'],
  captions: ['transformation', 'media'],
  'document-read': ['extraction', 'document'],
  'document-write': ['document', 'generation'],
  'document-edit': ['document', 'transformation'],
  'document-convert': ['transformation', 'document'],
  spreadsheet: ['data', 'document'],
  presentation: ['presentation', 'document'],
  'pdf-processing': ['document', 'extraction', 'rendering'],
  'layout-review': ['review', 'validation', 'presentation'],
  'contract-review': ['review', 'document', 'validation'],
  'code-generation': ['coding', 'generation'],
  'code-review': ['review', 'coding', 'validation'],
  testing: ['validation', 'coding'],
  debugging: ['analysis', 'coding'],
  'harness-plugin': ['coding', 'orchestration'],
  'preset-composition': ['orchestration', 'transformation'],
  'repo-automation': ['automation', 'coding'],
  'data-analysis': ['data', 'analysis'],
  'data-visualization': ['data', 'presentation', 'rendering'],
  'sql-query': ['data', 'retrieval'],
  'data-cleaning': ['data', 'transformation'],
  'web-research': ['research', 'retrieval'],
  synthesis: ['research', 'analysis'],
  'fact-checking': ['validation', 'research', 'review'],
  citation: ['research', 'retrieval'],
  copywriting: ['generation', 'presentation'],
  'campaign-planning': ['planning', 'generation'],
  seo: ['analysis', 'generation'],
  'social-content': ['generation', 'media'],
  'ui-design': ['design', 'generation'],
  'visual-design': ['design', 'generation'],
  'image-generation': ['generation', 'media', 'design'],
  'brand-design': ['design', 'generation'],
  'security-audit': ['security', 'review', 'validation'],
  'compliance-check': ['security', 'validation', 'review'],
  'prompt-injection-defense': ['security', 'validation'],
  tutoring: ['planning', 'presentation', 'generation'],
  'curriculum-design': ['planning', 'presentation', 'generation'],
  explainer: ['analysis', 'presentation', 'generation'],
  'business-strategy': ['planning', 'analysis'],
  'finance-analysis': ['analysis', 'data'],
  'task-planning': ['planning', 'orchestration'],
  automation: ['automation', 'orchestration'],
  'note-taking': ['extraction', 'document'],
  'email-calendar': ['retrieval', 'automation', 'orchestration'],
  'llm-app': ['coding', 'generation'],
  rag: ['retrieval', 'analysis', 'orchestration'],
  'agent-orchestration': ['orchestration', 'planning'],
  'model-integration': ['coding', 'retrieval'],
  'prompt-engineering': ['generation', 'planning'],
  'eval-design': ['validation', 'analysis', 'data'],
}
// intel-core 用 engineering 表示软件工程，benchmark fixture 用 coding，做等价映射。
const DOMAIN_ALIASES = { coding: ['coding', 'engineering'], engineering: ['engineering', 'coding'] }
const canonicalizeFine = (fineId) => FINE_TO_CANONICAL[fineId] || (canonicalCapabilities.has(fineId) ? [fineId] : [])

const inputErrors = []
if (domains.length !== 12) inputErrors.push(`domain-packs.json: expected 12 domains, got ${domains.length}`)
if (cases.length < 60) inputErrors.push(`intelligence-cases.json: expected >= 60 cases, got ${cases.length}`)
if (!canonicalCapabilities.size) inputErrors.push('domain-packs.json: capabilityTaxonomy is empty')
const caseIds = new Set()
for (const item of cases) {
  if (!item || !item.id || caseIds.has(item.id)) inputErrors.push(`case id missing or duplicated: ${item && item.id}`)
  caseIds.add(item?.id)
  if (!item?.domain || !domains.some((domain) => domain.id === item.domain)) inputErrors.push(`${item?.id}: unknown domain ${item?.domain}`)
  if (!item?.task) inputErrors.push(`${item?.id}: task is required`)
  if (!Array.isArray(item?.expectedCapabilities) || !item.expectedCapabilities.length) inputErrors.push(`${item?.id}: expectedCapabilities is required`)
  for (const capability of item?.expectedCapabilities || []) {
    if (!canonicalCapabilities.has(capability)) inputErrors.push(`${item?.id}: unknown capability ${capability}`)
  }
}

const fixtureStats = {
  cases: cases.length,
  domains: domains.length,
  capabilities: canonicalCapabilities.size,
  candidateSkills: domains.reduce((sum, domain) => sum + (domain.candidateSkills || []).length, 0),
}

// --- 动态加载 lib/intelligence（intel-core 并行实现中）---
async function loadIntelligence() {
  const candidates = ['lib/intelligence/index.js', 'lib/intelligence.js']
  for (const relative of candidates) {
    const file = path.resolve(ROOT, relative)
    if (!fs.existsSync(file)) continue
    try {
      const mod = await import(pathToFileURL(file).href)
      const missing = ['decomposeTask', 'composeSkillPlan'].filter((name) => typeof mod[name] !== 'function')
      if (missing.length) return { error: `${relative} 缺少导出: ${missing.join(', ')}` }
      return { mod, file: relative }
    } catch (error) {
      return { error: `${relative} import 失败: ${error && error.message ? error.message : String(error)}` }
    }
  }
  return { error: 'lib/intelligence/index.js 尚未出现（intel-core 未落地）' }
}

// --- plan 归一化（对 intel 输出做容错，缺字段按空处理）---
function normalizePlan(raw) {
  const plan = raw && typeof raw === 'object' ? raw : {}
  const rawStages = Array.isArray(plan.stages) ? plan.stages : []
  const stages = rawStages.map((stage, index) => {
    const rawSkills = Array.isArray(stage?.skills) ? stage.skills : stage && stage.skill ? [stage.skill] : []
    const skills = rawSkills
      .map((skill) => {
        if (typeof skill === 'string') return { name: skill, why: '', installed: null }
        const installed = typeof skill?.installed === 'boolean' ? skill.installed : null
        return { name: String(skill?.name || ''), why: String(skill?.why || ''), installed }
      })
      .filter((skill) => skill.name)
    return {
      role: String(stage?.role || stage?.name || `stage-${index + 1}`),
      skills,
      input: String(stage?.input ?? ''),
      output: String(stage?.output ?? ''),
      handoff: String(stage?.handoff ?? ''),
    }
  })
  const rawMissing = Array.isArray(plan.missing) ? plan.missing : []
  const missing = rawMissing.map((item) => ({
    capability: String(item?.capability ?? ''),
    domain: String(item?.domain ?? ''),
    suggested: Array.isArray(item?.suggestedLibrarySkills)
      ? item.suggestedLibrarySkills.map((skill) => (typeof skill === 'string' ? skill : String(skill?.name || ''))).filter(Boolean)
      : [],
    draftNeeded: Boolean(item?.draftNeeded),
  }))
  const stageSkills = stages.flatMap((stage) => stage.skills.map((skill) => skill.name))
  return {
    raw: plan,
    ok: plan.ok !== false,
    pattern: plan.pattern ? String(plan.pattern) : null,
    stages,
    stageSkills,
    missing,
    suggestedSkills: [...new Set(missing.flatMap((item) => item.suggested))],
    draftNeeded: Boolean(plan.draftNeeded) || missing.some((item) => item.draftNeeded),
  }
}

const PLAN_PATTERNS = new Set(['sequential', 'parallel', 'review-gate', 'escalation'])
function validatePlan(plan, context) {
  const issues = []
  const { installedNames, libraryNames, maxSkills } = context
  if (!plan.ok) issues.push('ok=false')
  if (!plan.stages.length) issues.push('no-stages')
  if (plan.stages.length > 5) issues.push(`stages>5:${plan.stages.length}`)
  if (plan.pattern && !PLAN_PATTERNS.has(plan.pattern)) issues.push(`unknown-pattern:${plan.pattern}`)
  let totalSkillEntries = 0
  plan.stages.forEach((stage, index) => {
    if (!stage.role) issues.push(`stage-${index + 1}:missing-role`)
    if (!stage.skills.length) issues.push(`stage-${index + 1}:no-skills`)
    const stageNames = new Set()
    for (const skill of stage.skills) {
      totalSkillEntries += 1
      if (!skill.name) {
        issues.push(`stage-${index + 1}:empty-skill`)
        continue
      }
      if (!installedNames.has(skill.name) && !libraryNames.has(skill.name)) issues.push(`stage-${index + 1}:unknown-skill:${skill.name}`)
      if (stageNames.has(skill.name)) issues.push(`stage-${index + 1}:duplicate-in-stage:${skill.name}`)
      stageNames.add(skill.name)
      // 契约要求每个被选中的技能都带 installed 标记，未安装的要据此提示安装。
      if (!installedNames.has(skill.name) && skill.installed !== false) {
        issues.push(`stage-${index + 1}:unflagged-not-installed:${skill.name}`)
      }
    }
  })
  if (totalSkillEntries > maxSkills) issues.push(`skill-entries>${maxSkills}:${totalSkillEntries}`)
  return { valid: issues.length === 0, issues }
}

const estimateTokens = (text) => {
  let cjk = 0
  let other = 0
  for (const character of String(text ?? '')) {
    if (/[\u3400-\u9fff\uf900-\ufaff]/.test(character)) cjk += 1
    else other += 1
  }
  return cjk + Math.ceil(other / 4)
}
const planContextTokens = (plan) => {
  const parts = []
  for (const stage of plan.stages) {
    parts.push(stage.role, stage.input, stage.output, stage.handoff)
    for (const skill of stage.skills) parts.push(skill.name, skill.why)
  }
  return estimateTokens(parts.filter(Boolean).join('\n'))
}

// --- 主流程 ---
const startedAt = new Date().toISOString()
const mode = flags.smoke ? 'smoke' : 'full'
const report = {
  schema: 'skill-intelligence-benchmark/v1',
  status: 'skipped',
  mode,
  generatedAt: startedAt,
  fixtures: { ...fixtureStats, casesFile: 'test/fixtures/intelligence-cases.json', packsFile: 'library/domain-packs.json' },
  config: { seed: flags.seed, maxSkills: flags.maxSkills, limit: flags.limit || null, thresholds, failOnThreshold: flags.failOnThreshold },
  engine: null,
  metrics: null,
  ceiling: null,
  baselines: null,
  cases: [],
  warnings: [],
}

// 大 JSON 走 pipe 时 process.exit 可能截断 stdout，先等 flush 再退出。
const exitAfterFlush = async (code) => {
  await new Promise((resolve) => process.stdout.write('', resolve))
  process.exit(code)
}

const writeReport = (payload) => {
  if (!flags.out) return null
  const target = path.resolve(process.cwd(), flags.out)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, JSON.stringify(payload, null, 2) + '\n')
  return target
}

const printHuman = (payload) => {
  const lines = []
  lines.push(`skill intelligence benchmark (${payload.mode})`)
  if (payload.status === 'skipped') {
    lines.push(`status: skipped — ${payload.reason}`)
    lines.push(`fixtures: ${payload.fixtures.cases} cases / ${payload.fixtures.domains} domains / ${payload.fixtures.candidateSkills} candidate skills`)
    lines.push('note: intel-core 落地后重跑本脚本即可得到真实指标；skipped 不阻塞 CI。')
    return lines
  }
  lines.push(`engine: ${payload.engine.file}${payload.engine.version ? ' v' + payload.engine.version : ''}`)
  lines.push(`cases: ${payload.cases.length}/${payload.fixtures.cases} · seed=${flags.seed} · maxSkills=${flags.maxSkills}`)
  const metric = (name, value) => lines.push(`  ${name.padEnd(22)} ${value === null || value === undefined ? 'n/a' : value}`)
  metric('planCoverage', payload.metrics.planCoverage)
  metric('compositionValidity', payload.metrics.compositionValidity)
  metric('capabilityCoverage', payload.metrics.capabilityCoverage)
  metric('hintRecall', payload.metrics.hintRecall)
  metric('hintStageRecall', payload.metrics.hintStageRecall)
  metric('gapDetection', payload.metrics.gapDetection)
  metric('installLoad', payload.metrics.installLoad)
  metric('decomposeCapabilityCoverage', payload.metrics.decomposeCapabilityCoverage)
  metric('domainMatch', payload.metrics.domainMatch)
  metric('gapCases', `${payload.metrics.gapCases}/${payload.metrics.cases}`)
  metric('contextTokens.mean', payload.metrics.contextTokens.mean)
  metric('contextTokens.p95', payload.metrics.contextTokens.p95)
  metric('latencyMs.p50', payload.metrics.latencyMs.p50)
  metric('latencyMs.p95', payload.metrics.latencyMs.p95)
  lines.push('baselines (planCoverage / capabilityCoverage / hintRecall / gapDetection):')
  for (const [name, baseline] of Object.entries(payload.baselines)) {
    lines.push(`  ${name.padEnd(8)} ${baseline.planCoverage ?? 'n/a'} / ${baseline.capabilityCoverage ?? 'n/a'} / ${baseline.hintRecall ?? 'n/a'} / ${baseline.gapDetection ?? 'n/a'}`)
  }
  lines.push(`ceiling: 已安装技能理论上限 planCoverage=${payload.ceiling.fullyCoverableRatio} (${payload.ceiling.fullyCoverableCases}/${payload.fixtures.cases})`)
  lines.push(`thresholds: ${Object.entries(payload.thresholds).map(([key, value]) => `${key}>=${value}`).join(' · ')} → ${payload.passed ? 'passed' : 'not met'}`)
  if (payload.errors.total) lines.push(`errors: decompose=${payload.errors.decompose} compose=${payload.errors.compose}`)
  return lines
}

// --- 校验输入（错误直接 fail，避免用坏数据生成假指标）---
if (inputErrors.length) {
  console.error('benchmark input invalid:')
  for (const message of inputErrors.slice(0, 40)) console.error(' -', message)
  process.exit(1)
}

const intelligence = await loadIntelligence()
if (!intelligence.mod) {
  report.reason = intelligence.error
  const skipOut = flags.out ? writeReport(report) : null
  if (flags.json) console.log(JSON.stringify(report, null, 2))
  else {
    for (const line of printHuman(report)) console.log(line)
    console.log('')
    console.log('--- note: skipped 模式下没有 metrics；等 lib/intelligence 可用后重跑 ---')
    if (skipOut) console.log(`wrote: ${skipOut}`)
  }
  await exitAfterFlush(0)
}

const engine = intelligence.mod
report.engine = {
  file: intelligence.file,
  version: engine.ENGINE_VERSION || engine.INTELLIGENCE_VERSION || engine.VERSION || engine.version || null,
}

// --- 数据准备 ---
const libraryIndex = read('library/skills-index.json')
const libraryEntries = Array.isArray(libraryIndex.entries) ? libraryIndex.entries : []
const libraryByName = new Map()
for (const entry of libraryEntries) {
  const previous = libraryByName.get(entry.name)
  if (!previous || Number(entry.quality || 0) > Number(previous.quality || 0)) libraryByName.set(entry.name, entry)
}
const installedNames = new Set(installedSkills.map((skill) => skill.name))

let capabilityIndex = null
const capabilityIndexFile = path.join(ROOT, 'library/capability-index.json')
if (fs.existsSync(capabilityIndexFile)) {
  try {
    capabilityIndex = JSON.parse(fs.readFileSync(capabilityIndexFile, 'utf8'))
  } catch (error) {
    report.warnings.push(`capability-index.json 解析失败: ${error.message}`)
  }
} else if (typeof engine.buildCapabilityIndex === 'function') {
  try {
    capabilityIndex = engine.buildCapabilityIndex(libraryEntries)
  } catch (error) {
    report.warnings.push(`buildCapabilityIndex 调用失败: ${error.message}`)
  }
}

const candidateCapabilities = new Map()
for (const domain of domains) {
  for (const candidate of domain.candidateSkills || []) {
    candidateCapabilities.set(candidate.name, candidate.capabilities || [])
  }
}

const profileCache = new Map()
function profileOf(skillName) {
  if (profileCache.has(skillName)) return profileCache.get(skillName)
  let profile = capabilityIndex && capabilityIndex.skills ? capabilityIndex.skills[skillName] : null
  if (!profile && libraryByName.has(skillName) && typeof engine.capabilityProfile === 'function') {
    try {
      profile = engine.capabilityProfile(libraryByName.get(skillName))
    } catch {
      profile = null
    }
  }
  profileCache.set(skillName, profile || null)
  return profile || null
}
function capabilitiesOf(skillName) {
  if (INSTALLED_SKILL_CAPABILITIES[skillName]) return INSTALLED_SKILL_CAPABILITIES[skillName]
  if (candidateCapabilities.has(skillName)) return candidateCapabilities.get(skillName)
  const profile = profileOf(skillName)
  if (profile && Array.isArray(profile.capabilities)) {
    const canonical = new Set()
    for (const capability of profile.capabilities) {
      if (canonicalCapabilities.has(capability)) canonical.add(capability)
      else for (const mapped of canonicalizeFine(capability)) canonical.add(mapped)
    }
    if (canonical.size) return [...canonical]
  }
  const entry = libraryByName.get(skillName)
  if (!entry) return []
  const text = [entry.name, entry.description, entry.whenToUse].filter(Boolean).join(' ').toLowerCase()
  const inferred = new Set()
  for (const [capability, aliases] of capabilityAliases) {
    if (aliases.some((alias) => alias && text.includes(alias))) inferred.add(capability)
  }
  return [...inferred]
}

const installedCapabilityUnion = new Set(Object.values(INSTALLED_SKILL_CAPABILITIES).flat())
const installedDomains = new Set(Object.values(INSTALLED_SKILL_DOMAINS))
const isGapCase = (caseItem) =>
  !installedDomains.has(caseItem.domain) || caseItem.expectedCapabilities.some((capability) => !installedCapabilityUnion.has(capability))
const evaluationContext = {
  installedNames,
  libraryNames: new Set(libraryEntries.map((entry) => entry.name)),
  maxSkills: flags.maxSkills,
  isGapCase,
}

// --- 选例 ---
const selected = []
if (flags.smoke) {
  const seen = new Set()
  for (const item of cases) {
    if (seen.has(item.domain)) continue
    seen.add(item.domain)
    selected.push(item)
  }
} else {
  selected.push(...cases)
}
const limited = flags.limit > 0 ? selected.slice(0, flags.limit) : selected

// --- 关键词基线索引（只检索非弱、非重复、quality>=40 的 library 条目）---
const keywordDocs = []
const keywordPostings = new Map()
for (const entry of libraryEntries) {
  if (entry.weak || Number(entry.duplicateRank || 0) > 0 || Number(entry.quality || 0) < 40) continue
  const docIndex = keywordDocs.length
  const tokens = tokenize([entry.name, entry.description, entry.whenToUse].filter(Boolean).join(' '))
  keywordDocs.push({ entry, tokens })
  for (const token of tokens) {
    let bucket = keywordPostings.get(token)
    if (!bucket) {
      bucket = []
      keywordPostings.set(token, bucket)
    }
    bucket.push(docIndex)
  }
}

function keywordSuggestions(taskTokens, limit = 3) {
  const scores = new Map()
  for (const token of taskTokens) {
    const bucket = keywordPostings.get(token)
    if (!bucket) continue
    for (const docIndex of bucket) scores.set(docIndex, (scores.get(docIndex) || 0) + 1)
  }
  return [...scores.entries()]
    .filter(([, score]) => score >= 2)
    .sort((left, right) => {
      if (right[1] !== left[1]) return right[1] - left[1]
      return Number(keywordDocs[right[0]].entry.quality || 0) - Number(keywordDocs[left[0]].entry.quality || 0)
    })
    .slice(0, limit)
    .map(([docIndex]) => keywordDocs[docIndex].entry.name)
}

const installedTokens = new Map(
  installedSkills.map((skill) => [skill.name, tokenize([skill.name, skill.description, skill.whenToUse, skill.intro].filter(Boolean).join(' '))]),
)

// --- 评估单个 plan ---
function evaluateCase(caseItem, plan, context) {
  const expected = caseItem.expectedCapabilities
  const stageCapabilities = new Set(plan.stageSkills.flatMap((name) => capabilitiesOf(name)))
  const covered = expected.filter((capability) => stageCapabilities.has(capability))
  const coverage = expected.length ? covered.length / expected.length : 0
  const fullCoverage = expected.length > 0 && covered.length === expected.length
  const validity = validatePlan(plan, context)
  const hints = Array.isArray(caseItem.expectedSkillHints) ? caseItem.expectedSkillHints : []
  const hintHit = hints.length ? hints.some((name) => plan.stageSkills.includes(name) || plan.suggestedSkills.includes(name)) : null
  const hintStageHit = hints.length ? hints.some((name) => plan.stageSkills.includes(name)) : null
  const gapCase = context.isGapCase(caseItem)
  const toInstall = plan.stages.flatMap((stage) => stage.skills).filter((skill) => !context.installedNames.has(skill.name))
  const installLoad = plan.stageSkills.length ? Math.round((toInstall.length / plan.stageSkills.length) * 1000) / 1000 : 0
  // 缺口处理：报告 missing/draftNeeded，或把「需安装」技能显式放进计划，都算诚实处理。
  const gapHandled = plan.missing.length > 0 || plan.draftNeeded || toInstall.length > 0 || !plan.ok
  return {
    coverage: Math.round(coverage * 1000) / 1000,
    fullCoverage,
    covered,
    missingCapabilities: expected.filter((capability) => !covered.includes(capability)),
    valid: validity.valid,
    invalidIssues: validity.issues.slice(0, 4),
    hintHit,
    hintStageHit,
    gapCase,
    gapHandled,
    installLoad,
    tokens: planContextTokens(plan),
  }
}

function runBaseline(name, buildPlan, caseList) {
  const rows = caseList.map((caseItem) => {
    const started = performance.now()
    const plan = normalizePlan(buildPlan(caseItem))
    const latency = performance.now() - started
    return { id: caseItem.id, ...evaluateCase(caseItem, plan, evaluationContext), latency }
  })
  const hintRows = rows.filter((row) => row.hintHit !== null)
  const gapRows = rows.filter((row) => row.gapCase)
  return {
    planCoverage: rate(rows.map((row) => row.fullCoverage)),
    compositionValidity: rate(rows.map((row) => row.valid)),
    capabilityCoverage: mean(rows.map((row) => row.coverage)),
    hintRecall: hintRows.length ? rate(hintRows.map((row) => row.hintHit)) : null,
    hintStageRecall: hintRows.length ? rate(hintRows.map((row) => row.hintStageHit)) : null,
    gapDetection: gapRows.length ? rate(gapRows.map((row) => row.gapHandled)) : null,
    installLoad: mean(rows.map((row) => row.installLoad)),
    contextTokens: stats(rows.map((row) => row.tokens)),
    latencyMs: stats(rows.map((row) => row.latency)),
  }
}

const random = mulberry32(flags.seed)
const randomPick = (items, count) => {
  const pool = items.slice()
  const picked = []
  while (pool.length && picked.length < count) picked.push(pool.splice(Math.floor(random() * pool.length), 1)[0])
  return picked
}

// --- 跑 intel 引擎 ---
const caseRows = []
const decomposeDomains = []
let decomposeErrors = 0
let composeErrors = 0
const engineStarted = performance.now()
for (const caseItem of limited) {
  let decomposed = null
  let plan = null
  let error = null
  const started = performance.now()
  try {
    decomposed = await Promise.resolve(engine.decomposeTask({ task: caseItem.task }))
  } catch (cause) {
    decomposeErrors += 1
    error = `decompose: ${cause && cause.message ? cause.message : String(cause)}`
  }
  try {
    plan = await Promise.resolve(
      engine.composeSkillPlan({
        task: caseItem.task,
        installedSkills,
        libraryEntries,
        capabilityIndex,
        maxSkills: flags.maxSkills,
      }),
    )
  } catch (cause) {
    composeErrors += 1
    error = `compose: ${cause && cause.message ? cause.message : String(cause)}`
  }
  const latency = performance.now() - started
  const normalized = normalizePlan(plan)
  const domainsRaw = decomposed && Array.isArray(decomposed.domains) ? decomposed.domains : []
  const decomposedCapabilities = new Set(
    (Array.isArray(decomposed?.capabilities) ? decomposed.capabilities : []).flatMap((capability) => canonicalizeFine(capability)),
  )
  const expectedCapabilities = caseItem.expectedCapabilities
  const decomposeCoverage = expectedCapabilities.length
    ? Math.round((expectedCapabilities.filter((capability) => decomposedCapabilities.has(capability)).length / expectedCapabilities.length) * 1000) / 1000
    : 0
  caseRows.push({
    id: caseItem.id,
    domain: caseItem.domain,
    task: clip(caseItem.task, 160),
    planSkills: normalized.stageSkills,
    suggestedSkills: normalized.suggestedSkills,
    pattern: normalized.pattern,
    stageCount: normalized.stages.length,
    decomposeDomains: domainsRaw.map((item) => (typeof item === 'string' ? item : String(item?.id || item?.domain || item?.name || ''))).filter(Boolean),
    decomposeCoverage,
    ...evaluateCase(caseItem, normalized, evaluationContext),
    latency: Math.round(latency * 100) / 100,
    error,
  })
  if (decomposed) decomposeDomains.push(decomposed)
}
const engineDuration = performance.now() - engineStarted

const hintRows = caseRows.filter((row) => row.hintHit !== null)
const gapRows = caseRows.filter((row) => row.gapCase)
const domainHitValues = caseRows.map((row) => {
  if (!row.decomposeDomains.length) return null
  const labels = domains.find((domain) => domain.id === row.domain)
  const aliases = labels ? [labels.labelZh, labels.labelEn].filter(Boolean).map((label) => String(label).toLowerCase()) : []
  const accepted = new Set(DOMAIN_ALIASES[row.domain] || [row.domain])
  return row.decomposeDomains.some((value) => {
    const text = String(value).toLowerCase()
    if (accepted.has(text)) return true
    return aliases.some((alias) => alias && (text.includes(alias) || alias.includes(text)))
  })
})
const metrics = {
  cases: caseRows.length,
  planCoverage: rate(caseRows.map((row) => row.fullCoverage)),
  compositionValidity: rate(caseRows.map((row) => row.valid)),
  capabilityCoverage: mean(caseRows.map((row) => row.coverage)),
  hintRecall: hintRows.length ? rate(hintRows.map((row) => row.hintHit)) : null,
  hintStageRecall: hintRows.length ? rate(hintRows.map((row) => row.hintStageHit)) : null,
  gapDetection: gapRows.length ? rate(gapRows.map((row) => row.gapHandled)) : null,
  installLoad: mean(caseRows.map((row) => row.installLoad)),
  decomposeCapabilityCoverage: mean(caseRows.map((row) => row.decomposeCoverage)),
  domainMatch: rate(domainHitValues.filter((value) => value !== null)),
  contextTokens: stats(caseRows.map((row) => row.tokens)),
  latencyMs: stats(caseRows.map((row) => row.latency)),
  gapCases: gapRows.length,
  hintCases: hintRows.length,
}
const errors = { decompose: decomposeErrors, compose: composeErrors, total: decomposeErrors + composeErrors }

const capabilityOnlyCoverable = cases.filter((caseItem) => caseItem.expectedCapabilities.every((capability) => installedCapabilityUnion.has(capability)))
const fullyCoverableCases = capabilityOnlyCoverable.filter((caseItem) => installedDomains.has(caseItem.domain))
report.ceiling = {
  installedSkills: installedSkills.length,
  installedDomains: [...installedDomains],
  installedCapabilityUnion: [...installedCapabilityUnion],
  fullyCoverableCases: fullyCoverableCases.length,
  fullyCoverableRatio: Math.round((fullyCoverableCases.length / cases.length) * 1000) / 1000,
  capabilityOnlyCoverableCases: capabilityOnlyCoverable.length,
  note: '已安装 10 条技能（领域覆盖 video/office/coding 的能力并集）理论能全量覆盖的用例上限；其余用例本就该走 missing/draftNeeded 或建议安装。planCoverage 允许把「需安装」的 library 技能算进计划，因此可以高于该上限，需结合 installLoad 一起看。',
}

// 基线
report.baselines = {
  none: runBaseline('none', () => ({ ok: true, stages: [], missing: [] }), limited),
  random: runBaseline(
    'random',
    (caseItem) => {
      const picked = randomPick(installedSkills, 1 + Math.floor(random() * 2))
      return {
        ok: true,
        stages: picked.length ? [{ role: 'main', skills: picked.map((skill) => ({ name: skill.name, why: 'random baseline', installed: true })) }] : [],
        missing: [],
      }
    },
    limited,
  ),
  keyword: runBaseline(
    'keyword',
    (caseItem) => {
      const taskTokens = tokenize(caseItem.task)
      const scoredInstalled = installedSkills
        .map((skill) => ({ name: skill.name, score: overlapScore(taskTokens, installedTokens.get(skill.name) || new Set()) }))
        .filter((item) => item.score > 0)
        .sort((left, right) => right.score - left.score)
        .slice(0, 2)
      const suggestions = keywordSuggestions(taskTokens, 3)
      const missing = !scoredInstalled.length && suggestions.length
        ? [{ capability: '', domain: caseItem.domain, suggestedLibrarySkills: suggestions, draftNeeded: true }]
        : []
      return {
        ok: true,
        stages: scoredInstalled.length ? [{ role: 'main', skills: scoredInstalled.map((item) => ({ name: item.name, why: 'keyword baseline', installed: true })) }] : [],
        missing,
      }
    },
    limited,
  ),
}

report.metrics = metrics
report.errors = errors
report.cases = caseRows
report.status = errors.total > Math.ceil(limited.length / 2) ? 'degraded' : 'ok'
report.durationMs = Math.round(performance.now() - engineDuration)
report.thresholds = thresholds
report.passed = Object.entries(thresholds).every(([key, threshold]) => metrics[key] === null || metrics[key] === undefined || metrics[key] >= threshold)

// --- 输出（默认 stdout；--out 才落盘，默认不写仓库）---
const outputPath = flags.out ? writeReport(report) : null
if (flags.json) {
  console.log(JSON.stringify(report, null, 2))
} else {
  for (const line of printHuman(report)) console.log(line)
  if (!flags.out) {
    console.log('')
    console.log('=== BENCHMARK JSON ===')
    console.log(JSON.stringify(report, null, 2))
    console.log('=== END BENCHMARK JSON ===')
  }
  if (outputPath) console.log(`wrote: ${outputPath}`)
}

if (report.status === 'degraded') {
  console.error(`benchmark degraded: ${errors.total}/${limited.length} cases failed (decompose=${decomposeErrors}, compose=${composeErrors})`)
}
if (flags.failOnThreshold && !report.passed) {
  console.error('benchmark below configured thresholds; see metrics above')
  await exitAfterFlush(1)
}
await exitAfterFlush(0)
