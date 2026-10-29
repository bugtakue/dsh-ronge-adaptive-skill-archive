/**
 * Capability profiling + capability index.
 *
 * `capabilityProfile(entry)` extracts domain / capabilities / inputs / outputs /
 * confidence from one library (or installed-skill) record. Low-evidence records
 * are marked `unknown: true` instead of guessing — no fabricated domains.
 *
 * `buildCapabilityIndex(entries)` is the pure aggregation used to generate
 * `library/capability-index.json`. It accepts an optional `generatedAt` so the
 * output can be byte-for-byte deterministic in tests/CI.
 */

import {
  CAPABILITIES,
  CAPABILITY_BY_ID,
  CATEGORY_TO_DOMAIN,
  DELIVERABLES,
  DELIVERABLE_ORDER,
  DOMAINS,
  DOMAIN_BY_ID,
  DOMAIN_IDS,
  clamp,
  hasKeyword,
  matchKeywords,
  normalizeDomain,
  normalizeText,
  round,
} from './taxonomy.js'

const UNKNOWN_DOMAIN = 'unknown'
const DOMAIN_STOP_THRESHOLD = 1.5
const CAPABILITY_STOP_THRESHOLD = 1
const MAX_DOMAINS = 3
const MAX_CAPABILITIES = 6
/**
 * Capabilities whose domain can legitimately cross the skill's primary domain.
 * `business` (contract review etc.) and `productivity` (planning/automation)
 * are cross-cutting by nature; everything else is dropped when it does not
 * match the profile's primary domain, so a video skill never claims
 * `document-edit` just because its description says "编辑".
 */
const CROSS_DOMAIN_SHARED = new Set(['business', 'productivity'])

const ARTIFACT_TOKENS = [
  { id: 'docx', patterns: [/\bdocx\b/, /\bword\b/, /\.docx\b/, /文档/, /报告/] },
  { id: 'pdf', patterns: [/\bpdf\b/, /\.pdf\b/] },
  { id: 'pptx', patterns: [/\bpptx?\b/, /\.pptx?\b/, /幻灯片/, /演示文稿/] },
  { id: 'xlsx', patterns: [/\bxlsx?\b/, /\.xlsx?\b/, /\bexcel\b/, /表格/, /工作簿/] },
  { id: 'mp4', patterns: [/\bmp4\b/, /\.mp4\b/, /\bmov\b/, /视频/, /宣传片/, /短视频/, /成片/] },
  { id: 'code', patterns: [/\bcode\b/, /\.(?:js|mjs|ts|tsx|py|rs|go|java)\b/, /代码/, /源码/] },
  { id: 'report', patterns: [/\breport\b/, /报告/, /white ?paper/] },
  { id: 'csv', patterns: [/\bcsv\b/, /\.csv\b/] },
  { id: 'png', patterns: [/\bpng\b/, /\bjpe?g\b/, /\bsvg\b/, /图片/, /海报/] },
  { id: 'html', patterns: [/\bhtml\b/, /\.html\b/, /网页/] },
]

const READ_VERBS = /(read|parse|open|load|extract|check|validate|inspect|analy[sz]e|review|audit|读取|解析|打开|核对|检查|审核|分析|校验|提取|验证|阅读)/i
const WRITE_VERBS = /(create|generate|write|author|render|export|convert|build|draft|produce|生成|创建|撰写|起草|制作|渲染|导出|转换|输出|编辑)/i

/** Cheap name-prefix hints for installed skills that carry no category field. */
const NAME_PREFIX_DOMAINS = [
  ['office-', 'office'], ['docx', 'office'], ['pdf-', 'office'], ['pptx', 'office'], ['xlsx', 'office'],
  ['excel', 'office'], ['word', 'office'], ['hyperframes', 'video'], ['beat-', 'video'], ['media-', 'video'],
  ['video', 'video'], ['promo', 'video'], ['moai', 'video'],
  ['design', 'design'], ['figma', 'design'], ['ui-', 'design'], ['image-', 'design'],
  ['cordis', 'engineering'], ['code-', 'engineering'], ['repo-', 'engineering'], ['mcp', 'engineering'],
  ['agent-', 'ai'], ['llm-', 'ai'], ['prompt', 'ai'], ['rag', 'ai'],
  ['data-', 'data'], ['sql', 'data'], ['security', 'security'], ['audit', 'security'],
  ['research', 'research'], ['marketing', 'marketing'], ['teach', 'education'], ['finance', 'business'],
  ['contract', 'business'], ['plan', 'productivity'], ['automation', 'productivity'],
]

