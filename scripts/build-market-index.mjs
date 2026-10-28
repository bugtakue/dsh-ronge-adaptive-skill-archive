/**
 * 生成 DSH 插件市场索引（format 1）：docs/plugin-market.json。
 *
 *   node scripts/build-market-index.mjs
 *   PUBLISH_TIMESTAMP=1761753600 node scripts/build-market-index.mjs   # 可选：发布时刻
 *
 * 发布后在 GitHub Release 里附上该文件（或直接托管 raw URL），
 * 用户把 URL 加到 DSH 的 Discover / 自定义插件市场索引即可浏览安装。
 * 格式校验（可选）：npm i -D @deepseek-ai/dsh-plugin-market-index 后本脚本会自动校验。
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const repoUrl = 'https://github.com/bugtakue/ronge-skill-studio'

const publishTimestamp = Number(process.env.PUBLISH_TIMESTAMP || Math.floor(Date.now() / 1000))
if (!Number.isInteger(publishTimestamp) || publishTimestamp < 0) {
  console.error('PUBLISH_TIMESTAMP must be an integer number of Unix seconds')
  process.exit(1)
}

const index = {
  format: 1,
  title: {
    en: "Ronge's Skill Scroll Archive",
    zh: '荣哥技能卷轴收藏馆',
  },
  description: {
    en: 'Context-aware skill cockpit for DeepSeek Harness: recommendations with reasons, live "now using", plan/immersive modes, experience memory + feedback, local pre-install safety scan, update diff/rollback.',
    zh: '面向 DeepSeek Harness 的上下文感知技能驾驶舱：推荐理由、正在使用、计划/沉浸模式、经验记忆与反馈、本地安装前安全扫描、更新 diff/回滚。',
  },
  metadata: {
    categories: {
      skills: { title: { en: 'Skills', zh: '技能管理' } },
      productivity: { title: { en: 'Productivity', zh: '效率工具' } },
    },
    labels: {
      recommendation: { title: { en: 'Recommendation', zh: '推荐' } },
      safety: { title: { en: 'Safety', zh: '安全' } },
      experience: { title: { en: 'Experience memory', zh: '经验记忆' } },
    },
  },
  plugins: [
    {
      name: pkg.name,
      title: {
        en: "Ronge's Skill Scroll Archive (Immersive Edition)",
        zh: '荣哥技能卷轴收藏馆（可沉浸式体验版本）',
      },
      description: {
        en: pkg.description,
        zh: '6,399 条公开技能索引、上下文推荐、计划/沉浸模式、安装前安全扫描、更新 diff/回滚、经验记忆与反馈闭环。',
      },
      author: 'bugtakue',
      homepage: repoUrl,
      repository: { url: repoUrl },
      metadata: {
        category: 'skills',
        keywords: ['dsh', 'skills', 'recommendation', 'safety', 'experience', 'skills-manager'],
        labels: ['recommendation', 'safety', 'experience'],
      },
      versions: [
        {
          version: pkg.version,
          publishTimestamp,
          source: { type: 'npm' },
        },
      ],
    },
  ],
}

const out = path.join(root, 'docs', 'plugin-market.json')
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, JSON.stringify(index, null, 2) + '\n')
console.log('wrote', path.relative(root, out), 'version', pkg.version)

let revision = ''
try {
  revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
} catch {
  revision = '(git unavailable)'
}
console.log('source commit:', revision)

try {
  const { parseMarketIndex, marketInstallTarget } = await import('@deepseek-ai/dsh-plugin-market-index')
  const indexUrl = 'https://raw.githubusercontent.com/bugtakue/ronge-skill-studio/main/docs/plugin-market.json'
  const parsed = parseMarketIndex(index, indexUrl)
  const plugin = parsed.plugins[0]
  const target = marketInstallTarget(plugin.name, plugin.versions[0])
  console.log('format 1 valid:', plugin.name, plugin.versions[0].version)
  console.log('install target:', target.spec, target.registry ? `(registry ${target.registry})` : '')
} catch (error) {
  if (error && error.code === 'ERR_MODULE_NOT_FOUND') {
    console.log('official validator not installed; skipped deep validation.')
    console.log('  npm i -D @deepseek-ai/dsh-plugin-market-index && node scripts/build-market-index.mjs')
  } else {
    console.error('market index validation failed:', error && error.message ? error.message : error)
    process.exitCode = 1
  }
}
