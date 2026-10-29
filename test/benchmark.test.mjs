import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = path.resolve(import.meta.dirname, '..')
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'))

const packs = read('library/domain-packs.json')
const fixture = read('test/fixtures/intelligence-cases.json')
const installedSkills = read('test/fixtures/eval-skills.json')
const library = read('library/skills-index.json')

const domains = Array.isArray(packs.domains) ? packs.domains : []
const cases = Array.isArray(fixture.cases) ? fixture.cases : []
const libraryNames = new Set(library.entries.map((entry) => entry.name))
const installedNames = new Set(installedSkills.map((skill) => skill.name))
const taxonomy = new Map((packs.capabilityTaxonomy || []).map((item) => [item.id, item]))
const CANONICAL_IDS = [
  'analysis', 'generation', 'transformation', 'extraction', 'retrieval', 'review', 'planning',
  'rendering', 'automation', 'validation', 'presentation', 'research', 'coding', 'design',
  'media', 'document', 'data', 'security', 'orchestration',
]
const script = path.join(root, 'scripts/benchmark.mjs')

const runBenchmark = (args = [], env = {}) =>
  spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout: 180000,
    env: { ...process.env, ...env },
  })

const parseJsonStdout = (result) => {
  try {
    return JSON.parse(result.stdout)
  } catch (error) {
    assert.fail(`benchmark --json stdout is not JSON: ${error.message}\n${result.stdout.slice(0, 800)}\n${result.stderr.slice(0, 800)}`)
  }
}

test('domain packs define 12 domains with playbooks and 5 held-out cases each', () => {
  assert.equal(packs.domainCount, 12)
  assert.equal(packs.caseCount, 60)
  assert.equal(domains.length, 12)
  assert.equal(cases.length >= 60, true)
  for (const id of CANONICAL_IDS) assert.ok(taxonomy.has(id), `capability taxonomy is missing ${id}`)
  assert.ok(taxonomy.size >= CANONICAL_IDS.length)

  for (const domain of domains) {
    assert.ok(domain.id && domain.labelZh && domain.labelEn, `domain needs id/labels: ${domain.id}`)
    const playbook = domain.playbook || {}
    for (const field of ['taskPatterns', 'deliverables', 'qualityChecks', 'pitfalls']) {
      assert.ok(Array.isArray(playbook[field]) && playbook[field].length >= 2, `${domain.id}.playbook.${field} needs >= 2 items`)
    }
    assert.ok(Array.isArray(domain.candidateSkills) && domain.candidateSkills.length >= 6, `${domain.id}: needs >= 6 candidate skills`)
    for (const candidate of domain.candidateSkills) {
      assert.ok(libraryNames.has(candidate.name), `${domain.id}: candidate skill does not exist in library: ${candidate.name}`)
      assert.ok(Array.isArray(candidate.capabilities) && candidate.capabilities.length >= 1, `${domain.id}/${candidate.name}: candidate needs capabilities`)
      for (const capability of candidate.capabilities) {
        assert.ok(taxonomy.has(capability), `${domain.id}/${candidate.name}: unknown capability ${capability}`)
      }
    }
    const ownCases = cases.filter((item) => item.domain === domain.id)
    assert.equal(ownCases.length, 5, `${domain.id}: expected 5 cases, got ${ownCases.length}`)
    assert.deepEqual(domain.heldOutCaseIds, ownCases.map((item) => item.id), `${domain.id}: heldOutCaseIds must match the fixture order`)
  }
})

test('held-out cases carry real skills, canonical capabilities and deliverables', () => {
  assert.equal(cases.length, 60)
  const ids = new Set()
  for (const item of cases) {
    assert.ok(item.id && !ids.has(item.id), `duplicate or missing case id: ${item.id}`)
    ids.add(item.id)
    assert.ok(domains.some((domain) => domain.id === item.domain), `${item.id}: unknown domain ${item.domain}`)
    assert.equal(typeof item.task, 'string')
    assert.ok(item.task.length >= 20, `${item.id}: task is too short`)
    assert.ok(Array.isArray(item.deliverables) && item.deliverables.length >= 1, `${item.id}: deliverables required`)
    assert.equal(typeof item.primaryIntent, 'string')
    assert.ok(item.primaryIntent.length >= 2, `${item.id}: primaryIntent required`)
    assert.ok(Array.isArray(item.expectedCapabilities) && item.expectedCapabilities.length >= 1 && item.expectedCapabilities.length <= 3, `${item.id}: expectedCapabilities must hold 1-3 ids`)
    for (const capability of item.expectedCapabilities) {
      assert.ok(taxonomy.has(capability), `${item.id}: unknown capability ${capability}`)
    }
    assert.ok(Array.isArray(item.expectedSkillHints), `${item.id}: expectedSkillHints must be an array`)
    for (const hint of item.expectedSkillHints) {
      assert.ok(
        libraryNames.has(hint) || installedNames.has(hint),
        `${item.id}: expectedSkillHint must be a real library or installed skill: ${hint}`,
      )
    }
    assert.equal(typeof item.note, 'string')
    assert.ok(item.note.length >= 8, `${item.id}: note must explain the label`)
  }
})

