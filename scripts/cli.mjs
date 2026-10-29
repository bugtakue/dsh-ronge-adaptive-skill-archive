#!/usr/bin/env node
/**
 * npx dsh-ronge-adaptive-skill-archive — installer helper, doctor and offline tools.
 *
 * This CLI never edits the DSH profile and never installs by itself: the
 * supported install path is the DSH `plugin_manager install_bundle` tool. The
 * CLI prints the exact command for this machine and checks the environment.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
const args = process.argv.slice(2)
const command = args[0] || 'install'

const C = process.stdout.isTTY
  ? {
      reset: '\u001b[0m',
      dim: '\u001b[2m',
      bold: '\u001b[1m',
      green: '\u001b[32m',
      yellow: '\u001b[33m',
      red: '\u001b[31m',
      cyan: '\u001b[36m',
    }
  : { reset: '', dim: '', bold: '', green: '', yellow: '', red: '', cyan: '' }

const line = (text = '') => process.stdout.write(text + '\n')
const ok = (text) => line(`  ${C.green}✓${C.reset} ${text}`)
const warn = (text) => line(`  ${C.yellow}!${C.reset} ${text}`)
const bad = (text) => line(`  ${C.red}✗${C.reset} ${text}`)
const head = (text) => line(`\n${C.bold}${text}${C.reset}`)
const dim = (text) => line(`${C.dim}${text}${C.reset}`)

function banner() {
  line('')
  line(`${C.cyan}${C.bold}  荣哥技能卷轴收藏馆 · Ronge's Adaptive Skill Cockpit${C.reset}`)
  line(`${C.dim}  context-aware, self-evolving skill cockpit for DeepSeek Harness${C.reset}`)
  line('')
}

function dataDir() {
  return path.join(process.env.DSH_HOME || path.join(os.homedir(), '.dsh'), 'dsh-ronge-adaptive-skill-archive')
}

function legacyDataDir() {
  return path.join(process.env.DSH_HOME || path.join(os.homedir(), '.dsh'), 'skill-studio')
}

function profileDir() {
  return process.env.DSH_PROFILE_DIR || ''
}

function installerCommand() {
  return `plugin_manager install_bundle target=${pkg.name}@${pkg.version}`
}

function printInstall() {
  banner()
  head('安装（在 DeepSeek Harness 的任意会话里让 Agent 执行）')
  line(`  ${C.bold}${installerCommand()}${C.reset}`)
  line('')
  dim('  没有 npm / 离线安装：')
  line(`  plugin_manager install_bundle target=git+https://github.com/bugtakue/dsh-ronge-adaptive-skill-archive.git#v${pkg.version}`)
  line(`  plugin_manager install_bundle target=${ROOT}`)
  line('')
  head('装好后')
  line('  打开任意会话 → 右上角「技能」→ 右侧抽屉；刷新页面后生效。')
  line('')
  head('更多')
  line(`  npx ${pkg.name} doctor    检查 Node / profile / 数据目录 / 已装版本`)
  line(`  npx ${pkg.name} eval      跑离线推荐评估（Recall@4）`)
  line(`  npx ${pkg.name} market    DSH 插件市场索引信息`)
  line(`  npx ${pkg.name} mcp       启动跨智能体 MCP server（Claude Code / Codex / Cursor）`)
  line(`  ${C.cyan}https://bugtakue.github.io/dsh-ronge-adaptive-skill-archive/${C.reset}`)
  line('')
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function doctor() {
  banner()
  head('环境检查')
  const major = Number(process.versions.node.split('.')[0])
  if (major >= 22) ok(`Node ${process.versions.node}`)
  else warn(`Node ${process.versions.node}（建议 ≥ 22）`)

  const profile = profileDir()
  if (!profile) {
    warn('未检测到 DSH_PROFILE_DIR（在 DSH 会话的 shell 里运行会带上）')
  } else if (!fs.existsSync(profile)) {
    bad(`profile 不存在：${profile}`)
  } else {
    ok(`profile：${profile}`)
    const profilePkg = readJson(path.join(profile, 'package.json'))
    const bundles = profilePkg?.dsh?.profile?.bundles || []
    const installed = bundles.includes(pkg.name)
    if (installed) ok(`已安装 bundle：${pkg.name}`)
    else warn(`profile 未启用 ${pkg.name}；安装：${installerCommand()}`)
    const lock = readJson(path.join(profile, 'package.json'))
    const dep = lock?.dependencies?.[pkg.name]
    if (dep) ok(`profile 依赖：${dep}`)
  }

  const data = dataDir()
  if (fs.existsSync(data)) {
    ok(`数据目录：${data}`)
    const experience = readJson(path.join(data, 'experience.json'))
    if (experience) ok(`经验记录：${(experience.entries || []).length} 条 / ${Object.keys(experience.skills || {}).length} 个技能`)
    const evolution = readJson(path.join(data, 'evolution.json'))
    if (evolution) {
      ok(`自进化：探索 ${Math.round(Number(evolution.explorationRate || 0) * 100)}% / 权重已学习`)
    } else {
      warn('自进化数据尚未生成（用几次后会出现）')
    }
  } else if (fs.existsSync(legacyDataDir())) {
    warn(`旧数据目录存在但尚未迁移：${legacyDataDir()}（启动一次 DSH 会自动复制）`)
  } else {
    warn(`数据目录尚未生成：${data}（安装并打开面板后创建）`)
  }

  const library = readJson(path.join(ROOT, 'library', 'skills-index.json'))
  if (library && Array.isArray(library.entries)) {
    ok(`卷轴馆索引：${library.entries.length} 条（快照 ${library.generatedAt || '未知'}）`)
  } else {
    warn('未找到 library/skills-index.json')
  }

  head('下一步')
  line(`  ${C.cyan}${installerCommand()}${C.reset}`)
  line('')
  let failures = 0
  if (!profile) failures += 1
  process.exitCode = failures > 0 ? 1 : 0
}

async function evaluate() {
  banner()
  head('离线推荐评估（无需网络）')
  const skills = readJson(path.join(ROOT, 'test', 'fixtures', 'eval-skills.json'))
  const cases = readJson(path.join(ROOT, 'test', 'fixtures', 'recommend-cases.json'))
  if (!Array.isArray(skills) || !Array.isArray(cases)) {
    bad('缺少 test/fixtures（发布包应包含）')
    process.exitCode = 1
    return
  }
  const { evaluateRecommendations } = await import(path.join(ROOT, 'index.js'))
  const report = evaluateRecommendations(cases, skills, {}, 4)
  line(`  Recall@${report.k}: ${C.bold}${report.recall}${C.reset} (${report.hits}/${report.total})`)
  for (const item of report.cases) {
    line(`  ${item.hit ? C.green + 'HIT ' + C.reset : C.yellow + 'MISS' + C.reset} 期望=${item.expect.join(',')} 实际=${item.top.join(',')}`)
  }
  line('')
  if (report.recall < 0.75) process.exitCode = 1
}

function market() {
  banner()
  head('DSH 插件市场索引（format 1）')
  const indexFile = path.join(ROOT, 'docs', 'plugin-market.json')
  const index = readJson(indexFile)
  const target = `${pkg.name}@${pkg.version}`
  if (!index) {
    bad(`缺少 ${indexFile}`)
    process.exitCode = 1
    return
  }
  ok(`索引文件：${indexFile}`)
  ok(`install target：${target}`)
  line('')
  dim('  把 docs/plugin-market.json 托管到 https URL（如 GitHub raw / Pages），加到 DSH 自定义插件市场索引即可被 Discover 搜到。')
  line(`  ${C.cyan}https://raw.githubusercontent.com/bugtakue/dsh-ronge-adaptive-skill-archive/main/docs/plugin-market.json${C.reset}`)
  line('')
}

function help() {
  banner()
  line(`  npx ${pkg.name}            打印安装命令（默认）`)
  line(`  npx ${pkg.name} doctor     环境与安装检查`)
  line(`  npx ${pkg.name} eval       离线推荐评估 Recall@4`)
  line(`  npx ${pkg.name} market     DSH 市场索引信息`)
  line(`  npx ${pkg.name} mcp        启动跨智能体 MCP server（stdio）`)
  line(`  npx ${pkg.name} version    版本`)
  line('')
  dim('  npm: https://www.npmjs.com/package/' + pkg.name)
  dim('  docs: https://bugtakue.github.io/dsh-ronge-adaptive-skill-archive/')
  line('')
}

switch (command) {
  case 'install':
  case 'i':
    printInstall()
    break
  case 'doctor':
  case 'check':
    doctor()
    break
  case 'eval':
  case 'evaluate':
    evaluate()
    break
  case 'market':
  case 'index':
    market()
    break
  case 'mcp': {
    const { startMcpServer } = await import(path.join(ROOT, 'mcp', 'server.mjs'))
    startMcpServer()
    break
  }
  case 'version':
  case '--version':
  case '-v':
    line(pkg.version)
    break
  case '--help':
  case '-h':
  case 'help':
    help()
    break
  default:
    bad(`未知命令：${command}`)
    help()
    process.exitCode = 1
}
