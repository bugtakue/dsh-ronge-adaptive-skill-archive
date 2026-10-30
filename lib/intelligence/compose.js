/**
 * Skill composition: turn a decomposed task into an executable multi-skill plan
 * (`stages` / `pattern` / `missing` / `conflicts` / `estimates`).
 *
 * Selection is heuristic and local: capability coverage first, then domain,
 * quality/rating/stars, experience stats, installed preference. Library skills
 * the user does not have are only reported as install suggestions; every
 * selected skill carries `installed` so the host can decide to ask.
 */

import { capabilityIndexFor, capabilityProfile, deliverableCapabilities } from './capability.js'
import { decomposeTask } from './decompose.js'
import { efficiencyEstimate } from './efficiency.js'
import {
  CAPABILITY_BY_ID,
  DELIVERABLES,
  DOMAIN_BY_ID,
  INTENT_BY_ID,
  clamp,
  domainLabel,
  normalizeText,
  round,
  truncate,
} from './taxonomy.js'

export const COMPOSE_VERSION = '1.0.0'

export const PATTERNS = ['sequential', 'parallel', 'review-gate', 'escalation']
const DEFAULT_MAX_SKILLS = 5
const MIN_SKILLS = 2

const REVIEW_INTENTS = new Set(['contract-review', 'layout-review', 'security-review', 'document-edit'])
const SEQUENTIAL_MARKERS = /(先|然后|再|接着|之后|随后|最后|first|then|after that|before|followed by)/i
const PARALLEL_MARKERS = /(同时|并行|一边|分别|两个都|另一份|同时进行|parallel|in parallel|at the same time|independently)/i

const INTENT_OUTPUT = {
  'contract-review': '核对结果、差异清单与风险提示',
  'document-create': '成文文档',
  'document-edit': '修订后的文档',
  'document-convert': '转换后的目标格式文件',
  'layout-review': '版式问题清单与修改建议',
  'video-create': '视频成片（含字幕/配乐）',
  'video-edit': '剪辑后的视频',
  'data-analysis': '分析结论与图表/报表',
  research: '调研结论与来源清单',
  marketing: '文案/活动方案',
  design: '视觉稿与导出资源',
  'software-build': '可运行代码与测试结果',
  'plugin-development': '可安装的插件/preset',
  'security-review': '风险清单与修复建议',
  teaching: '讲解材料与练习',
  'business-plan': '策略方案与测算',
  planning: '任务拆解与排期',
  automation: '自动化流程/脚本',
  'meeting-notes': '会议纪要',
  'ai-build': '提示词与编排方案',
  general: '任务结果',
}

const INTENT_INPUT = {
  'contract-review': '合同/条款文档（docx/pdf 或文本）',
  'document-create': '需求说明与参考材料',
  'document-edit': '现有文档与修改要求',
  'document-convert': '源文件与目标格式',
  'layout-review': '文档/幻灯片文件',
  'video-create': '主题/文案与素材（可选）',
  'video-edit': '现有素材与剪辑要求',
  'data-analysis': '数据文件或数据源',
  research: '研究问题与范围',
  marketing: '产品信息、受众与渠道',
  design: '设计需求、品牌要素与尺寸',
  'software-build': '需求/仓库与验收标准',
  'plugin-development': '插件需求与 Harness 版本',
  'security-review': '代码/配置/依赖清单',
  teaching: '学习目标与已有水平',
  'business-plan': '市场信息与业务约束',
  planning: '目标与时间范围',
  automation: '流程描述与触发条件',
  'meeting-notes': '录音/会议材料',
  'ai-build': '场景、模型与工具约束',
  general: '任务上下文',
}

