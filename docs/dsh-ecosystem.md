# DSH 生态集成

本插件不是独立应用；它是 DeepSeek Harness 的持久化 bundle + 原生工具 + 客户端面板，并提供可选的跨 agent MCP server 与 DSH skill。

## 1. DSH bundle（主入口）

- 包：`dsh-ronge-adaptive-skill-archive`
- 清单：`package.json` 的 `dsh.bundle.patch` 指向 `cordis.patch.yml`
- 安装（推荐）：

```bash
plugin_manager install_bundle target=dsh-ronge-adaptive-skill-archive@5.5.0
```

- 固定 GitHub 版本：

```bash
plugin_manager install_bundle target=git+https://github.com/bugtakue/dsh-ronge-adaptive-skill-archive.git#v5.5.0
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
