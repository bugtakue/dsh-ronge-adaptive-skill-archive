import test from 'node:test'
import assert from 'node:assert/strict'
import { capabilityProfile } from '../lib/intelligence/capability.js'

test('terse DSH built-in skills still get useful capability profiles', () => {
  const office = capabilityProfile({ name: 'office-docx', description: 'Create, read, edit, and validate Word documents (.docx).' })
  assert.ok(office.capabilities.includes('document-read'))
  assert.ok(office.capabilities.includes('document-edit'))
  assert.ok(office.capabilities.includes('contract-review'))
  const video = capabilityProfile({ name: 'hyperframes', description: 'Make videos.' })
  assert.ok(video.capabilities.includes('video-rendering'))
  assert.ok(video.capabilities.includes('video-editing'))
  const beat = capabilityProfile({ name: 'beat-promo-director', description: '卡点视频' })
  assert.ok(beat.capabilities.includes('storyboard'))
  assert.ok(beat.capabilities.includes('motion-graphics'))
})