const INTENT_ACCEPTANCE = {
  'contract-review': '条款逐条核对完成；金额/日期/主体无遗漏；风险项有出处。',
  'document-create': '文档结构完整；关键信息齐全；格式符合要求。',
  'document-edit': '修改点有对照；原文未误删；差异可回滚。',
  'document-convert': '目标格式可打开；内容无丢失；版式检查通过。',
  'layout-review': '版式问题有截图/位置；修复建议可执行。',
  'video-create': '成片时长/画幅正确；字幕与音频同步；关键镜头完整。',
  'video-edit': '剪辑点符合要求；无黑帧/爆音；输出可播放。',
  'data-analysis': '口径明确；数字可复算；图表与结论一致。',
  research: '关键结论有来源；不确定项标注；覆盖范围说明。',
  marketing: '目标受众/渠道明确；文案可发布；事实与合规检查。',
  design: '交付物符合品牌/尺寸；图层/资源可编辑；导出检查。',
  'software-build': '测试通过；关键路径可运行；变更说明完整。',
  'plugin-development': '插件可安装/启用；slot/工具验证；可卸载回滚。',
  'security-review': '风险有复现/证据；修复建议可执行；残余风险标注。',
  teaching: '目标/练习匹配；示例可复现；难点有解释。',
  'business-plan': '假设与数据来源明确；测算可复核；风险与备选方案。',
  planning: '任务有负责人/依赖/验收；关键路径明确。',
  automation: '流程可重跑；失败可恢复；输出可验证。',
  'meeting-notes': '决议/行动项/负责人齐全；原文可追溯。',
  'ai-build': '工具/提示词可复现；有评测与失败处理；权限边界明确。',
  general: '交付物可验收；不确定项已标注。',
}

const ALLOWED_PATTERNS = new Set(PATTERNS)

function capabilityDomain(capabilityId) {
  const meta = CAPABILITY_BY_ID.get(capabilityId)
  return meta ? meta.domain : null
}

function experienceStats(experience, name) {
  if (!experience || !name) return { uses: 0, successes: 0, successRate: null, feedbackGood: 0, feedbackBad: 0 }
  let stats = null
  if (experience.skills && typeof experience.skills === 'object') stats = experience.skills[name] || null
  else if (typeof experience === 'object') stats = experience[name] || null
  if (!stats && Array.isArray(experience.topSkills)) {
    stats = experience.topSkills.find((item) => item && item.name === name) || null
  }
  const uses = Number(stats?.uses) || 0
  const successes = Number(stats?.successes) || 0
  const successRate = Number.isFinite(Number(stats?.successRate))
    ? Number(stats.successRate)
    : uses > 0
      ? successes / uses
      : null
  const rec = experience.recFeedback && experience.recFeedback.skills && experience.recFeedback.skills[name]
  return {
    uses,
    successes,
    successRate,
    feedbackGood: Number(rec?.good) || 0,
    feedbackBad: Number(rec?.bad) || 0,
  }
}

function makeCandidate({ entry, source, indexSkills }) {
  const name = String(entry?.name || '').trim()
  if (!name) return null
  const profile = (indexSkills && indexSkills[name]) || capabilityProfile(entry)
  return {
    name,
    installed: source === 'installed',
    profile,
    quality: Number(entry.quality) || 0,
    rating: Number(entry.rating) || 0,
    stars: Number(entry.stars) || 0,
    trust: String(entry.trust || ''),
    weak: Boolean(entry.weak),
    duplicateRank: Number(entry.duplicateRank) || 0,
    source,
  }
}

function buildCandidatePool(installedSkills, libraryEntries, capabilityIndex) {
  const indexSkills = capabilityIndex && capabilityIndex.skills ? capabilityIndex.skills : null
  const byName = new Map()
  for (const entry of libraryEntries || []) {
    const candidate = makeCandidate({ entry, source: 'library', indexSkills })
    if (candidate) byName.set(candidate.name, candidate)
  }
  for (const entry of installedSkills || []) {
    const libraryEntry = byName.get(String(entry?.name || '').trim())
    const merged = libraryEntry
      ? {
          ...(libraryEntries || []).find((item) => item && item.name === libraryEntry.name),
          ...entry,
          quality: entry.quality ?? libraryEntry.quality,
          rating: entry.rating ?? libraryEntry.rating,
          stars: entry.stars ?? libraryEntry.stars,
          trust: entry.trust ?? libraryEntry.trust,
          weak: entry.weak ?? libraryEntry.weak,
          duplicateRank: entry.duplicateRank ?? libraryEntry.duplicateRank,
        }
      : entry
    const candidate = makeCandidate({ entry: merged, source: 'installed', indexSkills })
    if (candidate) byName.set(candidate.name, candidate)
  }
  return [...byName.values()]
}

