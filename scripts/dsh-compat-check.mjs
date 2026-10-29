#!/usr/bin/env node
/**
 * Static DSH ecosystem compatibility check. Verifies the bundle manifest,
 * display metadata, client factory/slots, route namespace, data-dir migration
 * and the hosted market-index entry, without booting a Harness.
 *
 * Tested against DSH Desktop 0.2.1-rc.3.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const patch = fs.readFileSync(path.join(ROOT, 'cordis.patch.yml'), 'utf8')
const client = fs.readFileSync(path.join(ROOT, 'client.js'), 'utf8')
const index = fs.readFileSync(path.join(ROOT, 'index.js'), 'utf8')
const failures = []
const check = (ok, message) => { if (!ok) failures.push(message) }

check(pkg.name === 'dsh-ronge-adaptive-skill-archive', 'unexpected package name')
check(pkg.dsh?.bundle?.patch === './cordis.patch.yml', 'dsh.bundle.patch missing')
check(pkg.dsh?.client?.platform === 'web', 'dsh.client.platform must be web')
check(pkg.dsh?.client?.inject?.includes('@deepseek-ai/dsh-client-ui-conversation'), 'client must inject ui-conversation')
for (const subpath of ['.', './client', './icon', './locale/*.json']) {
  check(Boolean(pkg.exports?.[subpath]), 'missing export ' + subpath)
}
check(patch.includes('id: ' + pkg.name), 'patch row id must equal package name')
check(patch.includes("name: '" + pkg.name + "'"), 'patch row name must equal package name')

for (const locale of ['en', 'zh']) {
  const dict = JSON.parse(fs.readFileSync(path.join(ROOT, 'locale', locale + '.json'), 'utf8'))
  check(typeof dict.meta?.title === 'string' && dict.meta.title.trim(), locale + '.meta.title missing')
  check(typeof dict.meta?.description === 'string' && dict.meta.description.trim(), locale + '.meta.description missing')
}
const icon = fs.readFileSync(path.join(ROOT, 'icon.svg'))
check(icon.length < 256 * 1024, 'icon must be under 256 KiB')
check(String(icon).trim().startsWith('<svg'), 'icon.svg is not SVG')

const factoryId = /id:\s*'([^']+)'/.exec(client)?.[1]
check(factoryId === pkg.name, 'client factory id must equal package name')
for (const slot of ['conversation.session.header.utilities', 'shell.overlay']) {
  check(client.includes("ctx.slots.inject('" + slot + "'"), 'missing slot injection ' + slot)
}
check(client.includes("id: '" + pkg.name + "'"), 'client button slot id must equal package name')

const legacy = '/ronge-adaptive-skill-archive'
const routeMatches = [...index.matchAll(/path:\s*'(\/[^']+)'/g)].map((match) => match[1])
for (const route of routeMatches) {
  check(route === '/' + pkg.name || route.startsWith('/' + pkg.name + '/'), 'route outside package namespace: ' + route)
  check(!route.includes(legacy), 'legacy route still registered: ' + route)
}
check(index.includes("STUDIO_DIR_NAME = '" + pkg.name + "'"), 'data dir must be the package name')
check(index.includes("'ronge-adaptive-skill-archive'") && index.includes("'skill-studio'"), 'legacy data dir migration missing')

const market = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'plugin-market.json'), 'utf8'))
const listed = market.plugins?.find((plugin) => plugin.name === pkg.name)
check(Boolean(listed), 'market index does not list this plugin')
if (listed) {
  check(listed.versions?.some((version) => version.version === pkg.version), 'market index version does not match package')
  check(listed.versions?.[0]?.source?.type === 'npm', 'market version source must be npm')
  const target = listed.versions?.[0]?.install?.[0]?.target
  if (target) check(target === pkg.name + '@' + pkg.version, 'market install target mismatch: ' + target)
}
for (const file of ['index.js', 'client.js', 'cordis.patch.yml', 'icon.svg', 'locale/en.json', 'locale/zh.json', 'mcp/server.mjs']) {
  check(Array.isArray(pkg.files) && pkg.files.some((pattern) => pattern === file || pattern.startsWith(file.split('/')[0] + '/')), 'files[] does not cover ' + file)
}

if (failures.length) {
  console.error('DSH compatibility check failed:')
  for (const failure of failures) console.error(' - ' + failure)
  process.exit(1)
}
console.log('ok: DSH compatibility (' + pkg.name + '@' + pkg.version + ', manifest/slots/routes/migration/market)')
