<p align="center">
  <img src="icon.svg" width="76" height="76" alt="荣哥技能卷轴收藏馆图标">
</p>

<h1 align="center">荣哥技能卷轴收藏馆</h1>
<h3 align="center">Ronge's Adaptive Skill Cockpit（沉浸式体验版）</h3>

<p align="center"><b>不是「最大的技能库」，而是「最懂你此刻该用哪个技能的驾驶舱」——本地、可解释、会记住效果。</b></p>

<p align="center">
  <a href="https://github.com/bugtakue/ronge-adaptive-skill-archive/actions/workflows/check.yml"><img src="https://github.com/bugtakue/ronge-adaptive-skill-archive/actions/workflows/check.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/version-2.1.2-blue.svg" alt="version 2.1.2">
  <a href="https://www.npmjs.com/package/ronge-adaptive-skill-archive"><img src="https://img.shields.io/npm/v/ronge-adaptive-skill-archive?label=npm" alt="npm"></a>
  <img src="https://img.shields.io/badge/DeepSeek%20Harness-plugin-1f6feb.svg" alt="DeepSeek Harness plugin">
</p>

<p align="center">
  <a href="https://bugtakue.github.io/ronge-adaptive-skill-archive/">🌐 在线落地页 / Landing page</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/bugtakue/ronge-adaptive-skill-archive/main/docs/panel.png" width="360" alt="技能面板：卷轴馆 tab，6,399 条 GitHub 公开 SKILL.md 索引">
  <br>
  <sub>会话右侧的「技能」抽屉：6,399 条公开 SKILL.md 索引、上下文推荐、正在使用、经验与自进化都在这里。</sub>
</p>

## 30 秒开始

```bash
# 1) 先跑 npx 助手：检查环境 + 打印这台机器该用的安装命令（不装任何东西）
npx ronge-adaptive-skill-archive
#    想先体检：npx ronge-adaptive-skill-archive doctor

# 2) 把打印出的这一行交给任意 DSH 会话里的 Agent 执行
plugin_manager install_bundle target=ronge-adaptive-skill-archive@2.1.3

# 3) 刷新页面 → 右上角「技能」→ 右侧抽屉；计划模式 / 沉浸模式切换
```

