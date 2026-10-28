# Skill Studio · 技能工作室

> 一个给 DeepSeek Harness 的上下文感知技能面板：**它会读当前会话和项目，主动告诉你「现在适合用哪个 Skill」，并实时显示「正在用哪些 Skill」；任务完成时还会响一声。**

一个 bundle，三个能力：

- 🧠 **Skill Radar · 智能推荐**：根据当前会话最近的内容和项目目录，给技能打分排序，显示 Top 4 与匹配原因。
- 🟢 **Now Using · 正在使用**：从会话的 `skill` 工具调用里读出当前 turn 正在用的技能；不在运行时显示「最近使用」。
- 🔔 **Done Chime · 完成提示音**：主任务完成时播放一声轻提示音；子智能体、fork 会话不响。
- 外加：技能目录、搜索、来源/路径、一键新建 Skill、Agent 路由提示。

![技能入口](docs/header-button.png)

---

## 为什么是「上下文感知」

大多数技能面板只列目录。Skill Studio 会回答三个更实际的问题：

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

## 安装

### 前置

- DeepSeek Harness（Desktop / Web profile）
- macOS（提示音用系统 `afplay`；Linux 可改成 `paplay`）
- 安装插件需要 `danger-full-access` 或审批

### 安装 bundle

```bash
# 在 Harness 里执行（profile 级，所有会话生效）
plugin_manager install_bundle target=/absolute/path/to/skill-studio
```

安装后打开任意会话，会话头部右侧会出现「技能」按钮；点开就是右侧抽屉。

> 本地开发用包名 `dsh-skill-studio`；发布到 npm 前改成你自己的 scope，例如 `@yourname/dsh-skill-studio`。

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
       -> 推荐打分 + active/recent
  POST /skill-studio/create
       -> ~/.dsh/skills/<name>/SKILL.md
  session/event 监听 -> 主会话 turn/end completed -> afplay
  ctx.systemPrompt.section('skill-studio') -> 技能路由提示

Client (client.js)
  conversation.session.header.utilities -> 「技能」按钮
  shell.overlay                        -> 右侧抽屉（推荐/正在使用/目录/新建）
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
- **推荐反馈**：👍/👎 记录本地偏好，逐步调权重。
- **导出/安装**：从 URL/gist 安装一个 skill 到 `~/.dsh/skills`。

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

**Skill Studio** is a context-aware skill cockpit for DeepSeek Harness. It reads the current session's recent messages and project file names, ranks the most relevant skills with match reasons, and shows which skills are active/recent from real `skill` tool calls. It also plays a short completion chime for top-level tasks (subagents stay silent). Browse/search/create skills, all locally, with no external model calls. MIT licensed.