function scoreCandidate(candidate, context) {
  const { capability, requiredDomains, experience, taskText } = context
  const reasons = []
  let score = 0
  const caps = candidate.profile.capabilities || []
  if (capability && caps.includes(capability)) {
    score += 1
    reasons.push('能力：' + capability)
  } else if (capability && (candidate.profile.primaryDomain === capabilityDomain(capability))) {
    score += 0.35
    reasons.push('领域相近：' + domainLabel(capabilityDomain(capability)))
  }
  const domainHit = (candidate.profile.domains || []).find((domain) => requiredDomains.includes(domain.id))
  if (domainHit) {
    score += 0.22
    reasons.push('领域：' + domainLabel(domainHit.id))
  }
  if (candidate.installed) {
    score += 0.55
    reasons.push('已安装')
  }
  if (candidate.quality > 0) {
    const qualityBonus = clamp((candidate.quality - 40) / 60, 0, 1) * 0.15
    score += qualityBonus
    reasons.push('质量 ' + candidate.quality)
  }
  if (candidate.rating > 0) {
    score += clamp((candidate.rating - 3.5) / 1.5, 0, 1) * 0.1
  }
  if (candidate.stars > 0) {
    score += clamp(Math.log10(candidate.stars + 1) / 6, 0, 1) * 0.08
  }
  if (candidate.trust === 'official') score += 0.05
  const stats = experienceStats(experience, candidate.name)
  if (stats.uses > 0) {
    score += Math.min(0.15, stats.uses * 0.02)
    if (stats.successRate !== null) score += clamp(stats.successRate, 0, 1) * 0.05
    reasons.push('经验 ' + stats.uses + ' 次')
  }
  if (candidate.weak) {
    score -= 0.15
    reasons.push('库内标记 weak')
  }
  if (candidate.duplicateRank > 0) score -= 0.1
  // Stems from name vs task tokens (cheap, deterministic affinity check).
  const normalizedTask = normalizeText(taskText || '')
  if (normalizedTask) {
    const nameTokens = candidate.name.split(/[-_]/).filter((token) => token.length >= 3)
    const hits = nameTokens.filter((token) => normalizedTask.includes(token)).length
    if (hits > 0) {
      score += Math.min(0.12, hits * 0.04)
      reasons.push('名称命中 ' + hits)
    }
  }
  return { score: round(score, 3), reasons }
}

function uniqueCaps(list) {
  const out = []
  for (const capability of list || []) if (capability && !out.includes(capability)) out.push(capability)
  return out
}

function rankForCapability(pool, capability, context, options = {}) {
  const strict = options.strict !== false
  return pool
    .map((candidate) => {
      const scored = scoreCandidate(candidate, { ...context, capability })
      return { candidate, ...scored }
    })
    .filter((entry) => {
      const covers = entry.candidate.profile.capabilities.includes(capability)
      if (strict) return covers && entry.score > 0.4
      return covers || entry.score > 0.45
    })
    .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
}

const TEXT_SAFE_DOMAINS = new Set(['writing', 'marketing', 'research', 'productivity', 'ai', 'unknown'])

