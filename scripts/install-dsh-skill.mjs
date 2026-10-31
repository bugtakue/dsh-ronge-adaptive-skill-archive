#!/usr/bin/env node
/**
 * Install this repo's DSH skill into the local DSH skill directory.
 * Read-only unless --write is passed; never overwrites without --force.
 *
 * usage:
 *   node scripts/install-dsh-skill.mjs --dry-run
 *   node scripts/install-dsh-skill.mjs --write
 *   node scripts/install-dsh-skill.mjs --write --force
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const write = args.includes('--write')
const force = args.includes('--force')
const dryRun = args.includes('--dry-run') || !write
const source = path.join(ROOT, 'skills', 'dsh-skill-cockpit')
const home = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const target = path.join(home, 'skills', 'dsh-skill-cockpit')

if (!fs.existsSync(path.join(source, 'SKILL.md'))) {
  console.error('source skill missing: ' + source)
  process.exit(1)
}
if (fs.existsSync(target) && !force) {
  console.error('target already exists: ' + target + ' (use --force to overwrite)')
  process.exit(2)
}
if (dryRun) {
  console.log(JSON.stringify({ dryRun: true, source, target, write, force }, null, 2))
  process.exit(0)
}

fs.mkdirSync(path.dirname(target), { recursive: true })
if (force && fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true })
fs.cpSync(source, target, { recursive: true })
console.log(JSON.stringify({ installed: true, source, target }, null, 2))