/** Build the normalized text bundle used by the profiler. Pure. */
function entryText(entry = {}) {
  const name = normalizeText(entry.name || entry.skillId || '')
  const description = normalizeText(entry.description || entry.desc || '')
  const whenToUse = normalizeText(entry.whenToUse || entry.when_to_use || entry.when || '')
  const intro = normalizeText(entry.intro || '')
  const repo = normalizeText(entry.repo || '')
  const path = normalizeText(entry.path || '')
  const category = normalizeText(entry.category || '')
  const text = [description, whenToUse, intro, path, repo, category].filter(Boolean).join(' ')
  return { name, description, whenToUse, intro, repo, path, category, text }
}

function countHits(haystack, keywords) {
  let hits = 0
  for (const keyword of keywords || []) {
    if (hasKeyword(haystack, keyword)) hits += 1
  }
  return hits
}

function detectArtifacts(text) {
  const inputs = new Set()
  const outputs = new Set()
  if (!text) return { inputs: [], outputs: [] }
  for (const artifact of ARTIFACT_TOKENS) {
    let hit = false
    for (const pattern of artifact.patterns) {
      if (pattern.test(text)) {
        hit = true
        break
      }
    }
    if (!hit) continue
    // Look at the nearest verb context around the artifact token.
    const firstPattern = artifact.patterns.find((pattern) => pattern.test(text))
    const rawMatch = firstPattern ? firstPattern.exec(text) : null
    const at = rawMatch && typeof rawMatch.index === 'number' ? rawMatch.index : -1
    const windowStart = at >= 0 ? Math.max(0, at - 40) : 0
    const windowEnd = at >= 0 ? Math.min(text.length, at + 40) : 0
    const window = at >= 0 ? text.slice(windowStart, windowEnd) : text
    const readHit = READ_VERBS.test(window)
    const writeHit = WRITE_VERBS.test(window)
    if (writeHit && !readHit) outputs.add(artifact.id)
    else if (readHit && !writeHit) inputs.add(artifact.id)
    else if (readHit && writeHit) {
      inputs.add(artifact.id)
      outputs.add(artifact.id)
    } else {
      // Ambiguous: generation-oriented names default to output, else input.
      if (/(create|generate|write|生成|制作|创建|render|渲染)/i.test(text)) outputs.add(artifact.id)
      else inputs.add(artifact.id)
    }
  }
  return {
    inputs: DELIVERABLE_ORDER.filter((id) => inputs.has(id)).concat([...inputs].filter((id) => !DELIVERABLE_ORDER.includes(id)).sort()),
    outputs: DELIVERABLE_ORDER.filter((id) => outputs.has(id)).concat([...outputs].filter((id) => !DELIVERABLE_ORDER.includes(id)).sort()),
  }
}

/**
 * Per-entry capability profile.
 * @param {object} entry library entry or installed-skill record
 * @returns {{name:string, primaryDomain:string, domains:{id:string,score:number}[],
 *   capabilities:string[], inputs:string[], outputs:string[], confidence:number, unknown:boolean}}
 */