function selectSkills({ pool, decomposition, installedCount, experience, maxSkills }) {
  const textMode = decomposition.outputMode === 'text'
  const selectionPool = textMode ? pool.filter((candidate) => TEXT_SAFE_DOMAINS.has(candidate.profile.primaryDomain)) : pool
  const required = uniqueCaps(decomposition.capabilities)
  const requiredDomains = uniqueCaps([...(decomposition.domains || [])])
  const context = { requiredDomains, experience, taskText: decomposition.goal }
  const selected = []
  const covered = new Set()
  const selectedNames = new Set()

  for (const capability of required) {
    if (covered.has(capability)) continue
    if (selected.length >= maxSkills) break
    const ranked = rankForCapability(selectionPool.filter((candidate) => candidate.installed), capability, context)
    const best = ranked.find((entry) => !selectedNames.has(entry.candidate.name))
    if (!best) continue
    const threshold = best.candidate.installed ? 0.55 : 0.6
    if (best.score < threshold) continue
    selected.push(best.candidate)
    selectedNames.add(best.candidate.name)
    for (const cap of best.candidate.profile.capabilities || []) if (required.includes(cap)) covered.add(cap)
  }

  // Multi-capability tasks should engage at least two skills, but never add a
  // redundant skill: the second pass only looks at still-uncovered capabilities.
  if (selected.length < Math.min(MIN_SKILLS, maxSkills)) {
    const uncovered = required.filter((capability) => !covered.has(capability))
    for (const capability of uncovered) {
      if (selected.length >= Math.min(MIN_SKILLS, maxSkills)) break
      const ranked = rankForCapability(selectionPool.filter((candidate) => candidate.installed), capability, context)
      const best = ranked.find((entry) => !selectedNames.has(entry.candidate.name) && entry.score >= 0.5)
      if (!best) continue
      selected.push(best.candidate)
      selectedNames.add(best.candidate.name)
      for (const cap of best.candidate.profile.capabilities || []) if (required.includes(cap)) covered.add(cap)
    }
  }



  return { selected, covered, required, requiredDomains, context, installedCount }
}

function buildMissing({ required, covered, pool, decomposition }) {
  const primaryCaps = new Set((INTENT_BY_ID.get(decomposition.primaryIntent)?.capabilities) || [])
  const missing = []
  for (const capability of required) {
    if (covered.has(capability)) continue
    const domain = capabilityDomain(capability) || decomposition.domains[0] || 'unknown'
    const suggestions = pool
      .filter((candidate) => !candidate.installed)
      .filter((candidate) => decomposition.outputMode !== 'text' || TEXT_SAFE_DOMAINS.has(candidate.profile.primaryDomain))
      .map((candidate) => {
        let score = 0
        if ((candidate.profile.capabilities || []).includes(capability)) score += 2
        if ((candidate.profile.domains || []).some((item) => item.id === domain)) score += 1.2
        if (candidate.quality > 0) score += candidate.quality / 500
        return { candidate, score: round(score, 3) }
      })
      .filter((entry) => entry.score >= 1.2)
      .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
      .slice(0, 3)
      .map((entry) => entry.candidate.name)
    missing.push({
      capability,
      domain,
      layer: CAPABILITY_BY_ID.get(capability)?.zh || capability,
      critical: primaryCaps.has(capability),
      suggestedLibrarySkills: suggestions,
      draftNeeded: true,
    })
  }
  return missing
}

function buildConflicts({ selected, requiredDomains, required }) {
  const conflicts = []
  const seen = new Set()
  const push = (conflict) => {
    const key = [conflict.type, ...(conflict.skills || []).slice().sort(), conflict.capability || ''].join('|')
    if (seen.has(key)) return
    seen.add(key)
    conflicts.push(conflict)
  }
  for (let i = 0; i < selected.length; i += 1) {
    for (let j = i + 1; j < selected.length; j += 1) {
      const a = selected[i]
      const b = selected[j]
      const shared = (a.profile.capabilities || []).filter((capability) => (b.profile.capabilities || []).includes(capability))
      if (shared.length) {
        push({
          type: 'overlap',
          severity: shared.some((capability) => required.includes(capability)) ? 'low' : 'low',
          skills: [a.name, b.name],
          capability: shared[0],
          capabilities: shared,
          reason: '两个技能覆盖相同能力：' + shared.join('、'),
        })
      }
    }
  }
  for (const candidate of selected) {
    const primary = candidate.profile.primaryDomain
    if (primary === 'unknown') continue
    if (requiredDomains.length && !requiredDomains.includes(primary) && primary !== 'productivity') {
      push({
        type: 'domain-mismatch',
        severity: 'low',
        skills: [candidate.name],
        capability: null,
        reason: '技能主领域 ' + domainLabel(primary) + ' 与任务领域不匹配（可能是辅助技能）',
      })
    }
  }
  return conflicts
}

