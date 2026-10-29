/**
 * 浏览器级 UI 验证：真实 React 18 + 无头 Chrome 渲染 client.js。
 * 不碰用户 profile；用临时目录 + 本地静态服务器 + fetch mock。
 *
 *   node ui-e2e.mjs
 */
import { createServer } from 'node:http'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const HARNESS = path.join(HERE, 'ui-harness')
const PRODUCT = path.resolve(HERE, '..')
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const REACT_DIR = process.env.REACT_DIR || '/tmp/uiverify/node_modules'

const serveDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ronge-ui-'))
fs.mkdirSync(path.join(serveDir, 'vendor'), { recursive: true })
for (const file of ['index.html', 'test.js']) {
  fs.copyFileSync(path.join(HARNESS, file), path.join(serveDir, file))
}
fs.copyFileSync(path.join(PRODUCT, 'client.js'), path.join(serveDir, 'client.js'))
fs.copyFileSync(path.join(REACT_DIR, 'react/umd/react.development.js'), path.join(serveDir, 'vendor/react.development.js'))
fs.copyFileSync(
  path.join(REACT_DIR, 'react-dom/umd/react-dom.development.js'),
  path.join(serveDir, 'vendor/react-dom.development.js'),
)

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' }
const server = createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const file = path.join(serveDir, url.pathname === '/' ? 'index.html' : url.pathname)
  if (!file.startsWith(serveDir) || !fs.existsSync(file)) {
    res.writeHead(404)
    res.end('not found')
    return
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const url = 'http://127.0.0.1:' + server.address().port + '/'

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ronge-chrome-'))
const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--no-first-run',
  '--user-data-dir=' + profile,
  '--virtual-time-budget=20000',
  '--run-all-compositor-stages-before-draw',
  '--dump-dom',
  url,
]

const output = await new Promise((resolve, reject) => {
  execFile(CHROME, args, { timeout: 90000, maxBuffer: 20 * 1024 * 1024 }, (error, stdout, stderr) => {
    if (error && !stdout) reject(new Error('chrome failed: ' + (error.message || '') + '\n' + stderr))
    else resolve(stdout)
  })
})
server.close()

function decode(html) {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}
const match = /<pre id="results"[^>]*>([\s\S]*?)<\/pre>/.exec(output)
if (!match) {
  console.error('no results found in DOM; chrome output head:')
  console.error(output.slice(0, 1200))
  process.exit(1)
}
let payload
try {
  payload = JSON.parse(decode(match[1]))
} catch (error) {
  console.error('failed to parse results:', error.message)
  console.error(decode(match[1]).slice(0, 800))
  process.exit(1)
}

const results = payload.results || []
let failed = 0
for (const item of results) {
  if (item.ok) console.log('PASS  ' + item.name)
  else {
    failed += 1
    console.log('FAIL  ' + item.name + '  —  ' + item.error)
  }
}
console.log(`\n${results.length - failed}/${results.length} passed, ${failed} failed`)
console.log('requests:', (payload.calls || []).join(', '))
console.log('clipboard:', payload.clipboard)
if (failed > 0) process.exitCode = 1
