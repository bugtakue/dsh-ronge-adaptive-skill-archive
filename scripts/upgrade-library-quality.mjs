#!/usr/bin/env node
/**
 * Add transparent quality signals, dedupe metadata and GitHub repo signals to
 * the bundled library index. Quality is a heuristic: completeness + repo stars /
 * recency / archived / license. It is not a usefulness or security guarantee.
 *
 * Idempotent: safe to re-run after regenerating library/skills-index.json.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FILE = path.join(ROOT, 'library', 'skills-index.json')
const library = JSON.parse(fs.readFileSync(FILE, 'utf8'))
const entries = Array.isArray(library.entries) ? library.entries : []

let repoMetadata = {}
try {
  repoMetadata = JSON.parse(fs.readFileSync(path.join(ROOT, 'library', 'repo-metadata.json'), 'utf8')).repos || {}
} catch {
  repoMetadata = {}
}

const nameCounts = new Map()
const repoCounts = new Map()
for (const entry of entries) {
  nameCounts.set(entry.name, (nameCounts.get(entry.name) || 0) + 1)
  repoCounts.set(entry.repo, (repoCounts.get(entry.repo) || 0) + 1)
}

function canonicalPath(p) {
  return (
    p.startsWith('skills/') ||
    p.includes('/skills/') ||
    p.startsWith('.claude/skills/') ||
    p.includes('/.claude/skills/')
  )
}

// Names that are too generic to be judged from metadata alone.
const GENERIC_NAMES = new Set(['skill', 'skills', '3p', 'heal', 'pr', 'test', 'tests', 'agent', 'tool', 'pdf', 'doc'])

function completenessOf(entry) {
  const description = String(entry.description || '').trim()
  const whenToUse = String(entry.whenToUse || '').trim()
  const name = String(entry.name || '')
  let score = 10
  if (description) score += 25
  if (description.length >= 80) score += 10
  if (description.length >= 160) score += 5
  if (whenToUse) score += 10
  if (canonicalPath(String(entry.path || ''))) score += 8
  if (entry.trust === 'official') score += 4
  const nameCount = nameCounts.get(entry.name) || 1
  score += nameCount === 1 ? 10 : nameCount <= 5 ? 3 : 0
  if (GENERIC_NAMES.has(name)) score -= 20
  if (name.length <= 3 && !GENERIC_NAMES.has(name)) score -= 8
  if (name.split('-').filter((part) => part.length >= 3).length >= 2) score += 4
  score += Math.max(0, Math.min(3, ((Number(entry.rating) || 1) - 2) * 0.8))
  return Math.max(0, Math.min(98, Math.round(score)))
}

function repoScoreFor(entry) {
  const meta = repoMetadata[entry.repo]
  if (!meta || meta.missing) return 15
  const stars = Number(meta.stars || 0)
  // Stars describe the repo, not this particular skill. A repo that only ships
  // one incidental SKILL.md gets much less of the repo signal than a repo that
  // is actually a skill collection.
  const repoSkillCount = repoCounts.get(entry.repo) || 1
  const focus = 0.45 + 0.55 * Math.min(1, repoSkillCount / 3)
  const starScore = Math.min(40, (Math.log10(stars + 1) / 4) * 40) * focus
  let recency = 0
  if (meta.pushedAt) {
    const days = Math.max(0, (Date.now() - Date.parse(meta.pushedAt)) / 86400000)
    recency = (days <= 90 ? 15 : days <= 365 ? 10 : days <= 730 ? 5 : 0) * focus
  }
  let score = starScore + recency + (meta.license ? 3 : 0)
  if (meta.archived) score -= 25
  return Math.max(0, Math.min(60, Math.round(score)))
}

for (const entry of entries) {
  const meta = repoMetadata[entry.repo] || {}
  const completeness = completenessOf(entry)
  const repoScore = repoScoreFor(entry)
  entry.completeness = completeness
  entry.repoScore = repoScore
  entry.quality = Math.max(0, Math.min(99, Math.round(completeness * 0.55 + repoScore * 0.45)))
  entry.qualityLabel = entry.quality >= 60 ? 'high' : entry.quality >= 40 ? 'medium' : 'low'
  entry.duplicateName = nameCounts.get(entry.name) || 1
  entry.repoSkillCount = repoCounts.get(entry.repo) || 1
  if (Number.isFinite(Number(meta.stars))) entry.stars = Number(meta.stars)
  if (meta.pushedAt) entry.pushedAt = meta.pushedAt
  if (meta.archived) entry.archived = true
  if (meta.license) entry.repoLicense = meta.license
}

const bestByName = new Map()
for (const entry of entries) {
  const current = bestByName.get(entry.name)
  if (!current || entry.quality > current.quality || (entry.quality === current.quality && entry.repo < current.repo)) {
    bestByName.set(entry.name, entry)
  }
}
for (const entry of entries) {
  entry.duplicateRank = entry === bestByName.get(entry.name) ? 0 : 1
  entry.weak = !String(entry.description || '').trim() || entry.quality < 40
}

entries.sort(
  (left, right) =>
    Number(right.quality || 0) - Number(left.quality || 0) ||
    Number(right.stars || 0) - Number(left.stars || 0) ||
    String(left.name).localeCompare(String(right.name)),
)

library.entries = entries
library.total = entries.length
library.qualityUpdatedAt = new Date().toISOString()
library.qualityNote =
  'quality = completeness (description/whenToUse/path/unique name) blended with GitHub stars, recency, archived and license signals; heuristic, not a usefulness or security guarantee'
fs.writeFileSync(FILE, JSON.stringify(library, null, 2) + '\n')

const dist = entries.reduce((acc, entry) => {
  acc[entry.qualityLabel] = (acc[entry.qualityLabel] || 0) + 1
  return acc
}, {})
const withStars = entries.filter((entry) => entry.stars !== undefined).length
console.log('entries', entries.length, 'quality', dist, 'withStars', withStars, 'duplicates', [...nameCounts.values()].filter((n) => n > 1).length)
