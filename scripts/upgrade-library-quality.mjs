#!/usr/bin/env node
/**
 * Add transparent completeness signals and dedupe metadata to the bundled
 * library index. The old `rating` is a heuristic; `quality` is an explicit
 * completeness score shown in the UI instead of pretending to be a quality rank.
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

const nameCounts = new Map()
for (const entry of entries) {
  nameCounts.set(entry.name, (nameCounts.get(entry.name) || 0) + 1)
}

function canonicalPath(p) {
  return (
    p.startsWith('skills/') ||
    p.includes('/skills/') ||
    p.startsWith('.claude/skills/') ||
    p.includes('/.claude/skills/')
  )
}

function qualityOf(entry) {
  const description = String(entry.description || '').trim()
  const whenToUse = String(entry.whenToUse || '').trim()
  let score = 20
  if (description) score += 30
  if (description.length >= 80) score += 10
  if (description.length >= 160) score += 5
  if (whenToUse) score += 15
  if (canonicalPath(String(entry.path || ''))) score += 10
  if (entry.trust === 'official') score += 5
  const nameCount = nameCounts.get(entry.name) || 1
  if (nameCount === 1) score += 10
  else if (nameCount <= 5) score += 4
  // Legacy rating is a weak prior only; it can add at most 5 points.
  score += Math.max(0, Math.min(5, (Number(entry.rating) || 1) - 2))
  return Math.max(0, Math.min(100, Math.round(score)))
}

for (const entry of entries) {
  entry.quality = qualityOf(entry)
  entry.qualityLabel = entry.quality >= 80 ? 'high' : entry.quality >= 55 ? 'medium' : 'low'
  entry.duplicateName = nameCounts.get(entry.name) || 1
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

// Put stronger entries first so the first pages are not dominated by placeholder names.
entries.sort(
  (left, right) =>
    Number(right.quality || 0) - Number(left.quality || 0) ||
    Number(right.rating || 0) - Number(left.rating || 0) ||
    String(left.name).localeCompare(String(right.name)),
)

library.entries = entries
library.total = entries.length
library.qualityUpdatedAt = new Date().toISOString()
library.qualityNote =
  'quality is a transparency/completeness heuristic (description, whenToUse, canonical path, unique name, official owner), not a popularity or security rank'
fs.writeFileSync(FILE, JSON.stringify(library, null, 2) + '\n')
const dist = entries.reduce((acc, entry) => {
  acc[entry.qualityLabel] = (acc[entry.qualityLabel] || 0) + 1
  return acc
}, {})
console.log('entries', entries.length, 'quality', dist, 'duplicates', [...nameCounts.values()].filter((n) => n > 1).length)
