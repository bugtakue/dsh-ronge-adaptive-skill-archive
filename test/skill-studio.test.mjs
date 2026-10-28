import test from 'node:test'
import assert from 'node:assert/strict'
import {
  detectLang,
  localizeSkill,
  parseSkillArguments,
  recommendSkills,
  tokenize,
} from '../index.js'

test('detectLang prefers Chinese context and falls back to the locale', () => {
  assert.equal(detectLang('帮我做一个视频宣传片，先出分镜', 'en'), 'zh')
  assert.equal(detectLang('Build a landing page with a hero section', 'zh'), 'en')
  assert.equal(detectLang('', 'zh'), 'zh')
})

test('localizeSkill returns the localized one-line intro for known skills', () => {
  const zh = localizeSkill({ name: 'beat-promo-director', description: 'promo' }, 'zh')
  const en = localizeSkill({ name: 'beat-promo-director', description: 'promo' }, 'en')
  assert.match(zh.intro, /卡点|宣传片/)
  assert.match(en.intro, /promo/i)
})

test('recommendSkills ranks a video skill for a video request', () => {
  const skills = [
    { name: 'beat-promo-director', description: 'promo', intro: '卡点视频 宣传片' },
    { name: 'office-xlsx', description: 'excel', intro: '表格 公式' },
  ]
  const ranked = recommendSkills(skills, '帮我做一个视频宣传片', {})
  assert.equal(ranked[0].name, 'beat-promo-director')
  assert.ok(ranked[0].reasons.length > 0)
})

test('parseSkillArguments handles JSON and streamed argument strings', () => {
  assert.equal(parseSkillArguments('{"name":"office"}').name, 'office')
  assert.equal(parseSkillArguments('{"name":"agent-experience","x":1}').name, 'agent-experience')
  assert.equal(parseSkillArguments('not-json "name": "media-use"').name, 'media-use')
})

test('tokenize emits Latin tokens and Chinese bigrams', () => {
  const tokens = tokenize('视频 video 分镜')
  assert.ok(tokens.has('video'))
  assert.ok(tokens.has('视频'))
  assert.ok(tokens.has('分镜'))
})
