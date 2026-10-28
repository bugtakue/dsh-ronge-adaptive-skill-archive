# 荣哥技能卷轴收藏馆（可沉浸式体验版本）

> **English name: Ronge's Adaptive Skill Cockpit (Immersive Edition)** — a context-aware, self-evolving skill cockpit for DeepSeek Harness. （包名/仓库：`ronge-adaptive-skill-archive`；旧英文名：Ronge's Skill Scroll Archive）

[![check](https://github.com/bugtakue/ronge-adaptive-skill-archive/actions/workflows/check.yml/badge.svg)](https://github.com/bugtakue/ronge-adaptive-skill-archive/actions/workflows/check.yml)

> 一个给 DeepSeek Harness 的上下文感知技能工作台：**它会读当前会话和项目，主动告诉你「现在适合用哪个 Skill」，实时显示「正在用哪些 Skill」，还能进入计划/沉浸模式，并把每次任务的技能使用写成经验记忆。**

一个 bundle，十四个能力：

- 🧠 **Skill Radar · 智能推荐**：根据当前会话最近的内容和项目目录，给技能打分排序，显示 Top 4 与匹配原因。
- 🟢 **Now Using · 正在使用**：从会话的 `skill` 工具调用里读出当前 turn 正在用的技能；不在运行时显示「最近使用」。
- 🧭 **Smart Modes · 智能模式**：
  - **计划模式**：Agent 先给方案，**会先问你确认**，确认后再执行；
  - **沉浸模式**：**不询问**，根据上下文自动匹配 1–3 个 skill 并协同执行。
- 📈 **Experience · 经验记忆**：每次主任务完成，自动把「任务 / 用了哪些 skill / 结果摘要」写进 `experience.md`；👍/👎 反馈会反过来调整推荐权重。
- 🔔 **Done Chime · 完成提示音**：主任务完成时播放一声轻提示音；子智能体、fork 会话不响。
- 🌐 **Localized intro · 双语简介**：根据上下文语言自动显示中文或英文的一句话简介，一眼看懂 skill 干什么。
- 🌐 **Discover · 远程发现**：从精选 GitHub 源搜索 SKILL.md，预览后安装；记录来源/哈希，支持更新检查。
- 🧰 **Tools · MCP 目录**：浏览官方 MCP registry 里的服务器；工具和 skill 分开展示。
- 📚 **Scroll Library · 荣哥技能卷轴收藏馆**：GitHub 公开 SKILL.md 的分类 + 评级索引，按分类/评分浏览、预览、安装。
- 🛡️ **Safety Radar · 安装前安全提示**：本地静态扫描 shell 执行 / 下载后直接执行 / 动态解码 / 提示注入 / 网络访问 / 凭据路径 / 过宽 `allowed-tools`，给出低/中/高风险与命中行号；同时解析 `license` 与来源信任级别（official / verified / community / local / unknown）。不联网、不上传、不执行。
- 🔄 **Update Center · 更新与回滚**：`skills-lock.json` 记录来源 / 哈希 / 信任 / 许可证；检查更新时返回**内容 diff**；支持单条更新、一键全部更新（更新前自动备份到 `~/.dsh/ronge-adaptive-skill-archive/backups/<skill>/`）与回滚。
- 🧪 **Recommendation Eval · 推荐评估**：推荐理由升级为结构化 `reasonsDetail`（名称 / 关键词 / 类别 / 经验四类）；内置离线金标集与 `npm run eval:recommend`（Recall@K）；面板可对推荐点「采用 / 👍 / 👎」，写入 `rec-feedback.json`。
- 🧬 **Self-evolution · 自进化推荐**：推荐权重（名称 / 关键词 / 类别 / 经验）是可学习参数——按反馈归因（哪类理由带来的推荐被采用/好评/差评）以小步长自动微调，带上下界、样本门槛、变更日志与一键回滚；全部本地完成。面板「自进化」区可查看当前权重、成功率与最近调整。
- 📊 **Experience+ · 经验深化**：跨会话成功率、平均耗时、连续失败；健康报告（长期不用 / 连续失败 / 从未使用 / 许可证未知）；经验支持 JSON 导出 / 导入。
- 外加：技能目录、搜索、来源/路径、一键新建 Skill、Agent 路由提示。

![技能入口](docs/header-button.png)

---

## 为什么是「上下文感知」

大多数技能面板只列目录。荣哥技能卷轴收藏馆（可沉浸式体验版本） 会回答三个更实际的问题：

1. **现在这个项目/这句话，适合用哪个 skill？**
2. **这个 skill 为什么适合？**（显示匹配到的关键词/项目名）
3. **我现在到底在用哪些 skill？**（从真实工具调用读，不靠猜）

推荐是**本地启发式**，不联网、不调模型：

- 上下文来源：当前会话最近 8 条用户消息 + 项目根目录文件名（最多 80 个）；
- 技能文本：`name + description + whenToUse`；
- 打分：中英文 token 重叠 + 技能名命中 + 类别线索（视频/办公/Harness/组合）；
- 只返回得分 > 0 的 Top 4，并附 `reasons`；
- 面板打开时每 10 秒静默刷新一次，不打断输入。

> 它不替代 Agent 自己的 skill catalog，只是把「该用哪个」变成一眼可见。

---

## 两种智能模式

面板顶部可切换（全局配置，写入 `~/.dsh/ronge-adaptive-skill-archive/config.json`）：

| 模式 | 行为 |
|---|---|
| **计划模式 Plan** | 下一次任务开始前，Agent 先给出方案和 1–3 个推荐 skill，并**问你确认**；你确认后才执行。重点：**会问**。 |
| **沉浸模式 Immersive** | **不询问**：Agent 根据上下文自动选 1–3 个 skill、组合并执行，最后说明用了哪些、为什么。重点：**不问**。 |

> 默认模式是**计划模式**；可以在面板切换。计划模式 = 会先问；沉浸模式 = 不问直接做。两者都是 prompt 级默认行为，不是硬编码固定管线。

---

## 经验记忆

每次**主会话**任务成功完成、且使用了至少一个 skill，Host 会写一条经验：

- `~/.dsh/ronge-adaptive-skill-archive/experience.md` — 人读的 Markdown：时间、任务、Skills、结果摘要、耗时；
- `~/.dsh/ronge-adaptive-skill-archive/experience.json` — 机器读的统计：每个 skill 的 `uses` / `successes` / `lastUsed`。

推荐算法会把熟练度算进去：`score += min(4, uses × 0.8)`，并在理由里显示「经验×N」。所以用得越多、越稳定有效的 skill，越容易被优先推荐——这就是「越做越好」的经验值。

- **v1.5.0 起**：每 skill 额外统计成功率、平均耗时、连续失败（失败的顶层 turn 也记一次 uses + `failureStreak`）；面板「经验」页有统计表与健康报告（长期不用 / 连续失败 / 从未使用 / 许可证未知）。
- **导出 / 导入**：`GET /ronge-adaptive-skill-archive/experience/export` 返回带 `version: 2` 的 JSON；`POST /ronge-adaptive-skill-archive/experience/import` 按 entry id 去重、按计数取较大值合并，适合换机或小团队共享经验。

```md
## 2026-10-28T12:00:00.000Z · 为宣传片写分镜
- Skills: `beat-promo-director`, `media-use`
- Outcome: 输出了 65 秒分镜表和 3 个测试镜头…
- Session: session-...
- Duration: 320s
```

---

## 自进化推荐（v1.6.0）

推荐打分不再是写死的常数：`token / name / category / experience` 四个权重是**可学习参数**（默认 1 / 8 / 0.6 / 1，带上下界 0.5–2 / 4–14 / 0.2–1.5 / 0.4–2）。

- **反馈归因**：每条推荐都带结构化 `reasonsDetail`；面板上的「复制 /skill」= adopt、👍/👎 = good/bad，会把结果记到**产生该推荐的 top 理由类型**上（经验条目的 👍/👎 也会按同一归因记录）。
- **自评估**：累计 10 条反馈后自动评估一次；某类理由的 `good/(good+bad)` ≥ 70% 时该权重 ×1.1，≤ 40% 时 ×0.9，样本 < 8 不动；每次改动记录 `before/after/证据/原因` 到 `~/.dsh/ronge-adaptive-skill-archive/evolution.json`（最多 50 条历史）。
- **可解释 + 可回滚**：`GET /ronge-adaptive-skill-archive/evolution` 查看权重、成功率、待评估反馈与最近调整；`POST /evolution/evaluate` 手动评估、`/evolution/rollback` 回滚上一次调整、`/evolution/reset` 重置默认。
- **护栏**：全部本地、无网络/无模型；步长 10%、有上下界；不自动回滚、不删数据；冷启动（样本不足）完全不动权重。

## v1.6.1 修复（用户反馈）

- **「卷轴馆」打不开 / 抽屉卡死**：`renderLibrary` 之前定义在错误组件里，点击抛错并把抽屉弄挂；已修复，并新增 `DrawerErrorBoundary`——任何 tab 出错都只在抽屉内提示「重试/关闭」，不会让面板按钮失效。
- **切换对话推荐不变**：面板现在监听 sessionId 变化并自动按新会话刷新；之前只在点开按钮那一刻记录会话。
- **中文界面下简介是英文**：catalog 现在优先用面板语言（`lang=zh|en`）；未收录人工简介的技能会生成中文兜底「「类别」技能，涉及…。原文：…」；卷轴馆条目也带中文 `categoryLabel` 与 `intro`。

## 安装前安全提示（v1.5.0）

安装/预览任何第三方 SKILL.md 前，Host 会在**本机**跑一遍启发式扫描（`scanSkillText`）：

- 命中的规则：shell 执行（`child_process` / `execSync` / `subprocess`）、`curl | bash`、动态解码（`eval` / `base64 -d` / `atob`）、提示注入语句、网络访问、凭据路径（`.ssh` / `.env` / keychain / api key）、文件写入、过宽 `allowed-tools`（`Bash(*)` 或裸 `Bash`）。
- 输出：`{ level: low|medium|high, score, findings: [{rule, label, severity, line, excerpt}] }`，命中行号可在预览里直接定位。
- 同时给出 `trust`（来自已记录的来源 repo / trust，命中官方组织 allowlist 记为 official）与 `license`（frontmatter `license`，缺失为 `null`）。
- 免责：这是**启发式提示，不是安全保证**（静态扫描无法覆盖全部攻击面），安装前仍须自己预览全文。

## 更新中心（v1.5.0）

- `~/.dsh/ronge-adaptive-skill-archive/skills-lock.json`：记录每个已安装 skill 的 `url / repo / sha256 / trust / license / installedAt / updatedAt / previousSha256`。
- `GET /ronge-adaptive-skill-archive/discover/updates`：除了哈希变化，还返回 `diff: {added, removed, changedAtLine, lines[]}` 与远端 `license` / `risk`。
- `POST /ronge-adaptive-skill-archive/discover/update`（单条）、`POST /ronge-adaptive-skill-archive/discover/update-all`（全部，单条失败不影响其他）、`POST /ronge-adaptive-skill-archive/discover/rollback`（回滚到上一次备份）。
- 覆盖前一定备份：`~/.dsh/ronge-adaptive-skill-archive/backups/<skill>/<timestamp>.md`；回滚本身也会先备份当前版本。
- 边界不变：只拉 `raw.githubusercontent.com/**/SKILL.md`、≤256 KiB、不自动拉脚本/资源。

## 推荐评估与反馈（v1.5.0）

- 推荐结果同时返回 `reasons`（旧字符串）与 `reasonsDetail`（结构化：`kind` = name / keyword / category / experience，附 `label`、`detail`、`weight`）。
- 离线金标集：`test/fixtures/recommend-cases.json` + `test/fixtures/eval-skills.json`；`npm run eval:recommend` 输出 Recall@K（默认 K=4，阈值 0.75，可用 `EVAL_K` / `EVAL_THRESHOLD` 覆盖）。
- 推荐反馈：`POST /ronge-adaptive-skill-archive/recommend-feedback {skillName, verdict: adopt|good|bad}` → 写入 `rec-feedback.json`；面板上「复制 /skill」记 adopt，👍/👎 记质量反馈。它只做统计与展示，**不直接改推荐权重**（避免把点击率当成效果）。

## 发现远程技能 / Discover

面板「发现」页：

- 搜索内置精选索引（目前含 `anthropics/skills` 的 20 个官方 skill）；
- 预览 SKILL.md 全文后，点「安装」写入 `~/.dsh/skills/<name>/`；
- 安装时记录来源 URL、repo、SHA-256、信任级别到 `.skill-studio-source.json`；
- 「检查更新」对比远程 SKILL.md 哈希，列出有更新的本地 skill；
- 「刷新索引」用 GitHub API 重新抓取；可设 `GITHUB_TOKEN` 提高配额；
- 自定义源：`~/.dsh/ronge-adaptive-skill-archive/sources.json`，格式 `{"sources":[{"repo":"owner/repo","label":"...","trust":"community"}]}`。

**安全边界**：只允许 `raw.githubusercontent.com/.../SKILL.md`；最大 256 KiB；只拉 SKILL.md，不自动拉脚本/资源；安装前必须预览确认；不自动覆盖已有 skill。

## MCP / Tools 目录

面板「工具」页读取 **MCP 官方 registry**（`registry.modelcontextprotocol.io`）：

- 搜索服务器名称/描述；
- 展示版本、描述、仓库链接；
- **工具不是 skill**：这里只做发现，不自动安装/配置 MCP Server。

---

## 荣哥技能卷轴收藏馆

面板「卷轴馆」tab：

- 已收录 **6,399 条** GitHub 公开可检索的 `SKILL.md` 候选（5,398 条带 frontmatter 描述；数据快照在 `library/skills-index.json`）；
- 自动分类：AI 2,070 / 编程 789 / 设计 663 / 数据 512 / 写作 155 / 视频 163 / 其他 1,662 等 14 类；
- 评级 1–5：官方组织、描述完整度、路径规范、frontmatter 完整度综合；
- 按搜索、分类、最低评分筛选，分页浏览；
- 预览全文后安装（复用 Discover 的安装管线，记录来源 + SHA-256）。

数据由 `scripts/collect_github_skills.py` + `scripts/build_library.py` 生成；这不是「全网所有 skill」，而是 GitHub 上**公开、可检索、可安装**的 SKILL.md 快照。

---

## 安装

### 前置

- DeepSeek Harness（Desktop / Web profile）
- macOS（提示音用系统 `afplay`；Linux 可改成 `paplay`）
- 安装插件需要 `danger-full-access` 或审批

### 安装 bundle（三选一）

| 方式 | 命令（在 Harness 里执行，profile 级、所有会话生效） | 适合 |
|---|---|---|
| **npm（推荐，v1.5.0 起）** | `plugin_manager install_bundle target=ronge-adaptive-skill-archive@1.5.0` | 普通用户，一行安装、可升级 |
| **GitHub** | `plugin_manager install_bundle target=git+https://github.com/bugtakue/ronge-adaptive-skill-archive.git#v1.5.0` | 想固定版本 / 审源码 |
| **本地目录** | `plugin_manager install_bundle target=/absolute/path/to/ronge-adaptive-skill-archive` | 开发、改代码 |

> 版本是否已发布以 [npm](https://www.npmjs.com/package/ronge-adaptive-skill-archive) 与 GitHub Releases 为准；未发布时请用本地目录方式安装。安装后打开任意会话，会话头部右侧会出现「技能」按钮，点开就是右侧抽屉。
>
> 包名固定为 `ronge-adaptive-skill-archive`：client factory id 必须等于 package name（`npm run check` 会校验），改 scope 需要同时改 factory id 并重新发版。数据目录沿用兼容路径 `~/.dsh/ronge-adaptive-skill-archive/`。

### 在 DSH 插件市场索引里被发现（可选）

`docs/plugin-market.json` 是 DSH **format 1 插件市场索引**（已用官方 `@deepseek-ai/dsh-plugin-market-index` 校验通过，install target = `ronge-adaptive-skill-archive@1.5.0`）：

1. 把该文件托管到可访问的 https URL（GitHub raw / Pages 均可）；
2. 在 DSH 中启用自定义插件市场（experimental `plugin-market-bundle`），把该 URL 加为索引；
3. 之后可在 Discover 中搜索本插件并一键安装（索引条目会带版本与安装目标）。

发新版本后运行 `npm run build:market-index` 更新索引里的版本与发布戳。发布流水线见 `.github/workflows/publish.yml`（tag `v*` → 测试 → 校验版本一致 → npm publish --provenance）。

---

## 使用

1. 打开会话，点顶部 **技能**（窄屏只显示图标）。
2. 面板顶部：
   - **推荐**：Top 4，带分数和匹配原因；点一条会过滤到该技能；
   - **正在使用 / 最近使用**：当前 turn 用过的 skill。
3. 搜索、展开看路径/调用权限、复制技能名。
4. 底部「新建技能」创建到 `~/.dsh/skills/<name>/SKILL.md`，下一会话自动可见。
5. 任务结束时听到一声 `Glass.aiff`。

### 换提示音

```bash
export DSH_TASK_CHIME_SOUND=/System/Library/Sounds/Ping.aiff
```

（只影响提示音，不影响面板。）

---

> **v2.0.0 重命名**：包名/仓库从 `ronge-skill-studio` 改为 `ronge-adaptive-skill-archive`；HTTP 路由前缀改为 `/ronge-adaptive-skill-archive/*`。旧数据目录 `~/.dsh/skill-studio/` 会在首次启动时**自动复制**到 `~/.dsh/ronge-adaptive-skill-archive/`（旧目录不删除）；已安装 skill 的 `.skill-studio-source.json` 保持兼容。

## 数据来源与优先级

| 优先级 | 来源 | 路径 |
|---|---|---|
| 100 | `project-dsh` | `<projectRoot>/.dsh/skills` |
| 200 | `project-agents` | `<projectRoot>/.agents/skills` |
| 300 | `profile` | `$DSH_PROFILE_DIR/skills` |
| 400 | `user-dsh` | `$DSH_HOME/skills` |
| 500 | `user-agents` | `$DSH_AGENTS_HOME/skills` |
| 600 | `bundled` | 预设包 `dsh-agent-preset/skills` 或 `$DSH_BUNDLED_SKILL_DIR` |

同时合并会话 `ctx.skills` 注册表返回的条目（例如 `dsh-office` 这类程序化注册的技能）。项目根来自会话 `header.cwd`；没有会话时退回进程 cwd。

---

## 架构

```
Host (index.js)
  GET  /ronge-adaptive-skill-archive/catalog.json?sessionId=...
       -> ctx.skills 会话级注册表 + 文件系统扫描
       -> Session 事件分析：最近用户消息、skill 工具调用、当前 turn
       -> 推荐打分（含经验加权）+ active/recent + 经验快照
  POST /ronge-adaptive-skill-archive/create
       -> ~/.dsh/skills/<name>/SKILL.md
  POST /ronge-adaptive-skill-archive/mode
       -> ~/.dsh/ronge-adaptive-skill-archive/config.json { mode: off|plan|immersive }
  GET  /ronge-adaptive-skill-archive/discover?q=...        -> 远程索引搜索
  POST /ronge-adaptive-skill-archive/discover/refresh      -> GitHub 索引刷新
  GET  /ronge-adaptive-skill-archive/discover/preview?url= -> SKILL.md 预览
  POST /ronge-adaptive-skill-archive/discover/install      -> 安装到 ~/.dsh/skills
  GET  /ronge-adaptive-skill-archive/discover/updates      -> 更新检查（含内容 diff / license / risk）
  POST /ronge-adaptive-skill-archive/discover/update       -> 应用单条更新（先备份，再覆盖）
  POST /ronge-adaptive-skill-archive/discover/update-all   -> 应用全部更新（单条失败不影响其他）
  POST /ronge-adaptive-skill-archive/discover/rollback     -> 回滚到上一次备份
  POST /ronge-adaptive-skill-archive/recommend-feedback    -> 推荐反馈 adopt / good / bad
  GET  /ronge-adaptive-skill-archive/experience/export     -> 导出经验（version 2）
  POST /ronge-adaptive-skill-archive/experience/import     -> 合并导入经验
  GET  /ronge-adaptive-skill-archive/health?cwd=...        -> 技能健康报告
  GET  /ronge-adaptive-skill-archive/tools?q=...           -> MCP registry 目录
  GET  /ronge-adaptive-skill-archive/library?q=&category=&minRating=&page= -> 卷轴馆索引
  session/event 监听
       -> 主会话 turn/end completed：afplay + 写 experience.md/json
  ctx.systemPrompt.section('skill-studio')      -> 技能路由提示
  ctx.systemPrompt.section('skill-studio-mode') -> 当前模式的行为约束

Client (client.js)
  conversation.session.header.utilities -> 「技能」按钮
  shell.overlay                        -> 右侧抽屉
    推荐 / 基于当前会话 / 正在使用 / 经验 / 模式切换 / 目录 / 新建
```

- Host 只依赖 Node 内置模块，可直接作为本地 bundle 安装。
- Client 是 plain JS，经 `window.__ModuleLoader__.load` 注册，无需构建、无 JSX。
- 路由只监听 loopback，由 `webServer` 注册，不新增端口。

---

## 更多想法 / Roadmap

这些是接下来可以继续加的方向（欢迎 PR）：

- ~~**输入框推荐 chips**~~（v1.5.0 部分完成：面板顶部已有 Top 2 chips，可一键复制 `/skill <name>`）：下一步是接进 composer。
- **按项目置顶**：每个 workspace 记住常用 skill，打开面板先显示 pinned。
- ~~**使用统计**~~（v1.5.0 已做：跨会话成功率 / 平均耗时 / 连续失败）。
- **自然语言意图搜索**：本地 embedding / 词典混合，搜「帮我做张海报」也能命中 media/image 类技能。
- ~~**技能健康检查**~~（v1.5.0 已做：长期不用 / 连续失败 / 从未使用 / 许可证未知）。
- **frontmatter 完整性检查**：缺字段、重名、断链、禁用状态一次标出（健康报告的下一个迭代）。
- **静音时段 / 窗口失焦才响**：更多提示音策略。
- **原生右侧栏 tab**：不再用抽屉，直接成为右侧栏的一页。
- **快捷键**：`Cmd+Shift+S` 打开面板。

---

## 隐私与安全

- 推荐分析**只在本机**完成，不调用外部模型/网络。
- 安装前安全扫描同样**只在本机**完成：不联网、不上传、不执行 skill 内容，只读 SKILL.md 文本并给出启发式提示（不是安全保证）。
- 经验 / 推荐反馈 / lock 文件全部落在 `~/.dsh/ronge-adaptive-skill-archive/`：`experience.json/md`、`rec-feedback.json`、`skills-lock.json`、`backups/`；不写日志到外部。
- 只读取当前会话的最近事件和项目根目录文件名；不上传、不写日志。
- 新建技能只写入 `~/.dsh/skills/<kebab-case-name>/SKILL.md`，不覆盖已有目录。
- 名称白名单：`^[a-z0-9]+(?:-[a-z0-9]+)*$`，拒绝 `/`、`..`、绝对路径。
- 提示音失败不会影响 turn。

---

## 开发

```bash
npm run check     # client factory id 必须等于 package name
npm test          # 单元测试 + 路由集成测试（mock host，不联网）
npm run eval:recommend   # 离线推荐金标集 Recall@K（默认 K=4，阈值 0.75）
node --check index.js
node --check client.js
```

> 这个自检来自一次真实事故：复制包改名时 `client.js` 的 factory id 没同步，导致 Web boot 重复注册、安全模式禁用。`npm run check` 就是防止它再发生。

文件：

- `index.js` — Host：目录、推荐、正在使用、新建、提示音、系统提示。
- `client.js` — Client：按钮、右侧抽屉、推荐/正在使用、搜索、新建、i18n。
- `cordis.patch.yml` — bundle patch。
- `locale/*.json` — 插件管理页展示元数据。
- `icon.svg` — 原创图标。
- `docs/` — 截图。

---

## License

MIT。见 [LICENSE](./LICENSE)。

---

## English

**Ronge's Adaptive Skill Cockpit (Immersive Edition)** (荣哥技能卷轴收藏馆) is a context-aware, self-evolving skill cockpit for DeepSeek Harness. v1.5.0 adds a local pre-install safety scan, trust/license badges, update diff + update-all + rollback, structured recommendation reasons with an offline Recall@K eval, cross-session experience stats with export/import, and v1.6.0 self-evolution: feedback-attributed, bounded, rollback-able recommendation weight tuning. It reads the current session's recent messages and project file names, ranks the most relevant skills with match reasons, and shows which skills are active/recent from real `skill` tool calls. It also plays a short completion chime for top-level tasks (subagents stay silent). Browse/search/create skills, all locally, with no external model calls. MIT licensed.
