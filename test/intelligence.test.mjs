/**
 * Intelligence engine contract tests (v5.0.0).
 *
 * Covers: 12-domain taxonomy, capability profiling (incl. cross-domain
 * filtering), capability index generation, task decomposition, skill
 * composition (patterns/conflicts/missing/experience), draft SKILL.md
 * (lint + tolerant security scan), efficiency estimation, determinism,
 * offline-only behaviour and the generated library/capability-index.json.
 *
 * Run: node --test test/intelligence.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  DOMAINS,
  DOMAIN_IDS,
  CAPABILITIES,
  CAPABILITY_IDS,
  INTENT_BY_ID,
  DELIVERABLES,
  PATTERNS,
  buildCapabilityIndex,
  capabilityIndexFor,
  capabilityProfile,
  decomposeTask,
  composeSkillPlan,
  draftSkill,
  efficiencyEstimate,
  findSimilarNames,
  lintSkillText,
  normalizeCapability,
  normalizeDomain,
  securityStatus,
} from '../lib/intelligence/index.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const evalSkills = JSON.parse(fs.readFileSync(path.join(root, 'test/fixtures/eval-skills.json'), 'utf8'))
const byName = (name) => evalSkills.find((skill) => skill.name === name)

const CROSS_TASK =
  '帮我把这份 docx 合同逐条核对一遍，金额和日期别漏；另外配一段 30 秒视频，要转场、片头、背景音乐和配音，两个都今天要。'
const EXPECTED_DOMAINS = [
  'video',
  'office',
  'engineering',
  'data',
  'research',
  'marketing',
  'design',
  'security',
  'education',
  'business',
  'productivity',
  'ai',
]

// ---------------------------------------------------------------------------
// taxonomy
// ---------------------------------------------------------------------------

test('taxonomy exposes exactly the 12 contract domains with stable ids', () => {
  assert.equal(DOMAINS.length, 12)
  assert.deepEqual([...DOMAIN_IDS].sort(), [...EXPECTED_DOMAINS].sort())
  for (const domain of DOMAINS) {
    assert.match(domain.id, /^[a-z][a-z0-9-]*$/)
    assert.ok(domain.zh && domain.en, 'domain must have bilingual labels: ' + domain.id)
    assert.ok(Array.isArray(domain.keywords) && domain.keywords.length >= 5, 'domain needs keywords: ' + domain.id)
  }
})

test('capability vocabulary is non-trivial and stays inside declared domains', () => {
  assert.ok(CAPABILITIES.length >= 40, 'expected >= 40 capabilities, got ' + CAPABILITIES.length)
  const ids = new Set()
  for (const capability of CAPABILITIES) {
    assert.ok(!ids.has(capability.id), 'duplicate capability id: ' + capability.id)
    ids.add(capability.id)
    assert.ok(DOMAIN_IDS.includes(capability.domain), 'invalid domain for capability: ' + capability.id)
    assert.ok(capability.keywords.length >= 2, 'capability without keywords: ' + capability.id)
  }
})

test('normalizeDomain / normalizeCapability accept aliases', () => {
  assert.equal(normalizeDomain('coding'), 'engineering')
  assert.equal(normalizeDomain('software-engineering'), 'engineering')
  assert.equal(normalizeDomain('video-creative'), 'video')
  assert.equal(normalizeDomain('nope'), null)
  assert.equal(normalizeCapability('docx'), 'document-write')
  assert.equal(normalizeCapability('code-gen'), 'code-generation')
  assert.equal(normalizeCapability('data-viz'), 'data-visualization')
  assert.equal(normalizeCapability('nope'), null)
})

// ---------------------------------------------------------------------------
// capabilityProfile
// ---------------------------------------------------------------------------

test('capabilityProfile extracts domain/capabilities/artifacts for an Office skill', () => {
  const profile = capabilityProfile(byName('office-docx'))
  assert.equal(profile.primaryDomain, 'office')
  assert.equal(profile.unknown, false)
  assert.ok(profile.capabilities.includes('document-write'))
  assert.ok(profile.capabilities.includes('document-read'))
  assert.ok(profile.capabilities.includes('document-edit'))
  assert.ok(profile.outputs.includes('docx'), 'docx must be an output of office-docx')
  assert.ok(profile.confidence > 0.5)
  assert.ok(profile.domains.length >= 1)
})

test('capabilityProfile keeps business-shared capabilities across domains (contract-review on office-docx)', () => {
  const profile = capabilityProfile(byName('office-docx'))
  assert.ok(profile.capabilities.includes('contract-review'), 'business capabilities may cross domains')
})

test('capabilityProfile drops cross-domain capabilities for video skills (lead fix)', () => {
  const hyperframes = capabilityProfile(byName('hyperframes'))
  assert.equal(hyperframes.primaryDomain, 'video')
  assert.ok(hyperframes.capabilities.includes('video-rendering'))
  assert.ok(!hyperframes.capabilities.includes('document-edit'), 'video skill must not claim office document-edit')

  const beat = capabilityProfile(byName('beat-promo-director'))
  assert.equal(beat.primaryDomain, 'video')
  assert.ok(beat.capabilities.includes('storyboard'))
  assert.ok(!beat.capabilities.includes('layout-review'), 'video skill must not claim office layout-review')
  assert.ok(!beat.capabilities.includes('visual-design'), 'video skill must not claim design visual-design')
})

test('capabilityProfile marks low-evidence entries as unknown instead of guessing', () => {
  const profile = capabilityProfile({ name: 'zzz-unknown-thing', description: '' })
  assert.equal(profile.primaryDomain, 'unknown')
  assert.equal(profile.unknown, true)
  assert.deepEqual(profile.domains, [])
  assert.deepEqual(profile.capabilities, [])
  assert.ok(profile.confidence <= 0.3)
})

test('capabilityProfile is deterministic and tolerates malformed input', () => {
  assert.deepEqual(capabilityProfile(byName('office-render')), capabilityProfile(byName('office-render')))
  const empty = capabilityProfile(null)
  assert.equal(empty.unknown, true)
  assert.equal(empty.confidence, 0)
  assert.deepEqual(capabilityProfile({ name: 'only-name' }).capabilities, [])
})

test('capabilityProfile does not invent inputs/outputs without artifact mentions', () => {
  const profile = capabilityProfile({ name: 'concept-explainer', description: '解释概念并给出类比', category: 'education' })
  assert.deepEqual(profile.inputs, [])
  assert.deepEqual(profile.outputs, [])
})

// ---------------------------------------------------------------------------
// buildCapabilityIndex
// ---------------------------------------------------------------------------

test('buildCapabilityIndex returns the documented v1 shape and domain counts', () => {
  const index = buildCapabilityIndex(evalSkills, { generatedAt: '2026-01-01T00:00:00.000Z' })
  assert.equal(index.version, 1)
  assert.equal(index.generatedAt, '2026-01-01T00:00:00.000Z')
  assert.equal(index.total, evalSkills.length)
  assert.equal(Object.keys(index.skills).length, evalSkills.length)
  assert.equal(typeof index.unknown, 'number')
  const known = Object.values(index.domains).reduce((sum, entry) => sum + entry.count, 0)
  assert.equal(known + index.unknown, index.total)
  for (const id of DOMAIN_IDS) assert.ok(index.domains[id], 'missing domain bucket: ' + id)
})

test('buildCapabilityIndex merges duplicate names preferring duplicateRank 0', () => {
  const entries = [
    { name: 'dup-skill', description: '生成 docx 文档报告', category: 'office', duplicateRank: 3, quality: 30 },
    { name: 'dup-skill', description: '生成 docx 文档报告', category: 'office', duplicateRank: 0, quality: 80 },
    { name: 'other-skill', description: 'video', category: 'video' },
  ]
  const index = buildCapabilityIndex(entries, { generatedAt: '2026-01-01T00:00:00.000Z' })
  assert.equal(index.total, 2)
  assert.equal(index.duplicateNamesMerged, 1)
  assert.equal(index.skills['dup-skill'].confidence, capabilityProfile(entries[1]).confidence)
})

test('buildCapabilityIndex is deterministic when generatedAt is supplied', () => {
  const a = buildCapabilityIndex(evalSkills, { generatedAt: '2026-01-01T00:00:00.000Z' })
  const b = buildCapabilityIndex(evalSkills, { generatedAt: '2026-01-01T00:00:00.000Z' })
  assert.deepEqual(a, b)
})

test('capabilityIndexFor memoizes per entries array', () => {
  const entries = evalSkills.slice(0, 4)
  const first = capabilityIndexFor(entries)
  const second = capabilityIndexFor(entries)
  assert.equal(first, second, 'memoized index should be the same object')
})

// ---------------------------------------------------------------------------
// decomposeTask
// ---------------------------------------------------------------------------

test('decomposeTask identifies docx contract review as primary for the cross task', () => {
  const result = decomposeTask({ task: CROSS_TASK })
  assert.equal(result.primaryIntent, 'contract-review')
  assert.ok(result.secondaryIntents.includes('video-create'), 'video-create must be a secondary intent')
  assert.deepEqual(result.deliverables.map((deliverable) => deliverable.id), ['docx', 'mp4'])
  assert.ok(result.domains.includes('office'))
  assert.ok(result.domains.includes('video'))
  assert.ok(result.capabilities.includes('contract-review'))
  assert.ok(result.capabilities.includes('video-rendering'))
  assert.ok(result.confidence >= 0.6)
  assert.ok(result.subTasks.length >= 3)
})

test('decomposeTask extracts constraints (duration 30s, deadline today, format docx)', () => {
  const result = decomposeTask({ task: CROSS_TASK })
  const types = result.constraints.map((constraint) => constraint.type)
  assert.ok(types.includes('duration'))
  assert.ok(types.includes('deadline'))
  assert.ok(types.includes('format'))
  const duration = result.constraints.find((constraint) => constraint.type === 'duration')
  assert.match(duration.value, /30/)
  assert.ok(result.assumptions.length >= 1)
})

test('decomposeTask handles a single-intent video request', () => {
  const result = decomposeTask({ task: '做一条 30 秒卡点宣传片，带 BGM 和字幕' })
  assert.equal(result.primaryIntent, 'video-create')
  assert.deepEqual(result.deliverables.map((deliverable) => deliverable.id), ['mp4'])
  assert.ok(result.capabilities.includes('video-rendering'))
  assert.ok(result.capabilities.includes('captions'))
  assert.equal(result.domains[0], 'video')
})

test('decomposeTask handles English tasks and English deliverables', () => {
  const result = decomposeTask({ task: 'Create a 30-second promo video with captions and music for launch.' })
  assert.equal(result.primaryIntent, 'video-create')
  assert.deepEqual(result.deliverables.map((deliverable) => deliverable.id), ['mp4'])
  assert.ok(result.domains.includes('video'))
})

test('decomposeTask keeps a research → document sequence with explicit secondary intent', () => {
  const result = decomposeTask({ task: '先查资料调研一下竞品定价，然后写成一份 docx 报告' })
  assert.ok(['research', 'document-create'].includes(result.primaryIntent))
  assert.ok(result.secondaryIntents.length >= 1, 'sequential tasks must expose a secondary intent')
  assert.ok(result.deliverables.some((deliverable) => deliverable.id === 'docx'))
})

test('decomposeTask returns an honest empty result for empty input', () => {
  const result = decomposeTask({ task: '   ' })
  assert.equal(result.confidence, 0)
  assert.deepEqual(result.capabilities, [])
  assert.deepEqual(result.deliverables, [])
  assert.equal(result.subTasks.length, 0)
  assert.ok(result.assumptions.length >= 1)
})

test('decomposeTask does not invent deliverables for conversational tasks', () => {
  const result = decomposeTask({ task: '帮我想想这个方向靠不靠谱，随便聊聊' })
  assert.deepEqual(result.deliverables, [])
  assert.ok(result.assumptions.some((assumption) => assumption.includes('交付物')))
  assert.equal(result.confidence < 0.6, true)
})

test('decomposeTask is deterministic', () => {
  assert.deepEqual(decomposeTask({ task: CROSS_TASK }), decomposeTask({ task: CROSS_TASK }))
})

test('decomposeTask declares only known capability and domain ids', () => {
  const result = decomposeTask({ task: CROSS_TASK })
  for (const capability of result.capabilities) assert.ok(CAPABILITY_IDS.includes(capability))
  for (const domain of result.domains) assert.ok(DOMAIN_IDS.includes(domain))
  for (const deliverable of result.deliverables) assert.ok(DELIVERABLES[deliverable.id])
  assert.ok(INTENT_BY_ID.has(result.primaryIntent))
})

// ---------------------------------------------------------------------------
// composeSkillPlan
// ---------------------------------------------------------------------------

test('composeSkillPlan composes the cross task with the contract stage free of video skills', () => {
  const plan = composeSkillPlan({ task: CROSS_TASK, installedSkills: evalSkills, libraryEntries: [], maxSkills: 5 })
  assert.equal(plan.ok, true)
  assert.equal(plan.pattern, 'review-gate')
  const names = plan.selected.map((skill) => skill.name)
  assert.ok(names.includes('office-docx'), 'office-docx must be selected')
  assert.ok(plan.selected.length >= 2 && plan.selected.length <= 5, 'plan must use 2-5 skills')
  assert.ok(plan.coverage.ratio >= 0.8)

  const primaryStage = plan.stages.find((stage) => stage.role === 'produce-primary')
  assert.ok(primaryStage, 'missing primary stage')
  const primaryNames = primaryStage.skills.map((skill) => skill.name)
  assert.ok(primaryNames.includes('office-docx'))
  assert.ok(!primaryNames.includes('hyperframes'), 'hyperframes must not be in the contract stage')
  assert.ok(!primaryNames.includes('beat-promo-director'), 'video skill must not be in the contract stage')

  const videoStage = plan.stages.find((stage) => stage.intent === 'video-create')
  assert.ok(videoStage, 'missing video stage')
  const videoNames = videoStage.skills.map((skill) => skill.name)
  assert.ok(videoNames.includes('hyperframes'))
  assert.ok(videoNames.includes('beat-promo-director'))
  assert.ok(!videoNames.includes('office-docx'), 'contract skill must not be in the video stage')

  const review = plan.stages.find((stage) => stage.role === 'review')
  assert.ok(review, 'review-gate plans need a review stage')
  assert.ok(!review.skills.some((skill) => ['hyperframes', 'beat-promo-director'].includes(skill.name)))
})

test('composeSkillPlan every stage exposes the contract fields', () => {
  const plan = composeSkillPlan({ task: CROSS_TASK, installedSkills: evalSkills, libraryEntries: [] })
  assert.ok(PATTERNS.includes(plan.pattern))
  for (const stage of plan.stages) {
    for (const field of ['role', 'skills', 'input', 'output', 'handoff', 'fallback']) {
      assert.ok(stage[field] !== undefined, 'stage missing field: ' + field)
    }
    for (const skill of stage.skills) {
      assert.equal(typeof skill.name, 'string')
      assert.equal(typeof skill.why, 'string')
      assert.ok(skill.why.length > 0)
    }
  }
})

test('composeSkillPlan reports missing capabilities with draftNeeded when no skill exists', () => {
  const plan = composeSkillPlan({
    task: '帮我把这份 docx 合同逐条核对一遍，金额和日期别漏；另外配一段 30 秒视频，要转场、片头、背景音乐和配音，两个都今天要。',
    installedSkills: evalSkills.slice(0, 1), // hyperframes only
    libraryEntries: [],
  })
  // `ok` means a structurally valid plan exists; `ready` is false while gaps remain.
  assert.equal(plan.ok, true)
  assert.equal(plan.ready, false)
  assert.equal(plan.pattern, 'escalation')
  assert.ok(plan.missing.length >= 1)
  for (const item of plan.missing) {
    assert.equal(item.draftNeeded, true)
    assert.equal(typeof item.capability, 'string')
    assert.ok(Array.isArray(item.suggestedLibrarySkills))
  }
  assert.ok(plan.stages.some((stage) => stage.role === 'escalate'))
})

test('composeSkillPlan suggests real library skills for missing capabilities', () => {
  const library = [
    {
      name: 'video-subtitle-pro',
      description: '为视频自动生成字幕 caption subtitle',
      category: 'video',
      quality: 66,
      rating: 4,
      stars: 1200,
      trust: 'official',
    },
  ]
  const plan = composeSkillPlan({
    task: '做一条 30 秒卡点宣传片，带 BGM 和字幕',
    installedSkills: [byName('beat-promo-director')],
    libraryEntries: library,
  })
  const captions = plan.missing.find((item) => item.capability === 'captions')
  if (captions) {
    assert.ok(captions.suggestedLibrarySkills.includes('video-subtitle-pro'))
  } else {
    // If the library skill was selected instead, it must be flagged uninstalled.
    const selected = plan.selected.find((skill) => skill.name === 'video-subtitle-pro')
    assert.ok(selected && selected.installed === false)
  }
})

test('composeSkillPlan emits overlap conflicts without duplicate pairs', () => {
  const plan = composeSkillPlan({ task: CROSS_TASK, installedSkills: evalSkills, libraryEntries: [] })
  const overlaps = plan.conflicts.filter((conflict) => conflict.type === 'overlap')
  assert.ok(overlaps.length >= 1, 'expected at least one overlap conflict')
  const seen = new Set()
  for (const conflict of overlaps) {
    assert.equal(conflict.skills.length, 2)
    const key = conflict.skills.slice().sort().join('|')
    assert.ok(!seen.has(key), 'duplicate conflict pair: ' + key)
    seen.add(key)
    for (const name of conflict.skills) {
      assert.ok(plan.selected.some((skill) => skill.name === name))
    }
    assert.ok(conflict.reason)
  }
})

test('composeSkillPlan selects the parallel pattern for two independent deliverables', () => {
  const designSkill = {
    name: 'poster-design',
    description: '生成海报视觉设计与配色方案',
    whenToUse: '需要设计海报时使用',
    category: 'design',
  }
  const plan = composeSkillPlan({
    task: '做一份周报 docx，同时做一张海报 png，两个都要',
    installedSkills: [...evalSkills, designSkill],
    libraryEntries: [],
  })
  assert.equal(plan.pattern, 'parallel')
  assert.ok(plan.selected.some((skill) => skill.name === 'poster-design'))
  assert.ok(plan.stages.length >= 2)
})

test('composeSkillPlan selects the sequential pattern for explicit ordering', () => {
  const plan = composeSkillPlan({
    task: '先帮我写一份 docx 报告，然后再转成 pdf',
    installedSkills: evalSkills,
    libraryEntries: [],
  })
  assert.equal(plan.pattern, 'sequential')
})

test('composeSkillPlan respects maxSkills (2-5) and installed preference', () => {
  const plan = composeSkillPlan({
    task: CROSS_TASK,
    installedSkills: evalSkills,
    libraryEntries: [],
    maxSkills: 99,
  })
  assert.ok(plan.selected.length <= 5)
  assert.ok(plan.selected.length >= 2)
  assert.ok(plan.selected.every((skill) => typeof skill.installed === 'boolean'))
})

test('composeSkillPlan lets experience data reorder equally capable skills', () => {
  const candidates = [
    { name: 'alpha-docx', description: '创建 docx 文档报告', category: 'office' },
    { name: 'beta-docx', description: '创建 docx 文档报告', category: 'office' },
  ]
  const plain = composeSkillPlan({ task: '帮我写一份 docx 报告', installedSkills: candidates, libraryEntries: [] })
  const tuned = composeSkillPlan({
    task: '帮我写一份 docx 报告',
    installedSkills: candidates,
    libraryEntries: [],
    experience: { skills: { 'beta-docx': { uses: 20, successes: 19 } } },
  })
  assert.equal(plain.selected[0].name, 'alpha-docx')
  assert.equal(tuned.selected[0].name, 'beta-docx')
})

test('composeSkillPlan handles empty input and empty candidates safely', () => {
  const empty = composeSkillPlan({})
  assert.equal(empty.ok, false)
  assert.ok(PATTERNS.includes(empty.pattern))
  const noSkills = composeSkillPlan({ task: '做一份财务分析报告 xlsx', installedSkills: [], libraryEntries: [] })
  assert.equal(noSkills.ok, false)
  assert.equal(noSkills.pattern, 'escalation')
  assert.ok(noSkills.missing.length >= 1)
})

test('composeSkillPlan is deterministic and JSON-serializable', () => {
  const a = composeSkillPlan({ task: CROSS_TASK, installedSkills: evalSkills, libraryEntries: [] })
  const b = composeSkillPlan({ task: CROSS_TASK, installedSkills: evalSkills, libraryEntries: [] })
  assert.deepEqual(a, b)
  assert.equal(JSON.parse(JSON.stringify(a)).pattern, a.pattern)
})

test('composeSkillPlan carries efficiency estimates with method=estimate', () => {
  const plan = composeSkillPlan({ task: CROSS_TASK, installedSkills: evalSkills, libraryEntries: [] })
  const estimate = plan.estimates.efficiency
  assert.equal(estimate.method, 'estimate')
  assert.equal(estimate.confidence, 'low')
  assert.ok(estimate.steps.total >= 1)
  assert.ok(estimate.tokens.total > 0)
  assert.equal(typeof estimate.contextCost.skills, 'number')
  assert.ok(estimate.assumptions.some((line) => line.includes('未实测')))
})

// ---------------------------------------------------------------------------
// efficiencyEstimate
// ---------------------------------------------------------------------------

test('efficiencyEstimate is honest: no tokenSavingPct without a baseline', () => {
  const estimate = efficiencyEstimate({ stages: [{ role: 'produce-primary', skills: [{ name: 'a' }] }], missing: [] })
  assert.equal(estimate.method, 'estimate')
  assert.equal(estimate.tokenSavingPct, undefined)
  assert.ok(estimate.notes.some((note) => note.includes('baseline')))
})

test('efficiencyEstimate caps tokenSavingPct when a baseline is provided', () => {
  const estimate = efficiencyEstimate({
    plan: { stages: [{ role: 'produce-primary', skills: [{ name: 'a' }, { name: 'b' }] }], missing: [] },
    baselineSkills: 10,
  })
  assert.equal(typeof estimate.tokenSavingPct, 'number')
  assert.ok(estimate.tokenSavingPct > 0 && estimate.tokenSavingPct <= 50)
  assert.ok(estimate.tokenSavingBasis.includes('上下文'))
})

// ---------------------------------------------------------------------------
// draftSkill / lint
// ---------------------------------------------------------------------------

test('draftSkill generates a complete SKILL.md draft without writing or executing', () => {
  const draft = draftSkill({ task: CROSS_TASK, existingNames: ['office-docx'] })
  assert.equal(draft.ok, true)
  assert.equal(draft.written, false)
  assert.equal(draft.executed, false)
  assert.match(draft.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  assert.ok(draft.content.startsWith('---\n'))
  assert.ok(draft.content.includes('name: ' + draft.name))
  for (const section of ['## 何时使用', '## 输入', '## 输出', '## 步骤', '## 质量检查', '## 失败处理', '## 示例']) {
    assert.ok(draft.content.includes(section), 'missing section: ' + section)
  }
  assert.ok(draft.description.length >= 20 && draft.description.length <= 200)
  assert.ok(Array.isArray(draft.evalCases) && draft.evalCases.length >= 2)
  assert.equal(draft.lint.ok, true)
  assert.ok(draft.similarNames.length >= 0)
})

test('draftSkill uses the first missing capability and avoids duplicate names', () => {
  const plan = composeSkillPlan({
    task: '帮我把这份 docx 合同逐条核对，金额和日期别漏，另外配一段 30 秒视频要字幕',
    installedSkills: [byName('office-docx'), byName('hyperframes')],
    libraryEntries: [],
  })
  const draft = draftSkill({
    task: '帮我把这份 docx 合同逐条核对，金额和日期别漏，另外配一段 30 秒视频要字幕',
    plan,
    missing: plan.missing,
    existingNames: ['video-captions'],
  })
  assert.ok(plan.missing.length >= 1)
  assert.equal(draft.capability, plan.missing[0].capability)
  if (draft.name === 'video-captions') assert.ok(false, 'draft name must not collide with existing names')
  assert.ok(draft.evalCases.every((evalCase) => Array.isArray(evalCase.expectedCapabilities)))
})

test('draftSkill reports security scan availability honestly', () => {
  const draft = draftSkill({ task: '做一条 30 秒宣传片' })
  assert.ok(draft.safety && typeof draft.safety === 'object')
  assert.equal(typeof draft.safety.available, 'boolean')
  assert.ok(Array.isArray(draft.safety.findings))
  if (!draft.safety.available) {
    assert.ok(draft.safety.note.includes('安全') || draft.safety.note.includes('security'))
    assert.equal(draft.safety.level, 'unknown')
  } else {
    assert.ok(['low', 'medium', 'high', 'unknown'].includes(draft.safety.level))
  }
  const status = securityStatus()
  assert.equal(typeof status.available, 'boolean')
})

test('lintSkillText rejects invalid frontmatter, short description and missing sections', () => {
  const result = lintSkillText('---\nname: Bad_Name\ndescription: "x"\n---\n', {
    name: 'Bad_Name',
    description: 'x',
    whenToUse: '',
  })
  assert.equal(result.ok, false)
  const codes = result.issues.map((issue) => issue.code)
  assert.ok(codes.includes('name-invalid'))
  assert.ok(codes.includes('description-too-short'))
  assert.ok(codes.includes('section-missing'))
})

test('findSimilarNames detects near-duplicate skill names', () => {
  const similar = findSimilarNames('office-contract-review', ['office-contract-check', 'video-captions'])
  assert.ok(similar.length >= 1)
  assert.equal(similar[0].name, 'office-contract-check')
  assert.ok(similar[0].similarity >= 0.72)
  assert.deepEqual(findSimilarNames('video-captions', ['video-captions']), [])
})

// ---------------------------------------------------------------------------
// generated artifact + offline guarantees
// ---------------------------------------------------------------------------

test('library/capability-index.json is a valid generated v1 index', () => {
  const indexPath = path.join(root, 'library/capability-index.json')
  assert.ok(fs.existsSync(indexPath), 'capability-index.json must be generated')
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  assert.equal(index.version, 1)
  assert.equal(typeof index.generatedAt, 'string')
  assert.equal(index.engineVersion, '5.0.0')
  assert.ok(index.total > 1000, 'expected a full-library index')
  assert.equal(Object.keys(index.skills).length, index.total)
  const known = Object.values(index.domains).reduce((sum, entry) => sum + entry.count, 0)
  assert.equal(known + index.unknown, index.total)
  const names = Object.keys(index.skills).slice(0, 200)
  for (const name of names) {
    const profile = index.skills[name]
    assert.ok(profile.primaryDomain === 'unknown' || DOMAIN_IDS.includes(profile.primaryDomain))
    for (const capability of profile.capabilities) assert.ok(CAPABILITY_IDS.includes(capability))
    assert.ok(profile.confidence >= 0 && profile.confidence <= 1)
  }
})

test('generated index matches fresh profiling of the source library entries', () => {
  const indexPath = path.join(root, 'library/capability-index.json')
  const sourcePath = path.join(root, 'library/skills-index.json')
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  const library = JSON.parse(fs.readFileSync(sourcePath, 'utf8'))
  const entries = Array.isArray(library) ? library : library.entries
  let checked = 0
  for (const entry of entries) {
    if (!entry || !entry.name || !index.skills[entry.name]) continue
    const fresh = capabilityProfile(entry)
    assert.deepEqual(index.skills[entry.name], fresh, 'stale capability index for ' + entry.name)
    checked += 1
    if (checked >= 5) break
  }
  assert.ok(checked >= 5, 'expected to cross-check at least 5 entries')
})

test('intelligence modules are offline: no network/process/fs imports', () => {
  const dir = path.join(root, 'lib/intelligence')
  const forbidden = [/node:http/, /node:https/, /node:net\b/, /node:dgram/, /node:child_process/, /require\(/, /\bfetch\s*\(/]
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.js')) continue
    const source = fs.readFileSync(path.join(dir, file), 'utf8')
     assert.ok(!/from ['"]node:fs['"]/.test(source), file + ' must not import node:fs')
    for (const pattern of forbidden) {
      if (pattern.test(source)) {
        // `import('../security.js')` is the only allowed dynamic import.
        assert.ok(file === 'draft.js' && pattern.source.includes('require'), file + ' contains forbidden pattern ' + pattern)
      }
    }
  }
})
