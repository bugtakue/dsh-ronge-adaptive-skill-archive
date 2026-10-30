/**
 * Draft SKILL.md generation (never writes to disk, never executes anything).
 *
 * `draftSkill` is synchronous per the architecture contract. The optional
 * `lib/security.js` scanner is loaded once at module init through a tolerant
 * dynamic import (top-level await). If the module is absent or broken, drafts
 * still work and `safety.available` is `false` — a missing scanner is reported,
 * never silently treated as "safe".
 */

import { capabilityProfile } from './capability.js'
import { decomposeTask } from './decompose.js'
import {
  CAPABILITY_BY_ID,
  DELIVERABLES,
  DOMAIN_BY_ID,
  INTENT_BY_ID,
  capabilityLabel,
  clamp,
  domainLabel,
  normalizeText,
  slugify,
  truncate,
} from './taxonomy.js'

export const DRAFT_VERSION = '1.0.0'

const REQUIRED_SECTIONS = [
  '## 何时使用',
  '## 输入',
  '## 输出',
  '## 步骤',
  '## 质量检查',
  '## 失败处理',
  '## 示例',
]

const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_CONTENT_LENGTH = 6000
const DESCRIPTION_MIN = 20
const DESCRIPTION_MAX = 200
const NEAR_DUPLICATE_THRESHOLD = 0.72

// Tolerant dynamic import: keep draftSkill sync, report availability honestly.
let securityModule = null
let securityLoadError = null
try {
  securityModule = await import('../security.js')
} catch (error) {
  securityModule = null
  securityLoadError = error && error.code === 'ERR_MODULE_NOT_FOUND' ? 'lib/security.js not available yet' : String(error && error.message ? error.message : error)
}

/** Status of the optional security scanner (diagnostics for the host). */
export function securityStatus() {
  const scanner = typeof securityModule?.scanSkillText === 'function' || typeof securityModule?.default?.scanSkillText === 'function'
  return {
    available: scanner,
    module: scanner ? 'lib/security.js' : null,
    error: scanner ? null : securityLoadError,
  }
}

function scannerFunction() {
  if (typeof securityModule?.scanSkillText === 'function') return securityModule.scanSkillText
  if (typeof securityModule?.default?.scanSkillText === 'function') return securityModule.default.scanSkillText
  return null
}

function normalizeSafety(result) {
  if (result === null || result === undefined) {
    return { available: true, level: 'unknown', findings: [], note: 'scanSkillText 返回空结果' }
  }
  let findings = []
  let level = 'unknown'
  if (Array.isArray(result)) findings = result
  else if (Array.isArray(result.findings)) findings = result.findings
  else if (Array.isArray(result.issues)) findings = result.issues
  if (result && typeof result === 'object' && !Array.isArray(result) && typeof result.level === 'string') level = result.level
  if (level === 'unknown' && findings.length) {
    const severities = findings.map((finding) => String(finding?.severity || finding?.level || '').toLowerCase())
    if (severities.some((severity) => severity === 'high' || severity === 'critical')) level = 'high'
    else if (severities.some((severity) => severity === 'medium' || severity === 'warn' || severity === 'warning')) level = 'medium'
    else level = 'low'
  }
  return {
    available: true,
    level,
    findings: findings.map((finding) => ({
      rule: String(finding?.rule || finding?.id || 'unknown'),
      severity: String(finding?.severity || 'unknown'),
      line: Number.isFinite(Number(finding?.line)) ? Number(finding.line) : null,
      excerpt: finding?.excerpt ? truncate(String(finding.excerpt), 120) : null,
    })),
    note: typeof result?.note === 'string' ? result.note : null,
  }
}