export function capabilityProfile(entry) {
  if (!entry || typeof entry !== 'object') {
    return {
      name: '',
      primaryDomain: UNKNOWN_DOMAIN,
      domains: [],
      capabilities: [],
      inputs: [],
      outputs: [],
      confidence: 0,
      unknown: true,
    }
  }
  const fields = entryText(entry)
  const name = String(entry.name || entry.skillId || '').trim()
  const domainScores = new Map()
  const addDomain = (id, score) => {
    if (!DomainExists(id) || score <= 0) return
    domainScores.set(id, (domainScores.get(id) || 0) + score)
  }

  const categoryDomain = CATEGORY_TO_DOMAIN[fields.category] || null
  if (categoryDomain) addDomain(categoryDomain, 2.5)
  for (const [prefix, domainId] of NAME_PREFIX_DOMAINS) {
    if (fields.name === prefix || fields.name.startsWith(prefix)) {
      addDomain(domainId, 1.5)
      break
    }
  }
  if (fields.category === 'writing') {
    addDomain('marketing', 1.2)
    addDomain('research', 0.6)
  }

  for (const domain of DOMAINS) {
    const nameHits = countHits(fields.name, domain.keywords)
    const textHits = countHits(fields.text, domain.keywords)
    if (nameHits) addDomain(domain.id, nameHits * 3)
    if (textHits) addDomain(domain.id, textHits * 1)
    const pathRole = pathFolderDomainRole(fields.path, domain.id)
    if (pathRole) addDomain(domain.id, pathRole)
  }

  const rankedDomains = [...domainScores.entries()]
    .map(([id, score]) => ({ id, score: round(score, 2) }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, MAX_DOMAINS)

  const topScore = rankedDomains.length ? rankedDomains[0].score : 0
  const unknown = topScore < DOMAIN_STOP_THRESHOLD

  const capabilityScores = new Map()
  for (const capability of CAPABILITIES) {
    const nameHits = countHits(fields.name, capability.keywords)
    const textHits = countHits(fields.text, capability.keywords)
    const score = nameHits * 3 + textHits
    if (score > 0) capabilityScores.set(capability.id, score)
  }
  let rankedCapabilities = [...capabilityScores.entries()]
    .filter(([, score]) => score >= CAPABILITY_STOP_THRESHOLD)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  if (!unknown) {
    const primaryDomain = rankedDomains[0].id
    rankedCapabilities = rankedCapabilities.filter(([id]) => {
      const meta = CAPABILITY_BY_ID.get(id)
      if (!meta) return false
      if (meta.domain === primaryDomain) return true
      return CROSS_DOMAIN_SHARED.has(meta.domain)
    })
  }
  const capabilities = rankedCapabilities
    .slice(0, MAX_CAPABILITIES)
    .map(([id]) => id)

  const artifacts = detectArtifacts(fields.text)
  const evidence = textEvidenceWeight(fields)
  const baseConfidence = unknown
    ? clamp(0.12 + evidence * 0.06 + (categoryDomain ? 0.06 : 0), 0.05, 0.3)
    : clamp(
        0.28 + evidence * 0.05 + (categoryDomain ? 0.12 : 0) + Math.min(0.25, topScore * 0.05) + (capabilities.length ? 0.08 : 0),
        0.3,
        0.95,
      )

  return {
    name,
    primaryDomain: unknown ? UNKNOWN_DOMAIN : rankedDomains[0].id,
    domains: unknown ? [] : rankedDomains,
    capabilities,
    inputs: artifacts.inputs,
    outputs: artifacts.outputs,
    confidence: round(baseConfidence, 2),
    unknown,
  }
}

function DomainExists(id) {
  return typeof id === 'string' && DOMAIN_BY_ID.has(id)
}

function pathFolderDomainRole(path, domainId) {
  if (!path) return 0
  const domain = DOMAIN_BY_ID.get(domainId)
  if (!domain) return 0
  // Paths frequently carry a category folder such as skills/(design)/ or /security/.
  const folderPattern = new RegExp('(^|[/\\\\(_ -])' + domainId + '([/\\\\).,_ -]|$)')
  if (folderPattern.test(path)) return 1.5
  const zhHit = domain.keywords.some((keyword) => hasKeyword(path, keyword))
  return zhHit ? 0.5 : 0
}

function textEvidenceWeight(fields) {
  let weight = 0
  if (fields.name) weight += 1
  if (fields.description) weight += Math.min(3, fields.description.length / 80)
  if (fields.whenToUse) weight += 1.5
  if (fields.intro) weight += 0.5
  if (fields.category) weight += 1
  if (fields.path) weight += 0.5
  return weight
}

/** Deterministic JSON-safe clone used by tests to compare profiles. */
export function cloneProfile(profile) {
  return JSON.parse(JSON.stringify(profile))
}

/**
 * Aggregate profiles for the whole library.
 * @param {Array<object>|{entries:Array<object>}} entries
 * @param {{generatedAt?:string, source?:string}} [options]
 */
export function buildCapabilityIndex(entries, options = {}) {
  const list = Array.isArray(entries)
    ? entries
    : entries && Array.isArray(entries.entries)
      ? entries.entries
      : []
  const generatedAt = typeof options.generatedAt === 'string' && options.generatedAt
    ? options.generatedAt
    : new Date().toISOString()
  const skills = {}
  const chosenEntries = new Map()
  const domainCounts = Object.fromEntries(DOMAIN_IDS.map((id) => [id, { count: 0 }]))
  let unknown = 0

  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue
    const name = String(entry.name || '').trim()
    if (!name) continue
    const existing = chosenEntries.get(name)
    if (existing && !preferCandidate(entry, existing)) continue
    chosenEntries.set(name, entry)
    skills[name] = capabilityProfile(entry)
  }
  const total = Object.keys(skills).length

  for (const name of Object.keys(skills)) {
    const profile = skills[name]
    if (profile.primaryDomain === UNKNOWN_DOMAIN) {
      unknown += 1
    } else if (domainCounts[profile.primaryDomain]) {
      domainCounts[profile.primaryDomain].count += 1
    }
  }

  return {
    version: 1,
    generatedAt,
    engineVersion: options.engineVersion || '5.0.0',
    total,
    unknown,
    duplicateNamesMerged: Math.max(0, list.length - total),
    domains: domainCounts,
    skills,
  }
}

