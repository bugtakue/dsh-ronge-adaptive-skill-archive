import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { atomicWriteFile, atomicWriteJson, isInside, withKeyLock } from '../lib/fsx.js'

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ronge-fsx-'))

test('atomic write leaves no temp file and replaces content', () => {
  const file = path.join(tmp, 'data', 'x.json')
  atomicWriteJson(file, { a: 1 })
  atomicWriteJson(file, { a: 2 })
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { a: 2 })
  assert.deepEqual(fs.readdirSync(path.dirname(file)), ['x.json'])
})

test('atomic write is private by default', () => {
  const file = path.join(tmp, 'private', 'secret.txt')
  atomicWriteFile(file, 'x')
  const mode = fs.statSync(file).mode & 0o777
  assert.equal(mode, 0o600)
})

test('isInside rejects prefix siblings and traversal', () => {
  assert.equal(isInside('/tmp/a', '/tmp/a/b'), true)
  assert.equal(isInside('/tmp/a', '/tmp/ab'), false)
  assert.equal(isInside('/tmp/a', '/tmp/a/../b'), false)
})

test('withKeyLock serializes the same key and propagates failures', async () => {
  const order = []
  await Promise.all([
    withKeyLock('same', async () => { order.push('a1'); await new Promise((r) => setTimeout(r, 20)); order.push('a2') }),
    withKeyLock('same', async () => { order.push('b1') }),
  ])
  assert.deepEqual(order, ['a1', 'a2', 'b1'])
  await assert.rejects(withKeyLock('fail', async () => { throw new Error('boom') }), /boom/)
})