function choosePattern({ decomposition, missing, selected, required, covered, task }) {
  const text = normalizeText(task || decomposition.goal || '')
  const criticalMissing = missing.filter((entry) => entry.critical).length
  const coverage = required.length ? covered.size / required.length : 0
  if (!selected.length) return 'escalation'
  if (coverage < 0.5 && criticalMissing > 0) return 'escalation'
  const reviewIntent = REVIEW_INTENTS.has(decomposition.primaryIntent)
  const reviewSignal = /(核对|审核|复核|验收|检查|review|verify|qa)/i.test(text)
  if (reviewIntent || reviewSignal) return 'review-gate'
  if (PARALLEL_MARKERS.test(text) && (decomposition.secondaryIntents.length || decomposition.deliverables.length > 1)) {
    return 'parallel'
  }
  if (SEQUENTIAL_MARKERS.test(text)) return 'sequential'
  if (decomposition.secondaryIntents.length >= 1 && decomposition.deliverables.length >= 2) return 'parallel'
  return 'sequential'
}

function assignSkillsToStages({ selected, decomposition, covered, required, pattern }) {
  const intents = [decomposition.primaryIntent, ...(decomposition.secondaryIntents || [])].filter(
    (intentId) => intentId && intentId !== 'general' && INTENT_BY_ID.has(intentId),
  )
  const stages = []
  const assigned = new Set()
  if (!intents.length) {
    const stageSkills = selected.map((candidate) => ({
      name: candidate.name,
      why: whyOf(candidate, null),
      installed: candidate.installed,
    }))
    if (!stageSkills.length) return stages
    stages.push({
      role: 'produce-primary',
      intent: 'general',
      skills: stageSkills,
      input: INTENT_INPUT.general,
      output: INTENT_OUTPUT.general,
      handoff: '输出任务结果',
      fallback: '若技能不可用：缩小范围或人工完成',
    })
    return stages
  }

  const bestStageFor = new Map()
  for (const candidate of selected) {
    const caps = candidate.profile.capabilities || []
    let bestIndex = -1
    let bestHits = []
    let bestScore = -1
    for (let index = 0; index < intents.length; index += 1) {
      const intent = INTENT_BY_ID.get(intents[index])
      const intentCaps = (intent.capabilities || []).filter((capability) => required.includes(capability))
      const hits = caps.filter((capability) => intentCaps.includes(capability))
      const domainBonus = intent && candidate.profile.primaryDomain === intent.domain ? 0.6 : 0
      const score = hits.length + domainBonus
      if (score > bestScore) {
        bestScore = score
        bestHits = hits
        bestIndex = index
      }
    }
    bestStageFor.set(candidate.name, { index: bestIndex, hits: bestHits })
  }

  for (let stageIndex = 0; stageIndex < intents.length; stageIndex += 1) {
    const intentId = intents[stageIndex]
    const intent = INTENT_BY_ID.get(intentId)
    const intentCaps = (intent.capabilities || []).filter((capability) => required.includes(capability))
    const stageSkills = []
    for (const candidate of selected) {
      const best = bestStageFor.get(candidate.name)
      if (!best || best.index !== stageIndex) continue
      if (!best.hits.length) continue
      stageSkills.push({ name: candidate.name, why: whyOf(candidate, best.hits), installed: candidate.installed })
      assigned.add(candidate.name)
    }
    // A stage is only emitted when it owns at least one skill. Capabilities of
    // intents without an assigned skill are either covered elsewhere or missing.
    if (!stageSkills.length) continue
    stages.push({
      role: intentId === decomposition.primaryIntent ? 'produce-primary' : 'produce-secondary',
      intent: intentId,
      skills: stageSkills,
      input: INTENT_INPUT[intentId] || INTENT_INPUT.general,
      output: INTENT_OUTPUT[intentId] || INTENT_OUTPUT.general,
      handoff:
        pattern === 'parallel'
          ? '与其它阶段独立，可并行执行；汇总后统一交付'
          : '上一阶段完成后进入下一阶段',
      fallback: '若无可用技能：先起草技能或人工完成',
      acceptance: INTENT_ACCEPTANCE[intentId] || INTENT_ACCEPTANCE.general,
    })
  }

  if (!stages.length && selected.length) {
    stages.push({
      role: 'produce-primary',
      intent: decomposition.primaryIntent,
      skills: selected.map((candidate) => ({
        name: candidate.name,
        why: whyOf(candidate, null),
        installed: candidate.installed,
      })),
      input: INTENT_INPUT[decomposition.primaryIntent] || INTENT_INPUT.general,
      output: INTENT_OUTPUT[decomposition.primaryIntent] || INTENT_OUTPUT.general,
      handoff: '输出任务结果（意图与技能未完全对齐，执行前建议确认）',
      fallback: '若无可用技能：缩小范围或人工完成',
      acceptance: INTENT_ACCEPTANCE[decomposition.primaryIntent] || INTENT_ACCEPTANCE.general,
    })
    for (const candidate of selected) assigned.add(candidate.name)
  }

  const unassigned = selected.filter((candidate) => !assigned.has(candidate.name))
  if (unassigned.length && stages.length) {
    const first = stages[0]
    for (const candidate of unassigned) {
      first.skills.push({
        name: candidate.name,
        why: whyOf(candidate, null),
        installed: candidate.installed,
        reused: true,
      })
    }
  }
  return stages
}

