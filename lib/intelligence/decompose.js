/**
 * Task decomposition: goal, primary/secondary intents, deliverables,
 * constraints, domains, sub-tasks and honest assumptions.
 *
 * `decomposeTask` is pure/deterministic: it never reads files or the network.
 * `input.context` (optional free text, e.g. recent user messages) only adds
 * lower-weight signal and is reported in `assumptions`.
 */

import {
  CAPABILITY_BY_ID,
  DELIVERABLES,
  DELIVERABLE_ORDER,
  INTENT_BY_ID,
  INTENTS,
  capabilityLabel,
  clamp,
  detectDeliverables,
  detectLanguage,
  domainLabel,
  matchKeywords,
  normalizeText,
  round,
  scoreDomains,
  splitClauses,
  truncate,
} from './taxonomy.js'

export const DECOMPOSE_VERSION = '1.0.0'

/** deliverable kind → intents that naturally produce it. */
const DELIVERABLE_TO_INTENTS = {
  docx: ['document-create', 'document-edit'],
  pdf: ['document-convert', 'layout-review'],
  pptx: ['document-create'],
  xlsx: ['data-analysis'],
  mp4: ['video-create'],
  code: ['software-build'],
  report: ['document-create', 'research'],
}

/** canonical sub-task templates per intent: [role, title, capability] */
const SUBTASK_TEMPLATES = {
  'contract-review': [
    { role: 'read', title: '读取并结构化合同条款（甲乙方/金额/日期/义务）', capability: 'document-read' },
    { role: 'analyze', title: '逐条核对金额、日期与关键条款风险', capability: 'contract-review' },
    { role: 'produce', title: '输出核对结果、差异清单与风险提示', capability: 'document-edit' },
  ],
  'document-create': [
    { role: 'plan', title: '确认文档结构、读者与篇幅', capability: 'task-planning' },
    { role: 'produce', title: '撰写并生成文档内容', capability: 'document-write' },
    { role: 'review', title: '检查格式、事实与一致性', capability: 'document-edit' },
  ],
  'document-edit': [
    { role: 'read', title: '读取现有文档并定位需要修改的位置', capability: 'document-read' },
    { role: 'produce', title: '按需求修改并保留原格式', capability: 'document-edit' },
  ],
  'document-convert': [
    { role: 'read', title: '读取源文件并确认目标格式', capability: 'document-read' },
    { role: 'produce', title: '执行格式转换并校验结果完整性', capability: 'document-convert' },
  ],
  'layout-review': [
    { role: 'read', title: '读取文档并逐页渲染为图片', capability: 'layout-review' },
    { role: 'analyze', title: '检查版式、分页、印刷问题并给出修改建议', capability: 'layout-review' },
  ],
  'video-create': [
    { role: 'plan', title: '确认时长/画幅/风格并写分镜与节奏', capability: 'storyboard' },
    { role: 'support', title: '准备配乐、音效、素材与配音', capability: 'audio-music' },
    { role: 'produce', title: '生成/剪辑视频并加字幕', capability: 'video-rendering' },
    { role: 'review', title: '试看并检查时长、卡点与字幕', capability: 'video-editing' },
  ],
  'video-edit': [
    { role: 'read', title: '读取现有素材并确认剪辑目标', capability: 'video-editing' },
    { role: 'produce', title: '完成剪辑、删改与字幕处理', capability: 'video-editing' },
  ],
  'data-analysis': [
    { role: 'read', title: '读取数据并确认口径与指标', capability: 'data-analysis' },
    { role: 'analyze', title: '计算指标、做图表与解释结论', capability: 'data-visualization' },
    { role: 'produce', title: '输出分析报告或表格', capability: 'document-write' },
  ],
  research: [
    { role: 'search', title: '检索并收集来源材料', capability: 'web-research' },
    { role: 'analyze', title: '交叉核对、归纳结论并标注引用', capability: 'synthesis' },
    { role: 'produce', title: '输出调研结论', capability: 'citation' },
  ],
  marketing: [
    { role: 'plan', title: '明确目标受众、渠道与卖点', capability: 'campaign-planning' },
    { role: 'produce', title: '撰写文案/活动方案', capability: 'copywriting' },
  ],
  design: [
    { role: 'plan', title: '确认风格、尺寸与品牌要素', capability: 'visual-design' },
    { role: 'produce', title: '产出视觉稿并导出资源', capability: 'image-generation' },
  ],
  'software-build': [
    { role: 'plan', title: '确认需求边界与验收标准', capability: 'code-generation' },
    { role: 'produce', title: '实现代码并处理错误路径', capability: 'code-generation' },
    { role: 'review', title: '运行测试与回归检查', capability: 'testing' },
  ],
  'plugin-development': [
    { role: 'plan', title: '确认插件形态（Host/Client/MCP）与接口契约', capability: 'harness-plugin' },
    { role: 'produce', title: '实现插件并接入 DSH bundle/preset', capability: 'preset-composition' },
    { role: 'review', title: '本地自检与兼容性验证', capability: 'testing' },
  ],
  'security-review': [
    { role: 'search', title: '收集攻击面、依赖与权限清单', capability: 'security-audit' },
    { role: 'analyze', title: '逐项审计风险并评级', capability: 'security-audit' },
    { role: 'produce', title: '输出修复建议与合规结论', capability: 'compliance-check' },
  ],
  teaching: [
    { role: 'plan', title: '确认学习者水平与目标', capability: 'curriculum-design' },
    { role: 'produce', title: '讲解概念并给出练习', capability: 'tutoring' },
  ],
  'business-plan': [
    { role: 'search', title: '收集市场与竞品信息', capability: 'business-strategy' },
    { role: 'analyze', title: '测算财务与商业模型', capability: 'finance-analysis' },
    { role: 'produce', title: '输出策略建议/方案', capability: 'business-strategy' },
  ],
  planning: [
    { role: 'plan', title: '拆分目标为可执行任务并排期', capability: 'task-planning' },
  ],
  automation: [
    { role: 'plan', title: '确认触发条件与批量范围', capability: 'automation' },
    { role: 'produce', title: '实现自动化流程并做幂等/失败处理', capability: 'automation' },
  ],
  'meeting-notes': [
    { role: 'read', title: '读取录音/会议材料并转写', capability: 'note-taking' },
    { role: 'analyze', title: '提炼决议、待办与责任人', capability: 'synthesis' },
    { role: 'produce', title: '输出纪要文档', capability: 'document-write' },
  ],
  'ai-build': [
    { role: 'plan', title: '确认模型/工具/上下文方案', capability: 'llm-app' },
    { role: 'produce', title: '实现提示词与编排逻辑', capability: 'agent-orchestration' },
    { role: 'review', title: '设计评测用例与回归检查', capability: 'eval-design' },
  ],
}

