#!/usr/bin/env node
/** Read-only DSH ecosystem regression: bundle manifest, DSH skill, installer, MCP stdio. */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const checks = []
const check = (name, ok, detail) => checks.push({ name, ok: Boolean(ok), detail })

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const patchPath = path.join(ROOT, pkg.dsh?.bundle?.patch || '')
check('package.dsh.bundle.patch points to existing file', Boolean(pkg.dsh?.bundle?.patch) && fs.existsSync(patchPath), pkg.dsh?.bundle?.patch)
check('bundle patch contains plugin id', fs.existsSync(patchPath) && fs.readFileSync(patchPath, 'utf8').includes('dsh-ronge-adaptive-skill-archive'))

const skillPath = path.join(ROOT, 'skills', 'dsh-skill-cockpit', 'SKILL.md')
const skillText = fs.existsSync(skillPath) ? fs.readFileSync(skillPath, 'utf8') : ''
check('DSH skill SKILL.md exists', Boolean(skillText))
check('DSH skill frontmatter name', /^---[\s\S]*?name:\s*dsh-skill-cockpit/m.test(skillText))
check('DSH skill is in package files', (pkg.files || []).includes('skills/**'))

const installHome = fs.mkdtempSync(path.join(os.tmpdir(), 'ronge-eco-'))
const install = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'install-dsh-skill.mjs'), '--dry-run'], { encoding: 'utf8', env: { ...process.env, DSH_HOME: installHome } })
let installTarget = null
try { installTarget = JSON.parse(install.stdout).target } catch {}
check('skill installer dry-run works', install.status === 0 && Boolean(installTarget), installTarget)

const homeSkill = path.join(process.env.DSH_HOME || path.join(process.env.HOME || '', '.dsh'), 'skills', 'dsh-skill-cockpit', 'SKILL.md')
check('skill installed in DSH_HOME (optional)', fs.existsSync(homeSkill), homeSkill)

const requests = [
  { jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'ecosystem-check', version: '1' } } },
  { jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} },
].map((item) => JSON.stringify(item)).join('\n') + '\n'
const mcp = spawnSync(process.execPath, [path.join(ROOT, 'mcp', 'server.mjs')], { input: requests, encoding: 'utf8', timeout: 10000 })
const lines = String(mcp.stdout || '').trim().split('\n').filter(Boolean).map((line) => { try { return JSON.parse(line) } catch { return null } }).filter(Boolean)
const init = lines.find((line) => line.id === 1)?.result
const tools = lines.find((line) => line.id === 2)?.result?.tools || []
check('MCP initializes', init?.serverInfo?.name === 'dsh-ronge-adaptive-skill-archive', init?.serverInfo)
check('MCP exposes tools', tools.length > 0, tools.map((tool) => tool.name).join(','))
check('MCP has recommend/install/experience', ['recommend_skills', 'install_skill', 'experience_summary'].every((name) => tools.some((tool) => tool.name === name)), tools.map((tool) => tool.name).join(','))

console.log(JSON.stringify({ ok: checks.every((item) => item.ok), version: pkg.version, checks }, null, 2))
process.exit(checks.every((item) => item.ok) ? 0 : 1)