function trimStages(stages, maxEntries, maxStages = 5) {
  let clean = stages
    .map((stage) => {
      const seen = new Set()
      const skills = (stage.skills || []).filter((skill) => {
        if (!skill || !skill.name || seen.has(skill.name)) return false
        seen.add(skill.name)
        return true
      })
      return { ...stage, skills }
    })
    .filter((stage) => stage.skills.length)
  while (clean.length > maxStages) {
    if (clean.length <= 1) break
    clean = clean.slice(0, -1)
  }
  const totalEntries = () => clean.reduce((sum, stage) => sum + stage.skills.length, 0)
  while (totalEntries() > maxEntries && clean.length) {
    let target = -1
    let largest = 1
    for (let index = 0; index < clean.length; index += 1) {
      if (clean[index].skills.length > largest) {
        largest = clean[index].skills.length
        target = index
      }
    }
    if (target === -1) {
      if (clean.length <= 1) break
      clean = clean.slice(0, -1)
    } else {
      clean[target] = { ...clean[target], skills: clean[target].skills.slice(0, -1) }
    }
    clean = clean.filter((stage) => stage.skills.length)
  }
  return clean
}

function whyOf(candidate, hits) {
  const parts = []
  if (hits && hits.length) parts.push('能力：' + hits.join('、'))
  else if (candidate.profile.capabilities?.length) parts.push('能力：' + candidate.profile.capabilities.slice(0, 2).join('、'))
  if (candidate.profile.primaryDomain && candidate.profile.primaryDomain !== 'unknown') {
    parts.push('领域：' + domainLabel(candidate.profile.primaryDomain))
  }
  if (candidate.quality > 0) parts.push('质量 ' + candidate.quality)
  if (candidate.rating > 0) parts.push('评分 ' + candidate.rating)
  parts.push(candidate.installed ? '已安装' : '需安装')
  return parts.join('；')
}

/** Build the review gate stage (only when pattern === 'review-gate'). */
function buildReviewStage({ selected, decomposition, pattern, usedNames = new Set() }) {
  if (pattern !== 'review-gate') return null
  const reviewSkills = selected
    .filter((candidate) => {
      if (usedNames.has(candidate.name)) return false
      const caps = candidate.profile.capabilities || []
      return ['testing', 'code-review', 'security-audit', 'fact-checking', 'layout-review', 'contract-review'].some((capability) =>
        caps.includes(capability),
      )
    })
    .slice(0, 1)
    .map((candidate) => ({ name: candidate.name, why: whyOf(candidate, ['复核']), installed: candidate.installed }))
  return {
    role: 'review',
    intent: 'review-gate',
    skills: reviewSkills,
    input: '上一阶段产出与验收标准',
    output: INTENT_OUTPUT[decomposition.primaryIntent] || '复核意见',
    handoff: reviewSkills.length ? '复核通过后交付；不通过则回退上一步' : '由用户/Agent 人工复核后交付；不通过则回退上一步',
    fallback: '无法复核时：先交付草稿并明确标注未复核项',
    acceptance: '复核项逐条通过；未通过项有回退/修正记录。',
    gate: true,
  }
}