> `npx` 不是 npm 的替代品（它本身也从 npm registry 取包），而是「装之前先看一眼」的安装助手：不修改 profile、不联网做任何写入，只打印命令和检查 Node / profile / 数据目录 / 已装版本。**没有 npm 也能装**：用 GitHub tag 或本地目录路径，见[安装](#安装)。

---

## 为什么是「驾驶舱」而不是「货架」

大多数 skill 工具回答的是「有哪些 skill、怎么装」。这个插件回答三个更贴近当下任务的问题：

1. **现在这个项目、这句话，适合用哪个 skill？** —— 结合会话最近内容 + 项目文件名，给出 Top 4 和匹配理由。
2. **我现在到底在用哪些 skill？** —— 从真实的 `skill` 工具调用里读，不靠猜。
3. **哪些做法真的有效？** —— 任务完成后写入经验，你的 👍/👎 会反过来教推荐器。

它不替代 Agent 自己的 skill catalog，只是把「该用哪个」变成一眼可见，并让系统随使用变准。

### 和同类项目比

> 口径：竞品信息来自其公开文档/README（2026-10 整理），可能随版本变化；本行只比较与本插件重叠的维度。它们在生态规模、跨宿主、企业治理上远超本插件——那是它们的主场，不是我们的。**这是单宿主（DeepSeek Harness）的深度插件，不是通用技能市场。**

| 维度 | 本插件 | skills.sh 生态 | Claude Code plugins | DSH 内技能管理插件 |
|---|---|---|---|---|
| 主形态 | DSH 右侧抽屉，单宿主深做 | 跨 agent 市场 + CLI | 官方插件市场 + skills | 目录 / 搜索 / 启停 / 安装 |
| 推荐 + 理由 | 会话上下文 → Top 4，附名称/关键词/类别/经验/手感理由 | 按安装量排行，无用户可见理由 | 模型按 `description` 自动加载，无用户可见排序 | 以列表、搜索为主 |
| 正在使用 | 真实 `skill` 工具调用，实时显示 | — | `/skill-doctor` 历史频次、Last used | 部分有使用记录 |
| Plan / Immersive | **skill 编排级**双模式：先问 = 计划，不问 = 沉浸 | — | Plan 属权限模式，不针对 skill 选择 | — |
| 经验 → 自进化 | 经验记忆 + 👍/👎 归因 + 本地权重学习 + 探索配额 | 安装量统计 | skill-creator 面向作者做评估 | 少数有使用记录，无权重学习 |
| 安装前安全 | 本地启发式扫描 + 信任分级 + 许可证 | 合作方审计（Vercel 公布） | 市场分层 + 来源校验 + sha256 | 部分有 trust score |
| 更新 / 回滚 | 内容 diff + 更新前备份 + 一键回滚 | lockfile + update | 市场内更新 | 部分有更新检查，回滚少见 |
| 数据 / 遥测 | **全本地，无遥测** | 安装遥测默认开启（可关） | 使用数据不回传作者 | 本地 |
| 规模口径 | 6,399 条 GitHub 公开 `SKILL.md` 可复核快照（2026-10-28） | 官方博客称 69,000+；站点另有 1.5M 级数字，口径未注明 | 官方 marketplace 精选，未公布总量 | 各家不同 |

> 「四项同时具备」的判断来自我们对 28 个相关项目的公开资料梳理（自报口径，欢迎 issue 指正）；如果你发现有项目已做到，告诉我们，我们会更新这张表。

---

## 在其他智能体里用（Claude Code / Codex / Cursor）

同一个推荐 + 经验 + 自进化引擎，通过 **MCP（stdio）** 接入任意支持 MCP 的智能体：

```bash
# Claude Code
claude mcp add ronge -- npx -y ronge-adaptive-skill-archive mcp

# Codex: ~/.codex/config.toml
# [mcp_servers.ronge]
# command = "npx"
# args = ["-y", "ronge-adaptive-skill-archive", "mcp"]

# Cursor: ~/.cursor/mcp.json 的 mcpServers 同上
```

提供 `recommend_skills`（带理由）、`search_skills`（6,399 条索引）、`scan_skill_text`（安装前扫描）、`install_skill`（写入 Claude Code / Codex / DSH 技能目录，带备份）、`record_outcome`（反馈驱动自进化）、`experience_summary`；另有 **prompts**（Claude Code 里是 `/mcp__ronge__recommend`、`/mcp__ronge__skill-workflow`）和 **resources**（`ronge://experience/summary`、`ronge://library/{name}`、`ronge://skill/{name}`）。完整配置与边界见 [docs/cross-agent.md](docs/cross-agent.md)。

## 核心功能

### 当前组合通知 + 只看未装

- 面板顶部常驻「当前组合」：运行中的 skill/skill 组合、平均评级、为什么切到这个组合（推荐理由归因）。
- 组合切换时右下角弹出小通知（即使面板关着也会轮询提醒），点一下打开面板。
- 卷轴馆默认「只看未安装」，并新增「库里还没装的」区块：按整段会话从 6,399 条索引里挑 3 个未安装技能，带评分/预览/安装。
- **更优技能自动升级**：推荐器会对比「已装技能」和「库里未装技能」；发现明显更匹配的未装技能时，面板显示「发现更优的未装技能」（命中关键词、评分、相比已装的证据），默认自动安装（安全扫描拦截高风险），已装且好用的继续保留。

### 上下文推荐（带理由）

读取当前会话**最近 8 条用户消息**和**项目根最多 80 个文件名**，对技能的 `name + description + whenToUse` 做本地打分：中英文 token 重叠 + 技能名命中 + 类别线索 + 经验/手感加权，只返回得分 > 0 的 **Top 4**。每条都带结构化理由：命中的名称、关键词、类别、经验次数、「手感」或「探索」。面板打开时每 10 秒静默刷新，不打断输入。

### 正在使用 / 最近使用

从会话真实的 `skill` 工具调用读取当前 turn 正在用的技能；空闲时显示最近使用。不是分析推测，是工具调用事实。

### 计划模式 / 沉浸模式

| 模式 | 行为 |
|---|---|
| **计划模式**（默认） | 下一次任务开始前先给方案和 1–3 个推荐 skill，**先问你确认**，确认后再执行 |
| **沉浸模式** | **不询问**，按上下文自动匹配并组合 1–3 个 skill 执行，结束时说明用了哪些、为什么 |

两种模式都是 prompt 级默认行为，不是硬编码固定管线（诚实边界，见文末）。

### 经验记忆 + 反馈

主会话任务完成、且用了至少一个 skill 时，自动写入一条经验：任务、Skills、结果摘要、耗时、会话。人读的写在 `experience.md`，机读的写在 `experience.json`。推荐分里会加 `min(4, uses × 0.8)`，好评再加、差评再减——用得越稳的 skill 越容易被优先想到。支持跨会话成功率、平均耗时、连续失败，以及经验 JSON 导出/导入。

### 自进化：10% 探索 + 权重学习

推荐权重不是写死的常数，而是**可学习参数**：反馈会被归因到「产生这条推荐的 top 理由类型」，然后以小步长、有上下界地微调。探索配额保证系统不会「越推荐越窄」：**默认 10% 的推荐位给平时很少被推荐的技能；如果探索长期没人采用会自动调低，采用率高会自动调高（可调范围 0–30%）**。完整参数见下一节。

### 安装前安全扫描

预览/安装任何第三方 `SKILL.md` 前，在本机跑一遍启发式静态扫描：shell 执行、`curl | bash`、动态解码（eval/base64）、提示注入语句、网络访问、凭据路径、文件写入、过宽 `allowed-tools`。输出低/中/高风险与命中行号，并展示来源信任级别（official / verified / community / local / unknown）和 `license` 字段。**只读文本，不联网、不上传、不执行。**

### 更新 diff / 更新全部 / 回滚

`skills-lock.json` 记录每个已安装 skill 的来源、repo、SHA-256、信任、许可证与时间戳。检查更新时返回**内容 diff**（新增/删除/改动行）；支持单条更新、一键全部更新，更新前自动备份到 `backups/<skill>/<timestamp>.md`，随时回滚到上一版。

### 6,399 条卷轴馆

GitHub 公开、可检索的 `SKILL.md` 元数据快照（2026-10-28）：**6,399 条，其中 5,398 条带描述，14 个分类**（AI 2,070 / 编程 789 / 设计 663 / 数据 512 / 其他 1,662 / 视频 163 / 写作 155 / 效率 122 / 办公 86 / 营销 53 / 安全 48 / 研究 41 / 商业 24 / 教育 11）。按分类、最低评分、关键词筛选，预览全文后安装。口径写清楚：这不是「全网所有 skill」，只覆盖 GitHub 上公开可检索到的 `SKILL.md`，且不存正文。

### MCP 目录 + 小功能

「工具」页浏览 MCP 官方 registry 的服务器（只发现，不自动安装/配置）。另有中英双语技能简介、主任务完成提示音（子智能体/fork 不响）、新建 Skill 到 `~/.dsh/skills/`。

---

## 越用越好用：机制与参数

```
你的反馈（复制 /skill = adopt，👍 / 👎）──归因到理由类型──► 权重微调 ──► 下一次排序更准
        ▲                                                        │
        └──────────── 经验记忆 + 10% 探索配额持续采样 ◄───────────┘
```

| 信号 | 记录位置 | 影响 |
|---|---|---|
| 复制 `/skill`（采用） | `rec-feedback.json` + `kindBySkill` | 归因到产生该推荐的 top 理由类型 |
| 👍 / 👎 | 同上，另加类别与技能「手感」 | 同类理由、类别权重、该技能亲和度一起学习 |
| 经验条目 👍 / 👎 | `evolution.json` | 通过上次推荐归因，不污染无关技能 |

- **评估节奏**：每累计 10 条反馈评估一次；任一理由类型样本 ≥ 8 才调整，冷启动完全不动。
- **权重默认值**：名称 8 / 关键词 1 / 经验 1 / 类别 0.6 / 完成度 1；命中率 ≥ 70% 时 ×1.1、≤ 40% 时 ×0.9（步长 10%），带上下界（如名称 4–14、类别 0.2–1.5）。
- **类别权重**：视频、办公、Harness、通用四类，范围 0.5–2，按你的真实好评/差评调整。
- **探索配额**：默认 10%，范围 0–30%。命中时把推荐末位换成一条用得少的候选（标记「探索」）；累计 20 次探索后，若采用率 < 5% 则降 5%，≥ 30% 则升 5%。
- **护栏**：全部本地、无网络、无模型调用；变更历史最多 50 条，可查看、回滚、重置；不自动删数据。

---

## 安装

### 前置

- DeepSeek Harness（Desktop / Web profile）
- macOS（提示音用系统 `afplay`；Linux 可改为 `paplay`）
- 安装插件需要 `danger-full-access` 或审批

### 四种入口（profile 级，所有会话生效）

| 方式 | 命令 | 适合 |
|---|---|---|
| **npx 助手** | `npx ronge-adaptive-skill-archive`（体检：`npx ronge-adaptive-skill-archive doctor`） | 第一次用；不装东西，只体检 + 打印安装命令 |
| **npm** | `plugin_manager install_bundle target=ronge-adaptive-skill-archive@2.1.3` | 已发布到 npm，版本解析最顺 |
| **GitHub tag** | `plugin_manager install_bundle target=git+https://github.com/bugtakue/ronge-adaptive-skill-archive.git#v2.1.3` | 不用 npm、固定版本、可审源码 |
| **本地目录** | `plugin_manager install_bundle target="/absolute/path/to/ronge-adaptive-skill-archive"` | 开发、改代码、离线 |

### 升级（v1.x / v2.0.0 → v2.1.0）

- 已装 **v2.0.0**：直接覆盖安装 v2.1.0，数据目录、经验与权重沿用。
- 从 **v1.x** 升级：v1.x 与 v2.x 的包名、路由前缀不同，同一 profile 不能同时启用——先移除旧 bundle，再装 v2.1.0；旧数据目录会在首次启动时**自动复制**（旧目录保留，不删除）。

重命名细节见 [v2.0.0 发布说明](docs/release-notes-v2.0.0.md)，v2.1.0 的变更见 [CHANGELOG](CHANGELOG.md)。

### 数据在哪

| 路径 | 内容 |
|---|---|
| `~/.dsh/ronge-adaptive-skill-archive/config.json` | 模式（plan / immersive） |
| `~/.dsh/ronge-adaptive-skill-archive/experience.md` / `.json` | 经验（人读 / 机读） |
| `~/.dsh/ronge-adaptive-skill-archive/evolution.json` | 权重、探索配额、变更历史 |
| `~/.dsh/ronge-adaptive-skill-archive/rec-feedback.json` | 推荐反馈 |
| `~/.dsh/ronge-adaptive-skill-archive/skills-lock.json` | 安装来源 / SHA-256 / 信任 / 许可证 |
| `~/.dsh/ronge-adaptive-skill-archive/backups/<skill>/<timestamp>.md` | 更新前备份 |
| `~/.dsh/skills/<name>/SKILL.md` | 已安装 / 新建的技能 |

技能来源（优先级从高到低）：项目 `.dsh/skills` → 项目 `.agents/skills` → profile 目录 → `~/.dsh/skills` → 用户 agents 目录 → 预设包，并合并会话 `ctx.skills` 注册表。

### 插件市场索引（可选）

[docs/plugin-market.json](docs/plugin-market.json) 是 DSH format 1 市场索引，可托管到 https URL 后在 DSH 的自定义插件市场里被发现。发版后运行 `npm run build:market-index` 更新版本。

---

## 隐私与安全边界

- **推荐、扫描、自进化全部在本机完成**，不调用外部模型或网络；不上传、不写日志、无遥测。
- 推荐只读取当前会话最近的消息和项目根目录文件名；面板显示来自真实工具调用的数据。
- 安装前扫描是**本地启发式提示，不是安全保证**（静态扫描无法覆盖全部攻击面）；安装前仍应预览全文。
- 只允许从 `raw.githubusercontent.com/**/SKILL.md` 拉取，最大 256 KiB，不自动拉脚本/资源，不覆盖已有 skill。
- 新建技能只写入 `~/.dsh/skills/<kebab-case-name>/SKILL.md`，名称白名单拒绝 `/`、`..` 和绝对路径。
- MCP 目录只做发现，不自动安装配置；提示音失败不影响任务。
- 换提示音：`export DSH_TASK_CHIME_SOUND=/System/Library/Sounds/Ping.aiff`

---

## 架构

```
┌─ DeepSeek Harness ──────────────────────────────────────────┐
│  session header ──[技能]──► 右侧抽屉（client.js，无构建）    │
│        │                          │                         │
│  session events              HTTP（仅 loopback，无新端口）   │
│        └───────────┬──────────────┘                         │
│                    ▼                                        │
│        Host（index.js，仅 Node 内置模块）                    │
│  catalog · 推荐 · 经验 · 自进化 · 安全扫描 · lock/diff/回滚  │
│  MCP 目录 · 卷轴馆索引 · 提示音 · system prompt 注入         │
│                    │                                        │
│   ~/.dsh/ronge-adaptive-skill-archive/  ← 配置/经验/权重     │
│   ~/.dsh/skills/                        ← 安装/新建的 skill  │
└─────────────────────────────────────────────────────────────┘
```

Host 只依赖 Node 内置模块；Client 是 plain JS，经 `window.__ModuleLoader__.load` 注册，无需构建、无 JSX。路由只监听 loopback，由 `webServer` 注册。

---

## 路线图

以下是接下来想补的方向（计划，不是承诺；欢迎 PR 认领）：

- **输入框推荐 chips**：面板内 Top 2 chips 已有一键复制 `/skill`，下一步接进 composer。
- **按项目置顶**：每个 workspace 记住常用 skill，打开面板先显示 pinned。
- **本地语义搜索**：词典/本地 embedding 混合，搜「帮我做张海报」也能命中图片类技能。
- **推荐理由三段式**：任务类型 / 项目指纹 / 经验值分组展示，并扩大离线金标集。
- **原生右侧栏 tab 与快捷键**：不再用抽屉，`Cmd+Shift+S` 打开面板。
- **健康报告迭代**：frontmatter 缺失、重名、断链一次标出。

---

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。无构建步骤、无运行时依赖；改完跑：

```bash
npm run check            # 校验 client factory id 与包名一致
npm test                 # 单元 + 路由 + 迁移测试（不联网）
npm run eval:recommend   # 离线推荐金标集 Recall@K
node --check index.js && node --check client.js
```

欢迎从 [Issues](https://github.com/bugtakue/ronge-adaptive-skill-archive/issues) 里的「推荐不准」「某个 skill 该降权」开始——这类反馈比 star 更有用。

---

## License

MIT。见 [LICENSE](LICENSE)。

---

<p align="center">
<b>如果这个面板帮你少翻一次目录、少装错一个 skill，欢迎点一个 Star。</b><br>
也欢迎把「我这里推荐不准」发到 Issues——那是最有价值的反馈。
</p>

---

## English

**Ronge's Adaptive Skill Cockpit (Immersive Edition)** is a context-aware, self-evolving skill cockpit for [DeepSeek Harness](https://github.com/bugtakue/ronge-adaptive-skill-archive). A single bundle adds a right-side drawer that answers three questions most skill tools ignore: *which skill fits this task now*, *which skills am I actually using*, and *which ones actually work for me*.

- **Contextual recommendations with reasons** — recent session messages + project file names → Top 4, with name / keyword / category / experience / affinity reasons. Local heuristic, no model calls.
- **Now using** — read from real `skill` tool calls, not inferred.
- **Plan / Immersive modes** — ask-first skill orchestration, or no-ask auto-composition of 1–3 skills.
- **Experience memory + feedback** — `experience.md/json`, cross-session success rate, export/import.
- **Self-evolution** — feedback-attributed, bounded weight tuning plus a 10% exploration quota; fully local, logged, and rollback-able.
- **Pre-install safety scan** — local heuristic scan (shell exec, pipe-to-shell, dynamic eval, prompt injection, credentials, over-broad `allowed-tools`), trust level and license.
- **Update center** — content diff, update-all, backup before overwrite, one-click rollback.
- **6,399-skill index** — snapshot of public GitHub `SKILL.md` files (14 categories, 1–5 rating), plus a browsable MCP registry and completion chime.

**Install** (in a DSH session):

```bash
plugin_manager install_bundle target=git+https://github.com/bugtakue/ronge-adaptive-skill-archive.git#v2.1.2
# then open any session → 「技能」in the header → switch Plan / Immersive
```

**Privacy**: everything (recommendations, scans, learning) runs locally; no telemetry, no uploads. The safety scan is a heuristic hint, not a security guarantee. MIT licensed — see [LICENSE](LICENSE) and [CONTRIBUTING.md](CONTRIBUTING.md).
