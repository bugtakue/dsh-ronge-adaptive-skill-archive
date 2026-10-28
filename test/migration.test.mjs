import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ronge-migration-'))
const home = path.join(tmp, 'home')
const legacy = path.join(home, 'skill-studio')
fs.mkdirSync(legacy, { recursive: true })
fs.writeFileSync(path.join(legacy, 'config.json'), JSON.stringify({ mode: 'immersive' }))
fs.writeFileSync(
  path.join(legacy, 'experience.json'),
  JSON.stringify({
    version: 1,
    updatedAt: '2026-10-28T00:00:00Z',
    entries: [{ id: 'legacy-1', task: 'legacy task', skills: ['pdf'], outcome: 'ok' }],
    skills: { pdf: { uses: 2, successes: 2, good: 0, bad: 0, lastUsed: '2026-10-28T00:00:00Z' } },
  }),
)
process.env.DSH_HOME = home
process.env.DSH_AGENTS_HOME = path.join(tmp, 'agents')

const { apply } = await import('../index.js')
const ctx = {
  webServer: { register: () => () => {} },
  skills: { list: async () => [] },
  get: (name) => (name === 'systemPrompt' ? { section: () => () => {} } : undefined),
  effect: (fn) => {
    fn()
    return () => {}
  },
  on: () => () => {},
}
apply(ctx, { cwd: tmp })

const current = path.join(home, 'ronge-adaptive-skill-archive')
test('legacy data directory is copied to the new name', () => {
  assert.ok(fs.existsSync(current), 'new data dir exists')
  assert.ok(fs.existsSync(path.join(current, 'config.json')))
  assert.ok(fs.existsSync(path.join(current, 'experience.json')))
  assert.ok(fs.existsSync(legacy), 'legacy dir is kept')
})

test('legacy experience is loaded after migration', () => {
  const saved = JSON.parse(fs.readFileSync(path.join(current, 'experience.json'), 'utf8'))
  assert.equal(saved.entries.length, 1)
  assert.equal(saved.entries[0].id, 'legacy-1')
})