test('benchmark --smoke --json exits 0 and reports metrics or a graceful skip', () => {
  const result = runBenchmark(['--smoke', '--json'])
  assert.equal(result.status, 0, `benchmark failed:\n${result.stdout.slice(0, 1200)}\n${result.stderr.slice(0, 1200)}`)
  const report = parseJsonStdout(result)
  assert.equal(report.schema, 'skill-intelligence-benchmark/v1')
  assert.equal(report.mode, 'smoke')
  assert.ok(['ok', 'skipped'].includes(report.status), `unexpected status: ${report.status}`)
  assert.equal(report.fixtures.cases, 60)
  assert.equal(report.fixtures.domains, 12)
  if (report.status === 'skipped') {
    assert.equal(report.metrics, null)
    assert.ok(report.reason && report.reason.length > 0, 'skipped report needs a reason')
    return
  }
  assert.equal(report.cases.length, 12, 'smoke mode should cover one case per domain')
  for (const key of ['planCoverage', 'compositionValidity', 'capabilityCoverage', 'hintRecall', 'gapDetection']) {
    assert.ok(key in report.metrics, `metrics.${key} missing`)
    if (report.metrics[key] !== null) assert.equal(typeof report.metrics[key], 'number', `metrics.${key} must be a number`)
  }
  assert.ok(report.metrics.contextTokens && typeof report.metrics.contextTokens.p95 === 'number')
  assert.ok(report.metrics.latencyMs && typeof report.metrics.latencyMs.p50 === 'number')
  for (const baseline of ['none', 'random', 'keyword']) {
    assert.ok(report.baselines && report.baselines[baseline], `baseline ${baseline} missing`)
    assert.equal(typeof report.baselines[baseline].planCoverage, 'number')
  }
  assert.ok(report.ceiling && typeof report.ceiling.fullyCoverableRatio === 'number')
})

test('benchmark default smoke output contains human summary and raw JSON', () => {
  const result = runBenchmark(['--smoke'])
  assert.equal(result.status, 0, `benchmark failed:\n${result.stdout.slice(0, 1200)}\n${result.stderr.slice(0, 1200)}`)
  if (/status: skipped/.test(result.stdout)) {
    assert.match(result.stdout, /fixtures: \d+ cases/)
    return
  }
  assert.match(result.stdout, /planCoverage/)
  assert.match(result.stdout, /=== BENCHMARK JSON ===/)
  const jsonText = /=== BENCHMARK JSON ===\n([\s\S]*?)\n=== END BENCHMARK JSON ===/.exec(result.stdout)
  assert.ok(jsonText, 'raw JSON block missing from stdout')
  const report = JSON.parse(jsonText[1])
  assert.equal(report.status, 'ok')
})

test('benchmark --out writes the raw report outside the repo and stays exit 0', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-benchmark-'))
  const target = path.join(dir, 'report.json')
  try {
    const result = runBenchmark(['--smoke', '--out', target])
    assert.equal(result.status, 0, `benchmark failed:\n${result.stdout.slice(0, 1200)}\n${result.stderr.slice(0, 1200)}`)
    assert.ok(fs.existsSync(target), '--out file was not written')
    const report = JSON.parse(fs.readFileSync(target, 'utf8'))
    assert.equal(report.schema, 'skill-intelligence-benchmark/v1')
    assert.ok(['ok', 'skipped'].includes(report.status))
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('benchmark --fail-on-threshold fails only when the engine is available', () => {
  const probe = runBenchmark(['--smoke', '--json'])
  assert.equal(probe.status, 0)
  const probeReport = parseJsonStdout(probe)
  const result = runBenchmark(['--smoke', '--json', '--fail-on-threshold', '--min-plan-coverage=1.01'])
  if (probeReport.status === 'skipped') {
    assert.equal(result.status, 0, 'skipped mode must not hard-fail on thresholds')
    return
  }
  assert.equal(result.status, 1, 'unmet threshold must fail with --fail-on-threshold')
  assert.match(result.stderr, /below configured thresholds/)
})
