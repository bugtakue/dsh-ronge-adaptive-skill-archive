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

// Names that are so generic they cannot be judged from the metadata alone.
const GENERIC_NAMES = new Set(['skill', 'skills', '3p', 'heal', 'pr', 'test', 'tests', 'agent', 'tool', 'pdf', 'doc'])

function qualityOf(entry) {
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
  // Legacy rating is only a weak prior (max 3 points); it must not dominate.
  score += Math.max(0, Math.min(3, ((Number(entry.rating) || 1) - 2) * 0.8))
  return Math.max(0, Math.min(98, Math.round(score)))
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
  'quality is a completeness/透明度 heuristic (description, whenToUse, canonical path, unique name, official owner, generic-name penalty); capped at 98; not a popularity, usefulness or security rank'
fs.writeFileSync(FILE, JSON.stringify(library, null, 2) + '\n')
const dist = entries.reduce((acc, entry) => {
  acc[entry.qualityLabel] = (acc[entry.qualityLabel] || 0) + 1
  return acc
}, {})
console.log('entries', entries.length, 'quality', dist, 'duplicates', [...nameCounts.values()].filter((n) => n > 1).length)
