/**
 * Conservative efficiency estimation.
 *
 * This module never measures anything: every number is a label (`method:
 * 'estimate'`) derived from fixed token/step assumptions. It exists to make a
 * plan comparable, not to claim measured savings.
 */

export const EFFICIENCY_METHOD = 'estimate'
export const EFFICIENCY_VERSION = '1.0.0'

/** Fixed assumptions, exported so docs/tests can quote them. */
export const EFFICIENCY_ASSUMPTIONS = {
  taskTokens: 600,
  perSkillTokens: 320,
  stageOverheadTokens: 120,
  reviewTokens: 200,
  escalationTokens: 400,
  contextWindowTokens: 128000,
}

const ALLOWED_PATTERNS = new Set(['sequential', 'parallel', 'review-gate', 'escalation'])

function stageCountOf(plan) {
  if (Array.isArray(plan?.stages)) return plan.stages.length
  if (Array.isArray(plan)) return plan.length
  return 0
}

function skillNamesOf(plan) {
  const names = []
  const push = (name) => {
    if (name && typeof name === 'string' && !names.includes(name)) names.push(name)
  }
  if (Array.isArray(plan?.selected)) for (const item of plan.selected) push(typeof item === 'string' ? item : item?.name)
  if (Array.isArray(plan?.stages)) {
    for (const stage of plan.stages) {
      for (const skill of stage?.skills || []) push(typeof skill === 'string' ? skill : skill?.name)
    }
  }
  return names
}

/**
 * Estimate plan cost. Accepts either a composed plan or `{plan, baselineSkills}`.
 * @param {object} plan
 * @returns {{method:'estimate', steps:object, tokens:object, contextCost:object,
 *   confidence:'low', assumptions:string[], notes:string[], tokenSavingPct?:number}}
 */
export function efficiencyEstimate(plan) {
  const target = plan && plan.plan && typeof plan.plan === 'object' && !Array.isArray(plan.stages) ? plan.plan : plan
  const stages = stageCountOf(target)
  const skills = skillNamesOf(target)
  const missing = Array.isArray(target?.missing) ? target.missing.length : 0
  const reviewStages = Array.isArray(target?.stages)
    ? target.stages.filter((stage) => stage && (stage.role === 'review' || stage.role === 'review-gate')).length
    : 0
  const pattern = typeof target?.pattern === 'string' && ALLOWED_PATTERNS.has(target.pattern) ? target.pattern : 'sequential'
  const baselineSkills = Number(plan && plan.baselineSkills)
  const assumptions = EFFICIENCY_ASSUMPTIONS

  const steps = {
    planning: 1,
    compose: skills.length ? 1 : 0,
    execute: stages,
    review: reviewStages,
    escalation: missing * 2,
    verify: stages > 0 ? 1 : 0,
    total:
      1 +
      (skills.length ? 1 : 0) +
      stages +
      reviewStages +
      missing * 2 +
      (stages > 0 ? 1 : 0),
  }

  const tokens = {
    task: assumptions.taskTokens,
    skills: skills.length * assumptions.perSkillTokens,
    stageOverhead: stages * assumptions.stageOverheadTokens,
    review: reviewStages * assumptions.reviewTokens,
    escalation: missing * assumptions.escalationTokens,
    total:
      assumptions.taskTokens +
      skills.length * assumptions.perSkillTokens +
      stages * assumptions.stageOverheadTokens +
      reviewStages * assumptions.reviewTokens +
      missing * assumptions.escalationTokens,
  }

  const contextCost = {
    skills: skills.length,
    stages,
    missing,
    estimatedTokens: tokens.total,
    shareOfAssumedContext:
      assumptions.contextWindowTokens > 0
        ? Math.round((tokens.total / assumptions.contextWindowTokens) * 1000) / 10
        : null,
    contextWindowTokens: assumptions.contextWindowTokens,
  }

  const result = {
    method: EFFICIENCY_METHOD,
    version: EFFICIENCY_VERSION,
    pattern,
    steps,
    tokens,
    contextCost,
    confidence: 'low',
    assumptions: [
      '任务文本按 ' + assumptions.taskTokens + ' tokens 估算',
      '每个技能按 ' + assumptions.perSkillTokens + ' tokens（仅摘要/说明，不含完整执行输出）估算',
      '每个阶段固定 ' + assumptions.stageOverheadTokens + ' tokens 编排开销',
      '上下文窗口按 ' + assumptions.contextWindowTokens + ' tokens 归一，仅作相对比较',
      '未实测调用耗时/真实 token；数字是估算，不是测量结果',
    ],
    notes: [],
  }

  if (Number.isFinite(baselineSkills) && baselineSkills > 0 && skills.length > 0 && baselineSkills > skills.length) {
    const pct = Math.round((1 - skills.length / baselineSkills) * 1000) / 10
    result.tokenSavingPct = Math.max(0, Math.min(50, pct))
    result.tokenSavingBasis =
      '相对「全量加载 ' + baselineSkills + ' 个已安装技能摘要」的上下文占用比例；caps 60%，仅上下文口径'
  } else {
    result.notes.push('未提供 baselineSkills，无法给出上下文节省比例（不臆造百分比）。')
  }

  if (missing > 0) {
    result.notes.push('存在 ' + missing + ' 项能力缺口，实际工具步数会因安装/人工补位而增加。')
  }
  if (skills.length === 0) {
    result.notes.push('没有选中任何技能，估算仅包含规划开销。')
  }
  return result
}
