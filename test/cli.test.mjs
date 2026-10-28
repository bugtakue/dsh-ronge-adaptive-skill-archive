import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

function run(args, env = {}) {
  const result = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'cli.mjs'), ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
    timeout: 30000,
  })
  return { code: result.status, out: String(result.stdout || '') + String(result.stderr || '') }
}

test('cli help/version expose the npx entry points', () => {
  const help = run(['--help'])
  assert.equal(help.code, 0)
  assert.match(help.out, /npx ronge-adaptive-skill-archive/)
  assert.match(help.out, /doctor/)
  assert.match(help.out, /eval/)
  const version = run(['version'])
  assert.equal(version.code, 0)
  assert.equal(version.out.trim(), pkg.version)
})

test('cli default prints the three install paths', () => {
  const result = run([])
  assert.equal(result.code, 0)
  assert.match(result.out, /plugin_manager install_bundle target=ronge-adaptive-skill-archive@/)
  assert.match(result.out, /git\+https:\/\/github\.com\/bugtakue\/ronge-adaptive-skill-archive/)
  assert.match(result.out, /plugin_manager install_bundle target=/)
})

test('cli doctor checks profile, data dir and library', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ronge-cli-'))
  const profile = path.join(temp, 'profile')
  fs.mkdirSync(profile, { recursive: true })
  fs.writeFileSync(
    path.join(profile, 'package.json'),
    JSON.stringify({ dsh: { profile: { bundles: [pkg.name] } }, dependencies: { [pkg.name]: 'link:.' } }),
  )
  fs.writeFileSync(path.join(profile, 'cordis.patch.yml'), '')
  const home = path.join(temp, 'dsh')
  const data = path.join(home, 'ronge-adaptive-skill-archive')
  fs.mkdirSync(data, { recursive: true })
  fs.writeFileSync(path.join(data, 'experience.json'), JSON.stringify({ entries: [{}, {}], skills: { a: {} } }))
  fs.writeFileSync(path.join(data, 'evolution.json'), JSON.stringify({ explorationRate: 0.1 }))
  const result = run(['doctor'], { DSH_PROFILE_DIR: profile, DSH_HOME: home })
  assert.equal(result.code, 0)
  assert.match(result.out, /已安装 bundle/)
  assert.match(result.out, /经验记录：2 条/)
  assert.match(result.out, /自进化：探索 10%/)
  assert.match(result.out, /卷轴馆索引/)
  fs.rmSync(temp, { recursive: true, force: true })
})

test('cli eval and market run offline', () => {
  const evalResult = run(['eval'])
  assert.equal(evalResult.code, 0)
  assert.match(evalResult.out, /Recall@4: 1/)
  const market = run(['market'])
  assert.equal(market.code, 0)
  assert.match(market.out, /install target/)
  assert.match(market.out, /plugin-market\.json/)
})
