#!/usr/bin/env node
/**
 * Generate `library/capability-index.json` from `library/skills-index.json`.
 *
 *   node scripts/build-capability-index.mjs
 *   SOURCE_DATE_EPOCH=1761753600 node scripts/build-capability-index.mjs   # reproducible timestamp
 *
 * Idempotent: when the computed skills map is unchanged, the previous
 * `generatedAt` is preserved so re-running does not create a spurious diff
 * (CI can assert the committed file is up to date).
 *
 * Pure local computation: no network, no new dependencies.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildCapabilityIndex, DOMAIN_IDS } from '../lib/intelligence/index.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const inputPath = path.join(root, 'library', 'skills-index.json')
const outputPath = path.join(root, 'library', 'capability-index.json')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const library = readJson(inputPath)
const entries = Array.isArray(library) ? library : Array.isArray(library.entries) ? library.entries : []
if (!entries.length) {
  console.error('no entries found in', path.relative(root, inputPath))
  process.exit(1)
}

const epoch = Number(process.env.SOURCE_DATE_EPOCH)
const generatedAt = Number.isFinite(epoch) && epoch > 0
  ? new Date(epoch * 1000).toISOString()
  : new Date().toISOString()

const startedAt = Date.now()
let index = buildCapabilityIndex(entries, { generatedAt })
index.sourceGeneratedAt = typeof library.generatedAt === 'string' ? library.generatedAt : null
index.sourceTotal = Number(library.total) || entries.length

let previous = null
try {
  previous = readJson(outputPath)
} catch {
  previous = null
}
if (previous && previous.version === 1 && JSON.stringify(previous.skills) === JSON.stringify(index.skills)) {
  index.generatedAt = previous.generatedAt || index.generatedAt
}

fs.writeFileSync(outputPath, JSON.stringify(index) + '\n')

const durationMs = Date.now() - startedAt
const size = fs.statSync(outputPath).size
const known = index.total - index.unknown
const coverage = index.total ? Math.round((known / index.total) * 1000) / 10 : 0
const domainSummary = DOMAIN_IDS.map((id) => id + '=' + index.domains[id].count).join(' ')

console.log('wrote', path.relative(root, outputPath))
console.log('entries:', entries.length, '| skills:', index.total, '| merged duplicate names:', index.duplicateNamesMerged, '| unknown:', index.unknown, '| known coverage:', coverage + '%')
console.log('domains:', domainSummary)
console.log('bytes:', size, '| took:', durationMs + 'ms', '| generatedAt:', index.generatedAt)