const CONSTRAINT_RULES = [
  {
    type: 'duration',
    re: /(\d+(?:\.\d+)?)\s*(?:秒钟|秒|分钟|分|s\b|sec\b|secs\b|seconds?\b|mins?\b|minutes?\b)/i,
    label: '时长',
  },
  {
    type: 'quantity',
    re: /(\d+)\s*(?:页|张|条|份|个|篇|字|slides?\b|pages?\b|words?\b)/i,
    label: '数量/篇幅',
  },
  {
    type: 'language',
    re: /(中文|英文|日文|韩文|中英双语|双语|english|chinese|japanese|korean|bilingual)/i,
    label: '语言',
  },
  {
    type: 'deadline',
    re: /(今天|今晚|明天|本周|这周|周五|周一|周一前|下班前|明天上午|deadline|today|tomorrow|this week|by friday|eod)/i,
    label: '截止时间',
  },
  {
    type: 'budget',
    re: /(预算|低成本|零成本|免费|省钱|budget|cheap|low[- ]cost|free)/i,
    label: '预算',
  },
  {
    type: 'format',
    re: /(16:9|9:16|1:1|1080p|720p|4k|竖屏|横屏|mp4|gif|pdf|docx|pptx|xlsx|csv|markdown)/i,
    label: '格式/规格',
  },
  {
    type: 'must-not',
    re: /(不要(?!漏|忘)|别(?!漏|忘)|不得|禁止|避免|不要用|don't|do not|avoid)/i,
    label: '禁止项',
  },
]

function intentOf(id) {
  return INTENT_BY_ID.get(id) || null
}

function clauseWeight(clause) {
  const position = clause.index === 0 ? 1.6 : 1
  const secondary = clause.secondary ? 0.55 : 1
  return position * secondary
}

function platformIntent(primaryScore, bestIntent, cwd) {
  if (bestIntent && primaryScore >= 0.6) return bestIntent
  const normalizedCwd = normalizeText(cwd || '')
  if (normalizedCwd) {
    const scores = scoreDomains(normalizedCwd)
    const top = scores.find((entry) => entry.score >= 2)
    if (top) {
      const byDomain = INTENTS.find((intent) => intent.domain === top.id)
      if (byDomain) return byDomain.id
    }
  }
  return 'general'
}

function collectConstraints(task, context) {
  const constraints = []
  const sources = [
    { text: normalizeText(task), source: 'task' },
    { text: normalizeText(context || ''), source: 'context' },
  ]
  for (const rule of CONSTRAINT_RULES) {
    for (const { text, source } of sources) {
      if (!text) continue
      const match = rule.re.exec(text)
      if (!match) continue
      if (constraints.some((item) => item.type === rule.type && item.value === match[0].trim())) continue
      constraints.push({
        type: rule.type,
        label: rule.label,
        value: match[0].trim(),
        source,
      })
    }
  }
  return constraints
}

function buildSubTasks(selectedIntents) {
  const subTasks = []
  const seen = new Set()
  for (const intentId of selectedIntents) {
    const intent = intentOf(intentId)
    const templates = SUBTASK_TEMPLATES[intentId] || []
    for (const template of templates) {
      const key = intentId + '|' + template.capability + '|' + template.title
      if (seen.has(key)) continue
      seen.add(key)
      const capabilityMeta = CAPABILITY_BY_ID.get(template.capability) || null
      subTasks.push({
        id: 'st-' + (subTasks.length + 1),
        intent: intentId,
        role: template.role,
        title: template.title,
        capability: template.capability,
        domain: capabilityMeta ? capabilityMeta.domain : intent?.domain || null,
        status: 'planned',
      })
    }
  }
  if (!subTasks.length) {
    subTasks.push({
      id: 'st-1',
      intent: 'general',
      role: 'plan',
      title: '澄清目标、交付物与验收标准',
      capability: 'task-planning',
      domain: 'productivity',
      status: 'planned',
    })
  }
  return subTasks
}

function collectCapabilities(primaryIntent, secondaryIntents, deliverables) {
  const out = []
  const push = (capability) => {
    if (capability && CAPABILITY_BY_ID.has(capability) && !out.includes(capability)) out.push(capability)
  }
  const primary = intentOf(primaryIntent)
  if (primary) for (const capability of primary.capabilities) push(capability)
  for (const deliverableId of deliverables) {
    const deliverable = DELIVERABLES[deliverableId]
    if (deliverable) for (const capability of deliverable.capabilities) push(capability)
  }
  for (const intentId of secondaryIntents) {
    const intent = intentOf(intentId)
    if (intent) for (const capability of intent.capabilities) push(capability)
  }
  return out.slice(0, 12)
}

function collectDomains(domainScores, deliverables, primaryIntent, secondaryIntents) {
  const out = []
  const push = (id) => {
    if (id && id !== 'unknown' && !out.includes(id)) out.push(id)
  }
  for (const deliverableId of deliverables) {
    const deliverable = DELIVERABLES[deliverableId]
    if (deliverable) push(deliverable.domain)
  }
  for (const intentId of [primaryIntent, ...secondaryIntents]) {
    const intent = intentOf(intentId)
    if (intent) push(intent.domain)
  }
  for (const entry of domainScores) {
    if (entry.score >= 2) push(entry.id)
  }
  return out.slice(0, 4)
}

function buildAssumptions({ task, deliverables, primaryIntent, secondaryIntents, constraints, confidence }) {
  const assumptions = []
  if (!task) assumptions.push('任务为空：未做任何推断。')
  if (!deliverables.length && task) {
    assumptions.push('未识别到文件类交付物，按对话/规划类任务处理，不默认生成文件。')
  }
  const text = normalizeText(task)
  const mentionsSourceFile = /(这份|附件|这份文件|uploaded|attached|the file|this file|源文件)/i.test(text)
  if (deliverables.includes('docx') && !mentionsSourceFile) {
    assumptions.push('未说明是否已有源文档，假设可以新建或由用户随后提供 docx。')
  }
  if (deliverables.includes('mp4')) {
    assumptions.push('视频未指定分辨率/画幅时，按所选视频技能的默认输出执行。')
  }
  if (secondaryIntents.length) {
    assumptions.push(
      '主/次意图按分句位置与权重判定：' +
        primaryIntent +
        ' 为主意图，' +
        secondaryIntents.join('、') +
        ' 为次意图。',
    )
  }
  const deadline = constraints.find((item) => item.type === 'deadline')
  if (deadline) assumptions.push('截止时间取自任务原文（' + deadline.value + '），未做时区换算。')
  if (!constraints.length && task) assumptions.push('任务未给出显式约束（时长/格式/预算），按通用默认执行。')
  if (confidence < 0.45 && task) assumptions.push('任务信号偏弱，建议先向用户确认交付物与范围。')
  return assumptions
}

/**
 * Decompose a user task into an executable intent/deliverable graph.
 * @param {{task?:string, cwd?:string, context?:string, mode?:string}} input
 */
const TEXT_OUTPUT_RE = /(正文|直接返回|不写文件|不需要文件|不用文件|仅文字|纯文本|作为文本|return (?:the )?text|no files?)/i
const FILE_OUTPUT_RE = /(\.docx|\.pdf|\.pptx|\.xlsx|\.mp4|保存为|写到|导出为|生成文件|make a file|create a file)/i

export function detectOutputMode(rawTask) {
  const text = String(rawTask || '')
  if (TEXT_OUTPUT_RE.test(text)) return 'text'
  if (FILE_OUTPUT_RE.test(text)) return 'file'
  return 'unknown'
}

export function decomposeTask(input = {}) {
  const rawTask = typeof input.task === 'string' ? input.task : String(input.task || '')
  const task = normalizeText(rawTask)
  const context = typeof input.context === 'string' ? input.context : ''

  if (!task) {
    return {
      goal: '',
      primaryIntent: 'general',
      secondaryIntents: [],
      deliverables: [],
      constraints: [],
      domains: [],
      capabilities: [],
      subTasks: [],
      assumptions: ['任务为空：未做任何推断。'],
      confidence: 0,
      outputMode: 'unknown',
      language: 'unknown',
    }
  }

  const clauses = splitClauses(rawTask)
  const intentScores = new Map()
  const firstSeen = new Map()
  const intentEvidence = new Map()
  const secondaryClauseHits = new Map()
  const intentTextHits = new Map()
  for (const clause of clauses) {
    const weight = clauseWeight(clause)
    for (const intent of INTENTS) {
      const { score, matched } = matchKeywords(normalizeText(clause.text), intent.keywords)
      if (!score) continue
      intentScores.set(intent.id, (intentScores.get(intent.id) || 0) + score * weight)
      if (!firstSeen.has(intent.id)) firstSeen.set(intent.id, clause.index)
      if (clause.secondary) secondaryClauseHits.set(intent.id, (secondaryClauseHits.get(intent.id) || 0) + score)
      intentTextHits.set(intent.id, (intentTextHits.get(intent.id) || 0) + score)
      const evidence = intentEvidence.get(intent.id) || []
      for (const keyword of matched) if (!evidence.includes(keyword)) evidence.push(keyword)
      intentEvidence.set(intent.id, evidence)
    }
  }

  const detectedDeliverables = detectDeliverables(rawTask)
  const deliverableIds = detectedDeliverables.map((deliverable) => deliverable.id)
  for (const deliverableId of deliverableIds) {
    for (const intentId of DELIVERABLE_TO_INTENTS[deliverableId] || []) {
      intentScores.set(intentId, (intentScores.get(intentId) || 0) + 1)
      if (!firstSeen.has(intentId)) firstSeen.set(intentId, 0)
    }
  }

  const rankedIntents = [...intentScores.entries()]
    .map(([id, score]) => ({ id, score: round(score, 2), first: firstSeen.get(id) || 0 }))
    .sort((a, b) => b.score - a.score || a.first - b.first || a.id.localeCompare(b.id))
  const primaryCandidate = rankedIntents[0]
  const primaryIntent = platformIntent(primaryCandidate ? primaryCandidate.score : 0, primaryCandidate?.id, input.cwd)
  const primaryScore = primaryCandidate && primaryCandidate.id === primaryIntent ? primaryCandidate.score : 0
  const secondaryIntents = rankedIntents
    .filter((entry) => entry.id !== primaryIntent)
    .filter((entry) => {
      // Explicit "另外/同时/also" clauses are intentional secondary tasks even
      // when the keyword score is small. Deliverable-only bonus (no task text)
      // never creates a secondary intent; otherwise require a meaningful score.
      if (secondaryClauseHits.get(entry.id) > 0) return true
      if ((intentTextHits.get(entry.id) || 0) <= 0) return false
      return entry.score >= Math.max(0.75, primaryScore * 0.12)
    })
    .slice(0, 4)
    .map((entry) => entry.id)

  const domainScores = scoreDomains(task + ' ' + context)
  const domains = collectDomains(domainScores, deliverableIds, primaryIntent, secondaryIntents)
  const constraints = collectConstraints(rawTask, context)
  const capabilities = collectCapabilities(primaryIntent, secondaryIntents, deliverableIds)
  const selectedIntents = [primaryIntent, ...secondaryIntents].filter((id) => id !== 'general')
  const subTasks = buildSubTasks(selectedIntents.length ? selectedIntents : ['general'])

  const domainSignal = domainScores.reduce((sum, entry) => sum + Math.min(3, entry.score), 0)
  let confidence = 0.3
  confidence += Math.min(0.32, primaryScore * 0.04)
  confidence += deliverableIds.length * 0.06
  confidence += secondaryIntents.length ? 0.05 : 0
  confidence += Math.min(0.12, domainSignal * 0.02)
  confidence += primaryIntent === 'general' ? -0.12 : 0
  confidence = clamp(round(confidence, 2), 0, 0.95)

  const assumptions = buildAssumptions({
    task: rawTask,
    deliverables: deliverableIds,
    primaryIntent,
    secondaryIntents,
    constraints,
    confidence,
  })

  return {
    goal: truncate((clauses[0] && clauses[0].text) || rawTask, 120),
    primaryIntent,
    secondaryIntents,
    deliverables: detectedDeliverables,
    constraints,
    domains,
    capabilities,
    subTasks,
    assumptions,
    confidence,
    outputMode: detectOutputMode(rawTask),
    language: detectLanguage(rawTask),
  }
}

/** Human-readable one-liner used by tests / host prompts. */
export function describeDecomposition(decomposition) {
  if (!decomposition) return ''
  const deliverables = (decomposition.deliverables || []).map((deliverable) => deliverable.id)
  const secondary = decomposition.secondaryIntents || []
  return [
    'primary=' + decomposition.primaryIntent,
    secondary.length ? 'secondary=' + secondary.join(',') : 'secondary=none',
    deliverables.length ? 'deliverables=' + deliverables.join(',') : 'deliverables=none',
    'domains=' + ((decomposition.domains || []).join(',') || 'none'),
  ].join(' ')
}

/** Bilingual label helper re-exported for host prompts. */
export function intentDescription(intentId) {
  const intent = INTENT_BY_ID.get(intentId)
  if (!intent) return intentId
  return intent.zh + ' (' + intent.id + ')'
}

export function domainDescription(domainId) {
  return domainLabel(domainId)
}

export function capabilityDescription(capabilityId) {
  return capabilityLabel(capabilityId)
}

export { INTENT_BY_ID, DELIVERABLE_ORDER }
