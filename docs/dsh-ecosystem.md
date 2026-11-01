# DSH 生态集成

本插件不是独立应用；它是 DeepSeek Harness 的持久化 bundle + 原生工具 + 客户端面板，并提供可选的跨 agent MCP server 与 DSH skill。

## 1. DSH bundle（主入口）

- 包：`dsh-ronge-adaptive-skill-archive`
- 清单：`package.json` 的 `dsh.bundle.patch` 指向 `cordis.patch.yml`
- 安装（推荐）：

```bash
plugin_manager install_bundle target=dsh-ronge-adaptive-skill-archive@5.5.6
```

- 固定 GitHub 版本：

```bash
plugin_manager install_bundle target=git+https://github.com/bugtakue/dsh-ronge-adaptive-skill-archive.git#v5.5.6
```

- 卸载：`plugin_manager remove_bundle target=dsh-ronge-adaptive-skill-archive`
- 数据目录 `~/.dsh/dsh-ronge-adaptive-skill-archive/` 不随卸载删除。

## 2. DSH 原生工具

安装后 agent 可直接看到：

- `skill_archive_plan`：复杂任务计划；简单任务返回 `shouldPlan:false`
- `skill_archive_compose`：显式组合方案
- `skill_archive_draft_skill`：缺口草稿

工具说明以运行中的 `Tool` 注册为准；不要假设固定 schema。

## 3. DSH skill（让 agent 知道怎么用）

仓库内提供 `skills/dsh-skill-cockpit/SKILL.md`。安装到本机：

```bash
# 预览目标路径，不写
node scripts/install-dsh-skill.mjs --dry-run

# 安装（已存在会拒绝）
node scripts/install-dsh-skill.mjs --write

# 明确覆盖
node scripts/install-dsh-skill.mjs --write --force
```

安装后 DSH 技能目录为 `~/.dsh/skills/dsh-skill-cockpit/SKILL.md`，下一次会话可发现。

## 4. 跨 agent MCP

非 DSH 客户端（Claude Code / Codex / Cursor）可用：

```bash
npx -y dsh-ronge-adaptive-skill-archive dsh-ronge-skill-mcp
```

MCP 提供推荐 / 发现 / 经验 / 安装（带扫描与 force 门槛）；不提供 DSH 面板。详见 [cross-agent.md](cross-agent.md)。

## 5. 兼容与边界

- DSH Desktop 0.2.x，Node ≥ 20，零运行时依赖；
- 单宿主深度插件；MCP 是跨 agent 补充，不是通用技能市场；
- 不承诺省 token/更快；真实 A/B 负面结果见 [benchmark-live-artifacts.md](benchmark-live-artifacts.md)；
- 所有写操作都要用户确认；高风险默认拒绝。

## 验证

```bash
npm test
npm run check:dsh
node scripts/check-live-quality.mjs --port <port> --cookie-file <cookie>
```

## 6. 上下文感知（v5.5.6）

- HTTP/面板 `intelligence/plan` 接受 `sessionId`：读取有界用户消息 + 工作区文件，返回 `contextMessages/contextFiles/contextSource/contextAnaphora`；
- 短句「继续/按刚才/收尾」会用上下文补全 planning signal；只在短句时启用，不污染普通任务；
- DSH 原生 `skill_archive_plan` 工具不自动读会话；需要时由 agent 传 context；
- 上下文有上限（plan 8k/8k 字符），不是无限历史，也不是 LLM 推理。

## 7. 原生工具的上下文参数（v5.5.6）

`skill_archive_plan` 与 `skill_archive_compose` 新增可选：

- `context`：调用方提供的 bounded 上下文（最多 8000 字符）；
- `sessionId`：Host 尝试读取有界会话上下文。

工具不会自动读无限历史；不传就仍只用 task/cwd。适合 agent 在处理「继续/按刚才」前显式带上最近任务。

## 8. 发布链路（2026-11-01）

- publish workflow 失败根因：`check-ecosystem` 把本机 DSH skill 安装检查当必需，Linux CI 无该 skill；v5.5.10/5.5.11 改为 optional 并修正测试断言。
- npm latest 已到 **5.5.11**；GitHub Release v5.6.3。
- live 若仍是 5.5.9，重启后才是 5.5.11。

## 9. 未安装技能临时试用（v5.6.3）

不必先安装才能试：

- 原生工具 `skill_archive_try_skill`：按 library name 或 raw URL 读取一份 SKILL.md；
- 返回有界内容、来源、安全扫描，`temporary:true`、`installed:false`；
- 高风险拒绝；不写盘、不自动安装、不自动执行；
- 只用于当前 turn 的临时指令；长期使用仍需正常安装。

HTTP：`POST /dsh-ronge-adaptive-skill-archive/discover/try`。

## 10. 人机协同交互（v5.6.3）

计划是**建议**，不是执行结果：

- 多阶段计划出现勾选框，可逐阶段确认；
- “复制为 Agent 指令”只包含已勾选阶段；
- 远程技能预览增加「临时使用（不安装）」：复制 SKILL.md 内容，不写技能目录；
- 明确提示：不会自动执行、不会自动安装。

UI 回归：28/28。

## 11. 权限/协作模式（v5.6.3）

面板顶部模式选择器现在有三档：

| 模式 | 行为 |
|---|---|
| 计划模式 | 只规划，等用户确认；不加载/执行 |
| 协作模式 | 先给计划，用户勾选/确认阶段后再执行；不自动安装 |
| 完全权限 | 不逐条确认，自动加载并执行；风险自负 |

`POST /mode` 接受 `off / plan / collaborate / immersive`；系统提示按模式切换。
