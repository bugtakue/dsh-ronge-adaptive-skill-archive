import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const client = fs.readFileSync(path.join(root, 'client.js'), 'utf8')
const patch = fs.readFileSync(path.join(root, 'cordis.patch.yml'), 'utf8')

const failures = []

const factoryId = /id:\s*'([^']+)'/.exec(client)?.[1]
if (!factoryId) failures.push('client.js: missing window.__ModuleLoader__.load({ id })')
else if (factoryId !== pkg.name) {
  failures.push(`client.js: factory id "${factoryId}" must equal package name "${pkg.name}"`)
}

if (!patch.includes(pkg.name)) {
  failures.push(`cordis.patch.yml: does not reference package name "${pkg.name}"`)
}

if (pkg.dsh?.client?.platform !== 'web') {
  failures.push('package.json: dsh.client.platform must be "web"')
}

if (failures.length) {
  console.error('skill-factory check failed:')
  for (const failure of failures) console.error(' -', failure)
  process.exit(1)
}

console.log(`ok: ${pkg.name} (factory id matches package name)`)