/** Run the optional scanner; returns a conservative safety envelope. */
function runSecurityScan(text) {
  if (!text || typeof text !== 'string') {
    return { available: false, level: 'unknown', findings: [], note: 'draft 文本为空，未扫描' }
  }
  const scan = scannerFunction()
  if (!scan) {
    return {
      available: false,
      level: 'unknown',
      findings: [],
      note: '安全扫描器不可用（' + (securityLoadError || 'lib/security.js 未提供 scanSkillText') + '）；draft 未扫描，不能视为安全',
    }
  }
  try {
    const result = scan(text)
    if (result && typeof result.then === 'function') {
      return {
        available: true,
        level: 'unknown',
        findings: [],
        note: 'scanSkillText 返回 Promise，同步 draft 未等待；宿主应自行 await 扫描',
      }
    }
    return normalizeSafety(result)
  } catch (error) {
    return {
      available: false,
      level: 'unknown',
      findings: [],
      note: '安全扫描执行失败：' + String(error && error.message ? error.message : error),
    }
  }
}

function levenshtein(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const previous = new Array(b.length + 1)
  const current = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j += 1) previous[j] = j
  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost)
    }
    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j]
  }
  return previous[b.length]
}

function tokenSet(value) {
  return new Set(
    normalizeText(value)
      .split(/[^a-z0-9\u3400-\u9fff]+/)
      .filter((token) => token.length >= 2),
  )
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0
  let intersection = 0
  for (const token of a) if (b.has(token)) intersection += 1
  return intersection / (a.size + b.size - intersection)
}

/**
 * Find near-duplicate names (token similarity OR edit similarity).
 * Returns the best matches above the threshold, deterministic order.
 */
export function findSimilarNames(name, existingNames = []) {
  const target = normalizeText(name)
  if (!target) return []
  const targetTokens = tokenSet(name)
  const matches = []
  for (const existing of existingNames || []) {
    if (typeof existing !== 'string' || !existing) continue
    const normalized = normalizeText(existing)
    if (!normalized || normalized === target) continue
    const tokenScore = jaccard(targetTokens, tokenSet(existing))
    const maxLen = Math.max(normalized.length, target.length)
    const editScore = maxLen ? 1 - levenshtein(normalized, target) / maxLen : 0
    const similarity = Math.max(tokenScore, editScore)
    if (similarity >= NEAR_DUPLICATE_THRESHOLD) {
      matches.push({
        name: existing,
        similarity: Math.round(similarity * 100) / 100,
        kind: tokenScore >= editScore ? 'token' : 'edit',
      })
    }
  }
  return matches.sort((a, b) => b.similarity - a.similarity || a.name.localeCompare(b.name)).slice(0, 5)
}

/**
 * Lint a generated (or hand-written) SKILL.md draft.
 * @param {string} content
 * @param {{name?:string, description?:string, whenToUse?:string, existingNames?:string[], evalCases?:object[]}} [context]
 */
