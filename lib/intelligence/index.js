/**
 * Skill Intelligence Engine — public entry point (v5.0.0).
 *
 * Contract: docs/intelligence-architecture.md.
 * ESM, Node 20+, zero dependencies, local-only, deterministic, no network.
 *
 * Consumers (Host `index.js`, MCP `mcp/server.mjs`, DSH tools) should import
 * from this file only:
 *
 *   import {
 *     DOMAINS, buildCapabilityIndex, capabilityProfile,
 *     decomposeTask, composeSkillPlan, draftSkill, efficiencyEstimate,
 *   } from './lib/intelligence/index.js'
 *
 * `draftSkill` is synchronous; it loads `lib/security.js` once at module init
 * (tolerant dynamic import) and reports `safety.available: false` when the
 * scanner is not installed yet.
 */

export {
  ENGINE_VERSION,
  DOMAINS,
  DOMAIN_IDS,
  DOMAIN_BY_ID,
  CATEGORY_TO_DOMAIN,
  CAPABILITIES,
  CAPABILITY_IDS,
  CAPABILITY_BY_ID,
  INTENTS,
  INTENT_BY_ID,
  DELIVERABLES,
  DELIVERABLE_ORDER,
  capabilityLabel,
  clamp,
  detectDeliverables,
  detectLanguage,
  domainLabel,
  hasKeyword,
  intentLabel,
  matchKeywords,
  normalizeCapability,
  normalizeDomain,
  normalizeText,
  round,
  scoreDomains,
  slugify,
  sortedUnique,
  splitClauses,
  truncate,
} from './taxonomy.js'

export {
  buildCapabilityIndex,
  capabilityIndexFor,
  capabilityMeta,
  capabilityProfile,
  cloneProfile,
  deliverableCapabilities,
  normalizeDomains,
  profileFromIndex,
} from './capability.js'

export {
  DECOMPOSE_VERSION,
  decomposeTask,
  describeDecomposition,
  domainDescription,
  capabilityDescription,
  intentDescription,
} from './decompose.js'

export { COMPOSE_VERSION, PATTERNS, composeSkillPlan } from './compose.js'

export {
  DRAFT_VERSION,
  draftSkill,
  findSimilarNames,
  lintSkillText,
  profileDraft,
  securityStatus,
} from './draft.js'

export {
  EFFICIENCY_ASSUMPTIONS,
  EFFICIENCY_METHOD,
  EFFICIENCY_VERSION,
  efficiencyEstimate,
} from './efficiency.js'
