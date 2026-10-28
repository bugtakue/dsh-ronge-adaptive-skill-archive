# ronge-skill-studio · Ronge 技能工作室

[![check](https://github.com/bugtakue/ronge-skill-studio/actions/workflows/check.yml/badge.svg)](https://github.com/bugtakue/ronge-skill-studio/actions/workflows/check.yml)

> 一个给 DeepSeek Harness 的上下文感知技能工作台：**它会读当前会话和项目，主动告诉你「现在适合用哪个 Skill」，实时显示「正在用哪些 Skill」，还能进入计划/沉浸模式，并把每次任务的技能使用写成经验记忆。**

一个 bundle，八个能力：

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
- 外加：技能目录、搜索、来源/路径、一键新建 Skill、Agent 路由提示。

![技能入口](docs/header-button.png)

---

## 为什么是「上下文感知」

大多数技能面板只列目录。Ronge Skill Studio 会回答三个更实际的问题：

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

面板顶部可切换（全局配置，写入 `~/.dsh/skill-studio/config.json`）：

| 模式 | 行为 |
|---|---|
| **计划模式 Plan** | 下一次任务开始前，Agent 先给出方案和 1–3 个推荐 skill，并**问你确认**；你确认后才执行。重点：**会问**。 |
| **沉浸模式 Immersive** | **不询问**：Agent 根据上下文自动选 1–3 个 skill、组合并执行，最后说明用了哪些、为什么。重点：**不问**。 |

> 默认模式是**计划模式**；可以在面板切换。计划模式 = 会先问；沉浸模式 = 不问直接做。两者都是 prompt 级默认行为，不是硬编码固定管线。

---

## 经验记忆

每次**主会话**任务成功完成、且使用了至少一个 skill，Host 会写一条经验：

- `~/.dsh/skill-studio/experience.md` — 人读的 Markdown：时间、任务、Skills、结果摘要、耗时；
- `~/.dsh/skill-studio/experience.json` — 机器读的统计：每个 skill 的 `uses` / `successes` / `lastUsed`。

推荐算法会把熟练度算进去：`score += min(4, uses × 0.8)`，并在理由里显示「经验×N」。所以用得越多、越稳定有效的 skill，越容易被优先推荐——这就是「越做越好」的经验值。

```md
## 2026-10-28T12:00:00.000Z · 为宣传片写分镜
- Skills: `beat-promo-director`, `media-use`
- Outcome: 输出了 65 秒分镜表和 3 个测试镜头…
- Session: session-...
- Duration: 320s
```

---

## 发现远程技能 / Discover

面板「发现」页：

- 搜索内置精选索引（目前含 `anthropics/skills` 的 20 个官方 skill）；
- 预览 SKILL.md 全文后，点「安装」写入 `~/.dsh/skills/<name>/`；
- 安装时记录来源 URL、repo、SHA-256、信任级别到 `.skill-studio-source.json`；
- 「检查更新」对比远程 SKILL.md 哈希，列出有更新的本地 skill；
- 「刷新索引」用 GitHub API 重新抓取；可设 `GITHUB_TOKEN` 提高配额；
- 自定义源：`~/.dsh/skill-studio/sources.json`，格式 `{"sources":[{"repo":"owner/repo","label":"...","trust":"community"}]}`。

**安全边界**：只允许 `raw.githubusercontent.com/.../SKILL.md`；最大 256 KiB；只拉 SKILL.md，不自动拉脚本/资源；安装前必须预览确认；不自动覆盖已有 skill。

## MCP / Tools 目录

面板「工具」页读取 **MCP 官方 registry**（`registry.modelcontextprotocol.io`）：

- 搜索服务器名称/描述；
- 展示版本、描述、仓库链接；
- **工具不是 skill**：这里只做发现，不自动安装/配置 MCP Server。

---

## 安装

### 前置

- DeepSeek Harness（Desktop / Web profile）
- macOS（提示音用系统 `afplay`；Linux 可改成 `paplay`）
- 安装插件需要 `danger-full-access` 或审批

### 安装 bundle

```bash
# 在 Harness 里执行（profile 级，所有会话生效）
plugin_manager install_bundle target=/absolute/path/to/ronge-skill-studio
```

安装后打开任意会话，会话头部右侧会出现「技能」按钮；点开就是右侧抽屉。

> 包名是 `ronge-skill-studio`；发布到 npm 前可改成自己的 scope，例如 `@yourname/ronge-skill-studio`。数据目录沿用兼容路径 `~/.dsh/skill-studio/`。

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
  GET  /skill-studio/catalog.json?sessionId=...
       -> ctx.skills 会话级注册表 + 文件系统扫描
       -> Session 事件分析：最近用户消息、skill 工具调用、当前 turn
       -> 推荐打分（含经验加权）+ active/recent + 经验快照
  POST /skill-studio/create
       -> ~/.dsh/skills/<name>/SKILL.md
  POST /skill-studio/mode
       -> ~/.dsh/skill-studio/config.json { mode: off|plan|immersive }
  GET  /skill-studio/discover?q=...        -> 远程索引搜索
  POST /skill-studio/discover/refresh      -> GitHub 索引刷新
  GET  /skill-studio/discover/preview?url= -> SKILL.md 预览
  POST /skill-studio/discover/install      -> 安装到 ~/.dsh/skills
  GET  /skill-studio/discover/updates      -> 更新检查
  GET  /skill-studio/tools?q=...           -> MCP registry 目录
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

- **输入框推荐 chips**：在 composer 上方直接给出 1–2 个推荐，点一下插入 `/skill <name>`。
- **按项目置顶**：每个 workspace 记住常用 skill，打开面板先显示 pinned。
- **使用统计**：跨会话统计 skill 调用次数、最近使用、平均耗时。
- **自然语言意图搜索**：本地 embedding / 词典混合，搜「帮我做张海报」也能命中 media/image 类技能。
- **技能健康检查**：frontmatter 缺字段、重名、断链、禁用状态一次标出。
- **静音时段 / 窗口失焦才响**：更多提示音策略。
- **原生右侧栏 tab**：不再用抽屉，直接成为右侧栏的一页。
- **快捷键**：`Cmd+Shift+S` 打开面板。

---

## 隐私与安全

- 推荐分析**只在本机**完成，不调用外部模型/网络。
- 只读取当前会话的最近事件和项目根目录文件名；不上传、不写日志。
- 新建技能只写入 `~/.dsh/skills/<kebab-case-name>/SKILL.md`，不覆盖已有目录。
- 名称白名单：`^[a-z0-9]+(?:-[a-z0-9]+)*$`，拒绝 `/`、`..`、绝对路径。
- 提示音失败不会影响 turn。

---

## 开发

```bash
npm run check     # client factory id 必须等于 package name
npm test          # 推荐/语言检测/参数解析单元测试
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

**Ronge Skill Studio** is a context-aware skill cockpit for DeepSeek Harness. It reads the current session's recent messages and project file names, ranks the most relevant skills with match reasons, and shows which skills are active/recent from real `skill` tool calls. It also plays a short completion chime for top-level tasks (subagents stay silent). Browse/search/create skills, all locally, with no external model calls. MIT licensed.