export function lintSkillText(content, context = {}) {
  const issues = []
  const add = (code, severity, message) => issues.push({ code, severity, message })
  const text = typeof content === 'string' ? content : ''

  if (!text.trim()) add('content-empty', 'error', 'SKILL.md 内容为空')
  if (text.length > MAX_CONTENT_LENGTH) add('content-too-long', 'error', '内容超过 ' + MAX_CONTENT_LENGTH + ' 字符上限')

  const frontmatterMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(text)
  if (!frontmatterMatch) {
    add('frontmatter-missing', 'error', '缺少 YAML frontmatter（--- 包裹的头部）')
  } else {
    const frontmatter = frontmatterMatch[1]
    if (!/^name:\s*\S+/m.test(frontmatter)) add('frontmatter-name', 'error', 'frontmatter 缺少 name')
    if (!/^description:\s*\S+/m.test(frontmatter)) add('frontmatter-description', 'error', 'frontmatter 缺少 description')
    const declaredName = (/^name:\s*(.+)$/m.exec(frontmatter) || [])[1]
    if (declaredName) {
      const cleanName = declaredName.trim().replace(/^["']|["']$/g, '')
      if (!NAME_RE.test(cleanName)) add('name-invalid', 'error', 'name 必须是 kebab-case（小写字母/数字/连字符）')
      if (cleanName.length > 64) add('name-too-long', 'error', 'name 超过 64 字符')
    }
  }

  if (context.name !== undefined) {
    if (!NAME_RE.test(String(context.name))) add('name-invalid', 'error', 'name 必须是 kebab-case')
    const similar = findSimilarNames(context.name, context.existingNames || [])
    if (similar.length) {
      add('name-near-duplicate', 'warn', '近似重名：' + similar.map((item) => item.name).join('、'))
    }
  }

  const description = context.description !== undefined ? String(context.description) : null
  if (description !== null) {
    if (description.length < DESCRIPTION_MIN) add('description-too-short', 'error', 'description 少于 ' + DESCRIPTION_MIN + ' 字符')
    if (description.length > DESCRIPTION_MAX) add('description-too-long', 'error', 'description 超过 ' + DESCRIPTION_MAX + ' 字符')
    if (/\r?\n/.test(description)) add('description-multiline', 'error', 'description 不能换行（frontmatter 单行）')
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!text.includes(section)) add('section-missing', 'error', '缺少章节 ' + section)
  }

  const stepsSection = /##\s*步骤([\s\S]*?)(?:\n##\s|$)/.exec(text)
  if (stepsSection) {
    const steps = stepsSection[1]
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => /^(\d+[.)、]|[-*])\s+/.test(line))
    if (steps.length < 3) add('steps-too-few', 'error', '步骤少于 3 条（当前 ' + steps.length + '）')
  }

  const whenToUse = context.whenToUse !== undefined ? String(context.whenToUse) : null
  if (whenToUse !== null && whenToUse.trim().length < 4) add('when-to-use-missing', 'error', 'whenToUse 为空或过短')

  const evalCases = context.evalCases
  if (Array.isArray(evalCases) && evalCases.length < 2) {
    add('eval-cases-too-few', 'warn', 'evalCases 少于 2 条')
  }

  return {
    ok: !issues.some((issue) => issue.severity === 'error'),
    issues,
    stats: { nameValid: !issues.some((issue) => issue.code.startsWith('name-')), contentLength: text.length },
  }
}

function buildSteps({ decomposition, capability, domain }) {
  const steps = []
  const capabilityZh = capabilityLabel(capability)
  const subTasks = (decomposition.subTasks || []).filter((subTask) => subTask.capability === capability)
  const source = subTasks.length ? subTasks : decomposition.subTasks || []
  let index = 0
  for (const subTask of source.slice(0, 5)) {
    index += 1
    const label = subTask.role === 'read' ? '读取输入' : subTask.role === 'review' ? '自检' : '执行'
    steps.push(index + '. ' + label + '：' + subTask.title + '（能力：' + (subTask.capability || capability) + '）')
  }
  if (steps.length < 4) {
    steps.push((steps.length + 1) + '. 确认输入与验收标准：列出必需的源文件/参数，缺失时先询问用户（能力：task-planning）')
    steps.push((steps.length + 1) + '. 读取并解析输入：' + (decomposition.deliverables || []).map((deliverable) => deliverable.id).join('/') || '文本/文件' + '（能力：document-read）')
    steps.push((steps.length + 1) + '. 产出 ' + capabilityZh + '：按“输入 → 处理 → 输出”的链路执行，保留中间产物（能力：' + capability + '）')
    steps.push((steps.length + 1) + '. 质量自检：对照验收标准逐条检查，标注不确定项')
    steps.push((steps.length + 1) + '. 交付：输出文件/结果，并说明边界与未完成项')
  }
  return steps.slice(0, 8)
}

