#!/usr/bin/env node
/**
 * Fetch GitHub repo signals (stars, pushedAt, archived, license) for the repos
 * referenced by the bundled skill index. Uses the authenticated gh CLI token and
 * a resumable JSON cache. Rate-limited and safe to re-run.
 *
 * usage: node scripts/fetch-repo-metadata.mjs [--refresh] [--limit N]
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const INDEX = path.join(ROOT, 'library', 'skills-index.json')
const CACHE = path.join(ROOT, 'library', 'repo-metadata.json')
const BATCH = 50

const args = process.argv.slice(2)
const refresh = args.includes('--refresh')
const limitFlag = args.indexOf('--limit')
const limit = limitFlag >= 0 ? Number(args[limitFlag + 1]) : Infinity

const library = JSON.parse(fs.readFileSync(INDEX, 'utf8'))
const repos = [...new Set((library.entries || []).map((entry) => entry.repo).filter((repo) => repo && repo.includes('/')))].slice(0, limit)
let cache = { fetchedAt: null, repos: {} }
if (fs.existsSync(CACHE) && !refresh) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE, 'utf8'))
  } catch {
    cache = { fetchedAt: null, repos: {} }
  }
}
const token = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim()
if (!token) throw new Error('gh auth token is not available')
const pending = repos.filter((repo) => !cache.repos[repo])
console.log('repos', repos.length, 'cached', repos.length - pending.length, 'pending', pending.length)

function buildQuery(batch) {
  const fields = batch
    .map((repo, index) => {
      const [owner, name] = repo.split('/')
      return `r${index}: repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { stargazerCount pushedAt isArchived licenseInfo { spdxId } }`
    })
    .join('\n')
  return `query { rateLimit { remaining resetAt } ${fields} }`
}

async function graphql(query, attempt = 0) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + token, 'content-type': 'application/json', 'user-agent': 'ronge-skill-archive' },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(30000),
  })
  if (response.status === 502 || response.status === 503 || response.status === 429) {
    if (attempt >= 3) throw new Error('GraphQL HTTP ' + response.status)
    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)))
    return graphql(query, attempt + 1)
  }
  const body = await response.json()
  if (!response.ok) throw new Error('GraphQL HTTP ' + response.status + ': ' + JSON.stringify(body).slice(0, 300))
  if (body.errors && body.errors.length) {
    // Keep partial data when only some aliases fail.
    console.warn('GraphQL partial errors:', body.errors.slice(0, 2).map((error) => error.message))
  }
  return body.data || {}
}

let processed = 0
for (let start = 0; start < pending.length; start += BATCH) {
  const batch = pending.slice(start, start + BATCH)
  const data = await graphql(buildQuery(batch))
  const remaining = Number(data.rateLimit?.remaining ?? 0)
  for (let index = 0; index < batch.length; index += 1) {
    const repo = batch[index]
    const item = data['r' + index]
    cache.repos[repo] = item
      ? {
          stars: Number(item.stargazerCount || 0),
          pushedAt: item.pushedAt || null,
          archived: Boolean(item.isArchived),
          license: item.licenseInfo?.spdxId || null,
        }
      : { missing: true }
  }
  processed += batch.length
  cache.fetchedAt = new Date().toISOString()
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2) + '\n')
  console.log(`fetched ${processed}/${pending.length} (rate remaining ${remaining})`)
  if (remaining && remaining < 100) {
    console.warn('stopping: GitHub GraphQL rate limit is low')
    break
  }
}