const capabilityIndexCache = new WeakMap()

/**
 * Memoized `buildCapabilityIndex` for a stable entries array. Compose/benchmark
 * call this instead of rebuilding 6k profiles on every request.
 */
export function capabilityIndexFor(entries, options = {}) {
  if (!Array.isArray(entries)) return buildCapabilityIndex(entries, options)
  if (options.generatedAt || options.engineVersion) return buildCapabilityIndex(entries, options)
  let cached = capabilityIndexCache.get(entries)
  if (!cached) {
    cached = buildCapabilityIndex(entries, { generatedAt: '1970-01-01T00:00:00.000Z' })
    capabilityIndexCache.set(entries, cached)
  }
  return cached
}

function preferCandidate(entry, existingEntry) {
  const rank = Number(entry.duplicateRank)
  const quality = Number(entry.quality) || 0
  const existingRank = Number(existingEntry?.duplicateRank)
  const existingQuality = Number(existingEntry?.quality) || 0
  if (Number.isFinite(rank) && Number.isFinite(existingRank) && rank !== existingRank) return rank < existingRank
  return quality > existingQuality
}

/** Normalize a domain list to unique contract ids (used by compose/tests). */
export function normalizeDomains(values) {
  const out = []
  for (const value of values || []) {
    const id = normalizeDomain(value)
    if (id && !out.includes(id)) out.push(id)
  }
  return out
}

/** Look up a profile from a capability index, falling back to profiling the entry. */
export function profileFromIndex(index, entry) {
  if (index && index.skills && entry && entry.name && index.skills[entry.name]) return index.skills[entry.name]
  return capabilityProfile(entry)
}

/** Join capabilities required for a list of deliverable ids. */
export function deliverableCapabilities(ids) {
  const out = []
  for (const id of DELIVERABLE_ORDER) {
    if (!ids || !ids.includes(id)) continue
    for (const capability of DELIVERABLES[id].capabilities) {
      if (!out.includes(capability)) out.push(capability)
    }
  }
  return out
}

/** Capability metadata helper (domain / bilingual label). */
export function capabilityMeta(id) {
  return CAPABILITY_BY_ID.get(id) || null
}