function uniqueName(base, existingNames) {
  const taken = new Set((existingNames || []).map((name) => normalizeText(name)))
  let candidate = slugify(base) || 'draft-skill'
  if (candidate.length > 64) candidate = candidate.slice(0, 64).replace(/-+$/g, '')
  if (!taken.has(candidate)) return candidate
  let index = 2
  while (taken.has(candidate + '-' + index)) index += 1
  return candidate + '-' + index
}

function resolveContext(input) {
  const plan = input.plan && typeof input.plan === 'object' ? input.plan : null
  const task = typeof input.task === 'string' ? input.task : plan && typeof plan.goal === 'string' ? plan.goal : ''
  const decomposition = decomposeTask({ task, context: input.context })
  return { plan, task, decomposition }
}

/**
 * Generate a SKILL.md draft for a missing capability. Pure: returns a string +
 * metadata, never writes or executes anything.
 * @param {{task?:string, plan?:object, missing?:object[], existingNames?:string[], context?:string}} input
 */
function draftScore({ lint, safety, evalCases, content, name }) {
  let score = 100
  const issues = lint && Array.isArray(lint.issues) ? lint.issues : []
  score -= issues.filter((issue) => issue && issue.severity === 'error').length * 20
  score -= issues.filter((issue) => issue && issue.severity === 'warn').length * 5
  if (!content || content.length < 500) score -= 15
  if (!Array.isArray(evalCases) || evalCases.length < 3) score -= 10
  if (safety && safety.available && safety.level === 'high') score -= 60
  else if (safety && safety.available && safety.level === 'medium') score -= 15
  if (!name || name.length < 6) score -= 10
  score = Math.max(0, Math.min(100, Math.round(score)))
  const grade = score >= 85 ? 'A' : score >= 70 ? 'B' : score >= 55 ? 'C' : 'D'
  return { score, grade }
}