/**
 * Compose a 2–5 skill plan.
 * @param {{task?:string, installedSkills?:object[], libraryEntries?:object[],
 *   experience?:object, capabilityIndex?:object, maxSkills?:number, cwd?:string, context?:string}} input
 */
export function composeSkillPlan(input = {}) {
  const task = typeof input.task === 'string' ? input.task : String(input.task || '')
  const installedSkills = Array.isArray(input.installedSkills) ? input.installedSkills : []
  const libraryEntries = Array.isArray(input.libraryEntries) ? input.libraryEntries : []
  const requestedMax = Number(input.maxSkills)
  const maxSkills = Math.min(DEFAULT_MAX_SKILLS, Math.max(MIN_SKILLS, Number.isFinite(requestedMax) ? requestedMax : DEFAULT_MAX_SKILLS))

  const decomposition = input.decomposition && typeof input.decomposition === 'object'
    ? input.decomposition
    : decomposeTask({ task, cwd: input.cwd, context: input.context })
  const required = uniqueCaps(decomposition.capabilities)
  const primaryIntentCaps = new Set(INTENT_BY_ID.get(decomposition.primaryIntent)?.capabilities || [])
  const index = input.capabilityIndex || (libraryEntries.length > 200 ? capabilityIndexFor(libraryEntries) : null)
  const pool = buildCandidatePool(installedSkills, libraryEntries, index)

  const selection = selectSkills({
    pool,
    decomposition,
    installedCount: installedSkills.length,
    experience: input.experience,
    maxSkills,
  })
  const missing = buildMissing({
    required: selection.required,
    covered: selection.covered,
    pool,
    decomposition,
  })
  if (decomposition.outputMode === 'text' && selection.selected.length === 0) {
    return {
      ok: true,
      ready: true,
      reviewGap: false,
      reviewGapSuggestions: [],
      pattern: 'sequential',
      stages: [],
      missing: [],
      conflicts: [],
      estimates: { efficiency: efficiencyEstimate({ stages: [], missing: [], selected: [], pattern: 'sequential', baselineSkills: installedSkills.length }), skills: 0, stages: 0 },
      assumptions: ['纯文本交付：不需要加载技能，直接生成正文；不把 office/video 技能强塞进计划。'],
      confidence: Math.max(0.5, Number(decomposition.confidence) || 0.5),
      coverage: { required: selection.required, covered: [], ratio: 0, primaryIntentCovered: false },
      selected: [],
      primaryIntent: decomposition.primaryIntent,
      secondaryIntents: decomposition.secondaryIntents,
      deliverables: (decomposition.deliverables || []).map((deliverable) => deliverable.id),
      goal: truncate(decomposition.goal || task, 120),
    }
  }
  const conflicts = buildConflicts({
    selected: selection.selected,
    requiredDomains: selection.requiredDomains,
    required: selection.required,
  })
  const pattern = choosePattern({
    decomposition,
    missing,
    selected: selection.selected,
    required: selection.required,
    covered: selection.covered,
    task,
  })
  let stages = assignSkillsToStages({
    selected: selection.selected,
    decomposition,
    covered: selection.covered,
    required: selection.required,
    pattern,
  })
  const usedNames = new Set(stages.flatMap((stage) => stage.skills.map((skill) => skill.name)))
  const reviewStage = buildReviewStage({ selected: selection.selected, decomposition, pattern, usedNames })
  let reviewGap = false
  if (reviewStage && reviewStage.skills.length) {
    if (stages.length > 1) stages = [stages[0], reviewStage, ...stages.slice(1)]
    else stages = [...stages, reviewStage]
  } else if (reviewStage) {
    reviewGap = true
  }
  if (pattern === 'escalation') {
    const installFirst = []
    for (const item of missing) {
      for (const name of item.suggestedLibrarySkills || []) {
        if (installFirst.length >= 2) break
        if (installFirst.some((skill) => skill.name === name)) continue
        installFirst.push({ name, why: '需安装：补齐 ' + item.capability, installed: false })
      }
      if (installFirst.length >= 2) break
    }
    const partial = selection.selected.slice(0, 2).map((candidate) => ({
      name: candidate.name,
      why: whyOf(candidate, null),
      installed: candidate.installed,
    }))
    const escalateSkills = installFirst.length ? installFirst : partial
    if (escalateSkills.length) {
      stages = stages.concat([
        {
          role: 'escalate',
          intent: 'escalation',
          skills: escalateSkills,
          input: '缺失能力清单',
          output: '待确认的能力缺口与补位方案',
          handoff: '用户确认/安装缺失技能后再执行',
          fallback: '缩小任务范围或改为纯人工流程',
          acceptance: '缺口清单明确；用户确认安装/取舍后再进入执行。',
          gate: true,
        },
      ])
    }
  }

  const coverageRatio = selection.required.length ? selection.covered.size / selection.required.length : 1
  const criticalMissing = missing.filter((entry) => entry.critical).length
  const reviewGapSuggestions = reviewGap
    ? pool
        .filter((candidate) => !candidate.installed)
        .filter((candidate) => {
          const caps = candidate.profile.capabilities || []
          return ['code-review', 'security-audit', 'fact-checking', 'layout-review', 'contract-review', 'testing'].some((capability) => caps.includes(capability))
        })
        .slice(0, 3)
        .map((candidate) => candidate.name)
    : []
  const cleanStages = trimStages(stages, maxSkills, 5)
  const estimates = {
    efficiency: efficiencyEstimate({
      stages: cleanStages,
      missing,
      selected: selection.selected.map((candidate) => candidate.name),
      pattern,
      baselineSkills: installedSkills.length || pool.length,
    }),
    skills: selection.selected.length,
    stages: cleanStages.length,
  }

  const assumptions = [...(decomposition.assumptions || [])]
  if (selection.selected.some((candidate) => !candidate.installed)) {
    assumptions.push('部分候选技能来自公共库且未安装，需先安装（或由用户确认）才能执行。')
  }
  if (conflicts.length) assumptions.push('存在 ' + conflicts.length + ' 条组合提示（重叠/跨领域），执行前建议确认。')
  assumptions.push('efficiency 为固定假设下的估算（method=estimate），不是实测。')

  let confidence = 0.35 * (Number(decomposition.confidence) || 0) + 0.45 * coverageRatio + (selection.selected.length ? 0.1 : 0)
  confidence -= Math.min(0.15, conflicts.length * 0.03)
  if (pattern === 'escalation') confidence -= 0.12
  confidence = clamp(round(confidence, 2), 0, 0.95)

  return {
    // `ok` means "a structurally valid plan was produced"; `ready` means it can
    // run without installs/human confirmation. Gaps are reported in `missing`.
    ok: cleanStages.length > 0,
    ready: cleanStages.length > 0 && criticalMissing === 0 && missing.length === 0,
    reviewGap,
    reviewGapSuggestions,
    pattern: ALLOWED_PATTERNS.has(pattern) ? pattern : 'sequential',
    stages: cleanStages,
    missing,
    conflicts,
    estimates,
    assumptions,
    confidence,
    coverage: {
      required: selection.required,
      covered: [...selection.covered].sort(),
      ratio: round(coverageRatio, 2),
      primaryIntentCovered:
        !primaryIntentCaps.size ||
        [...primaryIntentCaps].every((capability) => selection.covered.has(capability)),
    },
    selected: selection.selected.map((candidate) => ({
      name: candidate.name,
      installed: candidate.installed,
      quality: candidate.quality,
      rating: candidate.rating,
      domain: candidate.profile.primaryDomain,
    })),
    primaryIntent: decomposition.primaryIntent,
    secondaryIntents: decomposition.secondaryIntents,
    deliverables: (decomposition.deliverables || []).map((deliverable) => deliverable.id),
    goal: truncate(decomposition.goal || task, 120),
  }
}

export { decomposeTask }
