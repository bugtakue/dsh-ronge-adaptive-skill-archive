# 跨智能体使用（Claude Code / Codex / Cursor / 任意 MCP 客户端）

同一个推荐 / 经验 / 自进化引擎，通过 **MCP（Model Context Protocol，stdio）** 暴露给任何支持 MCP 的智能体。DSH 右侧抽屉是 DSH 专属 UI；其他智能体用 MCP 工具 + 本地数据目录。

## 1. 一条命令接入

先确保能从 npm 取到包（`npx` 需要）：

```bash
npx -y ronge-adaptive-skill-archive mcp
```

它会以 MCP stdio server 启动，数据写到 `~/.ronge-adaptive-skill-cockpit/cross-agent.json`（可用 `RONGE_SKILL_HOME` 改）。

### Claude Code

```bash
claude mcp add ronge -- npx -y ronge-adaptive-skill-archive mcp
# 查看
claude mcp list
```

### Codex

`~/.codex/config.toml`：

```toml
[mcp_servers.ronge]
command = "npx"
args = ["-y", "ronge-adaptive-skill-archive", "mcp"]
```

### Cursor

`~/.cursor/mcp.json`（或项目 `.cursor/mcp.json`）：

```json
{
  "mcpServers": {
    "ronge": {
      "command": "npx",
      "args": ["-y", "ronge-adaptive-skill-archive", "mcp"]
    }
  }
}
```

其他客户端照搬 `command: npx` + `args: ["-y","ronge-adaptive-skill-archive","mcp"]` 即可。

## 2. 工具

| 工具 | 作用 |
|---|---|
| `recommend_skills` | 给当前任务推荐最多 4 个**已安装**的 skill，附理由、一句话简介、探索标记；`cwd` 会加入项目文件名作为上下文 |
| `search_skills` | 搜 6,399 条公开 `SKILL.md` 索引（名称/描述/类别/评分/信任/rawUrl） |
| `scan_skill_text` | 本地启发式安全扫描（text 或 raw SKILL.md URL），返回 low/medium/high |
| `install_skill` | 下载 raw `SKILL.md` → 扫描 → 写入 agent skill 目录（Claude Code / Codex / DSH / agents），带旧文件备份；high 风险默认拦截 |
| `record_outcome` | 记录使用结果（success/failed/good/bad/adopt/used），驱动亲和度、分类权重和探索配额 |
| `experience_summary` | 查看已学习技能、近期结果、权重、分类权重、探索配额 |

### 推荐工作流

1. 任务开始：`recommend_skills({ context: "用户原话或任务摘要", cwd })`
2. 选择并加载推荐的 skill（Claude Code 用 `Skill` 工具；Codex 按 AGENTS.md/技能机制）
3. 任务结束：`record_outcome({ skill: "office-xlsx", verdict: "good" })`
4. 定期看 `experience_summary()`，或用 `search_skills` + `install_skill` 补新技能

## 3. Prompts 与 Resources（Claude Code 快捷入口）

MCP server 同时暴露 **prompts**（模型/用户可选的预置指令）和 **resources**（只读上下文）：

| 类型 | 名称 | 用法 |
|---|---|---|
| prompt | `recommend` | Claude Code 中显示为 `/mcp__ronge__recommend`，参数 `context`/`cwd`；引导 Agent 先调 `recommend_skills` 再选技能 |
| prompt | `skill-workflow` | `/mcp__ronge__skill-workflow`：推荐 → 加载 → `record_outcome` 完整闭环 |
| resource | `ronge://experience/summary` | 学习/自进化摘要（JSON） |
| resource | `ronge://library/{name}` | 索引中某个技能的元数据 + rawUrl |
| resource | `ronge://skill/{name}` | 已安装 SKILL.md 内容（8 KiB 截断并标注） |

Claude Code 里可以直接输入 `/mcp__ronge__recommend` 触发；Codex/Cursor 按各自客户端的 prompts/resources 支持情况使用。

## 4. 扫描哪些技能目录

- `~/.claude/skills`、`~/.codex/skills`、`~/.agents/skills`、`~/.dsh/skills`
- 当前目录下同名目录（项目级 skill）
- 可用 `RONGE_SKILL_DIRS` 覆盖（路径分隔符分隔，测试/自定义布局用）

## 5. 隐私与安全

- 全本地：无遥测、无账号、不上传上下文；`cross-agent.json` 在你机器上。
- `scan_skill_text`/`install_skill` 是**启发式扫描，不是安全保证**；安装前仍建议人工看源码。
- `install_skill` 只接受 `https://raw.githubusercontent.com/**/SKILL.md` 且 ≤256 KiB；写入前备份旧文件；高风险内容需显式 `force: true`。
- 与 DSH 插件的数据目录**分开**（`~/.ronge-adaptive-skill-cockpit/` vs `~/.dsh/ronge-adaptive-skill-archive/`）；两边可同时用，各自学习。

## 6. 边界

- MCP 版没有 DSH 的「正在使用 / 完成提示音 / 会话自动上下文」——上下文需要由智能体显式传给 `recommend_skills`。
- 推荐质量依赖已安装 skill 的描述质量；建议 SKILL.md 写清 `description` / `whenToUse`。
- npm 包当前版本 v2.2.0；MCP server 为 stdio transport，协议版本 `2024-11-05`。