export function draftSkill(input = {}) {
  const { plan, task, decomposition } = resolveContext(input)
  const missing = Array.isArray(input.missing) && input.missing.length
    ? input.missing
    : plan && Array.isArray(plan.missing) && plan.missing.length
      ? plan.missing
      : []
  const planMissing = missing[0] || null
  const capability =
    (planMissing && planMissing.capability) ||
    (decomposition.capabilities && decomposition.capabilities[0]) ||
    'task-planning'
  const capabilityMeta = CAPABILITY_BY_ID.get(capability) || null
  const domain =
    (planMissing && planMissing.domain) ||
    (capabilityMeta && capabilityMeta.domain) ||
    (decomposition.domains && decomposition.domains[0]) ||
    'productivity'
  const domainMeta = DOMAIN_BY_ID.get(domain) || null
  const capabilityZh = capabilityLabel(capability)
  const domainZh = domainLabel(domain)
  const existingNames = Array.isArray(input.existingNames) ? input.existingNames.filter((name) => typeof name === 'string') : []
  const name = uniqueName(domain + '-' + capability, existingNames)

  const goalText = truncate(
    decomposition.goal || task || ('补齐能力：' + capabilityZh),
    90,
  )
  const description = truncate(
    capabilityZh + '（' + domainZh + '）：' + goalText + '。用于需要' + capabilityZh + '的任务，含输入输出、步骤、质量检查与失败处理。',
    DESCRIPTION_MAX - 1,
  )
  const descriptionSafe = description.replace(/"/g, "'")
  const whenToUse = truncate(
    '当用户需要' + capabilityZh + '，或任务包含「' + goalText + '」这类需求时使用。',
    160,
  )
  const deliverables = (plan && Array.isArray(plan.deliverables) && plan.deliverables) ||
    (decomposition.deliverables || []).map((deliverable) => deliverable.id)
  const deliverableLabels = deliverables
    .map((id) => (DELIVERABLES[id] ? DELIVERABLES[id].zh : id))
    .filter(Boolean)
  const artifactIds = [...new Set((decomposition.deliverables || []).map((deliverable) => deliverable.id))]
  const planStages = plan && Array.isArray(plan.stages) ? plan.stages : []
  const stageInput = planStages.find((stage) => typeof stage.input === 'string' && stage.input)?.input || null
  const stageOutputs = [...new Set(planStages.map((stage) => stage.output).filter((output) => typeof output === 'string' && output))]
  const inputLines = stageInput
    ? '- ' + stageInput
    : artifactIds.length
      ? artifactIds.map((id) => '- ' + id + '（源文件或需求说明）').join('\n')
      : '- 任务描述、必要文件或参数（缺失时先询问）'
  const outputLines = stageOutputs.length
    ? stageOutputs.map((output) => '- ' + output).join('\n')
    : deliverableLabels.length
      ? deliverableLabels.map((item) => '- ' + item).join('\n')
      : '- 任务结果与说明'
  const steps = buildSteps({ decomposition, capability, domain })
  const evalCases = [
    {
      id: name + '-case-1',
      task: task || goalText,
      expectedCapabilities: [capability],
      expectedDeliverables: deliverables.slice(0, 2),
    },
    {
      id: name + '-case-2',
      task: '围绕「' + goalText + '」给出最小可运行示例并说明限制',
      expectedCapabilities: [capability],
      expectedDeliverables: deliverables.slice(0, 1),
    },
    {
      id: name + '-case-3',
      task: '输入不完整（缺少源文件/参数）时，先向用户确认再执行',
      expectedCapabilities: ['task-planning'],
      expectedDeliverables: [],
    },
  ]

  const content = [
    '---',
    'name: ' + name,
    'description: "' + descriptionSafe + '"',
    '---',
    '',
    '# ' + (capabilityZh + '（' + domainZh + '）'),
    '',
    '## 何时使用',
    whenToUse,
    '',
    '## 输入',
    inputLines,
    '',
    '## 输出',
    outputLines,
    '',
    '## 步骤',
    steps.join('\n'),
    '',
    '## 质量检查',
    '- [ ] 交付物与需求逐条对照，无遗漏',
    '- [ ] 格式/编码/命名符合目标环境约束',
    '- [ ] 事实、数据与引用可追溯（标注来源）',
    '- [ ] 明确标注不确定项与未完成项',
    '',
    '## 失败处理',
    '- 输入缺失：列出缺失项并询问用户，不臆造数据',
    '- 依赖/工具不可用：降级为手工步骤并说明影响',
    '- 结果不确定：输出草稿并标注需人工复核的部分',
    '',
    '## 示例',
    '用户：' + truncate(task || goalText, 80),
    '期望：' + (deliverableLabels[0] || '可核对的交付物') + '，并附边界说明。',
    '',
  ].join('\n')

  const lint = lintSkillText(content, {
    name,
    description,
    whenToUse,
    existingNames,
    evalCases,
  })
  const safety = runSecurityScan(content)
  const similar = findSimilarNames(name, existingNames)
  const quality = draftScore({ lint, safety, evalCases, content, name })

  return {
    ok: lint.ok && !(safety.available && safety.level === 'high'),
    quality,
    name,
    description,
    whenToUse,
    content,
    evalCases,
    lint,
    safety,
    similarNames: similar,
    capability,
    domain,
    written: false,
    executed: false,
    assumptions: [
      'draft 仅在内存中生成，未写盘、未执行任何命令。',
      safety.available ? 'safety 由 lib/security.js scanSkillText 扫描。' : 'safety 未扫描（扫描器不可用），不能视为安全。',
      'evalCases 为占位用例，需在真实评测集中补全。',
    ],
  }
}

/** Convenience: profile the draft as if it were a library entry. */
export function profileDraft(draft) {
  if (!draft || typeof draft.name !== 'string') return capabilityProfile(null)
  return capabilityProfile({
    name: draft.name,
    description: draft.description,
    whenToUse: draft.whenToUse,
    category: draft.domain,
  })
}

export { INTENT_BY_ID, capabilityLabel, clamp }
