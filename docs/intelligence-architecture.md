# Skill Intelligence Engine — implementation contract (v5.0.0)

All modules are ESM, Node 20+, **zero dependencies**, local/deterministic, no network.
Host (`index.js`), MCP (`mcp/server.mjs`) and DSH tools import the same modules.

## `lib/intelligence/index.js`

```js
export const DOMAINS // 12 domain metadata, stable ids and bilingual labels
export function buildCapabilityIndex(entries) // pure; entries = library entries
// -> { version: 1, generatedAt, skills: { [name]: CapabilityProfile }, domains: {id: {count}} }
export function capabilityProfile(entry) // pure per-entry fallback

export function decomposeTask(input)
// input: { task, cwd?, context?, mode? }
// -> { goal, primaryIntent, secondaryIntents[], deliverables[], constraints[],
//      domains[], subTasks[], assumptions[], confidence }

export function composeSkillPlan(input)
// input: { task, installedSkills[], libraryEntries[], experience?, capabilityIndex?, maxSkills? }
// -> { ok, pattern, stages[{ role, skills[{name, why}], input, output, handoff, fallback }],
//      missing[{ capability, domain, suggestedLibrarySkills[], draftNeeded }],
//      conflicts[], estimates{efficiency...}, assumptions[], confidence }

export function draftSkill(input)
// input: { task, plan, missing, existingNames[] }
// -> { ok, name, description, whenToUse, content, evalCases[], lint{ok,issues}, safety{level,findings} }

export function efficiencyEstimate(plan)
// -> { tokenSavingPct?, steps, contextCost, confidence, method: 'estimate' }
```

## Other shared modules (Host-owned)

- `lib/security.js` → `scanSkillText(text)` (same shape as index.js), severity constants, normalized text.
- `lib/remote.js` → `validateRemoteUrl`, `fetchRemoteSkillText` (proxy/curl, no redirects, 256 KiB, timeout).
- `lib/fsx.js` → atomic writes, skill locks, path containment, backup retention.
- `lib/install.js` → Host + MCP shared safe install transaction.

## HTTP endpoints (Host-owned)

- `POST /dsh-ronge-adaptive-skill-archive/intelligence/plan` `{task,cwd?,mode?}` → decompose + plan compact
- `POST .../intelligence/compose` `{task,cwd?,maxSkills?}` → full plan
- `POST .../intelligence/draft` `{task,plan?,missing?}` → draft only (never writes)
- `GET .../health`, `GET .../version`

## DSH native tools (Host-owned)
`skill_archive_plan`, `skill_archive_compose`, `skill_archive_draft_skill`; no install/force tools.
Client calls HTTP endpoints only; no direct engine import.

## Generated data

- `library/capability-index.json` (intel-core, generated from `library/skills-index.json`)
- `library/domain-packs.json` (domain-eval): 12 domains × 5 held-out cases + playbook.
- `test/fixtures/intelligence-cases.json` (domain-eval): 60 held-out tasks with expected capabilities/domains.
