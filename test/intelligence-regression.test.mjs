import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { decomposeTask, composeSkillPlan } from '../lib/intelligence/index.js'

const skills = JSON.parse(fs.readFileSync(new URL('./fixtures/eval-skills.json', import.meta.url), 'utf8'))
const library = JSON.parse(fs.readFileSync(new URL('../library/skills-index.json', import.meta.url), 'utf8')).entries

test('security review tasks are not classified as business plans', () => {
  const task = '审一下这个第三方 skill 能不能装，重点看 shell 和凭据'
  const decomposition = decomposeTask({ task })
  assert.equal(decomposition.primaryIntent, 'security-review')
  assert.ok(decomposition.domains.includes('security'))
  const plan = composeSkillPlan({ task, installedSkills: skills, libraryEntries: library, maxSkills: 5 })
  assert.ok(plan.conflicts.length >= 0)
  assert.ok(plan.stages.length >= 1)
  assert.ok(!plan.stages.some((stage) => stage.skills.some((skill) => /tax-optimization|beamer-ppt|ratelimit/.test(skill.name))))
})
