<p align="center">
  <img src="icon.svg" width="76" height="76" alt="荣哥技能卷轴收藏馆图标">
</p>

<h1 align="center">荣哥技能卷轴收藏馆</h1>
<h3 align="center">Ronge's Adaptive Skill Cockpit · v5</h3>

<p align="center"><b>把「该用哪个技能」升级成「拆任务 → 组队 → 造技能 → 验质量」的 DSH 原生技能驾驶舱。</b></p>

<p align="center">
  <a href="https://github.com/bugtakue/dsh-ronge-adaptive-skill-archive/actions/workflows/check.yml"><img src="https://github.com/bugtakue/dsh-ronge-adaptive-skill-archive/actions/workflows/check.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/version-5.0.0-blue.svg" alt="version 5.0.0">
  <img src="https://img.shields.io/badge/12-domains-8a6d2f.svg" alt="12 domains">
  <img src="https://img.shields.io/badge/DeepSeek%20Harness-plugin-1f6feb.svg" alt="DeepSeek Harness plugin">
</p>

<p align="center">
  <a href="https://bugtakue.github.io/dsh-ronge-adaptive-skill-archive/">在线落地页 / Landing page</a>
  ·
  <a href="docs/claims.md">声明与证据</a>
  ·
  <a href="docs/eval.md">评测口径</a>
  ·
  <a href="docs/benchmark.md">规划质量 benchmark</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/bugtakue/dsh-ronge-adaptive-skill-archive/main/docs/panel.png" width="360" alt="技能面板：推荐、组队计划、经验与自进化">
  <br>
  <sub>会话右侧的「技能」抽屉：推荐 / 组队计划 / 经验 / 安全与更新，都在一个面板里。</sub>
</p>

> **v5.4.0 发布说明**：本 README 是当前发布稿。三大新能力 `plan → compose → draft`（任务拆解 / 技能组队 / 按缺口造技能）与 12 领域包为本次发布新增；每条声明的证据、实测状态与未验证项统一记录在 **[docs/claims.md](docs/claims.md)**。benchmark 数字见 **[docs/benchmark.md](docs/benchmark.md)**（2026-10-30 快照）。

## 为什么需要 v5

市面上大多数 skill 工具停在「货架」：列出技能、搜索、安装、更新。技能多了之后，真正的问题变成：

1. **这个任务该拆成几步？** 一句话里可能同时有 Office 交付物和视频交付物。
2. **哪几个技能该组队、按什么顺序、谁交给谁？** 单点推荐解决不了多技能协作。
3. **找不到合适技能时怎么办？** 缺的是「纪要模板」这类具体能力，不是再装一个泛用技能。
4. **做完到底省了什么？** 需要可复跑的估算与 benchmark，而不是感觉变快了。

v5 的驾驶舱把这条链路补全：

```
选（推荐）→ 拆（decompose）→ 组（compose）→ 造（draft）→ 验（acceptance）
      ↑                                                        │
      └────────────── 经验 / 反馈 / 自进化 持续回流 ◄───────────┘
```

---

## 60 秒 Demo

真实数据版拍摄脚本：[docs/demo-60s.md](docs/demo-60s.md)。

## 30 秒安装

```bash
# 1) 先跑 npx 助手：检查环境 + 打印这台机器该用的安装命令（不装任何东西）
npx dsh-ronge-adaptive-skill-archive
#    想先体检：npx dsh-ronge-adaptive-skill-archive doctor

# 2) 把打印出的这一行交给任意 DSH 会话里的 Agent 执行（v5.4.0 发布后可用）
plugin_manager install_bundle target=dsh-ronge-adaptive-skill-archive@5.4.0

# 3) 刷新页面 → 右上角「技能」→ 右侧抽屉；计划模式 / 沉浸模式切换
```

> `npx` 是安装助手，不是替代 npm：它从 npm registry 取包，但**不修改 profile**，只检查 Node / profile / 数据目录 / 已装版本并打印安装命令。没有 npm 也能装：GitHub tag 或本地目录，见[安装](#安装)。

---

## 3 分钟 demo：plan → compose → draft

一个**跨领域、多意图**的真实任务：*「把这段会议录音整理成可交付的会议纪要 docx，再做一个 30 秒宣传片。」*
预期拆成 Office + 视频两条线，并在缺少「纪要模板」技能时现场造一个草稿。

### 0:00–0:40 打开驾驶舱

安装后打开任意会话，点右上角「技能」，切换到**计划模式**（先给方案、问过你再执行）。面板里能看到当前推荐、推荐理由和「正在使用」。

### 0:40–1:40 Step 1 · plan：拆任务

在会话里让 Agent 调用 DSH 原生工具 `skill_archive_plan`：

```text
用 skill_archive_plan 拆解这个任务，先不要执行：
「把这段会议录音整理成可交付的会议纪要 docx，再做一个 30 秒宣传片。」
```

示意输出（字段以实际版本为准）：

```text
目标：会议录音 → 纪要 docx + 30 秒宣传片
主意图：Office（会议纪要） / 次意图：视频（宣传片）
交付物：minutes.docx, teaser.mp4
约束：宣传片 30 秒、竖屏 9:16、纪要引用原话需带时间戳
子任务：转写 → 纪要 → 校验 → 分镜 → 素材 → 渲染 → 交付
缺口：没有「会议纪要模板」能力 → 需要 draftSkill
假设：录音已在本机；宣传片素材从会议录屏截取
置信度：中等偏低（含 2 条假设，需你确认）
```

这一步只拆解，**不执行、不装技能、不写文件**。

### 1:40–2:30 Step 2 · compose：组队

```text
用 skill_archive_compose 给上面的任务组队：2–5 个技能，标出顺序、交接、缺口和冲突。
```

示意输出（节选）：

| 阶段 | 角色 | 技能 | 为什么 | 交给下一步 |
|---|---|---|---|---|
| 1 | 生产 | `office-docx` | 生成可交付的 .docx 纪要 | 文稿文件 |
| 2 | 校验 | `office-render` | 渲染检查版式 / 分页 | 校验结论 |
| 3 | 生产 | `beat-promo-director` | 30 秒卡点分镜 | 分镜表 |
| 4 | 生产 | `media-use` | 素材、配乐、剪辑合规 | 素材包 |
| — | 缺口 | `meeting-minutes-template` | 没有现成技能 → `draftNeeded: true` | 进入 Step 3 |

默认 **sequential**；检测到校验意图时升级 **review-gate**（Office 交付物先过校验，再做视频）；两条线可以并行时给出并行段。`compose` 同时返回 assumptions / conflicts / fallback，并标注「这是计划，不是执行结果」。

### 2:30–3:00 Step 3 · draft：造技能

```text
用 skill_archive_draft_skill 补上「会议纪要模板」这个缺口：
只给我 SKILL.md 草稿、eval cases、lint 和安全扫描结果，不要写盘，不要执行。
```

示意输出：

- `SKILL.md` 草稿：frontmatter（name / description / whenToUse）+ 步骤 + I/O + 质量检查 + 失败处理 + 示例；
- `evalCases`：3–5 条「什么任务该触发它」的用例；
- `lint`：kebab 名称、描述长度、结构完整性；
- `safety`：本地启发式扫描（shell / 网络 / 凭据 / 过度授权）；
- **不写盘、不执行**：你确认后自己保存到 `~/.dsh/skills/<name>/SKILL.md`，或在面板点「新建技能」。

> 整个 demo 只产生**计划和草稿**，不会自动装技能、不会自动跑脚本。想让 Agent 真正执行，回到计划模式确认，或切沉浸模式（不问直接执行，风险自负）。

---

## 和技能市场 / 技能管理器比：我们只补「驾驶舱」这一层

> 口径：竞品信息来自其公开文档 / README（2026-10 整理），可能随版本变化；表格只比较与本插件重叠的维度。它们在生态规模、跨宿主、企业治理上远超本插件——那是它们的主场。**这是单宿主（DeepSeek Harness）的深度插件，不是通用技能市场。**

| 维度 | 本插件（v5） | skills.sh 生态 | Claude Code plugins | DSH 内技能管理插件 |
|---|---|---|---|---|
| 主形态 | DSH 右侧抽屉，单宿主深做 | 跨 agent 市场 + CLI | 官方插件市场 + skills | 目录 / 搜索 / 启停 / 安装 |
| 推荐 + 理由 | 会话上下文 → Top 4，附结构化理由 | 按安装量排行，无用户可见理由 | 按 `description` 自动加载 | 以列表、搜索为主 |
| 正在使用 | 真实 `skill` 工具调用，实时 | — | `/skill-doctor` 历史频次 | 部分有使用记录 |
| Plan / Immersive | skill 编排级双模式 | — | Plan 属权限模式 | — |
| **任务拆解 + 技能组队** | **v5：decompose → compose（阶段 / 交接 / 冲突 / 缺口）** | 无用户可见能力 | 有通用 plan 模式；无 skill 组队 | 无 |
| **按缺口造技能** | **v5：draft（SKILL.md + eval cases + lint + 安全扫描，不写盘）** | 无（作者自己写） | `skill-creator` 面向作者 | 无 |
| **边界可证** | **v5：estimate + 可复跑 benchmark + 真实 A/B 负面记录（docs/benchmark-live*.md）** | 安装量统计 | 作者侧评估 | 无 |
| 经验 → 自进化 | 经验记忆 + 👍/👎 归因 + 权重学习 + 10% 探索 | 安装量统计 | 作者侧评估 | 少数有使用记录 |
| 安装前安全 | 本地启发式扫描 + 信任分级 + 许可证 | 合作方审计（Vercel 公布） | 市场分层 + 来源校验 | 部分有 trust score |
| 更新 / 回滚 | 内容 diff + 备份 + 一键回滚 | lockfile + update | 市场内更新 | 部分有更新检查 |
| 数据 / 遥测 | 全本地，无遥测 | 安装遥测默认开启（可关） | 使用数据不回传作者 | 本地 |
| 规模口径 | 6,399 条 GitHub 公开 `SKILL.md` 元数据快照（2026-10-28） | 官方博客称 69,000+ / 站点另有 1.5M 级数字 | 官方精选，未公布总量 | 各家不同 |

> 「任务拆解 / 组队 / 造技能 / 验收」是 v5.0.0 新增，实现状态见 [docs/claims.md](docs/claims.md)。**不承诺省 token/更快**：真实 A/B 未达双指标改善，证据在 [docs/benchmark-live-artifacts.md](docs/benchmark-live-artifacts.md)。

---

## 12 领域覆盖

v5 的领域包覆盖 12 个领域，每个领域有任务 playbook、真实技能候选与 held-out 用例；覆盖率、组合合法率、上下文成本等结果统一记录在 [docs/benchmark.md](docs/benchmark.md)。

| 领域 | 典型交付物 | 会触发它的任务（示例） |
|---|---|---|
| 视频 / 创意 | mp4、分镜、动效 | 做一条 30 秒卡点宣传片 |
| Office | docx / pptx / xlsx / pdf | 把录音整理成带时间戳的纪要 |
| 软件工程 | 代码、测试、PR、修复 | 排查失败测试并补回归 |
| 数据 | 表格、分析、图表 | 分析这批 CSV 的异常并出图 |
| 研究 | 报告、综述、来源清单 | 收集 10 篇资料做对比综述 |
| 营销 | 文案、投放、竞品分析 | 给新品写一版小红书文案 |
| 设计 | UI、海报、品牌 | 给落地页做一版视觉稿 |
| 安全 | 审计、风险清单 | 检查这个 skill 能不能装 |
| 教育 | 课程、讲解、题解 | 把这个概念讲给新人 |
| 商业 | 商业计划、财务模型 | 做一版订阅制收入模型 |
| 效率 | 流程、自动化、模板 | 自动整理周报与待办 |
| AI | prompt、agent、RAG | 给 Agent 设计一套工具链 |

> 领域映射来自技能元数据的能力画像（`library/capability-index.json`，v5.0.0 生成），**不是人类专家认证**；跨领域任务的拆解结果请先看 assumptions 再执行。

---

## DSH 原生工具

v5.0.0 在 DSH 里注册三个**只读 / 只出草稿**的工具（面板与 MCP 之外的原生入口）：

| 工具 | 输入 | 输出 | 副作用 |
|---|---|---|---|
| `skill_archive_plan` | `task`，可选 `cwd` / `mode` | 目标、主 / 次意图、交付物、约束、领域、子任务、假设、置信度 | 无（不执行、不写盘） |
| `skill_archive_compose` | `task`，可选 `maxSkills` | 阶段化组合（顺序 / 并行 / review-gate / escalation）、每步技能与理由、缺口 `draftNeeded`、冲突、估算 | 无 |
| `skill_archive_draft_skill` | `task`，可选 `plan` / `missing` | `SKILL.md` 草稿、`evalCases`、lint、安全扫描 | 无（**不写盘、不执行**） |

- 没有 install / force / 执行类工具——安装与更新仍然走面板（有预览、安全扫描、备份、回滚）。
- 接口契约见 [docs/intelligence-architecture.md](docs/intelligence-architecture.md)；实现状态与实测清单见 [docs/claims.md](docs/claims.md)。
- 面板、HTTP（loopback）与 MCP 共用同一个本地引擎；MCP 让 Claude Code / Codex / Cursor 也能用推荐与经验（见 [docs/cross-agent.md](docs/cross-agent.md)）。

---

## 评测与边界（必读）

三类数据严格分开，不混用：

| 类型 | 含义 | 来源 | 当前状态 |
|---|---|---|---|
| **已测：推荐召回** | 30 条半人工任务，Top-4 里是否出现可用的已装技能 | [docs/eval.md](docs/eval.md) | Recall@4 = 0.9（27/30），运行于 v2.7.2 工作树，**引用需注明口径** |
| **已测：库检索** | 24 条任务在 6,399 索引里的类目命中 | [docs/eval.md](docs/eval.md) | Category Hit@5 等指标见文档；Hit@5 偏松，不能证明技能好用 |
| **v5：真实任务 A/B** | 6 条任务已跑；12 条 fixture 未跑完 | [docs/benchmark-live-artifacts.md](docs/benchmark-live-artifacts.md) | **不是效率胜利**：meeting +74% token、pptx +29% token；claim = not-achieved |
| **v5：规划 / 组队 / 质量** | planCoverage **0.333**、compositionValidity **1.00**、capabilityCoverage **0.717**、hintRecall **0.45**、gapDetection **1.00**（宽松口径：不假装已覆盖）、contextTokens mean **131.5** / p95 **193**（延迟为单机快照，不对外作 SLA）；基线 keyword 0.083/0.217/0.25/0.532；installLoad **0.3** | [docs/benchmark.md](docs/benchmark.md)（60 条 held-out，2026-10-30） | 指标是半人工基准，不等于真实成功率；installLoad 0.3 必须一起读 |

规则：

- **所有数字以脚本输出为准**：`node scripts/eval-real.mjs`、`node scripts/eval-discover.mjs`、`node scripts/benchmark.mjs --smoke`；文档不手改数字。
- **效率不是卖点**：`efficiencyEstimate` 只是 `method: 'estimate'` 的规划辅助；真实 A/B 没有达到 token/时间双改善，不对外承诺省 token 或更快。
- **评测不是质量榜**：评测是半人工用例，不是线上遥测；Recall@4 只衡量「已装技能推荐」，不代表 6,399 条库的整体质量。v5 规划 benchmark 见 [docs/benchmark.md](docs/benchmark.md)。
- 证据矩阵（每条声明 → 证据 → 标签）见 [docs/claims.md](docs/claims.md)。

---

## 安全边界（先读再装）

- **推荐、拆解、组队、草稿、扫描、自进化全部在本机完成**：不调用外部模型、不上传、无遥测。
- **安装前安全扫描是本地启发式提示，不是安全保证**：能发现 shell 执行、`curl | bash`、动态解码、提示注入、凭据路径、网络访问、文件写入、过宽 `allowed-tools` 等模式，但静态扫描覆盖不了全部攻击面；安装前仍要预览全文。
- **高风险默认拒绝**：面板安装、更新中心、MCP `install_skill` 一致——高风险 `SKILL.md` 默认拒绝，必须显式 force 才写入/更新（force 是你的责任）。
- **只从 `raw.githubusercontent.com/**/SKILL.md` 拉取**，上限 256 KiB，不自动拉脚本 / 资源，不覆盖已有技能；重名安装自动改名。
- **draft 不写盘、不执行**；DSH 侧没有 install / force 工具；MCP 的 `install_skill` 有同样的扫描与拒绝门槛。
- 新建技能只写入 `~/.dsh/skills/<kebab-case-name>/SKILL.md`，名称白名单拒绝 `/`、`..` 与绝对路径。
- 数据目录默认 `~/.dsh/dsh-ronge-adaptive-skill-archive/`；卸载 bundle 不会删除数据。
- **不宣称「无漏洞」**：本项目没有安全认证、没有第三方审计报告；「安全」指上面这些本地检查与拒绝策略。

---

## 安装

### 前置

- DeepSeek Harness（Desktop / Web profile）；已验证基线 DSH Desktop 0.2.1-rc.3（见 [docs/dsh-compatibility.md](docs/dsh-compatibility.md)）
- macOS（提示音用系统 `afplay`；Linux 可改为 `paplay`）
- 安装插件需要 `danger-full-access` 或审批

### 四种入口（profile 级，所有会话生效）

| 方式 | 命令 | 适合 |
|---|---|---|
| **npx 助手** | `npx dsh-ronge-adaptive-skill-archive`（体检：`npx dsh-ronge-adaptive-skill-archive doctor`） | 第一次用；不装东西，只体检 + 打印安装命令 |
| **npm** | `plugin_manager install_bundle target=dsh-ronge-adaptive-skill-archive@5.4.0` | v5.4.0 发布到 npm 后可用 |
| **GitHub tag** | `plugin_manager install_bundle target=git+https://github.com/bugtakue/dsh-ronge-adaptive-skill-archive.git#v5.4.0` | 固定版本、可审源码 |
| **本地目录** | `plugin_manager install_bundle target="/absolute/path/to/dsh-ronge-adaptive-skill-archive"` | 开发、改代码、离线 |

> v5.0.0 打 tag / 发布 npm 之前，`@5.0.0` 会 404：请先用本地目录，或安装当时最新的已发布版本。安装后 DSH 需**重启**才会加载新的 Host 模块；浏览器刷新加载 Client。

### 升级

- **从 v3.x 升级**：直接覆盖安装 v5.0.0；数据目录、经验、权重、更新记录沿用。
- **从 v2.x / v1.x 升级**：v3.0.0 起包名 / 路由 / bundle id 已改名，先移除旧 bundle 再装新版本；旧数据目录会在首次启动时自动合并（旧目录保留）。见 [v3.0.0 发布说明](docs/release-notes-v3.0.0.md)。

### 数据在哪

| 路径 | 内容 |
|---|---|
| `~/.dsh/dsh-ronge-adaptive-skill-archive/config.json` | 模式（plan / immersive） |
| `.../experience.md` / `experience.json` | 经验（人读 / 机读） |
| `.../evolution.json` | 权重、探索配额、变更历史 |
| `.../rec-feedback.json` | 推荐反馈 |
| `.../skills-lock.json` | 安装来源 / SHA-256 / 信任 / 许可证 |
| `.../backups/<skill>/<timestamp>.md` | 更新前备份 |
| `~/.dsh/skills/<name>/SKILL.md` | 已安装 / 新建的技能 |

---

## 架构

```
┌─ DeepSeek Harness ──────────────────────────────────────────────┐
│  session header ──[技能]──► 右侧抽屉（client.js，无构建）        │
│        │                          │                             │
│  session events              HTTP（仅 loopback，无新端口）       │
│        └───────────┬──────────────┘                             │
│                    ▼                                            │
│  Host（index.js）                                               │
│   推荐 / 经验 / 自进化 / 安全扫描 / 更新 / 卷轴馆               │
│   v5 智能引擎：decompose · compose · draft · efficiency         │
│   DSH 原生工具：skill_archive_plan / compose / draft_skill      │
│                    │                                            │
│  lib/intelligence（纯函数、零依赖、无网络）                     │
│  MCP server（跨 agent：推荐 / 发现 / 安装 / 经验）              │
│                    │                                            │
│   ~/.dsh/dsh-ronge-adaptive-skill-archive/  ← 配置/经验/权重    │
│   ~/.dsh/skills/                            ← 安装/新建的技能    │
└─────────────────────────────────────────────────────────────────┘
```

Host 只依赖 Node 内置模块；Client 是 plain JS（`window.__ModuleLoader__.load`，无 JSX、无构建）；智能引擎是纯函数模块，零依赖、确定性、无网络。路由只监听 loopback。

---

## 已知限制

1. **推荐 / 检索是启发式**：关键词 + 中文二元组 + 256 维哈希向量 + 信号分，不是神经模型；改写、隐喻、小语种仍会失手。
2. **拆解 / 组队是规则引擎**：decompose / compose 基于领域词表、交付物识别与能力画像，不是 LLM 推理；多意图任务可能主次颠倒，执行前请先看 assumptions 与 conflicts。
3. **效率不是卖点**：`estimate` 不等于实测节省；真实 A/B 未达标，不写效率提升百分比。
4. **6,399 不是质量榜**：1,001 条无描述、512 个重名、没有人工质量标注；quality 是完整度 + 仓库信号的启发式，stars 是 2026-10-29 快照，会过期。数据口径与来源见 [docs/attribution.md](docs/attribution.md)。
5. **评测覆盖有限**：30 条已装技能、24 条库检索，以及 v5 规划 benchmark（见 [docs/benchmark.md](docs/benchmark.md)）；样本小，单条变化会影响指标。
6. **Plan / Immersive 是 prompt 级**：模型可能忽略模式指令；不是权限级硬约束。
7. **单宿主**：DSH 原生；MCP 可接入 Claude Code / Codex / Cursor，但没有 DSH 面板 UI。
8. **12 领域 ≠ 人类专家**：领域包提供路由与 playbook，不能宣称达到任何行业的人类专家水平。
9. **未审计**：没有第三方安全审计或认证；扫描是启发式，不构成安全保证。

---

## 开发与贡献

```bash
npm run check            # 校验 client factory id 与包名一致
npm test                 # 单元 + 路由 + 迁移 + 兼容性测试（不联网）
node scripts/eval-real.mjs      # 30 条真实任务 Recall@K
node scripts/eval-discover.mjs  # 24 条库检索评测
node scripts/benchmark.mjs --smoke   # v5 智能引擎 smoke（合并后可用）
npm run check:dsh        # DSH 兼容性静态检查
```

欢迎从 [Issues](https://github.com/bugtakue/dsh-ronge-adaptive-skill-archive/issues) 的「拆解错了 / 组队不合理 / 推荐不准 / 声明没证据」开始；声明纠错比 star 更有价值。提交对外文档改动前，请先更新 [docs/claims.md](docs/claims.md) 的对应行。

---

## License

MIT。见 [LICENSE](LICENSE)。索引中的技能元数据归原作者，边界见 [docs/attribution.md](docs/attribution.md)。

---

<p align="center">
<b>如果这个驾驶舱帮你少想一步「该用哪个技能」，欢迎点一个 Star。</b><br>
不刷星、不承诺榜单；发现夸大的声明，请直接开 issue 打脸——我们会改文档或删声明。
</p>

---

## English

**Ronge's Adaptive Skill Cockpit (v5)** is a DSH-native skill cockpit for [DeepSeek Harness](https://github.com/bugtakue/dsh-ronge-adaptive-skill-archive). It goes beyond listing and installing skills: it **decomposes a task, composes a skill team, drafts the missing skill, and makes the scope auditable**.

- **Plan → compose → draft** — three read-only DSH tools (`skill_archive_plan`, `skill_archive_compose`, `skill_archive_draft_skill`) turn one task into deliverables, staged skill plans, and a `SKILL.md` draft with eval cases + lint + safety scan. Nothing is written or executed.
- **Context-aware recommendations** — Top 4 with structured reasons (name / keyword / category / experience / affinity / exploration), local heuristic, no model calls.
- **Live "now using"** — read from real `skill` tool calls, not inferred.
- **Plan / Immersive modes** — ask-first orchestration, or no-ask auto-composition.
- **Experience + self-evolution** — local feedback-weighted learning with a 10% exploration quota (0–30%), logged and rollback-able.
- **Honest scope** — no token-savings claim; real A/B is recorded even when negative. Claims matrix: [docs/claims.md](docs/claims.md).
- **Safety boundary** — local heuristic scan (not a guarantee), high-risk installs refused by default, only `raw.githubusercontent.com/**/SKILL.md` (≤ 256 KiB), no auto-assets, backup + rollback.
- **12 domains** — video/creative, Office, software, data, research, marketing, design, security, education, business, productivity, AI.
- **6,399-skill metadata index** — public GitHub `SKILL.md` snapshot (2026-10-28), 14 categories; metadata only, no body redistribution ([docs/attribution.md](docs/attribution.md)).

**Install** (in a DSH session):

```bash
plugin_manager install_bundle target=dsh-ronge-adaptive-skill-archive@5.4.0
# then open any session → 「技能」 → switch Plan / Immersive
```

**Privacy**: everything (recommendations, plans, drafts, scans, learning) runs locally; no telemetry, no uploads. MIT licensed — see [LICENSE](LICENSE), [CONTRIBUTING.md](CONTRIBUTING.md), and the claim/evidence matrix in [docs/claims.md](docs/claims.md).
